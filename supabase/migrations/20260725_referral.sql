-- ============================================================
-- Migration — Programa de indicação (Referral)
-- US-51 — TodaAtividade
-- ============================================================

-- ─── Coluna referral_code na tabela orders ────────────────────────────────────
-- Referência ao código que gerou o desconto, para auditoria.
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS referral_code text;

-- ─── Tabela de códigos de indicação ──────────────────────────────────────────
-- user_id é o ID da sessão NextAuth (pode ser UUID do Supabase Auth ou do OAuth).
-- Sem FK explícita para public.users para compatibilidade com ambos os fluxos.
CREATE TABLE IF NOT EXISTS public.user_referrals (
  user_id       uuid        PRIMARY KEY,
  referral_code text        NOT NULL UNIQUE,
  referred_by   uuid,
  credits       integer     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "referrals_select_proprio" ON public.user_referrals
  FOR SELECT USING (auth.uid() = user_id);

-- ─── Log de usos (auditoria) ─────────────────────────────────────────────────
-- UNIQUE(referred_id): cada usuário só pode usar um indicação uma vez.
CREATE TABLE IF NOT EXISTS public.referral_usages (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id   uuid        NOT NULL,
  referred_id   uuid        NOT NULL UNIQUE,
  order_id      uuid,
  discount_cents integer    NOT NULL DEFAULT 0,
  credit_cents  integer     NOT NULL DEFAULT 300,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_usages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usages_select_proprio" ON public.referral_usages
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- ─── Índices ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_referrals_code   ON public.user_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_usages_order ON public.referral_usages(order_id);

-- ─── Função de incremento atômico de créditos ─────────────────────────────────
-- Chamada via supabaseAdmin.rpc('add_referral_credit', { p_user_id, p_amount })
CREATE OR REPLACE FUNCTION public.add_referral_credit(p_user_id uuid, p_amount integer)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.user_referrals
  SET credits = credits + p_amount
  WHERE user_id = p_user_id;
$$;
