/**
 * L1 Validator — algorithmic scoring for RGE descriptions (v1.0 rubric).
 *
 * Pure, synchronous, no LLM calls. Reads a generated description and the
 * ProviderContext it was grounded on, returns a per-dimension score and an
 * overall weighted score.
 *
 * Reference: docs/descriptions-pipeline/SPEC-V1.md section 3.
 *
 * This is a STUB: the 9 dimensions defined in the spec are declared here,
 * but only dims with a clear deterministic heuristic are implemented. The
 * others (originality vs corpus, MinHash Jaccard, QRG conformity) require
 * either cross-document state or an LLM judge and are flagged as TODO.
 */

import type { ProviderContext } from './prompts/rge-description-v1'

export const RUBRIC_VERSION = 'rge-rubric-v1.0'

export type DescriptionScore = {
  dim1_originality: number
  dim2_variability: number
  dim3_density: number
  dim4_eeat: number
  dim5_ymyl: number
  dim6_seo: number
  dim7_readability: number
  dim8_intent: number
  dim9_qrg: number
  overall: number
  verdict: 'pass' | 'fail'
  flags: DescriptionFlag[]
}

export type DescriptionFlag = {
  dimension: keyof Omit<DescriptionScore, 'overall' | 'verdict' | 'flags'>
  severity: 'info' | 'warn' | 'block'
  message: string
}

type Weights = Record<keyof Omit<DescriptionScore, 'overall' | 'verdict' | 'flags'>, number>

const WEIGHTS: Weights = {
  dim1_originality: 1.0,
  dim2_variability: 1.0,
  dim3_density: 1.2,
  dim4_eeat: 1.5,
  dim5_ymyl: 2.0,
  dim6_seo: 0.8,
  dim7_readability: 0.8,
  dim8_intent: 1.2,
  dim9_qrg: 1.5,
}

const PASS_THRESHOLD = 7.5

