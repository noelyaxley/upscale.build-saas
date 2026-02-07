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
import { Separator } from "@/components/ui/separator";

type VariationStatus = Database["public"]["Enums"]["variation_status"];

type Variation = Tables<"variations"> & {
  submitted_by_company: { id: string; name: string } | null;
  created_by: { id: string; full_name: string | null } | null;
  approved_by: { id: string; full_name: string | null } | null;
};

interface VariationDetailProps {
  project: { id: string; code: string; name: string };
  contract: { id: string; name: string; contract_number: number };
  variation: Variation;
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

export function VariationDetail({ project, contract, variation }: VariationDetailProps) {
  const [updating, setUpdating] = useState(false);
  const router = useRouter();
  const { isAdmin, profile } = useOrganisation();
  const supabase = createClient();

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
            <span className="font-mono">
              V-{String(variation.variation_number).padStart(3, "0")}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{variation.title}</h1>
        </div>
        <Badge variant="secondary" className={statusColors[variation.status]}>
          {statusLabels[variation.status]}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">
                {variation.description || "No description provided."}
              </p>
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
                <div className="text-center py-4">
                  <CheckCircle className="mx-auto size-8 text-green-500" />
                  <p className="mt-2 text-sm font-medium">Variation Approved</p>
                  <p className="text-xs text-muted-foreground">
                    Approved on {formatDate(variation.approved_at)} by{" "}
                    {variation.approved_by?.full_name || "Unknown"}
                  </p>
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
