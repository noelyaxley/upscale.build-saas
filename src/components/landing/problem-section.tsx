import { SectionIntro } from "./section-intro";
import { AnimatedSection } from "./animated-section";
import { AlertTriangle, FileSpreadsheet, Inbox, EyeOff } from "lucide-react";

const problems = [
  {
    icon: FileSpreadsheet,
    title: "Spreadsheet roulette",
    description:
      "Your feasibility is in one spreadsheet, claims in another, cash flow in a third. One wrong formula and your numbers are off by six figures. You might not find out until it's too late.",
  },
  {
    icon: Inbox,
    title: "Inbox archaeology",
    description:
      "The latest variation approval? Buried in an email chain from three weeks ago. The updated programme? Attached to a thread you archived. Your project lives across 50 inboxes.",
  },
  {
    icon: EyeOff,
    title: "Flying blind on costs",
    description:
      "A variation comes through and you have no idea how it hits the bottom line. You find out you're over budget at the next claim — not when you could have done something about it.",
  },
];

export function ProblemSection() {
  return (
    <section className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionIntro
          icon={AlertTriangle}
          badge="The Problem"
          heading="Sound familiar?"
          highlightWord="familiar"
          subtitle="You're managing a multi-million dollar development with tools designed for grocery lists."
        />

        <AnimatedSection>
          <div className="overflow-hidden rounded-lg border border-black/[0.08] bg-card">
            <div className="grid sm:grid-cols-3">
              {problems.map((problem, i) => (
                <div
                  key={problem.title}
                  className={`flex flex-col gap-4 p-8${
                    i > 0
                      ? " border-t sm:border-t-0 sm:border-l border-black/[0.08]"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <problem.icon className="size-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium">{problem.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {problem.description}
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
