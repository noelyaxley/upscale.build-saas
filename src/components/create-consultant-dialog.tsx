"use client";

import { getErrorMessage } from "@/lib/utils";
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

interface CreateConsultantDialogProps {
  projectId: string;
  companies: Company[];
  children: ReactNode;
}

export function CreateConsultantDialog({
  projectId,
  companies,
  children,
}: CreateConsultantDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { organisation, profile } = useOrganisation();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    companyId: "",
    discipline: "",
    contractRef: "",
    budget: "",
    contractValue: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const budgetCents = formData.budget
        ? Math.round(parseFloat(formData.budget) * 100)
        : 0;
      const contractCents = formData.contractValue
        ? Math.round(parseFloat(formData.contractValue) * 100)
        : 0;

      const { error: insertError } = await supabase
        .from("consultants")
        .insert({
          org_id: organisation.id,
          project_id: projectId,
          company_id: formData.companyId || null,
          discipline: formData.discipline,
          contract_ref: formData.contractRef || null,
          budget: budgetCents,
          contract_value: contractCents,
          notes: formData.notes || null,
          created_by_user_id: profile.id,
        });

      if (insertError) throw insertError;

      setOpen(false);
      setFormData({
        companyId: "",
        discipline: "",
        contractRef: "",
        budget: "",
        contractValue: "",
        notes: "",
      });
      router.refresh();
    } catch (err) {
      setError(
        getErrorMessage(err, "Failed to create consultant")
      );
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
            <DialogTitle>New Consultant</DialogTitle>
            <DialogDescription>
              Add a professional service provider to this project
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="con-company" className="text-right">
                Company
              </Label>
              <Select
                value={formData.companyId}
                onValueChange={(value) =>
                  setFormData({ ...formData, companyId: value })
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

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="con-discipline" className="text-right">
                Discipline
              </Label>
              <Input
                id="con-discipline"
                placeholder="e.g. Architect, Structural Engineer"
                className="col-span-3"
                value={formData.discipline}
                onChange={(e) =>
                  setFormData({ ...formData, discipline: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="con-ref" className="text-right">
                Contract Ref
              </Label>
              <Input
                id="con-ref"
                placeholder="Contract reference number"
                className="col-span-3"
                value={formData.contractRef}
                onChange={(e) =>
                  setFormData({ ...formData, contractRef: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="con-budget" className="text-right">
                Budget ($)
              </Label>
              <Input
                id="con-budget"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="col-span-3"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({ ...formData, budget: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="con-contract" className="text-right">
                Contract Value ($)
              </Label>
              <Input
                id="con-contract"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="col-span-3"
                value={formData.contractValue}
                onChange={(e) =>
                  setFormData({ ...formData, contractValue: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="con-notes" className="text-right pt-2">
                Notes
              </Label>
              <Textarea
                id="con-notes"
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
              {loading ? "Creating..." : "Create Consultant"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
