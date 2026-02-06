import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EotView } from "./eot-view";

interface EotPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}

export default async function EotPage({ params, searchParams }: EotPageProps) {
  const { id } = await params;
  const { status } = await searchParams;
  const supabase = await createClient();

  // Fetch project
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, code, name, end_date")
    .eq("id", id)
    .single();

  if (projectError || !project) {
    notFound();
  }

  // Build EOT query with filters
  let query = supabase
    .from("extension_of_time")
    .select(`
      *,
      submitted_by_company:companies!extension_of_time_submitted_by_company_id_fkey(id, name),
      approved_by:profiles!extension_of_time_approved_by_user_id_fkey(id, full_name)
    `)
    .eq("project_id", id)
    .order("eot_number", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data: eots } = await query;

  // Fetch companies for the create dialog
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name")
    .order("name");

  return (
    <EotView
      project={project}
      eots={eots ?? []}
      companies={companies ?? []}
      statusFilter={status || "all"}
    />
  );
}
