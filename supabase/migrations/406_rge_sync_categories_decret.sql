-- =============================================================================
-- Migration 406 — rge_bulk_update_providers : synchronisation automatique de
-- providers.rge_categories_decret à chaque sync ADEME
-- =============================================================================
-- Contexte
-- --------
-- La migration 404 a ajouté providers.rge_categories_decret INT[] et la
-- fonction `derive_rge_categories_from_qualif(domaine, meta_domaine)`. Le
-- backfill de 404 est one-shot : chaque sync ADEME hebdo (cf.
-- src/lib/rge/sync.ts → RPC `rge_bulk_update_providers`) réécrit
-- `rge_qualifications` mais laissait `rge_categories_decret` inchangé. Les
-- nouveaux providers ingérés ou dont les qualifs ont bougé se retrouvaient
-- sans catégorie décret → non couverts par rge-filter sur les fiches
-- dispensed à catégorie non vide → dispatch RGE cassé à long terme.
--
-- Option choisie : A — extension de la RPC
-- -----------------------------------------
-- On étend `rge_bulk_update_providers` (migration 389) pour recalculer
-- `rge_categories_decret` dans le MÊME UPDATE que `rge_qualifications`. Un
-- seul round-trip, signature publique préservée, atomicité garantie (tout
-- passe ou tout rollback).
--
-- Raison du choix vs Option B (trigger) :
--   1. Le seul chemin d'écriture de rge_qualifications côté prod est cette
--      RPC (cf. sync.ts migration 385 → audit P0 « updates non atomiques »).
--      Un trigger serait donc une couche supplémentaire sans bénéfice.
--   2. Coût nul à chaque sync : le calcul se fait inline dans le UPDATE via
--      une sous-requête LATERAL qui déplie le JSONB et agrège les catégories.
--   3. Debug plus facile : la logique reste dans une seule fonction nommée
--      au lieu d'être éparpillée entre RPC + trigger implicite.
--
-- Impact sur les syncs futures
-- ----------------------------
-- Chaque batch de 500 providers du cron hebdo réécrira désormais
-- rge_categories_decret atomiquement. Aucun changement côté applicatif
-- (sync.ts) : la colonne n'apparaît ni dans le payload ni dans la signature
-- RPC — la dérivation est faite 100 % côté Postgres à partir du JSONB déjà
-- envoyé.
--
-- Réutilisation stricte de derive_rge_categories_from_qualif (migration 404).
-- Aucune duplication de la table de mapping.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.rge_bulk_update_providers(payload JSONB)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated INTEGER := 0;
BEGIN
  IF payload IS NULL OR jsonb_typeof(payload) <> 'array' THEN
    RETURN 0;
  END IF;

  -- UPDATE atomique des colonnes rge_* + phone/email conditionnels + dérivation
  -- de rge_categories_decret depuis upd.rge_qualifications (JSONB du payload).
  --
  -- Le calcul des catégories est fait dans une sous-requête scalaire qui :
  --   1. déplie chaque qualif du JSONB (jsonb_array_elements)
  --   2. filtre les qualifs encore actives (date_fin NULL ou >= today)
  --   3. appelle derive_rge_categories_from_qualif (migration 404)
  --   4. unnest → DISTINCT → array_agg trié
  --
  -- Si aucune catégorie n'est dérivée (mapping conservateur → fallback []),
  -- on écrit un ARRAY[]::INT[] (la colonne a DEFAULT []). Le filtre temporel
  -- reprend la logique du backfill de 404 pour rester cohérent.
  UPDATE public.providers p
     SET rge_qualifications = upd.rge_qualifications,
         rge_valid_until    = upd.rge_valid_until::DATE,
         rge_organismes     = upd.rge_organismes,
         rge_last_synced_at = upd.rge_last_synced_at::TIMESTAMPTZ,
         rge_source_url     = upd.rge_source_url,
         rge_categories_decret = COALESCE(
           (
             SELECT array_agg(DISTINCT cat ORDER BY cat)
               FROM (
                 SELECT unnest(
                          derive_rge_categories_from_qualif(
                            qual->>'domaine',
                            qual->>'meta_domaine'
                          )
                        ) AS cat
                   FROM jsonb_array_elements(upd.rge_qualifications) AS qual
                  WHERE jsonb_typeof(upd.rge_qualifications) = 'array'
                    AND (
                      qual->>'date_fin' IS NULL
                      OR length(qual->>'date_fin') < 10
                      OR substring(qual->>'date_fin', 1, 10) >= to_char(now(), 'YYYY-MM-DD')
                    )
               ) AS cats
              WHERE cat IS NOT NULL
           ),
           ARRAY[]::INT[]
         ),
         phone = CASE
           WHEN p.phone IS NULL
                AND p.claimed_at IS NULL
                AND upd.ademe_telephone IS NOT NULL
                AND NOT EXISTS (
                  SELECT 1 FROM public.providers px
                  WHERE px.phone = upd.ademe_telephone AND px.id <> p.id
                )
           THEN upd.ademe_telephone
           ELSE p.phone
         END,
         email = CASE
           WHEN p.email IS NULL AND p.claimed_at IS NULL AND upd.ademe_email IS NOT NULL
           THEN upd.ademe_email
           ELSE p.email
         END
    FROM jsonb_to_recordset(payload) AS upd(
      id                 UUID,
      rge_qualifications JSONB,
      rge_valid_until    TEXT,
      rge_organismes     TEXT[],
      rge_last_synced_at TEXT,
      rge_source_url     TEXT,
      ademe_telephone    TEXT,
      ademe_email        TEXT
    )
   WHERE p.id = upd.id;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;

COMMENT ON FUNCTION public.rge_bulk_update_providers(JSONB) IS
  'Bulk UPDATE atomique des colonnes rge_* + phone/email conditionnels + '
  'dérivation automatique de rge_categories_decret via '
  'derive_rge_categories_from_qualif (migration 404). Signature publique '
  'inchangée depuis 389 — la colonne rge_categories_decret est calculée '
  'côté Postgres à partir du JSONB payload. Migration 406 (2026-04-11).';

-- -----------------------------------------------------------------------------
-- Rattrapage ciblé : providers ingérés entre 404 et 406 avec qualifs actives
-- mais rge_categories_decret vide (la migration 404 n'a couvert que l'état
-- au moment de son exécution). Idempotent : ne touche que les lignes à
-- cardinality 0 qui ont au moins une qualif non-vide.
-- -----------------------------------------------------------------------------

UPDATE public.providers p
   SET rge_categories_decret = COALESCE(
     (
       SELECT array_agg(DISTINCT cat ORDER BY cat)
         FROM (
           SELECT unnest(
                    derive_rge_categories_from_qualif(
                      qual->>'domaine',
                      qual->>'meta_domaine'
                    )
                  ) AS cat
             FROM jsonb_array_elements(p.rge_qualifications) AS qual
            WHERE (
              qual->>'date_fin' IS NULL
              OR length(qual->>'date_fin') < 10
              OR substring(qual->>'date_fin', 1, 10) >= to_char(now(), 'YYYY-MM-DD')
            )
         ) AS cats
        WHERE cat IS NOT NULL
     ),
     ARRAY[]::INT[]
   )
 WHERE cardinality(p.rge_categories_decret) = 0
   AND p.rge_qualifications IS NOT NULL
   AND jsonb_typeof(p.rge_qualifications) = 'array'
   AND jsonb_array_length(p.rge_qualifications) > 0;
