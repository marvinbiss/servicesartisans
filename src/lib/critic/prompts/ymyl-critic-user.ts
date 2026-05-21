/**
 * User prompt builder — feeds the Critic the exact primary output, the user
 * question, the cited sources and the YMYL sub-context. The shape is kept
 * symmetrical to the audit log row so a verdict can later be replayed
 * deterministically against the same inputs.
 */

import type { CriticInput } from '../types'

export function buildCriticUserPrompt(input: CriticInput): string {
  const sources =
    input.citedSources
      .map((s, i) => `[${i + 1}] ${s.title} — ${s.url} (retrieved ${s.retrievedAt})`)
      .join('\n') || '(aucune source citée)'

  return `Question utilisateur : ${input.userQuery}

Contexte YMYL : ${input.ymylContext}

Réponse à évaluer :
---
${input.primaryOutput}
---

Sources citées par le LLM primaire :
${sources}

Évalue cette réponse selon le schéma JSON imposé.`
}
