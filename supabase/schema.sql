-- Apply in the Supabase SQL editor. Never expose the service role key to the browser.
create table if not exists public.queue_reports (
  id bigint generated always as identity primary key,
  branch_id text not null check (branch_id in ('cbz-kwame','cbz-samora','cbz-westgate','fbc-cbd','fbc-belgravia','zb-cbd','zb-avondale','cabs-first','cabs-avondale','stb-cbd','fcb-first')),
  service text not null check (service in ('Cash withdrawal','Cash deposit','Account opening','Card services','General enquiries')),
  wait_minutes integer not null check (wait_minutes between 0 and 240),
  reporter_hash text not null,
  report_bucket bigint not null,
  reported_at timestamptz not null default now(),
  unique (reporter_hash, branch_id, service, report_bucket)
);
create index if not exists queue_reports_recent_idx on public.queue_reports (reported_at desc);
alter table public.queue_reports enable row level security;
revoke all on public.queue_reports from anon, authenticated;
-- Service-role requests from the Netlify function bypass RLS. No browser table access.
-- For retention, run this periodically with a trusted scheduler:
-- delete from public.queue_reports where reported_at < now() - interval '24 hours';
