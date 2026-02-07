import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateClaimView } from "./create-claim-view";

interface NewClaimPageProps {
  params: Promise<{ id: string; contractId: string }>;
}

export default async function NewClaimPage({ params }: NewClaimPageProps) {
  const { id, contractId } = await params;
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

  // Fetch contract
  const { data: contract, error: contractError } = await supabase
    .from("contracts")
    .select(`
      *,
      company:companies!contracts_company_id_fkey(id, name)
    `)
    .eq("id", contractId)
    .single();

  if (contractError || !contract) {
    notFound();
  }

  // Fetch contract items
  const { data: items } = await supabase
    .from("contract_items")
    .select("*")
    .eq("contract_id", contractId)
    .order("sort_order", { ascending: true });

  // Fetch all prior claims (submitted, certified, paid) for this contract
  const { data: priorClaims } = await supabase
    .from("progress_claims")
    .select("id")
    .eq("contract_id", contractId)
    .in("status", ["submitted", "certified", "paid"]);

  const priorClaimIds = (priorClaims ?? []).map((c) => c.id);

  // Fetch claim line items from prior claims to compute previously claimed per item
  let priorLineItems: Array<{
    contract_item_id: string | null;
    this_claim: number;
  }> = [];

  if (priorClaimIds.length > 0) {
    const { data } = await supabase
      .from("claim_line_items")
      .select("contract_item_id, this_claim")
      .in("claim_id", priorClaimIds);
    priorLineItems = data ?? [];
  }

  // Compute previouslyClaimed map: contract_item_id → cumulative cents
  const previouslyClaimed = new Map<string, number>();
  for (const li of priorLineItems) {
    if (li.contract_item_id) {
      previouslyClaimed.set(
        li.contract_item_id,
        (previouslyClaimed.get(li.contract_item_id) ?? 0) + li.this_claim
      );
    }
  }

  // Fetch companies for submitted-by select
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name")
    .order("name");

  return (
    <CreateClaimView
      project={project}
      contract={contract}
      items={items ?? []}
      previouslyClaimed={Object.fromEntries(previouslyClaimed)}
      companies={companies ?? []}
    />
  );
}
