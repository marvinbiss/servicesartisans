-- ============================================================================
-- MIGRATION 525: critic_runs (audit trail YMYL Critic)
-- ============================================================================
-- Contexte : pipeline cluster-generate (Pillar 1) appelle Critic Opus 4.7 en
-- seconde passe sur chaque page genere. Besoin trace deterministe pour :
--
--   - Auditabilite reglementaire AI Act Annexe III §5b + RGPD Art. 22 (montrer
--     a CNIL / regulateur que chaque output YMYL a ete verifie).
--   - Audit interne pass rate par modele / par target_table -> kill agents
--     LLM qui regresse sous seuil 75%.
--   - Cost tracking par run (Anthropic Tier 1 quota visible par operation).
--
-- target_table + target_id = polymorphic ref vers la row Critic-ed (souvent
-- renovation_clusters mais peut etre answer_engine, dispatch, etc.).
--
-- Securite : aucune fonction PL/pgSQL nouvelle. Pas de pin search_path requis.

create table if not exists public.critic_runs (
  id uuid primary key default gen_random_uuid(),
  target_table text not null,
  target_id text not null,
  ymyl_context text not null,
  model text not null,
  pre_score jsonb,
  llm_score jsonb,
  decision text not null
    check (decision in ('approve', 'revise', 'block')),
  pass boolean not null,
  pre_block_reason text,
  cost_usd numeric(8,4),
  duration_ms int,
  trace_id text,
  agent_name text,
  created_at timestamptz not null default now()
);

-- Lookup le dernier run par target (audit + dedup).
create index if not exists critic_runs_target_recent_idx
  on public.critic_runs(target_table, target_id, created_at desc);

-- Pass rate analytics par modele (dashboard pilote).
create index if not exists critic_runs_model_pass_idx
  on public.critic_runs(model, created_at desc)
  where pass = true;

-- Cost tracking quotidien (Anthropic quota visibility).
create index if not exists critic_runs_cost_daily_idx
  on public.critic_runs(created_at desc, cost_usd)
  where cost_usd is not null;

alter table public.critic_runs enable row level security;

drop policy if exists "critic_runs_service_role_all" on public.critic_runs;
create policy "critic_runs_service_role_all" on public.critic_runs
  for all
  to authenticated
  using ((auth.jwt() ->> 'role') = 'service_role')
  with check ((auth.jwt() ->> 'role') = 'service_role');

-- Anti-tamper : append-only depuis l'app. Service role bypass RLS donc capable
-- d'update si bug data, mais 0 path code app n'est cense le faire.

comment on table public.critic_runs is
  'YMYL Critic audit trail (AI Act §5b + RGPD Art. 22 evidence). Polymorphic target_table + target_id. Append-only depuis app, RLS service_role only.';
comment on column public.critic_runs.pre_score is
  'Heuristic rubric scores (source_present, math_check, hallucination_risk). Bloque hard avant LLM call si pre_block_reason set.';
comment on column public.critic_runs.llm_score is
  'JSON output Critic LLM (factuality, completeness, safety_disclaimer). null si pre-block.';
comment on column public.critic_runs.decision is
  'Verdict final : approve / revise / block. Pass = (decision = approve).';
