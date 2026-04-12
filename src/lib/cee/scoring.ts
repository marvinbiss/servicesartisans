/**
 * CEE dossier scoring — calcul de priorite cote application.
 *
 * Attribue un score 0-100 et un tier (S/A/B/C) a chaque dossier CEE
 * pour prioriser les dossiers les plus rentables (kWhc eleve = plus de
 * revenu mandataire). Le score influence l'ordre d'affichage dans les
 * dashboards artisan et admin, et pourra servir au routing intelligent.
 *
 * Design :
 *   - Calcul purement applicatif, pas de migration SQL
 *   - Fail-open : si le scoring echoue, default tier = 'C', score = 0
 *   - Stocke dans metadata.priority_score du dossier (JSONB)
 */

// ---------------------------------------------------------------------------
// Types publics
// ---------------------------------------------------------------------------

export interface CeeDossierScoreInput {
  kwhcEstime: number | null
  primeEstimeeEur: number | null
  zoneClimatique: 'H1' | 'H2' | 'H3' | null
  operationCode: string
  isPrecarite: boolean
}

export type CeeDossierTier = 'S' | 'A' | 'B' | 'C'

export interface CeeDossierScore {
  score: number // 0-100
  tier: CeeDossierTier
  factors: string[] // raisons du score pour affichage
}

// ---------------------------------------------------------------------------
// Constantes internes
// ---------------------------------------------------------------------------

/** Operations PAC — score max (10 pts). */
const HIGH_VALUE_OPS = new Set(['BAR-TH-171'])

/** Operations isolation — score eleve (8 pts). */
const MEDIUM_VALUE_OPS = new Set(['BAR-EN-101', 'BAR-EN-102', 'BAR-EN-103'])

/** Score par defaut en cas d'erreur. */
const DEFAULT_SCORE: CeeDossierScore = {
  score: 0,
  tier: 'C',
  factors: ['Scoring indisponible'],
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function scoreKwhc(kwhc: number | null): { points: number; label: string } {
  if (kwhc === null || kwhc <= 0) {
    return { points: 5, label: 'kWhc inconnu (+5)' }
  }
  if (kwhc > 100_000) {
    return { points: 40, label: `${kwhc.toLocaleString('fr-FR')} kWhc > 100 000 (+40)` }
  }
  if (kwhc > 50_000) {
    return { points: 30, label: `${kwhc.toLocaleString('fr-FR')} kWhc > 50 000 (+30)` }
  }
  if (kwhc > 20_000) {
    return { points: 20, label: `${kwhc.toLocaleString('fr-FR')} kWhc > 20 000 (+20)` }
  }
  if (kwhc > 5_000) {
    return { points: 10, label: `${kwhc.toLocaleString('fr-FR')} kWhc > 5 000 (+10)` }
  }
  return { points: 5, label: `${kwhc.toLocaleString('fr-FR')} kWhc <= 5 000 (+5)` }
}

function scorePrime(euros: number | null): { points: number; label: string } {
  if (euros === null || euros <= 0) {
    return { points: 5, label: 'Prime inconnue (+5)' }
  }
  if (euros > 2_000) {
    return { points: 30, label: `Prime ${euros.toLocaleString('fr-FR')} EUR > 2 000 (+30)` }
  }
  if (euros > 1_000) {
    return { points: 20, label: `Prime ${euros.toLocaleString('fr-FR')} EUR > 1 000 (+20)` }
  }
  if (euros > 500) {
    return { points: 15, label: `Prime ${euros.toLocaleString('fr-FR')} EUR > 500 (+15)` }
  }
  if (euros > 200) {
    return { points: 10, label: `Prime ${euros.toLocaleString('fr-FR')} EUR > 200 (+10)` }
  }
  return { points: 5, label: `Prime ${euros.toLocaleString('fr-FR')} EUR <= 200 (+5)` }
}

function scoreZone(zone: 'H1' | 'H2' | 'H3' | null): { points: number; label: string } {
  switch (zone) {
    case 'H1':
      return { points: 10, label: 'Zone H1 — climat froid (+10)' }
    case 'H2':
      return { points: 7, label: 'Zone H2 — climat tempere (+7)' }
    case 'H3':
      return { points: 4, label: 'Zone H3 — climat chaud (+4)' }
    default:
      return { points: 0, label: 'Zone inconnue (+0)' }
  }
}

function scoreOperation(code: string): { points: number; label: string } {
  if (HIGH_VALUE_OPS.has(code)) {
    return { points: 10, label: `${code} — PAC haute valeur (+10)` }
  }
  if (MEDIUM_VALUE_OPS.has(code)) {
    return { points: 8, label: `${code} — isolation (+8)` }
  }
  return { points: 5, label: `${code} — standard (+5)` }
}

function scorePrecarite(isPrecarite: boolean): { points: number; label: string } {
  if (isPrecarite) {
    return { points: 10, label: 'Menage precaire — cours CEE x2 (+10)' }
  }
  return { points: 0, label: '' }
}

function tierFromScore(score: number): CeeDossierTier {
  if (score >= 80) return 'S'
  if (score >= 60) return 'A'
  if (score >= 40) return 'B'
  return 'C'
}

// ---------------------------------------------------------------------------
// API publique
// ---------------------------------------------------------------------------

/**
 * Calcule le score de priorite d'un dossier CEE.
 *
 * Fail-open : retourne tier='C', score=0 si le calcul echoue.
 */
export function computeCeeDossierScore(input: CeeDossierScoreInput): CeeDossierScore {
  try {
    const kwhcResult = scoreKwhc(input.kwhcEstime)
    const primeResult = scorePrime(input.primeEstimeeEur)
    const zoneResult = scoreZone(input.zoneClimatique)
    const opResult = scoreOperation(input.operationCode)
    const precaResult = scorePrecarite(input.isPrecarite)

    const total = Math.min(
      100,
      kwhcResult.points +
        primeResult.points +
        zoneResult.points +
        opResult.points +
        precaResult.points
    )

    const factors = [kwhcResult.label, primeResult.label, zoneResult.label, opResult.label]
    if (precaResult.label) factors.push(precaResult.label)

    return {
      score: total,
      tier: tierFromScore(total),
      factors,
    }
  } catch {
    return DEFAULT_SCORE
  }
}

/**
 * Extrait un CeeDossierScore depuis le champ metadata d'un dossier.
 * Retourne le score par defaut si absent ou invalide.
 */
export function extractScoreFromMetadata(
  metadata: Record<string, unknown> | null | undefined
): CeeDossierScore {
  if (!metadata || typeof metadata !== 'object') return DEFAULT_SCORE

  const stored = metadata.priority_score
  if (!stored || typeof stored !== 'object') return DEFAULT_SCORE

  const s = stored as Record<string, unknown>
  const score = typeof s.score === 'number' ? s.score : 0
  const tier =
    typeof s.tier === 'string' && ['S', 'A', 'B', 'C'].includes(s.tier)
      ? (s.tier as CeeDossierTier)
      : 'C'
  const factors = Array.isArray(s.factors) ? (s.factors as string[]) : []

  return { score, tier, factors }
}
