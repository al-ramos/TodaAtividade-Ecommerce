-- ============================================================
-- TodaAtividade — Migration: tabela favorites (US-34 Wishlist)
-- ============================================================

create table if not exists public.favorites (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(user_id, product_id)
);

-- RLS
alter table public.favorites enable row level security;

create policy "Users can manage their own favorites"
  on public.favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Índices
create index if not exists favorites_user_id_idx    on public.favorites(user_id);
create index if not exists favorites_product_id_idx on public.favorites(product_id);
