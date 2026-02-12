"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CheckCircle,
  CircleDot,
  Clock,
  FileText,
  Hash,
  Send,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Tables, Database } from "@/lib/supabase/database.types";
import { useOrganisation } from "@/lib/context/organisation";
import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type SubmittalStatus = Database["public"]["Enums"]["submittal_status"];

type Submittal = Tables<"submittals"> & {
  submitted_by_company: { id: string; name: string } | null;
  reviewer: { id: string; full_name: string | null } | null;
  creator: { id: string; full_name: string | null } | null;
};

type Comment = Tables<"submittal_comments"> & {
  author: { id: string; full_name: string | null } | null;
};

type Member = { id: string; full_name: string | null };

interface SubmittalDetailProps {
  project: { id: string; code: string; name: string };
  submittal: Submittal;
  comments: Comment[];
  members: Member[];
}

const statusColors: Record<SubmittalStatus, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  submitted:
    "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300",
  under_review:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  approved:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  approved_as_noted:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  revise_resubmit:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const statusLabels: Record<SubmittalStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  approved: "Approved",
  approved_as_noted: "Approved as Noted",
  revise_resubmit: "Revise & Resubmit",
  rejected: "Rejected",
};

const typeLabels: Record<string, string> = {
  shop_drawing: "Shop Drawing",
  product_data: "Product Data",
  sample: "Sample",
  mock_up: "Mock-up",
  certificate: "Certificate",
  other: "Other",
};

