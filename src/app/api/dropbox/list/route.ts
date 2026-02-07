import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken, listFolder, getTemporaryLink } from "@/lib/dropbox";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const subpath = searchParams.get("subpath") || "";

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { data: connection } = await supabase
    .from("dropbox_connections")
    .select("*")
    .eq("project_id", projectId)
    .single();

  if (!connection || !connection.dropbox_folder_path) {
    return NextResponse.json({ error: "No Dropbox folder linked" }, { status: 404 });
  }

  try {
    const accessToken = await getValidAccessToken(connection);
    const browsePath = subpath
      ? `${connection.dropbox_folder_path}/${subpath}`
      : connection.dropbox_folder_path;

    const entries = await listFolder(accessToken, browsePath);

    // Get temporary links for files
    const entriesWithLinks = await Promise.all(
      entries.map(async (entry) => {
        if (entry[".tag"] === "file") {
          try {
            const link = await getTemporaryLink(accessToken, entry.path_lower);
            return { ...entry, temporary_link: link };
          } catch {
            return { ...entry, temporary_link: null };
          }
        }
        return entry;
      })
    );

    return NextResponse.json({ entries: entriesWithLinks });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list files";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
