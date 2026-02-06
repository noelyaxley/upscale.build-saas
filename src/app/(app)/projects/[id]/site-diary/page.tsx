import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteDiaryView } from "./site-diary-view";

interface SiteDiaryPageProps {
  params: Promise<{ id: string }>;
}

export default async function SiteDiaryPage({ params }: SiteDiaryPageProps) {
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

  // Fetch diary entries with labor and equipment counts
  const { data: entries } = await supabase
    .from("site_diary_entries")
    .select(`
      *,
      created_by:profiles!site_diary_entries_created_by_user_id_fkey(id, full_name),
      diary_labor_entries(id),
      diary_equipment_entries(id),
      diary_visitors(id)
    `)
    .eq("project_id", id)
    .order("entry_date", { ascending: false });

  // Fetch companies for the labor entry dropdown
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name")
    .order("name");

  return (
    <SiteDiaryView
      project={project}
      entries={entries ?? []}
      companies={companies ?? []}
    />
  );
}
