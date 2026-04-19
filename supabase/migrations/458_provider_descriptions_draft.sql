-- Migration 458 — Table `provider_descriptions_draft` for RGE descriptions pipeline v1.
--
-- Why:
--   Pipeline fondation (cf. docs/descriptions-pipeline/SPEC-V1.md).
--   50 332 artisans RGE actifs a doter d'une description unique E-E-A-T / YMYL-safe.
--   Flow : Haiku genere -> L1 validator auto -> L2 Opus-judge (zone grise) ->
--          L3 skill cross-check (sample) -> publish vers `providers.description`.
--
-- Design decisions:
--   * PK = provider_id (1 draft actif par provider). Regeneration = UPSERT,
--     pas d'historique. L'historique des generations viendra plus tard dans
--     une table dediee (`provider_descriptions_history`) si besoin.
--   * ON DELETE CASCADE : si le provider disparait (RGE expire + purge),
--     le draft est detruit avec lui.
--   * Status en enum Postgres (vs TEXT + CHECK) pour contraindre au niveau type.
--   * Breakdown 9 dims en JSONB : flexible face aux evolutions rubric_version,
--     colonnes typees seraient a re-migrer a chaque bump.
--   * Index partiel WHERE status = 'judged_pass' : le script de publication
--     batch pickup les prets-a-publier en O(log n) sur potentiellement 50K rows.
--   * RLS : public NO READ. Seul service_role (via createAdminClient) y accede.
--     Aucun role anon/authenticated n'a SELECT : les drafts ne doivent JAMAIS
--     fuiter cote client avant QA/publication.

BEGIN;

-- 1. Status enum
CREATE TYPE provider_description_status AS ENUM (
  'pending',      -- row cree, generation pas encore lancee
  'generating',   -- lock en cours cote script batch
  'judged_pass',  -- L1 + L2 OK, pret pour publication
  'judged_fail',  -- rejete par validator ou judge, attend regeneration
  'published',    -- copie effectuee vers providers.description
  'archived'      -- soft-delete logique (provider non-RGE / plus eligible)
);

