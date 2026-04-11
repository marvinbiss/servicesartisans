-- =============================================================================
-- Migration 397 — Mise à jour catalogue cee_operations (75e arrêté CEE)
-- =============================================================================
-- Source légale :
--   Arrêté du 6 septembre 2025 portant modification de fiches d'opérations
--   standardisées du dispositif des certificats d'économies d'énergie
--   (JORF n°0210 du 9 septembre 2025, texte 60 sur 206).
--   https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000052212366
--
-- Date d'application : 1er janvier 2026.
--
-- Portée de cette migration :
--   1. ABROGATION au 01-01-2026 des fiches "PAC collective/tertiaire" de
--      l'ancien catalogue, remplacées par les nouvelles fiches géothermie
--      et PAC collective :
--        - BAR-TH-166 "Pompe à chaleur collective de type air/eau ou eau/eau"
--        - BAT-TH-113 "Pompe à chaleur de type air/eau ou eau/eau" (tertiaire)
--      (Ces deux codes n'étaient pas seedés dans 383 — l'UPDATE restera sans
--      effet si la ligne n'existe pas, ce qui est le comportement attendu.
--      On pré-insère en INACTIF pour traçabilité du catalogue.)
--
--   2. CRÉATION des nouvelles fiches résidentielles (BAR-TH-178/179/180)
--      applicables au 01-01-2026. Les fiches tertiaires BAT-TH-162/163/164
--      sortent du périmètre de cette table (secteur résidentiel uniquement —
--      voir check constraint secteur='residentiel' dans 382, mais la colonne
--      accepte 'tertiaire' donc on pourra les ajouter plus tard si besoin).
--
-- Principe de prudence :
--   - rge_formulation_arrete et forfait_base_kwhc laissés avec commentaire
--     "VÉRIF PDF REQUISE" quand la formulation textuelle exacte de l'arrêté
--     n'est pas confirmée par une source primaire Légifrance.
--   - Mapping services_slugs : chauffagiste (et plombier pour la géothermie,
--     travail de forage + hydraulique collectif).
--   - public_cible = 'copropriete' pour les trois fiches car ce sont des
--     installations collectives (immeubles d'habitation, pas maison individuelle).
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. ABROGATION des fiches supprimées au 01-01-2026
-- -----------------------------------------------------------------------------
-- Ces deux codes n'étaient pas présents dans le seed 383 (focus maison
-- individuelle). On les insère en INACTIF pour garder une trace de leur
-- existence historique et éviter qu'un développeur futur ne les re-crée.

INSERT INTO cee_operations (
  code, nom, secteur, domaine, sous_domaine,
  services_slugs, rge_qualifications_requises, rge_meta_domaines,
  precarite_eligible, classique_eligible, unite_mesure,
  version_dgec, date_application, arrete_source, public_cible,
  is_active, notes
) VALUES
  ('BAR-TH-166',
   'Pompe à chaleur collective de type air/eau ou eau/eau',
   'residentiel', 'chauffage', 'pac_collective',
   ARRAY['chauffagiste'],
   ARRAY[]::TEXT[],
   ARRAY['Énergies renouvelables','Pompes à chaleur'],
   TRUE, TRUE, 'kW',
   'abrogé-06-09-2025', '2026-01-01',
   'Arrêté 06/09/2025 JORFTEXT000052212366',
   'copropriete',
   FALSE,
   'Abrogée au 01-01-2026 par l''arrêté du 6 septembre 2025 (75e arrêté CEE). Remplacée par BAR-TH-178 (géothermie), BAR-TH-179 (PAC collective air/eau) et BAR-TH-180 (PAC collective eau/eau ou eau glycolée/eau). Ne plus déposer.'),

  ('BAT-TH-113',
   'Pompe à chaleur de type air/eau ou eau/eau',
   'tertiaire', 'chauffage', 'pac_tertiaire',
   ARRAY['chauffagiste'],
   ARRAY[]::TEXT[],
   ARRAY['Énergies renouvelables','Pompes à chaleur'],
   TRUE, TRUE, 'kW',
   'abrogé-06-09-2025', '2026-01-01',
   'Arrêté 06/09/2025 JORFTEXT000052212366',
   'tous',
   FALSE,
   'Abrogée au 01-01-2026 par l''arrêté du 6 septembre 2025 (75e arrêté CEE). Remplacée côté tertiaire par BAT-TH-162 (géothermie), BAT-TH-163 (PAC air/eau) et BAT-TH-164 (PAC eau/eau ou eau glycolée/eau). Hors périmètre SA (résidentiel first) — ligne conservée pour traçabilité.')
