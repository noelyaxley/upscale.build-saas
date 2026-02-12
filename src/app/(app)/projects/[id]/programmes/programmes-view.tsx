"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GanttChart as GanttChartIcon,
  Plus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
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
import { Progress } from "@/components/ui/progress";
import { CreateTaskDialog } from "@/components/create-task-dialog";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { TaskListPanel } from "./task-list-panel";
import { GanttChart } from "./gantt-chart";
import {
  type ProgrammeTask,
  type ProgrammeDependency,
  type ZoomLevel,
  buildTaskTree,
  flattenVisibleTasks,
  calculateTimeline,
} from "./gantt-utils";

interface ProgrammesViewProps {
  project: { id: string; code: string; name: string };
  tasks: ProgrammeTask[];
  dependencies: ProgrammeDependency[];
}

export function ProgrammesView({
  project,
  tasks,
  dependencies,
}: ProgrammesViewProps) {
  const router = useRouter();
  const supabase = createClient();
  const [zoom, setZoom] = useState<ZoomLevel>("week");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // Default: expand all parent tasks
    const parentIds = new Set<string>();
    for (const task of tasks) {
      if (task.parent_id) {
        parentIds.add(task.parent_id);
      }
    }
    return parentIds;
  });

  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const scrollingRef = useRef<"left" | "right" | null>(null);

  const handleLeftScroll = useCallback(() => {
    if (scrollingRef.current === "right") return;
    scrollingRef.current = "left";
    if (rightRef.current && leftRef.current) {
      rightRef.current.scrollTop = leftRef.current.scrollTop;
    }
    requestAnimationFrame(() => {
      scrollingRef.current = null;
    });
  }, []);

  const handleRightScroll = useCallback(() => {
    if (scrollingRef.current === "left") return;
    scrollingRef.current = "right";
    if (leftRef.current && rightRef.current) {
      leftRef.current.scrollTop = rightRef.current.scrollTop;
    }
    requestAnimationFrame(() => {
      scrollingRef.current = null;
    });
  }, []);

  const toggleExpand = useCallback((taskId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }, []);

  const handleDeleteTask = useCallback(
    async (task: ProgrammeTask) => {
      await supabase.from("programme_tasks").delete().eq("id", task.id);
      router.refresh();
    },
    [supabase, router]
  );

  const tree = useMemo(
    () => buildTaskTree(tasks, expandedIds),
    [tasks, expandedIds]
  );
  const rows = useMemo(() => flattenVisibleTasks(tree), [tree]);
  const timeline = useMemo(
    () => calculateTimeline(tasks, zoom),
    [tasks, zoom]
  );

  // Stats
  const totalTasks = tasks.length;
  const overallProgress =
    totalTasks > 0
      ? Math.round(
          tasks.reduce((sum, t) => sum + t.progress, 0) / totalTasks
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        backHref={`/projects/${project.id}`}
        title={project.name}
        breadcrumbs={[
          { label: project.code, href: `/projects/${project.id}` },
          { label: "Programmes" },
        ]}
      >
        <Select
          value={zoom}
          onValueChange={(v) => setZoom(v as ZoomLevel)}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
          </SelectContent>
        </Select>
        <CreateTaskDialog projectId={project.id} tasks={tasks} dependencies={dependencies}>
          <Button size="sm">
            <Plus className="mr-2 size-4" />
            Add Task
          </Button>
        </CreateTaskDialog>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard icon={GanttChartIcon} label="Total Tasks" value={totalTasks} iconClassName="text-sky-500" />
        <Card className="card-hover-lift border-black/[0.08]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Progress
            </CardTitle>
            <GanttChartIcon className="size-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Progress value={overallProgress} className="flex-1" />
              <span className="text-sm font-medium tabular-nums">{overallProgress}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Split Layout */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Programme Schedule</CardTitle>
          <CardDescription>
            {totalTasks} task{totalTasks !== 1 ? "s" : ""} &middot;{" "}
            {dependencies.length} dependenc
            {dependencies.length !== 1 ? "ies" : "y"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex border-t" style={{ height: "calc(100vh - 400px)", minHeight: 400 }}>
            {/* Left Panel: Task List */}
            <div
              ref={leftRef}
              onScroll={handleLeftScroll}
              className="overflow-y-auto border-r shrink-0"
              style={{ width: 660 }}
            >
              <TaskListPanel
                rows={rows}
                onToggleExpand={toggleExpand}
                onDeleteTask={handleDeleteTask}
                tasks={tasks}
                dependencies={dependencies}
              />
            </div>

            {/* Right Panel: Gantt Chart */}
            <div
              ref={rightRef}
              onScroll={handleRightScroll}
              className="overflow-auto flex-1"
            >
              <GanttChart
                rows={rows}
                timeline={timeline}
                dependencies={dependencies}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
