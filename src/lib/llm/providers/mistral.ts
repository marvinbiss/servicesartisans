/**
 * Mistral provider stub.
 *
 * Live HTTP integration lands in the next sprint once Vercel env keys
 * (MISTRAL_API_KEY) are provisioned. Sovereign endpoint:
 *   POST https://api.mistral.ai/v1/chat/completions
 * Hosted in Paris, RGPD-natif — chosen as default sovereign path for any
 * request touching French PII or YMYL aides data.
 *
 * Default model `mistral-large-latest` aliases the current GA Large
 * (today: Mistral Large 3 / 24.11). Bulk SEO calls route to
 * `mistral-medium-latest` via the routing layer, not by changing
 * defaultModel here.
 */

import { LLMProviderUnavailableError } from '../errors'
import { LLMProvider } from '../provider'
import type { LLMRequest, LLMResponse, LLMStreamChunk } from '../types'

export class MistralProvider extends LLMProvider {
  readonly name = 'mistral' as const
  readonly defaultModel = 'mistral-large-latest'

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