function formatDate(date: string | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date: string): string {
  return new Date(date).toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const isFinalStatus = (status: SubmittalStatus) =>
  status === "approved" ||
  status === "approved_as_noted" ||
  status === "rejected";

export function SubmittalDetail({
  project,
  submittal,
  comments,
  members,
}: SubmittalDetailProps) {
  const [newComment, setNewComment] = useState("");
  const [reviewerNotes, setReviewerNotes] = useState(
    submittal.reviewer_notes || ""
  );
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const router = useRouter();
  const { profile } = useOrganisation();
  const supabase = createClient();

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    setSending(true);
    try {
      const { error } = await supabase.from("submittal_comments").insert({
        submittal_id: submittal.id,
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

  const handleStatusChange = async (newStatus: SubmittalStatus) => {
    setUpdatingStatus(true);
    try {
      const updates: Record<string, unknown> = { status: newStatus };

      // Set date_submitted when moving to submitted
      if (newStatus === "submitted" && !submittal.date_submitted) {
        updates.date_submitted = new Date().toISOString().split("T")[0];
      }

      // Set date_returned for review outcomes
      if (
        newStatus === "approved" ||
        newStatus === "approved_as_noted" ||
        newStatus === "revise_resubmit" ||
        newStatus === "rejected"
      ) {
        updates.date_returned = new Date().toISOString().split("T")[0];
        updates.reviewer_notes = reviewerNotes || null;
      }

      // Increment revision when resubmitting
      if (
        newStatus === "submitted" &&
        submittal.status === "revise_resubmit"
      ) {
        updates.revision = submittal.revision + 1;
        updates.date_submitted = new Date().toISOString().split("T")[0];
        updates.date_returned = null;
        updates.reviewer_notes = null;
      }

      // Clear dates on reopen
      if (newStatus === "draft") {
        updates.date_returned = null;
        updates.reviewer_notes = null;
      }

      const { error } = await supabase
        .from("submittals")
        .update(updates)
        .eq("id", submittal.id);

      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleReviewerChange = async (reviewerId: string) => {
    await supabase
      .from("submittals")
      .update({ assigned_reviewer_id: reviewerId })
      .eq("id", submittal.id);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`/projects/${project.id}/submittals`}
        title={submittal.title}
        breadcrumbs={[
          { label: project.code, href: `/projects/${project.id}` },
          { label: "Submittals", href: `/projects/${project.id}/submittals` },
          { label: `S-${String(submittal.submittal_number).padStart(3, "0")}` },
        ]}
        badge={
          <Badge variant="secondary" className={statusColors[submittal.status]}>
            {statusLabels[submittal.status]}
          </Badge>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              {submittal.description ? (
                <p className="text-sm whitespace-pre-wrap">
                  {submittal.description}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No description provided.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Reviewer Notes (shown when returned) */}
          {submittal.reviewer_notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Reviewer Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">
                  {submittal.reviewer_notes}
                </p>
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
                <p className="text-sm text-muted-foreground text-center py-4">
                  No comments yet. Start the discussion below.
                </p>
              ) : (
                comments.map((comment) => {
                  const initial =
                    comment.author?.full_name?.charAt(0).toUpperCase() || "?";
                  return (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="text-xs">
                          {initial}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {comment.author?.full_name || "Unknown"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">
                          {comment.body}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}

              <Separator />

              <div className="space-y-3">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSendComment}
                    disabled={sending || !newComment.trim()}
                    size="sm"
                  >
                    <Send className="mr-2 size-4" />
                    {sending ? "Sending..." : "Send"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={submittal.status}
                onValueChange={(value) =>
                  handleStatusChange(value as SubmittalStatus)
                }
                disabled={updatingStatus}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="approved_as_noted">
                    Approved as Noted
                  </SelectItem>
                  <SelectItem value="revise_resubmit">
                    Revise & Resubmit
                  </SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              {/* Contextual action buttons */}
              {submittal.status === "draft" && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleStatusChange("submitted")}
                  disabled={updatingStatus}
                >
                  <Send className="mr-2 size-4" />
                  Submit for Review
                </Button>
              )}

              {submittal.status === "submitted" && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleStatusChange("under_review")}
                  disabled={updatingStatus}
                >
                  <FileText className="mr-2 size-4" />
                  Begin Review
                </Button>
              )}

              {submittal.status === "under_review" && (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Reviewer notes (optional)..."
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleStatusChange("approved")}
                      disabled={updatingStatus}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-emerald-600 text-emerald-600"
                      onClick={() => handleStatusChange("approved_as_noted")}
                      disabled={updatingStatus}
                    >
                      As Noted
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-orange-600 text-orange-600"
                      onClick={() => handleStatusChange("revise_resubmit")}
                      disabled={updatingStatus}
                    >
                      Revise
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-600 text-red-600"
                      onClick={() => handleStatusChange("rejected")}
                      disabled={updatingStatus}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              )}

              {submittal.status === "revise_resubmit" && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleStatusChange("submitted")}
                  disabled={updatingStatus}
                >
                  <Send className="mr-2 size-4" />
                  Resubmit (Rev {submittal.revision + 1})
                </Button>
              )}

              {isFinalStatus(submittal.status) && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleStatusChange("draft")}
                  disabled={updatingStatus}
                >
                  Reopen
                </Button>
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
                <FileText className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-sm font-medium">
                    {typeLabels[submittal.submittal_type] ||
                      submittal.submittal_type}
                  </p>
                </div>
              </div>

              {submittal.spec_section && (
                <div className="flex items-center gap-3">
                  <Hash className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Spec Section
                    </p>
                    <p className="text-sm font-medium">
                      {submittal.spec_section}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Hash className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Revision</p>
                  <p className="text-sm font-medium">{submittal.revision}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Submitted By</p>
                  <p className="text-sm font-medium">
                    {submittal.submitted_by_company?.name || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CircleDot className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Reviewer</p>
                  {!isFinalStatus(submittal.status) ? (
                    <Select
                      value={submittal.assigned_reviewer_id || ""}
                      onValueChange={handleReviewerChange}
                    >
                      <SelectTrigger className="h-8 mt-1">
                        <SelectValue placeholder="Assign reviewer" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.full_name || "Unnamed"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm font-medium">
                      {submittal.reviewer?.full_name || "Unassigned"}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Date Required</p>
                  <p className="text-sm font-medium">
                    {formatDate(submittal.date_required)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Date Submitted
                  </p>
                  <p className="text-sm font-medium">
                    {formatDate(submittal.date_submitted)}
                  </p>
                </div>
              </div>

              {submittal.date_returned && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Date Returned
                    </p>
                    <p className="text-sm font-medium">
                      {formatDate(submittal.date_returned)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Clock className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">
                    {formatDate(submittal.created_at)}
                  </p>
                </div>
              </div>

              {submittal.creator && (
                <div className="flex items-center gap-3">
                  <User className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Created By</p>
                    <p className="text-sm font-medium">
                      {submittal.creator.full_name || "-"}
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
