"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CheckCircle,
  Circle,
  Clock,
  Plus,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Tables, Database } from "@/lib/supabase/database.types";
import { useOrganisation } from "@/lib/context/organisation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type ActionStatus = Database["public"]["Enums"]["action_status"];

type ActionItem = Tables<"action_items"> & {
  assigned_to: { id: string; full_name: string | null } | null;
  created_by: { id: string; full_name: string | null } | null;
};

type TeamMember = {
  id: string;
  full_name: string | null;
};

interface ProjectActionItemsProps {
  projectId: string;
  actionItems: ActionItem[];
  teamMembers: TeamMember[];
}

function formatDate(date: string | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  });
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

export function ProjectActionItems({
  projectId,
  actionItems,
  teamMembers,
}: ProjectActionItemsProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { organisation, profile, isAdmin } = useOrganisation();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    description: "",
    assignedTo: "",
    dueDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from("action_items").insert({
        org_id: organisation.id,
        project_id: projectId,
        description: formData.description,
        assigned_to_user_id: formData.assignedTo || null,
        due_date: formData.dueDate || null,
        created_by_user_id: profile.id,
      });

      if (insertError) throw insertError;

      setOpen(false);
      setFormData({
        description: "",
        assignedTo: "",
        dueDate: "",
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create action item");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (item: ActionItem) => {
    try {
      const newStatus: ActionStatus = item.status === "pending" ? "completed" : "pending";
      const updates: {
        status: ActionStatus;
        completed_at?: string | null;
      } = { status: newStatus };

      if (newStatus === "completed") {
        updates.completed_at = new Date().toISOString();
      } else {
        updates.completed_at = null;
      }

      const { error } = await supabase
        .from("action_items")
        .update(updates)
        .eq("id", item.id);

      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error("Failed to update action item:", err);
    }
  };

  const pendingItems = actionItems.filter((item) => item.status === "pending");
  const completedItems = actionItems.filter((item) => item.status === "completed");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Action Items</CardTitle>
            <CardDescription>
              {pendingItems.length} pending, {completedItems.length} completed
            </CardDescription>
          </div>
          {isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="mr-2 size-4" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Add Action Item</DialogTitle>
                    <DialogDescription>
                      Create a task to track important follow-ups
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="action-desc" className="text-right pt-2">
                        Task
                      </Label>
                      <Textarea
                        id="action-desc"
                        placeholder="Describe the action item..."
                        className="col-span-3"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="action-assignee" className="text-right">
                        Assign To
                      </Label>
                      <Select
                        value={formData.assignedTo}
                        onValueChange={(value) =>
                          setFormData({ ...formData, assignedTo: value })
                        }
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select team member" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.full_name || "Unknown"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="action-due" className="text-right">
                        Due Date
                      </Label>
                      <Input
                        id="action-due"
                        type="date"
                        className="col-span-3"
                        value={formData.dueDate}
                        onChange={(e) =>
                          setFormData({ ...formData, dueDate: e.target.value })
                        }
                      />
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Creating..." : "Add Item"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {actionItems.length === 0 ? (
          <div className="py-6 text-center">
            <Clock className="mx-auto size-10 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">No action items</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <button
                  onClick={() => handleToggleStatus(item)}
                  className="mt-0.5 text-muted-foreground hover:text-primary"
                >
                  <Circle className="size-5" />
                </button>
                <div className="flex-1 space-y-1">
                  <p className="text-sm">{item.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {item.assigned_to && (
                      <div className="flex items-center gap-1">
                        <Avatar className="size-4">
                          <AvatarFallback className="text-[8px]">
                            {getInitials(item.assigned_to.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{item.assigned_to.full_name}</span>
                      </div>
                    )}
                    {item.due_date && (
                      <div
                        className={`flex items-center gap-1 ${
                          isOverdue(item.due_date) ? "text-red-500" : ""
                        }`}
                      >
                        <Calendar className="size-3" />
                        <span>{formatDate(item.due_date)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {completedItems.length > 0 && (
              <>
                <div className="pt-2 text-xs font-medium text-muted-foreground">
                  Completed
                </div>
                {completedItems.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-lg border p-3 opacity-60"
                  >
                    <button
                      onClick={() => handleToggleStatus(item)}
                      className="mt-0.5 text-green-500 hover:text-muted-foreground"
                    >
                      <CheckCircle className="size-5" />
                    </button>
                    <div className="flex-1">
                      <p className="text-sm line-through">{item.description}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
