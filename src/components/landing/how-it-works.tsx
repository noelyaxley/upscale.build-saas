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
    title: "Create Your Project",
    description:
      "Set up a new project in seconds. Define the stage, budget, and key dates — everything lives in one place from day one.",
  },
  {
    icon: UsersRound,
    title: "Add Your Team",
    description:
      "Invite team members, assign roles, and set permissions. Everyone sees exactly what they need — nothing more, nothing less.",
  },
  {
    icon: BarChart3,
    title: "Start Managing",
    description:
      "Track progress, manage budgets, control documents, and report to stakeholders. All your workflows in one platform.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionIntro
          icon={Layers}
          badge="How It Works"
          heading="Get started in 3 simple steps"
          highlightWord="3 simple"
          subtitle="Three steps to transform how your team delivers projects."
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
