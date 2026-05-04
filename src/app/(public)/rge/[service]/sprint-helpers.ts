/**
 * Sprint AI Wave A Ahrefs 2026-05-03 — helpers snippet-bait pour /rge/[service].
 *
 * Compose les bullets TldrBlock + EnBrefBox keyPoints depuis le contenu hub
 * éditorial RgeServiceHubContent. Permet à `/rge/[service]/page.tsx` de
 * câbler TldrBlock + EnBrefBox + ImmediateAnswerBlock (Featured Snippets +
 * AI Overviews + Speakable) sans dupliquer la logique de transformation.
 *
 * Audit SEO 10-agents 2026-04-28 : `/rge/[service]` = hub à fort potentiel
 * RGE (8 services × autorité topical) sans aucun composant snippet-bait.
 * Wiring estimé +600-950 clics/mois sur les requêtes "qualibat", "qualipac",
 * "rge <métier>".
 */

import type { RgeServiceHubContent } from '@/lib/rge/service-hub-content'

/**
 * Bullets TL;DR : 4-5 réponses directes optimisées Featured Snippets.
 * Format : phrase courte démarrant par chiffre/keyword pour scanning.
 */
export function buildRgeServiceTldrBullets(args: {
  content: RgeServiceHubContent
  total: number
  qualifLabel: string | null
  qualifOrganisme: string | null
  topCitiesCount: number
}): string[] {
  const { content, total, qualifLabel, qualifOrganisme, topCitiesCount } = args
  const bullets: string[] = []

  if (total > 0) {
    bullets.push(
      `${total.toLocaleString('fr-FR')} artisans RGE actifs en France pour ce métier (référentiel ADEME, sync hebdo).`
    )
  }

  if (qualifLabel) {
    bullets.push(
      `Qualification ${qualifLabel} obligatoire pour MaPrimeRénov' et primes CEE — délivrée par ${qualifOrganisme ?? 'un organisme accrédité COFRAC'}.`
    )
  }

  if (content.aides.length > 0) {
    const top = content.aides[0]
    bullets.push(
      `${content.aides.length} dispositifs d'aides cumulables : ${top.label} (${top.montant})${content.aides.length > 1 ? ' + autres' : ''}.`
    )
  }

  if (topCitiesCount > 0) {
    bullets.push(
      `Couverture nationale — ${topCitiesCount} villes principales identifiées avec densité d'artisans qualifiés suffisante.`
    )
  }

  bullets.push(
    `Sans qualification RGE active à la date du devis, aucune aide publique n'est versée — vérification obligatoire avant signature.`
  )

  return bullets
}

/**
 * KeyPoints "En bref" : 3-4 points scannables pour Featured Snippets.
 * Distincts du TL;DR — focus chiffres + différenciateur qualif vs travaux.
 */
export function buildRgeServiceEnBrefPoints(args: {
  content: RgeServiceHubContent
  total: number
}): string[] {
  const { content, total } = args
  const points: string[] = []

  if (total > 0) {
    points.push(`${total.toLocaleString('fr-FR')} artisans RGE actifs recensés`)
  }

  if (content.travaux.length > 0) {
    const top3 = content.travaux
      .slice(0, 3)
      .map((t) => t.label)
      .join(', ')
    points.push(`Travaux couverts : ${top3}`)
  }

  if (content.aides.length > 0) {
    points.push(
      `${content.aides.length} aides publiques mobilisables (MaPrimeRénov', CEE, TVA 5,5 %, éco-PTZ)`
    )
  }

  points.push(`Validité de la qualification vérifiée chaque semaine via l'API ADEME officielle`)

  return points
}

/**
 * Summary "En bref" : 1 phrase de 30-50 mots, riche en mots-clés métier.
 */
export function buildRgeServiceEnBrefSummary(args: {
  content: RgeServiceHubContent
  total: number
  qualifLabel: string | null
}): string {
  const { content, total, qualifLabel } = args
  const totalText = total > 0 ? `${total.toLocaleString('fr-FR')} ` : ''
  const qualifText = qualifLabel ? `${qualifLabel} ` : 'RGE '
  return `${totalText}artisans certifiés ${qualifText}pour ${content.h1.replace(/^Artisans RGE /i, '').toLowerCase()} : ${content.aides.length} aides publiques mobilisables (MaPrimeRénov', CEE, éco-PTZ), qualification vérifiée chaque semaine via l'annuaire officiel ADEME.`.trim()
}
