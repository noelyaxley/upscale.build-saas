"use client";

import { useCallback, useMemo, useReducer, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calculator,
  MapPin,
  DollarSign,
  ShoppingCart,
  Landmark,
  BarChart3,
  FileSpreadsheet,
} from "lucide-react";
import type { Tables } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  FeasibilityState,
  FeasibilityAction,
  LandLot,
  LineItem,
  SalesUnit,
  DebtFacility,
  DebtLoan,
  EquityPartner,
  GstStatus,
  RateType,
  SaleStatus,
  LoanType,
  LvrMethod,
  ProductType,
  SaleType,
  DevelopmentType,
  HoldingFrequency,
} from "@/lib/feasibility/types";
import { computeSummary } from "@/lib/feasibility/calculations";
import { ScenarioHeader } from "./components/scenario-header";
import { LandTab } from "./components/land-tab";
import { CostsTab } from "./components/costs-tab";
import { SalesTab } from "./components/sales-tab";
import { FundingTab } from "./components/funding-tab";
import { SummaryTab } from "./components/summary-tab";
import { FinancialsTab } from "./components/financials-tab";

type Scenario = Tables<"feasibility_scenarios">;

// Map DB row to typed domain objects
function mapLandLot(row: Record<string, unknown>): LandLot {
  return {
    id: row.id as string,
    scenario_id: row.scenario_id as string,
    name: (row.name as string) ?? "Lot",
    land_size_m2: row.land_size_m2 as number | null,
    address: row.address as string | null,
    suburb: row.suburb as string | null,
    state: row.state as string | null,
    postcode: row.postcode as string | null,
    entity_gst_registered: (row.entity_gst_registered as boolean) ?? false,
    land_purchase_gst_included:
      (row.land_purchase_gst_included as boolean) ?? false,
    margin_scheme_applied: (row.margin_scheme_applied as boolean) ?? false,
    land_rate: (row.land_rate as number) ?? 0,
    purchase_price: (row.purchase_price as number) ?? 0,
    deposit_amount: (row.deposit_amount as number) ?? 0,
    deposit_pct: (row.deposit_pct as number) ?? 10,
    deposit_month: (row.deposit_month as number) ?? 1,
    settlement_month: (row.settlement_month as number) ?? 1,
    sort_order: (row.sort_order as number) ?? 0,
  };
}

function mapLineItem(row: Record<string, unknown>): LineItem {
  return {
    id: row.id as string,
    scenario_id: row.scenario_id as string,
    section: row.section as LineItem["section"],
    tab_name: (row.tab_name as string) ?? "Default",
    land_lot_id: row.land_lot_id as string | null,
    parent_entity_id: row.parent_entity_id as string | null,
    name: (row.name as string) ?? "Item",
    quantity: (row.quantity as number) ?? 1,
    rate_type: (row.rate_type as RateType) ?? "$ Amount",
    rate: (row.rate as number) ?? 0,
    gst_status: (row.gst_status as GstStatus) ?? "exclusive",
    amount_ex_gst: (row.amount_ex_gst as number) ?? 0,
    frequency: (row.frequency as HoldingFrequency) ?? "once",
    cashflow_start_month: row.cashflow_start_month as number | null,
    cashflow_span_months: (row.cashflow_span_months as number) ?? 1,
    funding_facility_id: (row.funding_facility_id as string) ?? null,
    sort_order: (row.sort_order as number) ?? 0,
  };
}

