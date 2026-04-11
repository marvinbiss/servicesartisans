-- =============================================================================
-- Migration 399 — Remplissage des forfaits CEE pour BAR-TH-178 / 179 / 180
-- =============================================================================
-- Contexte :
--   La migration 397 a inséré les 3 nouvelles fiches créées par l'arrêté du
--   6 septembre 2025 (JORFTEXT000052212366, applicable au 01/01/2026) avec
--   plusieurs champs marqués "VÉRIF PDF REQUISE" faute de source primaire
--   confirmée à ce moment-là.
--
-- Portée de cette migration :
--   1. Ajout d'une colonne JSONB `forfaits_table` sur cee_operations pour
--      stocker les matrices de forfaits complètes (Etas × Zone × Usage × ...).
--      Le champ scalaire `forfait_base_kwhc` hérité de la migration 382 est
--      insuffisant : les 3 fiches utilisent un produit `montant × N × R` avec
--      N = nombre d'appartements et R = facteur de puissance (≤ 1).
--   2. Remplissage de `rge_formulation_arrete` avec le texte LITTÉRAL de la
--      clause RGE recopié depuis les PDF officiels ecologie.gouv.fr (fiches
--      vA75-1 applicables au 01-01-2026).
--   3. Remplissage de `forfaits_table` avec les tableaux complets de forfaits
--      (par appartement), strictement verbatim depuis les PDFs.
--   4. Mise à jour des `rge_qualifications_requises` / `rge_meta_domaines`
--      pour refléter ce que disent les arrêtés (BAR-TH-180 n'exige PAS
--      QualiForage contrairement à ce que supposait 397 — les types de PAC
--      listés en annexe attestation sont "sans travaux de forage").
--   5. Mise à jour de `notes` pour effacer les "VÉRIF PDF REQUISE" et
--      référencer l'extraction scripts/cee-fiches-178-179-180.md.
--
-- Sources PDF officielles consultées (copie locale + parsing) le 2026-04-11 :
--   - https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-TH-178%20vA75-1%20%C3%A0%20compter%20du%2001-01-2026_0.pdf
--   - https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-TH-179%20vA75-1%20%C3%A0%20compter%20du%2001-01-2026.pdf
--   - https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-TH-180%20vA75-1%20%C3%A0%20compter%20du%2001-01-2026_0.pdf
--
-- Formule cumac commune aux 3 fiches (verbatim annexes) :
--   kWh cumac = montant_kwhc_par_appartement × N × R
--   N = nombre d'appartements chauffés
--   R = si puissance nominale PAC (somme) < 40 % puissance utile nouvelle
--       chaufferie, alors R = puissance_PAC / puissance_utile_chaufferie ;
--       sinon R = 1 (unité).
--   Puissance utile = somme des puissances nominales des équipements de
--   chauffage/ECS de la chaufferie après travaux, hors équipements de secours.
--   Cas PAC multiples de classes différentes : forfait le plus faible retenu.
--
-- Idempotent : uniquement UPDATE + ADD COLUMN IF NOT EXISTS. Pas d'INSERT.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Extension schéma : colonne forfaits_table (JSONB)
-- -----------------------------------------------------------------------------
-- Le forfait de ces 3 fiches est multi-dimensionnel et ne tient pas dans le
-- scalaire forfait_base_kwhc (NUMERIC) de la migration 382. On ajoute une
-- colonne JSONB générique. Schéma attendu (exemple BAR-TH-179) :
--   {
--     "unite": "kWhc_par_appartement",
--     "formule": "montant × N × R",
--     "axes": ["etas_class", "usage", "zone_climatique"],
--     "rows": [
--       { "etas_class": "111-126", "etas_min": 111, "etas_max": 126,
--         "usage": "chauffage", "zone": "H1", "montant": 100000 },
--       ...
--     ],
--     "facteur_R": { ... },
--     "duree_vie_ans": 22
--   }
-- Pour BAR-TH-178, une clé supplémentaire "puissance_pac_categorie"
-- ("<=400kW" ou ">400kW") distingue les deux tables (Etas vs COP).

