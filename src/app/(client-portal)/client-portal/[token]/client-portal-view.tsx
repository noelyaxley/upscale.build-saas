"use client";

import {
  Calendar,
  Cloud,
  DollarSign,
  FileText,
  GanttChart,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

interface ClientPortalViewProps {
  project: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    address: string | null;
    start_date: string | null;
    end_date: string | null;
    stage: string;
    status: string;
  };
  variations: {
    id: string;
    status: string;
    cost_impact: number | null;
    title: string;
    variation_number: number;
  }[];
  claims: {
    id: string;
    status: string;
    claimed_amount: number | null;
    certified_amount: number | null;
    claim_number: number;
    period_start: string | null;
    period_end: string | null;
  }[];
  tasks: {
    id: string;
    name: string;
    progress: number;
    parent_id: string | null;
  }[];
  recentDiary: {
    id: string;
    entry_date: string;
    weather_condition: string | null;
    work_summary: string | null;
  }[];
}

const stageColors: Record<string, string> = {
  preconstruction:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  construction:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  defects:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  archived: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

const statusColors: Record<string, string> = {
  active:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  on_hold:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  completed:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  cancelled:
    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const variationStatusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  submitted:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  under_review:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  approved:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

const claimStatusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  submitted:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  certified:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  disputed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

function formatCurrency(cents: number | null): string {
  if (cents === null || cents === 0) return "-";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(date: string | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatLabel(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");
}

const weatherLabels: Record<string, string> = {
  sunny: "Sunny",
  partly_cloudy: "Partly Cloudy",
  cloudy: "Cloudy",
  rain: "Rain",
  storm: "Storm",
  wind: "Wind",
};

export function ClientPortalView({
  project,
  variations,
  claims,
  tasks,
  recentDiary,
}: ClientPortalViewProps) {
  // Programme completion
  const parentIds = new Set(tasks.map((t) => t.parent_id).filter(Boolean));
  const leafTasks = tasks.filter((t) => !parentIds.has(t.id));
  const programmeCompletion =
    leafTasks.length > 0
      ? Math.round(
          leafTasks.reduce((sum, t) => sum + t.progress, 0) / leafTasks.length
        )
      : 0;
  const tasksComplete = tasks.filter((t) => t.progress === 100).length;
  const tasksInProgress = tasks.filter(
    (t) => t.progress > 0 && t.progress < 100
  ).length;

  const totalClaimed = claims.reduce(
    (sum, c) => sum + (c.claimed_amount ?? 0),
    0
  );
  const totalCertified = claims.reduce(
    (sum, c) => sum + (c.certified_amount ?? 0),
    0
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Project Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">
              {project.code}
            </span>
            <Badge
              variant="secondary"
              className={stageColors[project.stage] || ""}
            >
              {formatLabel(project.stage)}
            </Badge>
            <Badge
              variant="outline"
              className={statusColors[project.status] || ""}
            >
              {formatLabel(project.status)}
            </Badge>
          </div>
          <CardTitle className="text-2xl">{project.name}</CardTitle>
          {project.description && (
            <CardDescription className="whitespace-pre-wrap">
              {project.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {project.address && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="size-4 text-muted-foreground" />
                <span>{project.address}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="size-4 text-muted-foreground" />
              <span>Start: {formatDate(project.start_date)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="size-4 text-muted-foreground" />
              <span>End: {formatDate(project.end_date)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Programme Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <GanttChart className="size-5 text-slate-500" />
            Programme Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-6 w-full overflow-hidden rounded-md bg-muted">
                <div
                  className="h-full bg-sky-500 rounded-md transition-all"
                  style={{ width: `${programmeCompletion}%` }}
                />
              </div>
            </div>
            <span className="text-2xl font-bold">{programmeCompletion}%</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <span>
              {tasks.length} tasks total
            </span>
            <span>{tasksComplete} complete</span>
            <span>{tasksInProgress} in progress</span>
          </div>
        </CardContent>
      </Card>

      {/* Variations Summary */}
      {variations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="size-5 text-slate-500" />
              Variations ({variations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">No.</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Cost Impact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variations.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-mono text-sm">
                      V-{String(v.variation_number).padStart(3, "0")}
                    </TableCell>
                    <TableCell>{v.title}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={variationStatusColors[v.status] || ""}
                      >
                        {formatLabel(v.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(v.cost_impact)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Claims Summary */}
      {claims.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="size-5 text-slate-500" />
              Progress Claims ({claims.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md bg-muted/50 p-3">
                <p className="text-sm text-muted-foreground">Total Claimed</p>
                <p className="text-xl font-bold">{formatCurrency(totalClaimed)}</p>
              </div>
              <div className="rounded-md bg-muted/50 p-3">
                <p className="text-sm text-muted-foreground">
                  Total Certified
                </p>
                <p className="text-xl font-bold">
                  {formatCurrency(totalCertified)}
                </p>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">No.</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Claimed</TableHead>
                  <TableHead className="text-right">Certified</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claims.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-sm">
                      PC-{String(c.claim_number).padStart(3, "0")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(c.period_start)} &ndash;{" "}
                      {formatDate(c.period_end)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={claimStatusColors[c.status] || ""}
                      >
                        {formatLabel(c.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(c.claimed_amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(c.certified_amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Recent Site Diary */}
      {recentDiary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Cloud className="size-5 text-slate-500" />
              Recent Site Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDiary.map((entry) => (
                <div key={entry.id} className="border-b pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      {formatDate(entry.entry_date)}
                    </span>
                    {entry.weather_condition && (
                      <Badge variant="outline" className="text-xs">
                        {weatherLabels[entry.weather_condition] ||
                          entry.weather_condition}
                      </Badge>
                    )}
                  </div>
                  {entry.work_summary && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {entry.work_summary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
