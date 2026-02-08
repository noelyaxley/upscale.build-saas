import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken, deleteEntry } from "@/lib/dropbox";

export async function POST(request: Request) {
  const { projectId, entries } = (await request.json()) as {
    projectId: string;
    entries: string[];
  };

  if (!projectId || !entries?.length) {
    return NextResponse.json(
      { error: "projectId and entries are required" },
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

    let deleted = 0;
    for (const path of entries) {
      await deleteEntry(accessToken, path);
      deleted++;
    }

    return NextResponse.json({ deleted });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to delete";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
