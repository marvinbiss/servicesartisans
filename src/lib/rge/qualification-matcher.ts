/**
 * qualification-matcher — mapping qualif ADEME → guides éditoriaux internes
 * -------------------------------------------------------------------------
 * Rôle : à partir du champ `rge_qualifications` d'un provider (source ADEME,
 * migration 380), détecte les catégories de travaux couvertes pour :
 *
 *   1. pointer vers les guides `/rge/qualifications/[slug]` pertinents
 *   2. lister les opérations CEE débloquées qui ont un guide
 *      `/cee/[operation]/guide`
 *
 * Pure JS, zéro dépendance. Utilisable côté serveur ou client.
 *
 * Source des libellés : dataset data.gouv.fr `liste-des-entreprises-rge-2`
 * (échantillon réel : "QualiPAC Chauffage — Pose de pompe à chaleur",
 * "QualiBois module Eau", "Panneaux Solaires Photovoltaïques", etc.)
 */

export interface RgeQualificationInput {
  code: string
  nom: string
  organisme: string
  domaine: string | null
  meta_domaine: string | null
  date_debut: string
  date_fin: string
  url: string | null
}

export type RgeCategory =
  | 'pac'
  | 'bois'
  | 'solaire-thermique'
  | 'photovoltaique'
  | 'isolation'
  | 'menuiserie'
  | 'ventilation'
  | 'audit-energetique'
  | 'chaudiere-condensation'

/**
 * Slugs de guides RGE rendus via les fiches artisans enrichies
 * (ArtisanRgeEnrichedSection). Ces slugs sont ceux renvoyés par
 * `matchQualifications` et référencés dans `GUIDE_META`.
 *
 * Note : d'autres slugs de guides existent dans `RGE_QUALIFICATION_GUIDES`
 * mais ne sont rendus que via les pages statiques
 * `/rge/qualifications/[slug]` — ils ne font pas partie du matcher tant
 * qu'ils ne sont pas déclarés ici.
 */
export type RgeGuideSlug =
  | 'qualipac'
  | 'qualisol'
  | 'qualibois'
  | 'qualifelec'
  | 'qualipv'
  | 'architecte-audit-energetique'
  | 'qualibat-5911-thermique'
  | 'qualibat-7131-isolation'
  | 'qualifelec-irve'

export interface QualificationMatch {
  /** Slugs de guides /rge/qualifications/[slug] pertinents */
  guideSlugs: RgeGuideSlug[]
  /** Codes CEE débloqués qui ont un guide /cee/[op]/guide */
  ceeOpCodes: string[]
  /** Catégories détectées (pour affichage / debug) */
  categories: RgeCategory[]
}

/** Opérations CEE qui ont un guide éditorial dans /cee/[op]/guide */
const CEE_CODES_WITH_GUIDE: readonly string[] = [
  // BAR-TH-104 abrogée 01/01/2024 → remplacée par BAR-TH-171
  // BAR-TH-106 abrogée 01/01/2024 — chaudières gaz/fioul plus éligibles CEE
  'BAR-TH-171',
  'BAR-TH-129',
  'BAR-TH-148',
  'BAR-TH-112',
  'BAR-TH-113',
  'BAR-TH-125',
  'BAR-EN-101',
  'BAR-EN-102',
  'BAR-EN-103',
  'BAR-EN-104',
] as const

/** Catégorie → codes CEE débloqués (filtrés à ceux qui ont un guide) */
const CATEGORY_TO_CEE: Record<RgeCategory, string[]> = {
  pac: ['BAR-TH-171', 'BAR-TH-129', 'BAR-TH-148'],
  bois: ['BAR-TH-112', 'BAR-TH-113'],
  // Solaire thermique : BAR-TH-101 (CESI) et BAR-TH-143 (SSC) existent au JO
  // mais n'ont pas encore de guide interne dans CEE_CODES_WITH_GUIDE.
  'solaire-thermique': [],
  // PV pur non éligible CEE P6 en résidentiel : aucun BAR-EN/BAR-TH au JO ne
  // couvre le photovoltaïque pur. Les aides sont hors CEE (prime
  // autoconsommation EDF OA, TVA 10%, exonération IR partielle). Ne pas
  // inventer d'opération ici — tableau vide = comportement correct.
  photovoltaique: [],
  isolation: ['BAR-EN-101', 'BAR-EN-102', 'BAR-EN-103'],
  menuiserie: ['BAR-EN-104'],
  ventilation: ['BAR-TH-125'],
  'audit-energetique': [],
  // Catégorie obsolète depuis abrogation BAR-TH-106 (01/01/2024). Les
  // chaudières gaz/fioul ne sont plus éligibles CEE.
  'chaudiere-condensation': [],
}

