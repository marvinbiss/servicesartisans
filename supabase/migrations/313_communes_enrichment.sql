-- =============================================================================
-- Migration 313 : Enrichissement communes — données SIRENE, RGE, DPE, Climat
-- 2026-02-16
-- =============================================================================
-- Ajoute des colonnes pré-calculées pour alimenter le contenu programmatique
-- unique sur chaque page service+ville. Ces colonnes sont remplies par des
-- scripts d'enrichissement (scripts/enrich-communes.ts) et PAS en temps réel.
-- =============================================================================

-- SIRENE / Business counts (source: API Recherche d'Entreprises)
ALTER TABLE communes ADD COLUMN IF NOT EXISTS nb_artisans_btp integer
  CHECK (nb_artisans_btp IS NULL OR nb_artisans_btp >= 0);
COMMENT ON COLUMN communes.nb_artisans_btp IS 'Nombre d''établissements BTP actifs (NAF division 41-43). Source: API SIRENE.';

-- RGE certified artisans (source: ADEME)
ALTER TABLE communes ADD COLUMN IF NOT EXISTS nb_artisans_rge integer
  CHECK (nb_artisans_rge IS NULL OR nb_artisans_rge >= 0);
COMMENT ON COLUMN communes.nb_artisans_rge IS 'Nombre d''artisans certifiés RGE. Source: data.ademe.fr.';

-- DPE energy performance (source: ADEME DPE)
ALTER TABLE communes ADD COLUMN IF NOT EXISTS pct_passoires_dpe smallint
  CHECK (pct_passoires_dpe IS NULL OR pct_passoires_dpe BETWEEN 0 AND 100);
COMMENT ON COLUMN communes.pct_passoires_dpe IS 'Pourcentage de logements classés F ou G au DPE. Source: data.ademe.fr.';

ALTER TABLE communes ADD COLUMN IF NOT EXISTS nb_dpe_total integer
  CHECK (nb_dpe_total IS NULL OR nb_dpe_total >= 0);
COMMENT ON COLUMN communes.nb_dpe_total IS 'Nombre total de DPE réalisés dans la commune. Source: data.ademe.fr.';

-- Climate data (source: Open-Meteo historical)
ALTER TABLE communes ADD COLUMN IF NOT EXISTS jours_gel_annuels smallint
  CHECK (jours_gel_annuels IS NULL OR jours_gel_annuels BETWEEN 0 AND 365);
COMMENT ON COLUMN communes.jours_gel_annuels IS 'Nombre moyen de jours de gel par an. Source: Open-Meteo.';

ALTER TABLE communes ADD COLUMN IF NOT EXISTS precipitation_annuelle integer
  CHECK (precipitation_annuelle IS NULL OR precipitation_annuelle >= 0);
COMMENT ON COLUMN communes.precipitation_annuelle IS 'Précipitations moyennes annuelles en mm. Source: Open-Meteo.';

ALTER TABLE communes ADD COLUMN IF NOT EXISTS mois_travaux_ext_debut smallint
  CHECK (mois_travaux_ext_debut IS NULL OR mois_travaux_ext_debut BETWEEN 1 AND 12);
COMMENT ON COLUMN communes.mois_travaux_ext_debut IS 'Mois de début de la période idéale pour les travaux extérieurs (1-12).';

ALTER TABLE communes ADD COLUMN IF NOT EXISTS mois_travaux_ext_fin smallint
  CHECK (mois_travaux_ext_fin IS NULL OR mois_travaux_ext_fin BETWEEN 1 AND 12);
COMMENT ON COLUMN communes.mois_travaux_ext_fin IS 'Mois de fin de la période idéale pour les travaux extérieurs (1-12).';

ALTER TABLE communes ADD COLUMN IF NOT EXISTS temperature_moyenne_hiver real;
COMMENT ON COLUMN communes.temperature_moyenne_hiver IS 'Température moyenne hivernale (déc-fév) en °C. Source: Open-Meteo.';

ALTER TABLE communes ADD COLUMN IF NOT EXISTS temperature_moyenne_ete real;
COMMENT ON COLUMN communes.temperature_moyenne_ete IS 'Température moyenne estivale (juin-août) en °C. Source: Open-Meteo.';

-- DVF property transaction data (source: DVF Etalab)
ALTER TABLE communes ADD COLUMN IF NOT EXISTS nb_transactions_annuelles integer
  CHECK (nb_transactions_annuelles IS NULL OR nb_transactions_annuelles >= 0);
COMMENT ON COLUMN communes.nb_transactions_annuelles IS 'Nombre de transactions immobilières par an. Source: DVF Etalab.';

ALTER TABLE communes ADD COLUMN IF NOT EXISTS prix_m2_maison integer;
COMMENT ON COLUMN communes.prix_m2_maison IS 'Prix moyen au m² pour les maisons. Source: DVF Etalab.';

ALTER TABLE communes ADD COLUMN IF NOT EXISTS prix_m2_appartement integer;
COMMENT ON COLUMN communes.prix_m2_appartement IS 'Prix moyen au m² pour les appartements. Source: DVF Etalab.';

-- MaPrimeRénov statistics (source: SDES)
ALTER TABLE communes ADD COLUMN IF NOT EXISTS nb_maprimerenov_annuel integer
  CHECK (nb_maprimerenov_annuel IS NULL OR nb_maprimerenov_annuel >= 0);
COMMENT ON COLUMN communes.nb_maprimerenov_annuel IS 'Nombre de dossiers MaPrimeRénov par an dans le département. Source: SDES.';

-- Enrichment tracking
ALTER TABLE communes ADD COLUMN IF NOT EXISTS enriched_at timestamptz;
COMMENT ON COLUMN communes.enriched_at IS 'Date du dernier enrichissement par le script enrich-communes.ts.';
