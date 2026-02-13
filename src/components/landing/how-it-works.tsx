import Image from "next/image";
import { SectionIntro } from "./section-intro";
import { AnimatedSection } from "./animated-section";
import { Layers } from "lucide-react";

const steps = [
  {
    image: "/images/landing/signup-step.png",
    title: "Set Up Your Project",
    description:
      "Create a project, set your budget, and define the key details. Everything is organised under your company so your team always knows where to look.",
  },
  {
    image: "/images/landing/integrate-step.png",
    title: "Invite Your Team",
    description:
      "Add your project managers, site team, and consultants. Share read-only views with investors or buyers via the Client Portal — no account required.",
  },
  {
    image: "/images/landing/optimise-step.png",
    title: "Manage With Confidence",
    description:
      "Process claims, issue tenders, log site diaries, and track costs — all from one dashboard. One source of truth for your entire project team.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionIntro
          icon={Layers}
          badge="How It Works"
          heading="Up and running in minutes"
          highlightWord="minutes"
          subtitle="From sign-up to managing your first project — it only takes a few minutes to get started."
        />

        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((step, i) => (
            <AnimatedSection key={step.title} delay={i * 0.15}>
              <div className="flex flex-col gap-6 p-6">
                <div className="relative flex h-[260px] items-center justify-center overflow-hidden rounded-lg bg-muted/50">
                  <Image
                    src={step.image}
                    alt={step.title}
                    width={300}
                    height={260}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-medium">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
