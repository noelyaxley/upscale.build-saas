"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  CheckCircle,
  Clock,
  FileText,
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
import { CreateEotDialog } from "@/components/create-eot-dialog";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";

type EotStatus = Database["public"]["Enums"]["eot_status"];

type Eot = Tables<"extension_of_time"> & {
  submitted_by_company: { id: string; name: string } | null;
  approved_by: { id: string; full_name: string | null } | null;
};

type Company = {
  id: string;
  name: string;
};

interface EotViewProps {
  project: { id: string; code: string; name: string; end_date: string | null };
  eots: Eot[];
  companies: Company[];
  statusFilter: string;
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

function formatDate(date: string | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function EotView({
  project,
  eots,
  companies,
  statusFilter,
}: EotViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    router.push(`/projects/${project.id}/eot?${params.toString()}`);
  };

  // Calculate stats
  const totalEots = eots.length;
  const pendingCount = eots.filter(
    (e) => e.status === "draft" || e.status === "submitted" || e.status === "under_review"
  ).length;
  const approvedCount = eots.filter((e) => e.status === "approved").length;
  const totalDaysClaimed = eots.reduce((sum, e) => sum + e.days_claimed, 0);
  const totalDaysApproved = eots
    .filter((e) => e.status === "approved")
    .reduce((sum, e) => sum + (e.days_approved || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`/projects/${project.id}`}
        title={project.name}
        breadcrumbs={[
          { label: project.code, href: `/projects/${project.id}` },
          { label: "Extension of Time" },
        ]}
      >
        <CreateEotDialog
          projectId={project.id}
          companies={companies}
          originalCompletionDate={project.end_date}
        >
          <Button size="sm">
            <Plus className="mr-2 size-4" />
            New EOT
          </Button>
        </CreateEotDialog>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={FileText} label="Total EOTs" value={totalEots} iconClassName="text-blue-500" />
        <StatCard icon={Clock} label="Days Claimed" value={totalDaysClaimed} iconClassName="text-yellow-500" />
        <StatCard icon={CheckCircle} label="Days Approved" value={totalDaysApproved} iconClassName="text-green-500" />
        <StatCard icon={Calendar} label="Completion Date" value={formatDate(project.end_date)} iconClassName="text-purple-500" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Extension of Time Claims</CardTitle>
              <CardDescription>
                {eots.length} EOT{eots.length !== 1 ? "s" : ""}
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
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {eots.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No EOTs found"
              description="Create an extension of time claim"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">No.</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead className="text-right">Claimed</TableHead>
                  <TableHead className="text-right">Approved</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eots.map((eot) => (
                  <TableRow
                    key={eot.id}
                    className="cursor-pointer"
                    onClick={() =>
                      router.push(`/projects/${project.id}/eot/${eot.id}`)
                    }
                  >
                    <TableCell>
                      <span className="font-mono text-sm font-medium">
                        EOT-{String(eot.eot_number).padStart(3, "0")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{eot.title}</p>
                        {eot.delay_start_date && eot.delay_end_date && (
                          <p className="text-xs text-muted-foreground">
                            {formatDate(eot.delay_start_date)} -{" "}
                            {formatDate(eot.delay_end_date)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {eot.submitted_by_company?.name || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium">
                        {eot.days_claimed} day{eot.days_claimed !== 1 ? "s" : ""}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {eot.days_approved !== null ? (
                        <span
                          className={
                            eot.days_approved > 0
                              ? "font-medium text-green-600"
                              : ""
                          }
                        >
                          {eot.days_approved} day
                          {eot.days_approved !== 1 ? "s" : ""}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColors[eot.status]}>
                        {statusLabels[eot.status]}
                      </Badge>
                    </TableCell>
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
