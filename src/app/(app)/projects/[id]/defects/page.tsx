import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DefectsView } from "./defects-view";

interface DefectsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}

export default async function DefectsPage({ params, searchParams }: DefectsPageProps) {
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

  // Fetch defects with assigned company
  let query = supabase
    .from("defects")
    .select(`
      *,
      assigned_company:companies!defects_assigned_to_company_id_fkey(id, name),
      reported_by:profiles!defects_reported_by_user_id_fkey(id, full_name)
    `)
    .eq("project_id", id)
    .order("defect_number", { ascending: false });

  // Apply status filter if provided
  if (status && ["open", "contractor_complete", "closed"].includes(status)) {
    query = query.eq("status", status);
  }

  const { data: defects } = await query;

  // Fetch companies for assignment dropdown (contractors/subcontractors)
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, type")
    .in("type", ["contractor", "subcontractor", "supplier"]);

  return (
    <DefectsView
      project={project}
      defects={defects ?? []}
      companies={companies ?? []}
      statusFilter={status ?? "all"}
    />
  );
}
