"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Calendar,
  CheckCircle,
  ChevronRight,
  DollarSign,
  FileText,
  Gavel,
  Plus,
  Search,
  Trash2,
  User,
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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type TenderStatus = Database["public"]["Enums"]["tender_status"];

type Tender = Tables<"tenders"> & {
  awarded_company: { id: string; name: string } | null;
  created_by: { id: string; full_name: string | null } | null;
};

type Submission = Tables<"tender_submissions"> & {
  company: { id: string; name: string } | null;
};

type Company = {
  id: string;
  name: string;
};

interface TenderDetailProps {
  project: { id: string; code: string; name: string };
  tender: Tender;
  submissions: Submission[];
  companies: Company[];
}

const statusColors: Record<TenderStatus, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  open: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  evaluation: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  awarded: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const statusLabels: Record<TenderStatus, string> = {
  draft: "Draft",
  open: "Open",
  evaluation: "Evaluation",
  awarded: "Awarded",
  cancelled: "Cancelled",
};

function formatCurrency(cents: number): string {
  const amount = cents / 100;
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function TenderDetail({
  project,
  tender,
  submissions,
  companies,
}: TenderDetailProps) {
  const [updating, setUpdating] = useState(false);
  const [addSubmissionOpen, setAddSubmissionOpen] = useState(false);
  const [addSubmissionLoading, setAddSubmissionLoading] = useState(false);
  const [newSubmission, setNewSubmission] = useState({
    companyId: "",
    amount: "",
    notes: "",
  });
  const router = useRouter();
  const { isAdmin } = useOrganisation();
  const supabase = createClient();

  const lowestBidAmount =
    submissions.length > 0
      ? Math.min(...submissions.map((s) => s.amount))
      : null;

  const handleStatusChange = async (newStatus: TenderStatus) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("tenders")
        .update({ status: newStatus })
        .eq("id", tender.id);

      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddSubmissionLoading(true);
    try {
      const amountCents = newSubmission.amount
        ? Math.round(parseFloat(newSubmission.amount) * 100)
        : 0;

      const { error } = await supabase.from("tender_submissions").insert({
        tender_id: tender.id,
        company_id: newSubmission.companyId,
        amount: amountCents,
        notes: newSubmission.notes || null,
      });

      if (error) throw error;
      setAddSubmissionOpen(false);
      setNewSubmission({ companyId: "", amount: "", notes: "" });
      router.refresh();
    } catch (err) {
      console.error("Failed to add submission:", err);
    } finally {
      setAddSubmissionLoading(false);
    }
  };

  const handleDeleteSubmission = async (
    submissionId: string,
    companyName: string
  ) => {
    if (!window.confirm(`Delete submission from "${companyName}"?`)) return;
    try {
      const { error } = await supabase
        .from("tender_submissions")
        .delete()
        .eq("id", submissionId);

      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error("Failed to delete submission:", err);
    }
  };

  const handleAward = async (submission: Submission) => {
    if (
      !window.confirm(
        `Award this tender to ${submission.company?.name} for ${formatCurrency(submission.amount)}?`
      )
    )
      return;

    setUpdating(true);
    try {
      // Clear any previous award
      const { error: clearError } = await supabase
        .from("tender_submissions")
        .update({ is_awarded: false })
        .eq("tender_id", tender.id);

      if (clearError) throw clearError;

      // Set the new award
      const { error: awardError } = await supabase
        .from("tender_submissions")
        .update({ is_awarded: true })
        .eq("id", submission.id);

      if (awardError) throw awardError;

      // Update the tender
      const { error: tenderError } = await supabase
        .from("tenders")
        .update({
          status: "awarded" as TenderStatus,
          awarded_company_id: submission.company_id,
          awarded_amount: submission.amount,
        })
        .eq("id", tender.id);

      if (tenderError) throw tenderError;
      router.refresh();
    } catch (err) {
      console.error("Failed to award tender:", err);
    } finally {
      setUpdating(false);
    }
  };

  const workflowSteps = [
    { key: "draft", label: "Draft", icon: FileText },
    { key: "open", label: "Open", icon: Gavel },
    { key: "evaluation", label: "Evaluation", icon: Search },
    { key: "awarded", label: "Awarded", icon: Award },
  ];

  const currentStepIndex = workflowSteps.findIndex(
    (s) => s.key === tender.status
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/projects/${project.id}/tenders`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link
              href={`/projects/${project.id}`}
              className="hover:underline"
            >
              {project.code}
            </Link>
            <ChevronRight className="size-4" />
            <Link
              href={`/projects/${project.id}/tenders`}
              className="hover:underline"
            >
              Tenders
            </Link>
            <ChevronRight className="size-4" />
            <span className="font-mono">
              T-{String(tender.tender_number).padStart(3, "0")}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{tender.title}</h1>
        </div>
        <Badge variant="secondary" className={statusColors[tender.status]}>
          {statusLabels[tender.status]}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tender Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Gavel className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Trade</p>
                    <p className="text-sm font-medium">{tender.trade}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Due Date</p>
                    <p className="text-sm font-medium">
                      {formatDate(tender.due_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Created By</p>
                    <p className="text-sm font-medium">
                      {tender.created_by?.full_name || "-"}
                    </p>
                  </div>
                </div>
                {tender.awarded_company && (
                  <div className="flex items-center gap-3">
                    <Award className="size-4 text-green-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Awarded To
                      </p>
                      <p className="text-sm font-medium text-green-600">
                        {tender.awarded_company.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {tender.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Description
                    </p>
                    <p className="text-sm whitespace-pre-wrap">
                      {tender.description}
                    </p>
                  </div>
                </>
              )}
              {tender.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm whitespace-pre-wrap">
                      {tender.notes}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Submissions table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    Tender Submissions
                  </CardTitle>
                  <CardDescription>
                    {submissions.length} bid
                    {submissions.length !== 1 ? "s" : ""} received
                  </CardDescription>
                </div>
                {tender.status !== "awarded" &&
                  tender.status !== "cancelled" && (
                    <Dialog
                      open={addSubmissionOpen}
                      onOpenChange={setAddSubmissionOpen}
                    >
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Plus className="mr-2 size-4" />
                          Add Bid
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[450px]">
                        <form onSubmit={handleAddSubmission}>
                          <DialogHeader>
                            <DialogTitle>Add Bid</DialogTitle>
                            <DialogDescription>
                              Record a contractor submission for this tender
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor="sub-company"
                                className="text-right"
                              >
                                Company
                              </Label>
                              <Select
                                value={newSubmission.companyId}
                                onValueChange={(value) =>
                                  setNewSubmission({
                                    ...newSubmission,
                                    companyId: value,
                                  })
                                }
                              >
                                <SelectTrigger className="col-span-3">
                                  <SelectValue placeholder="Select company" />
                                </SelectTrigger>
                                <SelectContent>
                                  {companies.map((company) => (
                                    <SelectItem
                                      key={company.id}
                                      value={company.id}
                                    >
                                      {company.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor="sub-amount"
                                className="text-right"
                              >
                                Amount ($)
                              </Label>
                              <Input
                                id="sub-amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="col-span-3"
                                value={newSubmission.amount}
                                onChange={(e) =>
                                  setNewSubmission({
                                    ...newSubmission,
                                    amount: e.target.value,
                                  })
                                }
                                required
                              />
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                              <Label
                                htmlFor="sub-notes"
                                className="text-right pt-2"
                              >
                                Notes
                              </Label>
                              <Textarea
                                id="sub-notes"
                                placeholder="Optional notes..."
                                className="col-span-3"
                                value={newSubmission.notes}
                                onChange={(e) =>
                                  setNewSubmission({
                                    ...newSubmission,
                                    notes: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setAddSubmissionOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              disabled={
                                addSubmissionLoading || !newSubmission.companyId
                              }
                            >
                              {addSubmissionLoading
                                ? "Adding..."
                                : "Add Bid"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
              </div>
            </CardHeader>
            <CardContent>
              {submissions.length === 0 ? (
                <div className="py-8 text-center">
                  <Gavel className="mx-auto size-12 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No bids received yet
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add contractor submissions as they come in
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Status</TableHead>
                      {isAdmin && <TableHead className="w-[120px]">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow
                        key={submission.id}
                        className={
                          submission.is_awarded
                            ? "bg-green-50 dark:bg-green-900/10"
                            : ""
                        }
                      >
                        <TableCell className="font-medium">
                          {submission.company?.name || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              submission.amount === lowestBidAmount
                                ? "font-bold text-green-600"
                                : "font-medium"
                            }
                          >
                            {formatCurrency(submission.amount)}
                          </span>
                          {submission.amount === lowestBidAmount &&
                            !submission.is_awarded && (
                              <span className="ml-1 text-xs text-green-600">
                                Lowest
                              </span>
                            )}
                        </TableCell>
                        <TableCell>
                          {formatDate(submission.submitted_at)}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {submission.notes || "-"}
                        </TableCell>
                        <TableCell>
                          {submission.is_awarded ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              Awarded
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              -
                            </span>
                          )}
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {tender.status === "evaluation" &&
                                !submission.is_awarded && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600"
                                    onClick={() => handleAward(submission)}
                                    disabled={updating}
                                  >
                                    <Award className="mr-1 size-3" />
                                    Award
                                  </Button>
                                )}
                              {tender.status !== "awarded" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive"
                                  onClick={() =>
                                    handleDeleteSubmission(
                                      submission.id,
                                      submission.company?.name || "Unknown"
                                    )
                                  }
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Status Workflow */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status Workflow</CardTitle>
              <CardDescription>
                Manage tender through procurement stages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {tender.status !== "cancelled" && (
                <div className="flex items-center justify-center gap-2">
                  {workflowSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = step.key === tender.status;
                    const isPast = index < currentStepIndex;
                    const isFuture = index > currentStepIndex;

                    return (
                      <div
                        key={step.key}
                        className="flex items-center gap-2"
                      >
                        {index > 0 && (
                          <ArrowRight
                            className={`size-4 ${
                              isPast
                                ? "text-green-500"
                                : "text-muted-foreground"
                            }`}
                          />
                        )}
                        <div
                          className={`flex flex-col items-center gap-1 ${
                            isFuture ? "opacity-50" : ""
                          }`}
                        >
                          <div
                            className={`size-10 rounded-full flex items-center justify-center ${
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : isPast
                                ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-muted"
                            }`}
                          >
                            <Icon className="size-5" />
                          </div>
                          <span className="text-xs">{step.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <Separator />

              {tender.status === "draft" && isAdmin && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Open for Bids</p>
                  <p className="text-sm text-muted-foreground">
                    Open this tender to start receiving contractor submissions.
                  </p>
                  <Button
                    onClick={() => handleStatusChange("open")}
                    disabled={updating}
                  >
                    <Gavel className="mr-2 size-4" />
                    Open Tender
                  </Button>
                </div>
              )}

              {tender.status === "open" && isAdmin && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Begin Evaluation</p>
                  <p className="text-sm text-muted-foreground">
                    Close submissions and begin evaluating bids.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleStatusChange("evaluation")}
                      disabled={updating}
                    >
                      <Search className="mr-2 size-4" />
                      Start Evaluation
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to cancel this tender?"
                          )
                        ) {
                          handleStatusChange("cancelled");
                        }
                      }}
                      disabled={updating}
                    >
                      Cancel Tender
                    </Button>
                  </div>
                </div>
              )}

              {tender.status === "evaluation" && isAdmin && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Award Tender</p>
                  <p className="text-sm text-muted-foreground">
                    Select a winning bid from the submissions table above to
                    award this tender.
                  </p>
                </div>
              )}

              {tender.status === "awarded" && (
                <div className="text-center py-4">
                  <Award className="mx-auto size-8 text-green-500" />
                  <p className="mt-2 text-sm font-medium">Tender Awarded</p>
                  <p className="text-xs text-muted-foreground">
                    Awarded to {tender.awarded_company?.name} for{" "}
                    {formatCurrency(tender.awarded_amount ?? 0)}
                  </p>
                </div>
              )}

              {tender.status === "cancelled" && (
                <div className="text-center py-4">
                  <div className="size-12 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Trash2 className="size-6 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="mt-2 text-sm font-medium text-red-600">
                    Tender Cancelled
                  </p>
                </div>
              )}

              {(tender.status === "awarded" ||
                tender.status === "cancelled") &&
                isAdmin && (
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      onClick={() => handleStatusChange("draft")}
                      disabled={updating}
                    >
                      Reopen as Draft
                    </Button>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <DollarSign className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Estimated Value
                  </p>
                  <p className="text-lg font-bold">
                    {formatCurrency(tender.estimated_value ?? 0)}
                  </p>
                </div>
              </div>
              {tender.awarded_amount !== null && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Award className="size-4 text-green-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Awarded Amount
                      </p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(tender.awarded_amount)}
                      </p>
                    </div>
                  </div>
                  {(tender.estimated_value ?? 0) > 0 && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="size-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          vs Estimate
                        </p>
                        <p
                          className={`text-sm font-medium ${
                            tender.awarded_amount >
                            (tender.estimated_value ?? 0)
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {tender.awarded_amount <=
                          (tender.estimated_value ?? 0)
                            ? "Under"
                            : "Over"}{" "}
                          by{" "}
                          {formatCurrency(
                            Math.abs(
                              tender.awarded_amount -
                                (tender.estimated_value ?? 0)
                            )
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
              <Separator />
              <div className="flex items-center gap-3">
                <Gavel className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Bids Received
                  </p>
                  <p className="text-lg font-bold">{submissions.length}</p>
                </div>
              </div>
              {lowestBidAmount !== null && (
                <div className="flex items-center gap-3">
                  <DollarSign className="size-4 text-green-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Lowest Bid</p>
                    <p className="text-sm font-medium text-green-600">
                      {formatCurrency(lowestBidAmount)}
                    </p>
                  </div>
                </div>
              )}
              {submissions.length > 0 && (
                <div className="flex items-center gap-3">
                  <DollarSign className="size-4 text-red-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Highest Bid
                    </p>
                    <p className="text-sm font-medium text-red-600">
                      {formatCurrency(
                        Math.max(...submissions.map((s) => s.amount))
                      )}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">
                    {formatDate(tender.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="text-sm font-medium">
                    {formatDate(tender.updated_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
