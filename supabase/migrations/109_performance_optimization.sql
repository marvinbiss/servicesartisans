-- =============================================================================
-- Migration 109 : Optimisation des performances et integrite des donnees
-- ServicesArtisans -- 2026-02-09
-- =============================================================================
-- Cette migration :
--   1. Index manquants pour les requetes courantes
--   2. Contraintes d'unicite sur SIREN/SIRET
--   3. Vues materialisees pour les compteurs
--   4. Contraintes CHECK manquantes
-- =============================================================================

-- =============================================================================
-- 1. INDEX MANQUANTS SUR providers
-- =============================================================================

-- Specialite (filtre le plus courant dans toutes les recherches)
CREATE INDEX IF NOT EXISTS idx_providers_specialty
  ON providers (specialty)
  WHERE specialty IS NOT NULL;

-- Specialite + Ville (page hub /services/{metier}/{ville})
CREATE INDEX IF NOT EXISTS idx_providers_specialty_city_active
  ON providers (specialty, address_city)
  WHERE is_active = TRUE;

-- Departement + Specialite (enrichissement + pages departement)
CREATE INDEX IF NOT EXISTS idx_providers_dept_specialty
  ON providers (address_department, specialty)
  WHERE is_active = TRUE;

-- Departement + is_artisan (scripts enrich-pappers, enrich-phone)
CREATE INDEX IF NOT EXISTS idx_providers_dept_artisan
  ON providers (address_department)
  WHERE is_artisan = TRUE AND is_active = TRUE;

-- Ville + Note (API /api/providers/by-city : tri par rating_average)
CREATE INDEX IF NOT EXISTS idx_providers_city_rating
  ON providers (address_city, rating_average DESC NULLS LAST)
  WHERE is_active = TRUE AND latitude IS NOT NULL AND longitude IS NOT NULL;

-- Sitemap : noindex=false, is_active=true, tri updated_at
CREATE INDEX IF NOT EXISTS idx_providers_sitemap
  ON providers (updated_at DESC)
  WHERE is_active = TRUE AND noindex = FALSE;

-- Enrichissement : data_quality_score = 0 (scoring de qualite)
CREATE INDEX IF NOT EXISTS idx_providers_quality_zero
  ON providers (id)
  WHERE data_quality_score = 0 AND is_artisan = TRUE;

-- Date de radiation (entreprises radiees)
CREATE INDEX IF NOT EXISTS idx_providers_radiated
  ON providers (date_radiation)
  WHERE date_radiation IS NOT NULL;

-- =============================================================================
-- 2. CONTRAINTES D'UNICITE SUR SIREN / SIRET
-- =============================================================================
-- Index uniques partiels (WHERE IS NOT NULL AND != '') pour ne pas bloquer
-- les enregistrements sans SIREN/SIRET.

DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_providers_siren_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_providers_siren_unique
      ON providers (siren)
      WHERE siren IS NOT NULL AND siren != '';
  END IF;
END $do$;

DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_providers_siret_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_providers_siret_unique
      ON providers (siret)
      WHERE siret IS NOT NULL AND siret != '';
  END IF;
END $do$;

-- =============================================================================
-- 3. INDEX POUR LES TABLES DE COLLECTION (migration 108)
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_import_jobs_running
  ON import_jobs (job_type)
  WHERE status = 'running';

CREATE INDEX IF NOT EXISTS idx_provider_financials_provider_year
  ON provider_financials (provider_id, annee DESC);

-- =============================================================================
-- 4. VUES MATERIALISEES -- Compteurs artisans
-- =============================================================================
-- Evite de scanner 332K+ lignes a chaque requete de comptage.
-- Rafraichir avec SELECT refresh_artisan_stats() apres collecte/enrichissement.

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_artisan_counts_by_dept AS
  SELECT
    address_department AS department,
    specialty,
    COUNT(*)::INTEGER AS artisan_count,
    COUNT(*) FILTER (WHERE is_verified = TRUE)::INTEGER AS verified_count,
    ROUND(AVG(rating_average)::numeric, 1) AS avg_rating,
    SUM(review_count)::INTEGER AS total_reviews
  FROM providers
  WHERE is_active = TRUE
    AND address_department IS NOT NULL
    AND specialty IS NOT NULL
  GROUP BY address_department, specialty
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_artisan_counts_dept_spec
  ON mv_artisan_counts_by_dept (department, specialty);

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_artisan_counts_by_city AS
  SELECT
    address_city AS city,
    address_department AS department,
    COUNT(*)::INTEGER AS artisan_count,
    COUNT(*) FILTER (WHERE is_verified = TRUE)::INTEGER AS verified_count,
    COUNT(DISTINCT specialty)::INTEGER AS specialty_count,
    ROUND(AVG(rating_average)::numeric, 1) AS avg_rating
  FROM providers
  WHERE is_active = TRUE
    AND address_city IS NOT NULL
  GROUP BY address_city, address_department
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_artisan_counts_city_dept
  ON mv_artisan_counts_by_city (city, department);

