-- =============================================================================
-- Migration 408 — Lien devis_requests ↔ cee_dossiers (Brique 3 pipeline CEE)
-- =============================================================================
-- Contexte : le dispatcher CEE (`src/lib/cee/dispatcher.ts`) crée un dossier
-- brouillon dans `cee_dossiers` quand un devis est routé en CEE (`cee_routed`).
-- Pour tracer l'outcome côté devis et permettre l'ouverture du dossier depuis
-- le back-office devis (dashboard artisan / admin) en une seule requête, on
-- matérialise le lien devis → dossier comme une colonne dédiée.
--
-- Pourquoi pas seulement `cee_dossiers.devis_id` (FK inverse, déjà présente
-- via migration 402) :
--   - Il faut une trace immédiate côté devis même si le dossier est purgé
--     (ON DELETE SET NULL)
--   - La lecture dashboard devis doit être un `select()` direct, pas un join
--     (évite N+1 sur la liste devis)
--   - L'absence de valeur = signal explicite "devis non CEE" (fallback)
--
-- Fail-SAFE côté applicatif : si l'UPDATE post-dispatch échoue, le devis reste
-- cohérent (dossier créé côté cee_dossiers, lien manquant côté devis). Un
-- reconcile futur pourra re-synchroniser à partir de `cee_dossiers.devis_id`.
--
-- Brique 3 roadmap mandataire CEE (décision 2026-04-09).
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Colonne cee_dossier_id sur devis_requests
-- -----------------------------------------------------------------------------
-- ON DELETE SET NULL : la suppression d'un dossier CEE ne doit jamais casser
-- la lecture du devis d'origine (cycle de vie indépendant). L'intégrité est
-- conservée côté cee_dossiers via cee_dossiers.devis_id (migration 402).

ALTER TABLE public.devis_requests
  ADD COLUMN IF NOT EXISTS cee_dossier_id UUID NULL
    REFERENCES public.cee_dossiers(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.devis_requests.cee_dossier_id IS
  'Dossier CEE brouillon créé par le dispatcher (brique 3). NULL si le devis '
  'n''a pas été routé en CEE (fallback_non_cee) ou si le dispatch a échoué. '
  'ON DELETE SET NULL — la purge d''un dossier ne casse pas la lecture devis.';

-- -----------------------------------------------------------------------------
-- Index partiel pour les devis effectivement routés CEE
-- -----------------------------------------------------------------------------
-- Index partiel car >95% des devis ne sont pas CEE-routés (la plupart des
-- métiers ne sont pas concernés). Partial index = footprint minimal et lecture
-- rapide pour les dashboards "devis CEE uniquement".

CREATE INDEX IF NOT EXISTS idx_devis_requests_cee_dossier_id
  ON public.devis_requests (cee_dossier_id)
  WHERE cee_dossier_id IS NOT NULL;

COMMIT;
