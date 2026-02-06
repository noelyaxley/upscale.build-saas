"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react";
import type { Tables } from "@/lib/supabase/database.types";
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
import { Separator } from "@/components/ui/separator";
import { EditProjectDialog } from "@/components/edit-project-dialog";
import { DeleteProjectDialog } from "@/components/delete-project-dialog";
import { ProjectMembersList } from "@/components/project-members-list";

type Project = Tables<"projects">;
type Company = Tables<"companies">;
type Profile = Tables<"profiles">;
type ProjectMember = Tables<"project_members">;

interface MemberWithProfile extends ProjectMember {
  profiles: Profile;
}

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

function formatDate(date: string | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface ProjectDetailProps {
  project: Project;
  clientCompany: Company | null;
  members: MemberWithProfile[];
}

export function ProjectDetail({ project, clientCompany, members }: ProjectDetailProps) {
  const { isAdmin } = useOrganisation();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">
              {project.code}
            </span>
            <Badge variant="secondary" className={stageColors[project.stage]}>
              {formatStage(project.stage)}
            </Badge>
            <Badge variant="outline" className={statusColors[project.status]}>
              {formatStatus(project.status)}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <EditProjectDialog project={project}>
              <Button variant="outline" size="sm">
                <Pencil className="mr-2 size-4" />
                Edit
              </Button>
            </EditProjectDialog>
            <DeleteProjectDialog project={project}>
              <Button variant="outline" size="sm" className="text-destructive">
                <Trash2 className="mr-2 size-4" />
                Delete
              </Button>
            </DeleteProjectDialog>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="size-4 text-muted-foreground" />
              Client
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clientCompany ? (
              <Link
                href={`/companies/${clientCompany.id}`}
                className="text-sm font-medium hover:underline"
              >
                {clientCompany.name}
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">No client assigned</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="size-4 text-muted-foreground" />
              Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(project.budget)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="size-4 text-muted-foreground" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start</span>
                <span className="font-medium">{formatDate(project.start_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">End</span>
                <span className="font-medium">{formatDate(project.end_date)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="size-4 text-muted-foreground" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{project.address || "-"}</p>
          </CardContent>
        </Card>
      </div>

      {project.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {project.description}
            </p>
          </CardContent>
        </Card>
      )}

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        <ProjectMembersList projectId={project.id} members={members} />

        <Card>
          <CardHeader>
            <CardTitle>Project Activity</CardTitle>
            <CardDescription>
              Recent updates and activity for this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No activity yet. Project modules like documents, defects, and RFIs
              will appear here in future updates.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
