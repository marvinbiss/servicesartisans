/**
 * POST /api/simulateur/estimate
 *
 * Calcule une estimation SANS persister. Utilisé par l'UI pour afficher
 * une fourchette en temps réel (debounced).
 *
 * Rate-limit : 10 req/min par IP hash.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { rateLimit, getRateLimitHeaders } from '@/lib/rate-limit'
import { estimateInputSchema } from '@/lib/simulateur/api-schemas'
import { runSimulation } from '@/lib/simulateur/engine/pipeline'
import { classifierCategorieAnah } from '@/lib/simulateur/engine/classifier'
import { zoneFromCodePostal } from '@/lib/simulateur/zones'
import { hashIp } from '@/lib/simulateur/rgpd/hash-ip'
import type { Situation } from '@/lib/simulateur/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return (fwd.split(',')[0] ?? '').trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

export async function POST(req: NextRequest) {
  // Rate-limit par IP
  const ip = clientIp(req)
  let ipKey: string
  try {
    ipKey = hashIp(ip)
  } catch {
    ipKey = ip
  }
  const rl = rateLimit(`simulateur:estimate:${ipKey}`, 10, 60_000)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez dans une minute.' },
      { status: 429, headers: getRateLimitHeaders(rl) }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 })
  }

  const parsed = estimateInputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides', issues: z.treeifyError(parsed.error) },
      { status: 422 }
    )
  }

  const { situation: situationInput, projet, budget } = parsed.data

  // Enrichissement : zone + idf + catégorie ANAH
  const zoneRes = zoneFromCodePostal(situationInput.codePostal)
  const categorie = classifierCategorieAnah(situationInput.rfr, situationInput.foyer, zoneRes.idf)

  const situation: Situation = {
    ...situationInput,
    zone: zoneRes.zone,
    idf: zoneRes.idf,
    categorie,
  }

  try {
    const result = runSimulation({ situation, projet, budget })
    // Construire la liste des hypothèses pour transparence UI
    const hypotheses: string[] = []

    // Budget estimé
    hypotheses.push(`Budget travaux estimé à ${new Intl.NumberFormat('fr-FR').format(budget.budgetHt)} € HT (coûts moyens par geste)`)

    // Surface isolation estimée
    const ceeSteps = result.formuleDebug.filter((s) => s.step === 'applyNonCumul')
    const aidesCee = (ceeSteps[0]?.inputs?.aides as Array<{ code: string }>) ?? []
    const hasIsolation = aidesCee.some((a) => a.code?.startsWith('BAR-EN'))
    if (hasIsolation) {
      hypotheses.push('Surfaces d\'isolation estimées à partir de votre surface habitable (ratio standard DTU)')
    }

    // PAC ETAS
    const hasPac = result.gestesRetenus.includes('PAC_AIREAU')
    if (hasPac && projet.parcours === 'geste') {
      hypotheses.push('Performance PAC : ETAS classe 2 (> 140%) supposée — la classe 1 donnerait ~17% de CEE en moins')
    }

    // Prix CEE
    if (result.ceeFourchetteBas > 0 || result.ceeFourchetteHaut > 0 || result.ceeAmpleur > 0) {
      hypotheses.push('Prix CEE : cotation Emmy indicative (8,5–15 €/MWhc), cours variable')
    }

    // Non-cumul incertain — combinaisons CEE ni explicitement autorisées ni interdites
    if (result.uncertainCombinations.length > 0) {
      const pctBas = Math.round(result.uncertaintyDiscount * 100)
      hypotheses.push(
        `Non-cumul CEE incertain : ${result.uncertainCombinations.join(', ')}. Fourchette ajustée par précaution (−${pctBas}% sur le bas). Modèle interne, pas une règle officielle — le cumul réel dépend de l'instruction du dossier.`
      )
    }

    // Surface isolation — fourchette élargie par ratio DTU
    if (hasIsolation && result.ceeFourchetteBas !== result.ceeFourchetteHaut) {
      hypotheses.push(
        'La fourchette CEE isolation intègre l\'incertitude sur les surfaces réelles (ratio min/max DTU). Le montant réel dépend du métré chantier.'
      )
    }

    return NextResponse.json(
      {
        categorieAnah: result.categorieAnah,
        zone: zoneRes.zone,
        idf: zoneRes.idf,
        mprTotal: result.mprTotal,
        ceeFourchetteBas: result.ceeFourchetteBas,
        ceeFourchetteHaut: result.ceeFourchetteHaut,
        ceeAmpleur: result.ceeAmpleur,
        cdpEstimationBas: result.cdpEstimationBas,
        cdpEstimationHaut: result.cdpEstimationHaut,
        marPriseEnCharge: result.marPriseEnCharge,
        totalAidesBas: result.totalAidesBas,
        totalAidesHaut: result.totalAidesHaut,
        resteAChargeBas: result.resteAChargeBas,
        resteAChargeHaut: result.resteAChargeHaut,
        ecretementPct: result.ecretementPct,
        ecretementAtteint: result.ecretementAtteint,
        gestesRetenus: result.gestesRetenus,
        gestesRejetes: result.gestesRejetes,
        exclusion: result.exclusion,
        uncertainCombinations: result.uncertainCombinations,
        uncertaintyDiscount: result.uncertaintyDiscount,
        confidenceLevel: result.confidenceLevel,
        confidenceMessage: result.confidenceMessage,
        confidenceBreakdown: result.confidenceBreakdown,
        zoneWarning: zoneRes.warning,
        ecoPtz: result.ecoPtz,
        par: result.par,
        baremeIds: result.baremeIds,
        hypotheses,
      },
      { headers: getRateLimitHeaders(rl) }
    )
  } catch (err) {
    logger.error('simulateur/estimate failed', {
      component: 'api/simulateur/estimate',
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json({ error: 'Erreur lors du calcul' }, { status: 500 })
  }
}
