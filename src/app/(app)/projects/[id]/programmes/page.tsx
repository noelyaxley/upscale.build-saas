import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProgrammesView } from "./programmes-view";

interface ProgrammesPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProgrammesPage({ params }: ProgrammesPageProps) {
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

  // Fetch programme tasks
  const { data: tasks } = await supabase
    .from("programme_tasks")
    .select("*")
    .eq("project_id", id)
    .order("sort_order", { ascending: true });

  // Fetch programme dependencies for this project's tasks
  const { data: dependencies } = await supabase
    .from("programme_dependencies")
    .select("*")
    .in(
      "predecessor_id",
      (tasks ?? []).map((t) => t.id)
    );

  return (
    <ProgrammesView
      project={project}
      tasks={tasks ?? []}
      dependencies={dependencies ?? []}
    />
  );
}
