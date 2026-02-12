import { SectionIntro } from "./section-intro";
import { TrendingUp } from "lucide-react";

const metrics = [
  {
    value: "40%",
    label: "Reduce delivery time",
    description:
      "Teams using Upscale.Build report significantly faster project turnaround compared to spreadsheet-based workflows.",
  },
  {
    value: "3x",
    label: "Boost budget visibility",
    description:
      "Real-time cost tracking gives project managers three times more financial clarity across the portfolio.",
  },
  {
    value: "85%",
    label: "Speed up onboarding",
    description:
      "Intuitive design means the majority of team members are actively using the platform within the first week.",
  },
];

export function Metrics() {
  return (
    <section className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionIntro
          icon={TrendingUp}
          badge="By The Numbers"
          heading="Track what matters for real growth"
          highlightWord="real growth"
        />

        {/* Shared-border metric cards */}
        <div className="overflow-hidden rounded-lg border border-black/[0.08] bg-card">
          <div className="grid sm:grid-cols-3">
            {metrics.map((metric, i) => (
              <div
                key={metric.label}
                className={`flex flex-col gap-0 p-8${
                  i > 0 ? " border-t sm:border-t-0 sm:border-l border-black/[0.08]" : ""
                }`}
              >
                <h3 className="mb-4 text-lg font-medium">{metric.label}</h3>
                <div className="mb-4 h-px bg-black/[0.08]" />
                <div className="mb-3 text-[42px] font-medium leading-[1.1] tracking-[-0.02em] text-primary">
                  {metric.value}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {metric.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
