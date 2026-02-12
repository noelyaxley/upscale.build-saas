import { SectionIntro } from "./section-intro";
import {
  Layers,
  FolderPlus,
  UsersRound,
  BarChart3,
} from "lucide-react";

const steps = [
  {
    number: 1,
    icon: FolderPlus,
    title: "Create Your Project",
    description:
      "Set up a new project in seconds. Define the stage, budget, and key dates — everything lives in one place from day one.",
  },
  {
    number: 2,
    icon: UsersRound,
    title: "Add Your Team",
    description:
      "Invite team members, assign roles, and set permissions. Everyone sees exactly what they need — nothing more, nothing less.",
  },
  {
    number: 3,
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
          heading="Get started in minutes"
          highlightWord="minutes"
          subtitle="Three simple steps to transform how your team delivers projects."
        />

        <div className="grid gap-8 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {step.number}
              </div>
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-muted">
                <step.icon className="size-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
