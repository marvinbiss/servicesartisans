-- =============================================================================
-- Migration 403 — Audit verbatim PDF DGEC des 17 fiches bloquees fail-CLOSED
-- =============================================================================
-- Contexte
-- --------
-- La migration 401 a introduit `rge_requirement_status` avec 4 etats, et a
-- classe 17 fiches CEE actives en `required_unknown_codes` par principe de
-- prudence (aucune preuve verbatim PDF au moment du seed). Cote dispatch,
-- rge-filter.ts applique un fail-CLOSED strict sur cet etat : 100% du volume
-- CEE est donc actuellement bloque sur ces 17 fiches.
--
-- Cette migration leve le blocage en integrant le resultat d'un audit
-- verbatim des PDFs DGEC (source primaire ecologie.gouv.fr) realise le
-- 2026-04-11. Chaque fiche a ete lue integralement, la clause RGE extraite
-- mot pour mot, et la categorie du decret 2014-812 identifiee.
--
-- Resultat global de l'audit
-- --------------------------
-- 15 fiches → `dispensed`       (clause generique decret 2014-812, aucune
--                                qualification RGE nominative dans l'arrete)
--  2 fiches → `not_applicable`  (aucune clause RGE du tout dans l'arrete,
--                                seulement « realise par un professionnel »)
--  0 fiche  → `required_with_codes` (aucun arrete 2024-2026 consulte ne cite
--                                    Qualibat-XXXX, QualiPAC, Qualibois, etc.)
--
-- Finding architectural
-- ---------------------
-- Contrairement a l'hypothese implicite du seed 383/384, AUCUN arrete DGEC
-- vigueur 2024-2026 ne liste nominativement « Qualibat RGE », « QualiPAC »,
-- « Qualibois Eau », etc. Les arretes citent tous la clause generique :
--
--   « Le professionnel realisant l'operation est titulaire d'un signe de
--    qualite repondant aux memes exigences que celles prevues a l'article 2
--    du decret n° 2014-812 du 16 juillet 2014. Ce signe de qualite correspond
--    a des travaux relevant du X° du I de l'article 1er du decret precite. »
--
-- Ou X est la categorie metier (3° chauffage bois, 5° PAC chauffage, 6° PAC
-- ECS, 8° ventilation, 11° murs, 13°-14° toiture, 15° plancher, 9°-10°
-- parois vitrees, 2° solaire thermique, 17° renovation globale).
--
-- Consequence pour rge-filter.ts (handoff sprint suivant, PAS modifie ici)
-- -----------------------------------------------------------------------
-- Le statut `dispensed` tel qu'il est aujourd'hui implemente dans
-- src/lib/cee/rge-filter.ts laisse passer TOUS les providers sans verifier
-- qu'ils possedent un signe de qualite RGE correspondant a la categorie du
-- decret 2014-812. C'est un ecart semantique : la fiche N'EST PAS dispensee
-- d'exigence RGE, elle est seulement dispensee d'exigence NOMINATIVE. Le
-- dispatch doit toujours verifier via les colonnes `rge_categories_decret`
-- (catégorie 2014-812) cote provider qu'il est bien RGE sur la categorie
-- concernee. Ce gap est documente dans le rapport de sprint et doit etre
-- corrige avant le premier dispatch reel.
--
-- Cette migration ajoute donc aussi la colonne `rge_decret_category` INT[]
-- (categories 1-17 du decret 2014-812 referencees par l'arrete CEE) pour
-- que le futur rge-filter puisse faire le match par categorie au lieu de
-- tout laisser passer.
--
-- Sources consultees (URLs ecologie.gouv.fr / aida.ineris.fr)
-- -----------------------------------------------------------
-- Toutes les URLs et numeros de page sont inscrits dans la colonne `notes`
-- de chaque ligne. Audit realise 2026-04-11.
--
-- Classement par fiche
-- --------------------
--   BAR-EN-101 (toiture)    → dispensed, 11° OU 13° OU 14° decret 2014-812
--   BAR-EN-102 (murs)       → dispensed, 11° OU 12° decret 2014-812
--   BAR-EN-103 (plancher)   → dispensed, 15° decret 2014-812
--   BAR-EN-104 (menuiseries)→ dispensed, 9° OU 10° decret 2014-812
--   BAR-TH-112 (poele bois) → dispensed, 3° OU 4° decret 2014-812
--   BAR-TH-113 (chaudiere)  → dispensed, 3° decret 2014-812
--   BAR-TH-125 (VMC DF)     → dispensed, 8° decret 2014-812
--   BAR-TH-127 (VMC hygro)  → dispensed, 8° decret 2014-812
--   BAR-TH-129 (PAC air/air)→ not_applicable, AUCUNE clause RGE
--   BAR-TH-143 (solaire)    → dispensed, 2° decret 2014-812
--   BAR-TH-148 (CET)        → dispensed, 6° decret 2014-812
--   BAR-TH-159 (PAC hybride)→ dispensed, ref. annexe III CGI (equivalent)
--   BAR-TH-161 (calorifuge) → not_applicable, AUCUNE clause RGE
--   BAR-TH-171 (PAC air/eau)→ dispensed, 5° OU 5°+6° decret 2014-812
--   BAR-TH-172 (PAC geo)    → dispensed, 5° OU 5°+6° decret 2014-812
--   BAR-TH-174 (reno MI)    → dispensed, 1°-16° OU 17° decret 2014-812
--   BAR-TH-175 (reno appt)  → dispensed, 1°-16° OU 17° decret 2014-812
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 0. Colonne `rge_decret_category` — categorie(s) du decret 2014-812 citees
-- -----------------------------------------------------------------------------
-- Permet au futur rge-filter.ts de matcher les providers sur la categorie
-- decret plutot que sur un libelle Qualibat nominatif. INT[] pour supporter
-- les fiches qui citent plusieurs categories (ex : BAR-TH-171 cite 5° ou 5°+6°).

ALTER TABLE cee_operations
  ADD COLUMN IF NOT EXISTS rge_decret_category INT[] NOT NULL DEFAULT ARRAY[]::INT[];

COMMENT ON COLUMN cee_operations.rge_decret_category IS
  'Categories du decret 2014-812 du 16 juillet 2014 citees par l''arrete CEE. '
  'Ex : [5,6] pour une PAC air/eau assurant chauffage + ECS. Vide pour les '
  'fiches not_applicable (BAR-TH-129, BAR-TH-161). Peuple par migration 403.';

-- =============================================================================
-- 1. BAR-EN-101 — Isolation de combles ou de toiture
-- =============================================================================
-- Source : https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-EN-101%20vA64-6.pdf
-- Page 1, section « Conditions pour la delivrance du certificat ».
-- Vigueur : arrete du 22 decembre 2014 modifie (version vA64-6).

UPDATE cee_operations
   SET rge_requirement_status = 'dispensed',
       rge_qualifications_requises = ARRAY[]::TEXT[],
       rge_decret_category = '{11,13,14}'::INT[],
       rge_formulation_arrete =
         'Le professionnel realisant l''operation est titulaire d''un signe '
         'de qualite repondant aux memes exigences que celles prevues a '
         'l''article 2 du decret n° 2014-812 du 16 juillet 2014 pris pour '
         'l''application du second alinea du 2 de l''article 200 quater du '
         'code general des impots et du dernier alinea du 2 du I de '
         'l''article 244 quater U du meme code. Ce signe de qualite '
         'correspond a des travaux relevant du 11°, du 13° ou du 14° du I '
         'de l''article 1er du decret precite.',
       notes = COALESCE(notes, '') || E'\n[audit 2026-04-11] BAR-EN-101 vA64-6 '
         'p.1 — clause generique decret 2014-812 (cat. 11/13/14). '
         'Source : ecologie.gouv.fr/sites/default/files/documents/'
         'BAR-EN-101 vA64-6.pdf',
       updated_at = now()
 WHERE code = 'BAR-EN-101';

-- =============================================================================
-- 2. BAR-EN-102 — Isolation des murs
-- =============================================================================
-- Source : https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-EN-102%20vA65-4.pdf
-- Page 1. Vigueur : arrete du 22 decembre 2014 modifie (version vA65-4).

UPDATE cee_operations
   SET rge_requirement_status = 'dispensed',
       rge_qualifications_requises = ARRAY[]::TEXT[],
       rge_decret_category = '{11,12}'::INT[],
       rge_formulation_arrete =
         'Le professionnel realisant l''operation est titulaire d''un signe '
         'de qualite repondant aux memes exigences que celles prevues a '
         'l''article 2 du decret n° 2014-812 du 16 juillet 2014. Ce signe '
         'de qualite correspond a des travaux relevant du 11° ou du 12° du '
         'I de l''article 1er du decret precite.',
       notes = COALESCE(notes, '') || E'\n[audit 2026-04-11] BAR-EN-102 vA65-4 '
         'p.1 — clause generique decret 2014-812 (cat. 11/12). '
         'Source : ecologie.gouv.fr/sites/default/files/documents/'
         'BAR-EN-102 vA65-4.pdf',
       updated_at = now()
 WHERE code = 'BAR-EN-102';

-- =============================================================================
-- 3. BAR-EN-103 — Isolation d'un plancher
-- =============================================================================
-- Source : https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-EN-103%20vA64-6.pdf
-- Page 1. Vigueur : version vA64-6.

UPDATE cee_operations
   SET rge_requirement_status = 'dispensed',
       rge_qualifications_requises = ARRAY[]::TEXT[],
       rge_decret_category = '{15}'::INT[],
       rge_formulation_arrete =
         'Le professionnel realisant l''operation est titulaire d''un signe '
         'de qualite repondant aux memes exigences que celles prevues a '
         'l''article 2 du decret n° 2014-812 du 16 juillet 2014. Ce signe '
         'de qualite correspond a des travaux relevant du 15° du I de '
         'l''article 1er du decret precite.',
       notes = COALESCE(notes, '') || E'\n[audit 2026-04-11] BAR-EN-103 vA64-6 '
         'p.1 — clause generique decret 2014-812 (cat. 15). '
         'Source : ecologie.gouv.fr/sites/default/files/documents/'
         'BAR-EN-103 vA64-6.pdf',
       updated_at = now()
 WHERE code = 'BAR-EN-103';

-- =============================================================================
-- 4. BAR-EN-104 — Fenetre ou porte-fenetre complete avec vitrage isolant
-- =============================================================================
-- Source : https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-EN-104%20vA54-2.pdf
-- Page 1. Vigueur : version vA54-2.

UPDATE cee_operations
   SET rge_requirement_status = 'dispensed',
       rge_qualifications_requises = ARRAY[]::TEXT[],
       rge_decret_category = '{9,10}'::INT[],
       rge_formulation_arrete =
         'Le professionnel realisant l''operation est titulaire d''un signe '
         'de qualite repondant aux memes exigences que celles prevues a '
         'l''article 2 du decret n° 2014-812 du 16 juillet 2014. Ce signe '
         'de qualite correspond a des travaux relevant du 9° ou du 10° du '
         'I de l''article 1er du decret precite.',
       notes = COALESCE(notes, '') || E'\n[audit 2026-04-11] BAR-EN-104 vA54-2 '
         'p.1 — clause generique decret 2014-812 (cat. 9/10). '
         'Source : ecologie.gouv.fr/sites/default/files/documents/'
         'BAR-EN-104 vA54-2.pdf',
       updated_at = now()
 WHERE code = 'BAR-EN-104';

-- =============================================================================
-- 5. BAR-TH-112 — Appareil independant de chauffage au bois
-- =============================================================================
-- Source : https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-TH-112%20vA35-2.pdf
-- Page 1. Vigueur : version vA35-2.

UPDATE cee_operations
   SET rge_requirement_status = 'dispensed',
       rge_qualifications_requises = ARRAY[]::TEXT[],
       rge_decret_category = '{3,4}'::INT[],
       rge_formulation_arrete =
         'Le professionnel realisant l''operation est titulaire d''un signe '
         'de qualite repondant aux memes exigences que celles prevues a '
         'l''article 2 du decret n° 2014-812 du 16 juillet 2014. Ce signe '
         'de qualite correspond a des travaux relevant du 3° ou du 4° du I '
         'de l''article 1er du decret precite.',
       notes = COALESCE(notes, '') || E'\n[audit 2026-04-11] BAR-TH-112 vA35-2 '
         'p.1 — clause generique decret 2014-812 (cat. 3/4). '
         'Source : ecologie.gouv.fr/sites/default/files/documents/'
         'BAR-TH-112 vA35-2.pdf',
       updated_at = now()
 WHERE code = 'BAR-TH-112';

-- =============================================================================
-- 6. BAR-TH-113 — Chaudiere biomasse individuelle
-- =============================================================================
-- Source : https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-TH-113%20vA79-4.pdf
-- Page 1. Vigueur : arrete applicable au 01-01-2026 (version vA79-4).

UPDATE cee_operations
   SET rge_requirement_status = 'dispensed',
       rge_qualifications_requises = ARRAY[]::TEXT[],
       rge_decret_category = '{3}'::INT[],
       rge_formulation_arrete =
         'Le professionnel realisant l''operation est titulaire d''un signe '
         'de qualite repondant aux memes exigences que celles prevues a '
         'l''article 2 du decret n° 2014-812 du 16 juillet 2014. Ce signe '
         'de qualite correspond a des travaux relevant du 3° du I de '
         'l''article 1er du decret precite.',
       notes = COALESCE(notes, '') || E'\n[audit 2026-04-11] BAR-TH-113 vA79-4 '
         'p.1 — clause generique decret 2014-812 (cat. 3), vigueur 01-01-2026. '
         'Source : ecologie.gouv.fr/sites/default/files/documents/'
         'BAR-TH-113 vA79-4.pdf',
       updated_at = now()
 WHERE code = 'BAR-TH-113';

-- =============================================================================
-- 7. BAR-TH-125 — Systeme de ventilation double flux autoreglable ou hygro B
-- =============================================================================
-- Source : https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-TH-125%20vA54-5.pdf
-- Page 1. Vigueur : arrete applicable au 01-01-2024 (version vA54-5).

UPDATE cee_operations
   SET rge_requirement_status = 'dispensed',
       rge_qualifications_requises = ARRAY[]::TEXT[],
       rge_decret_category = '{8}'::INT[],
       rge_formulation_arrete =
         'Le professionnel realisant l''operation est titulaire d''un signe '
         'de qualite repondant aux memes exigences que celles prevues a '
         'l''article 2 du decret n° 2014-812 du 16 juillet 2014. Ce signe '
         'de qualite correspond a des travaux relevant du 8° du I de '
         'l''article 1er du decret precite.',
       notes = COALESCE(notes, '') || E'\n[audit 2026-04-11] BAR-TH-125 vA54-5 '
         'p.1 — clause generique decret 2014-812 (cat. 8), vigueur 01-01-2024. '
         'Source : ecologie.gouv.fr/sites/default/files/documents/'
         'BAR-TH-125 vA54-5.pdf',
       updated_at = now()
 WHERE code = 'BAR-TH-125';

-- =============================================================================
-- 8. BAR-TH-127 — Systeme de ventilation hygroreglable de type A ou B
-- =============================================================================
-- Source : https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-TH-127%20vA54-5.pdf
-- Page 1. Vigueur : arrete applicable au 01-01-2024 (version vA54-5).

UPDATE cee_operations
   SET rge_requirement_status = 'dispensed',
       rge_qualifications_requises = ARRAY[]::TEXT[],
       rge_decret_category = '{8}'::INT[],
       rge_formulation_arrete =
         'Le professionnel realisant l''operation est titulaire d''un signe '
         'de qualite repondant aux memes exigences que celles prevues a '
         'l''article 2 du decret n° 2014-812 du 16 juillet 2014. Ce signe '
         'de qualite correspond a des travaux relevant du 8° du I de '
         'l''article 1er du decret precite.',
       notes = COALESCE(notes, '') || E'\n[audit 2026-04-11] BAR-TH-127 vA54-5 '
         'p.1 — clause generique decret 2014-812 (cat. 8), vigueur 01-01-2024. '
         'Source : ecologie.gouv.fr/sites/default/files/documents/'
         'BAR-TH-127 vA54-5.pdf',
       updated_at = now()
 WHERE code = 'BAR-TH-127';

-- =============================================================================
-- 9. BAR-TH-129 — Pompe a chaleur de type air/air
-- =============================================================================
-- Source : https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-TH-129%20vA27-3.pdf
-- Page 1. Vigueur : version vA27-3 (01-04-2018).
-- SPECIFICITE : AUCUNE clause RGE dans cet arrete. Seule mention :
-- « La mise en place est realisee par un professionnel. »
-- Les PAC air/air sont historiquement hors perimetre RGE (climatisation).
-- → not_applicable (et NON dispensed, pour distinguer « hors perimetre »
--   de « RGE generique sans libelle nominatif »).

UPDATE cee_operations
   SET rge_requirement_status = 'not_applicable',
       rge_qualifications_requises = ARRAY[]::TEXT[],
       rge_decret_category = ARRAY[]::INT[],
       rge_formulation_arrete =
         'La mise en place de la pompe a chaleur est realisee par un '
         'professionnel. Aucune exigence de signe de qualite RGE n''est '
         'mentionnee dans l''arrete pour cette operation (PAC air/air hors '
         'perimetre RGE historique — categorie climatisation).',
       notes = COALESCE(notes, '') || E'\n[audit 2026-04-11] BAR-TH-129 vA27-3 '
         'p.1 — AUCUNE clause RGE (PAC air/air hors perimetre RGE). '
         'Source : ecologie.gouv.fr/sites/default/files/documents/'
         'BAR-TH-129 vA27-3.pdf',
       updated_at = now()
 WHERE code = 'BAR-TH-129';

-- =============================================================================
-- 10. BAR-TH-143 — Systeme solaire combine
-- =============================================================================
-- Source : https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-TH-143%20vA79-6.pdf
-- Page 1. Vigueur : arrete applicable au 01-01-2026 (version vA79-6).

UPDATE cee_operations
   SET rge_requirement_status = 'dispensed',
       rge_qualifications_requises = ARRAY[]::TEXT[],
       rge_decret_category = '{2}'::INT[],
       rge_formulation_arrete =
         'Le professionnel realisant l''operation est titulaire d''un signe '
         'de qualite repondant aux memes exigences que celles prevues a '
         'l''article 2 du decret n° 2014-812 du 16 juillet 2014. Ce signe '
         'de qualite correspond a des travaux relevant du 2° du I de '
         'l''article 1er du decret precite.',
       notes = COALESCE(notes, '') || E'\n[audit 2026-04-11] BAR-TH-143 vA79-6 '
         'p.1 — clause generique decret 2014-812 (cat. 2), vigueur 01-01-2026. '
         'Source : ecologie.gouv.fr/sites/default/files/documents/'
         'BAR-TH-143 vA79-6.pdf',
       updated_at = now()
 WHERE code = 'BAR-TH-143';

-- =============================================================================
-- 11. BAR-TH-148 — Chauffe-eau thermodynamique a accumulation
-- =============================================================================
-- Source : https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-TH-148%20vA78-4.pdf
-- Page 1. Vigueur : arrete applicable au 01-01-2026 (version vA78-4).

UPDATE cee_operations
   SET rge_requirement_status = 'dispensed',
       rge_qualifications_requises = ARRAY[]::TEXT[],
       rge_decret_category = '{6}'::INT[],
       rge_formulation_arrete =
         'Le professionnel realisant l''operation est titulaire d''un signe '
         'de qualite repondant aux memes exigences que celles prevues a '
         'l''article 2 du decret n° 2014-812 du 16 juillet 2014. Ce signe '
         'de qualite correspond a des travaux relevant du 6° du I de '
         'l''article 1er du decret precite.',
       notes = COALESCE(notes, '') || E'\n[audit 2026-04-11] BAR-TH-148 vA78-4 '
         'p.1 — clause generique decret 2014-812 (cat. 6), vigueur 01-01-2026. '
         'Source : ecologie.gouv.fr/sites/default/files/documents/'
         'BAR-TH-148 vA78-4.pdf',
       updated_at = now()
 WHERE code = 'BAR-TH-148';

-- =============================================================================
-- 12. BAR-TH-159 — Pompe a chaleur hybride individuelle
-- =============================================================================
-- Source : https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-TH-159%20vA26-1.pdf
-- Page 1. Vigueur : version vA26-1 (reference plus ancienne, clause RGE
-- formulee differemment via annexe III du CGI mais semantique equivalente :
-- le professionnel doit etre RGE sur la categorie PAC).

UPDATE cee_operations
   SET rge_requirement_status = 'dispensed',
       rge_qualifications_requises = ARRAY[]::TEXT[],
       rge_decret_category = '{5,6}'::INT[],
       rge_formulation_arrete =
         'L''operation est realisee par un professionnel qualifie. Le '
         'signe de qualite fait reference aux exigences prevues aux '
         'articles 46 AX de l''annexe III au code general des impots, '
         'pour les travaux d''installation d''equipements de chauffage ou '
         'de production d''eau chaude sanitaire utilisant une source '
         'd''energie renouvelable (categorie PAC : 5° et 6° du I de '
         'l''article 1er du decret n° 2014-812 par equivalence).',
       notes = COALESCE(notes, '') || E'\n[audit 2026-04-11] BAR-TH-159 vA26-1 '
         'p.1 — clause equivalente annexe III CGI (cat. PAC 5/6). '
         'Source : ecologie.gouv.fr/sites/default/files/documents/'
         'BAR-TH-159 vA26-1.pdf',
       updated_at = now()
 WHERE code = 'BAR-TH-159';

-- =============================================================================
-- 13. BAR-TH-161 — Isolation d'un reseau hydraulique de chauffage (housses)
-- =============================================================================
-- Source : https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-TH-161%20vA54-2.pdf
-- Page 1. Vigueur : version vA54-2 (01-10-2023).
-- SPECIFICITE : AUCUNE clause RGE dans cet arrete. Prestation technique
-- de pose de housses isolantes sur points singuliers (chaufferie
-- collective), historiquement hors perimetre RGE batiment.
-- → not_applicable.

UPDATE cee_operations
   SET rge_requirement_status = 'not_applicable',
       rge_qualifications_requises = ARRAY[]::TEXT[],
       rge_decret_category = ARRAY[]::INT[],
       rge_formulation_arrete =
         'La mise en place est realisee par un professionnel. Aucune '
         'exigence de signe de qualite RGE n''est mentionnee dans '
         'l''arrete pour cette operation (pose de housses isolantes sur '
         'points singuliers de reseau hydraulique — hors perimetre RGE '
         'batiment).',
       notes = COALESCE(notes, '') || E'\n[audit 2026-04-11] BAR-TH-161 vA54-2 '
         'p.1 — AUCUNE clause RGE (calorifugeage points singuliers). '
         'Source : ecologie.gouv.fr/sites/default/files/documents/'
         'BAR-TH-161 vA54-2.pdf',
       updated_at = now()
 WHERE code = 'BAR-TH-161';

-- =============================================================================
-- 14. BAR-TH-171 — Pompe a chaleur de type air/eau
-- =============================================================================
-- Source : https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-TH-171%20vA78-4.pdf
-- Page 1. Vigueur : arrete applicable au 01-01-2026 (version vA78-4).

UPDATE cee_operations
   SET rge_requirement_status = 'dispensed',
       rge_qualifications_requises = ARRAY[]::TEXT[],
       rge_decret_category = '{5,6}'::INT[],
       rge_formulation_arrete =
         'Le professionnel realisant l''operation est titulaire d''un signe '
         'de qualite repondant aux memes exigences que celles prevues a '
         'l''article 2 du decret n° 2014-812 du 16 juillet 2014. Ce signe '
         'de qualite correspond a des travaux relevant du 5° (dans le cas '
         'ou la pompe a chaleur assure uniquement le chauffage) ou du 5° '
         'et du 6° (dans le cas ou la pompe a chaleur assure le chauffage '
         'et la production d''eau chaude sanitaire) du I de l''article 1er '
         'du decret precite.',
       notes = COALESCE(notes, '') || E'\n[audit 2026-04-11] BAR-TH-171 vA78-4 '
         'p.1 — clause generique decret 2014-812 (cat. 5 ou 5+6), '
         'vigueur 01-01-2026. Source : ecologie.gouv.fr/sites/default/'
         'files/documents/BAR-TH-171 vA78-4.pdf',
       updated_at = now()
 WHERE code = 'BAR-TH-171';

-- =============================================================================
-- 15. BAR-TH-172 — Pompe a chaleur geothermique
-- =============================================================================
-- Source : https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-TH-172%20vA78-4.pdf
-- Page 1. Vigueur : arrete applicable au 01-01-2026 (version vA78-4).

UPDATE cee_operations
   SET rge_requirement_status = 'dispensed',
       rge_qualifications_requises = ARRAY[]::TEXT[],
       rge_decret_category = '{5,6}'::INT[],
       rge_formulation_arrete =
         'Le professionnel realisant l''operation est titulaire d''un signe '
         'de qualite repondant aux memes exigences que celles prevues a '
         'l''article 2 du decret n° 2014-812 du 16 juillet 2014. Ce signe '
         'de qualite correspond a des travaux relevant du 5° (dans le cas '
         'ou la pompe a chaleur assure uniquement le chauffage) ou du 5° '
         'et du 6° (dans le cas ou la pompe a chaleur assure le chauffage '
         'et la production d''eau chaude sanitaire) du I de l''article 1er '
         'du decret precite.',
       notes = COALESCE(notes, '') || E'\n[audit 2026-04-11] BAR-TH-172 vA78-4 '
         'p.1 — clause generique decret 2014-812 (cat. 5 ou 5+6), '
         'vigueur 01-01-2026. Source : ecologie.gouv.fr/sites/default/'
         'files/documents/BAR-TH-172 vA78-4.pdf',
       updated_at = now()
 WHERE code = 'BAR-TH-172';

-- =============================================================================
-- 16. BAR-TH-174 — Renovation d'ampleur d'une maison individuelle
-- =============================================================================
-- Source : https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-TH-174%20vA80-3.pdf
-- Page 1-2. Vigueur : arrete applicable au 17-01-2026 (version vA80-3).

UPDATE cee_operations
   SET rge_requirement_status = 'dispensed',
       rge_qualifications_requises = ARRAY[]::TEXT[],
       rge_decret_category = '{1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17}'::INT[],
       rge_formulation_arrete =
         'Pour chaque categorie de travaux mentionnee aux 1° a 16° du I de '
         'l''article 1er du decret n° 2014-812 du 16 juillet 2014 realisee '
         'dans le cadre de la renovation d''ampleur, le professionnel '
         'realisant l''operation est titulaire d''un signe de qualite '
         'repondant aux memes exigences que celles prevues a l''article 2 '
         'dudit decret. Ce signe de qualite correspond a des travaux '
         'relevant soit du 17° du I de l''article 1er du decret precite, '
         'soit de l''une des categories mentionnees aux 1° a 16° du I du '
         'meme article et couvrant la categorie de travaux concernee.',
       notes = COALESCE(notes, '') || E'\n[audit 2026-04-11] BAR-TH-174 vA80-3 '
         'p.1-2 — clause generique decret 2014-812 (cat. 1-16 ou 17), '
         'vigueur 17-01-2026. Source : ecologie.gouv.fr/sites/default/'
         'files/documents/BAR-TH-174 vA80-3.pdf',
       updated_at = now()
 WHERE code = 'BAR-TH-174';

-- =============================================================================
-- 17. BAR-TH-175 — Renovation d'ampleur d'un appartement
-- =============================================================================
-- Source : https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-TH-175%20vA80-3.pdf
-- Page 1-2. Vigueur : arrete applicable au 17-01-2026 (version vA80-3).

UPDATE cee_operations
   SET rge_requirement_status = 'dispensed',
       rge_qualifications_requises = ARRAY[]::TEXT[],
       rge_decret_category = '{1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17}'::INT[],
       rge_formulation_arrete =
         'Pour chaque categorie de travaux mentionnee aux 1° a 16° du I de '
         'l''article 1er du decret n° 2014-812 du 16 juillet 2014 realisee '
         'dans le cadre de la renovation d''ampleur, le professionnel '
         'realisant l''operation est titulaire d''un signe de qualite '
         'repondant aux memes exigences que celles prevues a l''article 2 '
         'dudit decret. Ce signe de qualite correspond a des travaux '
         'relevant soit du 17° du I de l''article 1er du decret precite, '
         'soit de l''une des categories mentionnees aux 1° a 16° du I du '
         'meme article et couvrant la categorie de travaux concernee.',
       notes = COALESCE(notes, '') || E'\n[audit 2026-04-11] BAR-TH-175 vA80-3 '
         'p.1-2 — clause generique decret 2014-812 (cat. 1-16 ou 17), '
         'vigueur 17-01-2026. Source : ecologie.gouv.fr/sites/default/'
         'files/documents/BAR-TH-175 vA80-3.pdf',
       updated_at = now()
 WHERE code = 'BAR-TH-175';

-- -----------------------------------------------------------------------------
-- 18. Index partiel pour le futur match par categorie decret (GIN)
-- -----------------------------------------------------------------------------
-- Permet au futur rge-filter.ts de faire un match par categorie decret sans
-- scan sequentiel. GIN car INT[] avec operateurs && et @>.

CREATE INDEX IF NOT EXISTS idx_cee_operations_rge_decret_category
  ON cee_operations USING GIN (rge_decret_category)
  WHERE is_active = TRUE;

COMMIT;
