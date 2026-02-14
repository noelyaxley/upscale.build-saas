import { SectionIntro } from "./section-intro";
import { AnimatedSection } from "./animated-section";
import { Users, HardHat, Briefcase } from "lucide-react";

const personas = [
  {
    icon: HardHat,
    name: "For the hands-on developer",
    subtitle: "Running 1-2 projects, $500k-$5M",
    points: [
      "Run a feasibility in 5 minutes when a site comes up",
      "Track every dollar across your build without a spreadsheet",
      "Share project updates with your money partner instantly",
      "Log site activity daily so you're covered if disputes hit",
    ],
  },
  {
    icon: Briefcase,
    name: "For the development company",
    subtitle: "Managing 2-10 projects, $5M-$50M",
    points: [
      "See every active project from one dashboard",
      "Your PM, site team, and consultants all work from one source",
      "Process claims and variations without chasing spreadsheets",
      "Give investors real-time visibility through the Client Portal",
    ],
  },
];

export function Personas() {
  return (
    <section className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionIntro
          icon={Users}
          badge="Built For You"
          heading="Whether it's your first dual-occ or your tenth tower"
          highlightWord="first"
        />

        <AnimatedSection>
          <div className="grid gap-6 sm:grid-cols-2">
            {personas.map((persona) => (
              <div
                key={persona.name}
                className="card-hover-lift flex flex-col rounded-lg border border-black/[0.08] bg-card p-8"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <persona.icon className="size-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{persona.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {persona.subtitle}
                    </p>
                  </div>
                </div>

                <div className="my-4 h-px bg-black/[0.08]" />

                <ul className="flex flex-col gap-3">
                  {persona.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
