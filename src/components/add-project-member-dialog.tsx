"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Profile = Tables<"profiles">;

const memberRoles = [
  { value: "manager", label: "Project Manager" },
  { value: "member", label: "Team Member" },
  { value: "viewer", label: "Viewer" },
];

interface AddProjectMemberDialogProps {
  projectId: string;
  existingMemberIds: string[];
  children?: ReactNode;
}

export function AddProjectMemberDialog({
  projectId,
  existingMemberIds,
  children,
}: AddProjectMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = useState<Profile[]>([]);
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    user_id: "",
    role: "member",
  });

  useEffect(() => {
    if (open) {
      supabase
        .from("profiles")
        .select("*")
        .order("full_name")
        .then(({ data }) => {
          if (data) {
            const filtered = data.filter(
              (user) => !existingMemberIds.includes(user.id)
            );
            setAvailableUsers(filtered);
          }
        });
    }
  }, [open, supabase, existingMemberIds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.user_id) return;

    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from("project_members")
        .insert({
          project_id: projectId,
          user_id: formData.user_id,
          role: formData.role,
        });

      if (insertError) {
        if (insertError.code === "23505") {
          throw new Error("This user is already a member of the project");
        }
        throw insertError;
      }

      setOpen(false);
      setFormData({ user_id: "", role: "member" });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="outline" size="sm">
            <UserPlus className="mr-2 size-4" />
            Add Member
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add team member</DialogTitle>
            <DialogDescription>
              Add a member from your organisation to this project
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="member-user" className="text-right">
                User
              </Label>
              <Select
                value={formData.user_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, user_id: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.length === 0 ? (
                    <SelectItem value="_none" disabled>
                      No available users
                    </SelectItem>
                  ) : (
                    availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name || "Unnamed User"}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="member-role" className="text-right">
                Role
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {memberRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && (
              <p className="col-span-4 text-sm text-destructive">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.user_id}
            >
              {loading ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
