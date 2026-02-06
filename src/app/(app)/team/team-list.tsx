"use client";

import { useState } from "react";
import { Crown, Shield, User } from "lucide-react";
import type { Tables } from "@/lib/supabase/database.types";
import { useOrganisation } from "@/lib/context/organisation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InviteMemberDialog } from "@/components/invite-member-dialog";
import { EditMemberDialog } from "@/components/edit-member-dialog";

type Profile = Tables<"profiles">;

const roleConfig: Record<string, { label: string; icon: typeof Crown; className: string }> = {
  admin: {
    label: "Admin",
    icon: Crown,
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  },
  user: {
    label: "Member",
    icon: User,
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
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

interface TeamListProps {
  members: Profile[];
}

export function TeamList({ members }: TeamListProps) {
  const { isAdmin, profile } = useOrganisation();
  const [editingMember, setEditingMember] = useState<Profile | null>(null);

  const admins = members.filter((m) => m.role === "admin");
  const users = members.filter((m) => m.role === "user");

  const canEditMember = (member: Profile) =>
    isAdmin || member.id === profile.id;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">
            Manage your organisation members
          </p>
        </div>
        <InviteMemberDialog />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="size-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold">
            Administrators ({admins.length})
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {admins.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              isCurrentUser={member.id === profile.id}
              onClick={
                canEditMember(member)
                  ? () => setEditingMember(member)
                  : undefined
              }
            />
          ))}
        </div>
      </div>

      {users.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="size-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Members ({users.length})</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                isCurrentUser={member.id === profile.id}
                onClick={
                  canEditMember(member)
                    ? () => setEditingMember(member)
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      )}

      {members.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No team members</CardTitle>
            <CardDescription>
              Your team doesn&apos;t have any members yet.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {editingMember && (
        <EditMemberDialog
          member={editingMember}
          open={!!editingMember}
          onOpenChange={(open) => {
            if (!open) setEditingMember(null);
          }}
        />
      )}
    </div>
  );
}

interface MemberCardProps {
  member: Profile;
  isCurrentUser: boolean;
  onClick?: () => void;
}

function MemberCard({ member, isCurrentUser, onClick }: MemberCardProps) {
  const config = roleConfig[member.role] ?? roleConfig.user;
  const Icon = config.icon;

  return (
    <Card
      className={onClick ? "cursor-pointer transition-colors hover:bg-muted/50" : undefined}
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-4 py-4">
        <Avatar className="size-12">
          <AvatarImage src={member.avatar_url ?? undefined} />
          <AvatarFallback>{getInitials(member.full_name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">
              {member.full_name || "Unnamed User"}
            </p>
            {isCurrentUser && (
              <Badge variant="outline" className="text-xs">
                You
              </Badge>
            )}
          </div>
          <Badge variant="secondary" className={config.className}>
            <Icon className="mr-1 size-3" />
            {config.label}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
