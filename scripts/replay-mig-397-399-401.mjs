/**
 * replay-mig-397-399-401.mjs — insère les fiches CEE collectives manquantes live.
 *
 * Contexte (2026-06-05) : mig 397 jamais appliquée en prod — BAR-TH-166,
 * BAT-TH-113, BAR-TH-178/179/180 absents de cee_operations. Les colonnes des
 * migrations 399 (forfaits_table) et 401 (rge_requirement_status) existent
 * déjà live (DDL passé), seul le DML manque.
 *
 * Rejoue dans l'ordre (une vieille migration écrase les postérieures — leçon
 * du replay 384) :
 *   1. mig 397 — upsert des 5 fiches (166 + BAT-TH-113 inactives, 178/179/180
 *      actives). Valeurs 397 pour les abrogées.
 *   2. mig 399 — verbatims PDF vA75-1 + forfaits_table pour 178/179/180.
 *      Supersède les champs "VÉRIF PDF REQUISE" de 397 (notamment : 179/180
 *      rge_qualifications_requises = [] — l'arrêté renvoie au décret 2014-812,
 *      QualiForage PAS exigé pour 180).
 *   3. mig 401 — rge_requirement_status : 178 = required_with_codes,
 *      179/180 = dispensed.
 *
 * Puis relancer `node scripts/replay-mig-400-403.mjs --apply` pour les
 * justificatifs_requis (groupes 10/11/12 de mig 400, précédemment skippés
 * "ABSENT live").
 *
 * Usage :
 *   node scripts/replay-mig-397-399-401.mjs            # dry-run
 *   node scripts/replay-mig-397-399-401.mjs --apply    # applique
 */
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })
const APPLY = process.argv.includes('--apply')
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ---------------------------------------------------------------------------
// Mig 397 §1 — fiches abrogées (traçabilité, INACTIF)
// ---------------------------------------------------------------------------

const ABROGEES = [
  {
    code: 'BAR-TH-166',
    nom: 'Pompe à chaleur collective de type air/eau ou eau/eau',
    secteur: 'residentiel',
    domaine: 'chauffage',
    sous_domaine: 'pac_collective',
    services_slugs: ['chauffagiste'],
    rge_qualifications_requises: [],
    rge_meta_domaines: ['Énergies renouvelables', 'Pompes à chaleur'],
    precarite_eligible: true,
    classique_eligible: true,
    unite_mesure: 'kW',
    version_dgec: 'abrogé-06-09-2025',
    date_application: '2026-01-01',
    arrete_source: 'Arrêté 06/09/2025 JORFTEXT000052212366',
    public_cible: 'copropriete',
    is_active: false,
    notes:
      "Abrogée au 01-01-2026 par l'arrêté du 6 septembre 2025 (75e arrêté CEE). " +
      'Remplacée par BAR-TH-178 (géothermie), BAR-TH-179 (PAC collective air/eau) ' +
      'et BAR-TH-180 (PAC collective eau/eau ou eau glycolée/eau). Ne plus déposer.',
  },
  {
    code: 'BAT-TH-113',
    nom: 'Pompe à chaleur de type air/eau ou eau/eau',
    secteur: 'tertiaire',
    domaine: 'chauffage',
    sous_domaine: 'pac_tertiaire',
    services_slugs: ['chauffagiste'],
    rge_qualifications_requises: [],
    rge_meta_domaines: ['Énergies renouvelables', 'Pompes à chaleur'],
    precarite_eligible: true,
    classique_eligible: true,
    unite_mesure: 'kW',
    version_dgec: 'abrogé-06-09-2025',
    date_application: '2026-01-01',
    arrete_source: 'Arrêté 06/09/2025 JORFTEXT000052212366',
    public_cible: 'tous',
    is_active: false,
    notes:
      "Abrogée au 01-01-2026 par l'arrêté du 6 septembre 2025 (75e arrêté CEE). " +
      'Remplacée côté tertiaire par BAT-TH-162 (géothermie), BAT-TH-163 (PAC air/eau) ' +
      'et BAT-TH-164 (PAC eau/eau ou eau glycolée/eau). Hors périmètre SA ' +
      '(résidentiel first) — ligne conservée pour traçabilité.',
  },
]

