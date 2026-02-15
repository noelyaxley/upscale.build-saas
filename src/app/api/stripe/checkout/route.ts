import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const { priceLookupKey } = await request.json();

  if (!priceLookupKey || !["pro_monthly", "ultimate_monthly"].includes(priceLookupKey)) {
    return NextResponse.json({ error: "Invalid price lookup key" }, { status: 400 });
  }

  // Verify caller is authenticated admin
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id, role, full_name, phone")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get org
  const serviceClient = createServiceClient();
  const { data: orgData } = await serviceClient
    .from("organisations")
    .select("*")
    .eq("id", profile.org_id)
    .single();

  if (!orgData) {
    return NextResponse.json({ error: "Organisation not found" }, { status: 404 });
  }

  const org = orgData as any;

  // Resolve price via lookup key
  const prices = await getStripe().prices.list({ lookup_keys: [priceLookupKey], limit: 1 });
  if (prices.data.length === 0) {
    return NextResponse.json({ error: "Price not found" }, { status: 404 });
  }
  const price = prices.data[0];

  // Create or reuse Stripe customer
  let customerId = org.stripe_customer_id as string | null;
  if (!customerId) {
    const profileAny = profile as any;
    const customer = await getStripe().customers.create({
      email: user.email,
      name: profileAny.full_name || org.name,
      phone: profileAny.phone || undefined,
      metadata: { org_id: org.id },
    });
    customerId = customer.id;

    await serviceClient
      .from("organisations")
      .update({ stripe_customer_id: customerId } as any)
      .eq("id", org.id);
  }

  // For Pro tier: free until 2027 promo
  const isProPlan = priceLookupKey === "pro_monthly";
  const trialEnd = isProPlan
    ? Math.floor(new Date("2027-01-01T00:00:00Z").getTime() / 1000)
    : undefined;

  const origin = new URL(request.url).origin;
  const session = await getStripe().checkout.sessions.create({
    ui_mode: "embedded",
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: price.id, quantity: 1 }],
    subscription_data: trialEnd ? { trial_end: trialEnd } : undefined,
    return_url: `${origin}/settings/billing?session_id={CHECKOUT_SESSION_ID}`,
  });

  return NextResponse.json({ clientSecret: session.client_secret });
}
