"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  ClipboardCheck,
  Plus,
} from "lucide-react";
import type { Tables, Database } from "@/lib/supabase/database.types";
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
import { CreateSubmittalDialog } from "@/components/create-submittal-dialog";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";

type SubmittalStatus = Database["public"]["Enums"]["submittal_status"];

type Submittal = Tables<"submittals"> & {
  submitted_by_company: { id: string; name: string } | null;
  reviewer: { id: string; full_name: string | null } | null;
};

type Company = { id: string; name: string };
type Member = { id: string; full_name: string | null };

interface SubmittalsViewProps {
  project: { id: string; code: string; name: string };
  submittals: Submittal[];
  companies: Company[];
  members: Member[];
  statusFilter: string;
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

function isOverdue(dateRequired: string | null, status: string): boolean {
  if (!dateRequired) return false;
  if (
    status === "approved" ||
    status === "approved_as_noted" ||
    status === "rejected"
  )
    return false;
  return new Date(dateRequired) < new Date();
}

export function SubmittalsView({
  project,
  submittals,
  companies,
  members,
  statusFilter,
}: SubmittalsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    router.push(`/projects/${project.id}/submittals?${params.toString()}`);
  };

  // Stats
  const pendingCount = submittals.filter(
    (s) => s.status === "submitted" || s.status === "under_review"
  ).length;
  const approvedCount = submittals.filter(
    (s) => s.status === "approved" || s.status === "approved_as_noted"
  ).length;
  const actionCount = submittals.filter(
    (s) => s.status === "revise_resubmit" || s.status === "rejected"
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`/projects/${project.id}`}
        title={project.name}
        breadcrumbs={[
          { label: project.code, href: `/projects/${project.id}` },
          { label: "Submittals" },
        ]}
      >
        <CreateSubmittalDialog
          projectId={project.id}
          companies={companies}
          members={members}
        >
          <Button size="sm">
            <Plus className="mr-2 size-4" />
            New Submittal
          </Button>
        </CreateSubmittalDialog>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={ClipboardCheck} label="Total Submittals" value={submittals.length} iconClassName="text-violet-500" />
        <StatCard icon={ClipboardCheck} label="Pending Review" value={pendingCount} iconClassName="text-violet-500" />
        <StatCard icon={ClipboardCheck} label="Approved" value={approvedCount} iconClassName="text-violet-500" />
        <StatCard icon={ClipboardCheck} label="Action Required" value={actionCount} iconClassName="text-violet-500" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Submittal Register</CardTitle>
              <CardDescription>
                {submittals.length} submittal
                {submittals.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
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
          </div>
        </CardHeader>
        <CardContent>
          {submittals.length === 0 ? (
            <EmptyState
              icon={ClipboardCheck}
              title="No submittals found"
              description="Create a submittal to track document reviews"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">No.</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Spec</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Reviewer</TableHead>
                  <TableHead>Date Required</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submittals.map((submittal) => {
                  const overdue = isOverdue(
                    submittal.date_required,
                    submittal.status
                  );
                  return (
                    <TableRow key={submittal.id}>
                      <TableCell>
                        <Link
                          href={`/projects/${project.id}/submittals/${submittal.id}`}
                          className="font-mono text-sm font-medium hover:underline"
                        >
                          S-
                          {String(submittal.submittal_number).padStart(3, "0")}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/projects/${project.id}/submittals/${submittal.id}`}
                          className="hover:underline"
                        >
                          {submittal.title}
                        </Link>
                        {submittal.revision > 0 && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            (Rev {submittal.revision})
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {submittal.spec_section || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {typeLabels[submittal.submittal_type] ||
                          submittal.submittal_type}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={statusColors[submittal.status]}
                        >
                          {statusLabels[submittal.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {submittal.submitted_by_company?.name || "-"}
                      </TableCell>
                      <TableCell>
                        {submittal.reviewer?.full_name || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4 text-muted-foreground" />
                          <span
                            className={
                              overdue ? "text-destructive font-medium" : ""
                            }
                          >
                            {formatDate(submittal.date_required)}
                          </span>
                          {overdue && (
                            <Badge
                              variant="destructive"
                              className="text-xs"
                            >
                              Overdue
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
