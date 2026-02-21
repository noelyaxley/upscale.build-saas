// Domain types for the feasibility calculator

export type RateType = "$ Amount" | "$/m2" | "$/Lot" | "% Construction" | "% GRV" | "% Project Costs";
export type HoldingFrequency = "once" | "monthly" | "quarterly" | "semi_annually" | "annually";
export type GstStatus = "exclusive" | "inclusive" | "exempt";
export type SaleStatus = "unsold" | "exchanged" | "settled" | "withdrawn";
export type LoanType = "interest_only" | "principal_and_interest";
export type LvrMethod =
  | "grv_ex_gst"
  | "grv_inc_gst"
  | "tdc_ex_gst"
  | "tdc_inc_gst"
  | "tcc_ex_gst"
  | "tcc_inc_gst"
  | "tcc_cont_ex_gst"
  | "tcc_cont_inc_gst";
export type LandLoanType = "provisioned" | "serviced";
export type ProductType = "residential" | "commercial" | "industrial";
export type SaleType = "vacant_possession" | "sale_with_lease";
export type DevelopmentType = "residential" | "commercial" | "mixed_use" | "industrial" | "land_subdivision";

export type LineItemSection =
  | "acquisition"
  | "professional_fees"
  | "construction"
  | "dev_fees"
  | "land_holding"
  | "contingency"
  | "agent_fees"
  | "legal_fees"
  | "facility_fees"
  | "loan_fees"
  | "equity_fees"
  | "marketing";

export interface LandLot {
  id: string;
  scenario_id: string;
  name: string;
  land_size_m2: number | null;
  address: string | null;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
  entity_gst_registered: boolean;
  land_purchase_gst_included: boolean;
  margin_scheme_applied: boolean;
  land_rate: number;
  purchase_price: number;
  deposit_amount: number;
  deposit_pct: number;
  deposit_month: number;
  settlement_month: number;
  sort_order: number;
}

export interface LineItem {
  id: string;
  scenario_id: string;
  section: LineItemSection;
  tab_name: string;
  land_lot_id: string | null;
  parent_entity_id: string | null;
  name: string;
  quantity: number;
  rate_type: RateType;
  rate: number;
  gst_status: GstStatus;
  amount_ex_gst: number;
  frequency: HoldingFrequency;
  cashflow_start_month: number | null;
  cashflow_span_months: number;
  funding_facility_id: string | null;
  sort_order: number;
}

export interface SalesUnit {
  id: string;
  scenario_id: string;
  tab_name: string;
  name: string;
  status: SaleStatus;
  product_type: ProductType;
  sale_type: SaleType;
  cap_rate: number | null;
  bedrooms: number;
  bathrooms: number;
  car_spaces: number;
  area_m2: number | null;
  sale_price: number;
  gst_status: GstStatus;
  amount_ex_gst: number;
  settlement_month: number | null;
  sort_order: number;
}

export interface DebtFacility {
  id: string;
  scenario_id: string;
  name: string;
  priority: string;
  calculation_type: string;
  term_months: number;
  lvr_method: LvrMethod;
  lvr_pct: number;
  interest_rate: number;
  total_facility: number;
  interest_provision: number;
  land_loan_type: LandLoanType;
  sort_order: number;
}

export interface DebtLoan {
  id: string;
  scenario_id: string;
  name: string;
  principal_amount: number;
  interest_rate: number;
  payment_period: string;
  term_months: number;
  loan_type: LoanType;
  sort_order: number;
}

export interface EquityPartner {
  id: string;
  scenario_id: string;
  name: string;
  is_developer_equity: boolean;
  distribution_type: string;
  equity_amount: number;
  return_percentage: number;
  sort_order: number;
}

export interface ScenarioFields {
  id: string;
  name: string;
  project_id: string;
  org_id: string;
  development_type: DevelopmentType;
  project_length_months: number;
  project_lots: number;
  start_date: string | null;
  state: string;
  // Legacy flat fields retained as caches
  site_area: number | null;
  fsr: number | null;
  max_height: number | null;
  zoning: string | null;
  gfa: number | null;
  nsa: number | null;
  efficiency: number | null;
  sale_rate: number | null;
  total_revenue: number | null;
  site_cost: number | null;
  construction_cost: number | null;
  professional_fees: number | null;
  statutory_fees: number | null;
  finance_costs: number | null;
  marketing_costs: number | null;
  contingency: number | null;
  total_costs: number | null;
  profit: number | null;
  profit_on_cost: number | null;
  target_margin_pct: number;
  tax_rate: number;
  discount_rate: number;
  notes: string | null;
}

