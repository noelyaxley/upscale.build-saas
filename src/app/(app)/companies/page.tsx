import { createClient } from "@/lib/supabase/server";
import { CompaniesList } from "./companies-list";

export default async function CompaniesPage() {
  const supabase = await createClient();

  const { data: companies } = await supabase
    .from("companies")
    .select("*")
    .order("name", { ascending: true });

  return <CompaniesList companies={companies ?? []} />;
}
