"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
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
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";

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
      <PageHeader
        backHref={`/projects/${project.id}`}
        title={project.name}
        breadcrumbs={[
          { label: project.code, href: `/projects/${project.id}` },
          { label: "RFIs" },
        ]}
      >
        <CreateRFIDialog projectId={project.id} members={members}>
          <Button size="sm">
            <MessageSquarePlus className="mr-2 size-4" />
            New RFI
          </Button>
        </CreateRFIDialog>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={MessageSquarePlus} label="Open" value={openCount} iconClassName="text-blue-500" />
        <StatCard icon={MessageSquarePlus} label="Draft" value={draftCount} />
        <StatCard icon={MessageSquarePlus} label="Closed" value={closedCount} iconClassName="text-green-500" />
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
            <EmptyState
              icon={MessageSquarePlus}
              title="No RFIs yet"
              description="Create an RFI to start tracking requests for information"
            />
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
