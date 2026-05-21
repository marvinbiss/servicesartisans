/**
 * YMYL classifier — pure detection of YMYL contexts.
 *
 * Pure function: keeps the decision boundary testable without an LLM and lets
 * callers gate the (expensive) `critique()` orchestration on a fast heuristic.
 * The classifier sees three signals — the LLM classification, the agent name,
 * and the user query — because none alone is sufficient in production (generic
 * agents can route ambiguous queries through `ymyl_aides`, and bespoke agents
 * sometimes use the `generic` classification while still operating on aides).
 */

import type { LLMClassification } from '@/lib/llm'
import type { YMYLContext } from './types'

export type IsYMYLInput = {
  classification: LLMClassification
  agentName?: string
  userQuery?: string
}

export type IsYMYLResult = { isYMYL: boolean; context?: YMYLContext }

export function isYMYL(input: IsYMYLInput): IsYMYLResult {
  const { classification, agentName, userQuery } = input

  if (classification === 'ymyl_aides') {
    return { isYMYL: true, context: detectAidesSubContext(userQuery) }
  }
  if (classification === 'contract_legal') {
    return { isYMYL: true, context: 'legal_contract' }
  }
  if (classification === 'critic_ymyl') {
    return { isYMYL: true, context: detectAidesSubContext(userQuery) }
  }

  if (agentName) {
    if (/aide|prime|cee|mpr|maprimerenov/i.test(agentName)) {
      return { isYMYL: true, context: detectAidesSubContext(userQuery) }
    }
    if (/devis|estimation|tarif/i.test(agentName)) {
      return { isYMYL: true, context: 'devis_estimation' }
    }
    if (/eligib/i.test(agentName)) {
      return { isYMYL: true, context: 'aide_eligibility' }
    }
    if (/rge|qualif/i.test(agentName)) {
      return { isYMYL: true, context: 'rge_qualification' }
    }
  }

  return { isYMYL: false }
}

function detectAidesSubContext(query?: string): YMYLContext {
  if (!query) return 'aide_amount'
  if (/(éligib|\belig|\bdroit|\bpeut-on|\bpuis-je|ai-je\s+droit)/i.test(query)) {
    return 'aide_eligibility'
  }
  if (/\bplafond|\brevenu|\brfr/i.test(query)) return 'plafond_revenus'
  if (/\bcumul|\bcombiner/i.test(query)) return 'aide_amount'
  if (/\bmontant|\bcombien|€|\beuros?/i.test(query)) return 'aide_amount'
  return 'aide_amount'
}
