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
import { getErrorMessage } from "@/lib/utils";

interface CreateTenderDialogProps {
  projectId: string;
  children: ReactNode;
}

export function CreateTenderDialog({
  projectId,
  children,
}: CreateTenderDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { organisation, profile } = useOrganisation();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    title: "",
    trade: "",
    description: "",
    estimatedValue: "",
    dueDate: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const estimatedCents = formData.estimatedValue
        ? Math.round(parseFloat(formData.estimatedValue) * 100)
        : 0;

      const { error: insertError } = await supabase.from("tenders").insert({
        org_id: organisation.id,
        project_id: projectId,
        title: formData.title,
        trade: formData.trade,
        description: formData.description || null,
        estimated_value: estimatedCents,
        due_date: formData.dueDate || null,
        notes: formData.notes || null,
        created_by_user_id: profile.id,
      });

      if (insertError) throw insertError;

      setOpen(false);
      setFormData({
        title: "",
        trade: "",
        description: "",
        estimatedValue: "",
        dueDate: "",
        notes: "",
      });
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create tender"));
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
            <DialogTitle>New Tender</DialogTitle>
            <DialogDescription>
              Create a tender package to invite contractor bids
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tender-title" className="text-right">
                Title
              </Label>
              <Input
                id="tender-title"
                placeholder="e.g. Structural Steel Package"
                className="col-span-3"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tender-trade" className="text-right">
                Trade
              </Label>
              <Input
                id="tender-trade"
                placeholder="e.g. Structural, Electrical, Plumbing"
                className="col-span-3"
                value={formData.trade}
                onChange={(e) =>
                  setFormData({ ...formData, trade: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="tender-desc" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="tender-desc"
                placeholder="Scope of work and requirements..."
                className="col-span-3"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tender-value" className="text-right">
                Estimated ($)
              </Label>
              <Input
                id="tender-value"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="col-span-3"
                value={formData.estimatedValue}
                onChange={(e) =>
                  setFormData({ ...formData, estimatedValue: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tender-due" className="text-right">
                Due Date
              </Label>
              <Input
                id="tender-due"
                type="date"
                className="col-span-3"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="tender-notes" className="text-right pt-2">
                Notes
              </Label>
              <Textarea
                id="tender-notes"
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
              {loading ? "Creating..." : "Create Tender"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
