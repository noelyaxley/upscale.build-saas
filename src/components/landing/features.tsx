import {
  ClipboardList,
  FileText,
  DollarSign,
  Users,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: ClipboardList,
    title: "Project Tracking",
    description:
      "Monitor project stages from preconstruction through to completion. Track status, milestones, and deliverables in real time.",
  },
  {
    icon: FileText,
    title: "Document Control",
    description:
      "Centralise drawings, specs, RFIs, and submittals. Version control and approvals built in.",
  },
  {
    icon: DollarSign,
    title: "Budget Management",
    description:
      "Track budgets, variations, and cost-to-complete across all your projects with real-time financial visibility.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Assign roles, manage permissions, and keep your entire project team aligned with shared workflows.",
  },
  {
    icon: AlertTriangle,
    title: "Defect Management",
    description:
      "Log, assign, and close out defects efficiently. Photo capture, status tracking, and reporting included.",
  },
  {
    icon: BarChart3,
    title: "Reporting",
    description:
      "Generate project reports, financial summaries, and progress dashboards for stakeholders and clients.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-t bg-muted/30 py-20 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to deliver projects
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Purpose-built tools for construction project management. No
            workarounds, no spreadsheets.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-0 shadow-none bg-transparent">
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="size-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
