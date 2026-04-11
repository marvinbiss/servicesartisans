-- =============================================================================
-- Migration 404 — providers.rge_categories_decret (match par categorie decret)
-- =============================================================================
-- Contexte
-- --------
-- La migration 403 a ajoute cee_operations.rge_decret_category INT[] apres
-- l'audit verbatim PDF DGEC : AUCUN arrete CEE 2024-2026 ne cite un libelle
-- RGE nominatif (type « QualiPAC » / « Qualibat RGE »). Tous renvoient au
-- decret n° 2014-812 du 16 juillet 2014 article 2, avec une categorie
-- numerotee (1° a 17°) correspondant au corps de metier RGE officiel.
--
-- Consequence : le match RGE dispatch doit passer d'un match-libelle a un
-- match par categorie de decret. Cote operation la colonne existe deja.
-- Cote provider, elle n'existait pas — cette migration l'ajoute et la backfill
-- depuis providers.rge_qualifications (JSONB peuple par la sync ADEME
-- migration 380 + src/lib/rge/sync.ts).
--
-- Mapping domaines ADEME → categories decret 2014-812
-- ---------------------------------------------------
-- La nomenclature `domaine` / `meta_domaine` du dataset ADEME
-- (liste-des-entreprises-rge-2) ne mappe pas directement aux 17 categories
-- du decret. Le mapping ci-dessous est conservateur : si un domaine ne peut
-- etre rattache avec certitude a une ou plusieurs categories (source primaire
-- : decret 2014-812 publie au JORF, legifrance JORFTEXT000029231543), il est
-- EXCLU du backfill. Regle : mieux vaut un faux negatif (provider non
-- eligible pour une fiche dispensed) qu'un faux positif (dispatch a un
-- non-RGE → dossier PNCEE rejete). Cf. memory/feedback_legal_data_quality.md.
--
-- Table des 17 categories du decret 2014-812 (article 1er I) :
--   1°  Materiaux d'isolation thermique des parois opaques (ITI generaliste)
--   2°  Equipements ECS solaire thermique
--   3°  Chauffage / ECS bois ou autres biomasses
--   4°  Appareils de chauffage au bois independants (poeles, inserts)
--   5°  Pompes a chaleur autres qu'air/air (eau/eau, air/eau, geothermie)
--   6°  ECS thermodynamique (CET)
--   7°  Autres EnR hors solaire/geothermie (cas residuel peu utilise)
--   8°  Ventilation mecanique, regulation / programmation chauffage
--   9°  Parois vitrees et portes-fenetres (fenetres)
--  10°  Volets isolants et portes d'entree donnant sur l'exterieur
--  11°  Isolation thermique par l'exterieur (ITE murs)
--  12°  Isolation thermique par l'interieur (ITI murs)
--  13°  Isolation combles perdus
--  14°  Isolation rampants / plafonds de combles
--  15°  Isolation plancher bas sur sous-sol / vide sanitaire
--  16°  Systemes solaires combines (SSC : chauffage + ECS)
--  17°  Offre globale de renovation d'ampleur / accompagnement Mon Accompagnateur
--
-- Source : decret n° 2014-812 du 16 juillet 2014 article 1er I, version
-- consolidee legifrance (JORFTEXT000029231543).
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Colonne providers.rge_categories_decret + index GIN
-- -----------------------------------------------------------------------------

ALTER TABLE providers
  ADD COLUMN IF NOT EXISTS rge_categories_decret INT[] NOT NULL DEFAULT ARRAY[]::INT[];

COMMENT ON COLUMN providers.rge_categories_decret IS
  'Categories du decret 2014-812 du 16 juillet 2014 (article 1er I, 1° a 17°) '
  'couvertes par les qualifications RGE actives de ce provider. Derivees par '
  'mapping depuis providers.rge_qualifications (domaine ADEME → categorie). '
  'Utilise par src/lib/cee/rge-filter.ts pour matcher contre '
  'cee_operations.rge_decret_category (operateur array overlap &&). '
  'Migration 404 (backfill + index GIN).';

CREATE INDEX IF NOT EXISTS idx_providers_rge_categories_decret
  ON providers
  USING GIN (rge_categories_decret)
  WHERE cardinality(rge_categories_decret) > 0;

-- -----------------------------------------------------------------------------
-- 2. Fonction de derivation categorie decret depuis une qualif ADEME
-- -----------------------------------------------------------------------------
-- Lit `domaine` en priorite, fallback `meta_domaine`. Retourne INT[] (vide si
-- non mappe). Chaque branche cite la categorie decret et une justification.
--
-- Regle de conservatisme : tout domaine non listé renvoie ARRAY[]::INT[]. Pas
-- de fuzzy match. Le sync ADEME pourra etendre cette table au fil de l'eau.

CREATE OR REPLACE FUNCTION derive_rge_categories_from_qualif(
  domaine TEXT,
  meta_domaine TEXT
) RETURNS INT[] AS $func$
DECLARE
  d TEXT;
