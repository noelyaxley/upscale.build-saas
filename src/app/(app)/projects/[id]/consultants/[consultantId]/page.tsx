import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ConsultantDetail } from "./consultant-detail";

interface ConsultantDetailPageProps {
  params: Promise<{ id: string; consultantId: string }>;
}

export default async function ConsultantDetailPage({ params }: ConsultantDetailPageProps) {
  const { id, consultantId } = await params;
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

  // Fetch consultant with related data
  const { data: consultant, error: consultantError } = await supabase
    .from("consultants")
    .select(`
      *,
      company:companies!consultants_company_id_fkey(id, name),
      created_by:profiles!consultants_created_by_user_id_fkey(id, full_name)
    `)
    .eq("id", consultantId)
    .eq("project_id", id)
    .single();

  if (consultantError || !consultant) {
    notFound();
  }

  // Fetch phases ordered by sort_order
  const { data: phases } = await supabase
    .from("consultant_phases")
    .select("*")
    .eq("consultant_id", consultantId)
    .order("sort_order", { ascending: true });

  return (
    <ConsultantDetail
      project={project}
      consultant={consultant}
      phases={phases ?? []}
    />
  );
}
