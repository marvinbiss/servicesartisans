-- =============================================================================
-- Migration 310 : Table communes — 35K+ communes françaises
-- 2026-02-16
-- =============================================================================
-- Skill-audited with: supabase-postgres-best-practices, programmatic-seo
--
-- Stocke les données géographiques, démographiques et socio-économiques
-- de toutes les communes françaises (5K+ habitants). Source de données
-- pour 1.75M pages service+ville en programmatic SEO.
--
-- Design decisions (from skill audit):
--  1. PK = code_insee (text) — natural unique key, stable, human-readable,
--     no UUID fragmentation on 35K inserts (schema-primary-keys.md)
--  2. RLS: auth.uid() wrapped in (select ...) — called once, not per row
--     (security-rls-performance.md)
--  3. CHECK constraints on numeric ranges (schema-constraints.md)
--  4. Enrichment columns for unique content per page (programmatic-seo:
--     "Actual local data, not just city name swapped")
--  5. No redundant slug index — UNIQUE already creates one
--     (query-missing-indexes.md)
--  6. geography column for PostGIS KNN operator (query-index-types.md)
-- =============================================================================

-- PostGIS nécessaire pour calculs de distance (nearest_city_with_providers)
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================================
-- 1. TABLE COMMUNES
-- ============================================================================
CREATE TABLE IF NOT EXISTS communes (
  -- Identité
  code_insee                  text PRIMARY KEY,   -- Code INSEE officiel (5 chars, ex: "75056")
  name                        text NOT NULL,
  slug                        text UNIQUE NOT NULL,
  code_postal                 text,               -- Code postal principal (ex: "75000")
  departement_code            text NOT NULL,
  departement_name            text,
  region_name                 text,

  -- Géographie (enrichi par geo.api.gouv.fr + BAN)
  latitude                    double precision
    CHECK (latitude IS NULL OR (latitude BETWEEN -90 AND 90)),
  longitude                   double precision
    CHECK (longitude IS NULL OR (longitude BETWEEN -180 AND 180)),
  geo                         geography(Point, 4326),  -- PostGIS point pour KNN <-> operator
  altitude_moyenne            integer
    CHECK (altitude_moyenne IS NULL OR altitude_moyenne BETWEEN -500 AND 5000),
  superficie_km2              double precision
    CHECK (superficie_km2 IS NULL OR superficie_km2 > 0),

  -- Démographie (enrichi par INSEE)
  population                  integer NOT NULL DEFAULT 0
    CHECK (population >= 0),
  densite_population          double precision,   -- hab/km² (calculé: population / superficie_km2)

  -- Socio-économique (enrichi par INSEE + DVF) — pour contenu SEO unique par commune
  revenu_median               integer,            -- Revenu médian annuel en euros
  prix_m2_moyen               integer,            -- Prix moyen au m² (source: DVF)
  nb_logements                integer,            -- Nombre de logements (source: INSEE)
  part_maisons_pct            smallint            -- % de maisons individuelles (0-100)
    CHECK (part_maisons_pct IS NULL OR part_maisons_pct BETWEEN 0 AND 100),

  -- Enrichissement local (sources multiples)
  climat_zone                 text,               -- ex: "océanique", "continental", "méditerranéen", "montagnard"
  nb_entreprises_artisanales  integer,            -- Nombre d'entreprises artisanales (source: Base Sirene)
  gentile                     text,               -- Nom des habitants (ex: "Parisiens", "Lyonnais")
  description                 text,               -- Description courte (source: Wikipedia API)

  -- État et cache
  is_active                   boolean NOT NULL DEFAULT true,
  nearest_city_with_providers text,               -- slug de la commune la plus proche avec artisans
  provider_count              integer NOT NULL DEFAULT 0  -- cache dénormalisé
    CHECK (provider_count >= 0),

  -- Timestamps
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 2. INDEXES
-- ============================================================================
-- Note: slug UNIQUE already creates an index — no need for idx_communes_slug

-- Filtrage par département (department pages)
CREATE INDEX IF NOT EXISTS idx_communes_dept ON communes(departement_code);

-- Filtrage par région (region pages)
CREATE INDEX IF NOT EXISTS idx_communes_region ON communes(region_name)
  WHERE region_name IS NOT NULL;

-- Tri par population (top cities for generateStaticParams, sitemaps)
-- Partial index: only active communes (5-20x smaller per query-partial-indexes.md)
CREATE INDEX IF NOT EXISTS idx_communes_population ON communes(population DESC)
  WHERE is_active = true;

-- Composite: département + population (department page listing cities by pop)
-- Equality col first, range col second (query-composite-indexes.md)
CREATE INDEX IF NOT EXISTS idx_communes_dept_pop ON communes(departement_code, population DESC)
  WHERE is_active = true;

-- PostGIS GiST index for KNN nearest-neighbor queries (query-index-types.md)
-- Uses geography column directly — supports <-> distance operator
CREATE INDEX IF NOT EXISTS idx_communes_geo ON communes USING gist (geo)
  WHERE geo IS NOT NULL;

-- Provider count > 0 (for redirect logic: "communes with providers")
CREATE INDEX IF NOT EXISTS idx_communes_with_providers ON communes(provider_count)
  WHERE is_active = true AND provider_count > 0;

-- ============================================================================
-- 3. AUTO-COMPUTE geography COLUMN FROM lat/lng ON INSERT/UPDATE
-- ============================================================================
CREATE OR REPLACE FUNCTION communes_compute_geo()
RETURNS trigger AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.geo := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  ELSE
    NEW.geo := NULL;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_communes_geo ON communes;
CREATE TRIGGER trg_communes_geo
  BEFORE INSERT OR UPDATE ON communes
  FOR EACH ROW
  EXECUTE FUNCTION communes_compute_geo();

-- ============================================================================
-- 4. RLS POLICIES (security-rls-performance.md: wrap auth.uid() in select)
-- ============================================================================
ALTER TABLE communes ENABLE ROW LEVEL SECURITY;

-- Public read access (no auth required — geographic reference data)
CREATE POLICY communes_select_public ON communes
  FOR SELECT
  USING (true);

-- Admin-only writes — (select auth.uid()) is called ONCE, not per row
CREATE POLICY communes_admin_insert ON communes
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = true)
  );

