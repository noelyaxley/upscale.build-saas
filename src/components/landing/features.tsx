import {
  ClipboardList,
  FileText,
  DollarSign,
  Scale,
  BookOpen,
  CalendarRange,
  Sparkles,
} from "lucide-react";
import { SectionIntro } from "./section-intro";

const features = [
  {
    icon: DollarSign,
    title: "Progress Claims & Variations",
    description:
      "Submit and certify payment claims period by period. Track variations from draft through to approval with full cost and time impact visibility.",
  },
  {
    icon: Scale,
    title: "Feasibility & Lot Sales",
    description:
      "Model development scenarios with land costs, revenue, debt, and equity. Manage lot inventory from available through to settlement with agent commissions.",
  },
  {
    icon: BookOpen,
    title: "Site Diary",
    description:
      "Record daily site conditions — weather, labour by trade, equipment, visitors, and work summaries. One entry per project per day, ready for reporting.",
  },
  {
    icon: ClipboardList,
    title: "Tenders & Procurement",
    description:
      "Issue tender packages by trade, collect contractor submissions, evaluate bids, and award — all tracked from draft through to completion.",
  },
  {
    icon: FileText,
    title: "Submittals & RFIs",
    description:
      "Manage shop drawings, product data, and samples through a structured review workflow. Track RFIs from submission to close-out.",
  },
  {
    icon: CalendarRange,
    title: "Programme & EOT",
    description:
      "Plan project schedules with hierarchical tasks and dependencies. Log extension of time claims with days requested, approved, and date impacts.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionIntro
          icon={Sparkles}
          badge="Features"
          heading="Every workflow, one platform"
          highlightWord="one platform"
          subtitle="Purpose-built modules for construction — not a generic project tool with workarounds bolted on."
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
