/**
 * Claude provider stub.
 *
 * Live HTTP integration lands in the next sprint. Two transport options:
 *   1. Direct Anthropic API: POST https://api.anthropic.com/v1/messages
 *   2. AWS Bedrock EU-West-3 when DPF compliance must be tightened for
 *      a specific customer segment (mandataire CEE B2B, signed mandates).
 * Selection will be controlled by env (ANTHROPIC_TRANSPORT=api|bedrock).
 *
 * Default model `claude-sonnet-4-6` is the daily driver for tool-use
 * agents. Long-context and YMYL critic calls promote to `claude-opus-4-7`
 * via the routing layer.
 */

import { LLMProviderUnavailableError } from '../errors'
import { LLMProvider } from '../provider'
import type { LLMRequest, LLMResponse, LLMStreamChunk } from '../types'

export class ClaudeProvider extends LLMProvider {
  readonly name = 'claude' as const
  readonly defaultModel = 'claude-sonnet-4-6'

  async complete(_req: LLMRequest): Promise<LLMResponse> {
    throw new LLMProviderUnavailableError(
      this.name,
      'live HTTP client not yet implemented — scheduled next sprint'
    )
  }

  // eslint-disable-next-line require-yield -- stub awaiting live impl
  async *stream(_req: LLMRequest): AsyncIterable<LLMStreamChunk> {
    throw new LLMProviderUnavailableError(
      this.name,
      'streaming not yet implemented — scheduled next sprint'
    )
  }
}
