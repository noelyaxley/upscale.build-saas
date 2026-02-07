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
import { Textarea } from "@/components/ui/textarea";

interface CreateAgentDialogProps {
  projectId: string;
  children: ReactNode;
}

export function CreateAgentDialog({
  projectId,
  children,
}: CreateAgentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { organisation, profile } = useOrganisation();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    commissionRate: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from("sales_agents")
        .insert({
          org_id: organisation.id,
          project_id: projectId,
          name: formData.name,
          company: formData.company || null,
          email: formData.email || null,
          phone: formData.phone || null,
          commission_rate: formData.commissionRate
            ? parseFloat(formData.commissionRate)
            : 0,
          notes: formData.notes || null,
          created_by_user_id: profile.id,
        });

      if (insertError) throw insertError;

      setOpen(false);
      setFormData({
        name: "",
        company: "",
        email: "",
        phone: "",
        commissionRate: "",
        notes: "",
      });
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create agent"));
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
            <DialogTitle>Add Sales Agent</DialogTitle>
            <DialogDescription>
              Register a new sales agent for this project
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agent-name" className="text-right">
                Name
              </Label>
              <Input
                id="agent-name"
                placeholder="Full name"
                className="col-span-3"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agent-company" className="text-right">
                Company
              </Label>
              <Input
                id="agent-company"
                placeholder="Agency / Company name"
                className="col-span-3"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agent-email" className="text-right">
                Email
              </Label>
              <Input
                id="agent-email"
                type="email"
                placeholder="agent@example.com"
                className="col-span-3"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agent-phone" className="text-right">
                Phone
              </Label>
              <Input
                id="agent-phone"
                placeholder="Phone number"
                className="col-span-3"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agent-rate" className="text-right">
                Commission %
              </Label>
              <Input
                id="agent-rate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="e.g. 2.5"
                className="col-span-3"
                value={formData.commissionRate}
                onChange={(e) =>
                  setFormData({ ...formData, commissionRate: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="agent-notes" className="text-right pt-2">
                Notes
              </Label>
              <Textarea
                id="agent-notes"
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
              {loading ? "Creating..." : "Add Agent"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
