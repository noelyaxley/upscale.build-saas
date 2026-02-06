import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SalesAgentsView } from "./sales-agents-view";

interface SalesAgentsPageProps {
  params: Promise<{ id: string }>;
}

export default async function SalesAgentsPage({
  params,
}: SalesAgentsPageProps) {
  const { id } = await params;
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

  // Fetch agents
  const { data: agents } = await supabase
    .from("sales_agents")
    .select("id, name, company, email, phone, commission_rate")
    .eq("project_id", id)
    .order("name");

  // Fetch sale transactions to compute per-agent stats
  const { data: transactions } = await supabase
    .from("sale_transactions")
    .select("agent_id, commission_amount, lot_id, lots!inner(project_id)")
    .eq("lots.project_id", id);

  // Aggregate stats per agent
  const agentStats = (agents ?? []).map((agent) => {
    const agentTxs = (transactions ?? []).filter(
      (t) => t.agent_id === agent.id
    );
    return {
      agent_id: agent.id,
      sales_count: agentTxs.length,
      total_commission: agentTxs.reduce(
        (sum, t) => sum + (t.commission_amount || 0),
        0
      ),
    };
  });

  return (
    <SalesAgentsView
      project={project}
      agents={agents ?? []}
      agentStats={agentStats}
    />
  );
}
