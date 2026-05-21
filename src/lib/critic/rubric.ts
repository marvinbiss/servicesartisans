/**
 * Pre-LLM rubric — pure heuristics.
 *
 * Why pre-LLM scoring before the Opus pass:
 *  - Token economy: trivial rejections (math error, "100 % de prise en charge")
 *    should never reach a paid LLM call.
 *  - Determinism: pure functions are auditable in court / regulator review.
 *    The rubric is the only Critic surface that produces evidence with byte
 *    offsets, so e.g. UCC L121-1 disputes can be backed by deterministic logs.
 *  - Fail-closed primitive: any blocking reason here short-circuits the entire
 *    verdict to `block`, regardless of how confident the LLM critic would be.
 */

import type { CriticDimension, CriticReason } from './types'

export type RubricScore = {
  dimension: CriticDimension
  score: number
  reasons: ReadonlyArray<CriticReason>
}

const URL_RE = /https?:\/\/[^\s)]+/
const REFERENCE_RE =
  /\b(ANAH|France\s*R[ée]nov|d[ée]cret|article|art\.|L[ée]gifrance|Sonergia|ADEME)\b/i

export function scoreSourcePresent(primaryOutput: string): RubricScore {
  const hasUrl = URL_RE.test(primaryOutput)
  const hasReference = REFERENCE_RE.test(primaryOutput)
  const score = hasUrl && hasReference ? 1.0 : hasReference ? 0.5 : 0.0
  const reasons: CriticReason[] =
    score < 0.5
      ? [
          {
            dimension: 'source_present',
            severity: score === 0 ? 'block' : 'warn',
            message: 'No URL or authoritative reference in output (ANAH, décret, …).',
          },
        ]
      : score < 1.0
        ? [
            {
              dimension: 'source_present',
              severity: 'warn',
              message: 'Reference present but no URL — citation incomplete.',
            },
          ]
        : []
  return { dimension: 'source_present', score, reasons }
}

const ADDITION_RE = /(\d{1,6})\s*€?\s*\+\s*(\d{1,6})\s*€?\s*=\s*(\d{1,6})\s*€?/g

export function scoreMathCheck(primaryOutput: string): RubricScore {
  const issues: CriticReason[] = []
  ADDITION_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = ADDITION_RE.exec(primaryOutput)) !== null) {
    const [match, a, b, claimed] = m
    const expected = Number(a) + Number(b)
    if (Number(claimed) !== expected) {
      issues.push({
        dimension: 'math_check',
        severity: 'block',
        message: `Math error: ${a} + ${b} = ${expected}, output claims ${claimed}.`,
        evidence: match,
      })
    }
  }
  return {
    dimension: 'math_check',
    score: issues.length === 0 ? 1.0 : 0.0,
    reasons: issues,
  }
}

const HALLUCINATION_PATTERNS: ReadonlyArray<RegExp> = [
  /100\s*%\s*(de\s+)?prise\s+en\s+charge/i,
  /int[ée]gralement\s+rembours[ée]/i,
  /aide\s+illimit[ée]e/i,
  /sans\s+plafond/i,
  /gratuit\s+pour\s+tous/i,
]

export function scoreHallucinationRisk(primaryOutput: string): RubricScore {
  const issues: CriticReason[] = []
  for (const re of HALLUCINATION_PATTERNS) {
    if (re.test(primaryOutput)) {
      issues.push({
        dimension: 'hallucination_risk',
        severity: 'block',
        message: `Output contains overpromise pattern "${re.source}" — likely hallucination on aide coverage.`,
      })
    }
  }
  return {
    dimension: 'hallucination_risk',
    score: issues.length === 0 ? 1.0 : 0.0,
    reasons: issues,
  }
}

export type CombinedRubric = {
  overallScore: number
  blockingReasons: ReadonlyArray<CriticReason>
  allReasons: ReadonlyArray<CriticReason>
}

export function combineRubricScores(scores: ReadonlyArray<RubricScore>): CombinedRubric {
  const allReasons = scores.flatMap((s) => s.reasons)
  const blockingReasons = allReasons.filter((r) => r.severity === 'block')
  if (blockingReasons.length > 0) {
    return { overallScore: 0, blockingReasons, allReasons }
  }
  if (scores.length === 0) {
    return { overallScore: 0, blockingReasons: [], allReasons: [] }
  }
  const overallScore = scores.reduce((acc, s) => acc + s.score, 0) / scores.length
  return { overallScore, blockingReasons: [], allReasons }
}
