CREATE TABLE IF NOT EXISTS abandoned_carts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]',  -- snapshot do carrinho: [{productId, title, price, quantity}]
  reminder_sent_at timestamptz,
  converted_at timestamptz,           -- preenchido quando o usuário finaliza compra
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON abandoned_carts FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Índice para buscar carrinhos não convertidos e não notificados
CREATE INDEX idx_abandoned_carts_pending ON abandoned_carts (reminder_sent_at, converted_at) WHERE converted_at IS NULL;
