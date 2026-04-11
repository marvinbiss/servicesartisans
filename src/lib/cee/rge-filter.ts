/**
 * CEE — filtrage RGE des providers avant dispatch (brique 1 bis).
 *
 * Contexte métier
 * ---------------
 * Un devis qualifié CEE (via `qualifyDevisForCee`) fait remonter un ou plusieurs
 * codes FOS applicables. Chaque fiche FOS a un état `rge_requirement_status`
 * (migration 401) qui décrit explicitement ce que l'arrêté exige en matière
 * de qualification RGE. Avant de router le devis à un artisan, il faut
 * s'assurer que l'artisan détient TOUTES les qualifs RGE actives exigées par
 * l'UNION des fiches applicables, ou que toutes les fiches sont hors périmètre
 * RGE. Sinon le dossier CEE sera irrecevable au dépôt PNCEE → prime perdue.
 *
 * Sémantique `rge_requirement_status` (migration 401)
 * ---------------------------------------------------
 *   * 'required_with_codes'    — exigence confirmée verbatim PDF DGEC, les
 *                                codes sont listés dans
 *                                `rge_qualifications_requises`. On applique
 *                                le match substring normalisé.
 *   * 'required_unknown_codes' — exigence probable, codes NON validés contre
 *                                une source primaire. On bascule en
 *                                FAIL-CLOSED strict : tous les providers
 *                                sont inéligibles pour CETTE fiche, et on
 *                                propage un flag `blockingAuditRequired` qui
 *                                invalide TOUT le devis (voir ci-dessous).
 *   * 'dispensed'              — l'arrêté renvoie au décret 2014-812 sans
 *                                qualif nominative. On matche alors
 *                                `operation.rge_decret_category` contre
 *                                `provider.rge_categories_decret` via array
 *                                overlap (migration 403 côté operation, 404
 *                                côté provider). Si la fiche n'a AUCUNE
 *                                catégorie renseignée (cas résiduel), on
 *                                retombe en pass-through.
 *   * 'not_applicable'         — fiche hors périmètre RGE (vraie dispense).
 *                                Pass-through total, aucun match.
 *
 * Règle transverse — audit bloquant
 * ---------------------------------
 * Dès qu'UNE SEULE fiche applicable est `required_unknown_codes`, on
 * considère que TOUT le devis est non-dispatchable (fail-CLOSED strict). On
 * ne peut pas dire « les autres fiches suffisent », parce qu'un dossier CEE
 * est examiné par le PNCEE sur la totalité des fiches déposées. Si l'une
 * d'elles exige un RGE nominatif et qu'on ne l'a pas validée contre l'arrêté,
 * on prend le risque de dispatcher à un artisan non-RGE → dossier rejeté.
 *
 * Le résultat renvoie un champ `blockingAuditRequired: string[]` qui liste
 * les codes FOS problématiques. Le caller (dispatcher) doit traiter ce champ
 * comme un STOP explicite : ne pas dispatcher, remonter en backlog d'audit,
 * logger côté Sentry.
 *
 * Sources de vérité
 * -----------------
 * - `cee_operations.rge_requirement_status` : décision sémantique explicite
 *   (migration 401).
 * - `cee_operations.rge_qualifications_requises` : libellés arrêté, utilisés
 *   UNIQUEMENT quand le status est `required_with_codes`. Les libellés sont
 *   des patterns (substring normalisé) — voir règle 4 ci-dessous.
 * - `providers.rge_qualifications` : JSONB array, shape `{code, nom, organisme,
 *   domaine, meta_domaine, date_debut, date_fin, url}` — peuplé par la sync
 *   ADEME (`src/lib/rge/sync.ts`, migration 380). Le matching se fait sur le
 *   CHAMP `nom` (= `nom_qualification` ADEME).
 * - `providers.rge_valid_until` : date max de validité (dénormalisée). Utilisée
 *   en secondaire — on vérifie aussi `date_fin` au niveau qualif pour précision.
 *
 * Règles d'implémentation
 * -----------------------
 * 1. Agrégation exigences : pour chaque fiche `required_with_codes`, on fait
 *    l'union dédupliquée des `rge_qualifications_requises`. Les fiches
 *    `dispensed` / `not_applicable` n'ajoutent rien. Les fiches
 *    `required_unknown_codes` sont collectées dans `blockingAuditRequired`.
 * 2. Si `blockingAuditRequired.length > 0` → fail-CLOSED strict, tout le
 *    devis en ineligible.
 * 3. Si la liste agrégée est VIDE et qu'aucune fiche n'est bloquante
 *    (toutes `dispensed` / `not_applicable`) → tous les providers sont
 *    éligibles (`hasCoverage = true`, `requiredCodes = []`).
 * 4. Validité temporelle : une qualif RGE compte si `date_fin >= today`. On
 *    s'appuie uniquement sur le JSONB car il est la source canonique (la sync
 *    filtre déjà les expirées au moment de l'aggregation — voir `sync.ts`).
 * 5. Matching libellés — les libellés côté `cee_operations` sont des PATTERNS
 *    courts (ex: "QualiPAC"), les libellés ADEME côté `rge_qualifications.nom`
 *    sont complets (ex: "QualiPAC Module Chauffage"). On fait donc un match
 *    **case-insensitive + trim + espaces normalisés + substring** (le libellé
 *    requis doit apparaître dans le nom ADEME). Pas de fuzzy sémantique.
 * 6. Provider sans siret : short-circuit → inéligible. Pas de query DB inutile.
 * 7. Provider sans JSONB `rge_qualifications` (NULL ou []) : inéligible si
 *    exigences > 0.
 * 8. **Fail-CLOSED sur erreur DB** : contrairement au reste du stack CEE qui
 *    est fail-open (ne jamais bloquer un devis), ici on bascule en fail-CLOSED.
 *    Raison : un dispatch à un artisan non-RGE = dossier CEE perdu = pire que
 *    « pas de dispatch CEE du tout ».
 * 9. Performance : en batch, UNE query `cee_operations` + UNE query
 *    `providers` filtrée sur `.in('id', providerIds)`. Pas de N+1.
 *
 * PII : on ne sélectionne que `id, siret, rge_qualifications`. Pas d'email/phone.
 *
 * Usage
 * -----
 * ```ts
 * const qualification = await qualifyDevisForCee(supabase, serviceSlug)
 * const candidates = await getCandidateProviderIds(...) // brique dispatcher
 * const result = await filterProvidersByCeeRge(supabase, {
 *   providerIds: candidates,
 *   operationCodes: qualification.codes,
 * })
 * if (result.blockingAuditRequired.length > 0) {
 *   // STOP : au moins une fiche FOS est en required_unknown_codes.
 *   // Ne pas dispatcher, remonter en backlog audit.
 *   return
 * }
 * // sinon dispatch vers result.eligible[].providerId
 * ```
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

// ---------------------------------------------------------------------------
// Types publics
// ---------------------------------------------------------------------------

/** Sentinelle utilisée dans `missingCodes` quand la fiche est en audit bloquant. */
export const AUDIT_REQUIRED_SENTINEL = 'AUDIT_REQUIS'

