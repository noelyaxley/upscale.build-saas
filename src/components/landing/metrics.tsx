import { SectionIntro } from "./section-intro";
import { TrendingUp } from "lucide-react";
import { AnimatedSection } from "./animated-section";
import { CounterMetric } from "./counter-metric";

const metrics = [
  {
    value: "5 min",
    numericPart: 5,
    suffix: " min",
    label: "Feasibility turnaround",
    description:
      "Model land, construction, revenue, debt, and equity for a potential development. Know if a deal stacks up before you commit — not after days of spreadsheet wrestling.",
  },
  {
    value: "6",
    numericPart: 6,
    suffix: "",
    label: "Modules, one platform",
    description:
      "Feasibility, claims, variations, tenders, site diaries, lot sales. Six things you used to manage across separate tools — now under one login.",
  },
  {
    value: "0",
    numericPart: 0,
    suffix: "",
    label: "Setup fees",
    description:
      "No onboarding consultants. No per-seat enterprise contracts. Start with the free tier and upgrade when you're ready. Cancel anytime.",
  },
];

export function Metrics() {
  return (
    <section className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionIntro
          icon={TrendingUp}
          badge="By The Numbers"
          heading="Your spreadsheet had a good run"
          highlightWord="good run"
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
