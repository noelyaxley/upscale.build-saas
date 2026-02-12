import {
  ClipboardList,
  FileText,
  DollarSign,
  Users,
  BookOpen,
  CalendarRange,
} from "lucide-react";
import { SectionIntro } from "./section-intro";
import { Sparkles } from "lucide-react";

const features = [
  {
    icon: ClipboardList,
    title: "Project Tracking",
    description:
      "Monitor project stages from preconstruction through to completion. Track status, milestones, and deliverables in real time.",
    span: "sm:col-span-2",
  },
  {
    icon: FileText,
    title: "Document Control",
    description:
      "Centralise drawings, specs, RFIs, and submittals. Version control and approvals built in.",
    span: "",
  },
  {
    icon: DollarSign,
    title: "Budget Management",
    description:
      "Track budgets, variations, and cost-to-complete across all your projects with real-time financial visibility.",
    span: "",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Assign roles, manage permissions, and keep your entire project team aligned with shared workflows.",
    span: "sm:col-span-2",
  },
  {
    icon: BookOpen,
    title: "Site Diary",
    description:
      "Record daily site activity — weather, labour, equipment, visitors, and work summaries. Photo capture and reporting included.",
    span: "",
  },
  {
    icon: CalendarRange,
    title: "Programme & Scheduling",
    description:
      "Plan and track project programmes with Gantt-style task management, dependencies, and progress tracking across your portfolio.",
    span: "sm:col-span-2",
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

        <div className="grid gap-4 sm:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`group rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md ${feature.span}`}
            >
              {/* Decorative illustration area */}
              <div className="mb-5 flex h-32 items-center justify-center rounded-lg bg-muted/50">
                <feature.icon className="size-10 text-primary/60 transition-colors group-hover:text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