CREATE INDEX IF NOT EXISTS idx_mv_artisan_counts_city_count
  ON mv_artisan_counts_by_city (artisan_count DESC);

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_artisan_counts_by_region AS
  SELECT
    address_region AS region,
    COUNT(*)::INTEGER AS artisan_count,
    COUNT(*) FILTER (WHERE is_verified = TRUE)::INTEGER AS verified_count,
    COUNT(DISTINCT specialty)::INTEGER AS specialty_count,
    COUNT(DISTINCT address_department)::INTEGER AS dept_count,
    COUNT(DISTINCT address_city)::INTEGER AS city_count,
    ROUND(AVG(rating_average)::numeric, 1) AS avg_rating
  FROM providers
  WHERE is_active = TRUE
    AND address_region IS NOT NULL
  GROUP BY address_region
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_artisan_counts_region
  ON mv_artisan_counts_by_region (region);

-- =============================================================================
-- 5. FONCTION DE RAFRAICHISSEMENT
-- =============================================================================

CREATE OR REPLACE FUNCTION refresh_artisan_stats()
RETURNS VOID AS $fn$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_artisan_counts_by_dept;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_artisan_counts_by_city;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_artisan_counts_by_region;
END;
$fn$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 6. VUE SIMPLE -- Stats publiques globales (/api/stats/public)
-- =============================================================================

CREATE OR REPLACE VIEW v_public_stats AS
  SELECT
    COUNT(*)::INTEGER AS total_artisans,
    COUNT(*) FILTER (WHERE is_verified = TRUE)::INTEGER AS total_verified,
    COUNT(*) FILTER (WHERE is_artisan = TRUE)::INTEGER AS total_artisans_cma,
    COUNT(DISTINCT address_department)::INTEGER AS total_departments,
    COUNT(DISTINCT address_city)::INTEGER AS total_cities,
    COUNT(DISTINCT specialty)::INTEGER AS total_specialties,
    ROUND(AVG(rating_average)::numeric, 1) AS avg_rating,
    SUM(review_count)::INTEGER AS total_reviews
  FROM providers
  WHERE is_active = TRUE;

-- =============================================================================
-- 7. ACCES PUBLIC SUR LES VUES
-- =============================================================================

GRANT SELECT ON mv_artisan_counts_by_dept TO anon, authenticated;
GRANT SELECT ON mv_artisan_counts_by_city TO anon, authenticated;
GRANT SELECT ON mv_artisan_counts_by_region TO anon, authenticated;
GRANT SELECT ON v_public_stats TO anon, authenticated;

-- =============================================================================
-- 8. CONTRAINTES CHECK MANQUANTES
-- =============================================================================

-- data_quality_score : borner entre 0 et 100
DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'providers_data_quality_score_range'
  ) THEN
    ALTER TABLE providers ADD CONSTRAINT providers_data_quality_score_range
      CHECK (data_quality_score >= 0 AND data_quality_score <= 100);
  END IF;
END $do$;

-- rating_average : borner entre 0 et 5
DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'providers_rating_average_range'
  ) THEN
    ALTER TABLE providers ADD CONSTRAINT providers_rating_average_range
      CHECK (rating_average IS NULL OR (rating_average >= 0 AND rating_average <= 5));
  END IF;
END $do$;

-- review_count : doit etre >= 0
DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'providers_review_count_positive'
  ) THEN
    ALTER TABLE providers ADD CONSTRAINT providers_review_count_positive
      CHECK (review_count IS NULL OR review_count >= 0);
  END IF;
END $do$;

-- SIREN : exactement 9 caracteres numeriques (quand renseigne)
DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'providers_siren_format'
  ) THEN
    ALTER TABLE providers ADD CONSTRAINT providers_siren_format
      CHECK (siren IS NULL OR siren = '' OR siren ~ '^\d{9}$');
  END IF;
END $do$;

-- SIRET : exactement 14 caracteres numeriques (quand renseigne)
DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'providers_siret_format'
  ) THEN
    ALTER TABLE providers ADD CONSTRAINT providers_siret_format
      CHECK (siret IS NULL OR siret = '' OR siret ~ '^\d{14}$');
  END IF;
END $do$;