function mapSalesUnit(row: Record<string, unknown>): SalesUnit {
  return {
    id: row.id as string,
    scenario_id: row.scenario_id as string,
    tab_name: (row.tab_name as string) ?? "Residential",
    name: (row.name as string) ?? "Unit",
    status: (row.status as SaleStatus) ?? "unsold",
    product_type: (row.product_type as ProductType) ?? "residential",
    sale_type: (row.sale_type as SaleType) ?? "vacant_possession",
    cap_rate: row.cap_rate as number | null,
    bedrooms: (row.bedrooms as number) ?? 0,
    bathrooms: (row.bathrooms as number) ?? 0,
    car_spaces: (row.car_spaces as number) ?? 0,
    area_m2: row.area_m2 as number | null,
    sale_price: (row.sale_price as number) ?? 0,
    gst_status: (row.gst_status as GstStatus) ?? "exclusive",
    amount_ex_gst: (row.amount_ex_gst as number) ?? 0,
    settlement_month: row.settlement_month as number | null,
    sort_order: (row.sort_order as number) ?? 0,
  };
}

function mapDebtFacility(row: Record<string, unknown>): DebtFacility {
  return {
    id: row.id as string,
    scenario_id: row.scenario_id as string,
    name: (row.name as string) ?? "Facility",
    priority: (row.priority as string) ?? "senior",
    calculation_type: (row.calculation_type as string) ?? "manual",
    term_months: (row.term_months as number) ?? 24,
    lvr_method: (row.lvr_method as LvrMethod) ?? "tdc_ex_gst",
    lvr_pct: (row.lvr_pct as number) ?? 65,
    interest_rate: (row.interest_rate as number) ?? 0,
    total_facility: (row.total_facility as number) ?? 0,
    interest_provision: (row.interest_provision as number) ?? 0,
    land_loan_type: (row.land_loan_type as DebtFacility["land_loan_type"]) ?? "provisioned",
    sort_order: (row.sort_order as number) ?? 0,
  };
}

function mapDebtLoan(row: Record<string, unknown>): DebtLoan {
  return {
    id: row.id as string,
    scenario_id: row.scenario_id as string,
    name: (row.name as string) ?? "Loan",
    principal_amount: (row.principal_amount as number) ?? 0,
    interest_rate: (row.interest_rate as number) ?? 0,
    payment_period: (row.payment_period as string) ?? "monthly",
    term_months: (row.term_months as number) ?? 12,
    loan_type: (row.loan_type as LoanType) ?? "interest_only",
    sort_order: (row.sort_order as number) ?? 0,
  };
}

function mapEquityPartner(row: Record<string, unknown>): EquityPartner {
  return {
    id: row.id as string,
    scenario_id: row.scenario_id as string,
    name: (row.name as string) ?? "Partner",
    is_developer_equity: (row.is_developer_equity as boolean) ?? false,
    distribution_type: (row.distribution_type as string) ?? "proportional",
    equity_amount: (row.equity_amount as number) ?? 0,
    return_percentage: (row.return_percentage as number) ?? 0,
    sort_order: (row.sort_order as number) ?? 0,
  };
}

function scenarioToFields(
  s: Scenario
): FeasibilityState["scenario"] {
  return {
    id: s.id,
    name: s.name,
    project_id: s.project_id,
    org_id: s.org_id,
    development_type:
      (s as Record<string, unknown>).development_type as DevelopmentType ?? "residential",
    project_length_months:
      (s as Record<string, unknown>).project_length_months as number ?? 24,
    project_lots:
      (s as Record<string, unknown>).project_lots as number ?? 1,
    start_date:
      (s as Record<string, unknown>).start_date as string | null ?? null,
    state: (s as Record<string, unknown>).state as string ?? "NSW",
    target_margin_pct:
      (s as Record<string, unknown>).target_margin_pct as number ?? 20,
    tax_rate:
      (s as Record<string, unknown>).tax_rate as number ?? 30,
    discount_rate:
      (s as Record<string, unknown>).discount_rate as number ?? 10,
    site_area: s.site_area,
    fsr: s.fsr,
    max_height: s.max_height,
    zoning: s.zoning,
    gfa: s.gfa,
    nsa: s.nsa,
    efficiency: s.efficiency,
    sale_rate: s.sale_rate,
    total_revenue: s.total_revenue,
    site_cost: s.site_cost,
    construction_cost: s.construction_cost,
    professional_fees: s.professional_fees,
    statutory_fees: s.statutory_fees,
    finance_costs: s.finance_costs,
    marketing_costs: s.marketing_costs,
    contingency: s.contingency,
    total_costs: s.total_costs,
    profit: s.profit,
    profit_on_cost: s.profit_on_cost,
    notes: s.notes,
  };
}

