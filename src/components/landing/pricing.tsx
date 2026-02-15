"use client";

import Link from "next/link";
import { SectionIntro } from "./section-intro";
import { AnimatedSection } from "./animated-section";
import { Button } from "@/components/ui/button";
import { Check, CreditCard } from "lucide-react";

const tiers = [
  {
    name: "Free",
    price: 0,
    description: "For individual developers exploring their first project.",
    features: [
      "3 projects",
      "Feasibility tool",
      "Basic cost tracking",
      "Site diary",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: 29,
    description: "Everything you need to manage property developments.",
    features: [
      "Unlimited projects",
      "All modules",
      "Progress claims & variations",
      "Tenders & procurement",
      "Client portal",
      "10GB storage",
    ],
    cta: "Start Free",
    popular: true,
    promo: "FREE FOR ALL OF 2026",
  },
  {
    name: "Ultimate",
    price: 49,
    description: "For established firms with complex project portfolios.",
    features: [
      "Everything in Pro",
      "1TB storage",
      "Priority support",
      "Custom onboarding",
    ],
    cta: "Subscribe",
    popular: false,
    comingSoon: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionIntro
          icon={CreditCard}
          badge="Pricing"
          heading="Start free. Upgrade when you're ready."
          highlightWord="free"
          subtitle="No credit card required. No lock-in contracts. Cancel anytime."
        />

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
                    Recommended
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">{tier.name}</h3>
                  {"comingSoon" in tier && tier.comingSoon && (
                    <span className="rounded-full border border-black/[0.08] bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Coming Soon
                    </span>
                  )}
                </div>

                <div className="mt-4 mb-2">
                  {"promo" in tier && tier.promo ? (
                    <>
                      <span className="relative text-4xl font-medium tracking-tight text-muted-foreground/50">
                        ${tier.price}
                        <span className="absolute inset-0 flex items-center">
                          <span className="h-[2px] w-full -rotate-12 bg-muted-foreground/50" />
                        </span>
                      </span>
                      <span className="ml-2 text-4xl font-medium tracking-tight">
                        Free
                      </span>
                    </>
                  ) : (
                    <span className="text-4xl font-medium tracking-tight">
                      ${tier.price}
                    </span>
                  )}
                  {tier.price > 0 && !("promo" in tier && tier.promo) && (
                    <span className="text-sm text-muted-foreground">/mo</span>
                  )}
                </div>

                {"promo" in tier && tier.promo && (
                  <p className="inline-flex w-fit rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {tier.promo}
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
