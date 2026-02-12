"use client";

import Link from "next/link";
import {
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
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";

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
      <PageHeader
        backHref={`/projects/${project.id}`}
        title={project.name}
        breadcrumbs={[
          { label: project.code, href: `/projects/${project.id}` },
          { label: "Sales Agents" },
        ]}
      >
        <CreateAgentDialog projectId={project.id}>
          <Button size="sm">
            <Plus className="mr-2 size-4" />
            Add Agent
          </Button>
        </CreateAgentDialog>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={UserCheck} label="Total Agents" value={agents.length} iconClassName="text-pink-500" />
        <StatCard icon={UserCheck} label="Total Sales" value={totalSales} iconClassName="text-pink-500" />
        <StatCard icon={DollarSign} label="Total Commission" value={formatCurrency(totalCommission)} iconClassName="text-pink-500" />
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
            <EmptyState
              icon={UserCheck}
              title="No sales agents registered"
              description="Add agents to track sales commissions"
            />
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
                      <TableCell className="text-right font-medium tabular-nums">
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
