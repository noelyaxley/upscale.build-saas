"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useOrganisation } from "@/lib/context/organisation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function SettingsForm() {
  const { profile, organisation, isAdmin } = useOrganisation();
  const router = useRouter();
  const supabase = createClient();

  const [profileData, setProfileData] = useState({
    full_name: profile.full_name || "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [orgData, setOrgData] = useState({
    name: organisation.name,
  });
  const [orgLoading, setOrgLoading] = useState(false);
  const [orgError, setOrgError] = useState<string | null>(null);
  const [orgSuccess, setOrgSuccess] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: profileData.full_name || null })
        .eq("id", profile.id);

      if (error) throw error;

      setProfileSuccess(true);
      router.refresh();
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : "Failed to update profile"
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handleOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrgLoading(true);
    setOrgError(null);
    setOrgSuccess(false);

    try {
      const { error } = await supabase
        .from("organisations")
        .update({ name: orgData.name })
        .eq("id", organisation.id);

      if (error) throw error;

      setOrgSuccess(true);
      router.refresh();
    } catch (err) {
      setOrgError(
        err instanceof Error ? err.message : "Failed to update organisation"
      );
    } finally {
      setOrgLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and organisation settings
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <form onSubmit={handleProfileSubmit}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="size-5 text-muted-foreground" />
                <div>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Your personal information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="size-16">
                  <AvatarImage src={profile.avatar_url ?? undefined} />
                  <AvatarFallback className="text-lg">
                    {getInitials(profile.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Avatar management coming soon
                  </p>
                </div>
              </div>
              <Separator />
              <div className="grid gap-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profileData.full_name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, full_name: e.target.value })
                  }
                  placeholder="Enter your full name"
                />
              </div>
              {profileError && (
                <p className="text-sm text-destructive">{profileError}</p>
              )}
              {profileSuccess && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  Profile updated successfully
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={profileLoading}>
                {profileLoading ? "Saving..." : "Save Profile"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {isAdmin && (
          <Card>
            <form onSubmit={handleOrgSubmit}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building2 className="size-5 text-muted-foreground" />
                  <div>
                    <CardTitle>Organisation</CardTitle>
                    <CardDescription>
                      Settings for your organisation
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="org_name">Organisation Name</Label>
                  <Input
                    id="org_name"
                    value={orgData.name}
                    onChange={(e) =>
                      setOrgData({ ...orgData, name: e.target.value })
                    }
                    placeholder="Enter organisation name"
                    required
                  />
                </div>
                {orgError && (
                  <p className="text-sm text-destructive">{orgError}</p>
                )}
                {orgSuccess && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Organisation updated successfully
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={orgLoading}>
                  {orgLoading ? "Saving..." : "Save Organisation"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
