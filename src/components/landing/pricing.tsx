"use client";

import { useState } from "react";
import Link from "next/link";
import { SectionIntro } from "./section-intro";
import { AnimatedSection } from "./animated-section";
import { Button } from "@/components/ui/button";
import { Check, CreditCard } from "lucide-react";

const tiers = [
  {
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "For individual developers exploring their first project.",
    features: [
      "1 active project",
      "Feasibility tool",
      "Basic cost tracking",
      "Site diary",
      "1 team member",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Professional",
    monthlyPrice: 149,
    annualPrice: 1490,
    description: "For growing teams managing multiple developments.",
    features: [
      "Unlimited projects",
      "Feasibility & lot sales",
      "Progress claims & variations",
      "Tenders & procurement",
      "Client portal",
      "Up to 10 team members",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Unlimited",
    monthlyPrice: 249,
    annualPrice: 2490,
    description: "For established firms with complex project portfolios.",
    features: [
      "Everything in Professional",
      "Unlimited team members",
      "Programme & EOT tracking",
      "Submittals & RFIs",
      "Priority support",
      "Custom onboarding",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionIntro
          icon={CreditCard}
          badge="Pricing"
          heading="Simple, transparent pricing"
          highlightWord="transparent"
        />

        {/* Monthly/Annual toggle */}
        <div className="mb-12 flex items-center justify-center gap-3">
          <span
            className={`text-sm font-medium ${!annual ? "text-foreground" : "text-muted-foreground"}`}
          >
            Monthly
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative h-6 w-11 rounded-full transition-colors ${annual ? "bg-primary" : "bg-muted"}`}
            aria-label="Toggle annual billing"
          >
            <span
              className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${annual ? "translate-x-5" : "translate-x-0"}`}
            />
          </button>
          <span
            className={`text-sm font-medium ${annual ? "text-foreground" : "text-muted-foreground"}`}
          >
            Annual
          </span>
          {annual && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Save ~17%
            </span>
          )}
        </div>

        <AnimatedSection>
          <div className="grid gap-6 sm:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`card-hover-lift flex flex-col rounded-lg border bg-card p-8 ${
                  tier.popular
                    ? "border-primary shadow-lg relative"
                    : "border-black/[0.08]"
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-white">
                    Popular
                  </span>
                )}

                <h3 className="text-lg font-medium">{tier.name}</h3>

                <div className="mt-4 mb-2">
                  <span className="text-4xl font-medium tracking-tight">
                    ${annual ? Math.round(tier.annualPrice / 12) : tier.monthlyPrice}
                  </span>
                  {tier.monthlyPrice > 0 && (
                    <span className="text-sm text-muted-foreground">/mo</span>
                  )}
                </div>

                {annual && tier.annualPrice > 0 && (
                  <p className="text-xs text-muted-foreground">
                    ${tier.annualPrice.toLocaleString()}/yr billed annually
                  </p>
                )}

                <p className="mt-3 text-sm text-muted-foreground">
                  {tier.description}
                </p>

                <div className="my-6 h-px bg-black/[0.08]" />

                <ul className="mb-8 flex flex-1 flex-col gap-3">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  variant={tier.popular ? "default" : "outline"}
                  className="w-full rounded-full"
                >
                  <Link href="/signup">{tier.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