ALTER TABLE cee_operations
  ADD COLUMN IF NOT EXISTS forfaits_table JSONB;

COMMENT ON COLUMN cee_operations.forfaits_table IS
  'Matrice forfait kWhc cumac pour les fiches dont le calcul ne tient pas '
  'dans le scalaire forfait_base_kwhc. Rempli verbatim depuis les annexes '
  'de l''arrêté DGEC. Schéma : { unite, formule, axes, rows[], facteur_R, '
  'duree_vie_ans }. Voir scripts/cee-fiches-178-179-180.md pour extraction.';

-- -----------------------------------------------------------------------------
-- 2. BAR-TH-178 — Système géothermique
-- -----------------------------------------------------------------------------
-- Clause RGE verbatim pp.2 du PDF BAR-TH-178 vA75-1 :
--   "La mise en place est réalisée par un professionnel. Le professionnel
--    réalisant l'étude des ressources géothermiques est titulaire d'un signe
--    de qualité RGE Etudes OPQIBI 10.07 « Etude des ressources
--    géothermiques » ou d'une qualification équivalente et le professionnel
--    réalisant l'ingénierie de conception ou de réalisation est titulaire
--    d'un signe de qualité RGE Etudes OPQIBI 20.13 « Maîtrise d'œuvre des
--    installations de production utilisant l'énergie géothermique » ou
--    d'une qualification équivalente."
-- Conditions techniques verbatim pp.2 :
--   PAC ≤ 400 kW : Etas ≥ 111% (M/HT), ≥ 126% (BT).
--   PAC > 400 kW : COP ≥ 4 (eau glycolée/eau, 0/-3°C & 30/35°C),
--                  COP ≥ 4,5 (eau/eau, 10/7°C & 30/35°C).
--   Rafraîchissement actif : EER ≥ 3,6. Géocooling : SEER > 20 (sondes) ou > 14 (aquifère).
--   Puissance calorifique minimale totale du dispositif : 30 kW.
-- Durée de vie conventionnelle : 25 ans.

