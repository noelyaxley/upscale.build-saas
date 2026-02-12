import { SectionIntro } from "./section-intro";
import { TrendingUp } from "lucide-react";

const metrics = [
  {
    value: "60%",
    label: "Fewer claim disputes",
    description:
      "Structured progress claim workflows with line-item breakdowns and certified amounts reduce back-and-forth between contractors and principals.",
  },
  {
    value: "3x",
    label: "Faster feasibility",
    description:
      "Model land costs, sales revenue, debt, and equity across multiple scenarios in minutes — not days of spreadsheet wrangling.",
  },
  {
    value: "100%",
    label: "Portfolio visibility",
    description:
      "Every project, budget, variation, and claim in one dashboard. No more chasing spreadsheets across email threads.",
  },
];

export function Metrics() {
  return (
    <section className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionIntro
          icon={TrendingUp}
          badge="By The Numbers"
          heading="Built to eliminate the spreadsheet"
          highlightWord="eliminate"
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
