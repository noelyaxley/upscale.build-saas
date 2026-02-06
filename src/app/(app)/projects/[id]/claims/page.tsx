import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClaimsView } from "./claims-view";

interface ClaimsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}

export default async function ClaimsPage({ params, searchParams }: ClaimsPageProps) {
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

  // Build claims query with filters
  let query = supabase
    .from("progress_claims")
    .select(`
      *,
      submitted_by_company:companies!progress_claims_submitted_by_company_id_fkey(id, name)
    `)
    .eq("project_id", id)
    .order("claim_number", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data: claims } = await query;

  // Fetch companies for the create dialog
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name")
    .order("name");

  return (
    <ClaimsView
      project={project}
      claims={claims ?? []}
      companies={companies ?? []}
      statusFilter={status || "all"}
    />
  );
}
