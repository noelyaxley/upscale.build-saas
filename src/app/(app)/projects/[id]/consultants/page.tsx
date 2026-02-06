import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ConsultantsView } from "./consultants-view";

interface ConsultantsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}

export default async function ConsultantsPage({ params, searchParams }: ConsultantsPageProps) {
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

  // Build consultants query with filters
  let query = supabase
    .from("consultants")
    .select(`
      *,
      company:companies!consultants_company_id_fkey(id, name),
      consultant_phases(id, fee, variations, disbursements, amount_paid)
    `)
    .eq("project_id", id)
    .order("consultant_number", { ascending: true });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data: consultants } = await query;

  // Fetch companies for the create dialog
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name")
    .order("name");

  return (
    <ConsultantsView
      project={project}
      consultants={consultants ?? []}
      companies={companies ?? []}
      statusFilter={status || "all"}
    />
  );
}
