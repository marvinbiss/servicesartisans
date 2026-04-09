-- =============================================================================
-- Migration 383 — Seed cee_operations (FOS résidentielles prioritaires)
-- =============================================================================
-- Seed initial du catalogue des opérations standardisées CEE résidentielles.
-- Couvre les fiches les plus fréquentes en rénovation maison/appartement.
--
-- PORTÉE du seed :
--   ✅ code, nom, secteur, domaine, sous_domaine       (identifiants officiels)
--   ✅ services_slugs                                   (mapping SA interne)
--   ✅ rge_qualifications_requises + rge_meta_domaines  (qualifs standards)
--   ✅ precarite_eligible / classique_eligible
--   ❌ forfait_base_kwhc                                (laissé NULL — à remplir
--       opération par opération depuis les arrêtés DGEC. Les forfaits évoluent
--       à chaque modification d'arrêté et toute erreur expose à un risque CEE
--       sur le dossier. Voir roadmap mandataire CEE Brique 2.)
--   ❌ coup_de_pouce / charte                          (FALSE par défaut — à
--       activer manuellement quand un délégataire nous notifie une charte
--       bonifiée applicable à notre mandat)
--   ❌ justificatifs_requis                            (JSONB vide — la logique
--       compliance photos EXIF + AH eIDAS arrive Brique 2 avec schéma validé)
--
-- Règle : utiliser INSERT ... ON CONFLICT (code) DO UPDATE pour que cette
-- migration soit idempotente et que les champs SA (services_slugs) puissent
-- être mis à jour sans re-seed complet.
--
-- Sources identifiants & libellés :
--   https://www.ecologie.gouv.fr/operations-standardisees-deconomies-denergie
--   https://atee.fr/efficacite-energetique/club-c2e/operations-standardisees
-- =============================================================================

INSERT INTO cee_operations (
  code, nom, secteur, domaine, sous_domaine,
  services_slugs, rge_qualifications_requises, rge_meta_domaines,
  precarite_eligible, classique_eligible, unite_mesure
) VALUES

-- ---------------------------------------------------------------------------
-- ENVELOPPE (BAR-EN-xxx)
-- ---------------------------------------------------------------------------
('BAR-EN-101',
 'Isolation des combles ou de toitures',
 'residentiel', 'enveloppe', 'isolation_toiture',
 ARRAY['couvreur','macon'],
 ARRAY['Qualibat RGE','Qualibat-7141','Qualibat-7143'],
 ARRAY['Isolation thermique'],
 TRUE, TRUE, 'm2'),

('BAR-EN-102',
 'Isolation des murs',
 'residentiel', 'enveloppe', 'isolation_murs',
 ARRAY['macon','peintre-en-batiment'],
 ARRAY['Qualibat RGE','Qualibat-7131','Qualibat-7132','Qualibat-7135'],
 ARRAY['Isolation thermique'],
 TRUE, TRUE, 'm2'),

('BAR-EN-103',
 'Isolation d''un plancher',
 'residentiel', 'enveloppe', 'isolation_plancher',
 ARRAY['macon','couvreur'],
 ARRAY['Qualibat RGE','Qualibat-7142'],
 ARRAY['Isolation thermique'],
 TRUE, TRUE, 'm2'),

('BAR-EN-104',
 'Fenêtre ou porte-fenêtre complète avec vitrage isolant',
 'residentiel', 'enveloppe', 'menuiseries',
 ARRAY['menuisier'],
 ARRAY['Qualibat RGE','Qualibat-3521','Qualibat-3522'],
 ARRAY['Menuiseries extérieures'],
 TRUE, TRUE, 'logement'),

('BAR-EN-108',
 'Fermeture isolante',
 'residentiel', 'enveloppe', 'menuiseries',
 ARRAY['menuisier'],
 ARRAY['Qualibat RGE'],
 ARRAY['Menuiseries extérieures'],
 TRUE, TRUE, 'm2'),

-- ---------------------------------------------------------------------------
-- CHAUFFAGE / ECS (BAR-TH-xxx)
-- ---------------------------------------------------------------------------
('BAR-TH-104',
 'Pompe à chaleur de type air/air',
 'residentiel', 'chauffage', 'pac_air_air',
 ARRAY['chauffagiste'],
 ARRAY['QualiPAC','QualiPAC-Chauffage+ECS'],
 ARRAY['Énergies renouvelables','Pompes à chaleur'],
 TRUE, TRUE, 'logement'),

('BAR-TH-112',
 'Appareil indépendant de chauffage au bois',
 'residentiel', 'chauffage', 'biomasse_individuel',
 ARRAY['chauffagiste'],
 ARRAY['Qualibois','Qualibois-Air'],
 ARRAY['Énergies renouvelables','Biomasse'],
 TRUE, TRUE, 'logement'),

('BAR-TH-113',
 'Chaudière biomasse individuelle',
 'residentiel', 'chauffage', 'chaudiere_biomasse',
 ARRAY['chauffagiste'],
 ARRAY['Qualibois','Qualibois-Eau'],
 ARRAY['Énergies renouvelables','Biomasse'],
 TRUE, TRUE, 'logement'),

