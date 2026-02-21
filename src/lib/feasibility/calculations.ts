import type {
  FeasibilityState,
  FeasibilitySummary,
  LineItem,
  LineItemSection,
  DebtFacility,
} from "./types";
import { normalizeToExGst } from "./gst";
import { computeDrawdowns, type ResolvedFacility } from "./drawdown";

interface ResolveContext {
  totalLandSize: number;
  lotCount: number;
  constructionTotal: number;
  grvTotal: number;
  projectCostsTotal: number;
  projectLengthMonths: number;
}

/** Map holding frequency to divisor in months */
function frequencyToMonths(frequency: string): number {
  switch (frequency) {
    case "monthly":
      return 1;
    case "quarterly":
      return 3;
    case "semi_annually":
      return 6;
    case "annually":
      return 12;
    default:
      return 0; // "once" — no recurring multiplier
  }
}

/** Resolve a line item's amount_ex_gst based on its rate type */
export function resolveLineItemAmount(
  item: LineItem,
  context: ResolveContext
): number {
  const qty = item.quantity || 1;
  const rate = item.rate || 0;

  let baseAmount: number;

  switch (item.rate_type) {
    case "$/m2":
      baseAmount = Math.round(qty * rate * (context.totalLandSize || 1));
      break;
    case "$/Lot":
      baseAmount = Math.round(qty * rate * (context.lotCount || 1));
      break;
    case "% Construction":
      baseAmount = Math.round((rate / 100) * context.constructionTotal * qty);
      break;
    case "% GRV":
      baseAmount = Math.round((rate / 100) * context.grvTotal * qty);
      break;
    case "% Project Costs":
      baseAmount = Math.round((rate / 100) * context.projectCostsTotal * qty);
      break;
    case "$ Amount":
    default:
      baseAmount = Math.round(qty * rate);
      break;
  }

  let amount = normalizeToExGst(baseAmount, item.gst_status);

  // Apply frequency multiplier for recurring costs (holding costs, outgoings)
  const freq = item.frequency || "once";
  if (freq !== "once") {
    const freqMonths = frequencyToMonths(freq);
    if (freqMonths > 0) {
      const spanMonths = item.cashflow_span_months || context.projectLengthMonths;
      const periods = spanMonths / freqMonths;
      amount = Math.round(amount * periods);
    }
  }

  return amount;
}

function sumSection(
  items: LineItem[],
  section: LineItemSection,
  context: ResolveContext
): number {
  return items
    .filter((i) => i.section === section)
    .reduce((sum, item) => sum + resolveLineItemAmount(item, context), 0);
}

// ---------- Auto-calc facility size from LVR ----------

export interface FacilityCalcContext {
  totalRevenueExGst: number;
  totalRevenue: number;
  totalCostsExFunding: number;
  constructionCosts: number;
  contingencyCosts: number;
}

/** Resolve a facility's size — either manual or auto-computed from LVR */
export function resolveAutoFacilitySize(
  facility: DebtFacility,
  ctx: FacilityCalcContext
): number {
  if (facility.calculation_type !== "auto") return facility.total_facility;

  const pct = (facility.lvr_pct || 0) / 100;
  let base: number;

  switch (facility.lvr_method) {
    case "grv_ex_gst":
      base = ctx.totalRevenueExGst;
      break;
    case "grv_inc_gst":
      base = ctx.totalRevenue;
      break;
    case "tdc_ex_gst":
      base = ctx.totalCostsExFunding;
      break;
    case "tdc_inc_gst":
      base = Math.round(ctx.totalCostsExFunding * 1.1);
      break;
    case "tcc_ex_gst":
      base = ctx.constructionCosts;
      break;
    case "tcc_inc_gst":
      base = Math.round(ctx.constructionCosts * 1.1);
      break;
    case "tcc_cont_ex_gst":
      base = ctx.constructionCosts + ctx.contingencyCosts;
      break;
    case "tcc_cont_inc_gst":
      base = Math.round((ctx.constructionCosts + ctx.contingencyCosts) * 1.1);
      break;
    default:
      base = ctx.totalCostsExFunding;
      break;
  }

  return Math.round(base * pct);
}