function feasibilityReducer(
  state: FeasibilityState,
  action: FeasibilityAction
): FeasibilityState {
  switch (action.type) {
    case "LOAD_ALL":
      return action.payload;

    case "UPDATE_SCENARIO":
      return {
        ...state,
        scenario: { ...state.scenario, ...action.payload },
      };

    case "ADD_LAND_LOT":
      return { ...state, landLots: [...state.landLots, action.payload] };
    case "UPDATE_LAND_LOT":
      return {
        ...state,
        landLots: state.landLots.map((l) =>
          l.id === action.payload.id
            ? { ...l, ...action.payload.changes }
            : l
        ),
      };
    case "REMOVE_LAND_LOT":
      return {
        ...state,
        landLots: state.landLots.filter((l) => l.id !== action.payload),
        lineItems: state.lineItems.filter(
          (i) => i.land_lot_id !== action.payload
        ),
      };

    case "ADD_LINE_ITEM":
      return { ...state, lineItems: [...state.lineItems, action.payload] };
    case "UPDATE_LINE_ITEM":
      return {
        ...state,
        lineItems: state.lineItems.map((i) =>
          i.id === action.payload.id
            ? { ...i, ...action.payload.changes }
            : i
        ),
      };
    case "REMOVE_LINE_ITEM":
      return {
        ...state,
        lineItems: state.lineItems.filter((i) => i.id !== action.payload),
      };

    case "ADD_SALES_UNIT":
      return { ...state, salesUnits: [...state.salesUnits, action.payload] };
    case "UPDATE_SALES_UNIT":
      return {
        ...state,
        salesUnits: state.salesUnits.map((u) =>
          u.id === action.payload.id
            ? { ...u, ...action.payload.changes }
            : u
        ),
      };
    case "REMOVE_SALES_UNIT":
      return {
        ...state,
        salesUnits: state.salesUnits.filter((u) => u.id !== action.payload),
      };

    case "ADD_DEBT_FACILITY":
      return {
        ...state,
        debtFacilities: [...state.debtFacilities, action.payload],
      };
    case "UPDATE_DEBT_FACILITY":
      return {
        ...state,
        debtFacilities: state.debtFacilities.map((f) =>
          f.id === action.payload.id
            ? { ...f, ...action.payload.changes }
            : f
        ),
      };
    case "REMOVE_DEBT_FACILITY":
      return {
        ...state,
        debtFacilities: state.debtFacilities.filter(
          (f) => f.id !== action.payload
        ),
      };

    case "ADD_DEBT_LOAN":
      return { ...state, debtLoans: [...state.debtLoans, action.payload] };
    case "UPDATE_DEBT_LOAN":
      return {
        ...state,
        debtLoans: state.debtLoans.map((l) =>
          l.id === action.payload.id
            ? { ...l, ...action.payload.changes }
            : l
        ),
      };
    case "REMOVE_DEBT_LOAN":
      return {
        ...state,
        debtLoans: state.debtLoans.filter((l) => l.id !== action.payload),
      };

    case "ADD_EQUITY_PARTNER":
      return {
        ...state,
        equityPartners: [...state.equityPartners, action.payload],
      };
    case "UPDATE_EQUITY_PARTNER":
      return {
        ...state,
        equityPartners: state.equityPartners.map((e) =>
          e.id === action.payload.id
            ? { ...e, ...action.payload.changes }
            : e
        ),
      };
    case "REMOVE_EQUITY_PARTNER":
      return {
        ...state,
        equityPartners: state.equityPartners.filter(
          (e) => e.id !== action.payload
        ),
      };

    default:
      return state;
  }
}

