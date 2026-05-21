/**
 * Critic orchestrator.
 *
 * Three layered defenses against bad YMYL outputs:
 *  1. Pre-LLM rubric short-circuit (deterministic, free).
 *  2. Opus 4.7 second pass on the surviving outputs, in strict JSON mode.
 *  3. Fail-closed parse: any malformed JSON / timeout / registry absence
 *     collapses to `block` with a safe user-facing message.
 *
 * The flow is intentionally synchronous-feeling: every branch returns a
 * complete `CriticVerdict`. Agents never have to interpret partial state.
 */

import type {
  CriticBlock,
  CriticConfig,
  CriticDimension,
  CriticInput,
  CriticReason,
  CriticSeverity,
  CriticVerdict,
} from './types'
import { getRegistry } from '@/lib/llm'
import { logger } from '@/lib/logger'
import {
  scoreSourcePresent,
  scoreMathCheck,
  scoreHallucinationRisk,
  combineRubricScores,
} from './rubric'
import { buildCriticUserPrompt } from './prompts/ymyl-critic-user'
import { YMYL_CRITIC_SYSTEM } from './prompts/ymyl-critic-system'
import { DEFAULT_CRITIC_CONFIG } from './config'

const SAFE_BLOCK_MESSAGE_DEFAULT =
  "Notre système de vérification est momentanément indisponible. Réessayez ou contactez un conseiller France Rénov'."

const SAFE_BLOCK_MESSAGE_PREBLOCK =
  'Information non vérifiable. Un conseiller France Rénov vous répondra.'

const SAFE_BLOCK_MESSAGE_PARSE = "Vérification impossible. Réessayez ou contactez France Rénov'."

const SAFE_BLOCK_MESSAGE_REGISTRY =
  "Vérification automatique indisponible. Contactez un conseiller France Rénov' pour confirmation."

const VALID_DIMENSIONS: ReadonlyArray<CriticDimension> = [
  'factuality',
  'source_present',
  'math_check',
  'hallucination_risk',
  'completeness',
  'safety_disclaimer',
]

const VALID_SEVERITIES: ReadonlyArray<CriticSeverity> = ['block', 'warn', 'info']

export async function critique(
  input: CriticInput,
  config: CriticConfig = DEFAULT_CRITIC_CONFIG
): Promise<CriticVerdict> {
  const preScores = [
    scoreSourcePresent(input.primaryOutput),
    scoreMathCheck(input.primaryOutput),
    scoreHallucinationRisk(input.primaryOutput),
  ]
  const pre = combineRubricScores(preScores)

  if (pre.blockingReasons.length > 0) {
    logger.warn('critic.preblock', {
      traceId: input.traceId,
      agentName: input.agentName,
      ymylContext: input.ymylContext,
      reasons: pre.blockingReasons,
    })
    return {
      decision: 'block',
      confidence: 1.0,
      reasons: pre.blockingReasons,
      userSafeMessage: SAFE_BLOCK_MESSAGE_PREBLOCK,
    }
  }

  let claude
  try {
    claude = getRegistry().claude
  } catch {
    logger.warn('critic.registry_absent', {
      traceId: input.traceId,
      agentName: input.agentName,
      ymylContext: input.ymylContext,
    })
    return buildFailClosedBlock(
      'LLM critic unavailable (registry not initialized); blocking conservatively.',
      SAFE_BLOCK_MESSAGE_REGISTRY
    )
  }

  const userPrompt = buildCriticUserPrompt(input)

  let response
  try {
    response = await claude.complete({
      classification: 'critic_ymyl',
      messages: [
        { role: 'system', content: YMYL_CRITIC_SYSTEM },
        { role: 'user', content: userPrompt },
      ],
      maxTokens: 1024,
      temperature: 0.0,
      metadata: {
        traceId: input.traceId,
        agentName: 'critic-ymyl',
        criticVersion: config.criticVersion,
      },
    })
  } catch (err) {
    logger.error('critic.llm_unavailable', {
      traceId: input.traceId,
      agentName: input.agentName,
      error: err instanceof Error ? err.message : String(err),
    })
    return buildFailClosedBlock(
      'Critic LLM unavailable, conservative block on YMYL context.',
      SAFE_BLOCK_MESSAGE_DEFAULT
    )
  }

  return parseCriticResponse(response.content, config, input)
}

function buildFailClosedBlock(message: string, userSafeMessage: string): CriticBlock {
  return {
    decision: 'block',
    confidence: 0.0,
    reasons: [
      {
        dimension: 'completeness',
        severity: 'block',
        message,
      },
    ],
    userSafeMessage,
  }
}

