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

interface CreateContractDialogProps {
  projectId: string;
  companies: Company[];
  children: ReactNode;
}

export function CreateContractDialog({
  projectId,
  companies,
  children,
}: CreateContractDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { organisation, profile } = useOrganisation();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: "",
    companyId: "",
    contractRef: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from("contracts")
        .insert({
          org_id: organisation.id,
          project_id: projectId,
          name: formData.name,
          company_id: formData.companyId || null,
          contract_ref: formData.contractRef || null,
          contract_value: 0,
          description: formData.description || null,
          created_by_user_id: profile.id,
        });

      if (insertError) throw insertError;

      setOpen(false);
      setFormData({
        name: "",
        companyId: "",
        contractRef: "",
        description: "",
      });
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create contract"));
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
            <DialogTitle>New Contract</DialogTitle>
            <DialogDescription>
              Add a contract to track progress claims against
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ct-name" className="text-right">
                Name
              </Label>
              <Input
                id="ct-name"
                placeholder="e.g. Main Building Works"
                className="col-span-3"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ct-company" className="text-right">
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
              <Label htmlFor="ct-ref" className="text-right">
                Contract Ref
              </Label>
              <Input
                id="ct-ref"
                placeholder="Contract reference number"
                className="col-span-3"
                value={formData.contractRef}
                onChange={(e) =>
                  setFormData({ ...formData, contractRef: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="ct-desc" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="ct-desc"
                placeholder="Contract description..."
                className="col-span-3"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
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
              {loading ? "Creating..." : "Create Contract"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
