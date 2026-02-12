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
      "Create a project, set the stage and budget, and invite your team. Organisation-level multi-tenancy keeps everything scoped and secure.",
  },
  {
    icon: UsersRound,
    title: "Assign Roles & Permissions",
    description:
      "Add PMs, site managers, and consultants with role-based access. Share read-only views with clients via the Client Portal — no account required.",
  },
  {
    icon: BarChart3,
    title: "Run Your Workflows",
    description:
      "Process claims, issue tenders, log site diaries, track variations, and manage lot sales — all from a single dashboard per project.",
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
          subtitle="Create your first project and start managing claims, budgets, and teams today."
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
