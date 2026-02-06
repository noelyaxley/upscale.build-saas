import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EotDetail } from "./eot-detail";

interface EotDetailPageProps {
  params: Promise<{ id: string; eotId: string }>;
}

export default async function EotDetailPage({ params }: EotDetailPageProps) {
  const { id, eotId } = await params;
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

  // Fetch EOT with related data
  const { data: eot, error: eotError } = await supabase
    .from("extension_of_time")
    .select(`
      *,
      submitted_by_company:companies!extension_of_time_submitted_by_company_id_fkey(id, name),
      approved_by:profiles!extension_of_time_approved_by_user_id_fkey(id, full_name),
      created_by:profiles!extension_of_time_created_by_user_id_fkey(id, full_name)
    `)
    .eq("id", eotId)
    .eq("project_id", id)
    .single();

  if (eotError || !eot) {
    notFound();
  }

  return <EotDetail project={project} eot={eot} />;
}
