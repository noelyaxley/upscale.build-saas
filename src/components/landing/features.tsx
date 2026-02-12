import {
  ClipboardList,
  FileText,
  DollarSign,
  Users,
  BookOpen,
  CalendarRange,
  Sparkles,
} from "lucide-react";
import { SectionIntro } from "./section-intro";

const features = [
  {
    icon: ClipboardList,
    title: "Project Tracking",
    description:
      "Monitor project stages from preconstruction through to completion. Track status, milestones, and deliverables in real time.",
  },
  {
    icon: FileText,
    title: "Document Control",
    description:
      "Centralise drawings, specs, RFIs, and submittals. Version control and approvals built in.",
  },
  {
    icon: DollarSign,
    title: "Budget Management",
    description:
      "Track budgets, variations, and cost-to-complete across all your projects with real-time financial visibility.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Assign roles, manage permissions, and keep your entire project team aligned with shared workflows.",
  },
  {
    icon: BookOpen,
    title: "Site Diary",
    description:
      "Record daily site activity — weather, labour, equipment, visitors, and work summaries. Photo capture and reporting included.",
  },
  {
    icon: CalendarRange,
    title: "Programme & Scheduling",
    description:
      "Plan and track project programmes with Gantt-style task management, dependencies, and progress tracking across your portfolio.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionIntro
          icon={Sparkles}
          badge="Features"
          heading="Everything you need to deliver projects"
          highlightWord="deliver"
          subtitle="Purpose-built tools for construction project management. No workarounds, no spreadsheets."
        />

        {/* 2-column bento grid with shared borders */}
        <div className="overflow-hidden rounded-lg border border-black/[0.08] bg-card">
          <div className="grid sm:grid-cols-2">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`group flex flex-col gap-6 p-8${
                  i % 2 !== 0 ? " sm:border-l border-black/[0.08]" : ""
                }${i >= 2 ? " border-t border-black/[0.08]" : ""}`}
              >
                {/* Image placeholder area */}
                <div className="flex flex-1 items-center justify-center rounded-lg border border-border bg-muted/30">
                  <feature.icon className="size-12 text-primary/30 transition-colors group-hover:text-primary/60" />
                </div>
                <div>
                  <h3 className="mb-1.5 text-lg font-medium">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
