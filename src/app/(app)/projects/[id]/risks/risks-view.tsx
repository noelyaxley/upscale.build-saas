"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Plus,
  Shield,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
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
import { CreateRiskDialog } from "@/components/create-risk-dialog";

type RiskStatus = Database["public"]["Enums"]["risk_status"];

type Risk = Tables<"risks"> & {
  created_by: { id: string; full_name: string | null } | null;
};

interface RisksViewProps {
  project: { id: string; code: string; name: string };
  risks: Risk[];
  typeFilter: string;
  statusFilter: string;
}

const levelColors: Record<string, string> = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  mitigated: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  closed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
};

const statusLabels: Record<string, string> = {
  open: "Open",
  mitigated: "Mitigated",
  closed: "Closed",
};

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function RisksView({ project, risks, typeFilter, statusFilter }: RisksViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAdmin } = useOrganisation();
  const supabase = createClient();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/projects/${project.id}/risks?${params.toString()}`);
  };

  const handleStatusChange = async (riskId: string, newStatus: RiskStatus) => {
    try {
      const { error } = await supabase
        .from("risks")
        .update({ status: newStatus })
        .eq("id", riskId);

      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const riskCount = risks.filter((r) => r.type === "risk" && r.status === "open").length;
  const opportunityCount = risks.filter((r) => r.type === "opportunity" && r.status === "open").length;
  const highRiskCount = risks.filter((r) => r.type === "risk" && r.level === "high" && r.status === "open").length;

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
            <span>Risks & Opportunities</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
        </div>
        <CreateRiskDialog projectId={project.id}>
          <Button size="sm">
            <Plus className="mr-2 size-4" />
            Add Item
          </Button>
        </CreateRiskDialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <AlertTriangle className="size-4 text-red-500" />
              Open Risks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{riskCount}</p>
            {highRiskCount > 0 && (
              <p className="text-xs text-red-500">{highRiskCount} high priority</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Sparkles className="size-4 text-green-500" />
              Open Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{opportunityCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Shield className="size-4 text-blue-500" />
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{risks.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Risk & Opportunity Register</CardTitle>
              <CardDescription>
                {risks.length} item{risks.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={(v) => handleFilterChange("type", v)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="risk">Risks</SelectItem>
                  <SelectItem value="opportunity">Opportunities</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => handleFilterChange("status", v)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="mitigated">Mitigated</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {risks.length === 0 ? (
            <div className="py-8 text-center">
              <Shield className="mx-auto size-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No items found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add risks and opportunities to track them proactively
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  {isAdmin && <TableHead className="w-[140px]">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {risks.map((risk) => (
                  <TableRow key={risk.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {risk.type === "risk" ? (
                          <AlertTriangle className="size-4 text-red-500" />
                        ) : (
                          <TrendingUp className="size-4 text-green-500" />
                        )}
                        <span className="text-sm capitalize">{risk.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{risk.description}</p>
                      {risk.mitigation && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Mitigation: {risk.mitigation}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={levelColors[risk.level]}>
                        {risk.level.charAt(0).toUpperCase() + risk.level.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColors[risk.status]}>
                        {statusLabels[risk.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(risk.created_at)}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Select
                          value={risk.status}
                          onValueChange={(value) => handleStatusChange(risk.id, value as RiskStatus)}
                        >
                          <SelectTrigger className="h-8 w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="mitigated">Mitigated</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    )}
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
