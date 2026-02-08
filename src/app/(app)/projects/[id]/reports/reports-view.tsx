"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  ChevronRight,
  DollarSign,
  GanttChart,
  ShieldCheck,
} from "lucide-react";
import type { Database } from "@/lib/supabase/database.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type VariationStatus = Database["public"]["Enums"]["variation_status"];
type SubmittalStatus = Database["public"]["Enums"]["submittal_status"];

interface ReportsViewProps {
  project: { id: string; code: string; name: string; budget: number | null };
  variations: { id: string; status: VariationStatus; cost_impact: number | null }[];
  claims: {
    id: string;
    status: string;
    claimed_amount: number | null;
    certified_amount: number | null;
  }[];
  tenders: {
    id: string;
    status: string;
    estimated_value: number | null;
    awarded_amount: number | null;
  }[];
  tasks: { id: string; progress: number; parent_id: string | null }[];
  submittals: { id: string; status: SubmittalStatus }[];
  defects: { id: string; status: string }[];
  rfis: { id: string; status: string }[];
  risks: { id: string; status: string; type: string; level: string }[];
  eots: {
    id: string;
    status: string;
    days_claimed: number | null;
    days_approved: number | null;
  }[];
  lots: {
    id: string;
    status: string;
    list_price: number | null;
    sold_price: number | null;
  }[];
  diaryEntries: { id: string }[];
}

