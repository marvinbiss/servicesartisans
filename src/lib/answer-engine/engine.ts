/**
 * AnswerEngine orchestrator — closes the SA AI loop.
 *
 * Single entry point `answer(request)` binds:
 *   1. Routing — `chooseModel()` picks provider+model from classification
 *   2. Ground-truth injection — calculator (Ralph 12) runs BEFORE the LLM
 *      so the model is forced to cite a deterministic figure instead of
 *      guessing (anti-hallucination on YMYL aides amounts).
 *   3. LLM primary call — via `LLMProvider.complete()` (Ralph 4 + 10).
 *   4. Critic pass — Opus 4.7 second-pass on YMYL outputs (Ralph 8).
 *      On block / on Critic crash : fail-closed with a sanitized user
 *      message. Never surface raw LLM text on a YMYL failure.
 *   5. Citation extraction — URLs in the output reconciled with
 *      caller-provided sources for downstream UI highlighting.
 *
 * Fail modes are always typed as a structured `AnswerResult` discriminated
 * union with `ok: false` — never as exceptions — except for
 * `InvalidRequestError` on empty query (caller validation failure, not a
 * service failure). This shape lets `/api/v1/ask` map cleanly to HTTP
 * statuses without try/catch leakage.
 *
 * Sovereignty side-effect: because routing already lives in Ralph 4 and
 * defaults to Mistral for `ymyl_aides` / `pii_user` / `contract_legal`,
 * the orchestrator inherits the same EU-first posture for free.
 */

import { chooseModel, getRegistry } from '@/lib/llm'
import type { LLMClassification, LLMMessage, LLMProviderName, LLMResponse } from '@/lib/llm'
import { LLMRateLimitError, LLMTimeoutError, LLMProviderUnavailableError } from '@/lib/llm/errors'
import { critique, isYMYL, type CriticVerdict } from '@/lib/critic'
import { logger } from '@/lib/logger'

import { buildGroundTruthBlock } from './context-builder'
import { extractCitations } from './citations'
import { DEFAULT_ENGINE_CONFIG } from './types'
import { InvalidRequestError } from './errors'
import type {
  AnswerEngineConfig,
  AnswerFailureReason,
  AnswerRequest,
  AnswerResult,
  Trace,
} from './types'

const SYSTEM_BASE = `Tu es l'assistant ServicesArtisans, expert français en rénovation énergétique et aides associées (MaPrimeRénov', CEE, éco-PTZ, TVA 5,5 %). Réponds en français, citations obligatoires sur tout chiffre (URL + date). Si incertain, dis-le. Pas d'hallucination.`

const MSG_LLM_UNAVAILABLE =
  "Service momentanément indisponible. Réessayez ou contactez un conseiller France Rénov'."

const MSG_CRITIC_UNAVAILABLE =
  "Vérification automatique indisponible. Contactez un conseiller France Rénov'."

const MSG_BLOCK_REVISE_TO_USER =
  "Réponse non publiable en l'état. Contactez un conseiller France Rénov' pour une réponse vérifiée."