// ---------------------------------------------------------------------------
// Mig 397 §2 — squelette des 3 nouvelles fiches (champs structurels).
// Les champs RGE/forfaits/notes sont posés par le bloc 399 ci-dessous
// (état final = 399, qui corrige 397).
// ---------------------------------------------------------------------------

const NOUVELLES = [
  {
    code: 'BAR-TH-178',
    nom: 'Système géothermique',
    secteur: 'residentiel',
    domaine: 'chauffage',
    sous_domaine: 'geothermie_collective',
    services_slugs: ['chauffagiste', 'plombier'],
    precarite_eligible: true,
    classique_eligible: true,
    unite_mesure: 'kW',
    version_dgec: 'vA75-1',
    date_application: '2026-01-01',
    arrete_source: 'Arrêté 06/09/2025 JORFTEXT000052212366',
    public_cible: 'copropriete',
    non_cumulable_avec: ['BAR-TH-166', 'BAR-TH-179', 'BAR-TH-180'],
    is_active: true,
  },
  {
    code: 'BAR-TH-179',
    nom: 'Pompe à chaleur collective de type air/eau',
    secteur: 'residentiel',
    domaine: 'chauffage',
    sous_domaine: 'pac_collective_air_eau',
    services_slugs: ['chauffagiste'],
    precarite_eligible: true,
    classique_eligible: true,
    unite_mesure: 'kW',
    version_dgec: 'vA75-1',
    date_application: '2026-01-01',
    arrete_source: 'Arrêté 06/09/2025 JORFTEXT000052212366',
    public_cible: 'copropriete',
    non_cumulable_avec: ['BAR-TH-166', 'BAR-TH-178', 'BAR-TH-180'],
    is_active: true,
  },
  {
    code: 'BAR-TH-180',
    nom: 'Pompe à chaleur collective de type eau/eau ou eau glycolée/eau',
    secteur: 'residentiel',
    domaine: 'chauffage',
    sous_domaine: 'pac_collective_eau_eau',
    services_slugs: ['chauffagiste', 'plombier'],
    precarite_eligible: true,
    classique_eligible: true,
    unite_mesure: 'kW',
    version_dgec: 'vA75-1',
    date_application: '2026-01-01',
    arrete_source: 'Arrêté 06/09/2025 JORFTEXT000052212366',
    public_cible: 'copropriete',
    non_cumulable_avec: ['BAR-TH-166', 'BAR-TH-178', 'BAR-TH-179'],
    is_active: true,
  },
]

// ---------------------------------------------------------------------------
// Mig 399 — verbatims PDF vA75-1 + forfaits_table (transcription fidèle du SQL)
// ---------------------------------------------------------------------------

const FACTEUR_R =
  'Facteur puissance : si puissance nominale PAC < 40% puissance utile nouvelle chaufferie, R = PAC/chaufferie ; sinon R = 1'

const FORMULATION_DECRET_2014_812 =
  'La mise en place est réalisée par un professionnel. ' +
  "Le professionnel réalisant l'opération est titulaire d'un signe de " +
  "qualité conforme aux exigences prévues à l'article 2 du décret " +
  "n° 2014-812 du 16 juillet 2014 pris pour l'application du second " +
  "alinéa du 2 de l'article 200 quater du code général des impôts et du " +
  "dernier alinéa du 2 du I de l'article 244 quater U du code général " +
  'des impôts et des textes pris pour son application. Ce signe de ' +
  'qualité correspond à des travaux relevant du 5° pour les besoins en ' +
  'chauffage et des 5° et 6° pour les besoins en chauffage et eau chaude ' +
  "sanitaire du I de l'article 1er du décret précité."

