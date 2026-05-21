/**
 * Critic — Public types.
 *
 * Anti-vendor-lock-in: the Critic consumes `@/lib/llm` abstractions only.
 * Adding a new YMYL sub-context here is a contract change — every caller in
 * agent code branches on `YMYLContext`, so additions must be intentional.
 *
 * Fail-closed posture is encoded in the verdict shape: `block` MUST carry
 * `userSafeMessage` so the caller cannot accidentally surface raw LLM text
 * when verification fails (UCC L121-1 + ANAH publication accuracy risk).
 */

import type { LLMMessage } from '@/lib/llm'

export type YMYLContext =
  | 'aide_amount'
  | 'aide_eligibility'
  | 'devis_estimation'
  | 'cee_dossier'
  | 'rge_qualification'
  | 'plafond_revenus'
  | 'legal_contract'

export type CriticInput = {
  primaryOutput: string
  userQuery: string
  ymylContext: YMYLContext
  sourceConversation: ReadonlyArray<LLMMessage>
  citedSources: ReadonlyArray<{ url: string; title: string; retrievedAt: string }>
  traceId: string
  agentName: string
}

export type CriticDimension =
  | 'factuality'
  | 'source_present'
  | 'math_check'
  | 'hallucination_risk'
  | 'completeness'
  | 'safety_disclaimer'

export type CriticSeverity = 'block' | 'warn' | 'info'

export type CriticReason = {
  dimension: CriticDimension
  severity: CriticSeverity
  message: string
  evidence?: string
}

export type CriticDecision = 'approve' | 'revise' | 'block'

export type CriticApprove = {
  decision: 'approve'
  confidence: number
  reasons: ReadonlyArray<CriticReason>
}

export type CriticRevise = {
  decision: 'revise'
  confidence: number
  reasons: ReadonlyArray<CriticReason>
  suggestedFix?: string
}

export type CriticBlock = {
  decision: 'block'
  confidence: number
  reasons: ReadonlyArray<CriticReason>
  userSafeMessage: string
}

export type CriticVerdict = CriticApprove | CriticRevise | CriticBlock

export type CriticConfig = {
  blockThreshold: number
  reviseThreshold: number
  criticVersion: string
  timeoutMs: number
}
