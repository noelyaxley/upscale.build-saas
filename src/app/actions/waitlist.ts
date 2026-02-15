"use server";

import { createServiceClient } from "@/lib/supabase/service";

export async function joinWaitlist(email: string) {
  const trimmed = email.trim().toLowerCase();

  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { error: "Please enter a valid email address." };
  }

  const supabase = createServiceClient();

  const { error } = await supabase
    .from("waitlist_signups" as any)
    .insert({ email: trimmed });

  if (error) {
    if (error.code === "23505") {
      // Unique constraint — already signed up
      return { success: true, alreadyExists: true };
    }
    return { error: "Something went wrong. Please try again." };
  }

  return { success: true };
}
