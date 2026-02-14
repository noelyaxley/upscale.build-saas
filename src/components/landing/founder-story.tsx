import { SectionIntro } from "./section-intro";
import { AnimatedSection } from "./animated-section";
import { Heart } from "lucide-react";

export function FounderStory() {
  return (
    <section className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionIntro
          icon={Heart}
          badge="Why We Built This"
          heading="We lived the problem"
          highlightWord="lived"
        />

        <AnimatedSection>
          <div className="mx-auto max-w-3xl">
            <div className="overflow-hidden rounded-lg border border-black/[0.08] bg-card p-8 sm:p-10">
              <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
                <p>
                  We&apos;ve spent years in property development — running feasibilities at
                  midnight, chasing claims through email chains, and reconciling
                  spreadsheets that never quite agreed.
                </p>
                <p>
                  We looked for a tool that covered the full development lifecycle.
                  The enterprise platforms cost more than our marketing budget and
                  took months to set up. The spreadsheet templates we&apos;d built over
                  the years were held together with duct tape and hope.
                </p>
                <p className="text-foreground font-medium">
                  So we built what we wished existed: one platform that handles
                  everything from feasibility to settlement, simple enough that
                  the team actually uses it, and priced for developers — not
                  enterprise IT departments.
                </p>
                <p>
                  UpScale is in early access. We&apos;re building alongside a small
                  group of developers who are shaping the product with us. If
                  you&apos;re tired of the spreadsheet juggle, we&apos;d love you
                  to give it a go.
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
