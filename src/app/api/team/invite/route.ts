import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: Request) {
  const { email, fullName, role, orgId } = await request.json();

  if (!email || !orgId) {
    return NextResponse.json(
      { error: "Email and organisation are required" },
      { status: 400 }
    );
  }

  if (role && !["admin", "user"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Server configuration error: service role key is not set" },
      { status: 500 }
    );
  }

  // Verify the caller is an authenticated admin in this org
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("org_id, role")
    .eq("id", user.id)
    .single();

  if (!callerProfile || callerProfile.role !== "admin" || callerProfile.org_id !== orgId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Use service role client to create the invite (bypasses RLS)
  const serviceClient = createServiceClient();

  const { data: inviteData, error: inviteError } =
    await serviceClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${new URL(request.url).origin}/auth/callback`,
    });

  if (inviteError) {
    return NextResponse.json(
      { error: inviteError.message },
      { status: 400 }
    );
  }

  // Update the newly created profile with org_id, role, and full_name.
  // The auto-trigger creates the profile row on auth.users insert, but it
  // may not have fired yet — retry a few times with a short delay.
  if (inviteData.user) {
    const updates: Record<string, string> = {
      org_id: orgId,
      role: role || "user",
    };
    if (fullName) {
      updates.full_name = fullName;
    }

    let updateError = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const { error } = await serviceClient
        .from("profiles")
        .update(updates)
        .eq("id", inviteData.user.id);

      if (!error) {
        updateError = null;
        break;
      }
      updateError = error;
      await new Promise((r) => setTimeout(r, 500));
    }

    if (updateError) {
      return NextResponse.json(
        { error: "User invited but failed to set profile: " + updateError.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: true });
}