function formatCurrency(cents: number): string {
  if (cents === 0) return "$0";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {icon || <BarChart3 className="size-4 text-fuchsia-500" />}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function BarChart({
  items,
}: {
  items: { label: string; value: number; color: string; pct: number }[];
}) {
  const hasData = items.some((i) => i.value > 0);
  if (!hasData) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No data available
      </p>
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex h-8 w-full overflow-hidden rounded-md">
        {items
          .filter((i) => i.pct > 0)
          .map((i) => (
            <div
              key={i.label}
              className={`${i.color} transition-all`}
              style={{ width: `${i.pct}%` }}
              title={`${i.label}: ${i.value} (${i.pct.toFixed(0)}%)`}
            />
          ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {items
          .filter((i) => i.value > 0)
          .map((i) => (
            <div key={i.label} className="flex items-center gap-2 text-sm">
              <div className={`size-3 rounded-sm ${i.color}`} />
              <span className="text-muted-foreground">{i.label}</span>
              <span className="ml-auto font-medium">{i.value}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

function ComparisonBars({
  items,
}: {
  items: { label: string; value: number; color: string }[];
}) {
  const maxVal = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium">{formatCurrency(item.value)}</span>
          </div>
          <div className="h-6 w-full rounded-md bg-muted overflow-hidden">
            <div
              className={`h-full ${item.color} rounded-md transition-all`}
              style={{
                width: `${Math.min(100, (item.value / maxVal) * 100)}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReportsView({
  project,
  variations,
  claims,
  tenders,
  tasks,
  submittals,
  defects,
  rfis,
  risks,
  eots,
  lots,
  diaryEntries,
}: ReportsViewProps) {
  // === Overview computations ===
  const openTenders = tenders.filter(
    (t) => t.status === "open" || t.status === "evaluation"
  ).length;

  const soldLots = lots.filter(
    (l) =>
      l.status === "deposit_paid" ||
      l.status === "unconditional" ||
      l.status === "settled"
  ).length;
  const lotsSoldPct =
    lots.length > 0 ? Math.round((soldLots / lots.length) * 100) : 0;

  // Programme completion: avg of leaf tasks only
  const parentIds = new Set(tasks.map((t) => t.parent_id).filter(Boolean));
  const leafTasks = tasks.filter((t) => !parentIds.has(t.id));
  const programmeCompletion =
    leafTasks.length > 0
      ? Math.round(
          leafTasks.reduce((sum, t) => sum + t.progress, 0) / leafTasks.length
        )
      : 0;

  const eotDaysApproved = eots.reduce(
    (sum, e) => sum + (e.days_approved ?? 0),
    0
  );

  // === Financial computations ===
  const variationsByStatus = (
    [
      "draft",
      "submitted",
      "under_review",
      "approved",
      "rejected",
      "cancelled",
    ] as VariationStatus[]
  ).map((s) => {
    const items = variations.filter((v) => v.status === s);
    return {
      status: s,
      count: items.length,
      total: items.reduce((sum, v) => sum + (v.cost_impact ?? 0), 0),
    };
  });
  const totalVariationCost = variations.reduce(
    (sum, v) => sum + (v.cost_impact ?? 0),
    0
  );

  const totalClaimed = claims.reduce(
    (sum, c) => sum + (c.claimed_amount ?? 0),
    0
  );
  const totalCertified = claims.reduce(
    (sum, c) => sum + (c.certified_amount ?? 0),
    0
  );

  const totalTenderEstimated = tenders.reduce(
    (sum, t) => sum + (t.estimated_value ?? 0),
    0
  );
  const totalTenderAwarded = tenders
    .filter((t) => t.status === "awarded")
    .reduce((sum, t) => sum + (t.awarded_amount ?? 0), 0);

  // === Programme computations ===
  const tasksNotStarted = tasks.filter((t) => t.progress === 0).length;
  const tasksInProgress = tasks.filter(
    (t) => t.progress > 0 && t.progress < 100
  ).length;
  const tasksComplete = tasks.filter((t) => t.progress === 100).length;
  const totalTasks = tasks.length;

  // === Quality computations ===
  const submittalsByStatus = [
    "draft",
    "submitted",
    "under_review",
    "approved",
    "approved_as_noted",
    "revise_resubmit",
    "rejected",
  ].map((s) => ({
    status: s,
    count: submittals.filter((sub) => sub.status === s).length,
  }));

  const defectsByStatus = ["open", "contractor_complete", "closed"].map(
    (s) => ({
      status: s,
      count: defects.filter((d) => d.status === s).length,
    })
  );

  const rfisByStatus = ["draft", "open", "closed"].map((s) => ({
    status: s,
    count: rfis.filter((r) => r.status === s).length,
  }));

  const risksByLevel = ["low", "medium", "high"].map((l) => ({
    level: l,
    risks: risks.filter((r) => r.level === l && r.type === "risk").length,
    opportunities: risks.filter(
      (r) => r.level === l && r.type === "opportunity"
    ).length,
    total: risks.filter((r) => r.level === l).length,
  }));

  // Bar chart color maps
  const variationStatusColors: Record<string, string> = {
    draft: "bg-gray-400",
    submitted: "bg-blue-500",
    under_review: "bg-yellow-500",
    approved: "bg-green-500",
    rejected: "bg-red-500",
    cancelled: "bg-gray-300",
  };

  const submittalStatusColors: Record<string, string> = {
    draft: "bg-gray-400",
    submitted: "bg-violet-500",
    under_review: "bg-yellow-500",
    approved: "bg-green-500",
    approved_as_noted: "bg-emerald-500",
    revise_resubmit: "bg-orange-500",
    rejected: "bg-red-500",
  };

  const submittalStatusLabels: Record<string, string> = {
    draft: "Draft",
    submitted: "Submitted",
    under_review: "Under Review",
    approved: "Approved",
    approved_as_noted: "As Noted",
    revise_resubmit: "Revise",
    rejected: "Rejected",
  };

  const defectStatusColors: Record<string, string> = {
    open: "bg-red-500",
    contractor_complete: "bg-yellow-500",
    closed: "bg-green-500",
  };

  const rfiStatusColors: Record<string, string> = {
    draft: "bg-gray-400",
    open: "bg-blue-500",
    closed: "bg-green-500",
  };

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
            <span>Reports</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {project.name}
          </h1>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="programme">Programme</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="Total Variations" value={variations.length} />
            <StatCard label="Total Claims" value={claims.length} />
            <StatCard label="Open Tenders" value={openTenders} />
            <StatCard label="Lots Sold" value={`${lotsSoldPct}%`} />
            <StatCard
              label="Programme Completion"
              value={`${programmeCompletion}%`}
              icon={<GanttChart className="size-4 text-fuchsia-500" />}
            />
            <StatCard label="Total Defects" value={defects.length} />
            <StatCard label="EOT Days Approved" value={eotDaysApproved} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <StatCard
              label="Site Diary Entries"
              value={diaryEntries.length}
            />
            <StatCard label="Total Submittals" value={submittals.length} />
            <StatCard label="Total RFIs" value={rfis.length} />
            <StatCard
              label="Risks & Opportunities"
              value={risks.length}
              icon={<ShieldCheck className="size-4 text-fuchsia-500" />}
            />
          </div>
        </TabsContent>

        {/* FINANCIAL TAB */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="size-4 text-fuchsia-500" />
                  Variations by Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Total Cost Impact
                  </span>
                  <span className="font-bold">
                    {formatCurrency(totalVariationCost)}
                  </span>
                </div>
                <BarChart
                  items={variationsByStatus.map((v) => ({
                    label:
                      v.status.charAt(0).toUpperCase() +
                      v.status.slice(1).replace("_", " "),
                    value: v.count,
                    color: variationStatusColors[v.status],
                    pct:
                      variations.length > 0
                        ? (v.count / variations.length) * 100
                        : 0,
                  }))}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="size-4 text-fuchsia-500" />
                  Claims: Claimed vs Certified
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ComparisonBars
                  items={[
                    {
                      label: "Total Claimed",
                      value: totalClaimed,
                      color: "bg-emerald-500",
                    },
                    {
                      label: "Total Certified",
                      value: totalCertified,
                      color: "bg-blue-500",
                    },
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="size-4 text-fuchsia-500" />
                  Tenders: Estimated vs Awarded
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ComparisonBars
                  items={[
                    {
                      label: "Total Estimated",
                      value: totalTenderEstimated,
                      color: "bg-indigo-500",
                    },
                    {
                      label: "Total Awarded",
                      value: totalTenderAwarded,
                      color: "bg-amber-500",
                    },
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* PROGRAMME TAB */}
        <TabsContent value="programme" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="Total Tasks" value={totalTasks} />
            <StatCard label="Not Started" value={tasksNotStarted} />
            <StatCard label="In Progress" value={tasksInProgress} />
            <StatCard label="Complete" value={tasksComplete} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GanttChart className="size-4 text-fuchsia-500" />
                Overall Completion: {programmeCompletion}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-full overflow-hidden rounded-md bg-muted">
                <div
                  className="h-full bg-fuchsia-500 rounded-md transition-all"
                  style={{ width: `${programmeCompletion}%` }}
                />
              </div>
              <div className="mt-4">
                <BarChart
                  items={[
                    {
                      label: "Not Started",
                      value: tasksNotStarted,
                      color: "bg-gray-400",
                      pct:
                        totalTasks > 0
                          ? (tasksNotStarted / totalTasks) * 100
                          : 0,
                    },
                    {
                      label: "In Progress",
                      value: tasksInProgress,
                      color: "bg-blue-500",
                      pct:
                        totalTasks > 0
                          ? (tasksInProgress / totalTasks) * 100
                          : 0,
                    },
                    {
                      label: "Complete",
                      value: tasksComplete,
                      color: "bg-green-500",
                      pct:
                        totalTasks > 0
                          ? (tasksComplete / totalTasks) * 100
                          : 0,
                    },
                  ]}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* QUALITY TAB */}
        <TabsContent value="quality" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="size-4 text-fuchsia-500" />
                  Submittals ({submittals.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  items={submittalsByStatus.map((s) => ({
                    label:
                      submittalStatusLabels[s.status] || s.status,
                    value: s.count,
                    color: submittalStatusColors[s.status],
                    pct:
                      submittals.length > 0
                        ? (s.count / submittals.length) * 100
                        : 0,
                  }))}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="size-4 text-fuchsia-500" />
                  Defects ({defects.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  items={defectsByStatus.map((d) => ({
                    label:
                      d.status.charAt(0).toUpperCase() +
                      d.status.slice(1).replace("_", " "),
                    value: d.count,
                    color: defectStatusColors[d.status],
                    pct:
                      defects.length > 0
                        ? (d.count / defects.length) * 100
                        : 0,
                  }))}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="size-4 text-fuchsia-500" />
                  RFIs ({rfis.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  items={rfisByStatus.map((r) => ({
                    label:
                      r.status.charAt(0).toUpperCase() + r.status.slice(1),
                    value: r.count,
                    color: rfiStatusColors[r.status],
                    pct:
                      rfis.length > 0
                        ? (r.count / rfis.length) * 100
                        : 0,
                  }))}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="size-4 text-fuchsia-500" />
                  Risks & Opportunities ({risks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  items={risksByLevel.map((r) => ({
                    label:
                      r.level.charAt(0).toUpperCase() + r.level.slice(1),
                    value: r.total,
                    color:
                      r.level === "high"
                        ? "bg-red-500"
                        : r.level === "medium"
                          ? "bg-yellow-500"
                          : "bg-green-500",
                    pct:
                      risks.length > 0
                        ? (r.total / risks.length) * 100
                        : 0,
                  }))}
                />
                <div className="mt-4 flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">
                      {risks.filter((r) => r.type === "risk").length}
                    </Badge>
                    <span className="text-muted-foreground">Risks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500">
                      {risks.filter((r) => r.type === "opportunity").length}
                    </Badge>
                    <span className="text-muted-foreground">Opportunities</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
