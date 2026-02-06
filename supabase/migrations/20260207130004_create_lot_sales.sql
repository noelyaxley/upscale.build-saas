-- Lot Sales & Sales Agents
-- Lot/unit inventory, sales agents, and sale transactions

-- Enum for lot status
CREATE TYPE lot_status AS ENUM (
  'available',
  'hold',
  'deposit_paid',
  'unconditional',
  'settled',
  'withdrawn'
);

-- Lots table
CREATE TABLE lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  lot_number TEXT NOT NULL,
  bedrooms INT DEFAULT 0,
  bathrooms INT DEFAULT 0,
  car_spaces INT DEFAULT 0,
  level INT,
  internal_area DECIMAL(12,2),
  external_area DECIMAL(12,2),
  total_area DECIMAL(12,2),
  aspect TEXT,
  list_price BIGINT DEFAULT 0,
  sold_price BIGINT,
  status lot_status NOT NULL DEFAULT 'available',
  notes TEXT,
  created_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sales agents table
CREATE TABLE sales_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  commission_rate DECIMAL(5,2) DEFAULT 0,
  notes TEXT,
  created_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sale transactions table
CREATE TABLE sale_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id UUID NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES sales_agents(id) ON DELETE SET NULL,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT,
  buyer_phone TEXT,
  sale_price BIGINT NOT NULL DEFAULT 0,
  deposit_amount BIGINT DEFAULT 0,
  commission_amount BIGINT DEFAULT 0,
  contract_date DATE,
  deposit_date DATE,
  unconditional_date DATE,
  settlement_date DATE,
  notes TEXT,
  created_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for lots (org-scoped)
CREATE POLICY "lots_select" ON lots FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "lots_insert" ON lots FOR INSERT
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "lots_update" ON lots FOR UPDATE
  USING (org_id = get_user_org_id());

CREATE POLICY "lots_delete" ON lots FOR DELETE
  USING (org_id = get_user_org_id());

-- RLS policies for sales_agents (org-scoped)
CREATE POLICY "sales_agents_select" ON sales_agents FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "sales_agents_insert" ON sales_agents FOR INSERT
  WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "sales_agents_update" ON sales_agents FOR UPDATE
  USING (org_id = get_user_org_id());

CREATE POLICY "sales_agents_delete" ON sales_agents FOR DELETE
  USING (org_id = get_user_org_id());

-- RLS policies for sale_transactions (via lot join)
CREATE POLICY "sale_transactions_select" ON sale_transactions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM lots l
    WHERE l.id = sale_transactions.lot_id
    AND l.org_id = get_user_org_id()
  ));

CREATE POLICY "sale_transactions_insert" ON sale_transactions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM lots l
    WHERE l.id = sale_transactions.lot_id
    AND l.org_id = get_user_org_id()
  ));

CREATE POLICY "sale_transactions_update" ON sale_transactions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM lots l
    WHERE l.id = sale_transactions.lot_id
    AND l.org_id = get_user_org_id()
  ));

CREATE POLICY "sale_transactions_delete" ON sale_transactions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM lots l
    WHERE l.id = sale_transactions.lot_id
    AND l.org_id = get_user_org_id()
  ));

-- Moddatetime triggers
CREATE TRIGGER set_lots_updated_at
  BEFORE UPDATE ON lots
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

CREATE TRIGGER set_sales_agents_updated_at
  BEFORE UPDATE ON sales_agents
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

CREATE TRIGGER set_sale_transactions_updated_at
  BEFORE UPDATE ON sale_transactions
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- Indexes
CREATE INDEX idx_lots_project ON lots(project_id);
CREATE INDEX idx_lots_status ON lots(status);
CREATE INDEX idx_sales_agents_project ON sales_agents(project_id);
CREATE INDEX idx_sale_transactions_lot ON sale_transactions(lot_id);
CREATE INDEX idx_sale_transactions_agent ON sale_transactions(agent_id);
