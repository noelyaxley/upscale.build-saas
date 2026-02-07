import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken, uploadFile } from "@/lib/dropbox";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const projectId = formData.get("projectId") as string | null;
  const subfolder = (formData.get("subfolder") as string) || "";

  if (!file || !projectId) {
    return NextResponse.json(
      { error: "file and projectId are required" },
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
    return NextResponse.json({ error: "No Dropbox folder linked" }, { status: 404 });
  }

  try {
    const accessToken = await getValidAccessToken(connection);
    const basePath = subfolder
      ? `${connection.dropbox_folder_path}/${subfolder}`
      : connection.dropbox_folder_path;
    const uploadPath = `${basePath}/${file.name}`;

    const arrayBuffer = await file.arrayBuffer();

    const entry = await uploadFile(accessToken, uploadPath, arrayBuffer);
    return NextResponse.json({ entry });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to upload file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
