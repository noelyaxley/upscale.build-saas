"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Building2,
  CheckCircle,
  Clock,
  MapPin,
  Plus,
} from "lucide-react";
import type { Tables } from "@/lib/supabase/database.types";
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
import { CreateDefectDialog } from "@/components/create-defect-dialog";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";

type Defect = Tables<"defects"> & {
  assigned_company: { id: string; name: string } | null;
  reported_by: { id: string; full_name: string | null } | null;
};

type Company = {
  id: string;
  name: string;
  type: string;
};

interface DefectsViewProps {
  project: { id: string; code: string; name: string };
  defects: Defect[];
  companies: Company[];
  statusFilter: string;
}

const statusColors: Record<string, string> = {
  open: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  contractor_complete: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  closed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
};

const statusLabels: Record<string, string> = {
  open: "Open",
  contractor_complete: "Contractor Complete",
  closed: "Closed",
};

function formatDate(date: string | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function DefectsView({
  project,
  defects,
  companies,
  statusFilter,
}: DefectsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    router.push(`/projects/${project.id}/defects?${params.toString()}`);
  };

  const openCount = defects.filter((d) => d.status === "open").length;
  const inProgressCount = defects.filter((d) => d.status === "contractor_complete").length;
  const closedCount = defects.filter((d) => d.status === "closed").length;

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`/projects/${project.id}`}
        title={project.name}
        breadcrumbs={[
          { label: project.code, href: `/projects/${project.id}` },
          { label: "Defects" },
        ]}
      >
        <CreateDefectDialog projectId={project.id} companies={companies}>
          <Button size="sm">
            <Plus className="mr-2 size-4" />
            Log Defect
          </Button>
        </CreateDefectDialog>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={AlertTriangle} label="Open" value={openCount} iconClassName="text-red-500" />
        <StatCard icon={Clock} label="Awaiting Review" value={inProgressCount} iconClassName="text-yellow-500" />
        <StatCard icon={CheckCircle} label="Closed" value={closedCount} iconClassName="text-green-500" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Defects Register</CardTitle>
              <CardDescription>
                {defects.length} defect{defects.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="contractor_complete">Awaiting Review</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {defects.length === 0 ? (
            <EmptyState
              icon={AlertTriangle}
              title="No defects logged yet"
              description="Log defects to track and manage remediation work"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Reported</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {defects.map((defect) => (
                  <TableRow key={defect.id}>
                    <TableCell>
                      <Link
                        href={`/projects/${project.id}/defects/${defect.id}`}
                        className="font-mono text-sm font-medium hover:underline"
                      >
                        D-{String(defect.defect_number).padStart(3, "0")}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/projects/${project.id}/defects/${defect.id}`}
                        className="hover:underline"
                      >
                        {defect.name}
                      </Link>
                      {defect.photo_url && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Photo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {defect.location ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="size-3 text-muted-foreground" />
                          <span className="text-sm">{defect.location}</span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusColors[defect.status]}
                      >
                        {statusLabels[defect.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {defect.assigned_company ? (
                        <div className="flex items-center gap-1">
                          <Building2 className="size-3 text-muted-foreground" />
                          <span className="text-sm">{defect.assigned_company.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(defect.created_at)}</TableCell>
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
