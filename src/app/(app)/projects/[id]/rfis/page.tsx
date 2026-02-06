import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RFIsView } from "./rfis-view";

interface RFIsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}

export default async function RFIsPage({ params, searchParams }: RFIsPageProps) {
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

  // Fetch RFIs with originator and assignee
  let query = supabase
    .from("rfis")
    .select(`
      *,
      originator:profiles!rfis_originator_user_id_fkey(id, full_name),
      assignee:profiles!rfis_assignee_user_id_fkey(id, full_name)
    `)
    .eq("project_id", id)
    .order("number", { ascending: false });

  // Apply status filter if provided
  if (status && ["draft", "open", "closed"].includes(status)) {
    query = query.eq("status", status);
  }

  const { data: rfis } = await query;

  // Fetch project members for assignee dropdown
  const { data: members } = await supabase
    .from("project_members")
    .select("user_id, profiles(id, full_name)")
    .eq("project_id", id);

  // Also include all org members for now (since not all users may be project members)
  const { data: orgMembers } = await supabase
    .from("profiles")
    .select("id, full_name")
    .not("full_name", "is", null);

  return (
    <RFIsView
      project={project}
      rfis={rfis ?? []}
      members={orgMembers ?? []}
      statusFilter={status ?? "all"}
    />
  );
}
