import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken, moveEntry } from "@/lib/dropbox";

export async function POST(request: Request) {
  const { projectId, entries, destinationFolder } = (await request.json()) as {
    projectId: string;
    entries: string[];
    destinationFolder: string;
  };

  if (!projectId || !entries?.length || !destinationFolder) {
    return NextResponse.json(
      { error: "projectId, entries, and destinationFolder are required" },
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

    let moved = 0;
    for (const fromPath of entries) {
      const fileName = fromPath.substring(fromPath.lastIndexOf("/") + 1);
      const toPath = `${destinationFolder}/${fileName}`;
      await moveEntry(accessToken, fromPath, toPath);
      moved++;
    }

    return NextResponse.json({ moved });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to move files";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
