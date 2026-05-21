/**
 * Google Gemini live HTTP integration — Generative Language API
 * `/v1beta/models/{model}:generateContent`.
 *
 * Gemini specifics that this layer normalizes:
 *   - Role naming: Gemini uses `user` and `model` (not `assistant`).
 *     We translate `assistant` -> `model` on the wire, and treat
 *     `system` via the dedicated `systemInstruction` field (not in
 *     `contents`).
 *   - Body shape: `contents: [{ role, parts: [{ text }] }]` instead of
 *     the OpenAI-style flat `messages` array.
 *   - Auth: `?key=...` query param. We accept both forms (query param
 *     or `x-goog-api-key` header) so swapping to Vertex EU residency
 *     later won't break callers.
 *   - Response: `candidates[0].content.parts[0].text`. Token counts
 *     live under `usageMetadata.{promptTokenCount, candidatesTokenCount}`.
 */

import { LLMProviderUnavailableError } from '../errors'
import { httpJsonRequest } from '../http'
import { calculateCost } from '../pricing'
import { LLMProvider } from '../provider'
import { logLLMError, logLLMRequest, logLLMResponse } from './shared-telemetry'
import type { LLMMessage, LLMRequest, LLMResponse, LLMStopReason, LLMStreamChunk } from '../types'

type GeminiPart = { text: string }
type GeminiContent = { role: 'user' | 'model'; parts: ReadonlyArray<GeminiPart> }

type GeminiCandidate = {
  content: { role: 'model'; parts: ReadonlyArray<GeminiPart> }
  finishReason?: 'STOP' | 'MAX_TOKENS' | 'SAFETY' | 'RECITATION' | 'OTHER' | string
}

type GeminiGenerateContentResponse = {
  candidates: ReadonlyArray<GeminiCandidate>
  usageMetadata?: {
    promptTokenCount?: number
    candidatesTokenCount?: number
    totalTokenCount?: number
  }
}

export class GeminiProvider extends LLMProvider {
  readonly name = 'gemini' as const
  readonly defaultModel = 'gemini-2.5-pro'

  private readonly apiKey: string
  private readonly baseUrl: string
  private readonly defaultTimeoutMs: number

  constructor(
    apiKey: string,
    baseUrl = 'https://generativelanguage.googleapis.com/v1beta',
    defaultTimeoutMs = 60_000
  ) {
    super()
    if (!apiKey) {
      throw new LLMProviderUnavailableError('gemini', 'GEMINI_API_KEY missing')
    }
    this.apiKey = apiKey
    this.baseUrl = baseUrl
    this.defaultTimeoutMs = defaultTimeoutMs
  }

  async complete(req: LLMRequest): Promise<LLMResponse> {
    const start = Date.now()
    const modelId = pickGeminiModel(req)
    logLLMRequest('gemini', modelId, req)
    try {
      const url = `${this.baseUrl}/models/${encodeURIComponent(modelId)}:generateContent?key=${encodeURIComponent(this.apiKey)}`
      const resp = await httpJsonRequest<GeminiGenerateContentResponse>({
        url,
        headers: {
          'Content-Type': 'application/json',
        },
        body: buildGeminiBody(req),
        timeoutMs: this.defaultTimeoutMs,
        provider: 'gemini',
      })

      const candidate = resp.candidates?.[0]
      if (!candidate) {
        throw new LLMProviderUnavailableError('gemini', 'empty candidates array')
      }

      const text = (candidate.content?.parts ?? [])
        .map((p) => (typeof p.text === 'string' ? p.text : ''))
        .join('')

      const inputTokens = resp.usageMetadata?.promptTokenCount ?? 0
      const outputTokens = resp.usageMetadata?.candidatesTokenCount ?? 0

      const out: LLMResponse = {
        content: text,
        toolCalls: [],
        modelUsed: modelId,
        providerUsed: 'gemini',
        usage: {
          inputTokens,
          outputTokens,
          cacheReadTokens: 0,
          cacheCreationTokens: 0,
          cost: calculateCost(modelId, inputTokens, outputTokens),
        },
        latencyMs: Date.now() - start,
        stopReason: mapGeminiFinishReason(candidate.finishReason),
      }
      logLLMResponse('gemini', modelId, out, req)
      return out
    } catch (err) {
      logLLMError('gemini', modelId, err, req)
      throw err
    }
  }

  // eslint-disable-next-line require-yield -- streaming intentionally deferred
  async *stream(_req: LLMRequest): AsyncIterable<LLMStreamChunk> {
    throw new LLMProviderUnavailableError(
      'gemini',
      'streaming not implemented in v0; use complete() for now'
    )
  }
}

function buildGeminiBody(req: LLMRequest): Record<string, unknown> {
  const { systemInstruction, contents } = mapMessagesToGemini(req.messages)
  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: req.temperature ?? 0,
      maxOutputTokens: req.maxTokens ?? 1024,
    },
  }
  if (systemInstruction) {
    body.systemInstruction = { role: 'user', parts: [{ text: systemInstruction }] }
  }
  return body
}

function mapMessagesToGemini(messages: ReadonlyArray<LLMMessage>): {
  systemInstruction: string
  contents: ReadonlyArray<GeminiContent>
} {
  const systemParts: string[] = []
  const contents: GeminiContent[] = []
  for (const m of messages) {
    if (m.role === 'system') {
      systemParts.push(m.content)
      continue
    }
    const role: 'user' | 'model' = m.role === 'assistant' ? 'model' : 'user'
    contents.push({ role, parts: [{ text: m.content }] })
  }
  return { systemInstruction: systemParts.join('\n\n'), contents }
}

export function pickGeminiModel(req: LLMRequest): string {
  const override = req.metadata?.modelOverride
  if (typeof override === 'string' && override.length > 0) return override
  return 'gemini-2.5-pro'
}

export function mapGeminiFinishReason(r: string | undefined): LLMStopReason {
  if (r === 'MAX_TOKENS') return 'max_tokens'
  if (r === 'SAFETY' || r === 'RECITATION') return 'stop_sequence'
  return 'end_turn'
}
