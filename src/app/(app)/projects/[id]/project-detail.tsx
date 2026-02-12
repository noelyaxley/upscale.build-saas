"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BarChart3,
  Building2,
  Calculator,
  Calendar,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock,
  DollarSign,
  FileText,
  GanttChart,
  Gavel,
  Home,
  MapPin,
  MessageSquarePlus,
  Pencil,
  Receipt,
  Share2,
  Shield,
  Trash2,
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
import { PageHeader } from "@/components/page-header";

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

const projectModules: {
  slug: string;
  label: string;
  description: string;
  icon: LucideIcon;
  bg: string;
  text: string;
}[] = [
  { slug: "documents", label: "Documents", description: "Drawings, specs, and project files", icon: FileText, bg: "bg-primary/10", text: "text-primary" },
  { slug: "rfis", label: "RFIs", description: "Requests for Information", icon: MessageSquarePlus, bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400" },
  { slug: "defects", label: "Defects", description: "Track and manage defects", icon: AlertTriangle, bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400" },
  { slug: "risks", label: "Risks & Opportunities", description: "Monitor project risks", icon: Shield, bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400" },
  { slug: "eot", label: "Extension of Time", description: "Time extension claims", icon: Clock, bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-600 dark:text-indigo-400" },
  { slug: "claims", label: "Contracts", description: "Payment submissions", icon: Receipt, bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400" },
  { slug: "site-diary", label: "Site Diary", description: "Daily site records", icon: ClipboardList, bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-600 dark:text-cyan-400" },
  { slug: "tenders", label: "Tenders", description: "Contractor tender management", icon: Gavel, bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-600 dark:text-orange-400" },
  { slug: "programmes", label: "Programmes", description: "Programme schedule & timeline", icon: GanttChart, bg: "bg-sky-100 dark:bg-sky-900/30", text: "text-sky-600 dark:text-sky-400" },
  { slug: "submittals", label: "Submittals", description: "Shop drawings & material approvals", icon: ClipboardCheck, bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-600 dark:text-violet-400" },
  { slug: "lot-sales", label: "Lot Sales", description: "Unit inventory & sales tracking", icon: Home, bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-600 dark:text-rose-400" },
  { slug: "sales-agents", label: "Sales Agents", description: "Agent management & commissions", icon: UserCheck, bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-600 dark:text-pink-400" },
  { slug: "feasibility", label: "Feasibility", description: "Development appraisal tool", icon: Calculator, bg: "bg-lime-100 dark:bg-lime-900/30", text: "text-lime-600 dark:text-lime-400" },
  { slug: "reports", label: "Reports", description: "Project reporting dashboard", icon: BarChart3, bg: "bg-fuchsia-100 dark:bg-fuchsia-900/30", text: "text-fuchsia-600 dark:text-fuchsia-400" },
];

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
      <PageHeader
        backHref="/dashboard"
        title={project.name}
        breadcrumbs={[
          { label: project.code },
        ]}
        badge={
          <>
            <Badge variant="secondary" className={stageColors[project.stage]}>
              {formatStage(project.stage)}
            </Badge>
            <Badge variant="outline" className={statusColors[project.status]}>
              {formatStatus(project.status)}
            </Badge>
          </>
        }
      >
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
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover-lift border-black/[0.08]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="size-4 text-primary" />
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

        <Card className="card-hover-lift border-black/[0.08]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="size-4 text-primary" />
              Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-medium tabular-nums">{formatCurrency(project.budget ?? 0)}</p>
          </CardContent>
        </Card>

        <Card className="card-hover-lift border-black/[0.08]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="size-4 text-primary" />
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

        <Card className="card-hover-lift border-black/[0.08]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="size-4 text-primary" />
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
            {projectModules.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={mod.slug}
                  href={`/projects/${project.id}/${mod.slug}`}
                  className="flex items-center justify-between rounded-lg border border-black/[0.08] p-3 card-hover-lift"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex size-10 items-center justify-center rounded-lg ${mod.bg}`}>
                      <Icon className={`size-5 ${mod.text}`} />
                    </div>
                    <div>
                      <p className="font-medium">{mod.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {mod.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="size-5 text-muted-foreground" />
                </Link>
              );
            })}
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
