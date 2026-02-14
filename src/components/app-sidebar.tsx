"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BarChart3,
  Building2,
  Calculator,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock,
  CreditCard,
  FileText,
  FolderKanban,
  GanttChart,
  Gavel,
  HardHat,
  Home,
  LayoutDashboard,
  LogOut,
  MessageSquarePlus,
  Receipt,
  Settings,
  Shield,
  UserCheck,
  Users,
} from "lucide-react";

import { useOrganisation } from "@/lib/context/organisation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const projectModules: { label: string; slug: string; icon: LucideIcon }[] = [
  { label: "Documents", slug: "documents", icon: FileText },
  { label: "RFIs", slug: "rfis", icon: MessageSquarePlus },
  { label: "Defects", slug: "defects", icon: AlertTriangle },
  { label: "Risks", slug: "risks", icon: Shield },
  { label: "Extension of Time", slug: "eot", icon: Clock },
  { label: "Contracts", slug: "claims", icon: Receipt },
  { label: "Site Diary", slug: "site-diary", icon: ClipboardList },
  { label: "Tenders", slug: "tenders", icon: Gavel },
  { label: "Programmes", slug: "programmes", icon: GanttChart },
  { label: "Submittals", slug: "submittals", icon: ClipboardCheck },
  { label: "Lot Sales", slug: "lot-sales", icon: Home },
  { label: "Sales Agents", slug: "sales-agents", icon: UserCheck },
  { label: "Feasibility", slug: "feasibility", icon: Calculator },
  { label: "Reports", slug: "reports", icon: BarChart3 },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { profile, organisation, projects } = useOrganisation();

  const userEmail = profile.full_name || "User";
  const userInitial = userEmail.charAt(0).toUpperCase();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <HardHat className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {organisation.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    Upscale.Build
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard"}
                  tooltip="Dashboard"
                >
                  <Link href="/dashboard">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      isActive={pathname.startsWith("/projects")}
                      tooltip="Projects"
                    >
                      <FolderKanban />
                      <span>Projects</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {projects.length === 0 ? (
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton className="text-muted-foreground">
                            No projects yet
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ) : (
                        projects.map((project) => {
                          const projectPath = `/projects/${project.id}`;
                          const isProjectActive = pathname.startsWith(projectPath);

                          return (
                            <SidebarMenuSubItem key={project.id}>
                              <Collapsible
                                defaultOpen={isProjectActive}
                                className="group/project"
                              >
                                <div className="flex items-center">
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={pathname === projectPath}
                                    className="flex-1"
                                  >
                                    <Link href={projectPath}>
                                      <span className="truncate">
                                        {project.name}
                                      </span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                  <CollapsibleTrigger asChild>
                                    <button
                                      type="button"
                                      className="flex size-6 shrink-0 items-center justify-center rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                    >
                                      <ChevronRight className="size-3 transition-transform duration-200 group-data-[state=open]/project:rotate-90" />
                                    </button>
                                  </CollapsibleTrigger>
                                </div>
                                <CollapsibleContent>
                                  <SidebarMenuSub>
                                    {projectModules.map((mod) => {
                                      const ModIcon = mod.icon;
                                      const modPath = `${projectPath}/${mod.slug}`;
                                      return (
                                        <SidebarMenuSubItem key={mod.slug}>
                                          <SidebarMenuSubButton
                                            asChild
                                            isActive={pathname.startsWith(modPath)}
                                          >
                                            <Link href={modPath}>
                                              <ModIcon className="size-3.5" />
                                              <span>{mod.label}</span>
                                            </Link>
                                          </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                      );
                                    })}
                                  </SidebarMenuSub>
                                </CollapsibleContent>
                              </Collapsible>
                            </SidebarMenuSubItem>
                          );
                        })
                      )}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/companies"}
                  tooltip="Companies"
                >
                  <Link href="/companies">
                    <Building2 />
                    <span>Companies</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/team"}
                  tooltip="Team"
                >
                  <Link href="/team">
                    <Users />
                    <span>Team</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="size-8">
                    <AvatarFallback>{userInitial}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{userEmail}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {profile.role}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 size-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings/billing">
                    <CreditCard className="mr-2 size-4" />
                    Billing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild variant="destructive">
                  <Link href="/logout">
                    <LogOut className="mr-2 size-4" />
                    Log out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
