"use client";

import { useMemo } from "react";
import type {
  FlatRow,
  ProgrammeDependency,
  TimelineConfig,
} from "./gantt-utils";
import { getBarGeometry } from "./gantt-utils";

const ROW_HEIGHT = 40;

interface GanttChartProps {
  rows: FlatRow[];
  timeline: TimelineConfig;
  dependencies: ProgrammeDependency[];
}

export function GanttChart({ rows, timeline, dependencies }: GanttChartProps) {
  const totalHeight = Math.max((rows.length + 1) * ROW_HEIGHT, ROW_HEIGHT * 2);

  const todayOffset = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const msPerDay = 86400000;
    const days = Math.round(
      (today.getTime() - timeline.startDate.getTime()) / msPerDay
    );
    return days * timeline.pxPerDay;
  }, [timeline]);

  // Build a map of task id → row index for dependency arrows
  const rowIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((row, i) => map.set(row.task.id, i));
    return map;
  }, [rows]);

  const depPaths = useMemo(() => {
    return dependencies
      .map((dep) => {
        const predIdx = rowIndexMap.get(dep.predecessor_id);
        const succIdx = rowIndexMap.get(dep.successor_id);
        if (predIdx === undefined || succIdx === undefined) return null;

        const predRow = rows[predIdx];
        const succRow = rows[succIdx];
        const predGeo = getBarGeometry(predRow.task, timeline);
        const succGeo = getBarGeometry(succRow.task, timeline);

        // Predecessor bar end point
        const x1 = predGeo.left + predGeo.width;
        const y1 = predIdx * ROW_HEIGHT + ROW_HEIGHT / 2;

        // Successor bar start point
        const x2 = succGeo.left;
        const y2 = succIdx * ROW_HEIGHT + ROW_HEIGHT / 2;

        // Right-angle connector
        const midX = x1 + 12;
        const d = `M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`;

        return { d, x2, y2, key: dep.id };
      })
      .filter(Boolean) as { d: string; x2: number; y2: number; key: string }[];
  }, [dependencies, rowIndexMap, rows, timeline]);

  return (
    <div className="relative" style={{ width: timeline.totalWidth }}>
      {/* Timeline header */}
      <div
        className="flex border-b bg-muted/50 sticky top-0 z-10"
        style={{ height: ROW_HEIGHT }}
      >
        {timeline.columns.map((col, i) => (
          <div
            key={i}
            className="flex items-center justify-center text-xs text-muted-foreground border-r shrink-0"
            style={{ width: col.width }}
          >
            {col.label}
          </div>
        ))}
      </div>

      {/* Bar area */}
      <div className="relative" style={{ height: totalHeight - ROW_HEIGHT }}>
        {/* Grid lines */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={timeline.totalWidth}
          height={totalHeight - ROW_HEIGHT}
        >
          {/* Vertical grid lines */}
          {timeline.columns.map((col, i) => {
            let x = 0;
            for (let j = 0; j < i; j++) {
              x += timeline.columns[j].width;
            }
            return (
              <line
                key={`grid-${i}`}
                x1={x}
                y1={0}
                x2={x}
                y2={totalHeight - ROW_HEIGHT}
                stroke="currentColor"
                className="text-border"
                strokeDasharray="2 4"
                strokeWidth={0.5}
              />
            );
          })}

          {/* Horizontal row lines */}
          {rows.map((_, i) => (
            <line
              key={`row-${i}`}
              x1={0}
              y1={(i + 1) * ROW_HEIGHT}
              x2={timeline.totalWidth}
              y2={(i + 1) * ROW_HEIGHT}
              stroke="currentColor"
              className="text-border"
              strokeWidth={0.5}
            />
          ))}

          {/* Today marker */}
          {todayOffset >= 0 && todayOffset <= timeline.totalWidth && (
            <line
              x1={todayOffset}
              y1={0}
              x2={todayOffset}
              y2={totalHeight - ROW_HEIGHT}
              stroke="#ef4444"
              strokeWidth={1.5}
            />
          )}

          {/* Dependency arrows */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon
                points="0 0, 8 3, 0 6"
                className="fill-muted-foreground"
              />
            </marker>
          </defs>
          {depPaths.map((dep) => (
            <path
              key={dep.key}
              d={dep.d}
              fill="none"
              stroke="currentColor"
              className="text-muted-foreground"
              strokeWidth={1.5}
              markerEnd="url(#arrowhead)"
            />
          ))}
        </svg>

        {/* Task bars */}
        {rows.map((row, i) => {
          const geo = getBarGeometry(row.task, timeline);
          const isParent = row.hasChildren;
          const barHeight = isParent ? 16 : 24;
          const barTop = i * ROW_HEIGHT + (ROW_HEIGHT - barHeight) / 2;
          const progressWidth =
            (geo.width * row.task.progress) / 100;

          return (
            <div
              key={row.task.id}
              className="absolute group/bar"
              style={{
                left: geo.left,
                top: barTop,
                width: geo.width,
                height: barHeight,
              }}
            >
              {/* Background bar */}
              <div
                className={`absolute inset-0 rounded-sm ${
                  isParent
                    ? "bg-sky-500 dark:bg-sky-600"
                    : "bg-sky-300 dark:bg-sky-700"
                }`}
              />
              {/* Progress fill */}
              {row.task.progress > 0 && (
                <div
                  className={`absolute inset-y-0 left-0 rounded-sm ${
                    isParent
                      ? "bg-sky-700 dark:bg-sky-400"
                      : "bg-sky-500 dark:bg-sky-500"
                  }`}
                  style={{ width: progressWidth }}
                />
              )}
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/bar:block z-20">
                <div className="bg-popover text-popover-foreground text-xs rounded-md border px-2 py-1.5 shadow-md whitespace-nowrap">
                  <p className="font-medium">{row.task.name}</p>
                  <p className="text-muted-foreground">
                    {row.task.progress}% complete
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