interface FeasibilityViewProps {
  project: { id: string; code: string; name: string };
  scenarios: Scenario[];
  activeScenarioId: string | null;
  initialLandLots: Record<string, unknown>[];
  initialLineItems: Record<string, unknown>[];
  initialSalesUnits: Record<string, unknown>[];
  initialDebtFacilities: Record<string, unknown>[];
  initialDebtLoans: Record<string, unknown>[];
  initialEquityPartners: Record<string, unknown>[];
}

function buildInitialState(
  scenarios: Scenario[],
  activeScenarioId: string | null,
  initialLandLots: Record<string, unknown>[],
  initialLineItems: Record<string, unknown>[],
  initialSalesUnits: Record<string, unknown>[],
  initialDebtFacilities: Record<string, unknown>[],
  initialDebtLoans: Record<string, unknown>[],
  initialEquityPartners: Record<string, unknown>[]
): FeasibilityState {
  const scenario = scenarios.find((s) => s.id === activeScenarioId);
  const emptyScenario: FeasibilityState["scenario"] = {
    id: "",
    name: "",
    project_id: "",
    org_id: "",
    development_type: "residential",
    project_length_months: 24,
    project_lots: 1,
    start_date: null,
    state: "NSW",
    target_margin_pct: 20,
    tax_rate: 30,
    discount_rate: 10,
    site_area: null,
    fsr: null,
    max_height: null,
    zoning: null,
    gfa: null,
    nsa: null,
    efficiency: null,
    sale_rate: null,
    total_revenue: null,
    site_cost: null,
    construction_cost: null,
    professional_fees: null,
    statutory_fees: null,
    finance_costs: null,
    marketing_costs: null,
    contingency: null,
    total_costs: null,
    profit: null,
    profit_on_cost: null,
    notes: null,
  };

  return {
    scenario: scenario ? scenarioToFields(scenario) : emptyScenario,
    landLots: initialLandLots.map(mapLandLot),
    lineItems: initialLineItems.map(mapLineItem),
    salesUnits: initialSalesUnits.map(mapSalesUnit),
    debtFacilities: initialDebtFacilities.map(mapDebtFacility),
    debtLoans: initialDebtLoans.map(mapDebtLoan),
    equityPartners: initialEquityPartners.map(mapEquityPartner),
  };
}