CREATE POLICY communes_admin_update ON communes
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = true)
  );

CREATE POLICY communes_admin_delete ON communes
  FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND is_admin = true)
  );

-- ============================================================================
-- 5. AUTOVACUUM TUNING (monitor-vacuum-analyze.md)
-- ============================================================================
-- Communes table is bulk-loaded then infrequently updated.
-- Lower analyze threshold so stats are fresh after enrichment scripts.
ALTER TABLE communes SET (
  autovacuum_analyze_scale_factor = 0.02  -- Analyze at 2% changes (default 10%)
);

-- ============================================================================
-- 6. COMMENTS
-- ============================================================================
COMMENT ON TABLE communes IS 'Communes françaises (35K+) — sources: geo.api.gouv.fr, INSEE, BAN, DVF, Base Sirene, Wikipedia';
COMMENT ON COLUMN communes.code_insee IS 'Code INSEE officiel (5 chiffres, ex: 75056). Clé primaire naturelle.';
COMMENT ON COLUMN communes.geo IS 'PostGIS geography point, auto-calculé depuis lat/lng par trigger. Utilisé pour KNN <-> nearest-neighbor.';
COMMENT ON COLUMN communes.gentile IS 'Nom des habitants (ex: Parisiens, Lyonnais)';
COMMENT ON COLUMN communes.climat_zone IS 'Zone climatique pour contenu SEO adapté (chauffagiste à Lille ≠ climaticien à Nice)';
COMMENT ON COLUMN communes.prix_m2_moyen IS 'Prix moyen au m² (DVF) — contextualise les tarifs artisans par commune';
COMMENT ON COLUMN communes.nb_entreprises_artisanales IS 'Nombre d''entreprises artisanales (Base Sirene) — crédibilité locale';
COMMENT ON COLUMN communes.nearest_city_with_providers IS 'Slug de la commune la plus proche ayant des artisans actifs — redirect 302';
COMMENT ON COLUMN communes.provider_count IS 'Cache dénormalisé — mis à jour par refresh_commune_provider_counts()';
COMMENT ON COLUMN communes.revenu_median IS 'Revenu médian annuel en euros (INSEE) — contextualise les tarifs';
COMMENT ON COLUMN communes.part_maisons_pct IS 'Part de maisons individuelles (INSEE) — pertinent pour couvreurs, façadiers, paysagistes';

-- ============================================================================
-- POST-MIGRATION REMINDER
-- ============================================================================
-- After bulk loading 35K communes, run:
--   ANALYZE communes;
-- to ensure the query planner has fresh statistics.