// Tableau de forfaits BAR-TH-179 (verbatim PDF pp.2 — identique BAR-TH-180 pp.2-3)
const ROWS_179_180 = [
  { etas_min: 111, etas_max: 126, usage: 'chauffage', zone: 'H1', montant: 100000 },
  { etas_min: 111, etas_max: 126, usage: 'chauffage', zone: 'H2', montant: 84000 },
  { etas_min: 111, etas_max: 126, usage: 'chauffage', zone: 'H3', montant: 60000 },
  { etas_min: 111, etas_max: 126, usage: 'chauffage_ecs', zone: 'H1', montant: 146000 },
  { etas_min: 111, etas_max: 126, usage: 'chauffage_ecs', zone: 'H2', montant: 127000 },
  { etas_min: 111, etas_max: 126, usage: 'chauffage_ecs', zone: 'H3', montant: 100000 },
  { etas_min: 126, etas_max: 150, usage: 'chauffage', zone: 'H1', montant: 107000 },
  { etas_min: 126, etas_max: 150, usage: 'chauffage', zone: 'H2', montant: 89000 },
  { etas_min: 126, etas_max: 150, usage: 'chauffage', zone: 'H3', montant: 64000 },
  { etas_min: 126, etas_max: 150, usage: 'chauffage_ecs', zone: 'H1', montant: 155000 },
  { etas_min: 126, etas_max: 150, usage: 'chauffage_ecs', zone: 'H2', montant: 135000 },
  { etas_min: 126, etas_max: 150, usage: 'chauffage_ecs', zone: 'H3', montant: 107000 },
  { etas_min: 150, etas_max: 175, usage: 'chauffage', zone: 'H1', montant: 112000 },
  { etas_min: 150, etas_max: 175, usage: 'chauffage', zone: 'H2', montant: 93000 },
  { etas_min: 150, etas_max: 175, usage: 'chauffage', zone: 'H3', montant: 67000 },
  { etas_min: 150, etas_max: 175, usage: 'chauffage_ecs', zone: 'H1', montant: 163000 },
  { etas_min: 150, etas_max: 175, usage: 'chauffage_ecs', zone: 'H2', montant: 142000 },
  { etas_min: 150, etas_max: 175, usage: 'chauffage_ecs', zone: 'H3', montant: 112000 },
  { etas_min: 175, etas_max: 190, usage: 'chauffage', zone: 'H1', montant: 115000 },
  { etas_min: 175, etas_max: 190, usage: 'chauffage', zone: 'H2', montant: 96000 },
  { etas_min: 175, etas_max: 190, usage: 'chauffage', zone: 'H3', montant: 69000 },
  { etas_min: 175, etas_max: 190, usage: 'chauffage_ecs', zone: 'H1', montant: 167000 },
  { etas_min: 175, etas_max: 190, usage: 'chauffage_ecs', zone: 'H2', montant: 146000 },
  { etas_min: 175, etas_max: 190, usage: 'chauffage_ecs', zone: 'H3', montant: 115000 },
  { etas_min: 190, etas_max: null, usage: 'chauffage', zone: 'H1', montant: 117000 },
  { etas_min: 190, etas_max: null, usage: 'chauffage', zone: 'H2', montant: 97000 },
  { etas_min: 190, etas_max: null, usage: 'chauffage', zone: 'H3', montant: 70000 },
  { etas_min: 190, etas_max: null, usage: 'chauffage_ecs', zone: 'H1', montant: 170000 },
  { etas_min: 190, etas_max: null, usage: 'chauffage_ecs', zone: 'H2', montant: 148000 },
  { etas_min: 190, etas_max: null, usage: 'chauffage_ecs', zone: 'H3', montant: 117000 },
]

const CONDITIONS_ETAS = {
  etas_min_moyenne_haute_temp: 111,
  etas_min_basse_temp: 126,
  reference_norme: 'Règlement (EU) n° 813/2013 - PAC seule hors régulation',
}

