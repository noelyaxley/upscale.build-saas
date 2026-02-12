import { SectionIntro } from "./section-intro";
import { TrendingUp } from "lucide-react";

const metrics = [
  {
    value: "40%",
    label: "Faster Delivery",
    description:
      "Teams using Upscale.Build report significantly faster project turnaround compared to spreadsheet-based workflows.",
  },
  {
    value: "3x",
    label: "Budget Visibility",
    description:
      "Real-time cost tracking gives project managers three times more financial clarity across the portfolio.",
  },
  {
    value: "85%",
    label: "Team Adoption",
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
          heading="Results that speak for themselves"
          highlightWord="Results"
        />

        <div className="grid gap-8 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl border border-border bg-card p-8 text-center"
            >
              <div className="mb-2 text-5xl font-bold text-primary">
                {metric.value}
              </div>
              <div className="mb-3 text-lg font-semibold">{metric.label}</div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {metric.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
