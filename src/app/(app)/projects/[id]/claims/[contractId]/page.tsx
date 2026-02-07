import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContractDetail } from "./contract-detail";

interface ContractPageProps {
  params: Promise<{ id: string; contractId: string }>;
}

export default async function ContractPage({ params }: ContractPageProps) {
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

  // Fetch contract with company
  const { data: contract, error: contractError } = await supabase
    .from("contracts")
    .select(`
      *,
      company:companies!contracts_company_id_fkey(id, name),
      created_by:profiles!contracts_created_by_user_id_fkey(id, full_name)
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

  // Fetch claims for this contract
  const { data: claims } = await supabase
    .from("progress_claims")
    .select(`
      *,
      submitted_by_company:companies!progress_claims_submitted_by_company_id_fkey(id, name)
    `)
    .eq("contract_id", contractId)
    .order("claim_number", { ascending: false });

  // Fetch claim line items for all claims (for claimed-to-date calculations)
  const claimIds = (claims ?? []).map((c) => c.id);
  let claimLineItems: Array<{
    id: string;
    claim_id: string;
    contract_item_id: string | null;
    this_claim: number;
    certified_this_claim: number;
  }> = [];

  if (claimIds.length > 0) {
    const { data } = await supabase
      .from("claim_line_items")
      .select("id, claim_id, contract_item_id, this_claim, certified_this_claim")
      .in("claim_id", claimIds);
    claimLineItems = data ?? [];
  }

  // Fetch approved variations for this contract
  const { data: variations } = await supabase
    .from("variations")
    .select(`
      *,
      submitted_by_company:companies!variations_submitted_by_company_id_fkey(id, name)
    `)
    .eq("contract_id", contractId)
    .order("variation_number", { ascending: true });

  // Fetch companies for dialogs
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name")
    .order("name");

  return (
    <ContractDetail
      project={project}
      contract={contract}
      items={items ?? []}
      claims={claims ?? []}
      claimLineItems={claimLineItems}
      variations={variations ?? []}
      companies={companies ?? []}
    />
  );
}
