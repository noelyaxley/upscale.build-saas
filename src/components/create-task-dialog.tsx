"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useOrganisation } from "@/lib/context/organisation";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProgrammeTask } from "@/app/(app)/projects/[id]/programmes/gantt-utils";
import { getErrorMessage } from "@/lib/utils";

interface CreateTaskDialogProps {
  projectId: string;
  tasks: ProgrammeTask[];
  dependencies: { predecessor_id: string; successor_id: string; lag_days: number }[];
  children: ReactNode;
}

export function CreateTaskDialog({
  projectId,
  tasks,
  dependencies,
  children,
}: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { organisation, profile } = useOrganisation();
  const supabase = createClient();

  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    name: "",
    startDate: today,
    endDate: today,
    parentId: "",
    predecessorId: "",
    lagDays: "0",
    progress: "0",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const maxSort = tasks
        .filter((t) => t.parent_id === (formData.parentId || null))
        .reduce((max, t) => Math.max(max, t.sort_order), -1);

      const { data: insertedTask, error: insertError } = await supabase
        .from("programme_tasks")
        .insert({
          org_id: organisation.id,
          project_id: projectId,
          name: formData.name,
          start_date: formData.startDate,
          end_date: formData.endDate,
          parent_id: formData.parentId || null,
          progress: parseInt(formData.progress) || 0,
          notes: formData.notes || null,
          sort_order: maxSort + 1,
          created_by_user_id: profile.id,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      // Create dependency if predecessor selected
      if (formData.predecessorId && insertedTask) {
        const { error: depError } = await supabase
          .from("programme_dependencies")
          .insert({
            predecessor_id: formData.predecessorId,
            successor_id: insertedTask.id,
            lag_days: parseInt(formData.lagDays) || 0,
          });
        if (depError) throw depError;
      }

      setOpen(false);
      setFormData({
        name: "",
        startDate: today,
        endDate: today,
        parentId: "",
        predecessorId: "",
        lagDays: "0",
        progress: "0",
        notes: "",
      });
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create task"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Programme Task</DialogTitle>
            <DialogDescription>
              Add a task to the programme schedule
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task-name" className="text-right">
                Name
              </Label>
              <Input
                id="task-name"
                placeholder="e.g. Foundation Works"
                className="col-span-3"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task-start" className="text-right">
                Start Date
              </Label>
              <Input
                id="task-start"
                type="date"
                className="col-span-3"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task-end" className="text-right">
                End Date
              </Label>
              <Input
                id="task-end"
                type="date"
                className="col-span-3"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                min={formData.startDate}
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task-parent" className="text-right">
                Parent Task
              </Label>
              <select
                id="task-parent"
                className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={formData.parentId}
                onChange={(e) =>
                  setFormData({ ...formData, parentId: e.target.value })
                }
              >
                <option value="">None (Top Level)</option>
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task-predecessor" className="text-right">
                Predecessor
              </Label>
              <select
                id="task-predecessor"
                className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={formData.predecessorId}
                onChange={(e) =>
                  setFormData({ ...formData, predecessorId: e.target.value })
                }
              >
                <option value="">None</option>
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.name}
                  </option>
                ))}
              </select>
            </div>

            {formData.predecessorId && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="task-lag" className="text-right">
                  Lag (days)
                </Label>
                <Input
                  id="task-lag"
                  type="number"
                  className="col-span-3"
                  value={formData.lagDays}
                  onChange={(e) =>
                    setFormData({ ...formData, lagDays: e.target.value })
                  }
                  placeholder="e.g. 3 or -2"
                />
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task-progress" className="text-right">
                Progress (%)
              </Label>
              <Input
                id="task-progress"
                type="number"
                min="0"
                max="100"
                className="col-span-3"
                value={formData.progress}
                onChange={(e) =>
                  setFormData({ ...formData, progress: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="task-notes" className="text-right pt-2">
                Notes
              </Label>
              <Textarea
                id="task-notes"
                placeholder="Additional notes..."
                className="col-span-3"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
