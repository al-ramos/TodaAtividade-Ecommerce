-- ============================================================
-- TodaAtividade — Schema do banco de dados (Supabase/PostgreSQL)
-- Região recomendada: sa-east-1 (São Paulo)
-- ============================================================

-- Habilitar extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USUÁRIOS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT UNIQUE NOT NULL,
  name        TEXT,
  avatar_url  TEXT,
  provider    TEXT NOT NULL DEFAULT 'email', -- google | microsoft | facebook | email
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── CATEGORIAS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  icon        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PRODUTOS (ATIVIDADES) ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title                   TEXT NOT NULL,
  slug                    TEXT UNIQUE NOT NULL,
  description             TEXT NOT NULL,
  pedagogical_objectives  TEXT,
  price                   INTEGER NOT NULL,   -- em centavos (990 = R$9,90)
  thumbnail_url           TEXT NOT NULL,       -- imagem pública da 1ª página
  preview_url             TEXT NOT NULL,       -- 1ª página com watermark "PRÉVIA"
  full_pdf_path           TEXT NOT NULL,       -- caminho privado no R2
  grade_level             TEXT NOT NULL,       -- 1ano ... 9ano
  discipline              TEXT NOT NULL,       -- matematica, portugues, etc.
  page_count              INTEGER,
  tags                    TEXT[],
  active                  BOOLEAN NOT NULL DEFAULT true,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PEDIDOS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status          TEXT NOT NULL DEFAULT 'pending', -- pending | paid | failed | expired
  payment_method  TEXT,                             -- pix | credit_card
  payment_id      TEXT,                             -- ID do Mercado Pago
  total           INTEGER NOT NULL,                 -- em centavos
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at         TIMESTAMPTZ
);

-- ─── ITENS DO PEDIDO ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id          UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  price_at_purchase   INTEGER NOT NULL -- preço no momento da compra (em centavos)
);

-- ─── DOWNLOADS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS downloads (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  token           UUID NOT NULL DEFAULT uuid_generate_v4(), -- token único para o link
  expires_at      TIMESTAMPTZ NOT NULL,
  downloaded_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ÍNDICES ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_active       ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_grade        ON products(grade_level);
CREATE INDEX IF NOT EXISTS idx_products_discipline   ON products(discipline);
CREATE INDEX IF NOT EXISTS idx_products_slug         ON products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_user_id        ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status         ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id  ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_downloads_user_id     ON downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_token       ON downloads(token);

-- ─── ROW LEVEL SECURITY (RLS) ────────────────────────────────────────────────
ALTER TABLE users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE products     ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads    ENABLE ROW LEVEL SECURITY;

-- Produtos: leitura pública para ativos, escrita apenas para admin
CREATE POLICY "produtos_leitura_publica" ON products
  FOR SELECT USING (active = true);

-- Pedidos: usuário vê apenas os próprios
CREATE POLICY "pedidos_proprios" ON orders
  FOR ALL USING (auth.uid() = user_id);

-- Itens: usuário vê apenas itens dos seus pedidos
CREATE POLICY "itens_proprios" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

-- Downloads: usuário vê apenas os próprios
CREATE POLICY "downloads_proprios" ON downloads
  FOR SELECT USING (auth.uid() = user_id);

-- Users: usuário gerencia apenas o próprio perfil
CREATE POLICY "users_proprios" ON users
  FOR ALL USING (auth.uid() = id);

-- ─── TRIGGER updated_at ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
