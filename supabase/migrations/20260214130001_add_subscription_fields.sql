-- Add Stripe subscription fields to organisations
ALTER TABLE organisations
  ADD COLUMN stripe_customer_id TEXT UNIQUE,
  ADD COLUMN stripe_subscription_id TEXT UNIQUE,
  ADD COLUMN subscription_status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN plan_tier TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN current_period_end TIMESTAMPTZ;

CREATE INDEX idx_organisations_stripe_customer_id ON organisations(stripe_customer_id);
CREATE INDEX idx_organisations_stripe_subscription_id ON organisations(stripe_subscription_id);
