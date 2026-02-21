import type { FeasibilityState, LineItemSection } from "./types";
import { resolveLineItemAmount } from "./calculations";
import { normalizeToExGst } from "./gst";

export interface CashflowMonth {
  month: number;
  label: string; // e.g. "Jan 2026"
  revenue: number;
  landCost: number;
  acquisitionCosts: number;
  professionalFees: number;
  constructionCosts: number;
  devFees: number;
  landHoldingCosts: number;
  contingencyCosts: number;
  marketingCosts: number;
  agentFees: number;
  legalFees: number;
  fundingCosts: number;
  totalCosts: number;
  netCashflow: number;
  cumulativeCashflow: number;
}

const COST_SECTIONS: LineItemSection[] = [
  "acquisition",
  "professional_fees",
  "construction",
  "dev_fees",
  "land_holding",
  "contingency",
  "marketing",
  "agent_fees",
  "legal_fees",
  "facility_fees",
  "loan_fees",
  "equity_fees",
];

function getSectionKey(section: LineItemSection): keyof CashflowMonth {
  switch (section) {
    case "acquisition":
      return "acquisitionCosts";
    case "professional_fees":
      return "professionalFees";
    case "construction":
      return "constructionCosts";
    case "dev_fees":
      return "devFees";
    case "land_holding":
      return "landHoldingCosts";
    case "contingency":
      return "contingencyCosts";
    case "marketing":
      return "marketingCosts";
    case "agent_fees":
      return "agentFees";
    case "legal_fees":
      return "legalFees";
    case "facility_fees":
    case "loan_fees":
    case "equity_fees":
      return "fundingCosts";
  }
}

function getMonthLabel(startDate: Date, monthIndex: number): string {
  const d = new Date(startDate);
  d.setMonth(d.getMonth() + monthIndex);
  return d.toLocaleDateString("en-AU", { month: "short", year: "numeric" });
}

export function generateCashflow(state: FeasibilityState): CashflowMonth[] {
  const totalMonths = state.scenario.project_length_months || 24;
  const projectLengthMonths = totalMonths;
  const startDate = state.scenario.start_date
    ? new Date(state.scenario.start_date)
    : new Date();

  const totalLandSize = state.landLots.reduce(
    (s, l) => s + (l.land_size_m2 || 0),
    0
  );
  const lotCount = state.landLots.length || 1;
  const totalRevenue = state.salesUnits.reduce(
    (s, u) => s + (u.sale_price || 0),
    0
  );

  // Flat construction total for % Construction items
  const flatConstructionTotal = state.lineItems
    .filter(
      (i) =>
        i.section === "construction" &&
        i.rate_type !== "% Construction" &&
        i.rate_type !== "% GRV" &&
        i.rate_type !== "% Project Costs"
    )
    .reduce(
      (sum, item) =>
        sum +
        resolveLineItemAmount(item, {
          totalLandSize,
          lotCount,
          constructionTotal: 0,
          grvTotal: totalRevenue,
          projectCostsTotal: 0,
          projectLengthMonths,
        }),
      0
    );

  const context = {
    totalLandSize,
    lotCount,
    constructionTotal: flatConstructionTotal,
    grvTotal: totalRevenue,
    projectCostsTotal: 0, // not used for cashflow distribution
    projectLengthMonths,
  };

  // Initialize months
  const months: CashflowMonth[] = Array.from({ length: totalMonths }, (_, i) => ({
    month: i + 1,
    label: getMonthLabel(startDate, i),
    revenue: 0,
    landCost: 0,
    acquisitionCosts: 0,
    professionalFees: 0,
    constructionCosts: 0,
    devFees: 0,
    landHoldingCosts: 0,
    contingencyCosts: 0,
    marketingCosts: 0,
    agentFees: 0,
    legalFees: 0,
    fundingCosts: 0,
    totalCosts: 0,
    netCashflow: 0,
    cumulativeCashflow: 0,
  }));

  // Distribute land costs using deposit_month, settlement_month, and payment_schedule
  for (const lot of state.landLots) {
    const depositMonth = Math.max(0, (lot.deposit_month || 1) - 1);
    const settlementMonth = Math.max(0, (lot.settlement_month || 1) - 1);
    const deposit = lot.deposit_amount || 0;
    const purchasePrice = lot.purchase_price || 0;

    // Sum of scheduled payments (excluding deposit and settlement balance)
    const schedule = lot.payment_schedule ?? [];
    const scheduledTotal = schedule.reduce((s, p) => s + (p.amount || 0), 0);

    // Deposit
    if (depositMonth < totalMonths) {
      months[depositMonth].landCost += deposit;
    }

    // Scheduled progress payments
    for (const payment of schedule) {
      const pMonth = Math.max(0, (payment.month || 1) - 1);
      if (pMonth < totalMonths) {
        months[pMonth].landCost += payment.amount || 0;
      }
    }

    // Settlement balance = purchase price - deposit - scheduled payments
    const balance = Math.max(0, purchasePrice - deposit - scheduledTotal);
    if (settlementMonth < totalMonths && balance > 0) {
      months[settlementMonth].landCost += balance;
    }
  }

  // Distribute line items across months
  for (const item of state.lineItems) {
    if (!COST_SECTIONS.includes(item.section)) continue;

    const amount = resolveLineItemAmount(item, context);
    const startMonth = Math.max(0, (item.cashflow_start_month ?? 1) - 1);
    const span = Math.max(1, item.cashflow_span_months || 1);
    const perMonth = Math.round(amount / span);
    const key = getSectionKey(item.section);

    for (let m = startMonth; m < startMonth + span && m < totalMonths; m++) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (months[m] as any)[key] += perMonth;
    }
  }

  // Distribute revenue per unit using settlement_month (default: last month)
  for (const unit of state.salesUnits) {
    const unitRevenue = normalizeToExGst(unit.sale_price || 0, unit.gst_status);
    const monthIdx = unit.settlement_month
      ? Math.max(0, unit.settlement_month - 1)
      : totalMonths - 1;
    if (monthIdx < totalMonths) {
      months[monthIdx].revenue += unitRevenue;
    }
  }

  // Compute totals and cumulative
  let cumulative = 0;
  for (const m of months) {
    m.totalCosts =
      m.landCost +
      m.acquisitionCosts +
      m.professionalFees +
      m.constructionCosts +
      m.devFees +
      m.landHoldingCosts +
      m.contingencyCosts +
      m.marketingCosts +
      m.agentFees +
      m.legalFees +
      m.fundingCosts;
    m.netCashflow = m.revenue - m.totalCosts;
    cumulative += m.netCashflow;
    m.cumulativeCashflow = cumulative;
  }

  return months;
}