function normalize(s: string | null | undefined): string {
  if (!s) return ''
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function detectCategories(q: RgeQualificationInput): RgeCategory[] {
  const text = normalize(`${q.nom} ${q.domaine ?? ''} ${q.meta_domaine ?? ''}`)
  const cats: RgeCategory[] = []

  // PAC — "qualipac", "pompe a chaleur", "chauffe-eau thermodynamique"
  if (
    text.includes('qualipac') ||
    text.includes('pompe a chaleur') ||
    text.includes('chauffe-eau thermodynamique') ||
    text.includes('chauffe eau thermodynamique')
  ) {
    cats.push('pac')
  }

  // Bois — "qualibois", "chaudiere bois", "poele", "granules", "insert bois"
  if (
    text.includes('qualibois') ||
    text.includes('chaudiere bois') ||
    text.includes('poele') ||
    text.includes('insert bois') ||
    text.includes('granules')
  ) {
    cats.push('bois')
  }

  // Solaire thermique — "qualisol", "solaire thermique", "cesi", "chauffe-eau solaire"
  if (
    text.includes('qualisol') ||
    text.includes('solaire thermique') ||
    text.includes('chauffe-eau solaire') ||
    text.includes('chauffe eau solaire') ||
    text.includes('cesi ') ||
    text.endsWith('cesi') ||
    text.includes(' ssc')
  ) {
    cats.push('solaire-thermique')
  }

  // Photovoltaïque — "qualipv", "photovoltaique", "panneaux solaires photovoltaiques"
  if (
    text.includes('qualipv') ||
    text.includes('photovoltaique') ||
    text.includes('panneaux solaires photo')
  ) {
    cats.push('photovoltaique')
  }

  // Isolation — large umbrella (Qualibat codes 4131*, 7121*, 7122*…)
  if (text.includes('isolation')) {
    cats.push('isolation')
  }

  // Menuiserie — fenêtres, baies, menuiseries extérieures
  if (
    text.includes('menuiserie') ||
    text.includes('fenetre') ||
    text.includes('baie vitree') ||
    text.includes('baies vitrees')
  ) {
    cats.push('menuiserie')
  }

  // Ventilation — VMC, ventilation mécanique
  if (text.includes('ventilation') || text.includes('vmc')) {
    cats.push('ventilation')
  }

  // Audit énergétique — architectes CNOA, BET OPQIBI 1905/1911
  if (
    text.includes('audit energetique') ||
    text.includes('architecte') ||
    text.includes('faire.fr') ||
    text.includes('maitrise d') // "maîtrise d'œuvre des installations…" → bureau d'études
  ) {
    cats.push('audit-energetique')
  }

  // Chaudière gaz/fioul à condensation — BAR-TH-106
  if (
    text.includes('chaudiere gaz') ||
    text.includes('chaudiere fuel') ||
    text.includes('chaudiere fioul') ||
    text.includes('chaudiere gaz/fuel') ||
    text.includes('chaudiere condensation') ||
    text.includes('micro-cogeneration') ||
    text.includes('chaudiere a gaz')
  ) {
    cats.push('chaudiere-condensation')
  }

  return cats
}

/**
 * Détecte Qualibat 5911 (Installation de systèmes thermiques, classe 3)
 * de façon conservatrice. On s'appuie exclusivement sur le champ `code`
 * de la qualif (alimenté par `code_qualification` du dataset ADEME),
 * qui pour Qualibat est un code numérique à 4 chiffres (5911, 5912,
 * 5713…). Matcher sur le texte seul serait trop permissif : Qualibat
 * compte des milliers de qualifs tous corps de métier confondus et la
 * chaîne "thermique" apparaît aussi dans des libellés non-5911.
 *
 * Règle stricte : code commence par "5911" ET organisme contient
 * "qualibat" (double garde-fou contre une collision de code avec un
 * autre organisme qui utiliserait aussi 4 chiffres).
 */
function isQualibat5911(q: RgeQualificationInput): boolean {
  const code = (q.code ?? '').trim()
  if (!code.startsWith('5911')) return false
  const organisme = normalize(q.organisme)
  return organisme.includes('qualibat')
}

/**
 * Détecte Qualibat 7131 / 7141 (Isolation thermique par l'intérieur —
 * combles perdus, combles aménagés, rampants, murs intérieurs).
 *
 * Même logique stricte que `isQualibat5911` : on se base sur le code
 * numérique Qualibat à 4 chiffres (alimenté par `code_qualification` du
 * dataset ADEME) + garde-fou organisme. 7131 et 7141 mappent vers le
 * même guide éditorial interne (ITI combles + ITI toiture).
 */
function isQualibatIsolation(q: RgeQualificationInput): boolean {
  const code = (q.code ?? '').trim()
  if (!code.startsWith('7131') && !code.startsWith('7141')) return false
  const organisme = normalize(q.organisme)
  return organisme.includes('qualibat')
}

/**
 * Détecte une qualification Qualifelec IRVE (Infrastructure de Recharge
 * de Véhicule Électrique — niveaux P1, P2, P3). Pattern textuel sur
 * `nom` / `domaine` : les libellés ADEME typiques contiennent "IRVE",
 * "Borne de recharge" ou "Infrastructure de recharge". Indépendant du
 * code car Qualifelec n'utilise pas de numérotation 4 chiffres stable
 * pour IRVE et le pattern text est suffisamment spécifique.
 */
function isQualifelecIrve(q: RgeQualificationInput): boolean {
  const text = normalize(`${q.nom} ${q.domaine ?? ''}`)
  return (
    text.includes('irve') ||
    text.includes('borne de recharge') ||
    text.includes('infrastructure de recharge')
  )
}

/**
 * Agrège un jeu de qualifications RGE en un set de guides internes à
 * linker + d'opérations CEE débloquées.
 *
 * - `organismes` sert à ajouter `qualifelec` quand l'artisan est
 *   certifié Qualifelec RGE (souvent pour du PV ou des PAC électriques).
 */
export function matchQualifications(
  qualifications: RgeQualificationInput[] | null | undefined,
  organismes: string[] | null | undefined
): QualificationMatch {
  if (!qualifications || qualifications.length === 0) {
    return { guideSlugs: [], ceeOpCodes: [], categories: [] }
  }

  const categoriesAll: RgeCategory[] = []
  let hasQualibat5911 = false
  let hasQualibatIsolation = false
  let hasQualifelecIrve = false
  for (const q of qualifications) {
    for (const c of detectCategories(q)) {
      if (!categoriesAll.includes(c)) categoriesAll.push(c)
    }
    if (!hasQualibat5911 && isQualibat5911(q)) hasQualibat5911 = true
    if (!hasQualibatIsolation && isQualibatIsolation(q)) hasQualibatIsolation = true
    if (!hasQualifelecIrve && isQualifelecIrve(q)) hasQualifelecIrve = true
  }

  const guideSlugs: RgeGuideSlug[] = []
  const pushGuide = (slug: RgeGuideSlug) => {
    if (!guideSlugs.includes(slug)) guideSlugs.push(slug)
  }
  if (categoriesAll.includes('pac')) pushGuide('qualipac')
  if (categoriesAll.includes('bois')) pushGuide('qualibois')
  if (categoriesAll.includes('solaire-thermique')) pushGuide('qualisol')
  if (categoriesAll.includes('photovoltaique')) pushGuide('qualipv')
  if (categoriesAll.includes('audit-energetique')) pushGuide('architecte-audit-energetique')
  if (hasQualibat5911) pushGuide('qualibat-5911-thermique')
  if (hasQualibatIsolation) pushGuide('qualibat-7131-isolation')
  if (hasQualifelecIrve) pushGuide('qualifelec-irve')

  // Qualifelec : organisme électrotechnique → guide Qualifelec pertinent
  // dès que l'artisan est certifié par Qualifelec, indépendamment du métier.
  const normalizedOrgs = (organismes ?? []).map((o) => o.toLowerCase())
  if (normalizedOrgs.some((o) => o.includes('qualifelec'))) {
    pushGuide('qualifelec')
  }

  const ceeOpCodes: string[] = []
  for (const cat of categoriesAll) {
    for (const code of CATEGORY_TO_CEE[cat]) {
      if (!ceeOpCodes.includes(code) && CEE_CODES_WITH_GUIDE.includes(code)) {
        ceeOpCodes.push(code)
      }
    }
  }

  return {
    guideSlugs,
    ceeOpCodes,
    categories: categoriesAll,
  }
}
