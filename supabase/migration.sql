-- ============================================================
-- Hisobim — boshlang'ich schema migratsiyasi
-- Supabase SQL Editor da bir marta ishlatiladi
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLE: shops
-- ============================================================
create table public.shops (
  id          uuid primary key default uuid_generate_v4(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  phone       text,
  region      text,
  address     text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create index idx_shops_owner_id on public.shops(owner_id);

-- ============================================================
-- TABLE: customers
-- ============================================================
create table public.customers (
  id          uuid primary key default uuid_generate_v4(),
  shop_id     uuid not null references public.shops(id) on delete cascade,
  name        text not null,
  phone       text,
  note        text,
  total_debt  numeric(15, 2) not null default 0,
  created_at  timestamptz not null default now()
);

create index idx_customers_shop_id on public.customers(shop_id);
create index idx_customers_name    on public.customers(shop_id, lower(name));

-- ============================================================
-- TABLE: debts
-- ============================================================
create table public.debts (
  id           uuid primary key default uuid_generate_v4(),
  shop_id      uuid not null references public.shops(id) on delete cascade,
  customer_id  uuid not null references public.customers(id) on delete cascade,
  amount       numeric(15, 2) not null,   -- musbat = qarz, manfiy = to'lov
  description  text,
  created_by   uuid not null references auth.users(id),
  created_at   timestamptz not null default now()
);

create index idx_debts_customer_id on public.debts(customer_id);
create index idx_debts_shop_id     on public.debts(shop_id);

-- ============================================================
-- TABLE: shop_users (keyingi faza uchun, hozir scaffold)
-- ============================================================
create table public.shop_users (
  id          uuid primary key default uuid_generate_v4(),
  shop_id     uuid not null references public.shops(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('owner', 'cashier', 'viewer')),
  created_at  timestamptz not null default now(),
  unique (shop_id, user_id)
);

-- ============================================================
-- TRIGGER: customers.total_debt ni avtomatik yangilash
-- ============================================================
create or replace function public.sync_customer_total_debt()
returns trigger
language plpgsql
security definer
as $$
declare
  target_customer_id uuid;
begin
  if (TG_OP = 'DELETE') then
    target_customer_id := OLD.customer_id;
  else
    target_customer_id := NEW.customer_id;
  end if;

  update public.customers
  set total_debt = coalesce(
    (select sum(amount) from public.debts where customer_id = target_customer_id),
    0
  )
  where id = target_customer_id;

  if (TG_OP = 'DELETE') then
    return OLD;
  end if;
  return NEW;
end;
$$;

create trigger trg_sync_total_debt
after insert or update or delete on public.debts
for each row
execute function public.sync_customer_total_debt();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.shops      enable row level security;
alter table public.customers  enable row level security;
alter table public.debts      enable row level security;
alter table public.shop_users enable row level security;

-- Shop egasini tekshiruvchi yordamchi funksiya (performance uchun)
create or replace function public.is_shop_owner(p_shop_id uuid)
returns boolean
language sql
security definer stable
as $$
  select exists (
    select 1 from public.shops
    where id = p_shop_id and owner_id = auth.uid()
  );
$$;

-- SHOPS policies
create policy "Owner: full access to own shop"
  on public.shops for all
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- CUSTOMERS policies
create policy "Owner: select customers"
  on public.customers for select
  to authenticated
  using (public.is_shop_owner(shop_id));

create policy "Owner: insert customers"
  on public.customers for insert
  to authenticated
  with check (public.is_shop_owner(shop_id));

create policy "Owner: update customers"
  on public.customers for update
  to authenticated
  using (public.is_shop_owner(shop_id))
  with check (public.is_shop_owner(shop_id));

create policy "Owner: delete customers"
  on public.customers for delete
  to authenticated
  using (public.is_shop_owner(shop_id));

-- DEBTS policies
create policy "Owner: select debts"
  on public.debts for select
  to authenticated
  using (public.is_shop_owner(shop_id));

create policy "Owner: insert debts"
  on public.debts for insert
  to authenticated
  with check (public.is_shop_owner(shop_id));

create policy "Owner: update debts"
  on public.debts for update
  to authenticated
  using (public.is_shop_owner(shop_id));

create policy "Owner: delete debts"
  on public.debts for delete
  to authenticated
  using (public.is_shop_owner(shop_id));
