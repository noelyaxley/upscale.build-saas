import {
  Shield,
  CreditCard,
  BarChart3,
  Users,
  Zap,
  Globe,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "Authentication",
    description:
      "Email/password, magic links, and OAuth providers. Fully integrated with Supabase Auth.",
  },
  {
    icon: CreditCard,
    title: "Payments",
    description:
      "Stripe integration with subscription management, invoices, and customer portal.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Real-time metrics, charts, and insights to track your product growth.",
  },
  {
    icon: Users,
    title: "Team Management",
    description:
      "Invite team members, manage roles and permissions with granular access control.",
  },
  {
    icon: Zap,
    title: "API Ready",
    description:
      "RESTful API endpoints with rate limiting, versioning, and auto-generated docs.",
  },
  {
    icon: Globe,
    title: "Multi-tenant",
    description:
      "Built-in multi-tenancy with isolated data, custom domains, and white-labeling.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-t bg-muted/30 py-20 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to launch
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Stop reinventing the wheel. Get a production-ready foundation with
            all the essentials built in.
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
