/**
 * Structured telemetry hooks for LLM calls.
 *
 * Routed through the central `@/lib/logger` so events show up in Vercel
 * logs AND Sentry breadcrumbs/errors (logger.error forwards to Sentry
 * since 2026-04-30). Langfuse OTel exporter will plug in here once the
 * Hetzner self-host is up — keeping the call sites stable.
 */

import { logger } from '@/lib/logger'
import type { LLMError } from './errors'
import type { ModelChoice } from './routing'
import type { LLMRequest, LLMResponse } from './types'

type TelemetryContext = {
  traceId?: string
  agentName?: string
}

function pickContext(metadata: Record<string, unknown> | undefined): TelemetryContext {
  if (!metadata) return {}
  const traceId = typeof metadata.traceId === 'string' ? metadata.traceId : undefined
  const agentName = typeof metadata.agentName === 'string' ? metadata.agentName : undefined
  return { traceId, agentName }
}

export function logLLMRequest(req: LLMRequest, choice: ModelChoice): void {
  const ctx = pickContext(req.metadata)
  logger.info('llm.request', {
    component: 'llm',
    classification: req.classification,
    provider: choice.provider,
    model: choice.model,
    reasoning: choice.reasoning,
    estimatedInputTokens: req.estimatedInputTokens,
    hasImage: req.hasImage === true,
    hasPDF: req.hasPDF === true,
    ...ctx,
  })
}

export function logLLMResponse(res: LLMResponse, choice: ModelChoice, req: LLMRequest): void {
  const ctx = pickContext(req.metadata)
  logger.info('llm.response', {
    component: 'llm',
    provider: choice.provider,
    model: choice.model,
    modelUsed: res.modelUsed,
    providerUsed: res.providerUsed,
    inputTokens: res.usage.inputTokens,
    outputTokens: res.usage.outputTokens,
    cacheReadTokens: res.usage.cacheReadTokens,
    cacheCreationTokens: res.usage.cacheCreationTokens,
    cost: res.usage.cost,
    latencyMs: res.latencyMs,
    stopReason: res.stopReason,
    ...ctx,
  })
}

export function logLLMError(error: LLMError, req: LLMRequest, choice?: ModelChoice): void {
  const ctx = pickContext(req.metadata)
  logger.error('llm.error', error, {
    component: 'llm',
    provider: error.provider,
    classification: req.classification,
    routedProvider: choice?.provider,
    routedModel: choice?.model,
    ...ctx,
  })
}
