"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HardHat } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function OnboardingPage() {
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to create an organisation.");
        setLoading(false);
        return;
      }

      // Create the organisation
      const { data: org, error: orgError } = await supabase
        .from("organisations")
        .insert({ name: orgName })
        .select()
        .single();

      if (orgError) {
        throw orgError;
      }

      // Update the user's profile with org_id and admin role
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ org_id: org.id, role: "admin" })
        .eq("id", user.id);

      if (profileError) {
        throw profileError;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <HardHat className="size-6 text-primary" />
          </div>
          <CardTitle>Create your organisation</CardTitle>
          <CardDescription>
            Set up your organisation to start managing construction projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organisation name</Label>
              <Input
                id="orgName"
                type="text"
                placeholder="Acme Construction"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                minLength={2}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Organisation"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