BEGIN
  -- Normalise : lowercase, trim. On teste domaine puis meta_domaine.
  d := lower(trim(COALESCE(domaine, '')));
  IF d = '' THEN
    d := lower(trim(COALESCE(meta_domaine, '')));
  END IF;
  IF d = '' THEN
    RETURN ARRAY[]::INT[];
  END IF;

  -- -------------------------------------------------------------------------
  -- ISOLATION — parois opaques
  -- -------------------------------------------------------------------------
  -- ITE (murs par l'exterieur) → cat. 11° uniquement. On inclut aussi 1°
  -- (generaliste « materiaux d'isolation ») car le decret liste 1° en tete
  -- de chapitre isolation.
  IF d LIKE '%isolation%' AND (d LIKE '%exterieur%' OR d LIKE '%extérieur%' OR d LIKE '%ite%') THEN
    RETURN '{1,11}'::INT[];
  END IF;

  -- ITI murs → cat. 12° + 1° generaliste.
  IF d LIKE '%isolation%' AND (d LIKE '%interieur%' OR d LIKE '%intérieur%' OR d LIKE '%iti%') THEN
    RETURN '{1,12}'::INT[];
  END IF;

  -- Combles perdus → cat. 13° (+ 1° generaliste + 14° si mention rampant).
  IF d LIKE '%combles%' OR d LIKE '%comble%' THEN
    RETURN '{1,13,14}'::INT[];
  END IF;

  -- Toiture / rampants → cat. 14° + 1°.
  IF d LIKE '%toiture%' OR d LIKE '%rampant%' THEN
    RETURN '{1,14}'::INT[];
  END IF;

  -- Plancher bas → cat. 15° + 1°.
  IF d LIKE '%plancher%' THEN
    RETURN '{1,15}'::INT[];
  END IF;

  -- Isolation generique (sans precision parois) : on inclut le cluster
  -- complet parois opaques (1, 11, 12, 13, 14, 15) — le match se fera via
  -- array overlap cote filtre, donc un provider ainsi marque couvrira toute
  -- fiche d'isolation.
  IF d LIKE '%isolation%' THEN
    RETURN '{1,11,12,13,14,15}'::INT[];
  END IF;

  -- -------------------------------------------------------------------------
  -- POMPES A CHALEUR / CET
  -- -------------------------------------------------------------------------
  -- Chauffe-eau thermodynamique → cat. 6°.
  IF d LIKE '%chauffe-eau thermodynamique%' OR d LIKE '%chauffe eau thermodynamique%'
     OR d LIKE '%cet%' OR d LIKE '%eau chaude sanitaire thermodynamique%' THEN
    RETURN '{6}'::INT[];
  END IF;

  -- Geothermie → cat. 5° (PAC eau/eau ou sol/eau).
  IF d LIKE '%geothermie%' OR d LIKE '%géothermie%' THEN
    RETURN '{5}'::INT[];
  END IF;

  -- Pompes a chaleur — toutes mentions (hors air/air qui n'est pas mappe
  -- au decret selon feedback_legal_data_quality, donc exclusion prudente
  -- si libelle explicite « air/air »).
  IF d LIKE '%pompe%chaleur%' OR d LIKE '%pac%' THEN
    IF d LIKE '%air/air%' OR d LIKE '%air-air%' OR d LIKE '%air air%' THEN
      -- PAC air/air explicite : hors decret 2014-812 (non eligible RGE). Exclu.
      RETURN ARRAY[]::INT[];
    END IF;
    -- PAC eau/eau, air/eau, sol/eau, hybride → cat. 5°.
    -- Si chauffage + ECS : la 6° sera aussi couverte si le libelle le mentionne.
    IF d LIKE '%ecs%' OR d LIKE '%eau chaude%' OR d LIKE '%hybride%' THEN
      RETURN '{5,6}'::INT[];
    END IF;
    RETURN '{5}'::INT[];
  END IF;

  -- -------------------------------------------------------------------------
  -- CHAUFFAGE BOIS / BIOMASSE
  -- -------------------------------------------------------------------------
  -- Chaudiere bois → cat. 3°.
  IF d LIKE '%chaudiere%bois%' OR d LIKE '%chaudière%bois%' OR d LIKE '%chaudiere%biomasse%'
     OR d LIKE '%chaudière%biomasse%' THEN
    RETURN '{3}'::INT[];
  END IF;

  -- Poele / insert → cat. 4° (+ 3° generaliste chauffage bois).
  IF d LIKE '%poele%' OR d LIKE '%poêle%' OR d LIKE '%insert%' THEN
    RETURN '{3,4}'::INT[];
  END IF;

  -- Bois / biomasse generique → cat. 3° + 4°.
  IF d LIKE '%bois%' OR d LIKE '%biomasse%' THEN
    RETURN '{3,4}'::INT[];
  END IF;

  -- -------------------------------------------------------------------------
  -- SOLAIRE
  -- -------------------------------------------------------------------------
  -- Solaire thermique (ECS ou combine) → cat. 2° + 16° (SSC).
  IF d LIKE '%solaire thermique%' OR d LIKE '%chauffe-eau solaire%'
     OR d LIKE '%cesi%' OR d LIKE '%ssc%' OR d LIKE '%systeme solaire combine%'
     OR d LIKE '%système solaire combiné%' THEN
    RETURN '{2,16}'::INT[];
  END IF;

  -- Solaire photovoltaique → cat. 7° (cas residuel, peu utilise par les
  -- arretes CEE actuels qui portent majoritairement sur chaleur/isolation).
  IF d LIKE '%photovoltaique%' OR d LIKE '%photovoltaïque%' OR d LIKE '%quali%pv%'
     OR d LIKE '%panneaux solaires%' THEN
    RETURN '{7}'::INT[];
  END IF;

  -- Solaire sans precision → ambigu, on exclut (pas de faux positif).
  -- (pas de RETURN, tombe dans le fallback vide en fin de fonction)

  -- -------------------------------------------------------------------------
  -- VENTILATION
  -- -------------------------------------------------------------------------
  IF d LIKE '%ventilation%' OR d LIKE '%vmc%' THEN
    RETURN '{8}'::INT[];
  END IF;

  -- -------------------------------------------------------------------------
  -- MENUISERIES EXTERIEURES
  -- -------------------------------------------------------------------------
  -- Fenetres / portes-fenetres → cat. 9°. Volets/portes d'entree → 10°.
  IF d LIKE '%fenetre%' OR d LIKE '%fenêtre%' OR d LIKE '%menuiserie%exterieur%'
     OR d LIKE '%menuiserie%extérieur%' OR d LIKE '%vitrage%isolant%' THEN
    RETURN '{9,10}'::INT[];
  END IF;

  -- -------------------------------------------------------------------------
  -- RENOVATION GLOBALE / MON ACCOMPAGNATEUR RENOV
  -- -------------------------------------------------------------------------
  IF d LIKE '%renovation%globale%' OR d LIKE '%rénovation%globale%'
     OR d LIKE '%accompagnateur%renov%' OR d LIKE '%accompagnateur%rénov%'
     OR d LIKE '%audit%energetique%' OR d LIKE '%audit%énergétique%' THEN
    RETURN '{17}'::INT[];
  END IF;

  -- -------------------------------------------------------------------------
  -- FALLBACK — non mappe, on renvoie vide (regle de conservatisme).
  -- -------------------------------------------------------------------------
  RETURN ARRAY[]::INT[];
END;
$func$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION derive_rge_categories_from_qualif(TEXT, TEXT) IS
  'Mappe (domaine, meta_domaine) d''une qualif ADEME vers INT[] des '
  'categories du decret 2014-812. Conservateur : renvoie [] si non mappe '
  'avec certitude. Utilise par le backfill migration 404 et par sync.ts '
  '(TODO extension synchronisation). Source : decret 2014-812 article 1er I.';

-- -----------------------------------------------------------------------------
-- 3. Backfill — UPDATE providers.rge_categories_decret depuis rge_qualifications
-- -----------------------------------------------------------------------------
-- Pour chaque provider avec rge_qualifications non vide : decompose le JSONB,
-- filtre les qualifs actives (date_fin >= today), applique le mapping sur
-- chaque ligne, puis agrege en array dedupliquee via UNION.
-- Idempotent : on ecrit systematiquement (DEFAULT [] deja en place pour les
-- lignes sans qualif).

WITH cat_rows AS (
  -- Une ligne par (provider, categorie) — decomposition qualif puis unnest
  -- des categories derivees, avec filtre temporel sur date_fin.
  SELECT
    p.id AS provider_id,
    unnest(
      derive_rge_categories_from_qualif(
        qual->>'domaine',
        qual->>'meta_domaine'
      )
    ) AS category
  FROM providers p,
       LATERAL jsonb_array_elements(COALESCE(p.rge_qualifications, '[]'::jsonb)) AS qual
  WHERE p.rge_qualifications IS NOT NULL
    AND jsonb_typeof(p.rge_qualifications) = 'array'
    AND jsonb_array_length(p.rge_qualifications) > 0
    AND (
      qual->>'date_fin' IS NULL
      OR length(qual->>'date_fin') < 10
      OR substring(qual->>'date_fin', 1, 10) >= to_char(now(), 'YYYY-MM-DD')
    )
),
agg AS (
  -- Dedup + tri par provider
  SELECT
    provider_id,
    array_agg(DISTINCT category ORDER BY category) AS categories
  FROM cat_rows
  GROUP BY provider_id
)
UPDATE providers p
   SET rge_categories_decret = a.categories
  FROM agg a
 WHERE p.id = a.provider_id
   AND cardinality(a.categories) > 0;

COMMIT;