/** Compute monthly project costs (ex-funding) for drawdown engine */
function getMonthlyProjectCosts(
  state: FeasibilityState,
  context: ResolveContext
): number[] {
  const totalMonths = state.scenario.project_length_months || 24;
  const costs = new Array(totalMonths).fill(0) as number[];

  // Land costs by deposit/settlement month
  for (const lot of state.landLots) {
    const depMonth = Math.max(0, (lot.deposit_month || 1) - 1);
    const setMonth = Math.max(0, (lot.settlement_month || 1) - 1);
    const deposit = lot.deposit_amount || 0;
    const balance = (lot.purchase_price || 0) - deposit;
    if (depMonth < totalMonths) costs[depMonth] += deposit;
    if (setMonth < totalMonths) costs[setMonth] += balance;
  }

  // Line items (non-funding sections only)
  for (const item of state.lineItems) {
    if (
      item.section === "facility_fees" ||
      item.section === "loan_fees" ||
      item.section === "equity_fees"
    )
      continue;

    const amount = resolveLineItemAmount(item, context);
    const startMonth = Math.max(0, (item.cashflow_start_month ?? 1) - 1);
    const span = Math.max(1, item.cashflow_span_months || 1);
    const perMonth = Math.round(amount / span);
    for (let m = startMonth; m < startMonth + span && m < totalMonths; m++) {
      costs[m] += perMonth;
    }
  }

  return costs;
}

/** Get total land size across all lots */
export function getTotalLandSize(state: FeasibilityState): number {
  return state.landLots.reduce((sum, lot) => sum + (lot.land_size_m2 || 0), 0);
}

/** Get lot count */
export function getLotCount(state: FeasibilityState): number {
  return state.landLots.length || 1;
}

/** Get total saleable area across all sales units */
export function getTotalSaleableArea(state: FeasibilityState): number {
  return state.salesUnits.reduce((sum, u) => sum + (u.area_m2 || 0), 0);
}

/**
 * Full P&L computation — three-pass for percentage-based items:
 *   Pass 1: flat construction items → constructionTotal
 *   Pass 2: all items except "% Project Costs" → totalCostsExFunding (partial)
 *   Pass 3: "% Project Costs" items resolved against totalCostsExFunding
 */