export function FeasibilityView({
  project,
  scenarios,
  activeScenarioId,
  initialLandLots,
  initialLineItems,
  initialSalesUnits,
  initialDebtFacilities,
  initialDebtLoans,
  initialEquityPartners,
}: FeasibilityViewProps) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);

  const [state, dispatch] = useReducer(
    feasibilityReducer,
    undefined,
    () =>
      buildInitialState(
        scenarios,
        activeScenarioId,
        initialLandLots,
        initialLineItems,
        initialSalesUnits,
        initialDebtFacilities,
        initialDebtLoans,
        initialEquityPartners
      )
  );

  const summary = useMemo(() => computeSummary(state), [state]);

  const handleSelectScenario = useCallback(
    (id: string) => {
      router.push(`/projects/${project.id}/feasibility?scenario=${id}`);
    },
    [router, project.id]
  );

  const handleSave = useCallback(async () => {
    if (!state.scenario.id) return;
    setSaving(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;

      // 1. Update scenario
      await supabase
        .from("feasibility_scenarios")
        .update({
          development_type: state.scenario.development_type,
          project_length_months: state.scenario.project_length_months,
          project_lots: state.scenario.project_lots,
          start_date: state.scenario.start_date,
          state: state.scenario.state,
          target_margin_pct: state.scenario.target_margin_pct,
          tax_rate: state.scenario.tax_rate,
          discount_rate: state.scenario.discount_rate,
          // Update legacy cache fields from summary
          total_revenue: summary.totalRevenue,
          site_cost: summary.landCost,
          construction_cost: summary.constructionCosts,
          professional_fees: summary.professionalFees,
          statutory_fees: summary.devFees,
          finance_costs: summary.totalFundingCosts,
          contingency: summary.contingencyCosts,
          marketing_costs: summary.marketingCosts,
          total_costs: summary.totalCosts,
          profit: summary.profit,
          profit_on_cost:
            Math.round(summary.profitOnCost * 100) / 100,
        } as Record<string, unknown>)
        .eq("id", state.scenario.id);

      // 2. Delete-reinsert all child tables
      const scenarioId = state.scenario.id;

      // Delete existing children
      await Promise.all([
        db.from("feasibility_land_lots").delete().eq("scenario_id", scenarioId).then(),
        db.from("feasibility_line_items").delete().eq("scenario_id", scenarioId).then(),
        db.from("feasibility_sales_units").delete().eq("scenario_id", scenarioId).then(),
        db.from("feasibility_debt_facilities").delete().eq("scenario_id", scenarioId).then(),
        db.from("feasibility_debt_loans").delete().eq("scenario_id", scenarioId).then(),
        db.from("feasibility_equity_partners").delete().eq("scenario_id", scenarioId).then(),
      ]);

      // Insert new children (only if arrays are non-empty)
      const inserts: Promise<unknown>[] = [];

      if (state.landLots.length > 0) {
        inserts.push(
          db.from("feasibility_land_lots").insert(
            state.landLots.map((l, i) => ({
              id: l.id,
              scenario_id: scenarioId,
              name: l.name,
              land_size_m2: l.land_size_m2,
              address: l.address,
              suburb: l.suburb,
              state: l.state,
              postcode: l.postcode,
              entity_gst_registered: l.entity_gst_registered,
              land_purchase_gst_included: l.land_purchase_gst_included,
              margin_scheme_applied: l.margin_scheme_applied,
              land_rate: l.land_rate,
              purchase_price: l.purchase_price,
              deposit_amount: l.deposit_amount,
              deposit_pct: l.deposit_pct,
              deposit_month: l.deposit_month,
              settlement_month: l.settlement_month,
              sort_order: i,
            }))
          ).then()
        );
      }

      if (state.lineItems.length > 0) {
        inserts.push(
          db.from("feasibility_line_items").insert(
            state.lineItems.map((item, i) => ({
              id: item.id,
              scenario_id: scenarioId,
              section: item.section,
              tab_name: item.tab_name,
              land_lot_id: item.land_lot_id,
              parent_entity_id: item.parent_entity_id,
              name: item.name,
              quantity: item.quantity,
              rate_type: item.rate_type,
              rate: item.rate,
              gst_status: item.gst_status,
              amount_ex_gst: item.amount_ex_gst,
              frequency: item.frequency,
              cashflow_start_month: item.cashflow_start_month,
              cashflow_span_months: item.cashflow_span_months,
              funding_facility_id: item.funding_facility_id,
              sort_order: i,
            }))
          ).then()
        );
      }

      if (state.salesUnits.length > 0) {
        inserts.push(
          db.from("feasibility_sales_units").insert(
            state.salesUnits.map((u, i) => ({
              id: u.id,
              scenario_id: scenarioId,
              tab_name: u.tab_name,
              name: u.name,
              status: u.status,
              product_type: u.product_type,
              sale_type: u.sale_type,
              cap_rate: u.cap_rate,
              bedrooms: u.bedrooms,
              bathrooms: u.bathrooms,
              car_spaces: u.car_spaces,
              area_m2: u.area_m2,
              sale_price: u.sale_price,
              gst_status: u.gst_status,
              amount_ex_gst: u.amount_ex_gst,
              settlement_month: u.settlement_month,
              sort_order: i,
            }))
          ).then()
        );
      }

      if (state.debtFacilities.length > 0) {
        inserts.push(
          db.from("feasibility_debt_facilities").insert(
            state.debtFacilities.map((f, i) => ({
              id: f.id,
              scenario_id: scenarioId,
              name: f.name,
              priority: f.priority,
              calculation_type: f.calculation_type,
              term_months: f.term_months,
              lvr_method: f.lvr_method,
              lvr_pct: f.lvr_pct,
              interest_rate: f.interest_rate,
              total_facility: f.total_facility,
              interest_provision: f.interest_provision,
              land_loan_type: f.land_loan_type,
              sort_order: i,
            }))
          ).then()
        );
      }

      if (state.debtLoans.length > 0) {
        inserts.push(
          db.from("feasibility_debt_loans").insert(
            state.debtLoans.map((l, i) => ({
              id: l.id,
              scenario_id: scenarioId,
              name: l.name,
              principal_amount: l.principal_amount,
              interest_rate: l.interest_rate,
              payment_period: l.payment_period,
              term_months: l.term_months,
              loan_type: l.loan_type,
              sort_order: i,
            }))
          ).then()
        );
      }

      if (state.equityPartners.length > 0) {
        inserts.push(
          db.from("feasibility_equity_partners").insert(
            state.equityPartners.map((e, i) => ({
              id: e.id,
              scenario_id: scenarioId,
              name: e.name,
              is_developer_equity: e.is_developer_equity,
              distribution_type: e.distribution_type,
              equity_amount: e.equity_amount,
              return_percentage: e.return_percentage,
              sort_order: i,
            }))
          ).then()
        );
      }

      await Promise.all(inserts);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }, [state, summary, supabase, router]);

  return (
    <div className="space-y-6">
      <ScenarioHeader
        project={project}
        scenarios={scenarios.map((s) => ({ id: s.id, name: s.name }))}
        selectedId={activeScenarioId ?? ""}
        developmentType={state.scenario.id ? state.scenario.development_type : undefined}
        onSelectScenario={handleSelectScenario}
        onSave={handleSave}
        saving={saving}
      />

      {scenarios.length === 0 ? (
        <EmptyState
          icon={Calculator}
          title="No scenarios yet"
          description="Create a scenario to start your feasibility analysis"
        />
      ) : (
        <Tabs defaultValue="land">
          <TabsList variant="line">
            <TabsTrigger value="land">
              <MapPin className="mr-1.5 size-3.5" />
              Land
            </TabsTrigger>
            <TabsTrigger value="costs">
              <DollarSign className="mr-1.5 size-3.5" />
              Costs
            </TabsTrigger>
            <TabsTrigger value="sales">
              <ShoppingCart className="mr-1.5 size-3.5" />
              Sales
            </TabsTrigger>
            <TabsTrigger value="funding">
              <Landmark className="mr-1.5 size-3.5" />
              Funding
            </TabsTrigger>
            <TabsTrigger value="summary">
              <BarChart3 className="mr-1.5 size-3.5" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="financials">
              <FileSpreadsheet className="mr-1.5 size-3.5" />
              Financials
            </TabsTrigger>
          </TabsList>

          <TabsContent value="land">
            <LandTab state={state} dispatch={dispatch} summary={summary} />
          </TabsContent>
          <TabsContent value="costs">
            <CostsTab state={state} dispatch={dispatch} summary={summary} />
          </TabsContent>
          <TabsContent value="sales">
            <SalesTab state={state} dispatch={dispatch} summary={summary} />
          </TabsContent>
          <TabsContent value="funding">
            <FundingTab state={state} dispatch={dispatch} summary={summary} />
          </TabsContent>
          <TabsContent value="summary">
            <SummaryTab summary={summary} />
          </TabsContent>
          <TabsContent value="financials">
            <FinancialsTab
              state={state}
              dispatch={dispatch}
              summary={summary}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
