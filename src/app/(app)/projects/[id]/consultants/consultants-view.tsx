"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  DollarSign,
  Plus,
  Users,
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
import { CreateConsultantDialog } from "@/components/create-consultant-dialog";

type ConsultantStatus = Database["public"]["Enums"]["consultant_status"];

type Phase = {
  id: string;
  fee: number;
  variations: number;
  disbursements: number;
  amount_paid: number;
};

type Consultant = Tables<"consultants"> & {
  company: { id: string; name: string } | null;
  consultant_phases: Phase[];
};

type Company = {
  id: string;
  name: string;
};

interface ConsultantsViewProps {
  project: { id: string; code: string; name: string };
  consultants: Consultant[];
  companies: Company[];
  statusFilter: string;
}

const statusColors: Record<ConsultantStatus, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  engaged: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  terminated: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const statusLabels: Record<ConsultantStatus, string> = {
  draft: "Draft",
  engaged: "Engaged",
  completed: "Completed",
  terminated: "Terminated",
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

function getConsultantFinancials(consultant: Consultant) {
  const totalVariations = consultant.consultant_phases.reduce(
    (sum, p) => sum + p.variations,
    0
  );
  const totalPaid = consultant.consultant_phases.reduce(
    (sum, p) => sum + p.amount_paid,
    0
  );
  const contractPlusVariations = (consultant.contract_value ?? 0) + totalVariations;
  const remaining = contractPlusVariations - totalPaid;
  return { totalVariations, totalPaid, remaining };
}

export function ConsultantsView({
  project,
  consultants,
  companies,
  statusFilter,
}: ConsultantsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    router.push(`/projects/${project.id}/consultants?${params.toString()}`);
  };

  // Calculate stats
  const totalBudget = consultants.reduce((sum, c) => sum + (c.budget ?? 0), 0);
  const totalContracted = consultants.reduce(
    (sum, c) => sum + (c.contract_value ?? 0),
    0
  );
  const totalPaid = consultants.reduce((sum, c) => {
    const { totalPaid } = getConsultantFinancials(c);
    return sum + totalPaid;
  }, 0);

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
            <span>Consultants</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
        </div>
        <CreateConsultantDialog projectId={project.id} companies={companies}>
          <Button size="sm">
            <Plus className="mr-2 size-4" />
            New Consultant
          </Button>
        </CreateConsultantDialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Users className="size-4 text-teal-500" />
              Total Consultants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{consultants.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <DollarSign className="size-4 text-teal-500" />
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <DollarSign className="size-4 text-teal-500" />
              Total Contracted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(totalContracted)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <DollarSign className="size-4 text-teal-500" />
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
              <CardTitle>Consultants Register</CardTitle>
              <CardDescription>
                {consultants.length} consultant
                {consultants.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="engaged">Engaged</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {consultants.length === 0 ? (
            <div className="py-8 text-center">
              <Users className="mx-auto size-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                No consultants found
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add a consultant to track professional services
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">No.</TableHead>
                  <TableHead>Discipline</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contract Ref</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="text-right">Contract</TableHead>
                  <TableHead className="text-right">Variations</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consultants.map((consultant) => {
                  const { totalVariations, totalPaid, remaining } =
                    getConsultantFinancials(consultant);
                  return (
                    <TableRow key={consultant.id}>
                      <TableCell>
                        <Link
                          href={`/projects/${project.id}/consultants/${consultant.id}`}
                          className="font-mono text-sm font-medium hover:underline"
                        >
                          C-
                          {String(consultant.consultant_number).padStart(
                            3,
                            "0"
                          )}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/projects/${project.id}/consultants/${consultant.id}`}
                          className="hover:underline"
                        >
                          {consultant.discipline}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {consultant.company?.name || "-"}
                      </TableCell>
                      <TableCell>{consultant.contract_ref || "-"}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(consultant.budget ?? 0)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(consultant.contract_value ?? 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {totalVariations !== 0
                          ? formatCurrency(totalVariations)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {totalPaid !== 0 ? formatCurrency(totalPaid) : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            remaining < 0
                              ? "text-red-600"
                              : remaining > 0
                              ? "text-green-600"
                              : ""
                          }
                        >
                          {formatCurrency(remaining)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={statusColors[consultant.status]}
                        >
                          {statusLabels[consultant.status]}
                        </Badge>
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
