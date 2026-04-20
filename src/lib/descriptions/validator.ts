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

export const RUBRIC_VERSION = 'rge-rubric-v1.2'

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
 * qualifications, meta-domains) mentioned in the description. Target:
 * the LLM should surface most of the available context entities.
 *
 * The SPEC wants "1 NE per 25 words", but when a provider has only 4-5
 * candidate entities total, that target is mathematically unreachable for
 * a 250+ word description. We therefore cap expectations at the smaller of
 * (words/25, pool_size), yielding a coverage ratio against what the LLM
 * COULD have grounded on.
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
  ].filter((c): c is string => !!c && c.trim().length > 0)

  const pool = candidates.length || 1
  const matched = candidates.filter((c) => containsNormalized(text, c)).length
  const words = countWords(text) || 1
  const expected = Math.min(words / 25, pool)
  const ratio = matched / Math.max(1, expected)
  const score = clamp(ratio * 10)

  if (matched < Math.min(3, pool)) {
    return {
      score,
      flag: {
        dimension: 'dim3_density',
        severity: 'warn',
        message: `Only ${matched}/${pool} named entities from context appear in the description.`,
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
  // NOTE: "rge" itself is a generic umbrella term that appears in every valid
  // description ("certifié RGE"), and also as substring of "énergétique" after
  // accent normalisation — excluded here to avoid systematic false positives.
  const knownLabels = [
    'qualibat',
    'qualifelec',
    "qualit'enr",
    'qualitenr',
    'qualipac',
    'qualibois',
    'qualipv',
    'qualisol',
    'qualipac',
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
 * D6 — SEO semantic coverage (v1.2): robust detection of 3 anchors :
 *   - city (verbatim)
 *   - region (verbatim OR common abbreviation — IDF, PACA, AuRA, ...)
 *   - specialty (tokens ≥4 chars, at least one significant token matched)
 *
 * Score scale 0→10 : 0 anchors=0, 1=4, 2=7, 3=10 (no more 3.3 ceiling).
 */
const REGION_VARIANTS: Record<string, readonly string[]> = {
  'ile-de-france': ['idf', 'région parisienne', 'bassin parisien'],
  'auvergne-rhone-alpes': ['aura', 'ara', 'rhône-alpes'],
  'nouvelle-aquitaine': ['aquitaine'],
  'provence-alpes-cote-d-azur': ['paca', 'côte d azur', 'cote d azur'],
  'hauts-de-france': ['hdf', 'nord pas de calais', 'nord-pas-de-calais'],
  'grand-est': ['alsace', 'lorraine', 'champagne'],
  'bourgogne-franche-comte': ['bfc', 'bourgogne', 'franche-comté', 'franche comte'],
  'centre-val-de-loire': ['cvl', 'centre'],
  'pays-de-la-loire': ['ligérien', 'pays ligérien'],
  bretagne: ['breton', 'breizh'],
  normandie: ['normand'],
  occitanie: ['languedoc', 'midi-pyrénées', 'midi pyrenees'],
  corse: ['corsica'],
}

const regionMatches = (text: string, region: string): boolean => {
  if (!region || region.trim().length === 0) return false
  if (containsNormalized(text, region)) return true
  const slug = normalize(region).replace(/\s+/g, '-')
  const variants = REGION_VARIANTS[slug] ?? []
  const normalized = normalize(text)
  return variants.some((v) => normalized.includes(normalize(v)))
}

const specialtyMatches = (text: string, specialty: string): boolean => {
  if (!specialty || specialty.trim().length === 0) return false
  if (containsNormalized(text, specialty)) return true
  const tokens = normalize(specialty)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 4)
  if (tokens.length === 0) return false
  const normalized = normalize(text)
  const matched = tokens.filter((t) => normalized.includes(t)).length
  const needed = Math.max(1, Math.ceil(tokens.length / 2))
  return matched >= needed
}

const scoreSeo = (
  text: string,
  ctx: ProviderContext
): { score: number; flag?: DescriptionFlag } => {
  const hasCity = containsNormalized(text, ctx.address_city)
  const hasRegion = regionMatches(text, ctx.address_region)
  const hasSpecialty = specialtyMatches(text, ctx.specialty)
  const hits = [hasCity, hasRegion, hasSpecialty].filter(Boolean).length
  const SCALE: readonly number[] = [0, 4, 7, 10]
  const score = SCALE[hits] ?? 10
  if (hits < 2) {
    return {
      score,
      flag: {
        dimension: 'dim6_seo',
        severity: 'warn',
        message: `Missing geo/specialty anchors (${hits}/3 matched: city=${hasCity} region=${hasRegion} specialty=${hasSpecialty}).`,
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

/**
 * D9 — QRG 2026 conformity (local heuristic, v1.2).
 *
 * Quality Rater Guidelines 2026 (section 4) frame quality through E-E-A-T.
 * We proxy the 4 pillars with deterministic signals present in the text :
 *   - Experience     : year mentioned OR "depuis" / "fondée" / "créée"
 *   - Expertise      : ≥1 RGE qualification from context verbatim in text
 *   - Authoritativeness : mention of a known French certifying body
 *                         (qualibat, qualifelec, qualit'enr, ademe, anah, ...)
 *   - Trustworthiness : absence of forbidden superlatives
 *                       ("meilleur", "leader", "n°1", "expert n°1", ...)
 *
 * Score = 2.5 points per pillar satisfied. Full Opus L2 judge remains
 * possible later, but this heuristic already differentiates providers
 * instead of the previous 5.0 placeholder that applied to everyone.
 */
const QRG_AUTHORITY_KEYWORDS: readonly string[] = [
  'qualibat',
  'qualifelec',
  'qualitenr',
  "qualit'enr",
  'qualipac',
  'qualibois',
  'qualipv',
  'qualisol',
  'ademe',
  'anah',
  'france renov',
  'france-renov',
  'afnor',
]

const QRG_SUPERLATIVE_REGEX =
  /\b(meilleur|leader\b|num[ée]ro\s*1|n[°o]\s*1|expert\s+n[°o]\s*1|le\s+plus\s+\w+|incontournable|r[ée]f[ée]rence\s+absolue)\b/i

const QRG_EXPERIENCE_REGEX =
  /(\b(?:19|20)\d{2}\b|depuis\s+(?:plus\s+de\s+)?\d|fond[ée]e?\s+en|cr[ée]{1,2}e?\s+en|install[ée]e?\s+depuis)/i

const scoreQrg = (
  text: string,
  ctx: ProviderContext
): { score: number; flag?: DescriptionFlag } => {
  const normalized = normalize(text)
  const hasExperience = QRG_EXPERIENCE_REGEX.test(text)
  const hasExpertise =
    ctx.rge_qualifications.length === 0
      ? true
      : ctx.rge_qualifications.some((q) => containsNormalized(text, q))
  const hasAuthority = QRG_AUTHORITY_KEYWORDS.some((k) => normalized.includes(normalize(k)))
  const hasTrust = !QRG_SUPERLATIVE_REGEX.test(text)
  const pillars = [hasExperience, hasExpertise, hasAuthority, hasTrust].filter(Boolean).length
  const score = clamp(pillars * 2.5)
  if (pillars < 3) {
    return {
      score,
      flag: {
        dimension: 'dim9_qrg',
        severity: 'warn',
        message: `QRG pillars ${pillars}/4 (exp=${hasExperience} expert=${hasExpertise} auth=${hasAuthority} trust=${hasTrust}).`,
      },
    }
  }
  return { score }
}

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
  const d9 = scoreQrg(text, context)
  push(d9.flag)

  // Neutral placeholder for D2 (variability/MinHash Jaccard) until the batch
  // runner adds cross-document originality scoring.
  const d2Score = 5.0
  const d9Score = d9.score

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
