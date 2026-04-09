-- =============================================================================
-- Migration 384 — Corrections catalogue cee_operations + extension schéma
-- =============================================================================
-- Cette migration corrige les erreurs bloquantes identifiées lors de l'audit
-- de compliance du seed 383 contre les arrêtés DGEC officiels (2026-04-09).
--
-- Contexte audit :
--   - 4 erreurs P0 bloquantes (fiches abrogées, libellé totalement faux)
--   - 2 erreurs P1 (libellés inversés, codes mal attribués)
--   - Fiches majeures manquantes : BAR-TH-171 (PAC air/eau), BAR-TH-172
--     (PAC eau/eau), BAR-TH-174/175 (rénovation d'ampleur)
--
-- Principe de prudence :
--   Quand l'arrêté DGEC n'exige pas un Qualibat ou Qualifelec NUMÉRIQUE
--   explicite (ex: Qualibat-7141), on retire ces tags car mettre une qualif
--   trop restrictive exclurait à tort des artisans éligibles. À la place on
--   garde uniquement les mentions génériques vérifiables (Qualibat RGE,
--   QualiPAC, Qualibois, Qualisol). La liste finale doit de toute façon être
--   croisée avec la formulation textuelle de l'arrêté avant dépose délégataire.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Extension schéma : colonnes de traçabilité arrêté + non-cumulabilité
-- -----------------------------------------------------------------------------

ALTER TABLE cee_operations
  ADD COLUMN IF NOT EXISTS version_dgec TEXT,
  ADD COLUMN IF NOT EXISTS date_application DATE,
  ADD COLUMN IF NOT EXISTS arrete_source TEXT,
  ADD COLUMN IF NOT EXISTS rge_formulation_arrete TEXT,
  ADD COLUMN IF NOT EXISTS non_cumulable_avec TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS public_cible TEXT NOT NULL DEFAULT 'tous'
    CHECK (public_cible IN ('maison_individuelle','appartement','copropriete','tous'));

COMMENT ON COLUMN cee_operations.version_dgec IS
  'Version DGEC de la fiche (ex: vA78-4). Se met à jour à chaque arrêté modificatif.';
COMMENT ON COLUMN cee_operations.date_application IS
  'Date à partir de laquelle la version courante s''applique (opposable).';
COMMENT ON COLUMN cee_operations.arrete_source IS
  'URL Légifrance du dernier arrêté de référence pour cette fiche.';
COMMENT ON COLUMN cee_operations.rge_formulation_arrete IS
  'Texte EXACT de la clause RGE dans l''arrêté. C''est ce texte qui est opposable au délégataire et au PNCEE, pas la liste normalisée rge_qualifications_requises.';
COMMENT ON COLUMN cee_operations.non_cumulable_avec IS
  'Codes FOS avec lesquels cette fiche ne peut PAS être cumulée sur un même dossier (ex: BAR-TH-148 non-cumulable avec BAR-TH-171 depuis 2026).';

-- -----------------------------------------------------------------------------
-- 2. DÉSACTIVATION des fiches abrogées / retirées
-- -----------------------------------------------------------------------------

-- BAR-TH-104 : abrogée 01-01-2024 (arrêté 4 octobre 2023).
-- En plus, avait été mal attribuée dans le seed 383 à "PAC air/air" (faux).
UPDATE cee_operations
   SET is_active = FALSE,
       date_fin_validite = '2024-01-01',
       notes = 'Abrogée au 01-01-2024 par arrêté du 4 octobre 2023. Remplacée par BAR-TH-171 (air/eau) et BAR-TH-172 (eau/eau). Ne PAS utiliser.',
       arrete_source = 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048158900'
 WHERE code = 'BAR-TH-104';

-- BAR-TH-160 : retirée du catalogue au 01-01-2025 (71e arrêté CEE).
UPDATE cee_operations
   SET is_active = FALSE,
       date_fin_validite = '2025-01-01',
       notes = 'Retirée du catalogue au 01-01-2025 par le 71e arrêté CEE. Non valorisable pour des travaux engagés après cette date. Abrogation totale prévue 01-04-2028.'
 WHERE code = 'BAR-TH-160';

-- BAR-TH-164 : abrogée 31-12-2024. Remplacée par BAR-TH-174 (maison indiv.)
-- et BAR-TH-175 (appartement) pilotées par MaPrimeRénov' Parcours Accompagné.
UPDATE cee_operations
   SET is_active = FALSE,
       date_fin_validite = '2025-01-01',
       notes = 'Abrogée au 31-12-2024 (arrêté 19 décembre 2023). Remplacée par BAR-TH-174 (maison individuelle) et BAR-TH-175 (appartement). Nécessite Mon Accompagnateur Rénov (MAR).',
       arrete_source = 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048680133'
 WHERE code = 'BAR-TH-164';

-- -----------------------------------------------------------------------------
-- 3. CORRECTIONS libellés / qualifs / mapping (P0 et P1)
-- -----------------------------------------------------------------------------

-- BAR-EN-101 : libellé exact DGEC "Isolation de combles ou de toitures" (sans "des")
UPDATE cee_operations
   SET nom = 'Isolation de combles ou de toitures',
       version_dgec = 'vA64-6',
       date_application = '2025-01-01',
       rge_qualifications_requises = ARRAY['Qualibat RGE'],
       rge_formulation_arrete = 'Mention RGE "Isolation" au sens du décret 2014-812 (à vérifier version courante PDF DGEC)',
       public_cible = 'tous'
 WHERE code = 'BAR-EN-101';

-- BAR-EN-102 : OK, ajustement version
UPDATE cee_operations
   SET version_dgec = 'vA65-4',
       date_application = '2025-01-01',
       rge_qualifications_requises = ARRAY['Qualibat RGE'],
       rge_formulation_arrete = 'Mention RGE isolation des murs (ITI ou ITE) — à confirmer PDF DGEC'
 WHERE code = 'BAR-EN-102';

-- BAR-EN-103
UPDATE cee_operations
   SET version_dgec = 'vA64-6',
       date_application = '2025-01-01',
       rge_qualifications_requises = ARRAY['Qualibat RGE'],
       rge_formulation_arrete = 'Mention RGE isolation des planchers — à confirmer PDF DGEC'
 WHERE code = 'BAR-EN-103';

-- BAR-EN-104 : version à jour
UPDATE cee_operations
   SET version_dgec = 'vA54-2',
       date_application = '2024-01-01',
       rge_qualifications_requises = ARRAY['Qualibat RGE'],
       rge_formulation_arrete = 'Mention RGE menuiseries extérieures — à confirmer PDF DGEC'
 WHERE code = 'BAR-EN-104';

-- BAR-EN-108 : Qualibat RGE probablement NON requis (pose de volet/store)
UPDATE cee_operations
   SET version_dgec = 'vA54-3',
       date_application = '2024-01-01',
       rge_qualifications_requises = ARRAY[]::TEXT[],
       rge_meta_domaines = ARRAY[]::TEXT[],
       rge_formulation_arrete = 'Pas de mention RGE imposée dans l''arrêté (à confirmer PDF). Pose de fermeture isolante.',
       notes = 'Fermeture isolante (volet/store) — RGE non requis par la DGEC.'
 WHERE code = 'BAR-EN-108';

-- BAR-TH-112 : Qualibois module Air (chauffage bois individuel type poêle)
UPDATE cee_operations
   SET version_dgec = 'vA35-2',
       date_application = '2020-10-01',
       rge_qualifications_requises = ARRAY['Qualibois Air'],
       rge_meta_domaines = ARRAY['Énergies renouvelables','Biomasse'],
       rge_formulation_arrete = 'Qualibois module Air ou équivalent RGE — à confirmer PDF DGEC',
       notes = 'Primes modifiées 01-01-2026 par arrêtés 18 août + 6 septembre 2025.',
       arrete_source = 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000052125357'
 WHERE code = 'BAR-TH-112';

-- BAR-TH-113 : Qualibois Eau OU Air (au choix), était sous-restrictif
UPDATE cee_operations
   SET rge_qualifications_requises = ARRAY['Qualibois Eau','Qualibois Air'],
       rge_formulation_arrete = 'Qualibois module Eau ou Qualibois module Air — confirmé FAQ CEE ministère',
       notes = 'Primes modifiées 01-01-2026.',
       arrete_source = 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000052125357'
 WHERE code = 'BAR-TH-113';

-- BAR-TH-125 : VMC double flux — version à jour
UPDATE cee_operations
   SET version_dgec = 'vA54-5',
       date_application = '2024-01-01',
       rge_qualifications_requises = ARRAY['Qualibat RGE'],
       rge_meta_domaines = ARRAY['Ventilation'],
       rge_formulation_arrete = 'Réalisation par un professionnel RGE — à confirmer PDF DGEC'
 WHERE code = 'BAR-TH-125';

-- BAR-TH-127 : VMC simple flux hygro, formulation générique pro RGE
UPDATE cee_operations
   SET version_dgec = 'vA58-6',
       date_application = '2024-04-01',
       date_fin_validite = '2028-06-30',
       rge_qualifications_requises = ARRAY['Qualibat RGE'],
       rge_formulation_arrete = 'Réalisation par un professionnel RGE (formulation générique, pas de numéro Qualibat imposé)',
       arrete_source = 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048680244'
 WHERE code = 'BAR-TH-127';

-- BAR-TH-129 : CORRECTION MAJEURE — c'est PAC air/AIR, pas air/eau
UPDATE cee_operations
   SET nom = 'Pompe à chaleur de type air/air',
       sous_domaine = 'pac_air_air',
       version_dgec = 'vA27-3',
       date_application = '2018-04-01',
       rge_qualifications_requises = ARRAY['QualiPAC'],
       rge_meta_domaines = ARRAY['Énergies renouvelables','Pompes à chaleur'],
       rge_formulation_arrete = 'QualiPAC ou équivalent — à confirmer PDF DGEC',
       notes = 'Seule fiche PAC air/air résidentielle active. Historiquement stable.'
 WHERE code = 'BAR-TH-129';

-- BAR-TH-143 : durcissement contrôle 01-03-2026
UPDATE cee_operations
   SET rge_qualifications_requises = ARRAY['Qualisol Combi'],
       rge_formulation_arrete = 'Qualisol Combi ou équivalent — à confirmer PDF DGEC',
       non_cumulable_avec = ARRAY['BAR-TH-171','BAR-TH-172','BAR-TH-112','BAR-TH-113'],
       notes = 'Référentiel de contrôle renforcé au 01-03-2026 (30 critères invalidants). Non-cumulable avec PAC ou biomasse depuis 2026. Exige émetteurs basse température (plancher chauffant, radiateurs BT).',
       arrete_source = 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053586809'
 WHERE code = 'BAR-TH-143';

-- BAR-TH-148 : version à jour + non-cumulabilité
UPDATE cee_operations
   SET version_dgec = 'vA73-3',
       date_application = '2025-11-01',
       date_fin_validite = '2030-12-31',
       rge_qualifications_requises = ARRAY['QualiPAC CET'],
       rge_formulation_arrete = 'QualiPAC module CET ou équivalent — à confirmer PDF DGEC',
       non_cumulable_avec = ARRAY['BAR-TH-171','BAR-TH-172'],
       notes = 'Non-cumulable avec BAR-TH-171/172 depuis 2026. Critères COP renforcés. Mention fluide frigorigène obligatoire.',
       arrete_source = 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000052212320'
 WHERE code = 'BAR-TH-148';

-- BAR-TH-159 : PAC hybride — version à jour
UPDATE cee_operations
   SET version_dgec = 'vA50-4',
       date_application = '2023-04-01',
       rge_qualifications_requises = ARRAY['QualiPAC'],
       rge_formulation_arrete = 'QualiPAC Chauffage + ECS — à confirmer PDF DGEC',
       notes = 'ηS ≥ 111 % avec appoint. Remplacement chaudière charbon/fioul/gaz, toutes zones climatiques depuis arrêté 4 octobre 2023.',
       arrete_source = 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048158900'
 WHERE code = 'BAR-TH-159';

-- BAR-TH-161
UPDATE cee_operations
   SET version_dgec = 'vA71-3',
       date_application = '2025-08-01',
       rge_qualifications_requises = ARRAY['Qualibat RGE'],
       rge_formulation_arrete = 'Mention RGE isolation — à confirmer PDF DGEC'
 WHERE code = 'BAR-TH-161';

-- BAR-TH-173 : CORRECTION MAJEURE — libellé faux, c'est "programmation horaire
-- pièce par pièce" (pilotage connecté), pas "sonde extérieure". RGE non requis.
UPDATE cee_operations
   SET nom = 'Système de régulation par programmation horaire pièce par pièce',
       sous_domaine = 'pilotage_connecte',
       domaine = 'services',
       version_dgec = 'vA69-2',
       date_application = '2025-07-01',
       services_slugs = ARRAY['electricien','chauffagiste'],
       rge_qualifications_requises = ARRAY[]::TEXT[],
       rge_meta_domaines = ARRAY['Pilotage connecté'],
       rge_formulation_arrete = 'Pas de mention RGE imposée (pose d''électronique). À confirmer PDF DGEC.',
       notes = 'Pilotage connecté pièce par pièce (robinets thermostatiques connectés type Danfoss/Heatzy). Numéro PDL/PRM/PCE logement à fournir. Coup de pouce terminé 31/12/2024 mais fiche reste active.',
       arrete_source = 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048473771'
 WHERE code = 'BAR-TH-173';

-- BAR-SE-104 : CORRECTION MAJEURE — libellé totalement faux. C'est l'équilibrage
-- hydraulique d'installation chauffage à eau chaude (collectif), pas la
-- programmation d'intermittence.
UPDATE cee_operations
   SET nom = 'Réglage des organes d''équilibrage d''une installation de chauffage à eau chaude',
       domaine = 'chauffage',
       sous_domaine = 'equilibrage_hydraulique',
       services_slugs = ARRAY['chauffagiste'],
       rge_qualifications_requises = ARRAY[]::TEXT[],
       rge_meta_domaines = ARRAY['Équilibrage hydraulique'],
       rge_formulation_arrete = 'Pas de mention RGE imposée. Prestation réalisée par un professionnel du chauffage.',
       public_cible = 'copropriete',
       notes = 'Fiche principalement COLLECTIF/copropriété. Écart < 2°C entre logements. Durée de vie conventionnelle 10 ans. Schéma hydraulique + grille équilibrage + tableau températures obligatoires.'
 WHERE code = 'BAR-SE-104';

-- -----------------------------------------------------------------------------
-- 4. AJOUT des fiches majeures manquantes
-- -----------------------------------------------------------------------------

INSERT INTO cee_operations (
  code, nom, secteur, domaine, sous_domaine,
  services_slugs, rge_qualifications_requises, rge_meta_domaines, rge_formulation_arrete,
  precarite_eligible, classique_eligible, unite_mesure,
  version_dgec, date_application, public_cible,
  non_cumulable_avec, arrete_source, notes
) VALUES

-- BAR-TH-171 : LA fiche PAC air/eau résidentielle (remplaçante de BAR-TH-104)
('BAR-TH-171',
 'Pompe à chaleur de type air/eau',
 'residentiel', 'chauffage', 'pac_air_eau',
 ARRAY['chauffagiste'],
 ARRAY['QualiPAC'],
 ARRAY['Énergies renouvelables','Pompes à chaleur'],
 'QualiPAC avec signe de qualité RGE adapté — à confirmer PDF DGEC vA78-4',
 TRUE, TRUE, 'logement',
 'vA78-4', '2026-01-01', 'maison_individuelle',
 ARRAY['BAR-TH-148','BAR-TH-172','BAR-TH-143'],
 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053043176',
 'Remplace BAR-TH-104 abrogée. ETAS ≥ 126% basse temp, ≥ 111% moyenne/haute depuis 01-10-2025. Contrôles sur site à 25%. Non-cumulable avec CET (BAR-TH-148) depuis 2026.'),

-- BAR-TH-172 : PAC eau/eau et eau glycolée/eau (géothermie)
('BAR-TH-172',
 'Pompe à chaleur de type eau/eau ou eau glycolée/eau',
 'residentiel', 'chauffage', 'pac_geothermie',
 ARRAY['chauffagiste'],
 ARRAY['QualiPAC','QualiForage'],
 ARRAY['Énergies renouvelables','Pompes à chaleur','Géothermie'],
 'QualiPAC et/ou QualiForage — à confirmer PDF DGEC',
 TRUE, TRUE, 'logement',
 'vA78-4', '2026-01-01', 'maison_individuelle',
 ARRAY['BAR-TH-148','BAR-TH-171','BAR-TH-143'],
 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053043176',
 'Géothermie résidentielle. Volume attendu faible mais fiche à avoir pour complétude.'),

-- BAR-TH-174 : Rénovation d'ampleur maison individuelle (remplace BAR-TH-164)
('BAR-TH-174',
 'Rénovation d''ampleur d''une maison individuelle',
 'residentiel', 'chauffage', 'renovation_ampleur',
 ARRAY['chauffagiste','macon','couvreur','menuisier','peintre-en-batiment'],
 ARRAY['Qualibat RGE','Mon Accompagnateur Rénov'],
 ARRAY['Rénovation globale'],
 'Mention RGE par geste + Mon Accompagnateur Rénov (MAR) obligatoire',
 TRUE, TRUE, 'logement',
 NULL, '2025-01-01', 'maison_individuelle',
 ARRAY[]::TEXT[],
 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048680133',
 'Remplace BAR-TH-164. Exige audit énergétique, ≥ 2 gestes isolation, gain ≥ 2 classes DPE, accompagnement MAR obligatoire. Pilotée Anah via MaPrimeRénov Parcours Accompagné. Non déployable sans partenariat MAR.'),

-- BAR-TH-175 : Rénovation d'ampleur appartement individuel
('BAR-TH-175',
 'Rénovation d''ampleur d''un appartement',
 'residentiel', 'chauffage', 'renovation_ampleur',
 ARRAY['chauffagiste','macon','menuisier','peintre-en-batiment'],
 ARRAY['Qualibat RGE','Mon Accompagnateur Rénov'],
 ARRAY['Rénovation globale'],
 'Mention RGE par geste + Mon Accompagnateur Rénov (MAR) obligatoire',
 TRUE, TRUE, 'logement',
 NULL, '2025-01-01', 'appartement',
 ARRAY[]::TEXT[],
 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048680133',
 'Pendant BAR-TH-174 pour appartement individuel. Mêmes exigences MAR + audit + gain DPE.')

ON CONFLICT (code) DO UPDATE SET
  nom = EXCLUDED.nom,
  domaine = EXCLUDED.domaine,
  sous_domaine = EXCLUDED.sous_domaine,
  services_slugs = EXCLUDED.services_slugs,
  rge_qualifications_requises = EXCLUDED.rge_qualifications_requises,
  rge_meta_domaines = EXCLUDED.rge_meta_domaines,
  rge_formulation_arrete = EXCLUDED.rge_formulation_arrete,
  version_dgec = EXCLUDED.version_dgec,
  date_application = EXCLUDED.date_application,
  public_cible = EXCLUDED.public_cible,
  non_cumulable_avec = EXCLUDED.non_cumulable_avec,
  arrete_source = EXCLUDED.arrete_source,
  notes = EXCLUDED.notes,
  updated_at = now();
