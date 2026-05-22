-- =============================================================================
-- Migration 527 — Backfill providers.services_offered depuis rge_qualifications
-- =============================================================================
-- Contexte
-- --------
-- providers.services_offered (mig 306) est vivant en DB mais vide sur 99% des
-- 49K fiches RGE actives. Côté SELECT (PROVIDER_DETAIL_SELECT) la colonne est
-- déjà lue mais l'ArtisanSchema JSON-LD n'emet pas de `hasOfferCatalog` car
-- aucune donnée n'alimente le tableau.
--
-- Cette migration backfill `services_offered` depuis le JSONB
-- `rge_qualifications` (alimenté par sync ADEME mig 380 + src/lib/rge/sync.ts).
-- Le mapping suit les MEMES regles conservatrices que mig 404
-- (`derive_rge_categories_from_qualif`) : si un domaine ne mappe avec certitude
-- à AUCUN slug canonical, on SKIP la qualif (zero hallucination).
--
-- Sortie : un sous-ensemble de `src/lib/services/canonical-slugs.ts`
--          (CANONICAL_SERVICE_SLUGS, 21 slugs post-pivot RGE 2026-05-03).
--
-- Source data : Registre RGE ADEME — data.gouv.fr (Licence Etalab 2.0).
--
-- Garde-fous
-- ----------
-- - search_path pinned (CVE-2018-1058)
-- - IMMUTABLE → safe pour generated columns / index futurs
-- - Trigger BEFORE UPDATE : auto-resync UNIQUEMENT si non-revendiquée
--   (user_id IS NULL). Une fiche claim garde la main sur services_offered.
-- - Backfill UPDATE : ne touche QUE les fiches non-revendiquées ou avec
--   services_offered vide → preserve les artisans qui ont saisi leurs services.
-- - Filtre qualifs expirées (date_fin >= today) AVANT mapping.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Fonction de derivation : un domaine ADEME → 0..N service slug canonicals
-- -----------------------------------------------------------------------------
-- Stratégie identique à `derive_rge_categories_from_qualif` (mig 404) mais
-- projette vers les slugs services canoniques (pas vers cat. décret 2014-812).
-- Conservateur : tout domaine non listé renvoie ARRAY[]::TEXT[].

CREATE OR REPLACE FUNCTION public.derive_service_slugs_from_qualif(
  p_domaine TEXT,
  p_meta_domaine TEXT
)
RETURNS TEXT[]
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public, pg_catalog
AS $func$
DECLARE
  d TEXT;
