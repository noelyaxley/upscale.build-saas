import { SectionIntro } from "./section-intro";
import {
  Layers,
  FolderPlus,
  UsersRound,
  BarChart3,
} from "lucide-react";

const steps = [
  {
    icon: FolderPlus,
    title: "Set Up Your Project",
    description:
      "Create a project, set your budget, and define the key details. Everything is organised under your company so your team always knows where to look.",
  },
  {
    icon: UsersRound,
    title: "Invite Your Team",
    description:
      "Add your project managers, site team, and consultants. Share read-only views with investors or buyers via the Client Portal — no account required.",
  },
  {
    icon: BarChart3,
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
          {steps.map((step) => (
            <div key={step.title} className="flex flex-col gap-6 p-6">
              {/* Image area with radial vignette */}
              <div className="relative flex h-[260px] items-center justify-center overflow-hidden rounded-lg bg-muted/50">
                <div className="radial-fade flex size-full items-center justify-center">
                  <step.icon className="size-16 text-primary/40" />
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-medium">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
