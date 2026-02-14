"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useOrganisation } from "@/lib/context/organisation";
import type { Tables } from "@/lib/supabase/database.types";
import Link from "next/link";
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
import { getErrorMessage } from "@/lib/utils";

type Company = Tables<"companies">;

const stages = [
  { value: "preconstruction", label: "Preconstruction" },
  { value: "construction", label: "Construction" },
  { value: "defects", label: "Defects" },
  { value: "completed", label: "Completed" },
];

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const router = useRouter();
  const { organisation, isAdmin, canCreateProject } = useOrganisation();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    stage: "preconstruction",
    address: "",
    budget: "",
    client_company_id: "",
  });

  useEffect(() => {
    if (open) {
      supabase
        .from("companies")
        .select("*")
        .order("name")
        .then(({ data }) => {
          if (data) setCompanies(data);
        });
    }
  }, [open, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const budgetCents = formData.budget
        ? Math.round(parseFloat(formData.budget) * 100)
        : 0;

      const { error: insertError } = await supabase.from("projects").insert({
        org_id: organisation.id,
        code: formData.code.toUpperCase(),
        name: formData.name,
        description: formData.description || null,
        stage: formData.stage,
        address: formData.address || null,
        budget: budgetCents,
        client_company_id: formData.client_company_id || null,
      });

      if (insertError) {
        if (insertError.code === "23505") {
          throw new Error("A project with this code already exists");
        }
        throw insertError;
      }

      setOpen(false);
      setFormData({
        code: "",
        name: "",
        description: "",
        stage: "preconstruction",
        address: "",
        budget: "",
        client_company_id: "",
      });
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create project"));
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        {!canCreateProject ? (
          <>
            <DialogHeader>
              <DialogTitle>Project limit reached</DialogTitle>
              <DialogDescription>
                Free accounts are limited to 3 projects. Upgrade to Pro for unlimited projects.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button asChild>
                <Link href="/settings/billing">Upgrade to Pro</Link>
              </Button>
            </DialogFooter>
          </>
        ) : (
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create new project</DialogTitle>
            <DialogDescription>
              Add a new construction project to your organisation
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                Code
              </Label>
              <Input
                id="code"
                placeholder="PRJ-001"
                className="col-span-3"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                required
                maxLength={20}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                placeholder="Main Street Development"
                className="col-span-3"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client" className="text-right">
                Client
              </Label>
              <Select
                value={formData.client_company_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, client_company_id: value === "none" ? "" : value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select client company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No client</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stage" className="text-right">
                Stage
              </Label>
              <Select
                value={formData.stage}
                onValueChange={(value) =>
                  setFormData({ ...formData, stage: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem key={stage.value} value={stage.value}>
                      {stage.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="budget" className="text-right">
                Budget ($)
              </Label>
              <Input
                id="budget"
                type="number"
                placeholder="0.00"
                className="col-span-3"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({ ...formData, budget: e.target.value })
                }
                min="0"
                step="0.01"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input
                id="address"
                placeholder="123 Main Street, Sydney"
                className="col-span-3"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="pt-2 text-right">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Optional project description..."
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
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