ON CONFLICT (code) DO UPDATE SET
  is_active = FALSE,
  version_dgec = 'abrogé-06-09-2025',
  date_application = '2026-01-01',
  arrete_source = 'Arrêté 06/09/2025 JORFTEXT000052212366',
  notes = EXCLUDED.notes,
  updated_at = now();

-- -----------------------------------------------------------------------------
-- 2. CRÉATION des nouvelles fiches BAR-TH-178 / 179 / 180
-- -----------------------------------------------------------------------------
-- Annexes de l'arrêté confirmées via :
--   - ecologie.gouv.fr/sites/default/files/documents/BAR-TH-178 vA75-1 ...pdf
--   - aida.ineris.fr/sites/default/files/2025-09/BAR-TH-178+annexe.pdf
--   - aida.ineris.fr/sites/default/files/2025-09/BAR-TH-179+annexe.pdf
-- Libellés officiels exacts repris du texte de l'arrêté.

INSERT INTO cee_operations (
  code, nom, secteur, domaine, sous_domaine,
  services_slugs, rge_qualifications_requises, rge_meta_domaines, rge_formulation_arrete,
  precarite_eligible, classique_eligible, unite_mesure,
  version_dgec, date_application, arrete_source, public_cible,
  non_cumulable_avec, notes
) VALUES

-- BAR-TH-178 : Système géothermique (résidentiel collectif)
('BAR-TH-178',
 'Système géothermique',
 'residentiel', 'chauffage', 'geothermie_collective',
 ARRAY['chauffagiste','plombier'],
 ARRAY['QualiPAC','QualiForage','OPQIBI 10.07','OPQIBI 20.13'],
 ARRAY['Énergies renouvelables','Pompes à chaleur','Géothermie'],
 -- Formulation RGE confirmée par sources secondaires (Opera Énergie, Rénolib) :
 -- étude RGE OPQIBI 10.07, ingénierie RGE OPQIBI 20.13, installation QualiPAC
 -- ou QualiForage (forage). -- VÉRIF PDF REQUISE pour texte exact de l'annexe.
 'Étude de la ressource géothermique : signe de qualité RGE Études OPQIBI 10.07 ou équivalent. Ingénierie (conception ou réalisation) : RGE Études OPQIBI 20.13 ou équivalent. Installation : QualiPAC ou QualiForage. -- VÉRIF PDF REQUISE',
 TRUE, TRUE, 'kW',
 'vA75-1', '2026-01-01',
 'Arrêté 06/09/2025 JORFTEXT000052212366',
 'copropriete',
 ARRAY['BAR-TH-166','BAR-TH-179','BAR-TH-180'],
 'Nouvelle fiche créée par le 75e arrêté CEE (06/09/2025), applicable 01-01-2026. Remplace partiellement BAR-TH-166. Cumulable avec Fonds Chaleur ADEME sur dossiers déposés à partir du 01-01-2026. Date d''engagement = date de signature du devis du dispositif de captage. Bonification Coup de pouce chauffage collectif x5 applicable jusqu''au 31-12-2030. -- Forfait kWhc à renseigner depuis le PDF annexe vA75-1.'),