export type RgeRequirementStatus =
  | 'required_with_codes'
  | 'required_unknown_codes'
  | 'dispensed'
  | 'not_applicable'

export interface RgeCoverageCheck {
  /** true si le provider couvre TOUTES les qualifs requises (ou si requiredCodes est vide). */
  hasCoverage: boolean
  /** Liste dédupliquée des libellés de qualif exigés par l'union des fiches FOS. */
  requiredCodes: string[]
  /** Noms ADEME (tels quels) des qualifs actives trouvées sur le provider et qui matchent une exigence. */
  foundCodes: string[]
  /** Libellés exigés manquants (delta `requiredCodes` \ exigences couvertes). */
  missingCodes: string[]
  /**
   * Catégories du décret 2014-812 exigées par l'union des fiches `dispensed`
   * applicables (union sur `cee_operations.rge_decret_category`). Optionnel
   * pour rétro-compat avec les call sites existants qui construisent leurs
   * propres `RgeCoverageCheck` (tests dispatcher, etc.). Les fonctions de
   * cette brique l'initialisent toujours explicitement — un caller peut lire
   * `?? []` pour obtenir un tableau sûr.
   */
  requiredCategories?: number[]
  /**
   * Catégories du décret 2014-812 couvertes par le provider et intersectant
   * `requiredCategories`. Debug / logging / UI admin.
   */
  foundCategories?: number[]
  /**
   * Catégories exigées (requiredCategories) non couvertes par le provider.
   * Valeur brute INT[] — le caller peut afficher "°X" via un formatter dédié.
   */
  missingCategories?: number[]
  /** siret utilisé pour la vérif, ou null si provider sans siret. */
  siret: string | null
}

