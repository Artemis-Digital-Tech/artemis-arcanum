-- Leads captured by the site (today: the daily-card newsletter form).
-- Reached only through the `newsletter` edge function using the service role,
-- same arrangement as `readings` and `subscriptions`: RLS on, no policies, so
-- nothing holding the anon key can read or write it.
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  -- Stored lowercase by the function, so the unique constraint below is
  -- effectively case-insensitive and can still be an ON CONFLICT target.
  email text not null,
  name text,
  -- Which capture point produced the lead, so campaigns stay tellable apart.
  source text not null default 'newsletter',
  -- Drives which language the daily reading is written in.
  language text not null default 'pt',
  -- subscribed | unsubscribed | bounced
  status text not null default 'subscribed',
  -- Lets an unsubscribe link work without the lead having an account.
  unsubscribe_token uuid not null default gen_random_uuid(),
  -- Where the daily send left off, so a re-run doesn't mail twice.
  last_sent_at timestamptz,
  -- Filled in if the lead later signs up; null for a plain subscriber.
  user_sub text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leads_status_check check (status in ('subscribed', 'unsubscribed', 'bounced')),
  constraint leads_email_key unique (email)
);

-- The daily send walks subscribed leads; this keeps that scan cheap.
create index leads_status_last_sent_idx on public.leads (status, last_sent_at);

alter table public.leads enable row level security;
