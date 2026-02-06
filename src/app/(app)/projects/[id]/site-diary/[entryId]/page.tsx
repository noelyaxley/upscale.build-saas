import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DiaryEntryDetail } from "./diary-entry-detail";

interface DiaryEntryPageProps {
  params: Promise<{ id: string; entryId: string }>;
}

export default async function DiaryEntryPage({ params }: DiaryEntryPageProps) {
  const { id, entryId } = await params;
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

  // Fetch diary entry with all related data
  const { data: entry, error: entryError } = await supabase
    .from("site_diary_entries")
    .select(`
      *,
      created_by:profiles!site_diary_entries_created_by_user_id_fkey(id, full_name)
    `)
    .eq("id", entryId)
    .eq("project_id", id)
    .single();

  if (entryError || !entry) {
    notFound();
  }

  // Fetch labor entries
  const { data: laborEntries } = await supabase
    .from("diary_labor_entries")
    .select(`
      *,
      company:companies(id, name)
    `)
    .eq("diary_entry_id", entryId)
    .order("created_at");

  // Fetch equipment entries
  const { data: equipmentEntries } = await supabase
    .from("diary_equipment_entries")
    .select(`
      *,
      company:companies(id, name)
    `)
    .eq("diary_entry_id", entryId)
    .order("created_at");

  // Fetch visitors
  const { data: visitors } = await supabase
    .from("diary_visitors")
    .select("*")
    .eq("diary_entry_id", entryId)
    .order("time_in");

  // Fetch companies for dropdowns
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name")
    .order("name");

  return (
    <DiaryEntryDetail
      project={project}
      entry={entry}
      laborEntries={laborEntries ?? []}
      equipmentEntries={equipmentEntries ?? []}
      visitors={visitors ?? []}
      companies={companies ?? []}
    />
  );
}
