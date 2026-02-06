import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProjectDetail } from "./project-detail";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project, error } = await supabase
    .from("projects")
    .select("*, client_company:companies(*)")
    .eq("id", id)
    .single();

  if (error || !project) {
    notFound();
  }

  // Fetch all related data in parallel
  const [membersResult, updatesResult, actionItemsResult] = await Promise.all([
    supabase
      .from("project_members")
      .select("*, profiles(*)")
      .eq("project_id", id)
      .order("role")
      .order("created_at"),
    supabase
      .from("project_updates")
      .select(`
        *,
        created_by:profiles!project_updates_created_by_user_id_fkey(id, full_name)
      `)
      .eq("project_id", id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("action_items")
      .select(`
        *,
        assigned_to:profiles!action_items_assigned_to_user_id_fkey(id, full_name),
        created_by:profiles!action_items_created_by_user_id_fkey(id, full_name)
      `)
      .eq("project_id", id)
      .order("status")
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(20),
  ]);

  // Get team members for action item assignment
  const teamMembers = (membersResult.data ?? []).map((m) => ({
    id: m.profiles.id,
    full_name: m.profiles.full_name,
  }));

  return (
    <ProjectDetail
      project={project}
      clientCompany={project.client_company}
      members={membersResult.data ?? []}
      updates={updatesResult.data ?? []}
      actionItems={actionItemsResult.data ?? []}
      teamMembers={teamMembers}
    />
  );
}
