"use client";

import { getErrorMessage } from "@/lib/utils";
import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Contract = Tables<"contracts">;

interface EditContractDialogProps {
  contract: Contract;
  companies: { id: string; name: string }[];
  children: ReactNode;
}

export function EditContractDialog({
  contract,
  companies,
  children,
}: EditContractDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: contract.name,
    company_id: contract.company_id || "",
    contract_ref: contract.contract_ref || "",
    contract_value: (contract.contract_value / 100).toString(),
    description: contract.description || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const valueCents = formData.contract_value
        ? Math.round(parseFloat(formData.contract_value) * 100)
        : 0;

      const { error: updateError } = await supabase
        .from("contracts")
        .update({
          name: formData.name,
          company_id: formData.company_id || null,
          contract_ref: formData.contract_ref || null,
          contract_value: valueCents,
          description: formData.description || null,
        })
        .eq("id", contract.id);

      if (updateError) throw updateError;

      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update contract"));
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
            <DialogTitle>Edit contract</DialogTitle>
            <DialogDescription>
              Update the contract details below
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-contract-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-contract-name"
                className="col-span-3"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-contract-company" className="text-right">
                Company
              </Label>
              <Select
                value={formData.company_id || "none"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    company_id: value === "none" ? "" : value,
                  })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No company</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-contract-ref" className="text-right">
                Contract Ref
              </Label>
              <Input
                id="edit-contract-ref"
                className="col-span-3"
                value={formData.contract_ref}
                onChange={(e) =>
                  setFormData({ ...formData, contract_ref: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-contract-value" className="text-right">
                Value ($)
              </Label>
              <Input
                id="edit-contract-value"
                type="number"
                step="0.01"
                className="col-span-3"
                value={formData.contract_value}
                onChange={(e) =>
                  setFormData({ ...formData, contract_value: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label
                htmlFor="edit-contract-description"
                className="pt-2 text-right"
              >
                Description
              </Label>
              <Textarea
                id="edit-contract-description"
                className="col-span-3"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
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
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