-- BAR-TH-179 : Pompe à chaleur collective de type air/eau
('BAR-TH-179',
 'Pompe à chaleur collective de type air/eau',
 'residentiel', 'chauffage', 'pac_collective_air_eau',
 ARRAY['chauffagiste'],
 ARRAY['QualiPAC'],
 ARRAY['Énergies renouvelables','Pompes à chaleur'],
 -- -- VÉRIF PDF REQUISE : formulation exacte de la clause RGE dans l'annexe
 -- (probablement "QualiPAC module Chauffage ou équivalent").
 'QualiPAC ou équivalent (module adapté aux installations collectives). -- VÉRIF PDF REQUISE',
 TRUE, TRUE, 'kW',
 'vA75-1', '2026-01-01',
 'Arrêté 06/09/2025 JORFTEXT000052212366',
 'copropriete',
 ARRAY['BAR-TH-166','BAR-TH-178','BAR-TH-180'],
 'Nouvelle fiche créée par le 75e arrêté CEE (06/09/2025), applicable 01-01-2026. Remplace BAR-TH-166 pour les PAC collectives air/eau en résidentiel collectif. Bonification Coup de pouce "Chauffage des bâtiments résidentiels collectifs et tertiaires" : coefficient x3 (x4 en remplacement de chaudière charbon/fioul/gaz) jusqu''au 31-12-2030. -- Forfait kWhc, ETAS minimal et émetteurs basse température à renseigner depuis PDF annexe.'),

-- BAR-TH-180 : Pompe à chaleur collective de type eau/eau ou eau glycolée/eau
('BAR-TH-180',
 'Pompe à chaleur collective de type eau/eau ou eau glycolée/eau',
 'residentiel', 'chauffage', 'pac_collective_eau_eau',
 ARRAY['chauffagiste','plombier'],
 ARRAY['QualiPAC','QualiForage'],
 ARRAY['Énergies renouvelables','Pompes à chaleur','Géothermie'],
 -- -- VÉRIF PDF REQUISE : formulation exacte de la clause RGE + besoin
 -- éventuel de QualiForage pour la partie captage.
 'QualiPAC ou équivalent, avec QualiForage pour la réalisation du captage si forage. -- VÉRIF PDF REQUISE',
 TRUE, TRUE, 'kW',
 'vA75-1', '2026-01-01',
 'Arrêté 06/09/2025 JORFTEXT000052212366',
 'copropriete',
 ARRAY['BAR-TH-166','BAR-TH-178','BAR-TH-179'],
 'Nouvelle fiche créée par le 75e arrêté CEE (06/09/2025), applicable 01-01-2026. Remplace BAR-TH-166 pour les PAC collectives eau/eau ou eau glycolée/eau en résidentiel collectif. Bonification Coup de pouce "Chauffage des bâtiments résidentiels collectifs et tertiaires" : coefficient x4 (remplacement chaudière fossile) jusqu''au 31-12-2030. -- Forfait kWhc, ETAS minimal et conditions de captage à renseigner depuis PDF annexe.')

ON CONFLICT (code) DO UPDATE SET
  nom = EXCLUDED.nom,
  secteur = EXCLUDED.secteur,
  domaine = EXCLUDED.domaine,
  sous_domaine = EXCLUDED.sous_domaine,
  services_slugs = EXCLUDED.services_slugs,
  rge_qualifications_requises = EXCLUDED.rge_qualifications_requises,
  rge_meta_domaines = EXCLUDED.rge_meta_domaines,
  rge_formulation_arrete = EXCLUDED.rge_formulation_arrete,
  version_dgec = EXCLUDED.version_dgec,
  date_application = EXCLUDED.date_application,
  arrete_source = EXCLUDED.arrete_source,
  public_cible = EXCLUDED.public_cible,
  non_cumulable_avec = EXCLUDED.non_cumulable_avec,
  notes = EXCLUDED.notes,
  is_active = TRUE,
  updated_at = now();

COMMIT;
