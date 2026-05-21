/**
 * Mistral live HTTP integration — La Plateforme `/v1/chat/completions`.
 *
 * Hosted in Paris, RGPD-natif — chosen as default sovereign path for any
 * request touching French PII or YMYL aides data. Mistral Large is the
 * default; bulk SEO routes promote to Mistral Medium via metadata override
 * or via the upstream `chooseModel` routing layer.
 *
 * Streaming is intentionally NOT implemented yet (no customer-facing chat
 * surface needs it). When the conversational UI lands we'll add SSE
 * parsing in `stream()` without touching `complete()`.
 */

import { LLMProviderUnavailableError } from '../errors'
import { httpJsonRequest } from '../http'
import { calculateCost } from '../pricing'
import { LLMProvider } from '../provider'
import { logLLMError, logLLMRequest, logLLMResponse } from './shared-telemetry'
import type { LLMRequest, LLMResponse, LLMStopReason, LLMStreamChunk, LLMToolCall } from '../types'

type MistralToolCall = {
  id: string
  function: { name: string; arguments: string }
}

type MistralChoice = {
  message: {
    role: 'assistant'
    content: string | null
    tool_calls?: ReadonlyArray<MistralToolCall>
  }
  finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | string
}

type MistralChatCompletionResponse = {
  id: string
  choices: ReadonlyArray<MistralChoice>
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
}

export class MistralProvider extends LLMProvider {
  readonly name = 'mistral' as const
  readonly defaultModel = 'mistral-large-latest'

  private readonly apiKey: string
  private readonly baseUrl: string
  private readonly defaultTimeoutMs: number

  constructor(apiKey: string, baseUrl = 'https://api.mistral.ai/v1', defaultTimeoutMs = 60_000) {
    super()
    if (!apiKey) {
      throw new LLMProviderUnavailableError('mistral', 'MISTRAL_API_KEY missing')
    }
    this.apiKey = apiKey
    this.baseUrl = baseUrl
    this.defaultTimeoutMs = defaultTimeoutMs
  }

  async complete(req: LLMRequest): Promise<LLMResponse> {
    const start = Date.now()
    const modelId = pickMistralModel(req)
    logLLMRequest('mistral', modelId, req)
    try {
      const resp = await httpJsonRequest<MistralChatCompletionResponse>({
        url: `${this.baseUrl}/chat/completions`,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: buildMistralBody(req, modelId),
        timeoutMs: this.defaultTimeoutMs,
        provider: 'mistral',
      })

      const choice = resp.choices[0]
      if (!choice) {
        throw new LLMProviderUnavailableError('mistral', 'empty choices array')
      }

      const inputTokens = resp.usage.prompt_tokens
      const outputTokens = resp.usage.completion_tokens
      const toolCalls: ReadonlyArray<LLMToolCall> = (choice.message.tool_calls ?? []).map((tc) => ({
        id: tc.id,
        name: tc.function.name,
        arguments: safeParseJson(tc.function.arguments),
      }))

      const out: LLMResponse = {
        content: choice.message.content ?? '',
        toolCalls,
        modelUsed: modelId,
        providerUsed: 'mistral',
        usage: {
          inputTokens,
          outputTokens,
          cacheReadTokens: 0,
          cacheCreationTokens: 0,
          cost: calculateCost(modelId, inputTokens, outputTokens),
        },
        latencyMs: Date.now() - start,
        stopReason: mapMistralFinishReason(choice.finish_reason),
      }
      logLLMResponse('mistral', modelId, out, req)
      return out
    } catch (err) {
      logLLMError('mistral', modelId, err, req)
      throw err
    }
  }

  // eslint-disable-next-line require-yield -- streaming intentionally deferred
  async *stream(_req: LLMRequest): AsyncIterable<LLMStreamChunk> {
    throw new LLMProviderUnavailableError(
      'mistral',
      'streaming not implemented in v0; use complete() for now'
    )
  }
}

function buildMistralBody(req: LLMRequest, modelId: string): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model: modelId,
    messages: req.messages.map((m) => ({ role: m.role, content: m.content })),
    temperature: req.temperature ?? 0,
    max_tokens: req.maxTokens ?? 1024,
  }
  if (req.toolDefinitions && req.toolDefinitions.length > 0) {
    body.tools = req.toolDefinitions.map((t) => ({
      type: 'function',
      function: { name: t.name, description: t.description, parameters: t.inputSchema },
    }))
  }
  return body
}

export function pickMistralModel(req: LLMRequest): string {
  const override = req.metadata?.modelOverride
  if (typeof override === 'string' && override.length > 0) return override
  if (req.classification === 'bulk_seo') return 'mistral-medium-latest'
  return 'mistral-large-latest'
}

export function mapMistralFinishReason(r: string): LLMStopReason {
  if (r === 'length') return 'max_tokens'
  if (r === 'tool_calls') return 'tool_use'
  if (r === 'content_filter') return 'stop_sequence'
  return 'end_turn'
}

function safeParseJson(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
    return {}
  } catch {
    return {}
  }
}