const MIG_399 = [
  {
    code: 'BAR-TH-178',
    rge_formulation_arrete:
      'La mise en place est réalisée par un professionnel. ' +
      "Le professionnel réalisant l'étude des ressources géothermiques est " +
      "titulaire d'un signe de qualité RGE Etudes OPQIBI 10.07 " +
      "« Etude des ressources géothermiques » ou d'une qualification " +
      "équivalente et le professionnel réalisant l'ingénierie de conception " +
      "ou de réalisation est titulaire d'un signe de qualité RGE Etudes " +
      "OPQIBI 20.13 « Maîtrise d'œuvre des installations de production " +
      "utilisant l'énergie géothermique » ou d'une qualification équivalente.",
    rge_qualifications_requises: ['OPQIBI 10.07', 'OPQIBI 20.13'],
    rge_meta_domaines: [
      'Énergies renouvelables',
      'Pompes à chaleur',
      'Géothermie',
      'Études RGE',
    ],
    forfaits_table: {
      unite: 'kWhc_par_appartement',
      formule: 'montant × N × R',
      variables: { N: "Nombre d'appartements chauffés", R: FACTEUR_R },
      duree_vie_ans: 25,
      puissance_min_totale_kw: 30,
      conditions_techniques: {
        pac_leq_400kw: CONDITIONS_ETAS,
        pac_gt_400kw: {
          cop_min_eau_glycolee_eau: 4.0,
          regime_eau_glycolee_eau: '0/-3°C et 30/35°C (EN 14511-2)',
          cop_min_eau_eau: 4.5,
          regime_eau_eau: '10/7°C et 30/35°C (EN 14511-2)',
        },
        rafraichissement_actif: {
          eer_min: 3.6,
          regime: '12/7°C évaporateur et 30/35°C condenseur (EN 14511)',
        },
        geocooling: { seer_min_sondes: 20, seer_min_aquifere: 14 },
      },
      tables: [
        {
          puissance_pac_categorie: '<=400kW',
          axe_performance: 'etas',
          rows: [
            { etas_min: 111, etas_max: 126, zone: 'H1', chauffage: 108700, chauffage_ecs: 157900 },
            { etas_min: 111, etas_max: 126, zone: 'H2', chauffage: 90600, chauffage_ecs: 137400 },
            { etas_min: 111, etas_max: 126, zone: 'H3', chauffage: 64700, chauffage_ecs: 108600 },
            { etas_min: 126, etas_max: 150, zone: 'H1', chauffage: 115000, chauffage_ecs: 167100 },
            { etas_min: 126, etas_max: 150, zone: 'H2', chauffage: 95900, chauffage_ecs: 145300 },
            { etas_min: 126, etas_max: 150, zone: 'H3', chauffage: 68500, chauffage_ecs: 115000 },
            { etas_min: 150, etas_max: 175, zone: 'H1', chauffage: 120300, chauffage_ecs: 174800 },
            { etas_min: 150, etas_max: 175, zone: 'H2', chauffage: 100300, chauffage_ecs: 152000 },
            { etas_min: 150, etas_max: 175, zone: 'H3', chauffage: 71600, chauffage_ecs: 120200 },
            { etas_min: 175, etas_max: 190, zone: 'H1', chauffage: 123900, chauffage_ecs: 180000 },
            { etas_min: 175, etas_max: 190, zone: 'H2', chauffage: 103300, chauffage_ecs: 156600 },
            { etas_min: 175, etas_max: 190, zone: 'H3', chauffage: 73800, chauffage_ecs: 123900 },
            { etas_min: 190, etas_max: null, zone: 'H1', chauffage: 126200, chauffage_ecs: 183200 },
            { etas_min: 190, etas_max: null, zone: 'H2', chauffage: 105100, chauffage_ecs: 159400 },
            { etas_min: 190, etas_max: null, zone: 'H3', chauffage: 75100, chauffage_ecs: 126100 },
          ],
        },
        {
          puissance_pac_categorie: '>400kW',
          axe_performance: 'cop_en_14511_2',
          rows: [
            { cop_min: 4.0, cop_max: 4.5, zone: 'H1', chauffage: 118500, chauffage_ecs: 172200 },
            { cop_min: 4.0, cop_max: 4.5, zone: 'H2', chauffage: 98800, chauffage_ecs: 149800 },
            { cop_min: 4.0, cop_max: 4.5, zone: 'H3', chauffage: 70600, chauffage_ecs: 118500 },
            { cop_min: 4.5, cop_max: 5.0, zone: 'H1', chauffage: 122300, chauffage_ecs: 177700 },
            { cop_min: 4.5, cop_max: 5.0, zone: 'H2', chauffage: 101900, chauffage_ecs: 154600 },
            { cop_min: 4.5, cop_max: 5.0, zone: 'H3', chauffage: 72800, chauffage_ecs: 122200 },
            { cop_min: 5.0, cop_max: 5.5, zone: 'H1', chauffage: 125400, chauffage_ecs: 182100 },
            { cop_min: 5.0, cop_max: 5.5, zone: 'H2', chauffage: 104500, chauffage_ecs: 158400 },
            { cop_min: 5.0, cop_max: 5.5, zone: 'H3', chauffage: 74600, chauffage_ecs: 125300 },
            { cop_min: 5.5, cop_max: null, zone: 'H1', chauffage: 127800, chauffage_ecs: 185700 },
            { cop_min: 5.5, cop_max: null, zone: 'H2', chauffage: 106500, chauffage_ecs: 161500 },
            { cop_min: 5.5, cop_max: null, zone: 'H3', chauffage: 76100, chauffage_ecs: 127800 },
          ],
        },
      ],
      source_pdf:
        'https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-TH-178%20vA75-1%20%C3%A0%20compter%20du%2001-01-2026_0.pdf',
      date_extraction: '2026-04-11',
    },
    notes:
      'Nouvelle fiche créée par le 75e arrêté CEE (06/09/2025), applicable ' +
      '01-01-2026. Remplace partiellement BAR-TH-166. Cumulable avec Fonds ' +
      'Chaleur ADEME sur dossiers déposés à partir du 01-01-2026. Date ' +
      "d'engagement = date de signature du devis du dispositif de captage. " +
      "Bonification Coup de pouce chauffage collectif x5 applicable jusqu'au " +
      '31-12-2030. Forfaits extraits verbatim du PDF vA75-1 ecologie.gouv.fr ' +
      'le 2026-04-11 — voir scripts/cee-fiches-178-179-180.md. ' +
      'Justificatifs : étude préalable de dimensionnement incluant étude des ' +
      'ressources géothermiques, décisions RGE OPQIBI 10.07 & 20.13, DOE ' +
      'forage, rapport fin de forage, le cas échéant notification ADEME.',
  },
  {
    code: 'BAR-TH-179',
    rge_formulation_arrete: FORMULATION_DECRET_2014_812,
    rge_qualifications_requises: [],
    rge_meta_domaines: ['Énergies renouvelables', 'Pompes à chaleur'],
    forfaits_table: {
      unite: 'kWhc_par_appartement',
      formule: 'montant × N × R',
      variables: {
        N: "Nombre d'appartements chauffés par la (ou les) PAC",
        R: FACTEUR_R,
      },
      duree_vie_ans: 22,
      puissance_max_pac_kw: 400,
      conditions_techniques: CONDITIONS_ETAS,
      rows: ROWS_179_180,
      source_pdf:
        'https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-TH-179%20vA75-1%20%C3%A0%20compter%20du%2001-01-2026.pdf',
      date_extraction: '2026-04-11',
    },
    notes:
      'Nouvelle fiche créée par le 75e arrêté CEE (06/09/2025), applicable ' +
      '01-01-2026. Remplace BAR-TH-166 pour les PAC collectives air/eau en ' +
      'résidentiel collectif. Bonification Coup de pouce "Chauffage des ' +
      'bâtiments résidentiels collectifs et tertiaires" : coefficient x3 ' +
      "(x4 en remplacement de chaudière charbon/fioul/gaz) jusqu'au " +
      '31-12-2030. Forfaits extraits verbatim du PDF vA75-1 ecologie.gouv.fr ' +
      'le 2026-04-11 — voir scripts/cee-fiches-178-179-180.md. Justificatifs ' +
      'spécifiques : note de dimensionnement générateur vs déperditions à ' +
      'T=Tbase, décision qualification/certification art. 2 décret 2014-812.',
  },
  {
    code: 'BAR-TH-180',
    rge_formulation_arrete: FORMULATION_DECRET_2014_812,
    rge_qualifications_requises: [],
    rge_meta_domaines: ['Énergies renouvelables', 'Pompes à chaleur'],
    forfaits_table: {
      unite: 'kWhc_par_appartement',
      formule: 'montant × N × R',
      variables: {
        N: "Nombre d'appartements chauffés par la (ou les) PAC",
        R: FACTEUR_R,
      },
      duree_vie_ans: 22,
      puissance_max_pac_kw: 400,
      types_pac_eligibles: [
        'eau/eau sur eaux usées (réseaux ou station)',
        'eau/eau sur eau de mer ou eaux de surface',
        "eau/eau sur eaux thermales ou eaux d'exhaure de mines",
        'eau glycolée/eau sur chaussées thermoactives',
        'géothermique type corbeille ou mur géothermique',
        'eau/eau sur aquifère superficiel sans travaux de forage',
        'eau glycolée/eau sur sondes géothermiques sans travaux de forage',
      ],
      conditions_techniques: CONDITIONS_ETAS,
      rows: ROWS_179_180,
      source_pdf:
        'https://www.ecologie.gouv.fr/sites/default/files/documents/BAR-TH-180%20vA75-1%20%C3%A0%20compter%20du%2001-01-2026_0.pdf',
      date_extraction: '2026-04-11',
    },
    notes:
      'Nouvelle fiche créée par le 75e arrêté CEE (06/09/2025), applicable ' +
      '01-01-2026. Remplace BAR-TH-166 pour les PAC collectives eau/eau ou ' +
      'eau glycolée/eau en résidentiel collectif SANS forage (forage = ' +
      'BAR-TH-178). Tableau de forfaits identique à BAR-TH-179. Bonification ' +
      'Coup de pouce "Chauffage des bâtiments résidentiels collectifs et ' +
      'tertiaires" : coefficient x4 (remplacement chaudière fossile) ' +
      "jusqu'au 31-12-2030. Forfaits extraits verbatim du PDF vA75-1 " +
      'ecologie.gouv.fr le 2026-04-11 — voir scripts/cee-fiches-178-179-180.md. ' +
      'Justificatifs spécifiques : note de dimensionnement générateur vs ' +
      'déperditions à T=Tbase, décision qualification/certification art. 2 ' +
      'décret 2014-812. QualiForage NON requis (contrairement à 397).',
  },
]

