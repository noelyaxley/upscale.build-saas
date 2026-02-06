import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubmittalsView } from "./submittals-view";

interface SubmittalsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}

export default async function SubmittalsPage({
  params,
  searchParams,
}: SubmittalsPageProps) {
  const { id } = await params;
  const { status } = await searchParams;
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

  // Build submittals query with filters
  let query = supabase
    .from("submittals")
    .select(
      `
      *,
      submitted_by_company:companies!submittals_submitted_by_company_id_fkey(id, name),
      reviewer:profiles!submittals_assigned_reviewer_id_fkey(id, full_name)
    `
    )
    .eq("project_id", id)
    .order("submittal_number", { ascending: true });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data: submittals } = await query;

  // Fetch companies for create dialog
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name")
    .order("name");

  // Fetch members for reviewer selection
  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name")
    .not("full_name", "is", null);

  return (
    <SubmittalsView
      project={project}
      submittals={submittals ?? []}
      companies={companies ?? []}
      members={members ?? []}
      statusFilter={status || "all"}
    />
  );
}
