import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VariationsView } from "./variations-view";

interface VariationsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}

export default async function VariationsPage({ params, searchParams }: VariationsPageProps) {
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

  // Build variations query with filters
  let query = supabase
    .from("variations")
    .select(`
      *,
      submitted_by_company:companies!variations_submitted_by_company_id_fkey(id, name),
      created_by:profiles!variations_created_by_user_id_fkey(id, full_name)
    `)
    .eq("project_id", id)
    .order("variation_number", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data: variations } = await query;

  // Fetch companies for the create dialog
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name")
    .order("name");

  // Fetch contracts for the create dialog
  const { data: contracts } = await supabase
    .from("contracts")
    .select("id, name, contract_number")
    .eq("project_id", id)
    .order("contract_number", { ascending: true });

  return (
    <VariationsView
      project={project}
      variations={variations ?? []}
      companies={companies ?? []}
      contracts={contracts ?? []}
      statusFilter={status || "all"}
    />
  );
}
