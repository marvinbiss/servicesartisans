-- ============================================================================
-- MIGRATION 524: renovation_clusters (Pillar 1 — Topical Authority)
-- ============================================================================
-- Contexte : pivot strategie domination SEO renovation energetique. Volume
-- accessible 300-500K vol/mois sur cluster MaPrimeRenov / CEE / RGE / pompe a
-- chaleur / isolation / audit. Concurrents (Effy, Hellio, Travaux.com) sans
-- USP data ADEME -> on prend la place. Cible 5K pages Critic-validees M+3,
-- 20K M+6.
--
-- Tables :
--   - renovation_clusters : taxonomy hierarchique (pillar > cluster > long-tail)
--     avec primary KW Ahrefs source CSV daté, content JSONB genere LLM,
--     Critic gate sur published_at.
--
-- Securite : aucune fonction PL/pgSQL nouvelle. Aucun pin de search_path
-- requis. Hook audit-migration-search-path reste vert.

create table if not exists public.renovation_clusters (
  slug text primary key,
  parent_cluster_slug text references public.renovation_clusters(slug)
    on delete set null,
  cluster_type text not null
    check (cluster_type in ('pillar', 'cluster', 'long-tail')),
  service_slug text,
  primary_kw text not null,
  volume_monthly int,
  kd_ahrefs numeric(4,1),
  cpc_eur numeric(6,2),
  ahrefs_source_date date not null,
  content_jsonb jsonb,
  critic_score jsonb,
  critic_passed_at timestamptz,
  published_at timestamptz,
  noindex boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Parent navigation (hub -> children).
create index if not exists renovation_clusters_parent_published_idx
  on public.renovation_clusters(parent_cluster_slug)
  where published_at is not null;

-- Publication queue : entries Critic-validated mais pas encore publiees.
create index if not exists renovation_clusters_publish_ready_idx
  on public.renovation_clusters(critic_passed_at)
  where noindex = true and critic_passed_at is not null;

-- Cluster discovery par service (cross-cluster maillage).
create index if not exists renovation_clusters_service_published_idx
  on public.renovation_clusters(service_slug)
  where published_at is not null and service_slug is not null;

-- Audit Ahrefs freshness (re-import quotidien).
create index if not exists renovation_clusters_ahrefs_date_idx
  on public.renovation_clusters(ahrefs_source_date desc);

alter table public.renovation_clusters enable row level security;

drop policy if exists "renovation_clusters_public_read_published"
  on public.renovation_clusters;
create policy "renovation_clusters_public_read_published"
  on public.renovation_clusters
  for select
  to anon, authenticated
  using (published_at is not null and noindex = false);

drop policy if exists "renovation_clusters_service_role_all"
  on public.renovation_clusters;
create policy "renovation_clusters_service_role_all"
  on public.renovation_clusters
  for all
  to authenticated
  using ((auth.jwt() ->> 'role') = 'service_role')
  with check ((auth.jwt() ->> 'role') = 'service_role');

comment on table public.renovation_clusters is
  'Topical authority taxonomy renovation energetique (pillar/cluster/long-tail). content_jsonb genere LLM + Critic gate. published_at != null && noindex = false => live SEO.';
comment on column public.renovation_clusters.primary_kw is
  'Mot-cle cible Ahrefs (@kw-primary). Source CSV obligatoire (ahrefs_source_date).';
comment on column public.renovation_clusters.critic_score is
  'JSONB : { factuality, source_present, math_check, hallucination_risk, completeness, safety_disclaimer }.';
comment on column public.renovation_clusters.critic_passed_at is
  'Stamped quand Critic pass. Sans timestamp -> noindex force.';
