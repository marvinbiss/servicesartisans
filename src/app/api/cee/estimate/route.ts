/**
 * API — CEE Prime Estimate (lecture publique pour le tunnel devis)
 * ----------------------------------------------------------------------------
 * POST /api/cee/estimate
 *
 * Expose une **version filtrée** de `enrichCeeQualification()` destinée à
 * l'affichage côté client dans le formulaire de devis (brique "carte prime
 * CEE" qui booste la conversion en amont de la soumission).
 *
 * Contrat :
 *   Body   { serviceSlug: string, postalCode?: string }
 *   200    { eligible: boolean, codes: string[], zone_climatique: 'H1'|'H2'|'H3'|null,
 *            items: Array<{ code, nom, prime_estimate }> }
 *
 * Sécurité — ce que la route ne renvoie JAMAIS :
 *   - `delegataires[]` (stratégie mandataire interne)
 *   - `justificatifs_requis[]` (checklist opérationnelle artisan)
 *   - `rge_qualifications_requises[]`, `non_cumulable_avec[]`,
 *     `forfaits_table`, `forfait_base_kwhc`, `public_cible`, `domaine`,
 *     `sous_domaine`, `assumptions` (détails techniques)
 *   - Aucune PII (pas d'email, pas de téléphone, pas de SIRET, pas d'user_id)
 *
 * C'est une route publique (pas d'auth) — le client non authentifié doit
 * pouvoir voir la prime estimée avant de soumettre. Le cap de payload et
 * l'absence de données sensibles sont les garde-fous.
 *
 * Client Supabase : `createAdminClient()` (service_role). Justification :
 * la lecture de `cee_operations` + `cee_delegataires` (fail-open) ne
 * transporte que du référentiel public, aucun RLS spécifique utilisateur.
 * On s'appuie sur la projection côté code pour filtrer les champs privés.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { enrichCeeQualification } from '@/lib/cee/enrich'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import type { EstimateItem, EstimateResponse } from '@/lib/cee/estimate-types'

export const dynamic = 'force-dynamic'

const RESPONSE_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
}

/**
 * Contrat strict. `serviceSlug` borné à 100 chars (pattern alphanum + tirets),
 * `postalCode` 5 chiffres si fourni.
 */
const estimateBodySchema = z
  .object({
    serviceSlug: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[a-z0-9-]+$/, 'slug invalide'),
    postalCode: z
      .string()
      .regex(/^\d{5}$/)
      .optional(),
  })
  .strict()

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ---- Rate limiting (20 req/min par IP, fail-open) ---------------------
  const ip = getClientIp(request.headers)
  const rl = await checkRateLimit(`cee-estimate:${ip}`, { window: 60_000, max: 20, failOpen: true })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Trop de requêtes, réessayez dans quelques instants' },
      {
        status: 429,
        headers: {
          ...RESPONSE_HEADERS,
          'X-RateLimit-Limit': '20',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(rl.resetTime),
          'Retry-After': String(Math.ceil((rl.resetTime - Date.now()) / 1000)),
        },
      }
    )
  }

  // Ajouter les headers rate limit sur toutes les réponses
  const rateLimitHeaders: Record<string, string> = {
    'X-RateLimit-Limit': '20',
    'X-RateLimit-Remaining': String(rl.remaining),
    'X-RateLimit-Reset': String(rl.resetTime),
  }

  // ---- Étape 1 : parse + validation zod ---------------------------------
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'invalid_json', message: 'Body JSON invalide' } },
      { status: 400, headers: { ...RESPONSE_HEADERS, ...rateLimitHeaders } }
    )
  }

  const parsed = estimateBodySchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'invalid_body',
          message: 'Paramètres invalides',
          issues: parsed.error.flatten(),
        },
      },
      { status: 400, headers: { ...RESPONSE_HEADERS, ...rateLimitHeaders } }
    )
  }

  const { serviceSlug, postalCode } = parsed.data

  // ---- Étape 2 : enrichissement (fail-open côté lib) --------------------
  try {
    const supabase = createAdminClient()
    const enriched = await enrichCeeQualification(supabase, {
      serviceSlug,
      postalCode: postalCode ?? null,
    })

    // ---- Étape 3 : projection publique (whitelist stricte) -------------
    const items: EstimateItem[] = enriched.items.map((item) => ({
      code: item.code,
      nom: item.nom,
      prime_estimate: item.prime_estimate
        ? {
            euros_classique_min: item.prime_estimate.euros_classique_min,
            euros_classique_max: item.prime_estimate.euros_classique_max,
            euros_precarite_min: item.prime_estimate.euros_precarite_min,
            euros_precarite_max: item.prime_estimate.euros_precarite_max,
          }
        : null,
    }))

    const response: EstimateResponse = {
      eligible: enriched.eligible,
      codes: enriched.codes,
      zone_climatique: enriched.zone_climatique,
      items,
    }

    // Shape directe (eligible/codes/items) — pas de wrapper success:true, pour compat CeePrimeEstimateCard
    return NextResponse.json(response, {
      status: 200,
      headers: { ...RESPONSE_HEADERS, ...rateLimitHeaders },
    })
  } catch (err) {
    // Fail-open : on renvoie un résultat "non éligible" plutôt qu'une 500
    // pour ne jamais bloquer l'affichage du tunnel devis. On log néanmoins en
    // `error` pour forwarder l'incident à Sentry (visibilité SLA-99.9).
    logger.error('cee_estimate_unexpected_error', err, { action: 'cee-estimate' })
    return NextResponse.json(
      {
        eligible: false,
        codes: [],
        zone_climatique: null,
        items: [],
      } satisfies EstimateResponse,
      { status: 200, headers: { ...RESPONSE_HEADERS, ...rateLimitHeaders } }
    )
  }
}
