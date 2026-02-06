import type { Tables } from "@/lib/supabase/database.types";

export type ProgrammeTask = Tables<"programme_tasks">;
export type ProgrammeDependency = Tables<"programme_dependencies">;

export type ZoomLevel = "day" | "week" | "month";

export interface TaskTreeNode {
  task: ProgrammeTask;
  children: TaskTreeNode[];
  depth: number;
  expanded: boolean;
  hasChildren: boolean;
}

export interface FlatRow {
  task: ProgrammeTask;
  depth: number;
  expanded: boolean;
  hasChildren: boolean;
}

export interface TimelineColumn {
  label: string;
  date: Date;
  width: number;
}

export interface TimelineConfig {
  columns: TimelineColumn[];
  startDate: Date;
  endDate: Date;
  totalWidth: number;
  pxPerDay: number;
}

export interface BarGeometry {
  left: number;
  width: number;
}

const PX_PER_DAY: Record<ZoomLevel, number> = {
  day: 40,
  week: 16,
  month: 4,
};

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 86400000;
  return Math.round((b.getTime() - a.getTime()) / msPerDay);
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  return new Date(d.getFullYear(), d.getMonth(), diff);
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function buildTaskTree(
  tasks: ProgrammeTask[],
  expandedIds: Set<string>
): TaskTreeNode[] {
  const taskMap = new Map<string, ProgrammeTask>();
  const childrenMap = new Map<string | null, ProgrammeTask[]>();

  for (const task of tasks) {
    taskMap.set(task.id, task);
    const parentKey = task.parent_id;
    if (!childrenMap.has(parentKey)) {
      childrenMap.set(parentKey, []);
    }
    childrenMap.get(parentKey)!.push(task);
  }

  function buildNodes(parentId: string | null, depth: number): TaskTreeNode[] {
    const children = childrenMap.get(parentId) ?? [];
    return children
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((task) => {
        const taskChildren = childrenMap.get(task.id) ?? [];
        const hasChildren = taskChildren.length > 0;
        const expanded = expandedIds.has(task.id);
        return {
          task,
          children: hasChildren ? buildNodes(task.id, depth + 1) : [],
          depth,
          expanded,
          hasChildren,
        };
      });
  }

  return buildNodes(null, 0);
}

export function flattenVisibleTasks(tree: TaskTreeNode[]): FlatRow[] {
  const rows: FlatRow[] = [];

  function walk(nodes: TaskTreeNode[]) {
    for (const node of nodes) {
      rows.push({
        task: node.task,
        depth: node.depth,
        expanded: node.expanded,
        hasChildren: node.hasChildren,
      });
      if (node.expanded && node.hasChildren) {
        walk(node.children);
      }
    }
  }

  walk(tree);
  return rows;
}

export function calculateTimeline(
  tasks: ProgrammeTask[],
  zoom: ZoomLevel
): TimelineConfig {
  const pxPerDay = PX_PER_DAY[zoom];

  if (tasks.length === 0) {
    const today = startOfDay(new Date());
    const end = new Date(today);
    end.setDate(end.getDate() + 30);
    return {
      columns: generateColumns(today, end, zoom, pxPerDay),
      startDate: today,
      endDate: end,
      totalWidth: 30 * pxPerDay,
      pxPerDay,
    };
  }

  let minDate = new Date(tasks[0].start_date + "T00:00:00");
  let maxDate = new Date(tasks[0].end_date + "T00:00:00");

  for (const task of tasks) {
    const s = new Date(task.start_date + "T00:00:00");
    const e = new Date(task.end_date + "T00:00:00");
    if (s < minDate) minDate = s;
    if (e > maxDate) maxDate = e;
  }

  // Add padding
  const paddingDays = zoom === "day" ? 3 : zoom === "week" ? 7 : 14;
  const start = new Date(minDate);
  start.setDate(start.getDate() - paddingDays);
  const end = new Date(maxDate);
  end.setDate(end.getDate() + paddingDays);

  const columns = generateColumns(start, end, zoom, pxPerDay);
  const totalDays = daysBetween(start, end) + 1;

  return {
    columns,
    startDate: start,
    endDate: end,
    totalWidth: totalDays * pxPerDay,
    pxPerDay,
  };
}

function generateColumns(
  start: Date,
  end: Date,
  zoom: ZoomLevel,
  pxPerDay: number
): TimelineColumn[] {
  const columns: TimelineColumn[] = [];
  const current = new Date(start);

  if (zoom === "day") {
    while (current <= end) {
      columns.push({
        label: `${current.getDate()} ${current.toLocaleDateString("en-AU", { month: "short" })}`,
        date: new Date(current),
        width: pxPerDay,
      });
      current.setDate(current.getDate() + 1);
    }
  } else if (zoom === "week") {
    let weekStart = startOfWeek(new Date(current));
    while (weekStart <= end) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const effectiveEnd = weekEnd > end ? end : weekEnd;
      const effectiveStart = weekStart < start ? start : weekStart;
      const days = daysBetween(effectiveStart, effectiveEnd) + 1;
      columns.push({
        label: `${weekStart.getDate()} ${weekStart.toLocaleDateString("en-AU", { month: "short" })}`,
        date: new Date(weekStart),
        width: days * pxPerDay,
      });
      weekStart = new Date(weekStart);
      weekStart.setDate(weekStart.getDate() + 7);
    }
  } else {
    let monthStart = startOfMonth(new Date(current));
    while (monthStart <= end) {
      const nextMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
      const effectiveStart = monthStart < start ? start : monthStart;
      const effectiveEnd = nextMonth > end ? end : new Date(nextMonth.getTime() - 86400000);
      const days = daysBetween(effectiveStart, effectiveEnd) + 1;
      columns.push({
        label: monthStart.toLocaleDateString("en-AU", { month: "short", year: "2-digit" }),
        date: new Date(monthStart),
        width: days * pxPerDay,
      });
      monthStart = nextMonth;
    }
  }

  return columns;
}

export function getBarGeometry(
  task: ProgrammeTask,
  timeline: TimelineConfig
): BarGeometry {
  const taskStart = new Date(task.start_date + "T00:00:00");
  const taskEnd = new Date(task.end_date + "T00:00:00");

  const left = daysBetween(timeline.startDate, taskStart) * timeline.pxPerDay;
  const durationDays = daysBetween(taskStart, taskEnd) + 1;
  const width = Math.max(durationDays * timeline.pxPerDay, 4);

  return { left, width };
}

export function getDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");
  return daysBetween(start, end) + 1;
}

export function formatDate(date: string): string {
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
