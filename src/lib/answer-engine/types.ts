/**
 * AnswerEngine — public types.
 *
 * Why a dedicated `AnswerResult` discriminated union: every caller (chat
 * preview, `/api/v1/ask` endpoint, simulateur backend, MCP `get-bareme`
 * tool, internal worker) MUST handle the failure branches explicitly. The
 * union forces TypeScript to surface "what if the LLM fails / Critic
 * blocks ?" at compile time instead of leaving it to a runtime try/catch
 * in every caller — that's exactly the kind of dual-implementation drift
 * the orchestrator was created to kill.
 *
 * `Trace` is intentionally rich (provider/model/cost/tokens/latency/
 * groundTruth/critic flags). Telemetry pipelines (Sentry, internal cost
 * dashboard, Pipedrive trace) all read from this single shape so they
 * never have to introspect a provider response directly.
 */

import type { LLMMessage, LLMClassification, LLMProviderName } from '@/lib/llm'
import type { CriticVerdict } from '@/lib/critic'
import type { Geste, MenageCategorie, Zone } from '@/lib/aides'

export type AnswerRequest = {
  /** Requête utilisateur originale (FR par défaut). */
  query: string
  /** Classification optionnelle — sinon traitée comme 'generic'. */
  classification?: LLMClassification
  /**
   * Si la requête touche un barème aides : params calculator pour ground-truth
   * injection. Quand `rfr + nbPersonnes + zone + geste` sont tous fournis, le
   * calculateur déterministe est appelé et le résultat est injecté dans le
   * system prompt avant l'appel LLM (forçage anti-hallucination).
   */
  aidesContext?: {
    geste: Geste
    menageCategorie?: MenageCategorie
    rfr?: number
    nbPersonnes?: number
    zone?: Zone
  }
  /** Historique conversation pour multi-turn (best-effort en v0). */
  history?: ReadonlyArray<LLMMessage>
  /** Identifiant trace stable côté caller (sinon généré). */
  traceId?: string
  /** Nom d'agent appelant (utilisé par classifier YMYL + télémétrie). */
  agentName?: string
  /**
   * Sources externes fournies au LLM (URLs canoniques ANAH, France Rénov',
   * service-public, etc.). Permet d'enrichir les `Citation` retournées avec
   * un titre humain et une date de retrieval certifiée par le caller.
   */
  citedSources?: ReadonlyArray<{ url: string; title: string; retrievedAt: string }>
}

export type Citation = {
  /** URL absolue source. */
  url: string
  /** Titre source (matché depuis `citedSources` ou dérivé du hostname). */
  title: string
  /** Date snapshot ou retrieval (YYYY-MM-DD). */
  retrievedAt: string
  /** Position dans le texte si extrait de l'output LLM. */
  spanStart?: number
  spanEnd?: number
}

export type Trace = {
  traceId: string
  classification: LLMClassification
  providerUsed: LLMProviderName
  modelUsed: string
  groundTruthInjected: boolean
  groundTruthDetail?: string
  criticInvoked: boolean
  latencyMs: number
  llmUsage?: {
    inputTokens: number
    outputTokens: number
    cost: number
  }
}

export type AnswerFailureReason =
  | 'critic_block'
  | 'llm_unavailable'
  | 'invalid_request'
  | 'rate_limit'
  | 'timeout'

export type AnswerResult =
  | {
      ok: true
      content: string
      citations: ReadonlyArray<Citation>
      criticVerdict?: CriticVerdict
      trace: Trace
    }
  | {
      ok: false
      reason: AnswerFailureReason
      userSafeMessage: string
      criticVerdict?: CriticVerdict
      trace: Partial<Trace>
    }

export type AnswerEngineConfig = {
  /** Si true et classification YMYL : ground-truth calculator injecté avant LLM. */
  injectGroundTruth: boolean
  /** Si true et classification YMYL : Critic invoqué après LLM. */
  invokeCritic: boolean
  /** Timeout global LLM call en ms. */
  llmTimeoutMs: number
  /**
   * Si Critic decision = 'revise', stratégie :
   *  - pass_through_with_warning : retourne content original + verdict warn
   *  - re_prompt_with_fix        : non implémenté en v0 (éviter boucles)
   *  - block_to_user             : retourne fail-closed
   */
  reviseStrategy: 'pass_through_with_warning' | 're_prompt_with_fix' | 'block_to_user'
}

export const DEFAULT_ENGINE_CONFIG: AnswerEngineConfig = {
  injectGroundTruth: true,
  invokeCritic: true,
  llmTimeoutMs: 30_000,
  reviseStrategy: 'pass_through_with_warning',
}
