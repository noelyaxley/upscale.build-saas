import {
  Building2,
  LayoutDashboard,
  DollarSign,
  Users,
  FolderKanban,
  TrendingUp,
  BookOpen,
  ClipboardList,
} from "lucide-react";

const stats = [
  { label: "Active Projects", value: "12", icon: FolderKanban },
  { label: "Total Budget", value: "$48.2M", icon: DollarSign },
  { label: "Open Claims", value: "8", icon: ClipboardList },
  { label: "On Schedule", value: "92%", icon: TrendingUp },
];

const projects = [
  {
    name: "Westfield Tower",
    stage: "Construction",
    budget: "$18.5M",
    progress: 68,
  },
  {
    name: "Harbour Residences",
    stage: "Fitout",
    budget: "$12.3M",
    progress: 85,
  },
  {
    name: "Metro Station Upgrade",
    stage: "Design",
    budget: "$9.8M",
    progress: 32,
  },
];

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: FolderKanban, label: "Projects", active: false },
  { icon: DollarSign, label: "Claims", active: false },
  { icon: BookOpen, label: "Site Diary", active: false },
  { icon: ClipboardList, label: "Tenders", active: false },
  { icon: Users, label: "Team", active: false },
];

export function DashboardPreview() {
  return (
    <div className="mx-auto max-w-[1000px]">
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex">
          {/* Sidebar */}
          <div className="hidden w-48 shrink-0 border-r border-border bg-muted/30 p-3 md:block">
            <div className="mb-5 flex items-center gap-2 px-2 text-sm font-bold">
              <Building2 className="size-4 text-primary" />
              Upscale.Build
            </div>
            <nav className="space-y-0.5">
              {sidebarItems.map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
                    item.active
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="size-3.5" />
                  {item.label}
                </div>
              ))}
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold">Dashboard</h3>
              <div className="size-7 rounded-full bg-primary/10" />
            </div>

            {/* Stats grid */}
            <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-md border border-border bg-background p-2.5"
                >
                  <div className="mb-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <stat.icon className="size-3" />
                    {stat.label}
                  </div>
                  <div className="text-base font-bold">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Project cards */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">
                Recent Projects
              </h4>
              {projects.map((project) => (
                <div
                  key={project.name}
                  className="flex items-center gap-3 rounded-md border border-border bg-background p-2.5"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <Building2 className="size-3.5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {project.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {project.budget}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {project.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
