import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LotDetail } from "./lot-detail";

interface LotDetailPageProps {
  params: Promise<{ id: string; lotId: string }>;
}

export default async function LotDetailPage({ params }: LotDetailPageProps) {
  const { id, lotId } = await params;
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

  // Fetch lot
  const { data: lot, error: lotError } = await supabase
    .from("lots")
    .select("*")
    .eq("id", lotId)
    .eq("project_id", id)
    .single();

  if (lotError || !lot) {
    notFound();
  }

  // Fetch sale transactions with agent relation
  const { data: transactions } = await supabase
    .from("sale_transactions")
    .select(
      `
      *,
      agent:sales_agents!sale_transactions_agent_id_fkey(id, name)
    `
    )
    .eq("lot_id", lotId)
    .order("created_at", { ascending: false });

  // Fetch agents for sale dialog
  const { data: agents } = await supabase
    .from("sales_agents")
    .select("id, name")
    .eq("project_id", id)
    .order("name");

  return (
    <LotDetail
      project={project}
      lot={lot}
      transactions={transactions ?? []}
      agents={agents ?? []}
    />
  );
}
