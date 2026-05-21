/**
 * LLM abstraction — shared types
 *
 * Anti-vendor-lock-in is non-negotiable: every AI agent consumes these types,
 * never an SDK type directly. Adding a new provider must NOT require touching
 * any agent code beyond the registry.
 */

export type LLMRole = 'system' | 'user' | 'assistant' | 'tool'

export type LLMToolCall = {
  id: string
  name: string
  arguments: Record<string, unknown>
}

export type LLMMessage = {
  role: LLMRole
  content: string
  toolCalls?: ReadonlyArray<LLMToolCall>
}

/**
 * Classification drives routing in `chooseModel`. Each value carries an
 * implicit SLA + sovereignty contract — keep this list small and meaningful.
 */
export type LLMClassification =
  | 'rag_public'
  | 'ymyl_aides'
  | 'pii_user'
  | 'contract_legal'
  | 'bulk_seo'
  | 'multimodal'
  | 'long_context'
  | 'critic_ymyl'
  | 'generic'

export type LLMToolDefinition = {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

export type LLMRequest = {
  messages: ReadonlyArray<LLMMessage>
  classification: LLMClassification
  maxTokens?: number
  temperature?: number
  toolDefinitions?: ReadonlyArray<LLMToolDefinition>
  hasImage?: boolean
  hasPDF?: boolean
  estimatedInputTokens?: number
  metadata?: Record<string, unknown>
}

export type LLMProviderName = 'mistral' | 'claude' | 'gemini'

export type LLMStopReason = 'end_turn' | 'max_tokens' | 'tool_use' | 'stop_sequence'

export type LLMUsage = {
  inputTokens: number
  outputTokens: number
  cacheReadTokens: number
  cacheCreationTokens: number
  cost: number
}

export type LLMResponse = {
  content: string
  toolCalls: ReadonlyArray<LLMToolCall>
  modelUsed: string
  providerUsed: LLMProviderName
  usage: LLMUsage
  latencyMs: number
  stopReason: LLMStopReason
}

export type LLMStreamChunk =
  | { type: 'text_delta'; text: string }
  | { type: 'tool_call_delta'; id: string; name?: string; argumentsDelta?: string }
  | { type: 'usage'; usage: LLMUsage }
  | { type: 'stop'; reason: LLMStopReason }
