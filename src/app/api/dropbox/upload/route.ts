import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken, uploadFile } from "@/lib/dropbox";

const MAX_TOTAL_SIZE = 250 * 1024 * 1024; // 250MB

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("files") as File[];
  // Backwards-compatible: also accept single "file" key
  const singleFile = formData.get("file") as File | null;
  if (singleFile && files.length === 0) {
    files.push(singleFile);
  }
  const projectId = formData.get("projectId") as string | null;
  const subfolder = (formData.get("subfolder") as string) || "";

  if (files.length === 0 || !projectId) {
    return NextResponse.json(
      { error: "At least one file and projectId are required" },
      { status: 400 }
    );
  }

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  if (totalSize > MAX_TOTAL_SIZE) {
    return NextResponse.json(
      { error: "Total upload size exceeds 250MB limit" },
      { status: 413 }
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

    const entries = [];
    for (const file of files) {
      const uploadPath = `${basePath}/${file.name}`;
      const arrayBuffer = await file.arrayBuffer();
      const entry = await uploadFile(accessToken, uploadPath, arrayBuffer);
      entries.push(entry);
    }

    return NextResponse.json({ entries });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to upload files";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
