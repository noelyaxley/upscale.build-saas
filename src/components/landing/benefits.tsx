import { SectionIntro } from "./section-intro";
import { AnimatedSection } from "./animated-section";
import {
  Award,
  Zap,
  Share2,
  ShieldCheck,
  Monitor,
  Users,
  HardHat,
} from "lucide-react";

const benefits = [
  {
    icon: HardHat,
    title: "Purpose-built for property dev",
    description:
      "Not a generic project tool with workarounds. Every feature is designed around how property developers actually work.",
  },
  {
    icon: Zap,
    title: "Up and running in minutes",
    description:
      "Create your organisation, invite your team, and start managing projects — no complex setup or onboarding required.",
  },
  {
    icon: Share2,
    title: "Share with stakeholders",
    description:
      "Give investors, buyers, and consultants read-only access through the Client Portal — no account needed.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise-grade security",
    description:
      "Encrypted data, role-based access, and full organisation isolation. You stay in control of who sees what.",
  },
  {
    icon: Monitor,
    title: "Works on any device",
    description:
      "Responsive design that works on desktop, tablet, and mobile so your team can access projects from anywhere.",
  },
  {
    icon: Users,
    title: "Built for teams",
    description:
      "Add project managers, site teams, and consultants. Everyone works from one shared source of truth.",
  },
];

export function Benefits() {
  return (
    <section className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionIntro
          icon={Award}
          badge="Why UpScale"
          heading="Built different"
          highlightWord="different"
        />

        <AnimatedSection>
          <div className="overflow-hidden rounded-lg border border-black/[0.08] bg-card">
            <div className="grid sm:grid-cols-2">
              {benefits.map((benefit, i) => (
                <div
                  key={benefit.title}
                  className={`flex gap-4 p-8${
                    i % 2 !== 0 ? " sm:border-l border-black/[0.08]" : ""
                  }${i >= 2 ? " border-t border-black/[0.08]" : ""}`}
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <benefit.icon className="size-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-base font-medium">
                      {benefit.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