export function computeSummary(state: FeasibilityState): FeasibilitySummary {
  const totalLandSize = getTotalLandSize(state);
  const lotCount = getLotCount(state);
  const totalSaleableArea = getTotalSaleableArea(state);
  const projectLengthMonths = state.scenario.project_length_months || 24;

  // Revenue
  const totalRevenue = state.salesUnits.reduce(
    (sum, u) => sum + (u.sale_price || 0),
    0
  );
  const totalRevenueExGst = state.salesUnits.reduce(
    (sum, u) => sum + normalizeToExGst(u.sale_price || 0, u.gst_status),
    0
  );
  const unitCount = state.salesUnits.length;

  // Land cost = sum of all lot purchase prices
  const landCost = state.landLots.reduce(
    (sum, lot) => sum + (lot.purchase_price || 0),
    0
  );

  // Pass 1: resolve flat-rate construction items to get constructionTotal
  const pass1Context: ResolveContext = {
    totalLandSize,
    lotCount,
    constructionTotal: 0,
    grvTotal: totalRevenue,
    projectCostsTotal: 0,
    projectLengthMonths,
  };

  const flatConstructionItems = state.lineItems.filter(
    (i) =>
      i.section === "construction" &&
      i.rate_type !== "% Construction" &&
      i.rate_type !== "% GRV" &&
      i.rate_type !== "% Project Costs"
  );
  const flatConstructionTotal = flatConstructionItems.reduce(
    (sum, item) => sum + resolveLineItemAmount(item, pass1Context),
    0
  );

  // Pass 2: with constructionTotal known, resolve all non-"% Project Costs" items
  const pass2Context: ResolveContext = {
    totalLandSize,
    lotCount,
    constructionTotal: flatConstructionTotal,
    grvTotal: totalRevenue,
    projectCostsTotal: 0, // not yet known
    projectLengthMonths,
  };

  // Filter items that DON'T use % Project Costs
  const nonPctProjectItems = state.lineItems.filter(
    (i) => i.rate_type !== "% Project Costs"
  );
  const pctProjectItems = state.lineItems.filter(
    (i) => i.rate_type === "% Project Costs"
  );

  const acquisitionCosts = sumSection(nonPctProjectItems, "acquisition", pass2Context);
  const professionalFees = sumSection(nonPctProjectItems, "professional_fees", pass2Context);
  const constructionCosts = sumSection(nonPctProjectItems, "construction", pass2Context);
  const devFees = sumSection(nonPctProjectItems, "dev_fees", pass2Context);
  const landHoldingCosts = sumSection(nonPctProjectItems, "land_holding", pass2Context);
  const marketingCosts = sumSection(nonPctProjectItems, "marketing", pass2Context);
  const agentFees = sumSection(nonPctProjectItems, "agent_fees", pass2Context);
  const legalFees = sumSection(nonPctProjectItems, "legal_fees", pass2Context);

  // Partial contingency (non-% Project Costs items)
  const partialContingency = sumSection(nonPctProjectItems, "contingency", pass2Context);

  // Partial total for % Project Costs denominator
  const partialCostsExFunding =
    landCost +
    acquisitionCosts +
    professionalFees +
    constructionCosts +
    devFees +
    landHoldingCosts +
    partialContingency +
    marketingCosts +
    agentFees +
    legalFees;

  // Pass 3: resolve "% Project Costs" items against the partial total
  const pass3Context: ResolveContext = {
    ...pass2Context,
    projectCostsTotal: partialCostsExFunding,
  };

  const pctProjectContingency = pctProjectItems
    .filter((i) => i.section === "contingency")
    .reduce((sum, item) => sum + resolveLineItemAmount(item, pass3Context), 0);

  // Also resolve any other sections that might use % Project Costs
  const pctProjectOther = pctProjectItems
    .filter((i) => i.section !== "contingency")
    .reduce((sum, item) => sum + resolveLineItemAmount(item, pass3Context), 0);

  const contingencyCosts = partialContingency + pctProjectContingency;

  // Funding line-item costs
  const facilityFees = sumSection(state.lineItems, "facility_fees", pass2Context);
  const loanFees = sumSection(state.lineItems, "loan_fees", pass2Context);
  const equityFees = sumSection(state.lineItems, "equity_fees", pass2Context);

  // Build partial totalCostsExFunding for auto-calc context
  const partialTotalCostsExFunding =
    landCost +
    acquisitionCosts +
    professionalFees +
    constructionCosts +
    devFees +
    landHoldingCosts +
    contingencyCosts +
    marketingCosts +
    agentFees +
    legalFees +
    pctProjectOther;

  // Auto-calc facility context
  const facilityCtx: FacilityCalcContext = {
    totalRevenueExGst,
    totalRevenue,
    totalCostsExFunding: partialTotalCostsExFunding,
    constructionCosts,
    contingencyCosts,
  };

  // Resolve facility sizes
  const resolvedFacilities = state.debtFacilities.map((f) => ({
    facility: f,
    size: resolveAutoFacilitySize(f, facilityCtx),
  }));

  // Compute drawdown-based interest for auto facilities
  const autoFacilities = resolvedFacilities.filter(
    (r) => r.facility.calculation_type === "auto"
  );
  const monthlyCosts = getMonthlyProjectCosts(state, pass3Context);
  const autoResolved: ResolvedFacility[] = autoFacilities.map((r) => ({
    id: r.facility.id,
    name: r.facility.name,
    size: r.size,
    interestRate: r.facility.interest_rate,
    landLoanType: r.facility.land_loan_type,
    priority: r.facility.priority,
    sortOrder: r.facility.sort_order,
  }));
  const drawdowns = computeDrawdowns(autoResolved, monthlyCosts);

  // Debt interest: drawdown-computed for auto, flat provision for manual, plus loans
  const totalDebtInterest =
    state.debtFacilities.reduce((sum, f) => {
      if (f.calculation_type === "auto") {
        const dd = drawdowns.find((d) => d.facilityId === f.id);
        return sum + (dd?.totalInterest ?? 0);
      }
      return sum + (f.interest_provision || 0);
    }, 0) +
    state.debtLoans.reduce((sum, l) => {
      const monthlyRate = (l.interest_rate || 0) / 100 / 12;
      return (
        sum + Math.round((l.principal_amount || 0) * monthlyRate * l.term_months)
      );
    }, 0);

  // Equity breakdown
  const totalPreferredEquity = state.equityPartners
    .filter((e) => !e.is_developer_equity)
    .reduce((sum, e) => sum + (e.equity_amount || 0), 0);
  const totalDeveloperEquity = state.equityPartners
    .filter((e) => e.is_developer_equity)
    .reduce((sum, e) => sum + (e.equity_amount || 0), 0);
  const totalEquity = totalPreferredEquity + totalDeveloperEquity;
  const totalDebt = resolvedFacilities.reduce((sum, r) => sum + r.size, 0);

  // Totals
  const totalCostsExFunding = partialTotalCostsExFunding;

  const totalFundingCosts =
    facilityFees + loanFees + equityFees + totalDebtInterest;

  const totalCosts = totalCostsExFunding + totalFundingCosts;
  const profit = totalRevenueExGst - totalCosts;

  // Project Costs to Fund = costs that need funding (ex funding costs)
  const projectCostsToFund = totalCostsExFunding;

  // Profit metrics
  const profitMargin =
    totalRevenueExGst > 0 ? (profit / totalRevenueExGst) * 100 : 0;
  const developmentMargin =
    totalRevenueExGst > 0
      ? ((totalRevenueExGst - totalCostsExFunding) / totalRevenueExGst) * 100
      : 0;
  const profitOnCost = totalCosts > 0 ? (profit / totalCosts) * 100 : 0;
  const profitOnProjectCost =
    totalCostsExFunding > 0 ? (profit / totalCostsExFunding) * 100 : 0;

  // Net Sales Revenue (GRV minus sales costs)
  const totalSalesCosts = agentFees + legalFees;
  const netSalesRevenue = totalRevenueExGst - totalSalesCosts;

  // Per-unit
  const revenuePerUnit = unitCount > 0 ? Math.round(totalRevenue / unitCount) : 0;
  const costPerUnit = unitCount > 0 ? Math.round(totalCosts / unitCount) : 0;
  const profitPerUnit = unitCount > 0 ? Math.round(profit / unitCount) : 0;

  // Per-m2 and per-lot averages
  const projectLots = state.scenario.project_lots || unitCount || 1;
  const aveNetSalesPerM2 =
    totalSaleableArea > 0 ? Math.round(netSalesRevenue / totalSaleableArea) : 0;
  const aveNetSalesPerLot =
    projectLots > 0 ? Math.round(netSalesRevenue / projectLots) : 0;
  const aveConstructionPerM2 =
    totalSaleableArea > 0 ? Math.round(constructionCosts / totalSaleableArea) : 0;
  const aveConstructionPerLot =
    projectLots > 0 ? Math.round(constructionCosts / projectLots) : 0;

  // Leverage indicators (use projectCostsToFund as denominator)
  const ordinaryEquityLeveragePct =
    projectCostsToFund > 0
      ? (totalDeveloperEquity / projectCostsToFund) * 100
      : 0;
  const preferredEquityLeveragePct =
    projectCostsToFund > 0
      ? (totalPreferredEquity / projectCostsToFund) * 100
      : 0;
  const debtLeveragePct =
    projectCostsToFund > 0 ? (totalDebt / projectCostsToFund) * 100 : 0;
  const debtToCostRatio =
    totalCosts > 0 ? (totalDebt / totalCosts) * 100 : 0;
  const debtToGrvRatio =
    totalRevenueExGst > 0 ? (totalDebt / totalRevenueExGst) * 100 : 0;

  // Residual Land Value
  // Simple: what you can pay for land and break even
  const residualLandValue = totalRevenueExGst - (totalCosts - landCost);
  // At target margin: RLV = Revenue * (1 - target%) - (TotalCosts - LandPurchase)
  const targetMargin = state.scenario.target_margin_pct ?? 20;
  const residualLandValueAtTarget =
    totalRevenueExGst * (1 - targetMargin / 100) - (totalCosts - landCost);

  // After-tax P&L
  const ebit = totalRevenueExGst - totalCostsExFunding;
  const profitBeforeTax = profit; // = totalRevenueExGst - totalCosts
  const taxRate = state.scenario.tax_rate ?? 30;
  const taxAmount = profitBeforeTax > 0 ? Math.round(profitBeforeTax * taxRate / 100) : 0;
  const profitAfterTax = profitBeforeTax - taxAmount;

  // NPV / IRR using monthly cashflow
  const discountRate = state.scenario.discount_rate ?? 10;
  const npv = computeNpv(state, discountRate);
  const irr = computeIrr(state);

  return {
    totalRevenue,
    totalRevenueExGst,
    unitCount,
    landCost,
    acquisitionCosts,
    professionalFees,
    constructionCosts,
    devFees,
    landHoldingCosts,
    contingencyCosts,
    marketingCosts,
    agentFees,
    legalFees,
    facilityFees,
    loanFees,
    equityFees,
    totalDebtInterest,
    totalEquity,
    totalCostsExFunding,
    totalFundingCosts,
    totalCosts,
    projectCostsToFund,
    profit,
    profitMargin,
    developmentMargin,
    profitOnCost,
    profitOnProjectCost,
    revenuePerUnit,
    costPerUnit,
    profitPerUnit,
    totalSaleableArea,
    aveNetSalesPerM2,
    aveNetSalesPerLot,
    aveConstructionPerM2,
    aveConstructionPerLot,
    ordinaryEquityLeveragePct,
    preferredEquityLeveragePct,
    debtLeveragePct,
    debtToCostRatio,
    debtToGrvRatio,
    totalDebt,
    totalPreferredEquity,
    totalDeveloperEquity,
    ebit,
    profitBeforeTax,
    taxAmount,
    profitAfterTax,
    npv,
    irr,
    totalLandSize,
    lotCount,
    residualLandValue,
    residualLandValueAtTarget,
  };
}

