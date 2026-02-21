import type {
  FeasibilityState,
  FeasibilitySummary,
  LineItem,
  LineItemSection,
} from "./types";
import { normalizeToExGst } from "./gst";

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

  // Debt interest from facilities and loans
  const totalDebtInterest =
    state.debtFacilities.reduce(
      (sum, f) => sum + (f.interest_provision || 0),
      0
    ) +
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
  const totalDebt = state.debtFacilities.reduce(
    (sum, f) => sum + (f.total_facility || 0),
    0
  );

  // Totals
  const totalCostsExFunding =
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
    totalLandSize,
    lotCount,
    residualLandValue,
    residualLandValueAtTarget,
  };
}
