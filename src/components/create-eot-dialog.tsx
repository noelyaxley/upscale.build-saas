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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/utils";

type Company = {
  id: string;
  name: string;
};

interface CreateEotDialogProps {
  projectId: string;
  companies: Company[];
  originalCompletionDate: string | null;
  children: ReactNode;
}

export function CreateEotDialog({
  projectId,
  companies,
  originalCompletionDate,
  children,
}: CreateEotDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { organisation, profile } = useOrganisation();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reason: "",
    daysClaimed: "",
    delayStartDate: "",
    delayEndDate: "",
    submittedByCompanyId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from("extension_of_time")
        .insert({
          org_id: organisation.id,
          project_id: projectId,
          title: formData.title,
          description: formData.description || null,
          reason: formData.reason || null,
          days_claimed: parseInt(formData.daysClaimed) || 0,
          delay_start_date: formData.delayStartDate || null,
          delay_end_date: formData.delayEndDate || null,
          original_completion_date: originalCompletionDate,
          submitted_by_company_id: formData.submittedByCompanyId || null,
          created_by_user_id: profile.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setOpen(false);
      setFormData({
        title: "",
        description: "",
        reason: "",
        daysClaimed: "",
        delayStartDate: "",
        delayEndDate: "",
        submittedByCompanyId: "",
      });

      // Navigate to the new EOT detail page
      router.push(`/projects/${projectId}/eot/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create EOT"));
    } finally {
      setLoading(false);
    }
  };

  // Calculate days between dates
  const calculateDays = () => {
    if (formData.delayStartDate && formData.delayEndDate) {
      const start = new Date(formData.delayStartDate);
      const end = new Date(formData.delayEndDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays > 0) {
        setFormData({ ...formData, daysClaimed: String(diffDays) });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Extension of Time</DialogTitle>
            <DialogDescription>
              Submit a claim for extension of time due to delays
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="eot-title" className="text-right">
                Title
              </Label>
              <Input
                id="eot-title"
                placeholder="e.g., Weather delay - May 2024"
                className="col-span-3"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="eot-start" className="text-right">
                Delay Start
              </Label>
              <Input
                id="eot-start"
                type="date"
                className="col-span-3"
                value={formData.delayStartDate}
                onChange={(e) => {
                  setFormData({ ...formData, delayStartDate: e.target.value });
                }}
                onBlur={calculateDays}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="eot-end" className="text-right">
                Delay End
              </Label>
              <Input
                id="eot-end"
                type="date"
                className="col-span-3"
                value={formData.delayEndDate}
                onChange={(e) => {
                  setFormData({ ...formData, delayEndDate: e.target.value });
                }}
                onBlur={calculateDays}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="eot-days" className="text-right">
                Days Claimed
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="eot-days"
                  type="number"
                  min="1"
                  placeholder="0"
                  className="w-24"
                  value={formData.daysClaimed}
                  onChange={(e) =>
                    setFormData({ ...formData, daysClaimed: e.target.value })
                  }
                  required
                />
                <span className="text-sm text-muted-foreground">days</span>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="eot-company" className="text-right">
                Submitted By
              </Label>
              <Select
                value={formData.submittedByCompanyId}
                onValueChange={(value) =>
                  setFormData({ ...formData, submittedByCompanyId: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="eot-reason" className="text-right pt-2">
                Reason
              </Label>
              <Textarea
                id="eot-reason"
                placeholder="Describe the cause of delay..."
                className="col-span-3"
                rows={2}
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="eot-description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="eot-description"
                placeholder="Additional details..."
                className="col-span-3"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
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
              {loading ? "Creating..." : "Create EOT"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
