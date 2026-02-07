"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle,
  ChevronRight,
  Clock,
  DollarSign,
  FileText,
  Send,
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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ClaimStatus = Database["public"]["Enums"]["claim_status"];

type Claim = Tables<"progress_claims"> & {
  submitted_by_company: { id: string; name: string } | null;
};

type LineItem = Tables<"claim_line_items"> & {
  contract_item: {
    id: string;
    parent_id: string | null;
    sort_order: number;
  } | null;
};

interface ClaimDetailProps {
  project: { id: string; code: string; name: string };
  contract: { id: string; contract_number: number; name: string };
  claim: Claim;
  lineItems: LineItem[];
}

const statusColors: Record<ClaimStatus, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  submitted:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  certified:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  paid: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  disputed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const statusLabels: Record<ClaimStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  certified: "Certified",
  paid: "Paid",
  disputed: "Disputed",
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

export function ClaimDetail({
  project,
  contract,
  claim,
  lineItems,
}: ClaimDetailProps) {
  const [updating, setUpdating] = useState(false);
  const [certifiedAmounts, setCertifiedAmounts] = useState<
    Record<string, string>
  >(() => {
    const initial: Record<string, string> = {};
    for (const li of lineItems) {
      initial[li.id] =
        li.certified_this_claim > 0
          ? (li.certified_this_claim / 100).toString()
          : (li.this_claim / 100).toString();
    }
    return initial;
  });
  const router = useRouter();
  const { isAdmin, profile } = useOrganisation();
  const supabase = createClient();

  const isCertifying = claim.status === "submitted" && isAdmin;

  const totalClaimed = lineItems.reduce((sum, li) => sum + li.this_claim, 0);
  const totalPrevious = lineItems.reduce(
    (sum, li) => sum + li.previous_claimed,
    0
  );
  const totalContractValue = lineItems.reduce(
    (sum, li) => sum + li.contract_value,
    0
  );
  const totalTotalClaimed = lineItems.reduce(
    (sum, li) => sum + li.total_claimed,
    0
  );

  const getCertifiedCents = (liId: string): number => {
    const val = certifiedAmounts[liId];
    if (!val) return 0;
    return Math.round(parseFloat(val) * 100);
  };

  const totalCertifiedThisClaim = lineItems.reduce(
    (sum, li) => sum + getCertifiedCents(li.id),
    0
  );

  const handleStatusUpdate = async (newStatus: ClaimStatus) => {
    setUpdating(true);
    try {
      const updates: Record<string, unknown> = { status: newStatus };

      if (newStatus === "submitted") {
        updates.submitted_at = new Date().toISOString();
      } else if (newStatus === "paid") {
        updates.paid_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("progress_claims")
        .update(updates)
        .eq("id", claim.id);

      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error("Failed to update claim:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleCertify = async () => {
    setUpdating(true);
    try {
      // Update each line item with certified amount
      for (const li of lineItems) {
        const certifiedCents = getCertifiedCents(li.id);
        const { error } = await supabase
          .from("claim_line_items")
          .update({ certified_this_claim: certifiedCents })
          .eq("id", li.id);
        if (error) throw error;
      }

      // Update claim status and certified amount
      const { error } = await supabase
        .from("progress_claims")
        .update({
          status: "certified",
          certified_amount: totalCertifiedThisClaim,
          certified_at: new Date().toISOString(),
          certified_by_user_id: profile.id,
        })
        .eq("id", claim.id);

      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error("Failed to certify claim:", err);
    } finally {
      setUpdating(false);
    }
  };

  const workflowSteps = [
    { key: "draft", label: "Draft", icon: FileText },
    { key: "submitted", label: "Submitted", icon: Send },
    { key: "certified", label: "Certified", icon: BadgeCheck },
    { key: "paid", label: "Paid", icon: CheckCircle },
  ];

  const currentStepIndex = workflowSteps.findIndex(
    (s) => s.key === claim.status
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/projects/${project.id}/claims/${contract.id}`}>
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
              href={`/projects/${project.id}/claims`}
              className="hover:underline"
            >
              Progress Claims
            </Link>
            <ChevronRight className="size-4" />
            <Link
              href={`/projects/${project.id}/claims/${contract.id}`}
              className="hover:underline"
            >
              CT-{String(contract.contract_number).padStart(3, "0")}
            </Link>
            <ChevronRight className="size-4" />
            <span className="font-mono">
              PC-{String(claim.claim_number).padStart(3, "0")}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Progress Claim #{claim.claim_number}
          </h1>
        </div>
        <Badge variant="secondary" className={statusColors[claim.status]}>
          {statusLabels[claim.status]}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Claim info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Claim Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Period</p>
                    <p className="text-sm font-medium">
                      {formatDate(claim.period_start)} -{" "}
                      {formatDate(claim.period_end)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Submitted By
                    </p>
                    <p className="text-sm font-medium">
                      {claim.submitted_by_company?.name || "-"}
                    </p>
                  </div>
                </div>
              </div>
              {claim.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm whitespace-pre-wrap">
                      {claim.notes}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Line Items Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Claim Breakdown</CardTitle>
              <CardDescription>
                {lineItems.length} line item
                {lineItems.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Item</TableHead>
                      <TableHead className="text-right min-w-[110px]">
                        Contract Value
                      </TableHead>
                      <TableHead className="text-right min-w-[120px]">
                        Previously Claimed
                      </TableHead>
                      <TableHead className="text-right min-w-[110px]">
                        This Claim
                      </TableHead>
                      <TableHead className="text-right min-w-[110px]">
                        Total Claimed
                      </TableHead>
                      <TableHead className="text-right min-w-[60px]">
                        %
                      </TableHead>
                      {(isCertifying ||
                        claim.status === "certified" ||
                        claim.status === "paid") && (
                        <TableHead className="text-right min-w-[110px]">
                          Certified
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((li) => (
                      <TableRow key={li.id}>
                        <TableCell className="font-medium">
                          {li.description}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(li.contract_value)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {li.previous_claimed > 0
                            ? formatCurrency(li.previous_claimed)
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(li.this_claim)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(li.total_claimed)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {li.percent_complete !== null &&
                          li.percent_complete > 0
                            ? `${li.percent_complete}%`
                            : "-"}
                        </TableCell>
                        {isCertifying && (
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              className="w-28 ml-auto text-right"
                              value={certifiedAmounts[li.id] ?? ""}
                              onChange={(e) =>
                                setCertifiedAmounts({
                                  ...certifiedAmounts,
                                  [li.id]: e.target.value,
                                })
                              }
                            />
                          </TableCell>
                        )}
                        {!isCertifying &&
                          (claim.status === "certified" ||
                            claim.status === "paid") && (
                            <TableCell className="text-right font-medium">
                              {formatCurrency(li.certified_this_claim)}
                            </TableCell>
                          )}
                      </TableRow>
                    ))}
                    {/* Totals */}
                    <TableRow className="font-medium border-t-2">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(totalContractValue)}
                      </TableCell>
                      <TableCell className="text-right">
                        {totalPrevious > 0
                          ? formatCurrency(totalPrevious)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(totalClaimed)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(totalTotalClaimed)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {totalContractValue > 0
                          ? `${((totalTotalClaimed / totalContractValue) * 100).toFixed(0)}%`
                          : "-"}
                      </TableCell>
                      {(isCertifying ||
                        claim.status === "certified" ||
                        claim.status === "paid") && (
                        <TableCell className="text-right">
                          {isCertifying
                            ? formatCurrency(totalCertifiedThisClaim)
                            : formatCurrency(
                                claim.certified_amount ?? totalClaimed
                              )}
                        </TableCell>
                      )}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Status Workflow */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status Workflow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {claim.status !== "disputed" && (
                <div className="flex items-center justify-center gap-2">
                  {workflowSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = step.key === claim.status;
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

              {claim.status === "draft" && isAdmin && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Submit Claim</p>
                  <p className="text-sm text-muted-foreground">
                    Submit this claim for certification.
                  </p>
                  <Button
                    onClick={() => handleStatusUpdate("submitted")}
                    disabled={updating}
                  >
                    <Send className="mr-2 size-4" />
                    Submit
                  </Button>
                </div>
              )}

              {isCertifying && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Certify Claim</p>
                  <p className="text-sm text-muted-foreground">
                    Review and certify the claimed amounts per line item above,
                    then certify the claim.
                  </p>
                  <Button
                    onClick={handleCertify}
                    disabled={updating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <BadgeCheck className="mr-2 size-4" />
                    Certify Claim
                  </Button>
                </div>
              )}

              {claim.status === "certified" && isAdmin && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Mark as Paid</p>
                  <p className="text-sm text-muted-foreground">
                    Mark this certified claim as paid.
                  </p>
                  <Button
                    onClick={() => handleStatusUpdate("paid")}
                    disabled={updating}
                  >
                    <CheckCircle className="mr-2 size-4" />
                    Mark Paid
                  </Button>
                </div>
              )}

              {claim.status === "paid" && (
                <div className="text-center py-4">
                  <CheckCircle className="mx-auto size-8 text-purple-500" />
                  <p className="mt-2 text-sm font-medium">Claim Paid</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(claim.paid_at)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <DollarSign className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    This Claim
                  </p>
                  <p className="text-lg font-bold">
                    {formatCurrency(claim.claimed_amount)}
                  </p>
                </div>
              </div>
              {(claim.status === "certified" || claim.status === "paid") && (
                <div className="flex items-center gap-3">
                  <BadgeCheck className="size-4 text-green-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Certified
                    </p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(
                        claim.certified_amount ?? claim.claimed_amount
                      )}
                    </p>
                  </div>
                </div>
              )}
              <Separator />
              <div className="flex items-center gap-3">
                <DollarSign className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Previous Claims
                  </p>
                  <p className="text-sm font-medium">
                    {formatCurrency(claim.previous_claims_total)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Cumulative
                  </p>
                  <p className="text-sm font-medium">
                    {formatCurrency(
                      claim.previous_claims_total + claim.claimed_amount
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm font-medium">
                  {formatDate(claim.created_at)}
                </p>
              </div>
              {claim.submitted_at && (
                <div>
                  <p className="text-xs text-muted-foreground">Submitted</p>
                  <p className="text-sm font-medium">
                    {formatDate(claim.submitted_at)}
                  </p>
                </div>
              )}
              {claim.certified_at && (
                <div>
                  <p className="text-xs text-muted-foreground">Certified</p>
                  <p className="text-sm font-medium">
                    {formatDate(claim.certified_at)}
                  </p>
                </div>
              )}
              {claim.paid_at && (
                <div>
                  <p className="text-xs text-muted-foreground">Paid</p>
                  <p className="text-sm font-medium">
                    {formatDate(claim.paid_at)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
