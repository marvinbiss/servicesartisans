-- =============================================================================
-- Migration 400 — Alimentation cee_operations.justificatifs_requis
-- =============================================================================
-- Objectif : remplir la colonne JSONB `justificatifs_requis` (laissée vide par
-- 383) pour toutes les fiches FOS actives. Cette liste est la base opposable
-- au PNCEE en cas de contrôle et doit être conservée 6 ans par le mandataire
-- (art. 13 de la loi n° 2025-594 du 30 juin 2025).
--
-- Sources légales :
--   - Arrêté du 4 septembre 2014 modifié fixant la liste des éléments d'une
--     demande de CEE (annexe 7 : pièces justificatives à archiver).
--     https://www.legifrance.gouv.fr/loda/id/JORFTEXT000029435538
--   - Loi n° 2025-594 du 30 juin 2025 relative à la simplification du droit
--     de l'énergie (art. 13 : photos horodatées + géolocalisées obligatoires,
--     durée de conservation 6 ans, preuve d'information précontractuelle).
--     https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000051800000
--   - Arrêtés sectoriels par fiche (BAR-TH-171 vA78-4, BAR-TH-148 vA73-3,
--     BAR-TH-178/179/180 vA75-1) pour les exigences spécifiques : note de
--     dimensionnement, étude thermique, certificats Eurovent/NF PAC/Qualiforage,
--     étude géothermique, certification ACERMI, métré de surface traitée.
--
-- Structure JSONB retenue (array d'objets) :
--   {
--     "code":                        "identifiant court stable",
--     "label":                       "libellé humain",
--     "source":                      "base légale",
--     "obligatoire":                 true|false,
--     "duree_conservation_annees":   6,
--     "condition":                   "precarite_only" (optionnel),
--     "exif_geotag":                 true (optionnel — photos loi 2025-594),
--     "signature_eidas":             "avance" (optionnel — AH)
--   }
-- Cette structure étend le schéma documenté inline dans la migration 382
-- (code / nom / obligatoire / flags compliance) en ajoutant `source` et
-- `duree_conservation_annees` pour rendre chaque pièce auto-suffisante au
-- regard d'un audit PNCEE. Le type TS reste `Json` générique (src/types/
-- database.ts) — aucun narrowing existant à respecter.
--
-- Principe :
--   - Socle commun (8 pièces) appliqué à TOUTES les fiches actives.
--   - Justificatifs précarité (avis N-2 + composition foyer) ajoutés comme
--     `obligatoire:false, condition:"precarite_only"` sur toutes les fiches
--     dont `precarite_eligible = TRUE` (le caractère obligatoire bascule à
--     vrai au runtime quand le bénéficiaire coche "précaire"/"très précaire").
--     La colonne `public_cible` ne discrimine pas la précarité (contrainte
--     limitée à maison/appart/copro/tous), on s'appuie donc sur
--     `precarite_eligible`.
--   - Set PAC / biomasse / réseau chaleur : note de dimensionnement, étude
--     thermique préalable (BAR-TH-143, 164 abrogée, 171, 172, 174, 175),
--     certificat Eurovent/NF PAC, bon de commande matériel.
--   - Set géothermie (BAR-TH-178, et BAR-TH-172 en eau/eau) : étude
--     géothermique + certificat Qualiforage.
--   - Set isolation (BAR-EN-101/102/103) : certification ACERMI de l'isolant
--     + métré de surface traitée.
--
-- Idempotent : chaque UPDATE cible `code = ... AND is_active = true`, donc
-- les fiches abrogées (BAR-TH-104, 160, 164, 166 + BAT-TH-113) restent
-- intactes avec justificatifs_requis = '[]'. Exécutable plusieurs fois sans
-- effet de bord.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- GROUPE 1 — Isolation enveloppe avec ACERMI + métré (BAR-EN-101/102/103)
-- Socle + isolation + précarité
-- -----------------------------------------------------------------------------
UPDATE cee_operations
   SET justificatifs_requis = '[
  {"code":"attestation_honneur","label":"Attestation sur l''honneur signée bénéficiaire + professionnel (modèle annexe 7)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6,"signature_eidas":"avance"},
  {"code":"facture_detaillee","label":"Facture détaillée (identité bénéficiaire, date, adresse travaux, description permettant identification univoque, marque/modèle, performances)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"devis_signe_anterieur_engagement","label":"Devis signé daté, antérieur à toute visite technique ou commande (preuve de la date d''engagement)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"certificat_rge_valide_a_date_engagement","label":"Certificat RGE en cours de validité à la date d''engagement","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"photos_horodatees_geolocalisees_avant_apres","label":"Photos avant et après travaux, horodatées et géolocalisées (EXIF conservé)","source":"loi 2025-594 art. 13","obligatoire":true,"duree_conservation_annees":6,"exif_geotag":true},
  {"code":"mandat_cee_signe","label":"Mandat CEE signé entre le bénéficiaire et le mandataire/délégataire","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6,"signature_eidas":"avance"},
  {"code":"justificatif_versement_prime","label":"Justificatif de versement de la prime au bénéficiaire (RIB + preuve virement)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"preuve_information_precontractuelle","label":"Preuve d''information précontractuelle (notice RGE remise au client, mentions sur absence RGE le cas échéant)","source":"loi 2025-594 art. 13","obligatoire":true,"duree_conservation_annees":6},
  {"code":"certification_acermi_isolant","label":"Certification ACERMI de l''isolant posé (ou équivalent européen reconnu)","source":"arrêté DGEC fiche BAR-EN","obligatoire":true,"duree_conservation_annees":6},
  {"code":"metre_surface_traitee","label":"Métré de la surface traitée (m² isolés) signé par le professionnel","source":"arrêté DGEC fiche BAR-EN","obligatoire":true,"duree_conservation_annees":6},
  {"code":"avis_imposition_n_minus_2","label":"Avis d''imposition N-2 du bénéficiaire (si ménage précaire/très précaire)","source":"arrêté 04/09/2014 annexe 7","obligatoire":false,"condition":"precarite_only","duree_conservation_annees":6},
  {"code":"declaration_composition_foyer","label":"Déclaration sur l''honneur de la composition du foyer (si ménage précaire/très précaire)","source":"arrêté 04/09/2014 annexe 7","obligatoire":false,"condition":"precarite_only","duree_conservation_annees":6}
]'::jsonb,
       updated_at = now()
 WHERE code IN ('BAR-EN-101','BAR-EN-102','BAR-EN-103')
   AND is_active = TRUE;

-- -----------------------------------------------------------------------------
-- GROUPE 2 — Enveloppe menuiserie SANS ACERMI ni métré (BAR-EN-104 fenêtres)
-- Socle + précarité
-- -----------------------------------------------------------------------------
UPDATE cee_operations
   SET justificatifs_requis = '[
  {"code":"attestation_honneur","label":"Attestation sur l''honneur signée bénéficiaire + professionnel (modèle annexe 7)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6,"signature_eidas":"avance"},
  {"code":"facture_detaillee","label":"Facture détaillée (identité bénéficiaire, date, adresse travaux, description permettant identification univoque, marque/modèle, performances Uw/Sw)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"devis_signe_anterieur_engagement","label":"Devis signé daté, antérieur à toute visite technique ou commande (preuve de la date d''engagement)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"certificat_rge_valide_a_date_engagement","label":"Certificat RGE en cours de validité à la date d''engagement","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"photos_horodatees_geolocalisees_avant_apres","label":"Photos avant et après travaux, horodatées et géolocalisées (EXIF conservé)","source":"loi 2025-594 art. 13","obligatoire":true,"duree_conservation_annees":6,"exif_geotag":true},
  {"code":"mandat_cee_signe","label":"Mandat CEE signé entre le bénéficiaire et le mandataire/délégataire","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6,"signature_eidas":"avance"},
  {"code":"justificatif_versement_prime","label":"Justificatif de versement de la prime au bénéficiaire (RIB + preuve virement)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"preuve_information_precontractuelle","label":"Preuve d''information précontractuelle (notice RGE remise au client)","source":"loi 2025-594 art. 13","obligatoire":true,"duree_conservation_annees":6},
  {"code":"avis_imposition_n_minus_2","label":"Avis d''imposition N-2 du bénéficiaire (si ménage précaire/très précaire)","source":"arrêté 04/09/2014 annexe 7","obligatoire":false,"condition":"precarite_only","duree_conservation_annees":6},
  {"code":"declaration_composition_foyer","label":"Déclaration sur l''honneur de la composition du foyer (si ménage précaire/très précaire)","source":"arrêté 04/09/2014 annexe 7","obligatoire":false,"condition":"precarite_only","duree_conservation_annees":6}
]'::jsonb,
       updated_at = now()
 WHERE code = 'BAR-EN-104'
   AND is_active = TRUE;

-- -----------------------------------------------------------------------------
-- GROUPE 3 — Fermeture isolante BAR-EN-108 : PAS de RGE requis (cf. mig 384)
-- Socle sans RGE + précarité
-- -----------------------------------------------------------------------------
UPDATE cee_operations
   SET justificatifs_requis = '[
  {"code":"attestation_honneur","label":"Attestation sur l''honneur signée bénéficiaire + professionnel (modèle annexe 7)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6,"signature_eidas":"avance"},
  {"code":"facture_detaillee","label":"Facture détaillée (identité bénéficiaire, date, adresse travaux, marque/modèle de la fermeture, résistance thermique additionnelle ΔR)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"devis_signe_anterieur_engagement","label":"Devis signé daté, antérieur à toute visite technique ou commande","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"photos_horodatees_geolocalisees_avant_apres","label":"Photos avant et après travaux, horodatées et géolocalisées (EXIF conservé)","source":"loi 2025-594 art. 13","obligatoire":true,"duree_conservation_annees":6,"exif_geotag":true},
  {"code":"mandat_cee_signe","label":"Mandat CEE signé entre le bénéficiaire et le mandataire/délégataire","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6,"signature_eidas":"avance"},
  {"code":"justificatif_versement_prime","label":"Justificatif de versement de la prime (RIB + preuve virement)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"preuve_information_precontractuelle","label":"Preuve d''information précontractuelle (mention absence d''exigence RGE pour cette fiche)","source":"loi 2025-594 art. 13","obligatoire":true,"duree_conservation_annees":6},
  {"code":"avis_imposition_n_minus_2","label":"Avis d''imposition N-2 du bénéficiaire (si ménage précaire/très précaire)","source":"arrêté 04/09/2014 annexe 7","obligatoire":false,"condition":"precarite_only","duree_conservation_annees":6},
  {"code":"declaration_composition_foyer","label":"Déclaration sur l''honneur de la composition du foyer (si ménage précaire/très précaire)","source":"arrêté 04/09/2014 annexe 7","obligatoire":false,"condition":"precarite_only","duree_conservation_annees":6}
]'::jsonb,
       updated_at = now()
 WHERE code = 'BAR-EN-108'
   AND is_active = TRUE;

-- -----------------------------------------------------------------------------
-- GROUPE 4 — PAC / biomasse / solaire combiné / CET individuels
-- (BAR-TH-112, 113, 129, 143, 148, 159, 171)
-- Socle + note dimensionnement + certificat Eurovent/NF PAC + bon de commande
-- BAR-TH-143 et BAR-TH-171 ajoutent étude thermique préalable (émetteurs BT).
-- -----------------------------------------------------------------------------
UPDATE cee_operations
   SET justificatifs_requis = '[
  {"code":"attestation_honneur","label":"Attestation sur l''honneur signée bénéficiaire + professionnel (modèle annexe 7)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6,"signature_eidas":"avance"},
  {"code":"facture_detaillee","label":"Facture détaillée (identité bénéficiaire, date, adresse travaux, marque/modèle, performances ETAS/COP/rendement)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"devis_signe_anterieur_engagement","label":"Devis signé daté, antérieur à toute visite technique ou commande","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"certificat_rge_valide_a_date_engagement","label":"Certificat RGE (QualiPAC / Qualibois / Qualisol Combi) en cours de validité à la date d''engagement","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"photos_horodatees_geolocalisees_avant_apres","label":"Photos avant et après travaux, horodatées et géolocalisées (EXIF conservé)","source":"loi 2025-594 art. 13","obligatoire":true,"duree_conservation_annees":6,"exif_geotag":true},
  {"code":"mandat_cee_signe","label":"Mandat CEE signé entre le bénéficiaire et le mandataire/délégataire","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6,"signature_eidas":"avance"},
  {"code":"justificatif_versement_prime","label":"Justificatif de versement de la prime (RIB + preuve virement)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"preuve_information_precontractuelle","label":"Preuve d''information précontractuelle (notice RGE remise au client)","source":"loi 2025-594 art. 13","obligatoire":true,"duree_conservation_annees":6},
  {"code":"note_dimensionnement_chauffage_signee","label":"Note de dimensionnement du générateur signée par le professionnel (déperditions, régime d''eau, puissance)","source":"arrêté DGEC fiche BAR-TH chauffage","obligatoire":true,"duree_conservation_annees":6},
  {"code":"certificat_eurovent_ou_nf_pac","label":"Certificat Eurovent ou NF PAC (ou équivalent européen reconnu) pour l''équipement posé","source":"arrêté DGEC fiche BAR-TH chauffage","obligatoire":true,"duree_conservation_annees":6},
  {"code":"bon_commande_materiel","label":"Bon de commande du matériel (traçabilité chaîne d''approvisionnement anti-fraude)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"avis_imposition_n_minus_2","label":"Avis d''imposition N-2 du bénéficiaire (si ménage précaire/très précaire)","source":"arrêté 04/09/2014 annexe 7","obligatoire":false,"condition":"precarite_only","duree_conservation_annees":6},
  {"code":"declaration_composition_foyer","label":"Déclaration sur l''honneur de la composition du foyer (si ménage précaire/très précaire)","source":"arrêté 04/09/2014 annexe 7","obligatoire":false,"condition":"precarite_only","duree_conservation_annees":6}
]'::jsonb,
       updated_at = now()
 WHERE code IN ('BAR-TH-112','BAR-TH-113','BAR-TH-129','BAR-TH-148','BAR-TH-159')
   AND is_active = TRUE;

-- -----------------------------------------------------------------------------
-- GROUPE 5 — PAC air/eau BAR-TH-171 et solaire combiné BAR-TH-143
-- Socle + note dimensionnement + Eurovent/NF + bon commande + ÉTUDE THERMIQUE
-- (émetteurs basse température obligatoires, exigences renforcées 2026)
-- -----------------------------------------------------------------------------
UPDATE cee_operations
   SET justificatifs_requis = '[
  {"code":"attestation_honneur","label":"Attestation sur l''honneur signée bénéficiaire + professionnel (modèle annexe 7)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6,"signature_eidas":"avance"},
  {"code":"facture_detaillee","label":"Facture détaillée (identité bénéficiaire, date, adresse travaux, marque/modèle, ETAS basse/moyenne/haute température, fluide frigorigène)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"devis_signe_anterieur_engagement","label":"Devis signé daté, antérieur à toute visite technique ou commande","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"certificat_rge_valide_a_date_engagement","label":"Certificat RGE (QualiPAC ou Qualisol Combi) en cours de validité à la date d''engagement","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"photos_horodatees_geolocalisees_avant_apres","label":"Photos avant et après travaux, horodatées et géolocalisées (EXIF conservé)","source":"loi 2025-594 art. 13","obligatoire":true,"duree_conservation_annees":6,"exif_geotag":true},
  {"code":"mandat_cee_signe","label":"Mandat CEE signé entre le bénéficiaire et le mandataire/délégataire","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6,"signature_eidas":"avance"},
  {"code":"justificatif_versement_prime","label":"Justificatif de versement de la prime (RIB + preuve virement)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"preuve_information_precontractuelle","label":"Preuve d''information précontractuelle (notice RGE remise au client)","source":"loi 2025-594 art. 13","obligatoire":true,"duree_conservation_annees":6},
  {"code":"note_dimensionnement_chauffage_signee","label":"Note de dimensionnement du générateur signée par le professionnel (déperditions, régime d''eau, puissance)","source":"arrêté DGEC fiche BAR-TH chauffage","obligatoire":true,"duree_conservation_annees":6},
  {"code":"etude_thermique_prealable","label":"Étude thermique préalable ou audit énergétique démontrant la compatibilité émetteurs basse température","source":"arrêté DGEC BAR-TH-171 vA78-4 / BAR-TH-143","obligatoire":true,"duree_conservation_annees":6},
  {"code":"certificat_eurovent_ou_nf_pac","label":"Certificat Eurovent ou NF PAC (ou équivalent européen reconnu) pour l''équipement posé","source":"arrêté DGEC fiche BAR-TH chauffage","obligatoire":true,"duree_conservation_annees":6},
  {"code":"bon_commande_materiel","label":"Bon de commande du matériel (traçabilité chaîne d''approvisionnement anti-fraude)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"avis_imposition_n_minus_2","label":"Avis d''imposition N-2 du bénéficiaire (si ménage précaire/très précaire)","source":"arrêté 04/09/2014 annexe 7","obligatoire":false,"condition":"precarite_only","duree_conservation_annees":6},
  {"code":"declaration_composition_foyer","label":"Déclaration sur l''honneur de la composition du foyer (si ménage précaire/très précaire)","source":"arrêté 04/09/2014 annexe 7","obligatoire":false,"condition":"precarite_only","duree_conservation_annees":6}
]'::jsonb,
       updated_at = now()
 WHERE code IN ('BAR-TH-143','BAR-TH-171')
   AND is_active = TRUE;

-- -----------------------------------------------------------------------------
-- GROUPE 6 — PAC géothermique individuelle BAR-TH-172
-- Socle + note dim + Eurovent/NF + bon commande + étude géothermique + Qualiforage
-- -----------------------------------------------------------------------------
UPDATE cee_operations
   SET justificatifs_requis = '[
  {"code":"attestation_honneur","label":"Attestation sur l''honneur signée bénéficiaire + professionnel (modèle annexe 7)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6,"signature_eidas":"avance"},
  {"code":"facture_detaillee","label":"Facture détaillée (identité bénéficiaire, date, adresse, marque/modèle PAC, type de captage, puissance, ETAS)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"devis_signe_anterieur_engagement","label":"Devis signé daté, antérieur à toute visite technique ou commande","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"certificat_rge_valide_a_date_engagement","label":"Certificat RGE QualiPAC en cours de validité à la date d''engagement","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"photos_horodatees_geolocalisees_avant_apres","label":"Photos avant et après travaux, horodatées et géolocalisées (EXIF conservé)","source":"loi 2025-594 art. 13","obligatoire":true,"duree_conservation_annees":6,"exif_geotag":true},
  {"code":"mandat_cee_signe","label":"Mandat CEE signé entre le bénéficiaire et le mandataire/délégataire","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6,"signature_eidas":"avance"},
  {"code":"justificatif_versement_prime","label":"Justificatif de versement de la prime (RIB + preuve virement)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"preuve_information_precontractuelle","label":"Preuve d''information précontractuelle (notice RGE remise au client)","source":"loi 2025-594 art. 13","obligatoire":true,"duree_conservation_annees":6},
  {"code":"note_dimensionnement_chauffage_signee","label":"Note de dimensionnement du générateur signée par le professionnel","source":"arrêté DGEC fiche BAR-TH chauffage","obligatoire":true,"duree_conservation_annees":6},
  {"code":"etude_geothermique","label":"Étude de la ressource géothermique (dimensionnement captage, sondes, débits)","source":"arrêté DGEC BAR-TH-172","obligatoire":true,"duree_conservation_annees":6},
  {"code":"certificat_qualiforage","label":"Certificat Qualiforage de l''entreprise réalisant le forage","source":"arrêté DGEC BAR-TH-172","obligatoire":true,"duree_conservation_annees":6},
  {"code":"certificat_eurovent_ou_nf_pac","label":"Certificat Eurovent ou NF PAC (ou équivalent) pour l''équipement posé","source":"arrêté DGEC fiche BAR-TH chauffage","obligatoire":true,"duree_conservation_annees":6},
  {"code":"bon_commande_materiel","label":"Bon de commande du matériel (traçabilité chaîne d''approvisionnement anti-fraude)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"avis_imposition_n_minus_2","label":"Avis d''imposition N-2 du bénéficiaire (si ménage précaire/très précaire)","source":"arrêté 04/09/2014 annexe 7","obligatoire":false,"condition":"precarite_only","duree_conservation_annees":6},
  {"code":"declaration_composition_foyer","label":"Déclaration sur l''honneur de la composition du foyer (si ménage précaire/très précaire)","source":"arrêté 04/09/2014 annexe 7","obligatoire":false,"condition":"precarite_only","duree_conservation_annees":6}
]'::jsonb,
       updated_at = now()
 WHERE code = 'BAR-TH-172'
   AND is_active = TRUE;

-- -----------------------------------------------------------------------------
-- GROUPE 7 — VMC (BAR-TH-125, 127) et calorifugeage (BAR-TH-161)
-- Socle + précarité (pas de note dim ni Eurovent)
-- -----------------------------------------------------------------------------
UPDATE cee_operations
   SET justificatifs_requis = '[
  {"code":"attestation_honneur","label":"Attestation sur l''honneur signée bénéficiaire + professionnel (modèle annexe 7)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6,"signature_eidas":"avance"},
  {"code":"facture_detaillee","label":"Facture détaillée (identité bénéficiaire, date, adresse travaux, marque/modèle, performances)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"devis_signe_anterieur_engagement","label":"Devis signé daté, antérieur à toute visite technique ou commande","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"certificat_rge_valide_a_date_engagement","label":"Certificat RGE en cours de validité à la date d''engagement","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"photos_horodatees_geolocalisees_avant_apres","label":"Photos avant et après travaux, horodatées et géolocalisées (EXIF conservé)","source":"loi 2025-594 art. 13","obligatoire":true,"duree_conservation_annees":6,"exif_geotag":true},
  {"code":"mandat_cee_signe","label":"Mandat CEE signé entre le bénéficiaire et le mandataire/délégataire","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6,"signature_eidas":"avance"},
  {"code":"justificatif_versement_prime","label":"Justificatif de versement de la prime (RIB + preuve virement)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"preuve_information_precontractuelle","label":"Preuve d''information précontractuelle (notice RGE remise au client)","source":"loi 2025-594 art. 13","obligatoire":true,"duree_conservation_annees":6},
  {"code":"avis_imposition_n_minus_2","label":"Avis d''imposition N-2 du bénéficiaire (si ménage précaire/très précaire)","source":"arrêté 04/09/2014 annexe 7","obligatoire":false,"condition":"precarite_only","duree_conservation_annees":6},
  {"code":"declaration_composition_foyer","label":"Déclaration sur l''honneur de la composition du foyer (si ménage précaire/très précaire)","source":"arrêté 04/09/2014 annexe 7","obligatoire":false,"condition":"precarite_only","duree_conservation_annees":6}
]'::jsonb,
       updated_at = now()
 WHERE code IN ('BAR-TH-125','BAR-TH-127','BAR-TH-161')
   AND is_active = TRUE;

-- -----------------------------------------------------------------------------
-- GROUPE 8 — Pilotage connecté BAR-TH-173 et équilibrage hydraulique BAR-SE-104
-- PAS de RGE requis (cf. migration 384). Socle allégé + précarité.
-- -----------------------------------------------------------------------------
UPDATE cee_operations
   SET justificatifs_requis = '[
  {"code":"attestation_honneur","label":"Attestation sur l''honneur signée bénéficiaire + professionnel (modèle annexe 7)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6,"signature_eidas":"avance"},
  {"code":"facture_detaillee","label":"Facture détaillée (identité bénéficiaire, date, adresse travaux, marque/modèle, PDL/PRM/PCE ou schéma hydraulique)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"devis_signe_anterieur_engagement","label":"Devis signé daté, antérieur à toute visite technique ou commande","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"photos_horodatees_geolocalisees_avant_apres","label":"Photos avant et après travaux, horodatées et géolocalisées (EXIF conservé)","source":"loi 2025-594 art. 13","obligatoire":true,"duree_conservation_annees":6,"exif_geotag":true},
  {"code":"mandat_cee_signe","label":"Mandat CEE signé entre le bénéficiaire et le mandataire/délégataire","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6,"signature_eidas":"avance"},
  {"code":"justificatif_versement_prime","label":"Justificatif de versement de la prime (RIB + preuve virement)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"preuve_information_precontractuelle","label":"Preuve d''information précontractuelle (mention absence d''exigence RGE pour cette fiche)","source":"loi 2025-594 art. 13","obligatoire":true,"duree_conservation_annees":6},
  {"code":"avis_imposition_n_minus_2","label":"Avis d''imposition N-2 du bénéficiaire (si ménage précaire/très précaire)","source":"arrêté 04/09/2014 annexe 7","obligatoire":false,"condition":"precarite_only","duree_conservation_annees":6},
  {"code":"declaration_composition_foyer","label":"Déclaration sur l''honneur de la composition du foyer (si ménage précaire/très précaire)","source":"arrêté 04/09/2014 annexe 7","obligatoire":false,"condition":"precarite_only","duree_conservation_annees":6}
]'::jsonb,
       updated_at = now()
 WHERE code IN ('BAR-TH-173','BAR-SE-104')
   AND is_active = TRUE;

-- -----------------------------------------------------------------------------
-- GROUPE 9 — Rénovation d'ampleur BAR-TH-174 / 175 (MAR + audit + multi-gestes)
-- Socle + audit énergétique + contrat MAR + rapport gain DPE
-- -----------------------------------------------------------------------------
UPDATE cee_operations
   SET justificatifs_requis = '[
  {"code":"attestation_honneur","label":"Attestation sur l''honneur signée bénéficiaire + professionnel (modèle annexe 7)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6,"signature_eidas":"avance"},
  {"code":"facture_detaillee","label":"Factures détaillées de chaque geste de rénovation (identité bénéficiaire, date, adresse, description, marque/modèle, performances)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"devis_signe_anterieur_engagement","label":"Devis signés datés pour chaque geste, antérieurs à toute visite technique ou commande","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"certificat_rge_valide_a_date_engagement","label":"Certificats RGE par geste en cours de validité à la date d''engagement","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"photos_horodatees_geolocalisees_avant_apres","label":"Photos avant et après travaux de chaque geste, horodatées et géolocalisées (EXIF conservé)","source":"loi 2025-594 art. 13","obligatoire":true,"duree_conservation_annees":6,"exif_geotag":true},
  {"code":"mandat_cee_signe","label":"Mandat CEE signé entre le bénéficiaire et le mandataire/délégataire","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6,"signature_eidas":"avance"},
  {"code":"justificatif_versement_prime","label":"Justificatif de versement de la prime (RIB + preuve virement)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"preuve_information_precontractuelle","label":"Preuve d''information précontractuelle (notice RGE remise au client)","source":"loi 2025-594 art. 13","obligatoire":true,"duree_conservation_annees":6},
  {"code":"audit_energetique_avant_travaux","label":"Audit énergétique réalisé avant engagement (scénarios, gain de classe DPE attendu)","source":"arrêté DGEC BAR-TH-174/175","obligatoire":true,"duree_conservation_annees":6},
  {"code":"contrat_mon_accompagnateur_renov","label":"Contrat avec Mon Accompagnateur Rénov'' (MAR) agréé Anah","source":"arrêté DGEC BAR-TH-174/175","obligatoire":true,"duree_conservation_annees":6},
  {"code":"rapport_gain_dpe_post_travaux","label":"DPE post-travaux démontrant le gain d''au moins 2 classes","source":"arrêté DGEC BAR-TH-174/175","obligatoire":true,"duree_conservation_annees":6},
  {"code":"avis_imposition_n_minus_2","label":"Avis d''imposition N-2 du bénéficiaire (si ménage précaire/très précaire)","source":"arrêté 04/09/2014 annexe 7","obligatoire":false,"condition":"precarite_only","duree_conservation_annees":6},
  {"code":"declaration_composition_foyer","label":"Déclaration sur l''honneur de la composition du foyer (si ménage précaire/très précaire)","source":"arrêté 04/09/2014 annexe 7","obligatoire":false,"condition":"precarite_only","duree_conservation_annees":6}
]'::jsonb,
       updated_at = now()
 WHERE code IN ('BAR-TH-174','BAR-TH-175')
   AND is_active = TRUE;

-- -----------------------------------------------------------------------------
-- GROUPE 10 — Géothermie collective BAR-TH-178
-- Socle + note dim + étude géothermique + Qualiforage + Eurovent + bon commande
-- -----------------------------------------------------------------------------
UPDATE cee_operations
   SET justificatifs_requis = '[
  {"code":"attestation_honneur","label":"Attestation sur l''honneur signée bénéficiaire (syndic/maître d''ouvrage) + professionnel (modèle annexe 7)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6,"signature_eidas":"avance"},
  {"code":"facture_detaillee","label":"Facture détaillée (identité bénéficiaire, date, adresse, description système géothermique, puissance, ETAS)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"devis_signe_anterieur_engagement","label":"Devis signé daté du dispositif de captage, antérieur à toute commande (date d''engagement = signature devis captage)","source":"arrêté DGEC BAR-TH-178","obligatoire":true,"duree_conservation_annees":6},
  {"code":"certificat_rge_valide_a_date_engagement","label":"Certificats RGE Études OPQIBI 10.07 (étude ressource) et 20.13 (ingénierie) + QualiPAC/QualiForage (installation)","source":"arrêté DGEC BAR-TH-178 vA75-1","obligatoire":true,"duree_conservation_annees":6},
  {"code":"photos_horodatees_geolocalisees_avant_apres","label":"Photos avant et après travaux, horodatées et géolocalisées (EXIF conservé)","source":"loi 2025-594 art. 13","obligatoire":true,"duree_conservation_annees":6,"exif_geotag":true},
  {"code":"mandat_cee_signe","label":"Mandat CEE signé entre le bénéficiaire et le mandataire/délégataire","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6,"signature_eidas":"avance"},
  {"code":"justificatif_versement_prime","label":"Justificatif de versement de la prime (RIB + preuve virement)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"preuve_information_precontractuelle","label":"Preuve d''information précontractuelle (notice RGE remise au client)","source":"loi 2025-594 art. 13","obligatoire":true,"duree_conservation_annees":6},
  {"code":"note_dimensionnement_chauffage_signee","label":"Note de dimensionnement du système de chauffage signée par le professionnel","source":"arrêté DGEC BAR-TH-178","obligatoire":true,"duree_conservation_annees":6},
  {"code":"etude_geothermique","label":"Étude de la ressource géothermique (dimensionnement champ de sondes, tests de réponse thermique)","source":"arrêté DGEC BAR-TH-178","obligatoire":true,"duree_conservation_annees":6},
  {"code":"certificat_qualiforage","label":"Certificat Qualiforage de l''entreprise réalisant le forage (ou équivalent)","source":"arrêté DGEC BAR-TH-178","obligatoire":true,"duree_conservation_annees":6},
  {"code":"certificat_eurovent_ou_nf_pac","label":"Certificat Eurovent ou NF PAC (ou équivalent) pour les PAC installées","source":"arrêté DGEC BAR-TH-178","obligatoire":true,"duree_conservation_annees":6},
  {"code":"bon_commande_materiel","label":"Bon de commande du matériel (traçabilité chaîne d''approvisionnement anti-fraude)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"avis_imposition_n_minus_2","label":"Avis d''imposition N-2 du bénéficiaire (si ménage précaire/très précaire)","source":"arrêté 04/09/2014 annexe 7","obligatoire":false,"condition":"precarite_only","duree_conservation_annees":6},
  {"code":"declaration_composition_foyer","label":"Déclaration sur l''honneur de la composition du foyer (si ménage précaire/très précaire)","source":"arrêté 04/09/2014 annexe 7","obligatoire":false,"condition":"precarite_only","duree_conservation_annees":6}
]'::jsonb,
       updated_at = now()
 WHERE code = 'BAR-TH-178'
   AND is_active = TRUE;

-- -----------------------------------------------------------------------------
-- GROUPE 11 — PAC collective air/eau BAR-TH-179
-- Socle + note dim + Eurovent + bon commande (pas de forage)
-- -----------------------------------------------------------------------------
UPDATE cee_operations
   SET justificatifs_requis = '[
  {"code":"attestation_honneur","label":"Attestation sur l''honneur signée bénéficiaire (syndic/maître d''ouvrage) + professionnel (modèle annexe 7)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6,"signature_eidas":"avance"},
  {"code":"facture_detaillee","label":"Facture détaillée (identité bénéficiaire, date, adresse, marque/modèle PAC collective, puissance, ETAS, émetteurs basse température)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"devis_signe_anterieur_engagement","label":"Devis signé daté, antérieur à toute visite technique ou commande","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"certificat_rge_valide_a_date_engagement","label":"Certificat RGE QualiPAC (module adapté aux installations collectives) en cours de validité à la date d''engagement","source":"arrêté DGEC BAR-TH-179 vA75-1","obligatoire":true,"duree_conservation_annees":6},
  {"code":"photos_horodatees_geolocalisees_avant_apres","label":"Photos avant et après travaux, horodatées et géolocalisées (EXIF conservé)","source":"loi 2025-594 art. 13","obligatoire":true,"duree_conservation_annees":6,"exif_geotag":true},
  {"code":"mandat_cee_signe","label":"Mandat CEE signé entre le bénéficiaire et le mandataire/délégataire","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6,"signature_eidas":"avance"},
  {"code":"justificatif_versement_prime","label":"Justificatif de versement de la prime (RIB + preuve virement)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"preuve_information_precontractuelle","label":"Preuve d''information précontractuelle (notice RGE remise au client)","source":"loi 2025-594 art. 13","obligatoire":true,"duree_conservation_annees":6},
  {"code":"note_dimensionnement_chauffage_signee","label":"Note de dimensionnement du générateur signée par le professionnel (déperditions immeuble, régime d''eau, puissance)","source":"arrêté DGEC BAR-TH-179","obligatoire":true,"duree_conservation_annees":6},
  {"code":"certificat_eurovent_ou_nf_pac","label":"Certificat Eurovent ou NF PAC (ou équivalent) pour la PAC collective installée","source":"arrêté DGEC BAR-TH-179","obligatoire":true,"duree_conservation_annees":6},
  {"code":"bon_commande_materiel","label":"Bon de commande du matériel (traçabilité chaîne d''approvisionnement anti-fraude)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"avis_imposition_n_minus_2","label":"Avis d''imposition N-2 du bénéficiaire (si ménage précaire/très précaire)","source":"arrêté 04/09/2014 annexe 7","obligatoire":false,"condition":"precarite_only","duree_conservation_annees":6},
  {"code":"declaration_composition_foyer","label":"Déclaration sur l''honneur de la composition du foyer (si ménage précaire/très précaire)","source":"arrêté 04/09/2014 annexe 7","obligatoire":false,"condition":"precarite_only","duree_conservation_annees":6}
]'::jsonb,
       updated_at = now()
 WHERE code = 'BAR-TH-179'
   AND is_active = TRUE;

-- -----------------------------------------------------------------------------
-- GROUPE 12 — PAC collective eau/eau ou eau glycolée/eau BAR-TH-180
-- Socle + note dim + Qualiforage (si captage) + Eurovent + bon commande
-- -----------------------------------------------------------------------------
UPDATE cee_operations
   SET justificatifs_requis = '[
  {"code":"attestation_honneur","label":"Attestation sur l''honneur signée bénéficiaire (syndic/maître d''ouvrage) + professionnel (modèle annexe 7)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6,"signature_eidas":"avance"},
  {"code":"facture_detaillee","label":"Facture détaillée (identité bénéficiaire, date, adresse, marque/modèle PAC, type de captage, puissance, ETAS)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"devis_signe_anterieur_engagement","label":"Devis signé daté, antérieur à toute visite technique ou commande","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"certificat_rge_valide_a_date_engagement","label":"Certificat RGE QualiPAC et, si forage, QualiForage, en cours de validité à la date d''engagement","source":"arrêté DGEC BAR-TH-180 vA75-1","obligatoire":true,"duree_conservation_annees":6},
  {"code":"photos_horodatees_geolocalisees_avant_apres","label":"Photos avant et après travaux, horodatées et géolocalisées (EXIF conservé)","source":"loi 2025-594 art. 13","obligatoire":true,"duree_conservation_annees":6,"exif_geotag":true},
  {"code":"mandat_cee_signe","label":"Mandat CEE signé entre le bénéficiaire et le mandataire/délégataire","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6,"signature_eidas":"avance"},
  {"code":"justificatif_versement_prime","label":"Justificatif de versement de la prime (RIB + preuve virement)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"preuve_information_precontractuelle","label":"Preuve d''information précontractuelle (notice RGE remise au client)","source":"loi 2025-594 art. 13","obligatoire":true,"duree_conservation_annees":6},
  {"code":"note_dimensionnement_chauffage_signee","label":"Note de dimensionnement du générateur signée par le professionnel","source":"arrêté DGEC BAR-TH-180","obligatoire":true,"duree_conservation_annees":6},
  {"code":"etude_geothermique","label":"Étude de la ressource géothermique (dimensionnement captage, débits, sondes)","source":"arrêté DGEC BAR-TH-180","obligatoire":true,"duree_conservation_annees":6},
  {"code":"certificat_qualiforage","label":"Certificat Qualiforage de l''entreprise réalisant le forage (si captage par forage)","source":"arrêté DGEC BAR-TH-180","obligatoire":true,"duree_conservation_annees":6},
  {"code":"certificat_eurovent_ou_nf_pac","label":"Certificat Eurovent ou NF PAC (ou équivalent) pour la PAC collective installée","source":"arrêté DGEC BAR-TH-180","obligatoire":true,"duree_conservation_annees":6},
  {"code":"bon_commande_materiel","label":"Bon de commande du matériel (traçabilité chaîne d''approvisionnement anti-fraude)","source":"arrêté 04/09/2014 annexe 7","obligatoire":true,"duree_conservation_annees":6},
  {"code":"avis_imposition_n_minus_2","label":"Avis d''imposition N-2 du bénéficiaire (si ménage précaire/très précaire)","source":"arrêté 04/09/2014 annexe 7","obligatoire":false,"condition":"precarite_only","duree_conservation_annees":6},
  {"code":"declaration_composition_foyer","label":"Déclaration sur l''honneur de la composition du foyer (si ménage précaire/très précaire)","source":"arrêté 04/09/2014 annexe 7","obligatoire":false,"condition":"precarite_only","duree_conservation_annees":6}
]'::jsonb,
       updated_at = now()
 WHERE code = 'BAR-TH-180'
   AND is_active = TRUE;

COMMIT;