('BAR-TH-129',
 'Pompe à chaleur de type air/eau',
 'residentiel', 'chauffage', 'pac_air_eau',
 ARRAY['chauffagiste'],
 ARRAY['QualiPAC','QualiPAC-Chauffage+ECS'],
 ARRAY['Énergies renouvelables','Pompes à chaleur'],
 TRUE, TRUE, 'logement'),

('BAR-TH-143',
 'Système solaire combiné',
 'residentiel', 'chauffage', 'solaire_combine',
 ARRAY['chauffagiste','plombier'],
 ARRAY['Qualisol','Qualisol Combi'],
 ARRAY['Énergies renouvelables','Solaire thermique'],
 TRUE, TRUE, 'logement'),

('BAR-TH-148',
 'Chauffe-eau thermodynamique à accumulation',
 'residentiel', 'ecs', 'cet',
 ARRAY['plombier','chauffagiste'],
 ARRAY['QualiPAC','QualiPAC-CET'],
 ARRAY['Énergies renouvelables','Pompes à chaleur'],
 TRUE, TRUE, 'logement'),

('BAR-TH-159',
 'Pompe à chaleur hybride individuelle',
 'residentiel', 'chauffage', 'pac_hybride',
 ARRAY['chauffagiste'],
 ARRAY['QualiPAC','QualiPAC-Chauffage+ECS'],
 ARRAY['Énergies renouvelables','Pompes à chaleur'],
 TRUE, TRUE, 'logement'),

('BAR-TH-160',
 'Isolation d''un réseau hydraulique de chauffage ou ECS',
 'residentiel', 'chauffage', 'calorifugeage',
 ARRAY['chauffagiste','plombier'],
 ARRAY['Qualibat RGE'],
 ARRAY['Isolation thermique'],
 TRUE, TRUE, 'm'),

('BAR-TH-161',
 'Isolation de points singuliers d''un réseau',
 'residentiel', 'chauffage', 'calorifugeage',
 ARRAY['chauffagiste','plombier'],
 ARRAY['Qualibat RGE'],
 ARRAY['Isolation thermique'],
 TRUE, TRUE, 'point'),

('BAR-TH-164',
 'Rénovation globale d''une maison individuelle',
 'residentiel', 'chauffage', 'renovation_globale',
 ARRAY['chauffagiste','macon','couvreur','menuisier','peintre-en-batiment'],
 ARRAY['Qualibat RGE','MaPrimeRénov Mon Accompagnateur Rénov'],
 ARRAY['Rénovation globale'],
 TRUE, TRUE, 'logement'),

-- ---------------------------------------------------------------------------
-- VENTILATION (BAR-TH-xxx)
-- ---------------------------------------------------------------------------
('BAR-TH-125',
 'Système de ventilation double flux autoréglable ou hygroréglable',
 'residentiel', 'ventilation', 'vmc_df',
 ARRAY['electricien','plombier'],
 ARRAY['Qualibat RGE','Qualifelec RGE'],
 ARRAY['Ventilation'],
 TRUE, TRUE, 'logement'),

('BAR-TH-127',
 'Ventilation mécanique simple flux hygroréglable',
 'residentiel', 'ventilation', 'vmc_sf',
 ARRAY['electricien','plombier'],
 ARRAY['Qualibat RGE','Qualifelec RGE'],
 ARRAY['Ventilation'],
 TRUE, TRUE, 'logement'),

-- ---------------------------------------------------------------------------
-- SERVICES / RÉGULATION (BAR-SE-xxx, BAR-TH-xxx)
-- ---------------------------------------------------------------------------
('BAR-TH-173',
 'Système de régulation par sonde de température extérieure',
 'residentiel', 'services', 'regulation',
 ARRAY['chauffagiste','electricien'],
 ARRAY['Qualibat RGE','Qualifelec RGE'],
 ARRAY['Régulation'],
 TRUE, TRUE, 'logement'),

('BAR-SE-104',
 'Système de régulation par programmation d''intermittence',
 'residentiel', 'services', 'regulation',
 ARRAY['chauffagiste','electricien'],
 ARRAY['Qualifelec RGE'],
 ARRAY['Régulation','Pilotage connecté'],
 TRUE, TRUE, 'logement')

ON CONFLICT (code) DO UPDATE SET
  nom = EXCLUDED.nom,
  secteur = EXCLUDED.secteur,
  domaine = EXCLUDED.domaine,
  sous_domaine = EXCLUDED.sous_domaine,
  services_slugs = EXCLUDED.services_slugs,
  rge_qualifications_requises = EXCLUDED.rge_qualifications_requises,
  rge_meta_domaines = EXCLUDED.rge_meta_domaines,
  precarite_eligible = EXCLUDED.precarite_eligible,
  classique_eligible = EXCLUDED.classique_eligible,
  unite_mesure = EXCLUDED.unite_mesure,
  updated_at = now();
