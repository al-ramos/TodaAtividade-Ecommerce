CREATE TABLE IF NOT EXISTS coupons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value numeric(10,2) NOT NULL CHECK (value > 0),
  min_order_value numeric(10,2) NOT NULL DEFAULT 0,
  max_uses integer,
  used_count integer NOT NULL DEFAULT 0,
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
-- Somente service_role acessa (admin via supabaseAdmin)
CREATE POLICY "service_role_all" ON coupons FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Colunas de desconto na tabela de pedidos
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_id uuid REFERENCES coupons(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2) NOT NULL DEFAULT 0;

-- Função para incrementar used_count atomicamente (chamada no webhook de pagamento)
CREATE OR REPLACE FUNCTION increment_coupon_used_count(coupon_id uuid)
RETURNS void AS $$
  UPDATE coupons SET used_count = used_count + 1 WHERE id = coupon_id;
$$ LANGUAGE SQL SECURITY DEFINER;
