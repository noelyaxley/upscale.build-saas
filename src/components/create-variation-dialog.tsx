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

type ContractOption = {
  id: string;
  name: string;
  contract_number: number;
};

interface CreateVariationDialogProps {
  projectId: string;
  companies: Company[];
  contracts?: ContractOption[];
  contractId?: string;
  children: ReactNode;
}

export function CreateVariationDialog({
  projectId,
  companies,
  contracts = [],
  contractId,
  children,
}: CreateVariationDialogProps) {
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
    costImpact: "",
    timeImpact: "",
    submittedByCompanyId: "",
    contractId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert cost to cents
      const costInCents = formData.costImpact
        ? Math.round(parseFloat(formData.costImpact) * 100)
        : 0;

      const { error: insertError } = await supabase.from("variations").insert({
        org_id: organisation.id,
        project_id: projectId,
        title: formData.title,
        description: formData.description || null,
        reason: formData.reason || null,
        cost_impact: costInCents,
        time_impact: formData.timeImpact ? parseInt(formData.timeImpact) : 0,
        submitted_by_company_id: formData.submittedByCompanyId || null,
        contract_id: contractId || formData.contractId || null,
        created_by_user_id: profile.id,
      });

      if (insertError) throw insertError;

      setOpen(false);
      setFormData({
        title: "",
        description: "",
        reason: "",
        costImpact: "",
        timeImpact: "",
        submittedByCompanyId: "",
        contractId: "",
      });
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create variation"));
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
            <DialogTitle>New Variation</DialogTitle>
            <DialogDescription>
              Create a variation (change order) to track contract changes
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="var-title" className="text-right">
                Title
              </Label>
              <Input
                id="var-title"
                placeholder="Brief description of the change"
                className="col-span-3"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="var-desc" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="var-desc"
                placeholder="Detailed description of the variation..."
                className="col-span-3"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="var-reason" className="text-right pt-2">
                Reason
              </Label>
              <Textarea
                id="var-reason"
                placeholder="Why is this change needed?"
                className="col-span-3"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="var-cost" className="text-right">
                Cost Impact ($)
              </Label>
              <Input
                id="var-cost"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="col-span-3"
                value={formData.costImpact}
                onChange={(e) =>
                  setFormData({ ...formData, costImpact: e.target.value })
                }
              />
            </div>

            {!contractId && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="var-time" className="text-right">
                    Time Impact (days)
                  </Label>
                  <Input
                    id="var-time"
                    type="number"
                    placeholder="0"
                    className="col-span-3"
                    value={formData.timeImpact}
                    onChange={(e) =>
                      setFormData({ ...formData, timeImpact: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="var-company" className="text-right">
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

                {contracts.length > 0 && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="var-contract" className="text-right">
                      Contract
                    </Label>
                    <Select
                      value={formData.contractId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, contractId: value === "none" ? "" : value })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="None (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {contracts.map((ct) => (
                          <SelectItem key={ct.id} value={ct.id}>
                            CT-{String(ct.contract_number).padStart(3, "0")} — {ct.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Variation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
