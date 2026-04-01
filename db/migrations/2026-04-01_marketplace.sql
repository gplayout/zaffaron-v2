-- Zaffaron Marketplace Schema (P4)
-- Date: 2026-04-01
-- IMPORTANT: Review before running. Intended for Supabase SQL editor.
-- Requires pgcrypto extension for gen_random_uuid.

begin;

-- Extensions
create extension if not exists pgcrypto;

-- =========================
-- USERS
-- =========================
-- Supabase Auth users live in auth.users

-- =========================
-- COOKS + APPLICATIONS
-- =========================
create table if not exists public.cook_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  phone text not null,
  city text not null,
  specialties text[] not null default '{}',
  years_experience int,
  bio text,
  kitchen_type text check (kitchen_type in ('home_kitchen','commercial_kitchen','catering')),
  availability text check (availability in ('weekdays','weekends','both')),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewer_note text
);

create table if not exists public.cooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  display_name text not null,
  bio text,
  avatar_url text,
  specialties text[] not null default '{}',
  city text not null,
  verified boolean not null default false,
  rating_avg numeric(3,2) not null default 0,
  rating_count int not null default 0,
  created_at timestamptz not null default now()
);

-- =========================
-- REVIEWS (Recipe + Cook)
-- =========================
create table if not exists public.recipe_reviews (
  id uuid primary key default gen_random_uuid(),
  recipe_id bigint not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text,
  created_at timestamptz not null default now(),
  unique (recipe_id, user_id)
);

create table if not exists public.cook_reviews (
  id uuid primary key default gen_random_uuid(),
  cook_id uuid not null references public.cooks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text,
  created_at timestamptz not null default now(),
  unique (cook_id, user_id)
);

-- =========================
-- FAVORITES
-- =========================
create table if not exists public.recipe_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id bigint not null,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

-- =========================
-- MENU ITEMS
-- =========================
create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  cook_id uuid not null references public.cooks(id) on delete cascade,
  name text not null,
  description text,
  price_cents int not null check (price_cents >= 0),
  image_url text,
  category text not null check (category in ('appetizer','main','dessert','drink','side')),
  prep_time_minutes int,
  serves int,
  available boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================
-- ORDERS
-- =========================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  cook_id uuid not null references public.cooks(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','confirmed','preparing','ready','delivered','cancelled')),
  total_cents int not null default 0,
  delivery_address text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid not null references public.menu_items(id) on delete restrict,
  quantity int not null check (quantity > 0),
  price_cents int not null check (price_cents >= 0),
  primary key (order_id, menu_item_id)
);

-- =========================
-- RLS
-- =========================
alter table public.cook_applications enable row level security;
alter table public.cooks enable row level security;
alter table public.recipe_reviews enable row level security;
alter table public.cook_reviews enable row level security;
alter table public.recipe_favorites enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- cook_applications: user can insert/read own
create policy "cook_applications_insert_own" on public.cook_applications
  for insert with check (auth.uid() = user_id);
create policy "cook_applications_select_own" on public.cook_applications
  for select using (auth.uid() = user_id);

-- cooks: public can read verified cooks; cook can read self
create policy "cooks_select_public_verified" on public.cooks
  for select using (verified = true or auth.uid() = user_id);

-- menu_items: public can read available items for verified cooks; cook can manage own
create policy "menu_items_select_public" on public.menu_items
  for select using (
    available = true and exists (select 1 from public.cooks c where c.id = cook_id and c.verified = true)
    or exists (select 1 from public.cooks c where c.id = cook_id and c.user_id = auth.uid())
  );
create policy "menu_items_modify_owner" on public.menu_items
  for all using (exists (select 1 from public.cooks c where c.id = cook_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.cooks c where c.id = cook_id and c.user_id = auth.uid()));

-- favorites: user manages own
create policy "favorites_select_own" on public.recipe_favorites
  for select using (auth.uid() = user_id);
create policy "favorites_modify_own" on public.recipe_favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- recipe_reviews: authenticated can read all (public site) but only write own
create policy "recipe_reviews_select_all" on public.recipe_reviews
  for select using (true);
create policy "recipe_reviews_insert_own" on public.recipe_reviews
  for insert with check (auth.uid() = user_id);
create policy "recipe_reviews_update_own" on public.recipe_reviews
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- cook_reviews: authenticated can read all; only write own
create policy "cook_reviews_select_all" on public.cook_reviews
  for select using (true);
create policy "cook_reviews_insert_own" on public.cook_reviews
  for insert with check (auth.uid() = user_id);
create policy "cook_reviews_update_own" on public.cook_reviews
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- orders: customer sees own, cook sees their orders
create policy "orders_select_customer_or_cook" on public.orders
  for select using (
    auth.uid() = customer_id
    or exists (select 1 from public.cooks c where c.id = cook_id and c.user_id = auth.uid())
  );
create policy "orders_insert_customer" on public.orders
  for insert with check (auth.uid() = customer_id);
create policy "orders_update_customer_or_cook" on public.orders
  for update using (
    auth.uid() = customer_id
    or exists (select 1 from public.cooks c where c.id = cook_id and c.user_id = auth.uid())
  )
  with check (
    auth.uid() = customer_id
    or exists (select 1 from public.cooks c where c.id = cook_id and c.user_id = auth.uid())
  );

-- order_items: visible if order visible; writable by order owner (customer) only
create policy "order_items_select_via_orders" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
      and (
        auth.uid() = o.customer_id
        or exists (select 1 from public.cooks c where c.id = o.cook_id and c.user_id = auth.uid())
      )
    )
  );

create policy "order_items_insert_customer" on public.order_items
  for insert with check (
    exists (select 1 from public.orders o where o.id = order_id and auth.uid() = o.customer_id)
  );

create policy "order_items_update_customer" on public.order_items
  for update using (
    exists (select 1 from public.orders o where o.id = order_id and auth.uid() = o.customer_id)
  )
  with check (
    exists (select 1 from public.orders o where o.id = order_id and auth.uid() = o.customer_id)
  );

commit;