export async function answer(
  request: AnswerRequest,
  config: AnswerEngineConfig = DEFAULT_ENGINE_CONFIG
): Promise<AnswerResult> {
  const start = Date.now()
  const traceId = request.traceId ?? generateTraceId()
  const classification: LLMClassification = request.classification ?? 'generic'

  if (typeof request.query !== 'string' || request.query.trim().length === 0) {
    throw new InvalidRequestError('AnswerRequest.query is empty')
  }

  // 1. Routing — pure function, never throws.
  const choice = chooseModel({
    classification,
    messages: [],
    metadata: { traceId },
  })

  // 2. Ground-truth injection (if config + aidesContext present).
  const groundTruth = config.injectGroundTruth
    ? buildGroundTruthBlock(request)
    : { injected: false, systemSegment: '' }

  const systemPrompt = groundTruth.injected
    ? `${SYSTEM_BASE}\n\n${groundTruth.systemSegment}`
    : SYSTEM_BASE

  const messages: ReadonlyArray<LLMMessage> = [
    { role: 'system', content: systemPrompt },
    ...(request.history ?? []),
    { role: 'user', content: request.query },
  ]

  // 3. LLM primary call (with our own timeout wrapper to honour
  //    config.llmTimeoutMs even if the provider has a longer budget).
  let llmResponse: LLMResponse
  try {
    const registry = getRegistry()
    const provider = registry[choice.provider]
    llmResponse = await withTimeout(
      provider.complete({
        classification,
        messages,
        maxTokens: 2048,
        temperature: 0.2,
        metadata: {
          traceId,
          agentName: request.agentName ?? 'answer-engine',
        },
      }),
      config.llmTimeoutMs,
      choice.provider
    )
  } catch (err) {
    const reason = classifyLLMError(err)
    logger.error('answer-engine.llm_call_failed', {
      traceId,
      provider: choice.provider,
      model: choice.model,
      reason,
      error: err instanceof Error ? err.message : String(err),
    })
    return {
      ok: false,
      reason,
      userSafeMessage: MSG_LLM_UNAVAILABLE,
      trace: partialTrace({
        traceId,
        classification,
        provider: choice.provider,
        model: choice.model,
        groundTruthInjected: groundTruth.injected,
        groundTruthDetail: groundTruth.detail,
        criticInvoked: false,
        latencyMs: Date.now() - start,
      }),
    }
  }

  // 4. Critic pass (if enabled + YMYL).
  const ymyl = isYMYL({
    classification,
    agentName: request.agentName,
    userQuery: request.query,
  })
  let criticVerdict: CriticVerdict | undefined
  const criticEligible = config.invokeCritic && ymyl.isYMYL && ymyl.context !== undefined

  if (criticEligible && ymyl.context) {
    try {
      criticVerdict = await critique({
        primaryOutput: llmResponse.content,
        userQuery: request.query,
        ymylContext: ymyl.context,
        sourceConversation: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: request.query },
        ],
        citedSources: request.citedSources ?? [],
        traceId,
        agentName: request.agentName ?? 'answer-engine',
      })
    } catch (err) {
      // Critic itself already fail-closes on its own internal LLM errors;
      // reaching this catch means something structural broke (TypeError,
      // assertion, etc). Behave conservatively per
      // memory `feedback_legal_data_quality`.
      logger.error('answer-engine.critic_failed', {
        traceId,
        error: err instanceof Error ? err.message : String(err),
      })
      return {
        ok: false,
        reason: 'critic_block',
        userSafeMessage: MSG_CRITIC_UNAVAILABLE,
        trace: partialTrace({
          traceId,
          classification,
          provider: choice.provider,
          model: choice.model,
          groundTruthInjected: groundTruth.injected,
          groundTruthDetail: groundTruth.detail,
          criticInvoked: true,
          latencyMs: Date.now() - start,
          usage: llmResponse.usage,
        }),
      }
    }

    if (criticVerdict.decision === 'block') {
      return {
        ok: false,
        reason: 'critic_block',
        userSafeMessage: criticVerdict.userSafeMessage,
        criticVerdict,
        trace: partialTrace({
          traceId,
          classification,
          provider: choice.provider,
          model: choice.model,
          groundTruthInjected: groundTruth.injected,
          groundTruthDetail: groundTruth.detail,
          criticInvoked: true,
          latencyMs: Date.now() - start,
          usage: llmResponse.usage,
        }),
      }
    }

    if (criticVerdict.decision === 'revise' && config.reviseStrategy === 'block_to_user') {
      return {
        ok: false,
        reason: 'critic_block',
        userSafeMessage: MSG_BLOCK_REVISE_TO_USER,
        criticVerdict,
        trace: partialTrace({
          traceId,
          classification,
          provider: choice.provider,
          model: choice.model,
          groundTruthInjected: groundTruth.injected,
          groundTruthDetail: groundTruth.detail,
          criticInvoked: true,
          latencyMs: Date.now() - start,
          usage: llmResponse.usage,
        }),
      }
    }
    // pass_through_with_warning (default) and re_prompt_with_fix (not yet
    // implemented) both fall through to the success path with verdict
    // attached so the caller can surface a soft warning if it wants.
  }

  // 5. Citation extraction.
  const citations = extractCitations(llmResponse.content, request)

  return {
    ok: true,
    content: llmResponse.content,
    citations,
    criticVerdict,
    trace: {
      traceId,
      classification,
      providerUsed: choice.provider,
      modelUsed: choice.model,
      groundTruthInjected: groundTruth.injected,
      groundTruthDetail: groundTruth.detail,
      criticInvoked: criticEligible,
      latencyMs: Date.now() - start,
      llmUsage: {
        inputTokens: llmResponse.usage.inputTokens,
        outputTokens: llmResponse.usage.outputTokens,
        cost: llmResponse.usage.cost,
      },
    },
  }
}

function partialTrace(input: {
  traceId: string
  classification: LLMClassification
  provider: LLMProviderName
  model: string
  groundTruthInjected: boolean
  groundTruthDetail?: string
  criticInvoked: boolean
  latencyMs: number
  usage?: { inputTokens: number; outputTokens: number; cost: number }
}): Partial<Trace> {
  const base: Partial<Trace> = {
    traceId: input.traceId,
    classification: input.classification,
    providerUsed: input.provider,
    modelUsed: input.model,
    groundTruthInjected: input.groundTruthInjected,
    criticInvoked: input.criticInvoked,
    latencyMs: input.latencyMs,
  }
  if (input.groundTruthDetail) {
    base.groundTruthDetail = input.groundTruthDetail
  }
  if (input.usage) {
    base.llmUsage = {
      inputTokens: input.usage.inputTokens,
      outputTokens: input.usage.outputTokens,
      cost: input.usage.cost,
    }
  }
  return base
}

function classifyLLMError(err: unknown): AnswerFailureReason {
  if (err instanceof LLMTimeoutError) return 'timeout'
  if (err instanceof LLMRateLimitError) return 'rate_limit'
  if (err instanceof LLMProviderUnavailableError) return 'llm_unavailable'
  // Fallback for plain errors (e.g. a provider mock or a generic Error).
  const name = (err as { name?: string })?.name
  if (name === 'LLMTimeoutError') return 'timeout'
  if (name === 'LLMRateLimitError') return 'rate_limit'
  return 'llm_unavailable'
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  provider: LLMProviderName
): Promise<T> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return promise
  }
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_resolve, reject) => {
        timer = setTimeout(() => {
          reject(new LLMTimeoutError(provider, timeoutMs))
        }, timeoutMs)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

function generateTraceId(): string {
  // 16 hex chars from 8 random bytes — not a secret, just an opaque ID.
  // Node 18+/modern browser: globalThis.crypto.getRandomValues is available.
  const bytes = new Uint8Array(8)
  globalThis.crypto.getRandomValues(bytes)
  let out = ''
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, '0')
  }
  return out
}
