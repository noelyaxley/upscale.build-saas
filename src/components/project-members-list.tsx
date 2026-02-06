"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import { useOrganisation } from "@/lib/context/organisation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddProjectMemberDialog } from "@/components/add-project-member-dialog";

type Profile = Tables<"profiles">;
type ProjectMember = Tables<"project_members">;

interface MemberWithProfile extends ProjectMember {
  profiles: Profile;
}

const roleColors: Record<string, string> = {
  manager: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  member: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  viewer: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

const roleLabels: Record<string, string> = {
  manager: "Project Manager",
  member: "Team Member",
  viewer: "Viewer",
};

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface ProjectMembersListProps {
  projectId: string;
  members: MemberWithProfile[];
}

export function ProjectMembersList({
  projectId,
  members,
}: ProjectMembersListProps) {
  const { isAdmin, profile } = useOrganisation();
  const router = useRouter();
  const supabase = createClient();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const existingMemberIds = members.map((m) => m.user_id);

  const handleRemove = async (memberId: string) => {
    setRemovingId(memberId);
    try {
      await supabase.from("project_members").delete().eq("id", memberId);
      router.refresh();
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="size-4 text-muted-foreground" />
            Team Members
          </CardTitle>
          <CardDescription>
            {members.length} member{members.length !== 1 ? "s" : ""} assigned
          </CardDescription>
        </div>
        {isAdmin && (
          <AddProjectMemberDialog
            projectId={projectId}
            existingMemberIds={existingMemberIds}
          />
        )}
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No team members assigned to this project yet.
          </p>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarImage
                      src={member.profiles.avatar_url ?? undefined}
                    />
                    <AvatarFallback className="text-xs">
                      {getInitials(member.profiles.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {member.profiles.full_name || "Unnamed User"}
                      {member.user_id === profile.id && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (You)
                        </span>
                      )}
                    </p>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${roleColors[member.role] ?? roleColors.member}`}
                    >
                      {roleLabels[member.role] ?? member.role}
                    </Badge>
                  </div>
                </div>
                {isAdmin && member.user_id !== profile.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemove(member.id)}
                    disabled={removingId === member.id}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
