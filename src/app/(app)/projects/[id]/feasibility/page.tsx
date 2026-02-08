import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FeasibilityView } from "./feasibility-view";

interface FeasibilityPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ scenario?: string }>;
}

export default async function FeasibilityPage({
  params,
  searchParams,
}: FeasibilityPageProps) {
  const { id } = await params;
  const { scenario: activeScenarioId } = await searchParams;
  const supabase = await createClient();

  // Fetch project
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, code, name")
    .eq("id", id)
    .single();

  if (projectError || !project) {
    notFound();
  }

  // Fetch all scenarios for this project
  const { data: scenarios } = await supabase
    .from("feasibility_scenarios")
    .select("*")
    .eq("project_id", id)
    .order("updated_at", { ascending: false });

  // Determine active scenario
  const allScenarios = scenarios ?? [];
  const selectedId =
    activeScenarioId && allScenarios.some((s) => s.id === activeScenarioId)
      ? activeScenarioId
      : allScenarios[0]?.id ?? null;

  // Fetch child tables for the active scenario in parallel
  let landLots = null;
  let lineItems = null;
  let salesUnits = null;
  let debtFacilities = null;
  let debtLoans = null;
  let equityPartners = null;

  if (selectedId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    const [lotsRes, itemsRes, unitsRes, facilitiesRes, loansRes, partnersRes] =
      await Promise.all([
        db.from("feasibility_land_lots").select("*").eq("scenario_id", selectedId).order("sort_order"),
        db.from("feasibility_line_items").select("*").eq("scenario_id", selectedId).order("sort_order"),
        db.from("feasibility_sales_units").select("*").eq("scenario_id", selectedId).order("sort_order"),
        db.from("feasibility_debt_facilities").select("*").eq("scenario_id", selectedId).order("sort_order"),
        db.from("feasibility_debt_loans").select("*").eq("scenario_id", selectedId).order("sort_order"),
        db.from("feasibility_equity_partners").select("*").eq("scenario_id", selectedId).order("sort_order"),
      ]);

    landLots = lotsRes.data;
    lineItems = itemsRes.data;
    salesUnits = unitsRes.data;
    debtFacilities = facilitiesRes.data;
    debtLoans = loansRes.data;
    equityPartners = partnersRes.data;
  }

  return (
    <FeasibilityView
      project={project}
      scenarios={allScenarios}
      activeScenarioId={selectedId}
      initialLandLots={landLots ?? []}
      initialLineItems={lineItems ?? []}
      initialSalesUnits={salesUnits ?? []}
      initialDebtFacilities={debtFacilities ?? []}
      initialDebtLoans={debtLoans ?? []}
      initialEquityPartners={equityPartners ?? []}
    />
  );
}
