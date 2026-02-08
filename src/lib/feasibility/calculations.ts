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
}

/** Resolve a line item's amount_ex_gst based on its rate type */
export function resolveLineItemAmount(
  item: LineItem,
  context: ResolveContext
): number {
  const qty = item.quantity || 1;
  const rate = item.rate || 0;

  switch (item.rate_type) {
    case "$/m2":
      return normalizeToExGst(
        Math.round(qty * rate * (context.totalLandSize || 1)),
        item.gst_status
      );
    case "$/Lot":
      return normalizeToExGst(
        Math.round(qty * rate * (context.lotCount || 1)),
        item.gst_status
      );
    case "% Construction":
      return normalizeToExGst(
        Math.round((rate / 100) * context.constructionTotal * qty),
        item.gst_status
      );
    case "% GRV":
      return normalizeToExGst(
        Math.round((rate / 100) * context.grvTotal * qty),
        item.gst_status
      );
    case "$ Amount":
    default:
      return normalizeToExGst(Math.round(qty * rate), item.gst_status);
  }
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

/** Full P&L computation - two-pass for percentage-based items */
export function computeSummary(state: FeasibilityState): FeasibilitySummary {
  const totalLandSize = getTotalLandSize(state);
  const lotCount = getLotCount(state);

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

  // Pass 1: resolve flat-rate items to get construction total
  const pass1Context: ResolveContext = {
    totalLandSize,
    lotCount,
    constructionTotal: 0,
    grvTotal: totalRevenue,
  };

  // Construction is needed for % Construction items in other sections
  const flatConstructionItems = state.lineItems.filter(
    (i) =>
      i.section === "construction" &&
      i.rate_type !== "% Construction" &&
      i.rate_type !== "% GRV"
  );
  const flatConstructionTotal = flatConstructionItems.reduce(
    (sum, item) => sum + resolveLineItemAmount(item, pass1Context),
    0
  );

  // Pass 2: with construction total known
  const context: ResolveContext = {
    totalLandSize,
    lotCount,
    constructionTotal: flatConstructionTotal,
    grvTotal: totalRevenue,
  };

  const acquisitionCosts = sumSection(state.lineItems, "acquisition", context);
  const professionalFees = sumSection(
    state.lineItems,
    "professional_fees",
    context
  );
  const constructionCosts = sumSection(
    state.lineItems,
    "construction",
    context
  );
  const devFees = sumSection(state.lineItems, "dev_fees", context);
  const landHoldingCosts = sumSection(
    state.lineItems,
    "land_holding",
    context
  );
  const contingencyCosts = sumSection(
    state.lineItems,
    "contingency",
    context
  );
  const agentFees = sumSection(state.lineItems, "agent_fees", context);
  const legalFees = sumSection(state.lineItems, "legal_fees", context);

  // Funding line-item costs
  const facilityFees = sumSection(
    state.lineItems,
    "facility_fees",
    context
  );
  const loanFees = sumSection(state.lineItems, "loan_fees", context);
  const equityFees = sumSection(state.lineItems, "equity_fees", context);

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

  // Equity
  const totalEquity = state.equityPartners.reduce(
    (sum, e) => sum + (e.equity_amount || 0),
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
    agentFees +
    legalFees;

  const totalFundingCosts =
    facilityFees + loanFees + equityFees + totalDebtInterest;

  const totalCosts = totalCostsExFunding + totalFundingCosts;
  const profit = totalRevenueExGst - totalCosts;
  const profitOnCost = totalCosts > 0 ? (profit / totalCosts) * 100 : 0;
  const developmentMargin =
    totalRevenueExGst > 0 ? (profit / totalRevenueExGst) * 100 : 0;

  // Per-unit
  const revenuePerUnit = unitCount > 0 ? Math.round(totalRevenue / unitCount) : 0;
  const costPerUnit = unitCount > 0 ? Math.round(totalCosts / unitCount) : 0;
  const profitPerUnit = unitCount > 0 ? Math.round(profit / unitCount) : 0;

  // Residual land value = Revenue - (all costs except land)
  const residualLandValue = totalRevenueExGst - (totalCosts - landCost);

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
    profit,
    profitOnCost,
    developmentMargin,
    revenuePerUnit,
    costPerUnit,
    profitPerUnit,
    totalLandSize,
    lotCount,
    residualLandValue,
  };
}
