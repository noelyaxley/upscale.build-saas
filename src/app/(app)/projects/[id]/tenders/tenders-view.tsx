"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DollarSign,
  Gavel,
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
import { CreateTenderDialog } from "@/components/create-tender-dialog";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";

type TenderStatus = Database["public"]["Enums"]["tender_status"];

type Tender = Tables<"tenders"> & {
  awarded_company: { id: string; name: string } | null;
  tender_submissions: { id: string }[];
};

type Company = {
  id: string;
  name: string;
};

interface TendersViewProps {
  project: { id: string; code: string; name: string };
  tenders: Tender[];
  companies: Company[];
  statusFilter: string;
}

const statusColors: Record<TenderStatus, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  open: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  evaluation: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  awarded: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const statusLabels: Record<TenderStatus, string> = {
  draft: "Draft",
  open: "Open",
  evaluation: "Evaluation",
  awarded: "Awarded",
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

export function TendersView({
  project,
  tenders,
  statusFilter,
}: TendersViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    router.push(`/projects/${project.id}/tenders?${params.toString()}`);
  };

  // Calculate stats
  const openCount = tenders.filter(
    (t) => t.status === "open" || t.status === "evaluation"
  ).length;
  const totalEstimated = tenders.reduce(
    (sum, t) => sum + (t.estimated_value ?? 0),
    0
  );
  const totalAwarded = tenders
    .filter((t) => t.status === "awarded")
    .reduce((sum, t) => sum + (t.awarded_amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`/projects/${project.id}`}
        title={project.name}
        breadcrumbs={[
          { label: project.code, href: `/projects/${project.id}` },
          { label: "Tenders" },
        ]}
      >
        <CreateTenderDialog projectId={project.id}>
          <Button size="sm">
            <Plus className="mr-2 size-4" />
            New Tender
          </Button>
        </CreateTenderDialog>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={Gavel} label="Total Tenders" value={tenders.length} />
        <StatCard icon={Gavel} label="Open" value={openCount} />
        <StatCard icon={DollarSign} label="Estimated Value" value={formatCurrency(totalEstimated)} />
        <StatCard icon={DollarSign} label="Awarded Value" value={formatCurrency(totalAwarded)} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tender Register</CardTitle>
              <CardDescription>
                {tenders.length} tender{tenders.length !== 1 ? "s" : ""}
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
                <SelectItem value="evaluation">Evaluation</SelectItem>
                <SelectItem value="awarded">Awarded</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {tenders.length === 0 ? (
            <EmptyState
              icon={Gavel}
              title="No tenders found"
              description="Create a tender package to start procurement"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">No.</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Trade</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Estimated</TableHead>
                  <TableHead className="text-center">Bids</TableHead>
                  <TableHead>Awarded To</TableHead>
                  <TableHead className="text-right">Awarded</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenders.map((tender) => (
                  <TableRow key={tender.id}>
                    <TableCell>
                      <Link
                        href={`/projects/${project.id}/tenders/${tender.id}`}
                        className="font-mono text-sm font-medium hover:underline"
                      >
                        T-{String(tender.tender_number).padStart(3, "0")}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/projects/${project.id}/tenders/${tender.id}`}
                        className="hover:underline"
                      >
                        {tender.title}
                      </Link>
                    </TableCell>
                    <TableCell>{tender.trade}</TableCell>
                    <TableCell>{formatDate(tender.due_date)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(tender.estimated_value ?? 0)}
                    </TableCell>
                    <TableCell className="text-center">
                      {tender.tender_submissions.length}
                    </TableCell>
                    <TableCell>
                      {tender.awarded_company?.name || "-"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {tender.awarded_amount
                        ? formatCurrency(tender.awarded_amount)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusColors[tender.status]}
                      >
                        {statusLabels[tender.status]}
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