-- SIRET doit commencer par le SIREN correspondant
DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'providers_siret_starts_with_siren'
  ) THEN
    ALTER TABLE providers ADD CONSTRAINT providers_siret_starts_with_siren
      CHECK (
        siren IS NULL OR siret IS NULL
        OR siren = '' OR siret = ''
        OR left(siret, 9) = siren
      );
  END IF;
END $do$;

-- =============================================================================
-- 9. COMMENTAIRES
-- =============================================================================

COMMENT ON INDEX idx_providers_specialty IS
  'Filtre par specialite -- recherche artisan, sitemap, scripts enrichissement';
COMMENT ON INDEX idx_providers_specialty_city_active IS
  'Composite specialite+ville pour pages hub /services/{metier}/{ville}';
COMMENT ON INDEX idx_providers_dept_specialty IS
  'Composite departement+specialite pour enrichissement et pages departement';
COMMENT ON INDEX idx_providers_dept_artisan IS
  'Filtre artisans actifs par departement -- enrich-pappers, enrich-phone';
COMMENT ON INDEX idx_providers_city_rating IS
  'API /api/providers/by-city : filtre ville + tri par note + exige GPS';
COMMENT ON INDEX idx_providers_sitemap IS
  'Sitemap : artisans actifs et indexables tries par date de mise a jour';
COMMENT ON INDEX idx_providers_quality_zero IS
  'Scoring de qualite : artisans sans score calcule';
COMMENT ON INDEX idx_providers_radiated IS
  'Entreprises radiees -- maintenance et nettoyage des donnees';
COMMENT ON INDEX idx_providers_siren_unique IS
  'Unicite du SIREN -- empeche les doublons d entreprises';
COMMENT ON INDEX idx_providers_siret_unique IS
  'Unicite du SIRET -- empeche les doublons d etablissements';
COMMENT ON INDEX idx_import_jobs_running IS
  'Jobs en cours d execution';
COMMENT ON INDEX idx_provider_financials_provider_year IS
  'Donnees financieres les plus recentes en premier';

COMMENT ON MATERIALIZED VIEW mv_artisan_counts_by_dept IS
  'Compteurs agreges par departement et specialite';
COMMENT ON MATERIALIZED VIEW mv_artisan_counts_by_city IS
  'Compteurs agreges par ville';
COMMENT ON MATERIALIZED VIEW mv_artisan_counts_by_region IS
  'Compteurs agreges par region';
COMMENT ON VIEW v_public_stats IS
  'Statistiques publiques globales du site';
COMMENT ON FUNCTION refresh_artisan_stats IS
  'Rafraichit les 3 vues materialisees. A appeler apres collecte/enrichissement.';

COMMENT ON COLUMN providers.code_naf IS
  'Code NAF/APE a 5 caracteres (ex: 43.22A)';
COMMENT ON COLUMN providers.libelle_naf IS
  'Libelle en clair du code NAF';
COMMENT ON COLUMN providers.legal_form_code IS
  'Code de forme juridique INSEE (ex: 5710 = SAS)';
COMMENT ON COLUMN providers.capital IS
  'Capital social en euros';
COMMENT ON COLUMN providers.date_radiation IS
  'Date de radiation du registre';
COMMENT ON COLUMN providers.is_artisan IS
  'Indicateur artisan : derive du code NAF ou inscription CMA';
COMMENT ON COLUMN providers.source_api IS
  'Derniere API source (annuaire-entreprises, pappers, sirene)';
COMMENT ON COLUMN providers.derniere_maj_api IS
  'Horodatage de la derniere mise a jour depuis une API externe';
COMMENT ON COLUMN providers.data_quality_score IS
  'Score de qualite des donnees (0-100)';
COMMENT ON COLUMN providers.data_quality_flags IS
  'Drapeaux de qualite (JSON array) : missing_phone, missing_email, etc.';

-- =============================================================================
-- 10. ANALYZE
-- =============================================================================

ANALYZE providers;
ANALYZE import_jobs;
ANALYZE provider_directors;
ANALYZE provider_financials;

-- =============================================================================
-- TERMINE -- Migration 109 appliquee
-- =============================================================================
-- Resume :
--   - 9 nouveaux index sur providers (specialty, specialty+city, dept+specialty, etc.)
--   - 2 index uniques partiels (SIREN, SIRET)
--   - 3 vues materialisees (par dept, par ville, par region)
--   - 1 vue simple (stats publiques globales)
--   - 1 fonction refresh_artisan_stats()
--   - 6 contraintes CHECK (quality_score, rating, review_count, SIREN/SIRET format)
--   - Commentaires sur colonnes et index
-- =============================================================================
