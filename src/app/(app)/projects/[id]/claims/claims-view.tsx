"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle,
  ChevronRight,
  Clock,
  DollarSign,
  FileText,
  Plus,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateClaimDialog } from "@/components/create-claim-dialog";

type ClaimStatus = Database["public"]["Enums"]["claim_status"];

type Claim = Tables<"progress_claims"> & {
  submitted_by_company: { id: string; name: string } | null;
};

type Company = {
  id: string;
  name: string;
};

interface ClaimsViewProps {
  project: { id: string; code: string; name: string };
  claims: Claim[];
  companies: Company[];
  statusFilter: string;
}

const statusColors: Record<ClaimStatus, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  certified: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
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

export function ClaimsView({
  project,
  claims,
  companies,
  statusFilter,
}: ClaimsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAdmin } = useOrganisation();
  const supabase = createClient();

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    router.push(`/projects/${project.id}/claims?${params.toString()}`);
  };

  const handleClaimStatusUpdate = async (claimId: string, newStatus: ClaimStatus) => {
    try {
      const updates: {
        status: ClaimStatus;
        submitted_at?: string;
        certified_at?: string;
        paid_at?: string;
      } = { status: newStatus };

      if (newStatus === "submitted") {
        updates.submitted_at = new Date().toISOString();
      } else if (newStatus === "certified") {
        updates.certified_at = new Date().toISOString();
      } else if (newStatus === "paid") {
        updates.paid_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("progress_claims")
        .update(updates)
        .eq("id", claimId);

      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error("Failed to update claim:", err);
    }
  };

  // Calculate stats
  const totalClaimed = claims.reduce((sum, c) => sum + c.claimed_amount, 0);
  const totalCertified = claims
    .filter((c) => c.status === "certified" || c.status === "paid")
    .reduce((sum, c) => sum + (c.certified_amount || c.claimed_amount), 0);
  const totalPaid = claims
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + (c.certified_amount || c.claimed_amount), 0);
  const pendingCount = claims.filter(
    (c) => c.status === "draft" || c.status === "submitted"
  ).length;

  // Get the sum of all paid/certified claims for the next claim's previous_claims_total
  const previousClaimsTotal = claims
    .filter((c) => c.status === "paid" || c.status === "certified")
    .reduce((sum, c) => sum + (c.certified_amount || c.claimed_amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/projects/${project.id}`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href={`/projects/${project.id}`} className="hover:underline">
              {project.code}
            </Link>
            <ChevronRight className="size-4" />
            <span>Progress Claims</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
        </div>
        <CreateClaimDialog
          projectId={project.id}
          companies={companies}
          previousClaimsTotal={previousClaimsTotal}
        >
          <Button size="sm">
            <Plus className="mr-2 size-4" />
            New Claim
          </Button>
        </CreateClaimDialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileText className="size-4 text-blue-500" />
              Total Claims
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{claims.length}</p>
            <p className="text-xs text-muted-foreground">{pendingCount} pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <DollarSign className="size-4 text-yellow-500" />
              Total Claimed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalClaimed)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <BadgeCheck className="size-4 text-green-500" />
              Total Certified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalCertified)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CheckCircle className="size-4 text-purple-500" />
              Total Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Progress Claims</CardTitle>
              <CardDescription>
                {claims.length} claim{claims.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="certified">Certified</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {claims.length === 0 ? (
            <div className="py-8 text-center">
              <FileText className="mx-auto size-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No claims found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a progress claim to track payments
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">No.</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead className="text-right">Claimed</TableHead>
                  <TableHead className="text-right">Certified</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && <TableHead className="w-[140px]">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {claims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell>
                      <span className="font-mono text-sm font-medium">
                        PC-{String(claim.claim_number).padStart(3, "0")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {formatDate(claim.period_start)} - {formatDate(claim.period_end)}
                      </p>
                    </TableCell>
                    <TableCell>
                      {claim.submitted_by_company?.name || "-"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(claim.claimed_amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {claim.certified_amount !== null
                        ? formatCurrency(claim.certified_amount)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColors[claim.status]}>
                        {statusLabels[claim.status]}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        {claim.status === "draft" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleClaimStatusUpdate(claim.id, "submitted")}
                          >
                            <Send className="mr-1 size-3" />
                            Submit
                          </Button>
                        )}
                        {claim.status === "submitted" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleClaimStatusUpdate(claim.id, "certified")}
                          >
                            <BadgeCheck className="mr-1 size-3" />
                            Certify
                          </Button>
                        )}
                        {claim.status === "certified" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleClaimStatusUpdate(claim.id, "paid")}
                          >
                            <CheckCircle className="mr-1 size-3" />
                            Mark Paid
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
