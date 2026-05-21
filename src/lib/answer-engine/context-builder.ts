/**
 * Ground-truth context builder.
 *
 * Pure function: takes `AnswerRequest.aidesContext` and, when enough
 * parameters are present, calls the deterministic MaPrimeRénov calculator
 * (Ralph 12) to produce a system-prompt segment containing the exact
 * authoritative figure. The LLM is then asked to cite this figure rather
 * than guess one, which is the only mechanism we have to constrain the
 * model on a YMYL number without hand-rolled retrieval at every call site.
 *
 * Why not let the LLM do the math via tool calls : the calculator is
 * pure arithmetic on a table — there's no upside to spending a tool round
 * trip on it, and we don't want a hallucinated argument shape to slip
 * through. Calling it eagerly + injecting the answer is strictly safer.
 */

import type { AnswerRequest } from './types'
import { computeMprAmount, determineMenageCategorie, type EligibilityInput } from '@/lib/aides'

export type GroundTruthBlock = {
  injected: boolean
  systemSegment: string
  detail?: string
}

export function buildGroundTruthBlock(request: AnswerRequest): GroundTruthBlock {
  if (!request.aidesContext) {
    return { injected: false, systemSegment: '' }
  }
  const ctx = request.aidesContext

  // Cas 1 : tous les paramètres pour un calcul exact.
  if (ctx.rfr !== undefined && ctx.nbPersonnes !== undefined && ctx.zone !== undefined) {
    const input: EligibilityInput = {
      rfr: ctx.rfr,
      nbPersonnes: ctx.nbPersonnes,
      zone: ctx.zone,
      geste: ctx.geste,
    }
    const result = computeMprAmount(input)
    const cat = determineMenageCategorie(input)
    const detail = result.eligible
      ? `MPR ${ctx.geste}: ${result.amountEUR}EUR (source ${result.sourceRef})`
      : `MPR ${ctx.geste}: non éligible (raison: ${result.reason})`

    const systemSegment = `[GROUND TRUTH - CALCULATOR DETERMINISTIC]
Ce qui suit est le résultat du calculateur officiel SA pour ce cas précis. Si ta réponse contredit ces chiffres, tu hallucines. Cite ces chiffres exactement.

${detail}

Catégorie ménage déterminée : ${cat ?? 'indéterminée (RFR/nb personnes hors plafonds)'}
Référence : ANAH/France Rénov 2026, snapshot 2026-04-15
URL canonique : https://www.anah.gouv.fr/proprietaires/aides-de-l-anah/maprimerenov
---`

    return { injected: true, systemSegment, detail }
  }

  // Cas 2 : contexte partiel — on annonce le geste pour cadrer la réponse
  // mais on ne calcule rien (manque de paramètres).
  if (ctx.menageCategorie || ctx.zone || ctx.rfr !== undefined || ctx.nbPersonnes !== undefined) {
    const systemSegment = `[CONTEXTE PARTIEL]
Geste demandé: ${ctx.geste}. Si tu mentionnes un montant MaPrimeRénov, cite obligatoirement la source ANAH avec URL https://www.anah.gouv.fr/proprietaires/aides-de-l-anah/maprimerenov et explique que le montant exact dépend de RFR + nombre de personnes du foyer + zone géographique (IDF ou hors IDF).
---`
    return {
      injected: true,
      systemSegment,
      detail: `partial-context for geste ${ctx.geste}`,
    }
  }

  // Cas 3 : seul le geste — pas assez pour injecter du contexte utile.
  return { injected: false, systemSegment: '' }
}