// YMYL blacklist: any mention of concrete aid amounts triggers automatic fail.
// Matches e.g. "5 000 €", "2500€", "1 000 euros", "MaPrimeRénov 3000".
const YMYL_AMOUNT_REGEX = /(\d{1,3}(?:[\s\u00A0.]\d{3})+|\d{3,6})\s?(€|euros?|eur)\b/i
const YMYL_KEYWORDS_REGEX =
  /(maprime\s?r[eé]nov|prime\s?cee|certificats?\s+d['’]\s?[eé]conomies?\s+d['’]\s?[eé]nergie|cr[eé]dit\s+d['’]\s?imp[oô]t|[eé]co[-\s]?pr[eê]t|aide\s+financi[eè]re)/i

const clamp = (value: number, min = 0, max = 10): number => Math.max(min, Math.min(max, value))

const round1 = (value: number): number => Math.round(value * 10) / 10

const countWords = (text: string): number => {
  const trimmed = text.trim()
  if (trimmed.length === 0) return 0
  return trimmed.split(/\s+/).length
}

const normalize = (text: string): string =>
  text
    .toLocaleLowerCase('fr-FR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const containsNormalized = (haystack: string, needle: string): boolean => {
  const n = normalize(needle).trim()
  if (n.length === 0) return false
  return normalize(haystack).includes(n)
}

/**
 * D1 — Originality (stub): without a corpus we can only flag obvious
 * boilerplate phrases. Full TF-IDF bi-gram scoring lives in the batch runner.
 * TODO: integrate corpus-level TF-IDF in scripts/generate-rge-descriptions.ts.
 */
const scoreOriginality = (text: string): { score: number; flag?: DescriptionFlag } => {
  const boilerplate = [
    "n'hesitez pas a nous contacter",
    'a votre ecoute',
    'devis gratuit et sans engagement',
    "plus de x ans d'experience",
    'leader dans son domaine',
  ]
  const normalized = normalize(text)
  const hits = boilerplate.filter((phrase) => normalized.includes(phrase)).length
  const score = clamp(10 - hits * 3)
  if (hits > 0) {
    return {
      score,
      flag: {
        dimension: 'dim1_originality',
        severity: 'warn',
        message: `Detected ${hits} boilerplate phrase(s); run corpus-level TF-IDF in batch.`,
      },
    }
  }
  return { score }
}

/**
 * D3 — Information density: named entities (city, region, specialty,
 * qualifications, meta-domains) per word. Target: >= 1 NE per 25 words.
 */
const scoreDensity = (
  text: string,
  ctx: ProviderContext
): { score: number; flag?: DescriptionFlag } => {
  const candidates = [
    ctx.address_city,
    ctx.address_region,
    ctx.specialty,
    ...ctx.rge_qualifications,
    ...ctx.ademe_categories,
    ...ctx.ademe_meta_domains,
  ]
  const matched = candidates.filter((c) => c && containsNormalized(text, c)).length
  const words = countWords(text) || 1
  const ratio = matched / (words / 25)
  const score = clamp(ratio * 7)
  if (matched < 3) {
    return {
      score,
      flag: {
        dimension: 'dim3_density',
        severity: 'warn',
        message: `Only ${matched} named entities from context appear in the description.`,
      },
    }
  }
  return { score }
}

/**
 * D4 — E-E-A-T grounding: the business name, city, and at least one RGE
 * qualification must appear verbatim. Also flags hallucinated qualifications.
 */
const scoreEeat = (
  text: string,
  ctx: ProviderContext
): { score: number; flag?: DescriptionFlag } => {
  let score = 10
  const missing: string[] = []
  if (!containsNormalized(text, ctx.name)) {
    score -= 3
    missing.push('name')
  }
  if (!containsNormalized(text, ctx.address_city)) {
    score -= 2
    missing.push('city')
  }
  const qualMatched =
    ctx.rge_qualifications.length === 0
      ? true
      : ctx.rge_qualifications.some((q) => containsNormalized(text, q))
  if (!qualMatched) {
    score -= 3
    missing.push('rge_qualification')
  }

  // Hallucinated certification check: common RGE label tokens not in context.
  const knownLabels = [
    'qualibat',
    'qualifelec',
    "qualit'enr",
    'qualitenr',
    'qualipac',
    'qualibois',
    'rge',
  ]
  const allowedInText = ctx.rge_qualifications.map(normalize).join(' ')
  const normalizedText = normalize(text)
  const hallucinated = knownLabels.filter(
    (label) => normalizedText.includes(label) && !allowedInText.includes(label)
  )
  if (hallucinated.length > 0) {
    return {
      score: 0,
      flag: {
        dimension: 'dim4_eeat',
        severity: 'block',
        message: `Hallucinated certification(s) cited: ${hallucinated.join(', ')}.`,
      },
    }
  }
  if (missing.length > 0) {
    return {
      score: clamp(score),
      flag: {
        dimension: 'dim4_eeat',
        severity: 'warn',
        message: `Missing required grounded facts: ${missing.join(', ')}.`,
      },
    }
  }
  return { score: clamp(score) }
}

/**
 * D5 — YMYL compliance (MANDATORY >= 8). Any concrete aid amount or
 * hyped financial-aid promise is an immediate block.
 */
const scoreYmyl = (text: string): { score: number; flag?: DescriptionFlag } => {
  const amountMatch = text.match(YMYL_AMOUNT_REGEX)
  const keywordMatch = text.match(YMYL_KEYWORDS_REGEX)
  if (amountMatch && keywordMatch) {
    return {
      score: 0,
      flag: {
        dimension: 'dim5_ymyl',
        severity: 'block',
        message: `YMYL block: financial aid keyword "${keywordMatch[0]}" co-occurs with amount "${amountMatch[0]}".`,
      },
    }
  }
  if (amountMatch) {
    return {
      score: 4,
      flag: {
        dimension: 'dim5_ymyl',
        severity: 'warn',
        message: `Concrete amount detected ("${amountMatch[0]}") — review for YMYL context.`,
      },
    }
  }
  return { score: 10 }
}

/**
 * D6 — SEO semantic coverage: city AND region mentioned.
 */
const scoreSeo = (
  text: string,
  ctx: ProviderContext
): { score: number; flag?: DescriptionFlag } => {
  const hasCity = containsNormalized(text, ctx.address_city)
  const hasRegion = containsNormalized(text, ctx.address_region)
  const hasSpecialty = containsNormalized(text, ctx.specialty)
  const hits = [hasCity, hasRegion, hasSpecialty].filter(Boolean).length
  const score = clamp(hits * 3.3)
  if (hits < 2) {
    return {
      score,
      flag: {
        dimension: 'dim6_seo',
        severity: 'warn',
        message: 'Missing geo/specialty anchors (expected city + region + specialty).',
      },
    }
  }
  return { score }
}

/**
 * D7 — Readability proxy: word count target 250-350, average sentence
 * length, no ultra-long sentences. Full Flesch-Kandel-Moles FR lives in
 * the batch runner.
 * TODO: plug FKM FR formula in batch script.
 */
const scoreReadability = (text: string): { score: number; flag?: DescriptionFlag } => {
  const words = countWords(text)
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  const avgLen = sentences.length === 0 ? words : words / sentences.length
  let score = 10
  if (words < 230 || words > 380) score -= 4
  if (avgLen > 35) score -= 3
  if (avgLen < 8) score -= 2
  const clamped = clamp(score)
  if (clamped < 7) {
    return {
      score: clamped,
      flag: {
        dimension: 'dim7_readability',
        severity: 'warn',
        message: `Readability off (words=${words}, avg sentence=${avgLen.toFixed(1)}).`,
      },
    }
  }
  return { score: clamped }
}

/**
 * D8 — Intent coverage (informational + transactional soft + confidence).
 * Heuristic: presence of descriptive verbs, practical closing, certification
 * cue. Full 3-intent classifier is an LLM-judge task.
 * TODO: delegate to Opus L2 for authoritative score.
 */
const scoreIntent = (text: string): { score: number; flag?: DescriptionFlag } => {
  const normalized = normalize(text)
  const infoCue = /(intervient|propose|realise|specialise|installe|certifie)/.test(normalized)
  const transCue = /(devis|demande|contact|servicesartisans)/.test(normalized)
  const confCue = /(rge|qualification|valide|reconnu)/.test(normalized)
  const hits = [infoCue, transCue, confCue].filter(Boolean).length
  const score = clamp(hits * 3.3)
  if (hits < 3) {
    return {
      score,
      flag: {
        dimension: 'dim8_intent',
        severity: 'info',
        message: `Only ${hits}/3 intent cues detected.`,
      },
    }
  }
  return { score }
}

// TODO(D2): MinHash Jaccard LSH against corpus — requires cross-document state.
// TODO(D9): QRG conformity — requires Opus L2 judge against QRG 2026 rubric.

export const validateDescription = (text: string, context: ProviderContext): DescriptionScore => {
  const flags: DescriptionFlag[] = []

  const push = (flag?: DescriptionFlag): void => {
    if (flag) flags.push(flag)
  }

  const d1 = scoreOriginality(text)
  push(d1.flag)
  const d3 = scoreDensity(text, context)
  push(d3.flag)
  const d4 = scoreEeat(text, context)
  push(d4.flag)
  const d5 = scoreYmyl(text)
  push(d5.flag)
  const d6 = scoreSeo(text, context)
  push(d6.flag)
  const d7 = scoreReadability(text)
  push(d7.flag)
  const d8 = scoreIntent(text)
  push(d8.flag)

  // Neutral placeholder for not-yet-implemented dims. 5.0 means "unknown";
  // when the batch runner adds real scoring it will overwrite these.
  const d2Score = 5.0
  const d9Score = 5.0

  const scores: Omit<DescriptionScore, 'overall' | 'verdict' | 'flags'> = {
    dim1_originality: round1(d1.score),
    dim2_variability: d2Score,
    dim3_density: round1(d3.score),
    dim4_eeat: round1(d4.score),
    dim5_ymyl: round1(d5.score),
    dim6_seo: round1(d6.score),
    dim7_readability: round1(d7.score),
    dim8_intent: round1(d8.score),
    dim9_qrg: d9Score,
  }

  const weightedSum =
    scores.dim1_originality * WEIGHTS.dim1_originality +
    scores.dim2_variability * WEIGHTS.dim2_variability +
    scores.dim3_density * WEIGHTS.dim3_density +
    scores.dim4_eeat * WEIGHTS.dim4_eeat +
    scores.dim5_ymyl * WEIGHTS.dim5_ymyl +
    scores.dim6_seo * WEIGHTS.dim6_seo +
    scores.dim7_readability * WEIGHTS.dim7_readability +
    scores.dim8_intent * WEIGHTS.dim8_intent +
    scores.dim9_qrg * WEIGHTS.dim9_qrg

  const totalWeight = Object.values(WEIGHTS).reduce((a, b) => a + b, 0)
  const overall = round1(weightedSum / totalWeight)

  const hasBlocking = flags.some((f) => f.severity === 'block')
  const ymylHardFail = scores.dim5_ymyl < 8
  const verdict: 'pass' | 'fail' =
    !hasBlocking && !ymylHardFail && overall >= PASS_THRESHOLD ? 'pass' : 'fail'

  return {
    ...scores,
    overall,
    verdict,
    flags,
  }
}
