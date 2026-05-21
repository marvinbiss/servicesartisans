/**
 * Per-provider telemetry adapter.
 *
 * Bridges the providers (which know their concrete `modelId` at call time
 * but receive `LLMRequest` without a routing decision attached) to the
 * central telemetry sink that expects a `ModelChoice` triple
 * (provider, model, reasoning). The reasoning string here is purely
 * informational ("provider direct call") — the real routing decision is
 * logged upstream by `chooseModel`/registry callers.
 */

import {
  logLLMError as logLLMErrorBase,
  logLLMRequest as logLLMRequestBase,
  logLLMResponse as logLLMResponseBase,
} from '../telemetry'
import type { LLMError } from '../errors'
import type { LLMProviderName, LLMRequest, LLMResponse } from '../types'

function choiceFor(provider: LLMProviderName, modelId: string) {
  return { provider, model: modelId, reasoning: `${provider} direct call` }
}

export function logLLMRequest(provider: LLMProviderName, modelId: string, req: LLMRequest): void {
  logLLMRequestBase(req, choiceFor(provider, modelId))
}

export function logLLMResponse(
  provider: LLMProviderName,
  modelId: string,
  res: LLMResponse,
  req: LLMRequest
): void {
  logLLMResponseBase(res, choiceFor(provider, modelId), req)
}

export function logLLMError(
  provider: LLMProviderName,
  modelId: string,
  err: unknown,
  req: LLMRequest
): void {
  // Cast to LLMError shape; the central sink only reads `provider` and message.
  // Non-LLMError thrown objects are wrapped synthetically so the sink keeps a
  // single code path (no per-provider divergence in error logging).
  const errorLike =
    err && typeof err === 'object' && 'provider' in err
      ? (err as LLMError)
      : ({
          name: 'LLMError',
          message: (err as Error | null)?.message ?? String(err),
          provider,
          cause: err,
        } as unknown as LLMError)
  logLLMErrorBase(errorLike, req, choiceFor(provider, modelId))
}