type RawCriticPayload = {
  score?: unknown
  decision?: unknown
  reasons?: unknown
  suggestedFix?: unknown
  userSafeMessage?: unknown
}

function parseCriticResponse(raw: string, config: CriticConfig, input: CriticInput): CriticVerdict {
  const stripped = raw.replace(/```(?:json)?/gi, '').trim()
  const jsonMatch = stripped.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    logger.warn('critic.non_json_output', {
      traceId: input.traceId,
      preview: raw.slice(0, 200),
    })
    return {
      decision: 'block',
      confidence: 0.0,
      reasons: [
        {
          dimension: 'completeness',
          severity: 'block',
          message: 'Critic LLM returned non-JSON output, blocking conservatively.',
          evidence: raw.slice(0, 200),
        },
      ],
      userSafeMessage: SAFE_BLOCK_MESSAGE_PARSE,
    }
  }

  let payload: RawCriticPayload
  try {
    payload = JSON.parse(jsonMatch[0]) as RawCriticPayload
  } catch (err) {
    logger.warn('critic.json_parse_failed', {
      traceId: input.traceId,
      error: err instanceof Error ? err.message : String(err),
      preview: jsonMatch[0].slice(0, 200),
    })
    return {
      decision: 'block',
      confidence: 0.0,
      reasons: [
        {
          dimension: 'completeness',
          severity: 'block',
          message: 'Critic JSON parse failed.',
          evidence: jsonMatch[0].slice(0, 200),
        },
      ],
      userSafeMessage: SAFE_BLOCK_MESSAGE_PARSE,
    }
  }

  const reasons = sanitizeReasons(payload.reasons)
  const score =
    typeof payload.score === 'number' && payload.score >= 0 && payload.score <= 1
      ? payload.score
      : null
  const decision = sanitizeDecision(payload.decision)

  if (score === null || decision === null) {
    logger.warn('critic.invalid_shape', {
      traceId: input.traceId,
      hasScore: score !== null,
      hasDecision: decision !== null,
    })
    return {
      decision: 'block',
      confidence: 0.0,
      reasons: [
        {
          dimension: 'completeness',
          severity: 'block',
          message: 'Critic returned invalid shape (missing score or decision).',
        },
      ],
      userSafeMessage: SAFE_BLOCK_MESSAGE_PARSE,
    }
  }

  if (decision === 'block') {
    const userSafeMessage =
      typeof payload.userSafeMessage === 'string' && payload.userSafeMessage.trim().length > 0
        ? payload.userSafeMessage
        : SAFE_BLOCK_MESSAGE_DEFAULT
    return { decision: 'block', confidence: score, reasons, userSafeMessage }
  }

  if (decision === 'revise') {
    const suggestedFix =
      typeof payload.suggestedFix === 'string' && payload.suggestedFix.length > 0
        ? payload.suggestedFix
        : undefined
    if (score < config.blockThreshold) {
      return {
        decision: 'block',
        confidence: score,
        reasons,
        userSafeMessage: SAFE_BLOCK_MESSAGE_DEFAULT,
      }
    }
    return { decision: 'revise', confidence: score, reasons, suggestedFix }
  }

  if (score < config.reviseThreshold) {
    return {
      decision: 'revise',
      confidence: score,
      reasons,
    }
  }

  return { decision: 'approve', confidence: score, reasons }
}

function sanitizeDecision(value: unknown): 'approve' | 'revise' | 'block' | null {
  if (value === 'approve' || value === 'revise' || value === 'block') return value
  return null
}

function sanitizeReasons(value: unknown): ReadonlyArray<CriticReason> {
  if (!Array.isArray(value)) return []
  const out: CriticReason[] = []
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') continue
    const r = raw as Record<string, unknown>
    const dimension = r.dimension
    const severity = r.severity
    const message = r.message
    if (typeof dimension !== 'string' || !VALID_DIMENSIONS.includes(dimension as CriticDimension)) {
      continue
    }
    if (typeof severity !== 'string' || !VALID_SEVERITIES.includes(severity as CriticSeverity)) {
      continue
    }
    if (typeof message !== 'string' || message.length === 0) continue
    const reason: CriticReason = {
      dimension: dimension as CriticDimension,
      severity: severity as CriticSeverity,
      message,
    }
    if (typeof r.evidence === 'string' && r.evidence.length > 0) {
      reason.evidence = r.evidence
    }
    out.push(reason)
  }
  return out
}
