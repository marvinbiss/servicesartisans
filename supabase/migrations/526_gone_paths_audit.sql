-- ============================================================================
-- MIGRATION 526: gone_paths_audit (cleanup 320K thin pages — Pillar 3)
-- ============================================================================
-- Contexte : `src/lib/seo/gone-paths.ts` gere deja le mapping 410/301 cote
-- middleware (Edge runtime, zero I/O). Mais le mapping est code-resident
-- (statique). Cette migration ajoute :
--
--   - Trace prod des decisions cleanup (audit pour GSC + regulateur).
--   - Stats hits par pattern (savoir si une rule 410 est encore frappee
--     apres N jours -> on peut la dropper du middleware).
--   - Reason text non-statique (justifier devant Marvin pourquoi route
--     est morte : "thin", "duplicate", "noise", "abandoned-experiment").
--
-- Le middleware reste source de verite runtime (zero round-trip). Cette
-- table est observability seulement.
--
-- Securite : aucune fonction PL/pgSQL nouvelle. Pas de pin search_path requis.

create table if not exists public.gone_paths_audit (
  id bigserial primary key,
  path_pattern text not null,
  matched_path text not null,
  http_code int not null check (http_code in (301, 308, 404, 410)),
  redirect_to text,
  reason text not null,
  category text not null
    check (category in ('thin', 'duplicate', 'noise', 'abandoned-experiment', 'pivot-rge')),
  user_agent text,
  referrer text,
  hit_at timestamptz not null default now()
);

-- Hot path : aggregat hits par pattern sur fenetre 30j.
create index if not exists gone_paths_audit_pattern_recent_idx
  on public.gone_paths_audit(path_pattern, hit_at desc);

-- Detection bot vs user (crawl budget analysis).
create index if not exists gone_paths_audit_ua_idx
  on public.gone_paths_audit(user_agent)
  where user_agent is not null;

-- Rolling cleanup : on garde 90j d'historique max (cron purge separe).
create index if not exists gone_paths_audit_hit_at_idx
  on public.gone_paths_audit(hit_at);

alter table public.gone_paths_audit enable row level security;

drop policy if exists "gone_paths_audit_service_role_all" on public.gone_paths_audit;
create policy "gone_paths_audit_service_role_all" on public.gone_paths_audit
  for all
  to authenticated
  using ((auth.jwt() ->> 'role') = 'service_role')
  with check ((auth.jwt() ->> 'role') = 'service_role');

comment on table public.gone_paths_audit is
  'Observability cleanup 320K thin pages (Pillar 3). Middleware src/lib/seo/gone-paths.ts insert async fire-and-forget. RLS service_role only.';
comment on column public.gone_paths_audit.path_pattern is
  'Pattern qui a matche (ex /devis/[s]/[v]). Source : gone-paths.ts.';
comment on column public.gone_paths_audit.category is
  'thin = vide DB / duplicate = 301 vers canonical / noise = abandoned / pivot-rge = retire post-pivot 2026-05-03.';
