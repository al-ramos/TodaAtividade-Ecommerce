-- ============================================================
-- Migration 001 — Tabela users (perfis de usuário)
-- Compatível com NextAuth (JWT strategy) + Supabase Auth
-- Aplicar no Supabase Dashboard → SQL Editor
-- ============================================================

-- Extensão UUID (já habilitada no schema.sql, mas garante)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USUÁRIOS ────────────────────────────────────────────────────────────────
-- Tabela usada pelo NextAuth para upsert no callback signIn.
-- O campo 'id' pode ser o UUID do Supabase Auth (quando auth social)
-- ou um UUID gerado pelo NextAuth (quando credentials).
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT UNIQUE NOT NULL,
  name        TEXT,
  avatar_url  TEXT,
  provider    TEXT NOT NULL DEFAULT 'email',
  role        TEXT NOT NULL DEFAULT 'cliente'
                CHECK (role IN ('cliente', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Leitura: usuário vê apenas o próprio perfil
CREATE POLICY "users_select_proprio" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Atualização: usuário altera apenas o próprio perfil
CREATE POLICY "users_update_proprio" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Service role bypassa RLS (NextAuth usa SUPABASE_SERVICE_ROLE_KEY)
-- Não precisa de policy explícita — service role ignora RLS por padrão.

-- ─── TRIGGER updated_at ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ─── ÍNDICES ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON public.users(role);
