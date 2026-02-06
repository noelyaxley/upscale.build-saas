"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CheckCircle,
  ChevronRight,
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
            <span>Defects</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
        </div>
        <CreateDefectDialog projectId={project.id} companies={companies}>
          <Button size="sm">
            <Plus className="mr-2 size-4" />
            Log Defect
          </Button>
        </CreateDefectDialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <AlertTriangle className="size-4 text-red-500" />
              Open
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{openCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="size-4 text-yellow-500" />
              Awaiting Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{inProgressCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CheckCircle className="size-4 text-green-500" />
              Closed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{closedCount}</p>
          </CardContent>
        </Card>
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
            <div className="py-8 text-center">
              <AlertTriangle className="mx-auto size-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                No defects logged yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Log defects to track and manage remediation work
              </p>
            </div>
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
