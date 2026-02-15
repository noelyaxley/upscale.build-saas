import {
  Building2,
  LayoutDashboard,
  DollarSign,
  Users,
  FolderKanban,
  BookOpen,
  ClipboardList,
  Sun,
  Calendar,
  Clock,
  HardHat,
} from "lucide-react";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: FolderKanban, label: "Projects", active: false },
  { icon: DollarSign, label: "Claims", active: false },
  { icon: BookOpen, label: "Site Diary", active: false },
  { icon: ClipboardList, label: "Tenders", active: false },
  { icon: Users, label: "Team", active: false },
];

const claims = [
  {
    number: "PC-003",
    contractor: "Atlas Builders",
    amount: "$182,400",
    status: "Certified",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    number: "PC-004",
    contractor: "Ironbark Projects",
    amount: "$94,200",
    status: "Submitted",
    color: "bg-amber-100 text-amber-700",
  },
  {
    number: "V-007",
    contractor: "Civic Electrical",
    amount: "$12,800",
    status: "Draft",
    color: "bg-zinc-100 text-zinc-600",
  },
];

const scheduleItems = [
  {
    time: "9:00 AM",
    title: "Site Inspection",
    badge: "On-Site",
    color: "bg-sky-100 text-sky-700",
  },
  {
    time: "2:00 PM",
    title: "Claim PC-004 Due",
    badge: "Claims",
    color: "bg-orange-100 text-orange-700",
  },
  {
    time: "4:30 PM",
    title: "Council DA Meeting",
    badge: "Approvals",
    color: "bg-purple-100 text-purple-700",
  },
];

function DonutRing() {
  const radius = 40;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const filled = circumference * 0.68;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted/40"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={`${filled} ${circumference - filled}`}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
          className="text-primary"
        />
        <text
          x="50"
          y="46"
          textAnchor="middle"
          className="fill-foreground text-base font-bold"
          style={{ fontSize: "14px", fontWeight: 700 }}
        >
          $8.7M
        </text>
        <text
          x="50"
          y="59"
          textAnchor="middle"
          className="fill-muted-foreground"
          style={{ fontSize: "9px" }}
        >
          of $12.8M
        </text>
      </svg>
      <div className="w-full space-y-1">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground">Committed</span>
          <span className="font-semibold">$6.2M</span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground">Remaining</span>
          <span className="font-semibold">$4.1M</span>
        </div>
      </div>
    </div>
  );
}

