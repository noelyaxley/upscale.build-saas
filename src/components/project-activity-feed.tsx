"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Flag,
  MessageSquare,
  Plus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Tables, Database } from "@/lib/supabase/database.types";
import { useOrganisation } from "@/lib/context/organisation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

type UpdateType = Database["public"]["Enums"]["update_type"];
type UpdateVisibility = Database["public"]["Enums"]["update_visibility"];

type ProjectUpdate = Tables<"project_updates"> & {
  created_by: { id: string; full_name: string | null } | null;
};

interface ProjectActivityFeedProps {
  projectId: string;
  updates: ProjectUpdate[];
}

const typeIcons: Record<UpdateType, React.ComponentType<{ className?: string }>> = {
  milestone: Flag,
  progress: CheckCircle,
  issue: AlertCircle,
  general: MessageSquare,
};

const typeColors: Record<UpdateType, string> = {
  milestone: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  progress: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  issue: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  general: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
};

const typeLabels: Record<UpdateType, string> = {
  milestone: "Milestone",
  progress: "Progress",
  issue: "Issue",
  general: "General",
};

const visibilityLabels: Record<UpdateVisibility, string> = {
  internal: "Internal",
  client: "Client Visible",
};

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

export function ProjectActivityFeed({ projectId, updates }: ProjectActivityFeedProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { organisation, profile, isAdmin } = useOrganisation();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    updateType: "general" as UpdateType,
    visibility: "internal" as UpdateVisibility,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from("project_updates").insert({
        org_id: organisation.id,
        project_id: projectId,
        title: formData.title,
        description: formData.description || null,
        update_type: formData.updateType,
        visibility: formData.visibility,
        created_by_user_id: profile.id,
      });

      if (insertError) throw insertError;

      setOpen(false);
      setFormData({
        title: "",
        description: "",
        updateType: "general",
        visibility: "internal",
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Activity Feed</CardTitle>
            <CardDescription>Recent project updates and milestones</CardDescription>
          </div>
          {isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 size-4" />
                  Post Update
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Post Project Update</DialogTitle>
                    <DialogDescription>
                      Share progress, milestones, or issues with the team
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="update-type" className="text-right">
                        Type
                      </Label>
                      <Select
                        value={formData.updateType}
                        onValueChange={(value) =>
                          setFormData({ ...formData, updateType: value as UpdateType })
                        }
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Update</SelectItem>
                          <SelectItem value="progress">Progress Update</SelectItem>
                          <SelectItem value="milestone">Milestone</SelectItem>
                          <SelectItem value="issue">Issue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="update-title" className="text-right">
                        Title
                      </Label>
                      <Input
                        id="update-title"
                        placeholder="Update title"
                        className="col-span-3"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="update-desc" className="text-right pt-2">
                        Details
                      </Label>
                      <Textarea
                        id="update-desc"
                        placeholder="Add details..."
                        className="col-span-3"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="visibility" className="text-right">
                        Visibility
                      </Label>
                      <Select
                        value={formData.visibility}
                        onValueChange={(value) =>
                          setFormData({ ...formData, visibility: value as UpdateVisibility })
                        }
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="internal">Internal Only</SelectItem>
                          <SelectItem value="client">Client Visible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Posting..." : "Post Update"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {updates.length === 0 ? (
          <div className="py-8 text-center">
            <Clock className="mx-auto size-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">No updates yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Post updates to keep the team informed
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {updates.map((update) => {
              const Icon = typeIcons[update.update_type];
              return (
                <div key={update.id} className="flex gap-4">
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${typeColors[update.update_type]}`}>
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{update.title}</p>
                      <Badge variant="outline" className="text-xs">
                        {typeLabels[update.update_type]}
                      </Badge>
                      {update.visibility === "client" && (
                        <Badge variant="secondary" className="text-xs">
                          {visibilityLabels[update.visibility]}
                        </Badge>
                      )}
                    </div>
                    {update.description && (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {update.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Avatar className="size-5">
                        <AvatarFallback className="text-[10px]">
                          {getInitials(update.created_by?.full_name ?? null)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{update.created_by?.full_name || "Unknown"}</span>
                      <span>•</span>
                      <span>{formatDate(update.created_at)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
