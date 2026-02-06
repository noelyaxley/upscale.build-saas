"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  CircleDot,
  MessageSquarePlus,
  User,
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
import { CreateRFIDialog } from "@/components/create-rfi-dialog";

type RFI = Tables<"rfis"> & {
  originator: { id: string; full_name: string | null } | null;
  assignee: { id: string; full_name: string | null } | null;
};

type Member = {
  id: string;
  full_name: string | null;
};

interface RFIsViewProps {
  project: { id: string; code: string; name: string };
  rfis: RFI[];
  members: Member[];
  statusFilter: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  open: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  closed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
};

function formatDate(date: string | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isOverdue(dueDate: string | null, status: string): boolean {
  if (!dueDate || status === "closed") return false;
  return new Date(dueDate) < new Date();
}

export function RFIsView({
  project,
  rfis,
  members,
  statusFilter,
}: RFIsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    router.push(`/projects/${project.id}/rfis?${params.toString()}`);
  };

  const openCount = rfis.filter((r) => r.status === "open").length;
  const draftCount = rfis.filter((r) => r.status === "draft").length;
  const closedCount = rfis.filter((r) => r.status === "closed").length;

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
            <span>RFIs</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
        </div>
        <CreateRFIDialog projectId={project.id} members={members}>
          <Button size="sm">
            <MessageSquarePlus className="mr-2 size-4" />
            New RFI
          </Button>
        </CreateRFIDialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{openCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Draft
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{draftCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
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
              <CardTitle>RFI Register</CardTitle>
              <CardDescription>
                {rfis.length} RFI{rfis.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {rfis.length === 0 ? (
            <div className="py-8 text-center">
              <MessageSquarePlus className="mx-auto size-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                No RFIs yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create an RFI to start tracking requests for information
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">No.</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rfis.map((rfi) => {
                  const overdue = isOverdue(rfi.due_date, rfi.status);
                  return (
                    <TableRow key={rfi.id}>
                      <TableCell>
                        <Link
                          href={`/projects/${project.id}/rfis/${rfi.id}`}
                          className="font-mono text-sm font-medium hover:underline"
                        >
                          RFI-{String(rfi.number).padStart(3, "0")}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/projects/${project.id}/rfis/${rfi.id}`}
                          className="hover:underline"
                        >
                          {rfi.subject}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={statusColors[rfi.status]}
                        >
                          {rfi.status.charAt(0).toUpperCase() + rfi.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4 text-muted-foreground" />
                          <span className={overdue ? "text-destructive font-medium" : ""}>
                            {formatDate(rfi.due_date)}
                          </span>
                          {overdue && (
                            <Badge variant="destructive" className="text-xs">
                              Overdue
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="size-4 text-muted-foreground" />
                          <span>{rfi.originator?.full_name || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CircleDot className="size-4 text-muted-foreground" />
                          <span>{rfi.assignee?.full_name || "-"}</span>
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
