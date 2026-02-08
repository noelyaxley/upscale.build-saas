import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReportsView } from "./reports-view";

interface ReportsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReportsPage({ params }: ReportsPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch project
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, code, name, budget")
    .eq("id", id)
    .single();

  if (projectError || !project) {
    notFound();
  }

  // Fetch all module data in parallel for aggregation
  const [
    variationsResult,
    claimsResult,
    tendersResult,
    tasksResult,
    submittalsResult,
    defectsResult,
    rfisResult,
    risksResult,
    eotsResult,
    lotsResult,
    diaryResult,
  ] = await Promise.all([
    supabase
      .from("variations")
      .select("id, status, cost_impact")
      .eq("project_id", id),
    supabase
      .from("progress_claims")
      .select("id, status, claimed_amount, certified_amount")
      .eq("project_id", id),
    supabase
      .from("tenders")
      .select("id, status, estimated_value, awarded_amount")
      .eq("project_id", id),
    supabase
      .from("programme_tasks")
      .select("id, progress, parent_id")
      .eq("project_id", id),
    supabase
      .from("submittals")
      .select("id, status")
      .eq("project_id", id),
    supabase
      .from("defects")
      .select("id, status")
      .eq("project_id", id),
    supabase
      .from("rfis")
      .select("id, status")
      .eq("project_id", id),
    supabase
      .from("risks")
      .select("id, status, type, level")
      .eq("project_id", id),
    supabase
      .from("extension_of_time")
      .select("id, status, days_claimed, days_approved")
      .eq("project_id", id),
    supabase
      .from("lots")
      .select("id, status, list_price, sold_price")
      .eq("project_id", id),
    supabase
      .from("site_diary_entries")
      .select("id")
      .eq("project_id", id),
  ]);

  return (
    <ReportsView
      project={project}
      variations={variationsResult.data ?? []}
      claims={claimsResult.data ?? []}
      tenders={tendersResult.data ?? []}
      tasks={tasksResult.data ?? []}
      submittals={submittalsResult.data ?? []}
      defects={defectsResult.data ?? []}
      rfis={rfisResult.data ?? []}
      risks={risksResult.data ?? []}
      eots={eotsResult.data ?? []}
      lots={lotsResult.data ?? []}
      diaryEntries={diaryResult.data ?? []}
    />
  );
}
