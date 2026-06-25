create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  order_id uuid references public.orders(id) on delete set null,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, product_id)
);

alter table public.reviews enable row level security;

create policy "Reviews are publicly readable"
  on public.reviews for select using (true);

create policy "Users manage own reviews"
  on public.reviews for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists reviews_product_id_idx on public.reviews(product_id);
create index if not exists reviews_user_id_idx on public.reviews(user_id);

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger reviews_updated_at before update on public.reviews
  for each row execute function update_updated_at();