export interface FilterProvidersByCeeRgeInput {
  providerIds: string[]
  operationCodes: string[]
}

export interface FilterProvidersByCeeRgeResult {
  eligible: Array<{ providerId: string; coverage: RgeCoverageCheck }>
  ineligible: Array<{ providerId: string; coverage: RgeCoverageCheck }>
  /**
   * Codes FOS qui sont en `required_unknown_codes` côté `cee_operations`.
   * Non vide ⇒ TOUT le devis est non-dispatchable (fail-CLOSED strict). Le
   * caller doit interpréter ce champ comme un STOP audit, pas comme une
   * condition de dispatch partiel.
   */
  blockingAuditRequired: string[]
}

// ---------------------------------------------------------------------------
// Shape interne
// ---------------------------------------------------------------------------

interface RgeQualificationRow {
  code?: string
  nom?: string
  date_fin?: string
}

interface ProviderWithRge {
  id: string
  siret: string | null
  rge_qualifications: RgeQualificationRow[] | null
  /** INT[] des catégories du décret 2014-812 couvertes (migration 404). */
  rge_categories_decret: number[] | null
}

/**
 * Résultat interne de la résolution des exigences RGE sur les fiches FOS
 * applicables. Contient à la fois la liste des libellés à matcher côté
 * provider ET la liste des fiches en audit bloquant.
 */
