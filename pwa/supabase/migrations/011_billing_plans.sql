-- Billing and subscription schema
-- Plans, subscriptions, usage counters

create table if not exists plans (
  id text primary key,
  name text not null,
  price_monthly_cents integer not null,
  price_annual_cents integer,
  description text,
  limits jsonb,
  household_size integer,
  active boolean default true,
  created_at timestamptz default now()
);

insert into plans (id, name, price_monthly_cents, description, limits, household_size)
values
  ('essential', 'Essential', 6900, 'Limited labs/refills/referrals for healthy adults.', '{"labs":2,"refills":4,"referrals":2,"appointments":0}', 1),
  ('complete', 'Complete', 12000, 'Unlimited access to care.', '{"labs":"unlimited","refills":"unlimited","referrals":"unlimited","appointments":"unlimited"}', 1),
  ('family', 'Family', 19900, 'Complete access for household members.', '{"labs":"unlimited","refills":"unlimited","referrals":"unlimited","appointments":"unlimited"}', 5),
  ('premium', 'Premium', 29900, 'Concierge-level care with priority response.', '{"labs":"unlimited","refills":"unlimited","referrals":"unlimited","appointments":"unlimited"}', 1)
on conflict (id) do nothing;

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  plan_id text not null references plans(id),
  status text default 'active',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists subscriptions_user_idx on subscriptions(user_id);
create unique index if not exists subscriptions_stripe_sub_uidx on subscriptions(stripe_subscription_id);

create type usage_type as enum ('lab', 'refill', 'referral', 'appointment');

create table if not exists usage_counters (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references subscriptions(id) on delete cascade,
  usage_type usage_type not null,
  period_start date not null,
  period_end date not null,
  used integer default 0,
  created_at timestamptz default now(),
  unique (subscription_id, usage_type, period_start, period_end)
);

-- Simple audit log
create table if not exists billing_events (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references subscriptions(id) on delete cascade,
  event_type text not null,
  payload jsonb,
  created_at timestamptz default now()
);

-- RLS
alter table plans enable row level security;
alter table subscriptions enable row level security;
alter table usage_counters enable row level security;
alter table billing_events enable row level security;

-- Plans can be selected by any authenticated user
drop policy if exists "plans_read_all" on plans;
create policy "plans_read_all" on plans
  for select using (auth.role() = 'authenticated');

-- Subscriptions: user can see their own
drop policy if exists "subscriptions_self_read" on subscriptions;
create policy "subscriptions_self_read" on subscriptions
  for select using (user_id = auth.uid());

drop policy if exists "subscriptions_self_insert" on subscriptions;
create policy "subscriptions_self_insert" on subscriptions
  for insert with check (user_id = auth.uid());

drop policy if exists "subscriptions_self_update" on subscriptions;
create policy "subscriptions_self_update" on subscriptions
  for update using (user_id = auth.uid());

-- Usage counters: user can read their own subscription counters
drop policy if exists "usage_read" on usage_counters;
create policy "usage_read" on usage_counters
  for select using (
    subscription_id in (select id from subscriptions where user_id = auth.uid())
  );

-- Billing events: readable by owner
drop policy if exists "billing_events_read" on billing_events;
create policy "billing_events_read" on billing_events
  for select using (
    subscription_id in (select id from subscriptions where user_id = auth.uid())
  );

-- Service role can do anything
drop policy if exists "subscriptions_service_all" on subscriptions;
create policy "subscriptions_service_all" on subscriptions
  for all using (auth.role() = 'service_role') with check (true);

drop policy if exists "usage_service_all" on usage_counters;
create policy "usage_service_all" on usage_counters
  for all using (auth.role() = 'service_role') with check (true);

drop policy if exists "billing_events_service_all" on billing_events;
create policy "billing_events_service_all" on billing_events
  for all using (auth.role() = 'service_role') with check (true);