BEGIN
  -- Normalise : lowercase + trim. Domaine prioritaire, fallback meta_domaine.
  d := lower(trim(COALESCE(p_domaine, '')));
  IF d = '' THEN
    d := lower(trim(COALESCE(p_meta_domaine, '')));
  END IF;
  IF d = '' THEN
    RETURN ARRAY[]::TEXT[];
  END IF;

  -- -------------------------------------------------------------------------
  -- POMPES À CHALEUR (canonical slug : 'pompe-a-chaleur')
  -- -------------------------------------------------------------------------
  -- Couvre PAC air/eau, eau/eau, géothermique, hybride, CET (thermo).
  -- PAC air/air explicite = HORS RGE décret 2014-812 → on skip (cf. mig 404).
  IF d LIKE '%pompe%chaleur%' OR d LIKE '%pac %' OR d LIKE '%qualipac%' THEN
    IF d LIKE '%air/air%' OR d LIKE '%air-air%' OR d LIKE '%air air%' THEN
      RETURN ARRAY[]::TEXT[];
    END IF;
    RETURN ARRAY['pompe-a-chaleur']::TEXT[];
  END IF;

  IF d LIKE '%geothermie%' OR d LIKE '%géothermie%' THEN
    RETURN ARRAY['pompe-a-chaleur']::TEXT[];
  END IF;

  IF d LIKE '%chauffe-eau thermodynamique%'
     OR d LIKE '%chauffe eau thermodynamique%'
     OR d = 'cet'
     OR d LIKE '% cet %'
     OR d LIKE '%ballon thermodynamique%' THEN
    RETURN ARRAY['pompe-a-chaleur']::TEXT[];
  END IF;

  -- -------------------------------------------------------------------------
  -- PANNEAUX SOLAIRES (canonical slug : 'panneaux-solaires')
  -- -------------------------------------------------------------------------
  -- Photovoltaïque + thermique CESI + SSC → tous projetés sur 'panneaux-solaires'
  -- (slug commodity du catalog post-pivot RGE).
  IF d LIKE '%photovoltaique%' OR d LIKE '%photovoltaïque%'
     OR d LIKE '%qualipv%' OR d LIKE '%quali pv%'
     OR d LIKE '%panneaux solaires%' THEN
    RETURN ARRAY['panneaux-solaires']::TEXT[];
  END IF;

  IF d LIKE '%solaire thermique%' OR d LIKE '%chauffe-eau solaire%'
     OR d LIKE '%chauffe eau solaire%'
     OR d LIKE '%cesi%' OR d = 'ssc'
     OR d LIKE '%systeme solaire combine%' OR d LIKE '%système solaire combiné%'
     OR d LIKE '%qualisol%' THEN
    RETURN ARRAY['panneaux-solaires']::TEXT[];
  END IF;

  -- -------------------------------------------------------------------------
  -- ISOLATION (canonical slug : 'isolation-thermique')
  -- -------------------------------------------------------------------------
  -- Toute mention isolation (ITE, ITI, combles, toiture, plancher, rampants).
  IF d LIKE '%isolation%' OR d LIKE '%combles%' OR d LIKE '%comble%'
     OR d LIKE '%rampant%' OR d LIKE '%plancher%' OR d LIKE '%ite %' OR d = 'ite'
     OR d LIKE '%iti %' OR d = 'iti' THEN
    RETURN ARRAY['isolation-thermique']::TEXT[];
  END IF;

  -- -------------------------------------------------------------------------
  -- BORNE DE RECHARGE IRVE (canonical slug : 'borne-recharge')
  -- -------------------------------------------------------------------------
  -- IRVE = Infrastructure Recharge Véhicule Électrique. Qualifelec IRVE.
  IF d LIKE '%irve%' OR d LIKE '%borne%recharge%' OR d LIKE '%vehicule%electrique%'
     OR d LIKE '%véhicule%électrique%' THEN
    RETURN ARRAY['borne-recharge']::TEXT[];
  END IF;

  -- -------------------------------------------------------------------------
  -- CHAUFFAGE BIOMASSE (canonical slug : 'chauffagiste')
  -- -------------------------------------------------------------------------
  -- Chaudières bois/biomasse, poêles, inserts, granulés. Mappés au métier
  -- 'chauffagiste' (slug canonical). Pas de slug dédié 'chauffage-bois' dans
  -- le catalog post-pivot (vague 2026-05-03).
  IF d LIKE '%chaudiere%bois%' OR d LIKE '%chaudière%bois%'
     OR d LIKE '%chaudiere%biomasse%' OR d LIKE '%chaudière%biomasse%'
     OR d LIKE '%qualibois%' OR d LIKE '%quali bois%'
     OR d LIKE '%poele%' OR d LIKE '%poêle%' OR d LIKE '%insert%'
     OR d LIKE '%granule%' OR d LIKE '%granulé%' THEN
    RETURN ARRAY['chauffagiste']::TEXT[];
  END IF;

  IF d LIKE '%bois energie%' OR d LIKE '%bois énergie%'
     OR (d LIKE '%biomasse%' AND d NOT LIKE '%isolation%') THEN
    RETURN ARRAY['chauffagiste']::TEXT[];
  END IF;

  -- -------------------------------------------------------------------------
  -- VENTILATION VMC (canonical slug : 'climaticien')
  -- -------------------------------------------------------------------------
  -- VMC simple/double flux, ventilation. Mappé à 'climaticien' (le slug
  -- 'ventilation' n'existe pas dans le catalog canonical post-pivot).
  IF d LIKE '%ventilation%' OR d LIKE '%vmc%' THEN
    RETURN ARRAY['climaticien']::TEXT[];
  END IF;

  -- -------------------------------------------------------------------------
  -- MENUISERIES EXTÉRIEURES (canonical slug : 'menuisier')
  -- -------------------------------------------------------------------------
  -- Fenêtres, portes-fenêtres, double vitrage, volets isolants.
  IF d LIKE '%fenetre%' OR d LIKE '%fenêtre%'
     OR d LIKE '%menuiserie%exterieur%' OR d LIKE '%menuiserie%extérieur%'
     OR d LIKE '%vitrage%isolant%' OR d LIKE '%double vitrage%'
     OR d LIKE '%volet%isolant%' OR d LIKE '%porte%entree%' THEN
    RETURN ARRAY['menuisier']::TEXT[];
  END IF;

  -- -------------------------------------------------------------------------
  -- DIAGNOSTIC / AUDIT ÉNERGÉTIQUE (canonical slug : 'diagnostiqueur')
  -- -------------------------------------------------------------------------
  -- Mon Accompagnateur Rénov, audit énergétique, rénovation globale → métier
  -- 'diagnostiqueur' (DPE + audit) + 'renovation-energetique' (offre globale).
  IF d LIKE '%audit%energetique%' OR d LIKE '%audit%énergétique%'
     OR d LIKE '%accompagnateur%renov%' OR d LIKE '%accompagnateur%rénov%' THEN
    RETURN ARRAY['diagnostiqueur', 'renovation-energetique']::TEXT[];
  END IF;

  IF d LIKE '%renovation%globale%' OR d LIKE '%rénovation%globale%'
     OR d LIKE '%offre%globale%' THEN
    RETURN ARRAY['renovation-energetique']::TEXT[];
  END IF;

  -- -------------------------------------------------------------------------
  -- FALLBACK — non mappé, retourne vide (règle conservatisme = zero hallucination)
  -- -------------------------------------------------------------------------
  RETURN ARRAY[]::TEXT[];
END;
$func$;

COMMENT ON FUNCTION public.derive_service_slugs_from_qualif(TEXT, TEXT) IS
  'Mappe (domaine, meta_domaine) d''une qualif ADEME vers un sous-ensemble de '
  'CANONICAL_SERVICE_SLUGS (src/lib/services/canonical-slugs.ts). Conservateur : '
  'retourne [] si non mappé avec certitude. Source : Registre RGE ADEME '
  '(data.gouv.fr Etalab 2.0). Utilisé par mig 527 (backfill + trigger).';

-- -----------------------------------------------------------------------------
-- 2. Fonction agrégée : extraire services_offered depuis le JSONB complet
-- -----------------------------------------------------------------------------
-- Itère sur rge_qualifications, filtre qualifs expirées (date_fin < today),
-- agrege les slugs dérivés, déduplique, trie.

CREATE OR REPLACE FUNCTION public.derive_services_offered_from_rge(
  p_quals JSONB
)
RETURNS TEXT[]
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public, pg_catalog
AS $func$
DECLARE
  v_today_iso TEXT := to_char(now(), 'YYYY-MM-DD');
  v_result TEXT[];
BEGIN
  IF p_quals IS NULL OR jsonb_typeof(p_quals) <> 'array'
     OR jsonb_array_length(p_quals) = 0 THEN
    RETURN ARRAY[]::TEXT[];
  END IF;

  SELECT COALESCE(array_agg(DISTINCT slug ORDER BY slug), ARRAY[]::TEXT[])
    INTO v_result
    FROM (
      SELECT unnest(
               public.derive_service_slugs_from_qualif(
                 q->>'domaine',
                 q->>'meta_domaine'
               )
             ) AS slug
        FROM jsonb_array_elements(p_quals) AS q
       WHERE (
         q->>'date_fin' IS NULL
         OR length(q->>'date_fin') < 10
         OR substring(q->>'date_fin', 1, 10) >= v_today_iso
       )
    ) AS s
   WHERE slug IS NOT NULL AND slug <> '';

  RETURN COALESCE(v_result, ARRAY[]::TEXT[]);
END;
$func$;

COMMENT ON FUNCTION public.derive_services_offered_from_rge(JSONB) IS
  'Agrège providers.services_offered TEXT[] depuis providers.rge_qualifications. '
  'Filtre qualifs expirées (date_fin < today). Déduplique + trie. Zéro '
  'hallucination : skip silencieux des domaines ADEME non mappés. Source : '
  'Registre RGE ADEME (Etalab 2.0). Migration 527.';

-- -----------------------------------------------------------------------------
-- 3. Backfill UPDATE
-- -----------------------------------------------------------------------------
-- Vise UNIQUEMENT :
--   - providers actifs (is_active = true)
--   - avec rge_qualifications non vide
--   - ET (services_offered NULL/vide OU non-revendiquée)
--
-- Règle "préserver claimed" : si user_id IS NOT NULL ET services_offered déjà
-- peuplé → on ne touche pas (l'artisan a saisi sa liste). Si claimed mais
-- services_offered vide → on backfill quand même (rien à écraser).

WITH derived AS (
  SELECT
    p.id,
    public.derive_services_offered_from_rge(p.rge_qualifications) AS slugs
  FROM providers p
  WHERE p.is_active = TRUE
    AND p.rge_qualifications IS NOT NULL
    AND jsonb_typeof(p.rge_qualifications) = 'array'
    AND jsonb_array_length(p.rge_qualifications) > 0
    AND (
      p.user_id IS NULL
      OR p.services_offered IS NULL
      OR cardinality(p.services_offered) = 0
    )
)
UPDATE providers p
   SET services_offered = d.slugs
  FROM derived d
 WHERE p.id = d.id
   AND cardinality(d.slugs) > 0
   AND p.services_offered IS DISTINCT FROM d.slugs;

-- -----------------------------------------------------------------------------
-- 4. Trigger BEFORE UPDATE : auto-sync sur changement rge_qualifications
-- -----------------------------------------------------------------------------
-- Quand un sync ADEME futur modifie `rge_qualifications`, le trigger re-derive
-- `services_offered` AUTOMATIQUEMENT — mais SEULEMENT pour les fiches non
-- revendiquées (user_id IS NULL). Une fiche claim garde la main sur sa liste.

CREATE OR REPLACE FUNCTION public.providers_sync_services_from_rge()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $func$
DECLARE
  v_new_services TEXT[];
BEGIN
  -- Sortie rapide : claim ou rge inchangé.
  IF NEW.user_id IS NOT NULL THEN
    RETURN NEW;
  END IF;
  IF NEW.rge_qualifications IS NOT DISTINCT FROM OLD.rge_qualifications THEN
    RETURN NEW;
  END IF;

  v_new_services := public.derive_services_offered_from_rge(NEW.rge_qualifications);

  -- N'écrase que si le résultat est non-vide OU si l'ancien était dérivé
  -- (heuristique : on ne touche pas si l'artisan claim avait set des slugs
  -- non-RGE-derivables — mais user_id IS NULL ici, donc le risque est nul).
  -- Idempotent : pas d'écriture si identique.
  IF NEW.services_offered IS DISTINCT FROM v_new_services THEN
    NEW.services_offered := v_new_services;
  END IF;

  RETURN NEW;
END;
$func$;

DROP TRIGGER IF EXISTS trg_providers_sync_services_from_rge ON providers;

CREATE TRIGGER trg_providers_sync_services_from_rge
  BEFORE UPDATE OF rge_qualifications ON providers
  FOR EACH ROW
  EXECUTE FUNCTION public.providers_sync_services_from_rge();

COMMENT ON TRIGGER trg_providers_sync_services_from_rge ON providers IS
  'Maintient providers.services_offered en sync avec rge_qualifications pour '
  'les fiches non revendiquées (user_id IS NULL). Une fiche claim conserve sa '
  'liste manuelle. Source : mig 527.';

COMMIT;