-- 2. Table
CREATE TABLE provider_descriptions_draft (
  -- Identite : 1 draft par provider, UPSERT sur regeneration
  provider_id            UUID PRIMARY KEY REFERENCES providers(id) ON DELETE CASCADE,

  -- Contenu genere
  draft_text             TEXT,
  word_count             INTEGER,

  -- Versioning / reproductibilite (cf. SPEC 1.4 + 2.4)
  prompt_version         TEXT,
  rubric_version         TEXT,
  model_used             TEXT,
  tokens_input           INTEGER,
  tokens_output          INTEGER,
  cost_estimate_usd      NUMERIC(8,6),

  -- Scoring L1 (validator auto) + L2 (Opus-judge)
  judge_score            NUMERIC(4,2),            -- score global pondere 9 dims (cf. SPEC 3.2)
  judge_breakdown        JSONB DEFAULT '{}'::jsonb, -- 9 dims : sourceless, factualite, ton, longueur, langue, rge_specifique, faq, locale, no_hallucination
  judge_model            TEXT,

  -- Scoring L3 (skill cross-check, sample uniquement)
  crosscheck_score       NUMERIC(4,2),
  crosscheck_model       TEXT,
  crosscheck_passed      BOOLEAN,

  -- Status machine
  status                 provider_description_status NOT NULL DEFAULT 'pending',
  rejection_reason       TEXT,
  hallucination_flags    JSONB DEFAULT '[]'::jsonb,
  attempts               INTEGER NOT NULL DEFAULT 0,

  -- Timestamps lifecycle
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  generated_at           TIMESTAMPTZ,
  judged_at              TIMESTAMPTZ,
  published_at           TIMESTAMPTZ,
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Index partiel pour batch publication (O(log n) pickup)
CREATE INDEX idx_pdd_judged_pass
  ON provider_descriptions_draft (judged_at DESC)
  WHERE status = 'judged_pass';

-- Index auxiliaire pour monitoring / metrics par status (petit cout, gros ROI dashboard)
CREATE INDEX idx_pdd_status ON provider_descriptions_draft (status);

-- 4. Trigger updated_at
CREATE OR REPLACE FUNCTION set_pdd_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS 'BEGIN NEW.updated_at = now(); RETURN NEW; END;';

CREATE TRIGGER trg_pdd_updated_at
  BEFORE UPDATE ON provider_descriptions_draft
  FOR EACH ROW
  EXECUTE FUNCTION set_pdd_updated_at();

-- 5. RLS : public NO READ. Seul service_role passe (bypass RLS natif).
ALTER TABLE provider_descriptions_draft ENABLE ROW LEVEL SECURITY;

-- Aucune policy SELECT/INSERT/UPDATE/DELETE pour anon/authenticated.
-- RLS enabled + zero policy = deny-all pour tous sauf service_role.
-- service_role bypass RLS par defaut cote Supabase (createAdminClient).

-- 6. Documentation inline (visible via \d+ / Supabase Studio)
COMMENT ON TABLE provider_descriptions_draft IS
  'Drafts descriptions RGE (pipeline v1, SPEC-V1.md). 1 draft actif par provider (UPSERT sur regeneration, pas d''historique). Publications dans providers.description se font par copie explicite (status=published). Admin-only (RLS deny-all, service_role bypass).';

COMMENT ON COLUMN provider_descriptions_draft.provider_id IS
  'PK + FK providers(id). CASCADE delete. 1 seul draft actif par provider.';
COMMENT ON COLUMN provider_descriptions_draft.draft_text IS
  'Texte genere par LLM. NULL tant que status=pending. ~250 mots cible.';
COMMENT ON COLUMN provider_descriptions_draft.word_count IS
  'Compteur mots snapshot. Maintenu par le script generateur (pas colonne generated pour eviter lock contention sur UPSERT batch).';
COMMENT ON COLUMN provider_descriptions_draft.prompt_version IS
  'Version prompt (src/lib/descriptions/prompts/vX.Y.ts). Permet replay + A/B.';
COMMENT ON COLUMN provider_descriptions_draft.rubric_version IS
  'Version rubric scoring (src/lib/descriptions/rubric/vX.Y.ts).';
COMMENT ON COLUMN provider_descriptions_draft.model_used IS
  'ID modele generateur (ex: claude-haiku-4-5-20251001).';
COMMENT ON COLUMN provider_descriptions_draft.tokens_input IS
  'Tokens input consommes pour cette generation.';
COMMENT ON COLUMN provider_descriptions_draft.tokens_output IS
  'Tokens output generes.';
COMMENT ON COLUMN provider_descriptions_draft.cost_estimate_usd IS
  'Cout USD estime de la generation (input + output aux tarifs du modele).';
COMMENT ON COLUMN provider_descriptions_draft.judge_score IS
  'Score global pondere 0-10 (cf. SPEC 3.2). Seuil publication >= 7.5.';
COMMENT ON COLUMN provider_descriptions_draft.judge_breakdown IS
  'JSONB 9 dimensions judge (sourceless, factualite, ton, longueur, langue, rge_specifique, faq, locale, no_hallucination). Schema libre pour suivre bumps rubric_version sans migration.';
COMMENT ON COLUMN provider_descriptions_draft.judge_model IS
  'ID modele juge (ex: claude-opus-4-7). NULL si jugee algorithmiquement (L1 only, hors zone grise).';
COMMENT ON COLUMN provider_descriptions_draft.crosscheck_score IS
  'Score L3 skill cross-check (sample 5% + 100% flagged). NULL hors sample.';
COMMENT ON COLUMN provider_descriptions_draft.crosscheck_model IS
  'Modele cross-check (ex: gpt-5.2 via zai-mcp). Different de judge_model pour detecter bias.';
COMMENT ON COLUMN provider_descriptions_draft.crosscheck_passed IS
  'Fact-check live passe (SIRET + RGE ADEME live). TRUE/FALSE/NULL.';
COMMENT ON COLUMN provider_descriptions_draft.status IS
  'Enum : pending -> generating -> judged_pass|judged_fail -> published|archived. archived = soft-delete (provider plus eligible RGE).';
COMMENT ON COLUMN provider_descriptions_draft.rejection_reason IS
  'Raison rejet (ex: D5<8 YMYL, hallucination, boilerplate). Injectee en contexte a la regeneration.';
COMMENT ON COLUMN provider_descriptions_draft.hallucination_flags IS
  'JSONB array flags detectes (qualif absente DB, SIRET mismatch, ville mismatch, montant non source).';
COMMENT ON COLUMN provider_descriptions_draft.attempts IS
  'Compteur regenerations. >=3 = escalade review humaine.';
COMMENT ON COLUMN provider_descriptions_draft.generated_at IS
  'Timestamp derniere generation LLM reussie.';
COMMENT ON COLUMN provider_descriptions_draft.judged_at IS
  'Timestamp derniere evaluation judge (L1+L2).';
COMMENT ON COLUMN provider_descriptions_draft.published_at IS
  'Timestamp copie vers providers.description. NULL tant que non publie.';

COMMENT ON INDEX idx_pdd_judged_pass IS
  'Pickup batch publication : status=judged_pass trie par judged_at DESC (FIFO fair). O(log n) sur ~45K rows eligibles.';

COMMIT;
