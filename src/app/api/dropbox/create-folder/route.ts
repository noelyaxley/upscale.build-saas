import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken, createFolder } from "@/lib/dropbox";

export async function POST(request: Request) {
  const { projectId, subfolder, folderName } = await request.json();

  if (!projectId || !folderName) {
    return NextResponse.json(
      { error: "projectId and folderName are required" },
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
    const basePath = subfolder
      ? `${connection.dropbox_folder_path}/${subfolder}`
      : connection.dropbox_folder_path;
    const folderPath = `${basePath}/${folderName}`;

    const entry = await createFolder(accessToken, folderPath);
    return NextResponse.json({ entry });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create folder";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
