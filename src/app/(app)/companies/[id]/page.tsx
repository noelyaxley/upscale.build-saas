import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CompanyDetail } from "./company-detail";

interface CompanyPageProps {
  params: Promise<{ id: string }>;
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: company, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !company) {
    notFound();
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("client_company_id", id)
    .order("name");

  return <CompanyDetail company={company} projects={projects ?? []} />;
}
