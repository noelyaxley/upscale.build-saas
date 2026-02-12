"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BadgeCheck,
  Building2,
  DollarSign,
  FileText,
  Plus,
} from "lucide-react";
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
import { CreateContractDialog } from "@/components/create-contract-dialog";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";

type ContractStatus = Database["public"]["Enums"]["contract_status"];

type Contract = Tables<"contracts"> & {
  company: { id: string; name: string } | null;
};

type ClaimSummary = {
  id: string;
  contract_id: string | null;
  claimed_amount: number;
  certified_amount: number | null;
  status: Database["public"]["Enums"]["claim_status"];
};

type Company = {
  id: string;
  name: string;
};

interface ClaimsViewProps {
  project: { id: string; code: string; name: string };
  contracts: Contract[];
  claims: ClaimSummary[];
  companies: Company[];
  statusFilter: string;
}

const statusColors: Record<ContractStatus, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  active: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  terminated: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const statusLabels: Record<ContractStatus, string> = {
  draft: "Draft",
  active: "Active",
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

export function ClaimsView({
  project,
  contracts,
  claims,
  companies,
  statusFilter,
}: ClaimsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAdmin } = useOrganisation();

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    router.push(`/projects/${project.id}/claims?${params.toString()}`);
  };

  // Aggregate claims per contract
  const claimsByContract = new Map<string, ClaimSummary[]>();
  for (const claim of claims) {
    if (claim.contract_id) {
      const existing = claimsByContract.get(claim.contract_id) ?? [];
      existing.push(claim);
      claimsByContract.set(claim.contract_id, existing);
    }
  }

  // Calculate stats
  const totalContractValue = contracts.reduce(
    (sum, c) => sum + c.contract_value,
    0
  );
  const totalClaimed = claims.reduce((sum, c) => sum + c.claimed_amount, 0);
  const totalCertified = claims
    .filter((c) => c.status === "certified" || c.status === "paid")
    .reduce((sum, c) => sum + (c.certified_amount || c.claimed_amount), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`/projects/${project.id}`}
        title={project.name}
        breadcrumbs={[
          { label: project.code, href: `/projects/${project.id}` },
          { label: "Progress Claims" },
        ]}
      >
        {isAdmin && (
          <CreateContractDialog projectId={project.id} companies={companies}>
            <Button size="sm">
              <Plus className="mr-2 size-4" />
              New Contract
            </Button>
          </CreateContractDialog>
        )}
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={FileText} label="Total Contracts" value={contracts.length} iconClassName="text-blue-500" />
        <StatCard icon={DollarSign} label="Contract Value" value={formatCurrency(totalContractValue)} iconClassName="text-yellow-500" />
        <StatCard icon={DollarSign} label="Total Claimed" value={formatCurrency(totalClaimed)} iconClassName="text-blue-500" />
        <StatCard icon={BadgeCheck} label="Total Certified" value={formatCurrency(totalCertified)} iconClassName="text-green-500" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contracts</CardTitle>
              <CardDescription>
                {contracts.length} contract{contracts.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No contracts found"
              description="Create a contract to start tracking progress claims"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead className="text-right">Contract Value</TableHead>
                  <TableHead className="text-right">Claimed</TableHead>
                  <TableHead className="text-right">Certified</TableHead>
                  <TableHead className="text-center">Claims</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => {
                  const contractClaims =
                    claimsByContract.get(contract.id) ?? [];
                  const claimed = contractClaims.reduce(
                    (sum, c) => sum + c.claimed_amount,
                    0
                  );
                  const certified = contractClaims
                    .filter(
                      (c) => c.status === "certified" || c.status === "paid"
                    )
                    .reduce(
                      (sum, c) =>
                        sum + (c.certified_amount || c.claimed_amount),
                      0
                    );

                  return (
                    <TableRow key={contract.id} className="cursor-pointer">
                      <TableCell>
                        <Link
                          href={`/projects/${project.id}/claims/${contract.id}`}
                          className="font-mono text-sm font-medium hover:underline"
                        >
                          CT-{String(contract.contract_number).padStart(3, "0")}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/projects/${project.id}/claims/${contract.id}`}
                          className="font-medium hover:underline"
                        >
                          {contract.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="size-3 text-muted-foreground" />
                          {contract.company?.name || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatCurrency(contract.contract_value)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {claimed > 0 ? formatCurrency(claimed) : "-"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {certified > 0 ? formatCurrency(certified) : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {contractClaims.length}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={statusColors[contract.status]}
                        >
                          {statusLabels[contract.status]}
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