UPDATE cee_operations
SET
  rge_formulation_arrete =
    'La mise en place est réalisée par un professionnel. '
    'Le professionnel réalisant l''étude des ressources géothermiques est '
    'titulaire d''un signe de qualité RGE Etudes OPQIBI 10.07 '
    '« Etude des ressources géothermiques » ou d''une qualification '
    'équivalente et le professionnel réalisant l''ingénierie de conception '
    'ou de réalisation est titulaire d''un signe de qualité RGE Etudes '
    'OPQIBI 20.13 « Maîtrise d''œuvre des installations de production '
    'utilisant l''énergie géothermique » ou d''une qualification équivalente.',

  rge_qualifications_requises = ARRAY[
    'OPQIBI 10.07',
    'OPQIBI 20.13'
  ]::TEXT[],

  rge_meta_domaines = ARRAY[
    'Énergies renouvelables',
    'Pompes à chaleur',
    'Géothermie',
    'Études RGE'
  ]::TEXT[],

  forfaits_table = jsonb_build_object(
    'unite', 'kWhc_par_appartement',
    'formule', 'montant × N × R',
    'variables', jsonb_build_object(
      'N', 'Nombre d''appartements chauffés',
      'R', 'Facteur puissance : si puissance nominale PAC < 40% puissance utile nouvelle chaufferie, R = PAC/chaufferie ; sinon R = 1'
    ),
    'duree_vie_ans', 25,
    'puissance_min_totale_kw', 30,
    'conditions_techniques', jsonb_build_object(
      'pac_leq_400kw', jsonb_build_object(
        'etas_min_moyenne_haute_temp', 111,
        'etas_min_basse_temp', 126,
        'reference_norme', 'Règlement (EU) n° 813/2013 - PAC seule hors régulation'
      ),
      'pac_gt_400kw', jsonb_build_object(
        'cop_min_eau_glycolee_eau', 4.0,
        'regime_eau_glycolee_eau', '0/-3°C et 30/35°C (EN 14511-2)',
        'cop_min_eau_eau', 4.5,
        'regime_eau_eau', '10/7°C et 30/35°C (EN 14511-2)'
      ),
      'rafraichissement_actif', jsonb_build_object(
        'eer_min', 3.6,
        'regime', '12/7°C évaporateur et 30/35°C condenseur (EN 14511)'
      ),
      'geocooling', jsonb_build_object(
        'seer_min_sondes', 20,
        'seer_min_aquifere', 14
      )
    ),
    'tables', jsonb_build_array(
      -- Table 1 : PAC ≤ 400 kW (par Etas × Zone × Usage), p.4-5 du PDF
      jsonb_build_object(
        'puissance_pac_categorie', '<=400kW',
        'axe_performance', 'etas',
        'rows', jsonb_build_array(
          jsonb_build_object('etas_min', 111, 'etas_max', 126, 'zone', 'H1', 'chauffage', 108700, 'chauffage_ecs', 157900),
          jsonb_build_object('etas_min', 111, 'etas_max', 126, 'zone', 'H2', 'chauffage',  90600, 'chauffage_ecs', 137400),
          jsonb_build_object('etas_min', 111, 'etas_max', 126, 'zone', 'H3', 'chauffage',  64700, 'chauffage_ecs', 108600),
          jsonb_build_object('etas_min', 126, 'etas_max', 150, 'zone', 'H1', 'chauffage', 115000, 'chauffage_ecs', 167100),
          jsonb_build_object('etas_min', 126, 'etas_max', 150, 'zone', 'H2', 'chauffage',  95900, 'chauffage_ecs', 145300),
          jsonb_build_object('etas_min', 126, 'etas_max', 150, 'zone', 'H3', 'chauffage',  68500, 'chauffage_ecs', 115000),
          jsonb_build_object('etas_min', 150, 'etas_max', 175, 'zone', 'H1', 'chauffage', 120300, 'chauffage_ecs', 174800),
          jsonb_build_object('etas_min', 150, 'etas_max', 175, 'zone', 'H2', 'chauffage', 100300, 'chauffage_ecs', 152000),
          jsonb_build_object('etas_min', 150, 'etas_max', 175, 'zone', 'H3', 'chauffage',  71600, 'chauffage_ecs', 120200),
          jsonb_build_object('etas_min', 175, 'etas_max', 190, 'zone', 'H1', 'chauffage', 123900, 'chauffage_ecs', 180000),
          jsonb_build_object('etas_min', 175, 'etas_max', 190, 'zone', 'H2', 'chauffage', 103300, 'chauffage_ecs', 156600),
          jsonb_build_object('etas_min', 175, 'etas_max', 190, 'zone', 'H3', 'chauffage',  73800, 'chauffage_ecs', 123900),
          jsonb_build_object('etas_min', 190, 'etas_max', NULL, 'zone', 'H1', 'chauffage', 126200, 'chauffage_ecs', 183200),
          jsonb_build_object('etas_min', 190, 'etas_max', NULL, 'zone', 'H2', 'chauffage', 105100, 'chauffage_ecs', 159400),
          jsonb_build_object('etas_min', 190, 'etas_max', NULL, 'zone', 'H3', 'chauffage',  75100, 'chauffage_ecs', 126100)
        )
      ),
      -- Table 2 : PAC > 400 kW (par COP × Zone × Usage), p.5 du PDF
      jsonb_build_object(
        'puissance_pac_categorie', '>400kW',
        'axe_performance', 'cop_en_14511_2',
        'rows', jsonb_build_array(
          jsonb_build_object('cop_min', 4.0, 'cop_max', 4.5, 'zone', 'H1', 'chauffage', 118500, 'chauffage_ecs', 172200),
          jsonb_build_object('cop_min', 4.0, 'cop_max', 4.5, 'zone', 'H2', 'chauffage',  98800, 'chauffage_ecs', 149800),
          jsonb_build_object('cop_min', 4.0, 'cop_max', 4.5, 'zone', 'H3', 'chauffage',  70600, 'chauffage_ecs', 118500),
          jsonb_build_object('cop_min', 4.5, 'cop_max', 5.0, 'zone', 'H1', 'chauffage', 122300, 'chauffage_ecs', 177700),
          jsonb_build_object('cop_min', 4.5, 'cop_max', 5.0, 'zone', 'H2', 'chauffage', 101900, 'chauffage_ecs', 154600),
          jsonb_build_object('cop_min', 4.5, 'cop_max', 5.0, 'zone', 'H3', 'chauffage',  72800, 'chauffage_ecs', 122200),
          jsonb_build_object('cop_min', 5.0, 'cop_max', 5.5, 'zone', 'H1', 'chauffage', 125400, 'chauffage_ecs', 182100),
          jsonb_build_object('cop_min', 5.0, 'cop_max', 5.5, 'zone', 'H2', 'chauffage', 104500, 'chauffage_ecs', 158400),
          jsonb_build_object('cop_min', 5.0, 'cop_max', 5.5, 'zone', 'H3', 'chauffage',  74600, 'chauffage_ecs', 125300),
          jsonb_build_object('cop_min', 5.5, 'cop_max', NULL, 'zone', 'H1', 'chauffage', 127800, 'chauffage_ecs', 185700),
          jsonb_build_object('cop_min', 5.5, 'cop_max', NULL, 'zone', 'H2', 'chauffage', 106500, 'chauffage_ecs', 161500),
          jsonb_build_object('cop_min', 5.5, 'cop_max', NULL, 'zone', 'H3', 'chauffage',  76100, 'chauffage_ecs', 127800)
        )
      )
    ),
    'source_pdf', 'https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-TH-178%20vA75-1%20%C3%A0%20compter%20du%2001-01-2026_0.pdf',
    'date_extraction', '2026-04-11'
  ),

  notes =
    'Nouvelle fiche créée par le 75e arrêté CEE (06/09/2025), applicable '
    '01-01-2026. Remplace partiellement BAR-TH-166. Cumulable avec Fonds '
    'Chaleur ADEME sur dossiers déposés à partir du 01-01-2026. Date '
    'd''engagement = date de signature du devis du dispositif de captage. '
    'Bonification Coup de pouce chauffage collectif x5 applicable jusqu''au '
    '31-12-2030. Forfaits extraits verbatim du PDF vA75-1 ecologie.gouv.fr '
    'le 2026-04-11 — voir scripts/cee-fiches-178-179-180.md. '
    'Justificatifs : étude préalable de dimensionnement incluant étude des '
    'ressources géothermiques, décisions RGE OPQIBI 10.07 & 20.13, DOE '
    'forage, rapport fin de forage, le cas échéant notification ADEME.',

  updated_at = now()
