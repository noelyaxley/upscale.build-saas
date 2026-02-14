import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function setup() {
  // Create Pro product and price
  const proProduct = await stripe.products.create({
    name: "Upscale.Build Pro",
    description: "Everything you need to manage property developments.",
  });

  await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 2900,
    currency: "aud",
    recurring: { interval: "month" },
    lookup_key: "pro_monthly",
  });

  console.log(`Created Pro product: ${proProduct.id}`);

  // Create Ultimate product and price
  const ultimateProduct = await stripe.products.create({
    name: "Upscale.Build Ultimate",
    description:
      "For established firms with complex project portfolios.",
  });

  await stripe.prices.create({
    product: ultimateProduct.id,
    unit_amount: 4900,
    currency: "aud",
    recurring: { interval: "month" },
    lookup_key: "ultimate_monthly",
  });

  console.log(`Created Ultimate product: ${ultimateProduct.id}`);
  console.log("Done! Products and prices created in Stripe.");
}

setup().catch(console.error);