export function DashboardPreview() {
  return (
    <div className="mx-auto max-w-[1000px]">
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex">
          {/* Sidebar */}
          <div className="hidden w-44 shrink-0 border-r border-border bg-muted/30 p-3 md:block">
            <div className="mb-5 flex items-center gap-2 px-2 text-sm font-bold">
              <Building2 className="size-4 text-primary" />
              UpScale.build
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

          {/* Main content — panel grid */}
          <div className="flex-1 p-3">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr] lg:grid-rows-[auto_auto]">
              {/* Panel 1 — Budget Overview */}
              <div className="rounded-md border border-border bg-background p-3">
                <div className="mb-2 flex items-center gap-1.5">
                  <DollarSign className="size-3 text-primary" />
                  <span className="text-xs font-semibold">Budget Overview</span>
                </div>
                <DonutRing />
              </div>

              {/* Panel 2 — Active Project */}
              <div className="rounded-md border border-border bg-background p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold">Active Project</span>
                  <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                    In Progress
                  </span>
                </div>
                <p className="mb-2 text-sm font-bold">Bayside Townhouses</p>
                <div className="mb-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">PM</span>
                    <span className="font-medium">Laura P.</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Stage</span>
                    <span className="font-medium">Construction</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Timeline</span>
                    <span className="font-medium">Mar 2024 – Nov 2025</span>
                  </div>
                </div>
                {/* Team avatars */}
                <div className="mb-3 flex items-center gap-1">
                  <div className="flex size-5 items-center justify-center rounded-full bg-primary/20 text-[8px] font-semibold text-primary">
                    LP
                  </div>
                  <div className="flex size-5 items-center justify-center rounded-full bg-sky-100 text-[8px] font-semibold text-sky-700">
                    MR
                  </div>
                  <div className="flex size-5 items-center justify-center rounded-full bg-emerald-100 text-[8px] font-semibold text-emerald-700">
                    JK
                  </div>
                  <div className="flex size-5 items-center justify-center rounded-full bg-violet-100 text-[8px] font-semibold text-violet-700">
                    TD
                  </div>
                  <div className="flex size-5 items-center justify-center rounded-full bg-zinc-100 text-[8px] font-semibold text-zinc-600">
                    +3
                  </div>
                </div>
                {/* Progress bar */}
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: "68%" }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    68%
                  </span>
                </div>
              </div>

              {/* Panel 3 — Schedule (spans 2 rows) */}
              <div className="rounded-md border border-border bg-background p-3 sm:col-span-2 lg:col-span-1 lg:row-span-2">
                <div className="mb-2 flex items-center gap-1.5">
                  <Calendar className="size-3 text-primary" />
                  <span className="text-xs font-semibold">Schedule</span>
                </div>
                <p className="mb-2 text-[10px] font-medium text-muted-foreground">
                  February 2025
                </p>
                {/* Mini weekday row */}
                <div className="mb-3 flex gap-1.5">
                  {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, i) => (
                    <div key={day} className="flex flex-col items-center gap-0.5">
                      <span className="text-[8px] text-muted-foreground">
                        {day}
                      </span>
                      <span
                        className={`flex size-5 items-center justify-center rounded-full text-[9px] font-medium ${
                          i === 2
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {10 + i}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Upcoming items */}
                <p className="mb-1.5 text-[10px] font-medium text-muted-foreground">
                  Upcoming
                </p>
                <div className="space-y-2">
                  {scheduleItems.map((item) => (
                    <div
                      key={item.title}
                      className="flex items-start gap-2 rounded-md border border-border/60 p-2"
                    >
                      <Clock className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-medium">
                            {item.title}
                          </span>
                          <span
                            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-medium ${item.color}`}
                          >
                            {item.badge}
                          </span>
                        </div>
                        <span className="text-[9px] text-muted-foreground">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Panel 4 — Recent Claims */}
              <div className="rounded-md border border-border bg-background p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ClipboardList className="size-3 text-primary" />
                    <span className="text-xs font-semibold">Recent Claims</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    See All
                  </span>
                </div>
                <div className="space-y-1.5">
                  {claims.map((claim) => (
                    <div
                      key={claim.number}
                      className="flex items-center justify-between gap-2 rounded border border-border/60 px-2 py-1.5"
                    >
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium">
                          {claim.number}{" "}
                          <span className="text-muted-foreground">
                            · {claim.contractor}
                          </span>
                        </p>
                        <p className="text-xs font-semibold">{claim.amount}</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${claim.color}`}
                      >
                        {claim.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Panel 5 — Site Diary */}
              <div className="rounded-md border border-border bg-background p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="size-3 text-primary" />
                    <span className="text-xs font-semibold">
                      Today&apos;s Entry
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    Wed 12 Feb
                  </span>
                </div>
                {/* Weather */}
                <div className="mb-2 flex items-center gap-1.5">
                  <Sun className="size-3.5 text-amber-500" />
                  <span className="text-[10px] font-medium">Sunny, 24°C</span>
                </div>
                {/* Work summary */}
                <p className="mb-2 text-[10px] leading-relaxed text-muted-foreground">
                  Formwork completed for Level 2 slab. Concrete pour scheduled
                  for Thursday AM. No delays reported.
                </p>
                {/* Stats */}
                <div className="flex gap-3">
                  <div className="flex items-center gap-1 text-[10px]">
                    <HardHat className="size-3 text-muted-foreground" />
                    <span className="font-medium">12 Workers</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px]">
                    <Building2 className="size-3 text-muted-foreground" />
                    <span className="font-medium">3 Equipment</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
