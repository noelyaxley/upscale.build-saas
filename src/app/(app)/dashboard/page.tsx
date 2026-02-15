"use client";

import { useSearchParams } from "next/navigation";
import { DollarSign, FolderKanban, HardHat, Users } from "lucide-react";
import { useOrganisation } from "@/lib/context/organisation";
import { ProjectCard } from "@/components/project-card";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "true";
  const { organisation, projects, isAdmin } = useOrganisation();

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);

  const stats = [
    {
      title: "Total Projects",
      value: totalProjects,
      icon: FolderKanban,
    },
    {
      title: "Active Projects",
      value: activeProjects,
      icon: HardHat,
    },
    {
      title: "Total Budget",
      value: formatCurrency(totalBudget),
      icon: DollarSign,
    },
    {
      title: "Team Members",
      value: "-",
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to {organisation.name}
          </p>
        </div>
        <CreateProjectDialog defaultOpen={isNew} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            icon={stat.icon}
            label={stat.title}
            value={stat.value}
          />
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Projects</h2>
        {projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Get started by creating your first construction project"
            action={isAdmin ? <CreateProjectDialog /> : undefined}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} isAdmin={isAdmin} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
