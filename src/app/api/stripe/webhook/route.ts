import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";
import type Stripe from "stripe";

function getTierFromLookupKey(lookupKey?: string | null): string {
  if (lookupKey === "pro_monthly") return "pro";
  if (lookupKey === "ultimate_monthly") return "ultimate";
  return "pro";
}

function resolveTier(subscription: Stripe.Subscription): string {
  const item = subscription.items.data[0];
  if (!item) return "free";
  return getTierFromLookupKey(item.price.lookup_key);
}

function getPeriodEnd(subscription: Stripe.Subscription): string | null {
  const item = subscription.items.data[0];
  if (!item) return null;
  return new Date(item.current_period_end * 1000).toISOString();
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const serviceClient = createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription" || !session.customer || !session.subscription) break;

      const customerId = typeof session.customer === "string" ? session.customer : session.customer.id;
      const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;

      const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
      const tier = resolveTier(subscription);
      const periodEnd = getPeriodEnd(subscription);

      await serviceClient
        .from("organisations")
        .update({
          stripe_subscription_id: subscriptionId,
          plan_tier: tier,
          subscription_status: subscription.status,
          current_period_end: periodEnd,
        } as any)
        .eq("stripe_customer_id" as any, customerId);

      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
      const tier = resolveTier(subscription);
      const periodEnd = getPeriodEnd(subscription);

      await serviceClient
        .from("organisations")
        .update({
          plan_tier: tier,
          subscription_status: subscription.status,
          current_period_end: periodEnd,
        } as any)
        .eq("stripe_customer_id" as any, customerId);

      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

      await serviceClient
        .from("organisations")
        .update({
          plan_tier: "free",
          subscription_status: "canceled",
          stripe_subscription_id: null,
          current_period_end: null,
        } as any)
        .eq("stripe_customer_id" as any, customerId);

      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
      if (!customerId) break;

      await serviceClient
        .from("organisations")
        .update({ subscription_status: "past_due" } as any)
        .eq("stripe_customer_id" as any, customerId);

      break;
    }
  }

  return NextResponse.json({ received: true });
}
