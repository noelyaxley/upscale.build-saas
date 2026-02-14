import Image from "next/image";
import { SectionIntro } from "./section-intro";
import { AnimatedSection } from "./animated-section";
import { Layers } from "lucide-react";

const steps = [
  {
    image: "/images/landing/signup-step.png",
    title: "Create your project",
    description:
      "Set up a project in under 2 minutes. Define your budget, add the key details, and you're ready to go. No onboarding calls. No setup fees.",
  },
  {
    image: "/images/landing/integrate-step.png",
    title: "Add your team",
    description:
      "Invite your PM, site team, and consultants. Give investors or buyers read-only access through the Client Portal — they don't need an account.",
  },
  {
    image: "/images/landing/optimise-step.png",
    title: "Run your development",
    description:
      "Process claims, issue tenders, log site diaries, and track costs — from one dashboard. Everyone works from the same source of truth.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionIntro
          icon={Layers}
          badge="How It Works"
          heading="Set up in minutes, not months"
          highlightWord="minutes"
          subtitle="No consultants, no training manuals, no six-month rollout. If you can use a spreadsheet, you can use UpScale."
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
