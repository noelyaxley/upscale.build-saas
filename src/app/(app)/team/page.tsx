import { createClient } from "@/lib/supabase/server";
import { TeamList } from "./team-list";

export default async function TeamPage() {
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("profiles")
    .select("*")
    .order("role", { ascending: true })
    .order("full_name", { ascending: true });

  return <TeamList members={members ?? []} />;
}
