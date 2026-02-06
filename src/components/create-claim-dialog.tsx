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

type Company = {
  id: string;
  name: string;
};

interface CreateClaimDialogProps {
  projectId: string;
  companies: Company[];
  previousClaimsTotal: number;
  children: ReactNode;
}

export function CreateClaimDialog({
  projectId,
  companies,
  previousClaimsTotal,
  children,
}: CreateClaimDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { organisation, profile } = useOrganisation();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    periodStart: "",
    periodEnd: "",
    claimedAmount: "",
    notes: "",
    submittedByCompanyId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert amount to cents
      const amountInCents = formData.claimedAmount
        ? Math.round(parseFloat(formData.claimedAmount) * 100)
        : 0;

      const { error: insertError } = await supabase.from("progress_claims").insert({
        org_id: organisation.id,
        project_id: projectId,
        period_start: formData.periodStart,
        period_end: formData.periodEnd,
        claimed_amount: amountInCents,
        previous_claims_total: previousClaimsTotal,
        notes: formData.notes || null,
        submitted_by_company_id: formData.submittedByCompanyId || null,
        created_by_user_id: profile.id,
      });

      if (insertError) throw insertError;

      setOpen(false);
      setFormData({
        periodStart: "",
        periodEnd: "",
        claimedAmount: "",
        notes: "",
        submittedByCompanyId: "",
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create claim");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Progress Claim</DialogTitle>
            <DialogDescription>
              Submit a progress claim for work completed
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="claim-start" className="text-right">
                Period Start
              </Label>
              <Input
                id="claim-start"
                type="date"
                className="col-span-3"
                value={formData.periodStart}
                onChange={(e) =>
                  setFormData({ ...formData, periodStart: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="claim-end" className="text-right">
                Period End
              </Label>
              <Input
                id="claim-end"
                type="date"
                className="col-span-3"
                value={formData.periodEnd}
                onChange={(e) =>
                  setFormData({ ...formData, periodEnd: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="claim-amount" className="text-right">
                Amount ($)
              </Label>
              <Input
                id="claim-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="col-span-3"
                value={formData.claimedAmount}
                onChange={(e) =>
                  setFormData({ ...formData, claimedAmount: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="claim-company" className="text-right">
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
              <Label htmlFor="claim-notes" className="text-right pt-2">
                Notes
              </Label>
              <Textarea
                id="claim-notes"
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Claim"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
