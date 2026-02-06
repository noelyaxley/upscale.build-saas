import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LotsView } from "./lots-view";

interface LotSalesPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}

export default async function LotSalesPage({
  params,
  searchParams,
}: LotSalesPageProps) {
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

  // Build lots query with filters
  let query = supabase
    .from("lots")
    .select("*")
    .eq("project_id", id)
    .order("lot_number", { ascending: true });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data: lots } = await query;

  return (
    <LotsView
      project={project}
      lots={lots ?? []}
      statusFilter={status || "all"}
    />
  );
}
