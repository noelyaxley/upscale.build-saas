import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RisksView } from "./risks-view";

interface RisksPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string; status?: string }>;
}

export default async function RisksPage({ params, searchParams }: RisksPageProps) {
  const { id } = await params;
  const { type, status } = await searchParams;
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

  // Build risks query with filters
  let query = supabase
    .from("risks")
    .select(`
      *,
      created_by:profiles!risks_created_by_user_id_fkey(id, full_name)
    `)
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  if (type && type !== "all") {
    query = query.eq("type", type);
  }

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data: risks } = await query;

  return (
    <RisksView
      project={project}
      risks={risks ?? []}
      typeFilter={type || "all"}
      statusFilter={status || "all"}
    />
  );
}
