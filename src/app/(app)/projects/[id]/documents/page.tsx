import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocumentsView } from "./documents-view";

interface DocumentsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ folder?: string; dropbox?: string }>;
}

export default async function DocumentsPage({ params, searchParams }: DocumentsPageProps) {
  const { id } = await params;
  const { folder: folderId, dropbox: dropboxParam } = await searchParams;
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

  // Fetch documents for current folder (or root if no folder)
  const documentsQuery = supabase
    .from("documents")
    .select("*, uploaded_by:profiles(full_name)")
    .eq("project_id", id)
    .order("title");

  if (folderId) {
    documentsQuery.eq("folder_id", folderId);
  } else {
    documentsQuery.is("folder_id", null);
  }

  const { data: documents } = await documentsQuery;

  let breadcrumbs: { id: string | null; name: string }[] = [{ id: null, name: "Documents" }];

  if (folderId) {
    const { data: folder } = await supabase
      .from("document_folders")
      .select("*")
      .eq("id", folderId)
      .single();

    // Build breadcrumb path
    if (folder) {
      const path: { id: string | null; name: string }[] = [];
      let current = folder;

      while (current) {
        path.unshift({ id: current.id, name: current.name });
        if (current.parent_folder_id) {
          const { data: parent } = await supabase
            .from("document_folders")
            .select("*")
            .eq("id", current.parent_folder_id)
            .single();
          current = parent;
        } else {
          break;
        }
      }

      breadcrumbs = [{ id: null, name: "Documents" }, ...path];
    }
  }

  // Get subfolders of current folder
  const subfoldersQuery = supabase
    .from("document_folders")
    .select("*")
    .eq("project_id", id)
    .order("name");

  if (folderId) {
    subfoldersQuery.eq("parent_folder_id", folderId);
  } else {
    subfoldersQuery.is("parent_folder_id", null);
  }

  const { data: subfolders } = await subfoldersQuery;

  // Fetch Dropbox connection for this project
  const { data: dropboxConnection } = await supabase
    .from("dropbox_connections")
    .select("id, project_id, dropbox_folder_id, dropbox_folder_path")
    .eq("project_id", id)
    .maybeSingle();

  return (
    <DocumentsView
      project={project}
      folders={subfolders ?? []}
      documents={documents ?? []}
      currentFolderId={folderId ?? null}
      breadcrumbs={breadcrumbs}
      dropboxConnection={dropboxConnection}
      dropboxJustConnected={dropboxParam === "connected"}
    />
  );
}
