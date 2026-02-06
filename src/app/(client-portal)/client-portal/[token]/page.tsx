import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { ClientPortalView } from "./client-portal-view";

interface ClientPortalPageProps {
  params: Promise<{ token: string }>;
}

export default async function ClientPortalPage({
  params,
}: ClientPortalPageProps) {
  const { token } = await params;
  const supabase = createServiceClient();

  // Validate token
  const { data: link, error: linkError } = await supabase
    .from("client_portal_links")
    .select("id, project_id, name, is_active, expires_at")
    .eq("token", token)
    .single();

  if (linkError || !link) {
    notFound();
  }

  if (!link.is_active) {
    notFound();
  }

  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    notFound();
  }

  // Fetch project
  const { data: project } = await supabase
    .from("projects")
    .select(
      "id, code, name, description, address, start_date, end_date, stage, status"
    )
    .eq("id", link.project_id)
    .single();

  if (!project) {
    notFound();
  }

  // Fetch summary data in parallel
  const [variationsResult, claimsResult, tasksResult, diaryResult] =
    await Promise.all([
      supabase
        .from("variations")
        .select("id, status, cost_impact, title, variation_number")
        .eq("project_id", project.id)
        .order("variation_number", { ascending: false })
        .limit(10),
      supabase
        .from("progress_claims")
        .select(
          "id, status, claimed_amount, certified_amount, claim_number, period_start, period_end"
        )
        .eq("project_id", project.id)
        .order("claim_number", { ascending: false })
        .limit(10),
      supabase
        .from("programme_tasks")
        .select("id, name, progress, parent_id")
        .eq("project_id", project.id),
      supabase
        .from("site_diary_entries")
        .select("id, entry_date, weather_condition, work_summary")
        .eq("project_id", project.id)
        .order("entry_date", { ascending: false })
        .limit(5),
    ]);

  return (
    <ClientPortalView
      project={project}
      variations={variationsResult.data ?? []}
      claims={claimsResult.data ?? []}
      tasks={tasksResult.data ?? []}
      recentDiary={diaryResult.data ?? []}
    />
  );
}
