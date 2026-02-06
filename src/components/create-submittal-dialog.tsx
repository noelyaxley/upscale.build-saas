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

type Company = { id: string; name: string };
type Member = { id: string; full_name: string | null };

interface CreateSubmittalDialogProps {
  projectId: string;
  companies: Company[];
  members: Member[];
  children: ReactNode;
}

export function CreateSubmittalDialog({
  projectId,
  companies,
  members,
  children,
}: CreateSubmittalDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { organisation, profile } = useOrganisation();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    title: "",
    submittalType: "shop_drawing",
    specSection: "",
    description: "",
    companyId: "",
    reviewerId: "",
    dateRequired: "",
    status: "draft" as "draft" | "submitted",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from("submittals")
        .insert({
          org_id: organisation.id,
          project_id: projectId,
          submittal_number: 0,
          title: formData.title,
          description: formData.description || null,
          spec_section: formData.specSection || null,
          submittal_type: formData.submittalType,
          status: formData.status,
          submitted_by_company_id: formData.companyId || null,
          assigned_reviewer_id: formData.reviewerId || null,
          date_required: formData.dateRequired || null,
          date_submitted:
            formData.status === "submitted"
              ? new Date().toISOString().split("T")[0]
              : null,
          created_by_user_id: profile.id,
        });

      if (insertError) throw insertError;

      setOpen(false);
      setFormData({
        title: "",
        submittalType: "shop_drawing",
        specSection: "",
        description: "",
        companyId: "",
        reviewerId: "",
        dateRequired: "",
        status: "draft",
      });
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create submittal"
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
            <DialogTitle>New Submittal</DialogTitle>
            <DialogDescription>
              Create a submittal for review and approval
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sub-title" className="text-right">
                Title
              </Label>
              <Input
                id="sub-title"
                placeholder="e.g. Structural Steel Shop Drawings"
                className="col-span-3"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sub-type" className="text-right">
                Type
              </Label>
              <Select
                value={formData.submittalType}
                onValueChange={(value) =>
                  setFormData({ ...formData, submittalType: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shop_drawing">Shop Drawing</SelectItem>
                  <SelectItem value="product_data">Product Data</SelectItem>
                  <SelectItem value="sample">Sample</SelectItem>
                  <SelectItem value="mock_up">Mock-up</SelectItem>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sub-spec" className="text-right">
                Spec Section
              </Label>
              <Input
                id="sub-spec"
                placeholder="e.g. 03 30 00"
                className="col-span-3"
                value={formData.specSection}
                onChange={(e) =>
                  setFormData({ ...formData, specSection: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="sub-desc" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="sub-desc"
                placeholder="Describe the submittal contents..."
                className="col-span-3"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sub-company" className="text-right">
                Submitted By
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
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sub-reviewer" className="text-right">
                Reviewer
              </Label>
              <Select
                value={formData.reviewerId}
                onValueChange={(value) =>
                  setFormData({ ...formData, reviewerId: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select reviewer" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.full_name || "Unnamed"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sub-date" className="text-right">
                Date Required
              </Label>
              <Input
                id="sub-date"
                type="date"
                className="col-span-3"
                value={formData.dateRequired}
                onChange={(e) =>
                  setFormData({ ...formData, dateRequired: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sub-status" className="text-right">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: "draft" | "submitted") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft (save for later)</SelectItem>
                  <SelectItem value="submitted">
                    Submitted (send for review)
                  </SelectItem>
                </SelectContent>
              </Select>
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
              {loading ? "Creating..." : "Create Submittal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
