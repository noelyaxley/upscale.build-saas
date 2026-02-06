import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VariationDetail } from "./variation-detail";

interface VariationDetailPageProps {
  params: Promise<{ id: string; variationId: string }>;
}

export default async function VariationDetailPage({ params }: VariationDetailPageProps) {
  const { id, variationId } = await params;
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

  // Fetch variation with related data
  const { data: variation, error: variationError } = await supabase
    .from("variations")
    .select(`
      *,
      submitted_by_company:companies!variations_submitted_by_company_id_fkey(id, name),
      created_by:profiles!variations_created_by_user_id_fkey(id, full_name),
      approved_by:profiles!variations_approved_by_user_id_fkey(id, full_name)
    `)
    .eq("id", variationId)
    .eq("project_id", id)
    .single();

  if (variationError || !variation) {
    notFound();
  }

  return <VariationDetail project={project} variation={variation} />;
}
