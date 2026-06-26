-- ─── Sprint 12 · US-65: Stripe Subscriptions ────────────────────────────────

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                     UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id     TEXT        NOT NULL,
  stripe_subscription_id TEXT        NOT NULL,
  stripe_price_id        TEXT        NOT NULL,
  -- active | trialing | past_due | canceled | unpaid | incomplete | incomplete_expired | paused
  status                 TEXT        NOT NULL DEFAULT 'active',
  current_period_end     TIMESTAMPTZ NOT NULL,
  created_at             TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at             TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Usuários só leem a própria linha
CREATE POLICY "Users read own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Admin (service_role) pode tudo via bypass
-- Índice extra para lookup por stripe_subscription_id no webhook
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub_id
  ON public.subscriptions (stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id
  ON public.subscriptions (stripe_customer_id);
