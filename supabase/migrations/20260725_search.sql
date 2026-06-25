-- Enable unaccent extension (already available in Supabase)
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Add search vector column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Update existing rows
UPDATE products SET search_vector =
  to_tsvector('portuguese', unaccent(coalesce(title, '')) || ' ' || unaccent(coalesce(description, '')));

-- Create GIN index
CREATE INDEX IF NOT EXISTS products_search_vector_idx ON products USING GIN(search_vector);

-- Trigger to keep search_vector updated
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('portuguese',
    unaccent(coalesce(NEW.title, '')) || ' ' || unaccent(coalesce(NEW.description, ''))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_search_vector_update
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();
