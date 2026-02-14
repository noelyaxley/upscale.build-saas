import { SectionIntro } from "./section-intro";
import { AnimatedSection } from "./animated-section";
import { ArrowLeftRight } from "lucide-react";

const rows = [
  {
    feature: "Feasibility analysis",
    spreadsheets: "Manual formulas, error-prone",
    enterprise: "Not included",
    upscale: "Built-in, 5 minutes",
  },
  {
    feature: "Progress claims",
    spreadsheets: "Email attachments back and forth",
    enterprise: "Included but complex",
    upscale: "Submit, certify, track — one click",
  },
  {
    feature: "Cost visibility",
    spreadsheets: "Outdated the moment you save",
    enterprise: "Real-time but overwhelming",
    upscale: "Real-time, at a glance",
  },
  {
    feature: "Team collaboration",
    spreadsheets: "Email threads and version conflicts",
    enterprise: "Included",
    upscale: "Built-in + Client Portal",
  },
  {
    feature: "Setup time",
    spreadsheets: "Weeks of template building",
    enterprise: "Months of onboarding",
    upscale: "Minutes",
  },
  {
    feature: "Price",
    spreadsheets: "Free (but costs you in other ways)",
    enterprise: "$50k+/yr",
    upscale: "Free tier, then $149/mo",
  },
];

export function Comparison() {
  return (
    <section className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionIntro
          icon={ArrowLeftRight}
          badge="Compare"
          heading="You have options. Here's how they stack up."
          highlightWord="options"
        />

        <AnimatedSection>
          <div className="overflow-x-auto rounded-lg border border-black/[0.08] bg-card">
            {/* Header row */}
            <div className="grid min-w-[640px] grid-cols-4 border-b border-black/[0.08] bg-muted/30">
              <div className="p-4 text-sm font-medium" />
              <div className="border-l border-black/[0.08] p-4 text-center text-sm font-medium text-muted-foreground">
                Spreadsheets
              </div>
              <div className="border-l border-black/[0.08] p-4 text-center text-sm font-medium text-muted-foreground">
                Enterprise tools
              </div>
              <div className="border-l border-black/[0.08] p-4 text-center text-sm font-medium text-primary">
                UpScale
              </div>
            </div>

            {/* Data rows */}
            {rows.map((row, i) => (
              <div
                key={row.feature}
                className={`grid min-w-[640px] grid-cols-4${
                  i > 0 ? " border-t border-black/[0.08]" : ""
                }`}
              >
                <div className="p-4 text-sm font-medium">{row.feature}</div>
                <div className="border-l border-black/[0.08] p-4 text-center text-sm text-muted-foreground">
                  {row.spreadsheets}
                </div>
                <div className="border-l border-black/[0.08] p-4 text-center text-sm text-muted-foreground">
                  {row.enterprise}
                </div>
                <div className="border-l border-black/[0.08] bg-primary/[0.03] p-4 text-center text-sm font-medium">
                  {row.upscale}
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