// ---------- NPV / IRR ----------

function getNetCashflows(state: FeasibilityState): number[] {
  // Use the cashflow engine for monthly net cashflows
  // Import would be circular, so compute a simple version here
  const totalMonths = state.scenario.project_length_months || 24;
  const flows = new Array(totalMonths).fill(0);

  // Land costs by deposit/settlement month
  for (const lot of state.landLots) {
    const depMonth = Math.max(0, (lot.deposit_month || 1) - 1);
    const setMonth = Math.max(0, (lot.settlement_month || 1) - 1);
    const deposit = lot.deposit_amount || 0;
    const balance = (lot.purchase_price || 0) - deposit;
    if (depMonth < totalMonths) flows[depMonth] -= deposit;
    if (setMonth < totalMonths) flows[setMonth] -= balance;
  }

  // Revenue by settlement month
  for (const unit of state.salesUnits) {
    const rev = normalizeToExGst(unit.sale_price || 0, unit.gst_status);
    const monthIdx = unit.settlement_month
      ? Math.max(0, unit.settlement_month - 1)
      : totalMonths - 1;
    if (monthIdx < totalMonths) flows[monthIdx] += rev;
  }

  // Line item costs spread across months
  const totalLandSize = state.landLots.reduce((s, l) => s + (l.land_size_m2 || 0), 0);
  const lotCount = state.landLots.length || 1;
  const totalRevenue = state.salesUnits.reduce((s, u) => s + (u.sale_price || 0), 0);
  const ctx: ResolveContext = {
    totalLandSize,
    lotCount,
    constructionTotal: 0, // simplified
    grvTotal: totalRevenue,
    projectCostsTotal: 0,
    projectLengthMonths: totalMonths,
  };

  for (const item of state.lineItems) {
    const amount = resolveLineItemAmount(item, ctx);
    const startMonth = Math.max(0, (item.cashflow_start_month ?? 1) - 1);
    const span = Math.max(1, item.cashflow_span_months || 1);
    const perMonth = Math.round(amount / span);
    for (let m = startMonth; m < startMonth + span && m < totalMonths; m++) {
      flows[m] -= perMonth;
    }
  }

  return flows;
}

function computeNpv(state: FeasibilityState, annualRate: number): number {
  const flows = getNetCashflows(state);
  if (flows.length === 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  let npv = 0;
  for (let i = 0; i < flows.length; i++) {
    npv += flows[i] / Math.pow(1 + monthlyRate, i + 1);
  }
  return Math.round(npv);
}

function computeIrr(state: FeasibilityState): number {
  const flows = getNetCashflows(state);
  if (flows.length === 0) return 0;

  // Newton's method to find monthly IRR
  let rate = 0.01; // initial guess: 1% per month
  for (let iter = 0; iter < 100; iter++) {
    let npv = 0;
    let dnpv = 0;
    for (let i = 0; i < flows.length; i++) {
      const t = i + 1;
      const disc = Math.pow(1 + rate, t);
      npv += flows[i] / disc;
      dnpv -= (t * flows[i]) / (disc * (1 + rate));
    }
    if (Math.abs(npv) < 1) break; // close enough (within $1)
    if (dnpv === 0) break;
    rate -= npv / dnpv;
    // Clamp to reasonable range
    if (rate < -0.5) rate = -0.5;
    if (rate > 10) rate = 10;
  }

  // Convert monthly rate to annual
  return (Math.pow(1 + rate, 12) - 1) * 100;
}
