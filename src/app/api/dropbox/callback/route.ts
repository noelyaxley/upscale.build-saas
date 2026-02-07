import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { exchangeCodeForTokens, encryptToken } from "@/lib/dropbox";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");
  const errorParam = searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?dropbox_error=${encodeURIComponent(errorParam)}`
    );
  }

  if (!code || !stateParam) {
    return NextResponse.json(
      { error: "Missing code or state parameter" },
      { status: 400 }
    );
  }

  let state: { projectId: string; userId: string; orgId: string };
  try {
    state = JSON.parse(Buffer.from(stateParam, "base64").toString("utf8"));
  } catch {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  try {
    const tokens = await exchangeCodeForTokens(code);

    const serviceClient = createServiceClient();
    const { error: upsertError } = await serviceClient
      .from("dropbox_connections")
      .upsert(
        {
          org_id: state.orgId,
          project_id: state.projectId,
          access_token_encrypted: encryptToken(tokens.access_token),
          refresh_token_encrypted: encryptToken(tokens.refresh_token),
          token_expires_at: new Date(
            Date.now() + tokens.expires_in * 1000
          ).toISOString(),
          dropbox_account_id: tokens.account_id,
          connected_by_user_id: state.userId,
        },
        { onConflict: "project_id" }
      );

    if (upsertError) {
      throw upsertError;
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/projects/${state.projectId}/documents?dropbox=connected`
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Token exchange failed";
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/projects/${state.projectId}/documents?dropbox_error=${encodeURIComponent(message)}`
    );
  }
}
