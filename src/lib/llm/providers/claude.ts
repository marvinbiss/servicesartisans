/**
 * Anthropic Claude live HTTP integration — `/v1/messages`.
 *
 * Anthropic specifics that this layer normalizes:
 *   - `system` is a TOP-LEVEL field, not a message role. We extract any
 *     `role: 'system'` LLMMessages and concatenate them into `system`.
 *   - Response `content` is an array of blocks (`text` or `tool_use`),
 *     not a single string. We flatten text blocks into `content` and
 *     map `tool_use` blocks into `toolCalls`.
 *   - Prompt caching reports `cache_read_input_tokens` and
 *     `cache_creation_input_tokens` in usage — we surface both so cost
 *     accounting can honor the cached-tier pricing.
 *
 * Default model `claude-sonnet-4-6` is the daily driver for tool-use
 * agents; long-context / YMYL critic calls promote to `claude-opus-4-7`
 * via the routing layer or `metadata.modelOverride`.
 */

import { LLMProviderUnavailableError } from '../errors'
import { httpJsonRequest } from '../http'
import { calculateCost } from '../pricing'
import { LLMProvider } from '../provider'
import { logLLMError, logLLMRequest, logLLMResponse } from './shared-telemetry'
import type {
  LLMMessage,
  LLMRequest,
  LLMResponse,
  LLMStopReason,
  LLMStreamChunk,
  LLMToolCall,
} from '../types'

type AnthropicTextBlock = { type: 'text'; text: string }
type AnthropicToolUseBlock = {
  type: 'tool_use'
  id: string
  name: string
  input: Record<string, unknown>
}
type AnthropicContentBlock = AnthropicTextBlock | AnthropicToolUseBlock | { type: string }

type AnthropicMessagesResponse = {
  id: string
  type: 'message'
  role: 'assistant'
  model?: string
  content: ReadonlyArray<AnthropicContentBlock>
  stop_reason: 'end_turn' | 'max_tokens' | 'tool_use' | 'stop_sequence' | string
  usage: {
    input_tokens: number
    output_tokens: number
    cache_read_input_tokens?: number
    cache_creation_input_tokens?: number
  }
}

export class ClaudeProvider extends LLMProvider {
  readonly name = 'claude' as const
  readonly defaultModel = 'claude-sonnet-4-6'

  private readonly apiKey: string
  private readonly baseUrl: string
  private readonly defaultTimeoutMs: number
  private readonly anthropicVersion: string

  constructor(
    apiKey: string,
    baseUrl = 'https://api.anthropic.com/v1',
    defaultTimeoutMs = 60_000,
    anthropicVersion = '2023-06-01'
  ) {
    super()
    if (!apiKey) {
      throw new LLMProviderUnavailableError('claude', 'ANTHROPIC_API_KEY missing')
    }
    this.apiKey = apiKey
    this.baseUrl = baseUrl
    this.defaultTimeoutMs = defaultTimeoutMs
    this.anthropicVersion = anthropicVersion
  }

  async complete(req: LLMRequest): Promise<LLMResponse> {
    const start = Date.now()
    const modelId = pickClaudeModel(req)
    logLLMRequest('claude', modelId, req)
    try {
      const resp = await httpJsonRequest<AnthropicMessagesResponse>({
        url: `${this.baseUrl}/messages`,
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': this.anthropicVersion,
          'Content-Type': 'application/json',
        },
        body: buildClaudeBody(req, modelId),
        timeoutMs: this.defaultTimeoutMs,
        provider: 'claude',
      })

      if (!Array.isArray(resp.content) || resp.content.length === 0) {
        throw new LLMProviderUnavailableError('claude', 'empty content array')
      }

      const textParts: string[] = []
      const toolCalls: LLMToolCall[] = []
      for (const block of resp.content) {
        if (block.type === 'text' && typeof (block as AnthropicTextBlock).text === 'string') {
          textParts.push((block as AnthropicTextBlock).text)
        } else if (block.type === 'tool_use') {
          const tu = block as AnthropicToolUseBlock
          toolCalls.push({
            id: tu.id,
            name: tu.name,
            arguments:
              tu.input && typeof tu.input === 'object' && !Array.isArray(tu.input) ? tu.input : {},
          })
        }
      }

      const inputTokens = resp.usage.input_tokens
      const outputTokens = resp.usage.output_tokens
      const cacheReadTokens = resp.usage.cache_read_input_tokens ?? 0
      const cacheCreationTokens = resp.usage.cache_creation_input_tokens ?? 0

      const out: LLMResponse = {
        content: textParts.join(''),
        toolCalls,
        modelUsed: modelId,
        providerUsed: 'claude',
        usage: {
          inputTokens,
          outputTokens,
          cacheReadTokens,
          cacheCreationTokens,
          cost: calculateCost(modelId, inputTokens, outputTokens, cacheReadTokens),
        },
        latencyMs: Date.now() - start,
        stopReason: mapClaudeStopReason(resp.stop_reason),
      }
      logLLMResponse('claude', modelId, out, req)
      return out
    } catch (err) {
      logLLMError('claude', modelId, err, req)
      throw err
    }
  }

  // eslint-disable-next-line require-yield -- streaming intentionally deferred
  async *stream(_req: LLMRequest): AsyncIterable<LLMStreamChunk> {
    throw new LLMProviderUnavailableError(
      'claude',
      'streaming not implemented in v0; use complete() for now'
    )
  }
}

function buildClaudeBody(req: LLMRequest, modelId: string): Record<string, unknown> {
  const { system, nonSystemMessages } = extractSystem(req.messages)
  const body: Record<string, unknown> = {
    model: modelId,
    messages: nonSystemMessages.map((m) => ({
      role: m.role === 'tool' ? 'user' : m.role,
      content: m.content,
    })),
    max_tokens: req.maxTokens ?? 1024,
    temperature: req.temperature ?? 0,
  }
  if (system.length > 0) {
    body.system = system
  }
  if (req.toolDefinitions && req.toolDefinitions.length > 0) {
    body.tools = req.toolDefinitions.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.inputSchema,
    }))
  }
  return body
}

function extractSystem(messages: ReadonlyArray<LLMMessage>): {
  system: string
  nonSystemMessages: ReadonlyArray<LLMMessage>
} {
  const systemParts: string[] = []
  const rest: LLMMessage[] = []
  for (const m of messages) {
    if (m.role === 'system') {
      systemParts.push(m.content)
    } else {
      rest.push(m)
    }
  }
  return { system: systemParts.join('\n\n'), nonSystemMessages: rest }
}

export function pickClaudeModel(req: LLMRequest): string {
  const override = req.metadata?.modelOverride
  if (typeof override === 'string' && override.length > 0) return override
  if (
    req.classification === 'critic_ymyl' ||
    req.classification === 'long_context' ||
    (req.estimatedInputTokens ?? 0) > 100_000
  ) {
    return 'claude-opus-4-7'
  }
  return 'claude-sonnet-4-6'
}

export function mapClaudeStopReason(r: string): LLMStopReason {
  if (r === 'end_turn' || r === 'max_tokens' || r === 'tool_use' || r === 'stop_sequence') {
    return r
  }
  return 'end_turn'
}
