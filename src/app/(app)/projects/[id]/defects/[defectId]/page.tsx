import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DefectDetail } from "./defect-detail";

interface DefectDetailPageProps {
  params: Promise<{ id: string; defectId: string }>;
}

export default async function DefectDetailPage({ params }: DefectDetailPageProps) {
  const { id, defectId } = await params;
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

  // Fetch defect with related data
  const { data: defect, error: defectError } = await supabase
    .from("defects")
    .select(`
      *,
      assigned_company:companies!defects_assigned_to_company_id_fkey(id, name),
      reported_by:profiles!defects_reported_by_user_id_fkey(id, full_name)
    `)
    .eq("id", defectId)
    .eq("project_id", id)
    .single();

  if (defectError || !defect) {
    notFound();
  }

  // Fetch companies for reassignment
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, type")
    .in("type", ["contractor", "subcontractor", "supplier"]);

  return (
    <DefectDetail
      project={project}
      defect={defect}
      companies={companies ?? []}
    />
  );
}
