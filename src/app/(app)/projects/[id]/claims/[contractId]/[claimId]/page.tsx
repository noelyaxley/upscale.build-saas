import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClaimDetail } from "./claim-detail";

interface ClaimPageProps {
  params: Promise<{ id: string; contractId: string; claimId: string }>;
}

export default async function ClaimPage({ params }: ClaimPageProps) {
  const { id, contractId, claimId } = await params;
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
    .select("id, contract_number, name")
    .eq("id", contractId)
    .single();

  if (contractError || !contract) {
    notFound();
  }

  // Fetch claim with relationships
  const { data: claim, error: claimError } = await supabase
    .from("progress_claims")
    .select(`
      *,
      submitted_by_company:companies!progress_claims_submitted_by_company_id_fkey(id, name)
    `)
    .eq("id", claimId)
    .single();

  if (claimError || !claim) {
    notFound();
  }

  // Fetch line items with contract_item join
  const { data: lineItems } = await supabase
    .from("claim_line_items")
    .select(`
      *,
      contract_item:contract_items(id, parent_id, sort_order)
    `)
    .eq("claim_id", claimId)
    .order("sort_order", { ascending: true });

  return (
    <ClaimDetail
      project={project}
      contract={contract}
      claim={claim}
      lineItems={lineItems ?? []}
    />
  );
}
