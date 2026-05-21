-- ============================================================================
-- MIGRATION 521: RGE-OS Webhooks pipeline (pillar 8)
-- ============================================================================
-- Contexte : `docs/RGE-OS-MANIFESTO.md` pillar 8 expose un système d'abonnement
-- événementiel pour les consommateurs tiers (Sonergia, Effy, Hellio, dashboards
-- BI, journalistes data) afin qu'ils n'aient pas à poller `/api/v1/rge/...`
-- toutes les heures pour détecter une mise à jour ADEME.
--
-- Tables :
--   - rge_os_webhooks : abonnements (URL + secret HMAC + events souscrits +
--     api_key_hash pour grouper plusieurs hooks sous le même intégrateur).
--   - rge_os_webhook_deliveries : journal append-only des tentatives de
--     livraison (status HTTP, durée, body excerpt). Sert au debug intégrateur
--     et à la décision retry/disable (v0.2).
--
-- Sécurité :
--   - RLS service_role-only (pas d'accès anonyme). URLs + secrets ne doivent
--     JAMAIS fuiter via le schéma public.
--   - URL format check (^https?://) pour rejeter file:// / javascript:.
--   - `phone` / `siret` / `email` ne sont volontairement PAS stockés ici :
--     les events RGE-OS sont broadcast au consommateur, pas du fan-out
--     par destinataire.
--
-- Trigger updated_at : PINNE `search_path = public, pg_catalog` (CVE-2018-1058
-- hardening per CLAUDE.md). Audit `audit-migration-search-path` vérifié.

create table if not exists public.rge_os_webhooks (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  secret text not null,
  email text,
  events text[] not null default '{}',
  active boolean not null default true,
  api_key_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_delivery_at timestamptz,
  last_delivery_status int,
  consecutive_failures int not null default 0,
  notes text,
  constraint rge_os_webhooks_url_format check (url ~ '^https?://')
);

create index if not exists rge_os_webhooks_active_idx
  on public.rge_os_webhooks(active) where active = true;
create index if not exists rge_os_webhooks_api_key_hash_idx
  on public.rge_os_webhooks(api_key_hash);
create index if not exists rge_os_webhooks_events_gin
  on public.rge_os_webhooks using gin (events);

create table if not exists public.rge_os_webhook_deliveries (
  id bigserial primary key,
  webhook_id uuid not null references public.rge_os_webhooks(id) on delete cascade,
  event text not null,
  payload jsonb not null,
  attempt int not null default 1,
  status int,
  response_body_excerpt text,
  duration_ms int,
  created_at timestamptz not null default now(),
  error text
);

create index if not exists rge_os_webhook_deliveries_webhook_id_idx
  on public.rge_os_webhook_deliveries(webhook_id);
create index if not exists rge_os_webhook_deliveries_created_at_idx
  on public.rge_os_webhook_deliveries(created_at desc);
create index if not exists rge_os_webhook_deliveries_event_idx
  on public.rge_os_webhook_deliveries(event);

-- RLS : tables read-only / admin-only (pas d'accès anonyme).
alter table public.rge_os_webhooks enable row level security;
alter table public.rge_os_webhook_deliveries enable row level security;

drop policy if exists "rge_os_webhooks_admin_all" on public.rge_os_webhooks;
create policy "rge_os_webhooks_admin_all" on public.rge_os_webhooks
  for all
  to authenticated
  using ((auth.jwt() ->> 'role') = 'service_role')
  with check ((auth.jwt() ->> 'role') = 'service_role');

drop policy if exists "rge_os_webhook_deliveries_admin_read" on public.rge_os_webhook_deliveries;
create policy "rge_os_webhook_deliveries_admin_read" on public.rge_os_webhook_deliveries
  for select
  to authenticated
  using ((auth.jwt() ->> 'role') = 'service_role');

-- updated_at trigger — search_path pinné (CVE-2018-1058).
create or replace function public.rge_os_webhooks_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $body$
begin
  new.updated_at = now();
  return new;
end;
$body$;

drop trigger if exists rge_os_webhooks_updated_at_trg on public.rge_os_webhooks;
create trigger rge_os_webhooks_updated_at_trg
  before update on public.rge_os_webhooks
  for each row execute procedure public.rge_os_webhooks_updated_at();

comment on table public.rge_os_webhooks is
  'RGE-OS pillar 8 — webhook subscriptions for third-party consumers. RLS service_role only.';
comment on table public.rge_os_webhook_deliveries is
  'Append-only delivery log for RGE-OS webhooks. status NULL = network error.';
comment on function public.rge_os_webhooks_updated_at is
  'Trigger updated_at sur rge_os_webhooks. search_path pinné (CVE-2018-1058).';
