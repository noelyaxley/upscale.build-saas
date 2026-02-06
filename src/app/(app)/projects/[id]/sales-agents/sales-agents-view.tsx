"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  DollarSign,
  Plus,
  UserCheck,
} from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateAgentDialog } from "@/components/create-agent-dialog";

type Agent = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  commission_rate: number | null;
};

type AgentStats = {
  agent_id: string;
  sales_count: number;
  total_commission: number;
};

interface SalesAgentsViewProps {
  project: { id: string; code: string; name: string };
  agents: Agent[];
  agentStats: AgentStats[];
}

function formatCurrency(cents: number | null): string {
  if (cents === null || cents === 0) return "-";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function SalesAgentsView({
  project,
  agents,
  agentStats,
}: SalesAgentsViewProps) {
  const statsMap = new Map(agentStats.map((s) => [s.agent_id, s]));

  const totalSales = agentStats.reduce((sum, s) => sum + s.sales_count, 0);
  const totalCommission = agentStats.reduce(
    (sum, s) => sum + s.total_commission,
    0
  );

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
            <Link
              href={`/projects/${project.id}`}
              className="hover:underline"
            >
              {project.code}
            </Link>
            <ChevronRight className="size-4" />
            <span>Sales Agents</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {project.name}
          </h1>
        </div>
        <CreateAgentDialog projectId={project.id}>
          <Button size="sm">
            <Plus className="mr-2 size-4" />
            Add Agent
          </Button>
        </CreateAgentDialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <UserCheck className="size-4 text-pink-500" />
              Total Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{agents.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <UserCheck className="size-4 text-pink-500" />
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalSales}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <DollarSign className="size-4 text-pink-500" />
              Total Commission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(totalCommission)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agents</CardTitle>
          <CardDescription>
            {agents.length} agent{agents.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agents.length === 0 ? (
            <div className="py-8 text-center">
              <UserCheck className="mx-auto size-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                No sales agents registered
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add agents to track sales commissions
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Commission %</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">
                    Total Commission
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => {
                  const stats = statsMap.get(agent.id);
                  return (
                    <TableRow key={agent.id}>
                      <TableCell className="font-medium">
                        {agent.name}
                      </TableCell>
                      <TableCell>{agent.company || "-"}</TableCell>
                      <TableCell className="text-sm">
                        {agent.email || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {agent.phone || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {agent.commission_rate
                          ? `${agent.commission_rate}%`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">
                          {stats?.sales_count ?? 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(stats?.total_commission ?? 0)}
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
