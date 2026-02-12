import { SectionIntro } from "./section-intro";
import { TrendingUp } from "lucide-react";
import { AnimatedSection } from "./animated-section";
import { CounterMetric } from "./counter-metric";

const metrics = [
  {
    value: "5 min",
    numericPart: 5,
    suffix: " min",
    label: "Fast feasibility",
    description:
      "Run the numbers on a potential development in under five minutes. Know whether a deal stacks up before you commit — so you can move quickly as opportunities arise.",
  },
  {
    value: "1",
    numericPart: 1,
    suffix: "",
    label: "Single source of truth",
    description:
      "Every project, budget, claim, and document in one place. No more chasing spreadsheets across email threads or miscommunication between your team.",
  },
  {
    value: "24/7",
    numericPart: 24,
    suffix: "/7",
    label: "Complete visibility",
    description:
      "See the status of every active project from one dashboard. Track costs, manage cash flow, and preempt upcoming expenses — so nothing catches you off guard.",
  },
];

export function Metrics() {
  return (
    <section className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionIntro
          icon={TrendingUp}
          badge="By The Numbers"
          heading="Built to replace the spreadsheet"
          highlightWord="replace"
        />

        <AnimatedSection>
          {/* Shared-border metric cards */}
          <div className="overflow-hidden rounded-lg border border-black/[0.08] bg-card">
            <div className="grid sm:grid-cols-3">
              {metrics.map((metric, i) => (
                <div
                  key={metric.label}
                  className={`flex flex-col gap-0 p-8${
                    i > 0
                      ? " border-t sm:border-t-0 sm:border-l border-black/[0.08]"
                      : ""
                  }`}
                >
                  <h3 className="mb-4 text-lg font-medium">{metric.label}</h3>
                  <div className="mb-4 h-px bg-black/[0.08]" />
                  <CounterMetric
                    value={metric.value}
                    numericPart={metric.numericPart}
                    suffix={metric.suffix}
                  />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {metric.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
