import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClaimsView } from "./claims-view";

interface ClaimsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}

export default async function ClaimsPage({ params, searchParams }: ClaimsPageProps) {
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

  // Fetch contracts with company join
  let query = supabase
    .from("contracts")
    .select(`
      *,
      company:companies!contracts_company_id_fkey(id, name)
    `)
    .eq("project_id", id)
    .order("contract_number", { ascending: true });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data: contracts } = await query;

  // Fetch claims aggregation per contract
  const { data: claims } = await supabase
    .from("progress_claims")
    .select("id, contract_id, claimed_amount, certified_amount, status")
    .eq("project_id", id);

  // Fetch companies for the create dialog
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name")
    .order("name");

  return (
    <ClaimsView
      project={project}
      contracts={contracts ?? []}
      claims={claims ?? []}
      companies={companies ?? []}
      statusFilter={status || "all"}
    />
  );
}
