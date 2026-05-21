/**
 * Gemini provider stub.
 *
 * Live HTTP integration lands in the next sprint. Two transport options:
 *   1. Google AI Studio (Generative Language API):
 *      POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
 *   2. Vertex AI EU-West-3 when GCP residency must be enforced.
 * Selection will be controlled by env (GEMINI_TRANSPORT=studio|vertex).
 *
 * Gemini is the multimodal hard-override target: any request carrying an
 * image or a PDF lands here regardless of classification (see routing.ts).
 */

import { LLMProviderUnavailableError } from '../errors'
import { LLMProvider } from '../provider'
import type { LLMRequest, LLMResponse, LLMStreamChunk } from '../types'

export class GeminiProvider extends LLMProvider {
  readonly name = 'gemini' as const
  readonly defaultModel = 'gemini-2.5-pro'

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
