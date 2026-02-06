"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  ChevronRight,
  Clock,
  DollarSign,
  FileEdit,
  Plus,
  XCircle,
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
import { CreateVariationDialog } from "@/components/create-variation-dialog";

type VariationStatus = Database["public"]["Enums"]["variation_status"];

type Variation = Tables<"variations"> & {
  submitted_by_company: { id: string; name: string } | null;
  created_by: { id: string; full_name: string | null } | null;
};

type Company = {
  id: string;
  name: string;
};

interface VariationsViewProps {
  project: { id: string; code: string; name: string };
  variations: Variation[];
  companies: Company[];
  statusFilter: string;
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

export function VariationsView({
  project,
  variations,
  companies,
  statusFilter,
}: VariationsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    router.push(`/projects/${project.id}/variations?${params.toString()}`);
  };

  // Calculate stats
  const pendingCount = variations.filter(
    (v) => v.status === "submitted" || v.status === "under_review"
  ).length;
  const approvedCount = variations.filter((v) => v.status === "approved").length;
  const totalApprovedCost = variations
    .filter((v) => v.status === "approved")
    .reduce((sum, v) => sum + (v.cost_impact ?? 0), 0);
  const totalApprovedDays = variations
    .filter((v) => v.status === "approved")
    .reduce((sum, v) => sum + (v.time_impact ?? 0), 0);

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
            <span>Variations</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
        </div>
        <CreateVariationDialog projectId={project.id} companies={companies}>
          <Button size="sm">
            <Plus className="mr-2 size-4" />
            New Variation
          </Button>
        </CreateVariationDialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileEdit className="size-4 text-blue-500" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{variations.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="size-4 text-yellow-500" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <DollarSign className="size-4 text-green-500" />
              Approved Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalApprovedCost)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CheckCircle className="size-4 text-green-500" />
              Approved Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {totalApprovedDays > 0 ? `+${totalApprovedDays}` : totalApprovedDays}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Variations Register</CardTitle>
              <CardDescription>
                {variations.length} variation{variations.length !== 1 ? "s" : ""}
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
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {variations.length === 0 ? (
            <div className="py-8 text-center">
              <FileEdit className="mx-auto size-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                No variations found
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a variation to track contract changes
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">No.</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Cost Impact</TableHead>
                  <TableHead className="text-right">Time Impact</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variations.map((variation) => (
                  <TableRow key={variation.id}>
                    <TableCell>
                      <Link
                        href={`/projects/${project.id}/variations/${variation.id}`}
                        className="font-mono text-sm font-medium hover:underline"
                      >
                        V-{String(variation.variation_number).padStart(3, "0")}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/projects/${project.id}/variations/${variation.id}`}
                        className="hover:underline"
                      >
                        {variation.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColors[variation.status]}>
                        {statusLabels[variation.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {(variation.cost_impact ?? 0) > 0 ? (
                          <ArrowUpRight className="size-4 text-red-500" />
                        ) : (variation.cost_impact ?? 0) < 0 ? (
                          <ArrowDownRight className="size-4 text-green-500" />
                        ) : null}
                        <span
                          className={
                            (variation.cost_impact ?? 0) > 0
                              ? "text-red-600"
                              : (variation.cost_impact ?? 0) < 0
                              ? "text-green-600"
                              : ""
                          }
                        >
                          {formatCurrency(Math.abs(variation.cost_impact ?? 0))}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {(variation.time_impact ?? 0) !== 0 && (
                        <span
                          className={
                            (variation.time_impact ?? 0) > 0
                              ? "text-red-600"
                              : "text-green-600"
                          }
                        >
                          {(variation.time_impact ?? 0) > 0 ? "+" : ""}
                          {variation.time_impact ?? 0} days
                        </span>
                      )}
                      {(variation.time_impact ?? 0) === 0 && "-"}
                    </TableCell>
                    <TableCell>
                      {variation.submitted_by_company?.name || "-"}
                    </TableCell>
                    <TableCell>{formatDate(variation.created_at)}</TableCell>
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