interface ResolvedRequirements {
  /** Libellés dédupliqués à matcher (uniquement issus des fiches 'required_with_codes'). */
  requiredLabels: string[]
  /**
   * Catégories du décret 2014-812 dédupliquées issues de l'UNION des fiches
   * 'dispensed' applicables (chaque fiche renseigne un INT[] dans
   * `rge_decret_category` — cf. migration 403). Une fiche `dispensed` sans
   * catégorie (cas résiduel, non documenté par l'audit 403) ne contribue
   * rien → pass-through individuel pour cette fiche.
   */
  requiredCategories: number[]
  /** Codes FOS en `required_unknown_codes` — tout le devis est non-dispatchable si non-vide. */
  blockingAuditRequired: string[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Normalise un libellé de qualification RGE pour comparaison :
 *  - trim
 *  - toLowerCase()
 *  - compacte les espaces blancs multiples
 *
 * On ne touche ni aux accents ni à la ponctuation : les libellés ADEME et
 * arrêté sont stables sur ces aspects, et toucher à la diacritique risquerait
 * d'introduire des collisions (ex: "Qualit'EnR" vs "QualitEnR").
 */
function normalizeLabel(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').toLowerCase()
}

/** Date du jour au format ISO (YYYY-MM-DD), pour comparer à `date_fin`. */
function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Teste si une qualif ADEME (nom complet) satisfait un libellé exigé (pattern).
 * Match = substring sur les libellés normalisés. Le pattern arrêté doit
 * apparaître dans le nom ADEME (ex: requis "QualiPAC" → OK pour "QualiPAC Module Chauffage").
 */
function qualifMatchesRequirement(ademeNom: string, requiredLabel: string): boolean {
  const needle = normalizeLabel(requiredLabel)
  if (needle.length === 0) return false
  return normalizeLabel(ademeNom).includes(needle)
}

/**
 * Row interne retournée par la query `cee_operations` dans cette brique.
 */
interface CeeOperationRow {
  code: string
  rge_qualifications_requises: string[] | null
  rge_requirement_status: RgeRequirementStatus | null
  /**
   * Catégories du décret 2014-812 citées par l'arrêté (migration 403). INT[]
   * — vide pour les fiches `not_applicable` et les rares fiches `dispensed`
   * sans catégorie identifiable. Utilisée uniquement pour le status
   * `dispensed` (match par catégorie décret).
   */
  rge_decret_category: number[] | null
}

/**
 * Résout les exigences RGE agrégées pour une liste de codes FOS. Consomme la
 * colonne `rge_requirement_status` (migration 401) pour distinguer les 4
 * états et produire :
 *   - `requiredLabels` — union dédupliquée des libellés issus UNIQUEMENT des
 *     fiches 'required_with_codes'
 *   - `blockingAuditRequired` — codes FOS en 'required_unknown_codes'
 *
 * Retourne `null` en cas d'erreur DB (le caller décide du fail-closed).
 */
async function resolveRgeRequirements(
  supabase: SupabaseClient,
  operationCodes: string[]
): Promise<ResolvedRequirements | null> {
  if (operationCodes.length === 0) {
    return { requiredLabels: [], requiredCategories: [], blockingAuditRequired: [] }
  }

  const { data, error } = await supabase
    .from('cee_operations')
    .select('code, rge_qualifications_requises, rge_requirement_status, rge_decret_category')
    .eq('is_active', true)
    .in('code', operationCodes)

  if (error) {
    logger.error('rge-filter: failed to fetch cee_operations requirements', {
      action: 'cee-rge-filter-requirements',
      error: error.message,
      operationCodes,
    })
    return null
  }

  const rows = (data ?? []) as CeeOperationRow[]

  const seen = new Set<string>()
  const requiredLabels: string[] = []
  const seenCategories = new Set<number>()
  const requiredCategories: number[] = []
  const blockingAuditRequired: string[] = []

  for (const row of rows) {
    // Défaut conservateur : si status absent (row migrée avant 401), on traite
    // comme 'required_unknown_codes' pour forcer l'audit explicite.
    const status: RgeRequirementStatus = row.rge_requirement_status ?? 'required_unknown_codes'

    if (status === 'required_unknown_codes') {
      blockingAuditRequired.push(row.code)
      logger.error('rge-filter: fiche FOS en required_unknown_codes, dispatch bloqué', {
        action: 'cee-rge-filter-audit-required',
        code: row.code,
      })
      continue
    }

    if (status === 'not_applicable') {
      // Fiche hors périmètre RGE total (BAR-TH-129, BAR-TH-161). Pass-through.
      continue
    }

    if (status === 'dispensed') {
      // Clause générique décret 2014-812 — on agrège les catégories citées.
      // Si la fiche n'en a aucune (cas résiduel post-audit 403), elle ne
      // contribue rien et se comporte comme un pass-through pour CE code.
      const cats = Array.isArray(row.rge_decret_category) ? row.rge_decret_category : []
      for (const c of cats) {
        if (typeof c !== 'number' || !Number.isFinite(c)) continue
        if (seenCategories.has(c)) continue
        seenCategories.add(c)
        requiredCategories.push(c)
      }
      continue
    }

    // status === 'required_with_codes' : on agrège les libellés.
    const arr = row.rge_qualifications_requises ?? []
    for (const raw of arr) {
      if (typeof raw !== 'string') continue
      const key = normalizeLabel(raw)
      if (!key || seen.has(key)) continue
      seen.add(key)
      requiredLabels.push(raw.trim())
    }
  }

  return { requiredLabels, requiredCategories, blockingAuditRequired }
}

/**
 * Évalue la couverture d'un provider contre une liste de libellés RGE requis
 * déjà agrégée. Ne fait aucune I/O.
 */
function evaluateCoverage(
  provider: ProviderWithRge,
  requiredLabels: string[],
  requiredCategories: number[]
): RgeCoverageCheck {
  // Cas 1 : aucune exigence (ni libellé, ni catégorie) → toujours couvert
  if (requiredLabels.length === 0 && requiredCategories.length === 0) {
    return {
      hasCoverage: true,
      requiredCodes: [],
      foundCodes: [],
      missingCodes: [],
      requiredCategories: [],
      foundCategories: [],
      missingCategories: [],
      siret: provider.siret,
    }
  }

  // Cas 2 : provider sans siret → inéligible d'office
  if (!provider.siret) {
    return {
      hasCoverage: false,
      requiredCodes: requiredLabels,
      foundCodes: [],
      missingCodes: requiredLabels,
      requiredCategories,
      foundCategories: [],
      missingCategories: requiredCategories,
      siret: null,
    }
  }

  // Cas 3 : couverture catégories décret (status = dispensed)
  const providerCategories = Array.isArray(provider.rge_categories_decret)
    ? provider.rge_categories_decret.filter((n): n is number => typeof n === 'number')
    : []
  const providerCategoriesSet = new Set<number>(providerCategories)
  const foundCategories: number[] = []
  const missingCategories: number[] = []
  for (const cat of requiredCategories) {
    if (providerCategoriesSet.has(cat)) {
      foundCategories.push(cat)
    } else {
      missingCategories.push(cat)
    }
  }

  // Cas 4 : couverture libellés (status = required_with_codes)
  const qualifs = Array.isArray(provider.rge_qualifications) ? provider.rge_qualifications : []

  // Si on exige des libellés et que le provider n'a pas de qualifs → fail
  if (requiredLabels.length > 0 && qualifs.length === 0) {
    return {
      hasCoverage: false,
      requiredCodes: requiredLabels,
      foundCodes: [],
      missingCodes: requiredLabels,
      requiredCategories,
      foundCategories,
      missingCategories,
      siret: provider.siret,
    }
  }

  const today = todayIso()
  // Les `date_fin` sont normalisées en ISO (YYYY-MM-DD) par la sync ADEME (sync.ts) : comparaison string fiable.
  const ISO_DATE_PREFIX = /^\d{4}-\d{2}-\d{2}/
  const activeQualifs = qualifs.filter((q) => {
    if (!q || typeof q.nom !== 'string') return false
    if (typeof q.date_fin === 'string' && q.date_fin.length > 0) {
      if (!ISO_DATE_PREFIX.test(q.date_fin)) {
        // Format inattendu (non normalisé par la sync) → fail-CLOSED : on considère la qualif expirée.
        logger.warn('rge-filter: date_fin format inattendu, qualif considérée expirée', {
          action: 'cee-rge-filter-date-format',
          siret: provider.siret,
          qualif_nom: q.nom,
          date_fin: q.date_fin,
        })
        return false
      }
      return q.date_fin.slice(0, 10) >= today
    }
    return true
  })

  const foundSet = new Set<string>()
  const missingLabels: string[] = []
  for (const required of requiredLabels) {
    const hit = activeQualifs.find((q) => qualifMatchesRequirement(q.nom as string, required))
    if (hit) {
      foundSet.add(hit.nom as string)
    } else {
      missingLabels.push(required)
    }
  }

  const hasCoverage = missingLabels.length === 0 && missingCategories.length === 0

  return {
    hasCoverage,
    requiredCodes: requiredLabels,
    foundCodes: Array.from(foundSet),
    missingCodes: missingLabels,
    requiredCategories,
    foundCategories,
    missingCategories,
    siret: provider.siret,
  }
}

/**
 * Construit un `RgeCoverageCheck` d'audit bloquant (blockingAuditRequired
 * non vide). Utilisé pour marquer tous les providers comme inéligibles avec
 * la sentinelle `AUDIT_REQUIS` — le caller doit interpréter ça comme un STOP.
 */
function buildAuditBlockedCoverage(siret: string | null): RgeCoverageCheck {
  return {
    hasCoverage: false,
    requiredCodes: [],
    foundCodes: [],
    missingCodes: [AUDIT_REQUIRED_SENTINEL],
    requiredCategories: [],
    foundCategories: [],
    missingCategories: [],
    siret,
  }
}

// ---------------------------------------------------------------------------
// API publique
// ---------------------------------------------------------------------------

/**
 * Vérifie qu'un provider couvre les qualifs RGE requises pour une liste de
 * codes FOS CEE. Check unitaire — pour le batch, préférer `filterProvidersByCeeRge`
 * qui n'exécute qu'une seule query providers.
 *
 * Fail-CLOSED sur erreur DB OU sur présence d'une fiche `required_unknown_codes`.
 */
export async function checkProviderRgeCoverage(
  supabase: SupabaseClient,
  providerId: string,
  operationCodes: string[]
): Promise<RgeCoverageCheck> {
  const resolved = await resolveRgeRequirements(supabase, operationCodes)
  if (resolved === null) {
    // fail-closed DB — on renvoie un "inéligible" explicite
    return {
      hasCoverage: false,
      requiredCodes: [],
      foundCodes: [],
      missingCodes: [],
      requiredCategories: [],
      foundCategories: [],
      missingCategories: [],
      siret: null,
    }
  }

  // Audit bloquant : au moins une fiche en required_unknown_codes → STOP
  if (resolved.blockingAuditRequired.length > 0) {
    return buildAuditBlockedCoverage(null)
  }

  const { requiredLabels, requiredCategories } = resolved

  // Pas d'exigences (toutes not_applicable, ou dispensed sans categorie) → court-circuit
  if (requiredLabels.length === 0 && requiredCategories.length === 0) {
    return {
      hasCoverage: true,
      requiredCodes: [],
      foundCodes: [],
      missingCodes: [],
      requiredCategories: [],
      foundCategories: [],
      missingCategories: [],
      siret: null,
    }
  }

  const { data, error } = await supabase
    .from('providers')
    .select('id, siret, rge_qualifications, rge_categories_decret')
    .eq('id', providerId)
    .limit(1)

  if (error) {
    logger.error('rge-filter: failed to fetch provider', {
      action: 'cee-rge-filter-provider',
      error: error.message,
      providerId,
    })
    return {
      hasCoverage: false,
      requiredCodes: requiredLabels,
      foundCodes: [],
      missingCodes: requiredLabels,
      requiredCategories,
      foundCategories: [],
      missingCategories: requiredCategories,
      siret: null,
    }
  }

  const row = (data?.[0] ?? null) as ProviderWithRge | null
  if (!row) {
    return {
      hasCoverage: false,
      requiredCodes: requiredLabels,
      foundCodes: [],
      missingCodes: requiredLabels,
      requiredCategories,
      foundCategories: [],
      missingCategories: requiredCategories,
      siret: null,
    }
  }

  return evaluateCoverage(row, requiredLabels, requiredCategories)
}

/**
 * Filtre une liste de providers candidats au dispatch en ne gardant que ceux
 * qui couvrent toutes les qualifs RGE exigées par les fiches FOS applicables.
 *
 * Performance : 2 queries au total (cee_operations + providers), peu importe
 * le nombre de providers. Les providers sans siret sont traités en mémoire
 * sans query supplémentaire.
 *
 * Fail-CLOSED triple :
 *   1. Erreur DB cee_operations ou providers → tous en ineligible.
 *   2. Au moins une fiche FOS en `required_unknown_codes` → tous en
 *      ineligible, `blockingAuditRequired` rempli (STOP dispatch).
 *   3. Provider sans RGE valide → ineligible individuel.
 */
export async function filterProvidersByCeeRge(
  supabase: SupabaseClient,
  input: FilterProvidersByCeeRgeInput
): Promise<FilterProvidersByCeeRgeResult> {
  const { providerIds, operationCodes } = input

  if (providerIds.length === 0) {
    return { eligible: [], ineligible: [], blockingAuditRequired: [] }
  }

  const resolved = await resolveRgeRequirements(supabase, operationCodes)
  if (resolved === null) {
    // Fail-CLOSED DB : tout en ineligible avec missingCodes vide
    return {
      eligible: [],
      ineligible: providerIds.map((providerId) => ({
        providerId,
        coverage: {
          hasCoverage: false,
          requiredCodes: [],
          foundCodes: [],
          missingCodes: [],
          requiredCategories: [],
          foundCategories: [],
          missingCategories: [],
          siret: null,
        },
      })),
      blockingAuditRequired: [],
    }
  }

  // Fail-CLOSED audit : au moins une fiche FOS en required_unknown_codes. On
  // ne peut pas dispatcher ce devis avant qu'un humain ait validé la clause
  // RGE dans le PDF DGEC.
  if (resolved.blockingAuditRequired.length > 0) {
    return {
      eligible: [],
      ineligible: providerIds.map((providerId) => ({
        providerId,
        coverage: buildAuditBlockedCoverage(null),
      })),
      blockingAuditRequired: resolved.blockingAuditRequired,
    }
  }

  const { requiredLabels, requiredCategories } = resolved

  // Cas particulier : aucune exigence RGE (toutes not_applicable, ou dispensed
  // sans catégorie identifiable) → tous éligibles, on évite même la query.
  if (requiredLabels.length === 0 && requiredCategories.length === 0) {
    return {
      eligible: providerIds.map((providerId) => ({
        providerId,
        coverage: {
          hasCoverage: true,
          requiredCodes: [],
          foundCodes: [],
          missingCodes: [],
          requiredCategories: [],
          foundCategories: [],
          missingCategories: [],
          siret: null,
        },
      })),
      ineligible: [],
      blockingAuditRequired: [],
    }
  }

  // UNE seule query pour tous les providers candidats.
  const { data, error } = await supabase
    .from('providers')
    .select('id, siret, rge_qualifications, rge_categories_decret')
    .in('id', providerIds)

  if (error) {
    logger.error('rge-filter: failed to batch fetch providers', {
      action: 'cee-rge-filter-batch',
      error: error.message,
      providerCount: providerIds.length,
    })
    return {
      eligible: [],
      ineligible: providerIds.map((providerId) => ({
        providerId,
        coverage: {
          hasCoverage: false,
          requiredCodes: requiredLabels,
          foundCodes: [],
          missingCodes: requiredLabels,
          requiredCategories,
          foundCategories: [],
          missingCategories: requiredCategories,
          siret: null,
        },
      })),
      blockingAuditRequired: [],
    }
  }

  const rowsById = new Map<string, ProviderWithRge>()
  for (const row of (data ?? []) as ProviderWithRge[]) {
    rowsById.set(row.id, row)
  }

  const eligible: FilterProvidersByCeeRgeResult['eligible'] = []
  const ineligible: FilterProvidersByCeeRgeResult['ineligible'] = []

  for (const providerId of providerIds) {
    const row = rowsById.get(providerId)
    if (!row) {
      // Provider absent de la DB (soft-deleted, id invalide, RLS) → inéligible explicite
      ineligible.push({
        providerId,
        coverage: {
          hasCoverage: false,
          requiredCodes: requiredLabels,
          foundCodes: [],
          missingCodes: requiredLabels,
          requiredCategories,
          foundCategories: [],
          missingCategories: requiredCategories,
          siret: null,
        },
      })
      continue
    }
    const coverage = evaluateCoverage(row, requiredLabels, requiredCategories)
    if (coverage.hasCoverage) {
      eligible.push({ providerId, coverage })
    } else {
      ineligible.push({ providerId, coverage })
    }
  }

  return { eligible, ineligible, blockingAuditRequired: [] }
}
