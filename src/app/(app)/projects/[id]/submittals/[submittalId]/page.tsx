import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubmittalDetail } from "./submittal-detail";

interface SubmittalDetailPageProps {
  params: Promise<{ id: string; submittalId: string }>;
}

export default async function SubmittalDetailPage({
  params,
}: SubmittalDetailPageProps) {
  const { id, submittalId } = await params;
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

  // Fetch submittal with relations
  const { data: submittal, error: submittalError } = await supabase
    .from("submittals")
    .select(
      `
      *,
      submitted_by_company:companies!submittals_submitted_by_company_id_fkey(id, name),
      reviewer:profiles!submittals_assigned_reviewer_id_fkey(id, full_name),
      creator:profiles!submittals_created_by_user_id_fkey(id, full_name)
    `
    )
    .eq("id", submittalId)
    .eq("project_id", id)
    .single();

  if (submittalError || !submittal) {
    notFound();
  }

  // Fetch comments
  const { data: comments } = await supabase
    .from("submittal_comments")
    .select(
      `
      *,
      author:profiles!submittal_comments_author_user_id_fkey(id, full_name)
    `
    )
    .eq("submittal_id", submittalId)
    .order("created_at", { ascending: true });

  // Fetch members for reviewer reassignment
  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name")
    .not("full_name", "is", null);

  return (
    <SubmittalDetail
      project={project}
      submittal={submittal}
      comments={comments ?? []}
      members={members ?? []}
    />
  );
}
