"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  ChevronRight,
  ClipboardList,
  Clock,
  DollarSign,
  FileText,
  MapPin,
  MessageSquarePlus,
  Pencil,
  Receipt,
  Shield,
  Trash2,
  BarChart3,
  Calculator,
  ClipboardCheck,
  GanttChart,
  Gavel,
  Home,
  Share2,
  UserCheck,
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
import { SharePortalDialog } from "@/components/share-portal-dialog";
import { DeleteProjectDialog } from "@/components/delete-project-dialog";
import { ProjectMembersList } from "@/components/project-members-list";
import { ProjectActivityFeed } from "@/components/project-activity-feed";
import { ProjectActionItems } from "@/components/project-action-items";

type Project = Tables<"projects">;
type Company = Tables<"companies">;
type Profile = Tables<"profiles">;
type ProjectMember = Tables<"project_members">;

interface MemberWithProfile extends ProjectMember {
  profiles: Profile;
}

type ProjectUpdate = Tables<"project_updates"> & {
  created_by: { id: string; full_name: string | null } | null;
};

type ActionItem = Tables<"action_items"> & {
  assigned_to: { id: string; full_name: string | null } | null;
  created_by: { id: string; full_name: string | null } | null;
};

type TeamMember = {
  id: string;
  full_name: string | null;
};

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
  updates: ProjectUpdate[];
  actionItems: ActionItem[];
  teamMembers: TeamMember[];
}

export function ProjectDetail({
  project,
  clientCompany,
  members,
  updates,
  actionItems,
  teamMembers,
}: ProjectDetailProps) {
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
            <SharePortalDialog projectId={project.id}>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 size-4" />
                Share
              </Button>
            </SharePortalDialog>
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
            <p className="text-2xl font-bold">{formatCurrency(project.budget ?? 0)}</p>
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
            <CardTitle>Project Modules</CardTitle>
            <CardDescription>
              Access project features and tools
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link
              href={`/projects/${project.id}/documents`}
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="size-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Documents</p>
                  <p className="text-xs text-muted-foreground">
                    Drawings, specs, and project files
                  </p>
                </div>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </Link>
            <Link
              href={`/projects/${project.id}/rfis`}
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <MessageSquarePlus className="size-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium">RFIs</p>
                  <p className="text-xs text-muted-foreground">
                    Requests for Information
                  </p>
                </div>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </Link>
            <Link
              href={`/projects/${project.id}/defects`}
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                  <AlertTriangle className="size-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="font-medium">Defects</p>
                  <p className="text-xs text-muted-foreground">
                    Track and manage defects
                  </p>
                </div>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </Link>
            <Link
              href={`/projects/${project.id}/risks`}
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Shield className="size-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium">Risks & Opportunities</p>
                  <p className="text-xs text-muted-foreground">
                    Monitor project risks
                  </p>
                </div>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </Link>
            <Link
              href={`/projects/${project.id}/eot`}
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                  <Clock className="size-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="font-medium">Extension of Time</p>
                  <p className="text-xs text-muted-foreground">
                    Time extension claims
                  </p>
                </div>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </Link>
            <Link
              href={`/projects/${project.id}/claims`}
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <Receipt className="size-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium">Contracts</p>
                  <p className="text-xs text-muted-foreground">
                    Payment submissions
                  </p>
                </div>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </Link>
            <Link
              href={`/projects/${project.id}/site-diary`}
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
                  <ClipboardList className="size-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="font-medium">Site Diary</p>
                  <p className="text-xs text-muted-foreground">
                    Daily site records
                  </p>
                </div>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </Link>
            <Link
              href={`/projects/${project.id}/tenders`}
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <Gavel className="size-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="font-medium">Tenders</p>
                  <p className="text-xs text-muted-foreground">
                    Contractor tender management
                  </p>
                </div>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </Link>
            <Link
              href={`/projects/${project.id}/programmes`}
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/30">
                  <GanttChart className="size-5 text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <p className="font-medium">Programmes</p>
                  <p className="text-xs text-muted-foreground">
                    Programme schedule & timeline
                  </p>
                </div>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </Link>
            <Link
              href={`/projects/${project.id}/submittals`}
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                  <ClipboardCheck className="size-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="font-medium">Submittals</p>
                  <p className="text-xs text-muted-foreground">
                    Shop drawings & material approvals
                  </p>
                </div>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </Link>
            <Link
              href={`/projects/${project.id}/lot-sales`}
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/30">
                  <Home className="size-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <p className="font-medium">Lot Sales</p>
                  <p className="text-xs text-muted-foreground">
                    Unit inventory & sales tracking
                  </p>
                </div>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </Link>
            <Link
              href={`/projects/${project.id}/sales-agents`}
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-900/30">
                  <UserCheck className="size-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <p className="font-medium">Sales Agents</p>
                  <p className="text-xs text-muted-foreground">
                    Agent management & commissions
                  </p>
                </div>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </Link>
            <Link
              href={`/projects/${project.id}/feasibility`}
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-lime-100 dark:bg-lime-900/30">
                  <Calculator className="size-5 text-lime-600 dark:text-lime-400" />
                </div>
                <div>
                  <p className="font-medium">Feasibility</p>
                  <p className="text-xs text-muted-foreground">
                    Development appraisal tool
                  </p>
                </div>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </Link>
            <Link
              href={`/projects/${project.id}/reports`}
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/30">
                  <BarChart3 className="size-5 text-fuchsia-600 dark:text-fuchsia-400" />
                </div>
                <div>
                  <p className="font-medium">Reports</p>
                  <p className="text-xs text-muted-foreground">
                    Project reporting dashboard
                  </p>
                </div>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Activity Feed and Action Items */}
      <div className="grid gap-6 md:grid-cols-2">
        <ProjectActivityFeed projectId={project.id} updates={updates} />
        <ProjectActionItems
          projectId={project.id}
          actionItems={actionItems}
          teamMembers={teamMembers}
        />
      </div>
    </div>
  );
}
