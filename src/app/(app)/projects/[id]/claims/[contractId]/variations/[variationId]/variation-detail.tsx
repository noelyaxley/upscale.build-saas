"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  DollarSign,
  FileEdit,
  Pencil,
  RotateCcw,
  Send,
  User,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type VariationStatus = Database["public"]["Enums"]["variation_status"];

type Variation = Tables<"variations"> & {
  submitted_by_company: { id: string; name: string } | null;
  created_by: { id: string; full_name: string | null } | null;
  approved_by: { id: string; full_name: string | null } | null;
};

type VariationComment = {
  id: string;
  variation_id: string;
  author_user_id: string | null;
  body: string;
  created_at: string;
  author: { id: string; full_name: string | null } | null;
};

interface VariationDetailProps {
  project: { id: string; code: string; name: string };
  contract: { id: string; name: string; contract_number: number };
  variation: Variation;
  comments: VariationComment[];
}

const statusColors: Record<VariationStatus, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  under_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

const statusLabels: Record<VariationStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
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

export function VariationDetail({ project, contract, variation, comments }: VariationDetailProps) {
  const [updating, setUpdating] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editDescription, setEditDescription] = useState(variation.description || "");
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editTitle, setEditTitle] = useState(variation.title);
  const [editCostImpact, setEditCostImpact] = useState(
    ((variation.cost_impact ?? 0) / 100).toString()
  );
  const [editTimeImpact, setEditTimeImpact] = useState(
    (variation.time_impact ?? 0).toString()
  );
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const router = useRouter();
  const { isAdmin, profile } = useOrganisation();
  const supabase = createClient();

  const canEdit =
    variation.status === "draft" ||
    variation.status === "submitted" ||
    variation.status === "under_review";

  const handleSaveDescription = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("variations")
        .update({ description: editDescription })
        .eq("id", variation.id);
      if (error) throw error;
      setIsEditingDescription(false);
      router.refresh();
    } catch (err) {
      console.error("Failed to update description:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveDetails = async () => {
    setUpdating(true);
    try {
      const costCents = editCostImpact
        ? Math.round(parseFloat(editCostImpact) * 100)
        : 0;
      const timeDays = editTimeImpact ? parseInt(editTimeImpact, 10) : 0;

      const { error } = await supabase
        .from("variations")
        .update({
          title: editTitle,
          cost_impact: costCents,
          time_impact: timeDays,
        })
        .eq("id", variation.id);
      if (error) throw error;
      setIsEditingDetails(false);
      router.refresh();
    } catch (err) {
      console.error("Failed to update variation:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleUnapprove = async () => {
    if (!window.confirm("Revert this variation to Under Review? This will clear the approval.")) return;
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("variations")
        .update({
          status: "under_review" as VariationStatus,
          approved_at: null,
          approved_by_user_id: null,
        })
        .eq("id", variation.id);
      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error("Failed to unapprove variation:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    setSending(true);
    try {
      const { error } = await supabase
        .from("variation_comments")
        .insert({
          variation_id: variation.id,
          author_user_id: profile.id,
          body: newComment.trim(),
        });
      if (error) throw error;
      setNewComment("");
      router.refresh();
    } catch (err) {
      console.error("Failed to send comment:", err);
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus: VariationStatus, reason?: string) => {
    setUpdating(true);
    try {
      const updates: {
        status: VariationStatus;
        submitted_at?: string | null;
        approved_at?: string | null;
        approved_by_user_id?: string | null;
        rejection_reason?: string | null;
      } = { status: newStatus };

      if (newStatus === "submitted") {
        updates.submitted_at = new Date().toISOString();
      } else if (newStatus === "approved") {
        updates.approved_at = new Date().toISOString();
        updates.approved_by_user_id = profile.id;
      } else if (newStatus === "rejected") {
        updates.rejection_reason = reason || null;
      }

      const { error } = await supabase
        .from("variations")
        .update(updates)
        .eq("id", variation.id);

      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdating(false);
    }
  };

  const workflowSteps = [
    { key: "draft", label: "Draft", icon: FileEdit },
    { key: "submitted", label: "Submitted", icon: Send },
    { key: "under_review", label: "Review", icon: Clock },
    { key: "approved", label: "Approved", icon: CheckCircle },
  ];

  const currentStepIndex = workflowSteps.findIndex((s) => s.key === variation.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/projects/${project.id}/claims/${contract.id}`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href={`/projects/${project.id}`} className="hover:underline">
              {project.code}
            </Link>
            <ChevronRight className="size-4" />
            <Link href={`/projects/${project.id}/claims`} className="hover:underline">
              Progress Claims
            </Link>
            <ChevronRight className="size-4" />
            <Link href={`/projects/${project.id}/claims/${contract.id}`} className="hover:underline">
              {contract.name}
            </Link>
            <ChevronRight className="size-4" />
            <span>{variation.title}</span>
          </div>
          {isEditingDetails ? (
            <Input
              className="text-2xl font-bold h-auto py-1"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
          ) : (
            <h1 className="text-2xl font-bold tracking-tight">{variation.title}</h1>
          )}
        </div>
        <div className="flex items-center gap-2">
          {canEdit && !isEditingDetails && (
            <Button size="sm" variant="ghost" onClick={() => setIsEditingDetails(true)}>
              <Pencil className="mr-2 size-4" />
              Edit
            </Button>
          )}
          <Badge variant="secondary" className={statusColors[variation.status]}>
            {statusLabels[variation.status]}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Description</CardTitle>
                {!isEditingDescription && (
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingDescription(true)}>
                    <Pencil className="mr-2 size-4" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditingDescription ? (
                <div className="space-y-3">
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="min-h-[120px]"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsEditingDescription(false);
                        setEditDescription(variation.description || "");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveDescription} disabled={updating}>
                      {updating ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">
                  {variation.description || "No description provided."}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Reason */}
          {variation.reason && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Reason for Change</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{variation.reason}</p>
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Comments ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No comments yet.</p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => {
                    const initials = (comment.author?.full_name || "?")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();
                    return (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {comment.author?.full_name || "Unknown"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{comment.body}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <Separator />
              <div className="flex gap-3">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleSendComment}
                  disabled={sending || !newComment.trim()}
                >
                  <Send className="mr-2 size-4" />
                  {sending ? "Sending..." : "Send"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Workflow */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Approval Workflow</CardTitle>
              <CardDescription>Track variation through approval stages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Visual workflow */}
              {variation.status !== "rejected" && variation.status !== "cancelled" && (
                <div className="flex items-center justify-center gap-2">
                  {workflowSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = step.key === variation.status;
                    const isPast = index < currentStepIndex;
                    const isFuture = index > currentStepIndex;

                    return (
                      <div key={step.key} className="flex items-center gap-2">
                        {index > 0 && (
                          <ArrowRight className={`size-4 ${isPast ? "text-green-500" : "text-muted-foreground"}`} />
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

              {variation.status === "rejected" && (
                <div className="flex flex-col items-center gap-2 py-4">
                  <div className="size-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <XCircle className="size-6 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="font-medium text-red-600">Variation Rejected</p>
                  {variation.rejection_reason && (
                    <p className="text-sm text-muted-foreground text-center max-w-md">
                      {variation.rejection_reason}
                    </p>
                  )}
                </div>
              )}

              <Separator />

              {/* Actions */}
              {variation.status === "draft" && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Submit for Approval</p>
                  <p className="text-sm text-muted-foreground">
                    Once submitted, the variation will be reviewed by the project team.
                  </p>
                  <Button onClick={() => handleStatusChange("submitted")} disabled={updating}>
                    <Send className="mr-2 size-4" />
                    Submit Variation
                  </Button>
                </div>
              )}

              {variation.status === "submitted" && isAdmin && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Begin Review</p>
                  <Button
                    onClick={() => handleStatusChange("under_review")}
                    disabled={updating}
                  >
                    <Clock className="mr-2 size-4" />
                    Start Review
                  </Button>
                </div>
              )}

              {variation.status === "under_review" && isAdmin && (
                <div className="space-y-4">
                  <p className="text-sm font-medium">Review Decision</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleStatusChange("approved")}
                      disabled={updating}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-2 size-4" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => {
                        const reason = window.prompt("Reason for rejection:");
                        if (reason !== null) {
                          handleStatusChange("rejected", reason);
                        }
                      }}
                      disabled={updating}
                    >
                      <XCircle className="mr-2 size-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              )}

              {variation.status === "approved" && (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <CheckCircle className="mx-auto size-8 text-green-500" />
                    <p className="mt-2 text-sm font-medium">Variation Approved</p>
                    <p className="text-xs text-muted-foreground">
                      Approved on {formatDate(variation.approved_at)} by{" "}
                      {variation.approved_by?.full_name || "Unknown"}
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Revert to review to modify the variation details.
                      </p>
                      <Button
                        variant="outline"
                        className="text-amber-600 border-amber-200 hover:bg-amber-50"
                        onClick={handleUnapprove}
                        disabled={updating}
                      >
                        <RotateCcw className="mr-2 size-4" />
                        Unapprove
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {(variation.status === "rejected" || variation.status === "cancelled") && isAdmin && (
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
          {/* Impact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Impact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditingDetails ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="edit-cost">Cost Impact ($)</Label>
                    <Input
                      id="edit-cost"
                      type="number"
                      step="0.01"
                      value={editCostImpact}
                      onChange={(e) => setEditCostImpact(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-time">Time Impact (days)</Label>
                    <Input
                      id="edit-time"
                      type="number"
                      step="1"
                      value={editTimeImpact}
                      onChange={(e) => setEditTimeImpact(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setIsEditingDetails(false);
                        setEditTitle(variation.title);
                        setEditCostImpact(((variation.cost_impact ?? 0) / 100).toString());
                        setEditTimeImpact((variation.time_impact ?? 0).toString());
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={handleSaveDetails}
                      disabled={updating || !editTitle.trim()}
                    >
                      {updating ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <DollarSign className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Cost Impact</p>
                      <p
                        className={`text-lg font-bold ${
                          (variation.cost_impact ?? 0) > 0
                            ? "text-red-600"
                            : (variation.cost_impact ?? 0) < 0
                            ? "text-green-600"
                            : ""
                        }`}
                      >
                        {(variation.cost_impact ?? 0) > 0 ? "+" : ""}
                        {formatCurrency(variation.cost_impact ?? 0)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Time Impact</p>
                      <p
                        className={`text-lg font-bold ${
                          (variation.time_impact ?? 0) > 0
                            ? "text-red-600"
                            : (variation.time_impact ?? 0) < 0
                            ? "text-green-600"
                            : ""
                        }`}
                      >
                        {(variation.time_impact ?? 0) > 0 ? "+" : ""}
                        {variation.time_impact ?? 0} days
                      </p>
                    </div>
                  </div>
                </>
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
                <Building2 className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Submitted By</p>
                  <p className="text-sm font-medium">
                    {variation.submitted_by_company?.name || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Created By</p>
                  <p className="text-sm font-medium">
                    {variation.created_by?.full_name || "-"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Calendar className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">{formatDate(variation.created_at)}</p>
                </div>
              </div>

              {variation.submitted_at && (
                <div className="flex items-center gap-3">
                  <Send className="size-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Submitted</p>
                    <p className="text-sm font-medium">
                      {formatDate(variation.submitted_at)}
                    </p>
                  </div>
                </div>
              )}

              {variation.approved_at && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="size-4 text-green-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Approved</p>
                    <p className="text-sm font-medium">
                      {formatDate(variation.approved_at)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
