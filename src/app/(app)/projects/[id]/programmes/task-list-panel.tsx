"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import {
  type FlatRow,
  type ProgrammeTask,
  getDuration,
  formatDate,
} from "./gantt-utils";

const ROW_HEIGHT = 40;

interface TaskListPanelProps {
  rows: FlatRow[];
  onToggleExpand: (taskId: string) => void;
  onDeleteTask: (task: ProgrammeTask) => void;
  tasks: ProgrammeTask[];
}

export function TaskListPanel({
  rows,
  onToggleExpand,
  onDeleteTask,
  tasks,
}: TaskListPanelProps) {
  const router = useRouter();
  const supabase = createClient();
  const [editingCell, setEditingCell] = useState<{
    taskId: string;
    field: string;
  } | null>(null);
  const [editValue, setEditValue] = useState("");

  const startEdit = (taskId: string, field: string, currentValue: string) => {
    setEditingCell({ taskId, field });
    setEditValue(currentValue);
  };

  const commitEdit = async () => {
    if (!editingCell) return;
    const { taskId, field } = editingCell;

    const updateData: Record<string, string | number> = {};
    if (field === "name") {
      if (!editValue.trim()) {
        setEditingCell(null);
        return;
      }
      updateData.name = editValue.trim();
    } else if (field === "start_date" || field === "end_date") {
      if (!editValue) {
        setEditingCell(null);
        return;
      }
      updateData[field] = editValue;
    } else if (field === "progress") {
      const val = Math.min(100, Math.max(0, parseInt(editValue) || 0));
      updateData.progress = val;
    }

    await supabase
      .from("programme_tasks")
      .update(updateData)
      .eq("id", taskId);

    setEditingCell(null);
    router.refresh();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      commitEdit();
    } else if (e.key === "Escape") {
      setEditingCell(null);
    }
  };

  const countDescendants = (taskId: string): number => {
    const children = tasks.filter((t) => t.parent_id === taskId);
    return children.reduce(
      (sum, child) => sum + 1 + countDescendants(child.id),
      0
    );
  };

  return (
    <div className="min-w-[500px]">
      {/* Header */}
      <div
        className="flex items-center border-b bg-muted/50 text-xs font-medium text-muted-foreground sticky top-0 z-10"
        style={{ height: ROW_HEIGHT }}
      >
        <div className="flex-1 min-w-[200px] px-3">Task Name</div>
        <div className="w-[90px] px-2 text-center">Start</div>
        <div className="w-[90px] px-2 text-center">End</div>
        <div className="w-[50px] px-2 text-center">Days</div>
        <div className="w-[55px] px-2 text-center">%</div>
        <div className="w-[32px]" />
      </div>

      {/* Rows */}
      {rows.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          No tasks yet. Add a task to get started.
        </div>
      ) : (
        rows.map((row) => {
          const { task, depth, expanded, hasChildren } = row;
          const desc = countDescendants(task.id);
          return (
            <div
              key={task.id}
              className="flex items-center border-b hover:bg-muted/30 group"
              style={{ height: ROW_HEIGHT }}
            >
              {/* Task Name */}
              <div
                className="flex-1 min-w-[200px] flex items-center px-1 overflow-hidden"
                style={{ paddingLeft: depth * 20 + 4 }}
              >
                {hasChildren ? (
                  <button
                    onClick={() => onToggleExpand(task.id)}
                    className="flex items-center justify-center size-5 shrink-0 rounded hover:bg-muted"
                  >
                    {expanded ? (
                      <ChevronDown className="size-3.5" />
                    ) : (
                      <ChevronRight className="size-3.5" />
                    )}
                  </button>
                ) : (
                  <span className="size-5 shrink-0" />
                )}

                {editingCell?.taskId === task.id &&
                editingCell.field === "name" ? (
                  <Input
                    className="h-7 text-sm ml-1"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />
                ) : (
                  <span
                    className="text-sm truncate ml-1 cursor-text"
                    onDoubleClick={() =>
                      startEdit(task.id, "name", task.name)
                    }
                  >
                    {task.name}
                  </span>
                )}
              </div>

              {/* Start Date */}
              <div className="w-[90px] px-1 text-center">
                {editingCell?.taskId === task.id &&
                editingCell.field === "start_date" ? (
                  <Input
                    type="date"
                    className="h-7 text-xs px-1"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />
                ) : (
                  <span
                    className="text-xs cursor-pointer hover:underline"
                    onClick={() =>
                      startEdit(task.id, "start_date", task.start_date)
                    }
                  >
                    {new Date(task.start_date + "T00:00:00").toLocaleDateString(
                      "en-AU",
                      { day: "numeric", month: "short" }
                    )}
                  </span>
                )}
              </div>

              {/* End Date */}
              <div className="w-[90px] px-1 text-center">
                {editingCell?.taskId === task.id &&
                editingCell.field === "end_date" ? (
                  <Input
                    type="date"
                    className="h-7 text-xs px-1"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />
                ) : (
                  <span
                    className="text-xs cursor-pointer hover:underline"
                    onClick={() =>
                      startEdit(task.id, "end_date", task.end_date)
                    }
                  >
                    {new Date(task.end_date + "T00:00:00").toLocaleDateString(
                      "en-AU",
                      { day: "numeric", month: "short" }
                    )}
                  </span>
                )}
              </div>

              {/* Duration */}
              <div className="w-[50px] px-2 text-center text-xs text-muted-foreground">
                {getDuration(task.start_date, task.end_date)}d
              </div>

              {/* Progress */}
              <div className="w-[55px] px-1 text-center">
                {editingCell?.taskId === task.id &&
                editingCell.field === "progress" ? (
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    className="h-7 text-xs px-1"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />
                ) : (
                  <span
                    className="text-xs cursor-pointer hover:underline"
                    onClick={() =>
                      startEdit(task.id, "progress", String(task.progress))
                    }
                  >
                    {task.progress}%
                  </span>
                )}
              </div>

              {/* Delete */}
              <div className="w-[32px] flex items-center justify-center">
                <button
                  onClick={() => {
                    const msg = hasChildren
                      ? `Delete "${task.name}" and ${desc} child task${desc !== 1 ? "s" : ""}?`
                      : `Delete "${task.name}"?`;
                    if (confirm(msg)) {
                      onDeleteTask(task);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
