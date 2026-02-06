import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TendersView } from "./tenders-view";

interface TendersPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}

export default async function TendersPage({ params, searchParams }: TendersPageProps) {
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

  // Build tenders query with filters
  let query = supabase
    .from("tenders")
    .select(`
      *,
      awarded_company:companies!tenders_awarded_company_id_fkey(id, name),
      tender_submissions(id)
    `)
    .eq("project_id", id)
    .order("tender_number", { ascending: true });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data: tenders } = await query;

  // Fetch companies for the create dialog
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name")
    .order("name");

  return (
    <TendersView
      project={project}
      tenders={tenders ?? []}
      companies={companies ?? []}
      statusFilter={status || "all"}
    />
  );
}
