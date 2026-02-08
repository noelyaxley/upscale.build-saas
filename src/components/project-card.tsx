"use client";

import Link from "next/link";
import { MapPin, MoreHorizontal, Trash2 } from "lucide-react";
import type { Tables } from "@/lib/supabase/database.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteProjectDialog } from "@/components/delete-project-dialog";

type Project = Tables<"projects">;

const stageColors: Record<string, string> = {
  preconstruction: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  construction: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  defects: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  archived: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  on_hold: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
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

function formatStage(stage: string): string {
  return stage.charAt(0).toUpperCase() + stage.slice(1).replace("_", " ");
}

function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
}

interface ProjectCardProps {
  project: Project;
  isAdmin?: boolean;
}

export function ProjectCard({ project, isAdmin }: ProjectCardProps) {
  return (
    <Card className="relative transition-shadow hover:shadow-md">
      <Link href={`/projects/${project.id}`} className="absolute inset-0" />
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs text-muted-foreground">
              {project.code}
            </p>
            <CardTitle className="truncate text-base">{project.name}</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Badge
              variant="secondary"
              className={stageColors[project.stage] || ""}
            >
              {formatStage(project.stage)}
            </Badge>
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative z-10 size-7"
                    onClick={(e) => e.preventDefault()}
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DeleteProjectDialog project={project}>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 size-4" />
                      Delete project
                    </DropdownMenuItem>
                  </DeleteProjectDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Status</span>
          <Badge
            variant="outline"
            className={statusColors[project.status] || ""}
          >
            {formatStatus(project.status)}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Budget</span>
          <span className="font-medium">{formatCurrency(project.budget ?? 0)}</span>
        </div>
        {project.address && (
          <div className="flex items-start gap-1 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-3.5 shrink-0" />
            <span className="truncate">{project.address}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
