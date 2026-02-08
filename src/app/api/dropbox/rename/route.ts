import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken, moveEntry } from "@/lib/dropbox";

export async function POST(request: Request) {
  const { projectId, fromPath, newName } = await request.json();

  if (!projectId || !fromPath || !newName) {
    return NextResponse.json(
      { error: "projectId, fromPath, and newName are required" },
      { status: 400 }
    );
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
    return NextResponse.json(
      { error: "No Dropbox folder linked" },
      { status: 404 }
    );
  }

  try {
    const accessToken = await getValidAccessToken(connection);
    // Replace last path segment with new name
    const parentPath = fromPath.substring(0, fromPath.lastIndexOf("/"));
    const toPath = `${parentPath}/${newName}`;

    const entry = await moveEntry(accessToken, fromPath, toPath);
    return NextResponse.json({ entry });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to rename";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