WHERE code = 'BAR-TH-178';

-- -----------------------------------------------------------------------------
-- 3. BAR-TH-179 — Pompe à chaleur collective de type air/eau
-- -----------------------------------------------------------------------------
-- Clause RGE verbatim p.1 du PDF BAR-TH-179 vA75-1 : pas d'exigence QualiPAC
-- nominative, l'arrêté renvoie à l'article 2 du décret 2014-812.
-- Conditions : Etas ≥ 111% (M/HT) ou ≥ 126% (BT). Puissance ≤ 400 kW.
-- Durée de vie conventionnelle : 22 ans.

UPDATE cee_operations
SET
  rge_formulation_arrete =
    'La mise en place est réalisée par un professionnel. '
    'Le professionnel réalisant l''opération est titulaire d''un signe de '
    'qualité conforme aux exigences prévues à l''article 2 du décret '
    'n° 2014-812 du 16 juillet 2014 pris pour l''application du second '
    'alinéa du 2 de l''article 200 quater du code général des impôts et du '
    'dernier alinéa du 2 du I de l''article 244 quater U du code général '
    'des impôts et des textes pris pour son application. Ce signe de '
    'qualité correspond à des travaux relevant du 5° pour les besoins en '
    'chauffage et des 5° et 6° pour les besoins en chauffage et eau chaude '
    'sanitaire du I de l''article 1er du décret précité.',

  -- La fiche ne cite aucune qualification nominative (QualiPAC, etc.) :
  -- on laisse vide au niveau des codes et on renseigne les méta-domaines.
  rge_qualifications_requises = ARRAY[]::TEXT[],

  rge_meta_domaines = ARRAY[
    'Énergies renouvelables',
    'Pompes à chaleur'
  ]::TEXT[],

  forfaits_table = jsonb_build_object(
    'unite', 'kWhc_par_appartement',
    'formule', 'montant × N × R',
    'variables', jsonb_build_object(
      'N', 'Nombre d''appartements chauffés par la (ou les) PAC',
      'R', 'Facteur puissance : si puissance nominale PAC < 40% puissance utile nouvelle chaufferie, R = PAC/chaufferie ; sinon R = 1'
    ),
    'duree_vie_ans', 22,
    'puissance_max_pac_kw', 400,
    'conditions_techniques', jsonb_build_object(
      'etas_min_moyenne_haute_temp', 111,
      'etas_min_basse_temp', 126,
      'reference_norme', 'Règlement (EU) n° 813/2013 - PAC seule hors régulation'
    ),
    'rows', jsonb_build_array(
      jsonb_build_object('etas_min', 111, 'etas_max', 126, 'usage', 'chauffage',     'zone', 'H1', 'montant', 100000),
      jsonb_build_object('etas_min', 111, 'etas_max', 126, 'usage', 'chauffage',     'zone', 'H2', 'montant',  84000),
      jsonb_build_object('etas_min', 111, 'etas_max', 126, 'usage', 'chauffage',     'zone', 'H3', 'montant',  60000),
      jsonb_build_object('etas_min', 111, 'etas_max', 126, 'usage', 'chauffage_ecs', 'zone', 'H1', 'montant', 146000),
      jsonb_build_object('etas_min', 111, 'etas_max', 126, 'usage', 'chauffage_ecs', 'zone', 'H2', 'montant', 127000),
      jsonb_build_object('etas_min', 111, 'etas_max', 126, 'usage', 'chauffage_ecs', 'zone', 'H3', 'montant', 100000),
      jsonb_build_object('etas_min', 126, 'etas_max', 150, 'usage', 'chauffage',     'zone', 'H1', 'montant', 107000),
      jsonb_build_object('etas_min', 126, 'etas_max', 150, 'usage', 'chauffage',     'zone', 'H2', 'montant',  89000),
      jsonb_build_object('etas_min', 126, 'etas_max', 150, 'usage', 'chauffage',     'zone', 'H3', 'montant',  64000),
      jsonb_build_object('etas_min', 126, 'etas_max', 150, 'usage', 'chauffage_ecs', 'zone', 'H1', 'montant', 155000),
      jsonb_build_object('etas_min', 126, 'etas_max', 150, 'usage', 'chauffage_ecs', 'zone', 'H2', 'montant', 135000),
      jsonb_build_object('etas_min', 126, 'etas_max', 150, 'usage', 'chauffage_ecs', 'zone', 'H3', 'montant', 107000),
      jsonb_build_object('etas_min', 150, 'etas_max', 175, 'usage', 'chauffage',     'zone', 'H1', 'montant', 112000),
      jsonb_build_object('etas_min', 150, 'etas_max', 175, 'usage', 'chauffage',     'zone', 'H2', 'montant',  93000),
      jsonb_build_object('etas_min', 150, 'etas_max', 175, 'usage', 'chauffage',     'zone', 'H3', 'montant',  67000),
      jsonb_build_object('etas_min', 150, 'etas_max', 175, 'usage', 'chauffage_ecs', 'zone', 'H1', 'montant', 163000),
      jsonb_build_object('etas_min', 150, 'etas_max', 175, 'usage', 'chauffage_ecs', 'zone', 'H2', 'montant', 142000),
      jsonb_build_object('etas_min', 150, 'etas_max', 175, 'usage', 'chauffage_ecs', 'zone', 'H3', 'montant', 112000),
      jsonb_build_object('etas_min', 175, 'etas_max', 190, 'usage', 'chauffage',     'zone', 'H1', 'montant', 115000),
      jsonb_build_object('etas_min', 175, 'etas_max', 190, 'usage', 'chauffage',     'zone', 'H2', 'montant',  96000),
      jsonb_build_object('etas_min', 175, 'etas_max', 190, 'usage', 'chauffage',     'zone', 'H3', 'montant',  69000),
      jsonb_build_object('etas_min', 175, 'etas_max', 190, 'usage', 'chauffage_ecs', 'zone', 'H1', 'montant', 167000),
      jsonb_build_object('etas_min', 175, 'etas_max', 190, 'usage', 'chauffage_ecs', 'zone', 'H2', 'montant', 146000),
      jsonb_build_object('etas_min', 175, 'etas_max', 190, 'usage', 'chauffage_ecs', 'zone', 'H3', 'montant', 115000),
      jsonb_build_object('etas_min', 190, 'etas_max', NULL, 'usage', 'chauffage',     'zone', 'H1', 'montant', 117000),
      jsonb_build_object('etas_min', 190, 'etas_max', NULL, 'usage', 'chauffage',     'zone', 'H2', 'montant',  97000),
      jsonb_build_object('etas_min', 190, 'etas_max', NULL, 'usage', 'chauffage',     'zone', 'H3', 'montant',  70000),
      jsonb_build_object('etas_min', 190, 'etas_max', NULL, 'usage', 'chauffage_ecs', 'zone', 'H1', 'montant', 170000),
      jsonb_build_object('etas_min', 190, 'etas_max', NULL, 'usage', 'chauffage_ecs', 'zone', 'H2', 'montant', 148000),
      jsonb_build_object('etas_min', 190, 'etas_max', NULL, 'usage', 'chauffage_ecs', 'zone', 'H3', 'montant', 117000)
    ),
    'source_pdf', 'https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-TH-179%20vA75-1%20%C3%A0%20compter%20du%2001-01-2026.pdf',
    'date_extraction', '2026-04-11'
  ),

  notes =
    'Nouvelle fiche créée par le 75e arrêté CEE (06/09/2025), applicable '
    '01-01-2026. Remplace BAR-TH-166 pour les PAC collectives air/eau en '
    'résidentiel collectif. Bonification Coup de pouce "Chauffage des '
    'bâtiments résidentiels collectifs et tertiaires" : coefficient x3 '
    '(x4 en remplacement de chaudière charbon/fioul/gaz) jusqu''au '
    '31-12-2030. Forfaits extraits verbatim du PDF vA75-1 ecologie.gouv.fr '
    'le 2026-04-11 — voir scripts/cee-fiches-178-179-180.md. Justificatifs '
    'spécifiques : note de dimensionnement générateur vs déperditions à '
    'T=Tbase, décision qualification/certification art. 2 décret 2014-812.',

  updated_at = now()
