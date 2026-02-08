-- Add product type support to feasibility_sales_units
-- Allows commercial/industrial units with different column schemas

ALTER TABLE feasibility_sales_units
  ADD COLUMN product_type TEXT NOT NULL DEFAULT 'residential',
  ADD COLUMN sale_type TEXT NOT NULL DEFAULT 'vacant_possession',
  ADD COLUMN cap_rate DECIMAL(5,2);

-- Add constraint for valid product types
ALTER TABLE feasibility_sales_units
  ADD CONSTRAINT chk_sales_unit_product_type
    CHECK (product_type IN ('residential', 'commercial', 'industrial'));

-- Add constraint for valid sale types
ALTER TABLE feasibility_sales_units
  ADD CONSTRAINT chk_sales_unit_sale_type
    CHECK (sale_type IN ('vacant_possession', 'sale_with_lease'));
