"use client";

import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { useOrganisation } from "@/lib/context/organisation";
import type { PlanTier } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, ExternalLink } from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const plans: {
  tier: PlanTier;
  name: string;
  price: number;
  description: string;
  features: string[];
  lookupKey?: string;
  promo?: string;
}[] = [
  {
    tier: "free",
    name: "Free",
    price: 0,
    description: "For individual developers exploring their first project.",
    features: [
      "3 projects",
      "Feasibility tool",
      "Basic cost tracking",
      "Site diary",
    ],
  },
  {
    tier: "pro",
    name: "Pro",
    price: 29,
    description: "Everything you need to manage property developments.",
    lookupKey: "pro_monthly",
    promo: "FREE UNTIL 2027",
    features: [
      "Unlimited projects",
      "All modules",
      "Progress claims & variations",
      "Tenders & procurement",
      "Client portal",
      "10GB storage",
    ],
  },
  {
    tier: "ultimate",
    name: "Ultimate",
    price: 49,
    description: "For established firms with complex project portfolios.",
    lookupKey: "ultimate_monthly",
    features: [
      "Everything in Pro",
      "1TB storage",
      "Priority support",
      "Custom onboarding",
    ],
  },
];

export function BillingView() {
  const { organisation, planTier, isAdmin } = useOrganisation();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [checkoutKey, setCheckoutKey] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const subscriptionStatus = (organisation as any).subscription_status || "active";
  const currentPeriodEnd = (organisation as any).current_period_end;
  const hasStripeSubscription = !!(organisation as any).stripe_subscription_id;

  const fetchClientSecret = useCallback(
    async (lookupKey: string) => {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceLookupKey: lookupKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data.clientSecret;
    },
    []
  );

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.url;
    } catch (err) {
      console.error("Failed to open portal:", err);
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Manage your subscription and billing details.
        </p>
      </div>

      {sessionId && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
          Your subscription has been set up successfully.
        </div>
      )}

      {subscriptionStatus === "past_due" && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Your payment is past due. Please update your payment method to avoid service interruption.
        </div>
      )}

      {/* Current plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            Your organisation is on the{" "}
            <span className="font-medium text-foreground capitalize">{planTier}</span>{" "}
            plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge variant={planTier === "free" ? "secondary" : "default"}>
              {planTier.toUpperCase()}
            </Badge>
            {hasStripeSubscription && (
              <span className="text-sm text-muted-foreground">
                Status: {subscriptionStatus}
                {currentPeriodEnd && (
                  <> &middot; Renews {new Date(currentPeriodEnd).toLocaleDateString()}</>
                )}
              </span>
            )}
          </div>
        </CardContent>
        {hasStripeSubscription && isAdmin && (
          <CardFooter>
            <Button
              variant="outline"
              onClick={handleManageSubscription}
              disabled={portalLoading}
            >
              <ExternalLink className="mr-2 size-4" />
              {portalLoading ? "Loading..." : "Manage Subscription"}
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Plan cards */}
      {!checkoutKey && (
        <div className="grid gap-6 sm:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = plan.tier === planTier;
            return (
              <Card
                key={plan.tier}
                className={
                  plan.tier === "pro"
                    ? "border-primary relative"
                    : ""
                }
              >
                {plan.promo && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    {plan.promo}
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-3xl font-medium tracking-tight">
                      ${plan.price}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-sm text-muted-foreground">/mo</span>
                    )}
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {isCurrent ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : plan.lookupKey && isAdmin ? (
                    <Button
                      className="w-full"
                      variant={plan.tier === "pro" ? "default" : "outline"}
                      onClick={() => setCheckoutKey(plan.lookupKey!)}
                    >
                      {plan.tier === "pro" ? "Start Free" : "Subscribe"}
                    </Button>
                  ) : !isAdmin && plan.lookupKey ? (
                    <Button variant="outline" className="w-full" disabled>
                      Admin required
                    </Button>
                  ) : null}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Embedded checkout */}
      {checkoutKey && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-5" />
              Complete your subscription
            </CardTitle>
            <CardDescription>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCheckoutKey(null)}
              >
                &larr; Back to plans
              </Button>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{
                fetchClientSecret: () => fetchClientSecret(checkoutKey),
              }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
