import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RFIDetail } from "./rfi-detail";

interface RFIDetailPageProps {
  params: Promise<{ id: string; rfiId: string }>;
}

export default async function RFIDetailPage({ params }: RFIDetailPageProps) {
  const { id, rfiId } = await params;
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

  // Fetch RFI with originator and assignee
  const { data: rfi, error: rfiError } = await supabase
    .from("rfis")
    .select(`
      *,
      originator:profiles!rfis_originator_user_id_fkey(id, full_name),
      assignee:profiles!rfis_assignee_user_id_fkey(id, full_name)
    `)
    .eq("id", rfiId)
    .eq("project_id", id)
    .single();

  if (rfiError || !rfi) {
    notFound();
  }

  // Fetch messages
  const { data: messages } = await supabase
    .from("rfi_messages")
    .select(`
      *,
      author:profiles!rfi_messages_author_user_id_fkey(id, full_name)
    `)
    .eq("rfi_id", rfiId)
    .order("created_at", { ascending: true });

  // Fetch org members for reassignment
  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name")
    .not("full_name", "is", null);

  return (
    <RFIDetail
      project={project}
      rfi={rfi}
      messages={messages ?? []}
      members={members ?? []}
    />
  );
}
