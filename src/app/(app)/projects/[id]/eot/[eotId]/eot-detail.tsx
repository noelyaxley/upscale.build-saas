"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  FileText,
  Send,
  X,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Tables, Database } from "@/lib/supabase/database.types";
import { useOrganisation } from "@/lib/context/organisation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type EotStatus = Database["public"]["Enums"]["eot_status"];

type Eot = Tables<"extension_of_time"> & {
  submitted_by_company: { id: string; name: string } | null;
  approved_by: { id: string; full_name: string | null } | null;
  created_by: { id: string; full_name: string | null } | null;
};

interface EotDetailProps {
  project: { id: string; code: string; name: string; end_date: string | null };
  eot: Eot;
}

const statusColors: Record<EotStatus, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  under_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  withdrawn: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
};

const statusLabels: Record<EotStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

const statusSteps: EotStatus[] = ["draft", "submitted", "under_review", "approved"];

function formatDate(date: string | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date: string | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function EotDetail({ project, eot }: EotDetailProps) {
  const router = useRouter();
  const supabase = createClient();
  const { isAdmin, profile } = useOrganisation();

  const [loading, setLoading] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [daysApproved, setDaysApproved] = useState(String(eot.days_claimed));
  const [rejectionReason, setRejectionReason] = useState("");

  const handleStatusUpdate = async (
    newStatus: EotStatus,
    additionalData?: Record<string, unknown>
  ) => {
    setLoading(true);
    try {
      const updates: Record<string, unknown> = {
        status: newStatus,
        ...additionalData,
      };

      if (newStatus === "submitted") {
        updates.submitted_at = new Date().toISOString();
      } else if (newStatus === "approved") {
        updates.approved_at = new Date().toISOString();
        updates.approved_by_user_id = profile.id;
        updates.days_approved = parseInt(daysApproved) || 0;
        // Calculate new completion date
        if (eot.original_completion_date) {
          const originalDate = new Date(eot.original_completion_date);
          originalDate.setDate(
            originalDate.getDate() + (parseInt(daysApproved) || 0)
          );
          updates.new_completion_date = originalDate.toISOString().split("T")[0];
        }
      } else if (newStatus === "rejected") {
        updates.rejection_reason = rejectionReason;
      }

      const { error } = await supabase
        .from("extension_of_time")
        .update(updates)
        .eq("id", eot.id);

      if (error) throw error;

      setApproveDialogOpen(false);
      setRejectDialogOpen(false);
      router.refresh();
    } catch (err) {
      console.error("Failed to update EOT:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get current step index
  const currentStepIndex = eot.status === "rejected" || eot.status === "withdrawn"
    ? -1
    : statusSteps.indexOf(eot.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/projects/${project.id}/eot`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href={`/projects/${project.id}`} className="hover:underline">
              {project.code}
            </Link>
            <ChevronRight className="size-4" />
            <Link
              href={`/projects/${project.id}/eot`}
              className="hover:underline"
            >
              Extension of Time
            </Link>
            <ChevronRight className="size-4" />
            <span>EOT-{String(eot.eot_number).padStart(3, "0")}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{eot.title}</h1>
            <Badge variant="secondary" className={statusColors[eot.status]}>
              {statusLabels[eot.status]}
            </Badge>
          </div>
        </div>
      </div>

      {/* Status Workflow Visual */}
      {eot.status !== "rejected" && eot.status !== "withdrawn" && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {statusSteps.map((step, index) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex size-10 items-center justify-center rounded-full border-2 ${
                        index <= currentStepIndex
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/30 text-muted-foreground"
                      }`}
                    >
                      {index < currentStepIndex ? (
                        <CheckCircle className="size-5" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        index <= currentStepIndex
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {statusLabels[step]}
                    </span>
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 ${
                        index < currentStepIndex
                          ? "bg-primary"
                          : "bg-muted-foreground/30"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rejected/Withdrawn Banner */}
      {(eot.status === "rejected" || eot.status === "withdrawn") && (
        <Card className="border-red-200 dark:border-red-900">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <XCircle className="size-6 text-red-500" />
              <div>
                <p className="font-medium text-red-600 dark:text-red-400">
                  This EOT has been {eot.status}
                </p>
                {eot.rejection_reason && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Reason: {eot.rejection_reason}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {isAdmin && (
        <div className="flex gap-2">
          {eot.status === "draft" && (
            <Button onClick={() => handleStatusUpdate("submitted")} disabled={loading}>
              <Send className="mr-2 size-4" />
              Submit EOT
            </Button>
          )}
          {eot.status === "submitted" && (
            <Button
              onClick={() => handleStatusUpdate("under_review")}
              disabled={loading}
            >
              <FileText className="mr-2 size-4" />
              Start Review
            </Button>
          )}
          {eot.status === "under_review" && (
            <>
              <Button onClick={() => setApproveDialogOpen(true)} disabled={loading}>
                <CheckCircle className="mr-2 size-4" />
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => setRejectDialogOpen(true)}
                disabled={loading}
              >
                <X className="mr-2 size-4" />
                Reject
              </Button>
            </>
          )}
          {(eot.status === "draft" || eot.status === "submitted") && (
            <Button
              variant="outline"
              onClick={() => handleStatusUpdate("withdrawn")}
              disabled={loading}
            >
              Withdraw
            </Button>
          )}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Time Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5" />
              Time Extension
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Days Claimed</p>
                <p className="text-2xl font-bold">{eot.days_claimed}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Days Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {eot.days_approved !== null ? eot.days_approved : "-"}
                </p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delay Period</span>
                <span>
                  {eot.delay_start_date && eot.delay_end_date
                    ? `${formatDate(eot.delay_start_date)} - ${formatDate(eot.delay_end_date)}`
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Original Completion</span>
                <span>{formatDate(eot.original_completion_date)}</span>
              </div>
              {eot.new_completion_date && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">New Completion</span>
                  <span className="font-medium text-green-600">
                    {formatDate(eot.new_completion_date)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submission Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Submitted By</span>
                <span>{eot.submitted_by_company?.name || "-"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created By</span>
                <span>{eot.created_by?.full_name || "-"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span>{formatDateTime(eot.created_at)}</span>
              </div>
              {eot.submitted_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Submitted</span>
                  <span>{formatDateTime(eot.submitted_at)}</span>
                </div>
              )}
              {eot.approved_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Approved</span>
                  <span>{formatDateTime(eot.approved_at)}</span>
                </div>
              )}
              {eot.approved_by && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Approved By</span>
                  <span>{eot.approved_by.full_name || "-"}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reason */}
      {eot.reason && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reason for Delay</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{eot.reason}</p>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {eot.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{eot.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Extension of Time</DialogTitle>
            <DialogDescription>
              Enter the number of days to approve for this EOT claim
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="days-approved" className="text-right">
                Days Approved
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="days-approved"
                  type="number"
                  min="0"
                  max={eot.days_claimed}
                  className="w-24"
                  value={daysApproved}
                  onChange={(e) => setDaysApproved(e.target.value)}
                />
                <span className="text-sm text-muted-foreground">
                  of {eot.days_claimed} claimed
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleStatusUpdate("approved")} disabled={loading}>
              {loading ? "Approving..." : "Approve EOT"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Extension of Time</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this EOT claim
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="rejection-reason" className="text-right pt-2">
                Reason
              </Label>
              <Textarea
                id="rejection-reason"
                placeholder="Explain why this EOT is being rejected..."
                className="col-span-3"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleStatusUpdate("rejected")}
              disabled={loading || !rejectionReason}
            >
              {loading ? "Rejecting..." : "Reject EOT"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
