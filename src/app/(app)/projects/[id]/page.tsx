import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProjectDetail } from "./project-detail";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project, error } = await supabase
    .from("projects")
    .select("*, client_company:companies(*)")
    .eq("id", id)
    .single();

  if (error || !project) {
    notFound();
  }

  const { data: members } = await supabase
    .from("project_members")
    .select("*, profiles(*)")
    .eq("project_id", id)
    .order("role")
    .order("created_at");

  return (
    <ProjectDetail
      project={project}
      clientCompany={project.client_company}
      members={members ?? []}
    />
  );
}