export interface FeasibilityState {
  scenario: ScenarioFields;
  landLots: LandLot[];
  lineItems: LineItem[];
  salesUnits: SalesUnit[];
  debtFacilities: DebtFacility[];
  debtLoans: DebtLoan[];
  equityPartners: EquityPartner[];
}

export interface FeasibilitySummary {
  // Revenue
  totalRevenue: number;
  totalRevenueExGst: number;
  unitCount: number;

  // Cost sections
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

  // Funding costs
  facilityFees: number;
  loanFees: number;
  equityFees: number;
  totalDebtInterest: number;
  totalEquity: number;

  // Totals
  totalCostsExFunding: number;
  totalFundingCosts: number;
  totalCosts: number;

  // Project costs total (costs that need funding — excludes funding costs themselves)
  projectCostsToFund: number;

  // Profit
  profit: number;
  profitMargin: number;           // profit / totalRevenueExGst * 100
  developmentMargin: number;      // (totalRevenueExGst - totalCostsExFunding) / totalRevenueExGst * 100
  profitOnCost: number;           // profit / totalCosts * 100 (aka Total Cost Margin)
  profitOnProjectCost: number;    // profit / totalCostsExFunding * 100 (aka Total Project Cost Margin)

  // Per-unit
  revenuePerUnit: number;
  costPerUnit: number;
  profitPerUnit: number;

  // Per-m2 and per-lot averages
  totalSaleableArea: number;
  aveNetSalesPerM2: number;
  aveNetSalesPerLot: number;
  aveConstructionPerM2: number;
  aveConstructionPerLot: number;

  // Leverage indicators (use projectCostsToFund as denominator)
  ordinaryEquityLeveragePct: number;
  preferredEquityLeveragePct: number;
  debtLeveragePct: number;
  debtToCostRatio: number;        // LTC %: totalDebt / totalCosts * 100
  debtToGrvRatio: number;         // LVR %: totalDebt / totalRevenueExGst * 100
  totalDebt: number;
  totalPreferredEquity: number;
  totalDeveloperEquity: number;

  // After-tax P&L
  ebit: number;                     // Revenue - Costs ex Funding
  profitBeforeTax: number;          // = profit (Revenue - all costs incl funding)
  taxAmount: number;
  profitAfterTax: number;

  // NPV / IRR
  npv: number;
  irr: number;

  // Land
  totalLandSize: number;
  lotCount: number;
  residualLandValue: number;
  residualLandValueAtTarget: number;
}

// Reducer action types
export type FeasibilityAction =
  | { type: "LOAD_ALL"; payload: FeasibilityState }
  | { type: "UPDATE_SCENARIO"; payload: Partial<ScenarioFields> }
  | { type: "ADD_LAND_LOT"; payload: LandLot }
  | { type: "UPDATE_LAND_LOT"; payload: { id: string; changes: Partial<LandLot> } }
  | { type: "REMOVE_LAND_LOT"; payload: string }
  | { type: "ADD_LINE_ITEM"; payload: LineItem }
  | { type: "UPDATE_LINE_ITEM"; payload: { id: string; changes: Partial<LineItem> } }
  | { type: "REMOVE_LINE_ITEM"; payload: string }
  | { type: "ADD_SALES_UNIT"; payload: SalesUnit }
  | { type: "UPDATE_SALES_UNIT"; payload: { id: string; changes: Partial<SalesUnit> } }
  | { type: "REMOVE_SALES_UNIT"; payload: string }
  | { type: "ADD_DEBT_FACILITY"; payload: DebtFacility }
  | { type: "UPDATE_DEBT_FACILITY"; payload: { id: string; changes: Partial<DebtFacility> } }
  | { type: "REMOVE_DEBT_FACILITY"; payload: string }
  | { type: "ADD_DEBT_LOAN"; payload: DebtLoan }
  | { type: "UPDATE_DEBT_LOAN"; payload: { id: string; changes: Partial<DebtLoan> } }
  | { type: "REMOVE_DEBT_LOAN"; payload: string }
  | { type: "ADD_EQUITY_PARTNER"; payload: EquityPartner }
  | { type: "UPDATE_EQUITY_PARTNER"; payload: { id: string; changes: Partial<EquityPartner> } }
  | { type: "REMOVE_EQUITY_PARTNER"; payload: string };
