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

interface CreateRFIDialogProps {
  projectId: string;
  members: { id: string; full_name: string | null }[];
  children: ReactNode;
}

export function CreateRFIDialog({
  projectId,
  members,
  children,
}: CreateRFIDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { organisation, profile } = useOrganisation();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    subject: "",
    question: "",
    dueDate: "",
    assigneeId: "",
    status: "draft" as "draft" | "open",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from("rfis").insert({
        org_id: organisation.id,
        project_id: projectId,
        subject: formData.subject,
        question: formData.question,
        status: formData.status,
        due_date: formData.dueDate || null,
        originator_user_id: profile.id,
        assignee_user_id: formData.assigneeId || null,
      });

      if (insertError) {
        throw insertError;
      }

      setOpen(false);
      setFormData({
        subject: "",
        question: "",
        dueDate: "",
        assigneeId: "",
        status: "draft",
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create RFI");
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
            <DialogTitle>Create RFI</DialogTitle>
            <DialogDescription>
              Submit a Request for Information to track questions and responses
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rfi-subject" className="text-right">
                Subject
              </Label>
              <Input
                id="rfi-subject"
                placeholder="Brief description of the question"
                className="col-span-3"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                required
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="rfi-question" className="text-right pt-2">
                Question
              </Label>
              <Textarea
                id="rfi-question"
                placeholder="Detailed question or request..."
                className="col-span-3 min-h-[120px]"
                value={formData.question}
                onChange={(e) =>
                  setFormData({ ...formData, question: e.target.value })
                }
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rfi-assignee" className="text-right">
                Assign To
              </Label>
              <Select
                value={formData.assigneeId}
                onValueChange={(value) =>
                  setFormData({ ...formData, assigneeId: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select person to respond" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.full_name || "Unnamed"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rfi-due" className="text-right">
                Due Date
              </Label>
              <Input
                id="rfi-due"
                type="date"
                className="col-span-3"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rfi-status" className="text-right">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: "draft" | "open") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft (save for later)</SelectItem>
                  <SelectItem value="open">Open (submit now)</SelectItem>
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
              {loading ? "Creating..." : "Create RFI"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