// ---------------------------------------------------------------------------
// Mig 401 — backfill rge_requirement_status
// ---------------------------------------------------------------------------

const MIG_401_STATUS = {
  'BAR-TH-178': 'required_with_codes',
  'BAR-TH-179': 'dispensed',
  'BAR-TH-180': 'dispensed',
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

const { data: liveRows, error: liveErr } = await supabase
  .from('cee_operations')
  .select('code,is_active')
  .in('code', [...ABROGEES, ...NOUVELLES].map((r) => r.code))
if (liveErr) throw liveErr
const live = new Map(liveRows.map((r) => [r.code, r]))

let planned = 0

// --- 397 §1 : abrogées (upsert, état final = inactif) ------------------------
for (const row of ABROGEES) {
  planned++
  console.log(`  [397] ${row.code} → ${live.has(row.code) ? 'update' : 'insert'} (inactif, abrogée)`)
  if (APPLY) {
    const { error } = await supabase
      .from('cee_operations')
      .upsert({ ...row, updated_at: new Date().toISOString() }, { onConflict: 'code' })
    if (error) throw new Error(`397 ${row.code}: ${error.message}`)
  }
}

// --- 397 §2 + 399 + 401 : nouvelles fiches (état final fusionné) -------------
for (const base of NOUVELLES) {
  const m399 = MIG_399.find((m) => m.code === base.code)
  const row = {
    ...base,
    ...m399,
    rge_requirement_status: MIG_401_STATUS[base.code],
    updated_at: new Date().toISOString(),
  }
  planned++
  console.log(
    `  [397+399+401] ${base.code} → ${live.has(base.code) ? 'update' : 'insert'} ` +
      `(actif, status=${row.rge_requirement_status}, quals=[${row.rge_qualifications_requises}], ` +
      `forfaits=${m399.forfaits_table.rows?.length ?? m399.forfaits_table.tables.length + ' tables'})`
  )
  if (APPLY) {
    const { error } = await supabase
      .from('cee_operations')
      .upsert(row, { onConflict: 'code' })
    if (error) throw new Error(`397+ ${base.code}: ${error.message}`)
  }
}

console.log(`\n${APPLY ? 'APPLIQUÉ' : 'DRY-RUN'} — ${planned} upserts${APPLY ? '' : ' (relancer avec --apply)'}`)
if (APPLY) {
  console.log('Suite : node scripts/replay-mig-400-403.mjs --apply  (justificatifs groupes 10/11/12)')
}
