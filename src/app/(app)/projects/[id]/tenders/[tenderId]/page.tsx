import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TenderDetail } from "./tender-detail";

interface TenderDetailPageProps {
  params: Promise<{ id: string; tenderId: string }>;
}

export default async function TenderDetailPage({ params }: TenderDetailPageProps) {
  const { id, tenderId } = await params;
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

  // Fetch tender with related data
  const { data: tender, error: tenderError } = await supabase
    .from("tenders")
    .select(`
      *,
      awarded_company:companies!tenders_awarded_company_id_fkey(id, name),
      created_by:profiles!tenders_created_by_user_id_fkey(id, full_name)
    `)
    .eq("id", tenderId)
    .eq("project_id", id)
    .single();

  if (tenderError || !tender) {
    notFound();
  }

  // Fetch submissions with company joins, ordered by amount ascending (lowest first)
  const { data: submissions } = await supabase
    .from("tender_submissions")
    .select(`
      *,
      company:companies!tender_submissions_company_id_fkey(id, name)
    `)
    .eq("tender_id", tenderId)
    .order("amount", { ascending: true });

  // Fetch companies for adding submissions
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name")
    .order("name");

  return (
    <TenderDetail
      project={project}
      tender={tender}
      submissions={submissions ?? []}
      companies={companies ?? []}
    />
  );
}
