-- =============================================================================
-- Migration 401 — Sémantique explicite des exigences RGE sur cee_operations
-- =============================================================================
-- Contexte
-- --------
-- La brique 1 bis (src/lib/cee/rge-filter.ts) s'appuie aujourd'hui uniquement
-- sur `rge_qualifications_requises TEXT[]`. Cette colonne est ambiguë :
--
--   * Un tableau vide `[]` peut signifier DEUX réalités opposées :
--       (a) la fiche est réellement dispensée de qualification RGE nominative
--           — l'arrêté renvoie simplement à l'article 2 du décret 2014-812
--           (ex : BAR-TH-179 et BAR-TH-180 vérifiés verbatim en migration 399) ;
--       (b) le seed 383/384 n'a pas encore été rempli pour cette fiche, par
--           exemple BAR-EN-108 et BAR-TH-173 où le commentaire migration 384
--           dit « RGE non requis » mais sans preuve PDF jointe à la session.
--
--   * Un tableau rempli avec un pattern court (ex : `['Qualibat RGE']`) peut
--     matcher large côté ADEME (substring normalisé dans rge-filter.ts), ce
--     qui reste acceptable côté filtrage mais NE GARANTIT PAS la conformité
--     PNCEE si la clause exacte de l'arrêté cite un numéro Qualibat précis.
--
-- Risque opérationnel
-- -------------------
-- Si un devis BAR-TH-171 (PAC air/eau, QualiPAC obligatoire côté arrêté DGEC
-- vA78-4) était dispatché à un artisan non-QualiPAC parce que le seed a été
-- mal rempli, le dossier CEE serait rejeté au dépôt PNCEE (prime perdue,
-- mandat caduc). On a besoin d'un état explicite avant le premier dispatch.
--
-- Solution
-- --------
-- Cette migration ajoute `rge_requirement_status TEXT` avec 4 valeurs
-- discriminantes, backfill explicite pour chaque fiche active, et un index
-- partiel pour les requêtes de filtrage.
--
-- États possibles
-- ---------------
--   1. 'required_with_codes'     — exigence RGE nominative confirmée par le
--                                  texte de l'arrêté (source PDF DGEC) ET les
--                                  libellés sont listés verbatim dans
--                                  `rge_qualifications_requises`.
--                                  → rge-filter.ts applique le match substring.
--
--   2. 'required_unknown_codes'  — une exigence RGE existe sur la fiche mais
--                                  la liste des libellés n'a pas été validée
--                                  contre une source primaire (PDF arrêté ou
--                                  annexe). Fail-CLOSED côté dispatch.
--                                  → rge-filter.ts bloque TOUS les providers
--                                    et émet un `logger.error` pour audit.
--
--   3. 'dispensed'               — l'arrêté ne cite AUCUNE qualification RGE
--                                  nominative. La fiche renvoie à l'article 2
--                                  du décret 2014-812 (professionnel RGE
--                                  générique) ou n'impose rien.
--                                  → rge-filter.ts laisse passer tous les
--                                    providers sur cette fiche.
--
--   4. 'not_applicable'          — la fiche n'entre pas du tout dans le
--                                  périmètre RGE (prestation technique sans
--                                  exigence environnement bâti : pose
--                                  d'électronique, équilibrage hydraulique,
--                                  etc.). Comportement identique à
--                                  'dispensed' côté filtrage.
--
-- Principe de prudence
-- --------------------
-- Tout code actif dont on n'a PAS la preuve verbatim PDF dans la session qui
-- a produit cette migration (migrations 383, 384, 397, 399 lues intégralement)
-- bascule en 'required_unknown_codes'. Aucun libellé de qualification RGE
-- n'est fabriqué dans cette migration : les codes existants dans
-- `rge_qualifications_requises` sont conservés tels quels pour faciliter le
-- futur audit, mais ils ne sont PAS activés tant que le statut reste unknown.
--
-- Sources consultées (verbatim)
-- -----------------------------
--   * Migration 383 — seed initial, libellés courts de type « Qualibat RGE »,
--     « QualiPAC », non vérifiés contre PDF ligne par ligne.
--   * Migration 384 — corrections P0/P1, commentaires explicites
--     « À confirmer PDF DGEC » sur toutes les lignes, ce qui veut dire que la
--     formulation exacte n'a PAS été reprise des PDFs au moment du seed.
--     Seules BAR-EN-108, BAR-TH-173, BAR-SE-104 sont explicitement marquées
--     comme SANS exigence RGE (commentaires lignes 114-121 pour BAR-EN-108,
--     lignes 214-226 pour BAR-TH-173, lignes 228-241 pour BAR-SE-104).
--   * Migration 399 — remplissage verbatim des PDFs vA75-1 pour BAR-TH-178,
--     BAR-TH-179, BAR-TH-180 (lignes 81-111 pour 178, 217-238 pour 179,
--     312-337 pour 180). Ces trois fiches sont les SEULES dont la clause RGE
--     a été extraite verbatim depuis les PDFs DGEC.
--   * Migration 397 — création initiale des fiches 178/179/180 avant
--     vérification PDF (tags « VÉRIF PDF REQUISE »). Surpassée par 399 pour
--     ces trois codes.
--
-- Backfill — classement par fiche active
-- --------------------------------------
--   * 'required_with_codes' : BAR-TH-178 (OPQIBI 10.07 + OPQIBI 20.13 verbatim
--     p.2 PDF BAR-TH-178 vA75-1, cf. migration 399 lignes 81-113).
--
--   * 'dispensed' : BAR-TH-179, BAR-TH-180 — les deux fiches ne citent aucune
--     qualification nominative, l'arrêté renvoie au décret 2014-812
--     (migration 399 lignes 217-238 et 312-337, verbatim PDFs vA75-1).
--
--   * 'not_applicable' : BAR-EN-108 (pose de fermeture isolante — volet/store,
--     pas de bâti thermique), BAR-TH-173 (système de régulation par
--     programmation horaire pièce par pièce — pose d'électronique connectée),
--     BAR-SE-104 (réglage des organes d'équilibrage d'une installation de
--     chauffage à eau chaude — prestation hydraulique collective). Ces trois
--     cas sont justifiés par les commentaires explicites de la migration 384,
--     qui dit « Pas de mention RGE imposée dans l'arrêté ». On les classe
--     'not_applicable' plutôt que 'dispensed' pour distinguer le cas « hors
--     périmètre RGE » du cas « RGE générique décret 2014-812 ».
--
--   * 'required_unknown_codes' : TOUTES les autres fiches actives, soit :
--       - BAR-EN-101 (isolation toiture — libellé « Qualibat RGE » générique,
--         formulation exacte non vérifiée verbatim PDF)
--       - BAR-EN-102 (isolation murs — idem)
--       - BAR-EN-103 (isolation plancher — idem)
--       - BAR-EN-104 (menuiseries — idem)
--       - BAR-TH-112 (poêle bois — libellé « Qualibois Air » non vérifié PDF)
--       - BAR-TH-113 (chaudière biomasse — « Qualibois Eau/Air » non vérifié)
--       - BAR-TH-125 (VMC double flux — libellé « Qualibat RGE » non vérifié)
--       - BAR-TH-127 (VMC simple flux hygro — idem)
--       - BAR-TH-129 (PAC air/air — libellé « QualiPAC » non vérifié PDF)
--       - BAR-TH-143 (solaire combiné — « Qualisol Combi » non vérifié PDF)
--       - BAR-TH-148 (chauffe-eau thermodynamique — « QualiPAC CET » non vérifié)
--       - BAR-TH-159 (PAC hybride — « QualiPAC » non vérifié)
--       - BAR-TH-161 (calorifugeage points singuliers — « Qualibat RGE » non vérifié)
--       - BAR-TH-171 (PAC air/eau — « QualiPAC » non vérifié verbatim)
--       - BAR-TH-172 (PAC géothermie résidentielle — « QualiPAC / QualiForage »
--         non vérifié verbatim)
--       - BAR-TH-174 (rénovation d'ampleur maison individuelle — nécessite
--         audit MAR, formulation exacte non vérifiée)
--       - BAR-TH-175 (rénovation d'ampleur appartement — idem)
--
--     Ces 17 fiches doivent être auditées PDF par PDF avant d'être passées
--     en 'required_with_codes' ou 'dispensed'. Tant qu'elles restent
--     'required_unknown_codes', rge-filter.ts bloquera tout dispatch qui les
--     mentionne (fail-CLOSED strict).
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Ajout de la colonne rge_requirement_status avec CHECK explicite
-- -----------------------------------------------------------------------------

ALTER TABLE cee_operations
  ADD COLUMN IF NOT EXISTS rge_requirement_status TEXT NOT NULL
    DEFAULT 'required_unknown_codes'
    CHECK (rge_requirement_status IN (
      'required_with_codes',
      'required_unknown_codes',
      'dispensed',
      'not_applicable'
    ));

COMMENT ON COLUMN cee_operations.rge_requirement_status IS
  'Sémantique explicite des exigences RGE (migration 401). 4 états : '
  'required_with_codes (codes vérifiés verbatim PDF), '
  'required_unknown_codes (exigence probable mais libellés non validés — '
  'fail-CLOSED dispatch), dispensed (arrêté renvoie au décret 2014-812 sans '
  'qualif nominative), not_applicable (fiche hors périmètre RGE). Le default '
  'à required_unknown_codes force la décision explicite au backfill.';

-- -----------------------------------------------------------------------------
-- 2. Backfill — required_with_codes (BAR-TH-178 uniquement, verbatim PDF 399)
-- -----------------------------------------------------------------------------

UPDATE cee_operations
   SET rge_requirement_status = 'required_with_codes',
       updated_at = now()
 WHERE code = 'BAR-TH-178';

-- -----------------------------------------------------------------------------
-- 3. Backfill — dispensed (BAR-TH-179, BAR-TH-180, verbatim PDF 399)
-- -----------------------------------------------------------------------------
-- Les deux fiches renvoient explicitement au décret 2014-812, sans
-- qualification nominative. Source : migration 399 lignes 217-238 et 312-337.

UPDATE cee_operations
   SET rge_requirement_status = 'dispensed',
       updated_at = now()
 WHERE code IN ('BAR-TH-179', 'BAR-TH-180');

-- -----------------------------------------------------------------------------
-- 4. Backfill — not_applicable (BAR-EN-108, BAR-TH-173, BAR-SE-104)
-- -----------------------------------------------------------------------------
-- Ces trois fiches sont explicitement marquées « Pas de mention RGE imposée »
-- dans les commentaires de la migration 384. Elles ne relèvent pas du
-- périmètre RGE bâti (pose de fermeture, pose d'électronique de pilotage,
-- prestation hydraulique collective).

UPDATE cee_operations
   SET rge_requirement_status = 'not_applicable',
       updated_at = now()
 WHERE code IN ('BAR-EN-108', 'BAR-TH-173', 'BAR-SE-104');

-- -----------------------------------------------------------------------------
-- 5. Backfill — required_unknown_codes (toutes les autres fiches actives)
-- -----------------------------------------------------------------------------
-- Explicite plutôt qu'implicite : on écrit l'UPDATE même si le default gère
-- déjà le cas (protection contre un futur ALTER COLUMN qui changerait la
-- valeur par défaut). On n'écrase PAS les fiches déjà classées ci-dessus.

UPDATE cee_operations
   SET rge_requirement_status = 'required_unknown_codes',
       updated_at = now()
 WHERE is_active = TRUE
   AND rge_requirement_status = 'required_unknown_codes'
   AND code IN (
     'BAR-EN-101', 'BAR-EN-102', 'BAR-EN-103', 'BAR-EN-104',
     'BAR-TH-112', 'BAR-TH-113',
     'BAR-TH-125', 'BAR-TH-127',
     'BAR-TH-129',
     'BAR-TH-143', 'BAR-TH-148', 'BAR-TH-159',
     'BAR-TH-161',
     'BAR-TH-171', 'BAR-TH-172',
     'BAR-TH-174', 'BAR-TH-175'
   );

-- -----------------------------------------------------------------------------
-- 6. Index partiel pour le filtrage dispatch (is_active = TRUE uniquement)
-- -----------------------------------------------------------------------------
-- La query côté rge-filter.ts charge les fiches actives par code FOS, on
-- garde l'index petit en ne couvrant que les lignes actives.

CREATE INDEX IF NOT EXISTS idx_cee_operations_rge_status
  ON cee_operations(rge_requirement_status)
  WHERE is_active = TRUE;

COMMIT;
