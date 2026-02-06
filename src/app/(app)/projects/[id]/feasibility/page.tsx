import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FeasibilityView } from "./feasibility-view";

interface FeasibilityPageProps {
  params: Promise<{ id: string }>;
}

export default async function FeasibilityPage({
  params,
}: FeasibilityPageProps) {
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

  // Fetch scenarios
  const { data: scenarios } = await supabase
    .from("feasibility_scenarios")
    .select("*")
    .eq("project_id", id)
    .order("updated_at", { ascending: false });

  return (
    <FeasibilityView project={project} scenarios={scenarios ?? []} />
  );
}