WHERE code = 'BAR-TH-179';

-- -----------------------------------------------------------------------------
-- 4. BAR-TH-180 — PAC collective eau/eau ou eau glycolée/eau
-- -----------------------------------------------------------------------------
-- Clause RGE verbatim pp.1-2 du PDF BAR-TH-180 vA75-1 : texte IDENTIQUE à
-- BAR-TH-179. L'annexe liste explicitement les PAC "sans travaux de forage"
-- (aquifère superficiel sans forage, sondes sans forage, eaux usées, eau de
-- mer, eaux thermales, chaussées thermoactives, corbeille/mur géothermique).
-- QualiForage n'est PAS exigé ici (il l'est pour BAR-TH-178 via OPQIBI).
-- Tableau de forfaits : identique à BAR-TH-179 (vérifié verbatim pp.2-3).
-- Durée de vie conventionnelle : 22 ans.

UPDATE cee_operations
SET
  rge_formulation_arrete =
    'La mise en place est réalisée par un professionnel. '
    'Le professionnel réalisant l''opération est titulaire d''un signe de '
    'qualité conforme aux exigences prévues à l''article 2 du décret '
    'n° 2014-812 du 16 juillet 2014 pris pour l''application du second '
    'alinéa du 2 de l''article 200 quater du code général des impôts et du '
    'dernier alinéa du 2 du I de l''article 244 quater U du code général '
    'des impôts et des textes pris pour son application. Ce signe de '
    'qualité correspond à des travaux relevant du 5° pour les besoins en '
    'chauffage et des 5° et 6° pour les besoins en chauffage et eau chaude '
    'sanitaire du I de l''article 1er du décret précité.',

  -- Correction vs migration 397 : l'arrêté BAR-TH-180 n'exige PAS QualiForage.
  -- Les types de PAC listés en annexe sont explicitement "sans travaux de
  -- forage". Le forage géothermique relève de BAR-TH-178 (non cumulable).
  rge_qualifications_requises = ARRAY[]::TEXT[],

  rge_meta_domaines = ARRAY[
    'Énergies renouvelables',
    'Pompes à chaleur'
  ]::TEXT[],

  forfaits_table = jsonb_build_object(
    'unite', 'kWhc_par_appartement',
    'formule', 'montant × N × R',
    'variables', jsonb_build_object(
      'N', 'Nombre d''appartements chauffés par la (ou les) PAC',
      'R', 'Facteur puissance : si puissance nominale PAC < 40% puissance utile nouvelle chaufferie, R = PAC/chaufferie ; sinon R = 1'
    ),
    'duree_vie_ans', 22,
    'puissance_max_pac_kw', 400,
    'types_pac_eligibles', jsonb_build_array(
      'eau/eau sur eaux usées (réseaux ou station)',
      'eau/eau sur eau de mer ou eaux de surface',
      'eau/eau sur eaux thermales ou eaux d''exhaure de mines',
      'eau glycolée/eau sur chaussées thermoactives',
      'géothermique type corbeille ou mur géothermique',
      'eau/eau sur aquifère superficiel sans travaux de forage',
      'eau glycolée/eau sur sondes géothermiques sans travaux de forage'
    ),
    'conditions_techniques', jsonb_build_object(
      'etas_min_moyenne_haute_temp', 111,
      'etas_min_basse_temp', 126,
      'reference_norme', 'Règlement (EU) n° 813/2013 - PAC seule hors régulation'
    ),
    'rows', jsonb_build_array(
      jsonb_build_object('etas_min', 111, 'etas_max', 126, 'usage', 'chauffage',     'zone', 'H1', 'montant', 100000),
      jsonb_build_object('etas_min', 111, 'etas_max', 126, 'usage', 'chauffage',     'zone', 'H2', 'montant',  84000),
      jsonb_build_object('etas_min', 111, 'etas_max', 126, 'usage', 'chauffage',     'zone', 'H3', 'montant',  60000),
      jsonb_build_object('etas_min', 111, 'etas_max', 126, 'usage', 'chauffage_ecs', 'zone', 'H1', 'montant', 146000),
      jsonb_build_object('etas_min', 111, 'etas_max', 126, 'usage', 'chauffage_ecs', 'zone', 'H2', 'montant', 127000),
      jsonb_build_object('etas_min', 111, 'etas_max', 126, 'usage', 'chauffage_ecs', 'zone', 'H3', 'montant', 100000),
      jsonb_build_object('etas_min', 126, 'etas_max', 150, 'usage', 'chauffage',     'zone', 'H1', 'montant', 107000),
      jsonb_build_object('etas_min', 126, 'etas_max', 150, 'usage', 'chauffage',     'zone', 'H2', 'montant',  89000),
      jsonb_build_object('etas_min', 126, 'etas_max', 150, 'usage', 'chauffage',     'zone', 'H3', 'montant',  64000),
      jsonb_build_object('etas_min', 126, 'etas_max', 150, 'usage', 'chauffage_ecs', 'zone', 'H1', 'montant', 155000),
      jsonb_build_object('etas_min', 126, 'etas_max', 150, 'usage', 'chauffage_ecs', 'zone', 'H2', 'montant', 135000),
      jsonb_build_object('etas_min', 126, 'etas_max', 150, 'usage', 'chauffage_ecs', 'zone', 'H3', 'montant', 107000),
      jsonb_build_object('etas_min', 150, 'etas_max', 175, 'usage', 'chauffage',     'zone', 'H1', 'montant', 112000),
      jsonb_build_object('etas_min', 150, 'etas_max', 175, 'usage', 'chauffage',     'zone', 'H2', 'montant',  93000),
      jsonb_build_object('etas_min', 150, 'etas_max', 175, 'usage', 'chauffage',     'zone', 'H3', 'montant',  67000),
      jsonb_build_object('etas_min', 150, 'etas_max', 175, 'usage', 'chauffage_ecs', 'zone', 'H1', 'montant', 163000),
      jsonb_build_object('etas_min', 150, 'etas_max', 175, 'usage', 'chauffage_ecs', 'zone', 'H2', 'montant', 142000),
      jsonb_build_object('etas_min', 150, 'etas_max', 175, 'usage', 'chauffage_ecs', 'zone', 'H3', 'montant', 112000),
      jsonb_build_object('etas_min', 175, 'etas_max', 190, 'usage', 'chauffage',     'zone', 'H1', 'montant', 115000),
      jsonb_build_object('etas_min', 175, 'etas_max', 190, 'usage', 'chauffage',     'zone', 'H2', 'montant',  96000),
      jsonb_build_object('etas_min', 175, 'etas_max', 190, 'usage', 'chauffage',     'zone', 'H3', 'montant',  69000),
      jsonb_build_object('etas_min', 175, 'etas_max', 190, 'usage', 'chauffage_ecs', 'zone', 'H1', 'montant', 167000),
      jsonb_build_object('etas_min', 175, 'etas_max', 190, 'usage', 'chauffage_ecs', 'zone', 'H2', 'montant', 146000),
      jsonb_build_object('etas_min', 175, 'etas_max', 190, 'usage', 'chauffage_ecs', 'zone', 'H3', 'montant', 115000),
      jsonb_build_object('etas_min', 190, 'etas_max', NULL, 'usage', 'chauffage',     'zone', 'H1', 'montant', 117000),
      jsonb_build_object('etas_min', 190, 'etas_max', NULL, 'usage', 'chauffage',     'zone', 'H2', 'montant',  97000),
      jsonb_build_object('etas_min', 190, 'etas_max', NULL, 'usage', 'chauffage',     'zone', 'H3', 'montant',  70000),
      jsonb_build_object('etas_min', 190, 'etas_max', NULL, 'usage', 'chauffage_ecs', 'zone', 'H1', 'montant', 170000),
      jsonb_build_object('etas_min', 190, 'etas_max', NULL, 'usage', 'chauffage_ecs', 'zone', 'H2', 'montant', 148000),
      jsonb_build_object('etas_min', 190, 'etas_max', NULL, 'usage', 'chauffage_ecs', 'zone', 'H3', 'montant', 117000)
    ),
    'source_pdf', 'https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-TH-180%20vA75-1%20%C3%A0%20compter%20du%2001-01-2026_0.pdf',
    'date_extraction', '2026-04-11'
  ),

  notes =
    'Nouvelle fiche créée par le 75e arrêté CEE (06/09/2025), applicable '
    '01-01-2026. Remplace BAR-TH-166 pour les PAC collectives eau/eau ou '
    'eau glycolée/eau en résidentiel collectif SANS forage (forage = '
    'BAR-TH-178). Tableau de forfaits identique à BAR-TH-179. Bonification '
    'Coup de pouce "Chauffage des bâtiments résidentiels collectifs et '
    'tertiaires" : coefficient x4 (remplacement chaudière fossile) '
    'jusqu''au 31-12-2030. Forfaits extraits verbatim du PDF vA75-1 '
    'ecologie.gouv.fr le 2026-04-11 — voir scripts/cee-fiches-178-179-180.md. '
    'Justificatifs spécifiques : note de dimensionnement générateur vs '
    'déperditions à T=Tbase, décision qualification/certification art. 2 '
    'décret 2014-812. QualiForage NON requis (contrairement à 397).',

  updated_at = now()
WHERE code = 'BAR-TH-180';

COMMIT;
