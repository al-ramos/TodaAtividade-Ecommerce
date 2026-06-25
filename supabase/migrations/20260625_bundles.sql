CREATE TABLE IF NOT EXISTS bundles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  thumbnail_url text,
  price numeric(10,2) NOT NULL,           -- preço do bundle (já com desconto)
  original_price numeric(10,2) NOT NULL,  -- soma dos preços individuais
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bundle_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  bundle_id uuid NOT NULL REFERENCES bundles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(bundle_id, product_id)
);

ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_bundles" ON bundles FOR SELECT USING (active = true);
CREATE POLICY "service_role_all_bundles" ON bundles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "public_read_bundle_items" ON bundle_items FOR SELECT USING (true);
CREATE POLICY "service_role_all_bundle_items" ON bundle_items FOR ALL TO service_role USING (true) WITH CHECK (true);
