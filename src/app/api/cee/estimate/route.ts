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

/**
 * Projection publique d'un item enrichi — ne laisse passer que les champs
 * sûrs pour affichage anonyme.
 */
interface PublicEstimateItem {
  code: string
  nom: string
  prime_estimate: {
    euros_classique_min: number
    euros_classique_max: number
    euros_precarite_min: number
    euros_precarite_max: number
  } | null
}

interface PublicEstimateResponse {
  eligible: boolean
  codes: string[]
  zone_climatique: 'H1' | 'H2' | 'H3' | null
  items: PublicEstimateItem[]
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ---- Étape 1 : parse + validation zod ---------------------------------
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'invalid_json', message: 'Body JSON invalide' } },
      { status: 400, headers: RESPONSE_HEADERS }
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
      { status: 400, headers: RESPONSE_HEADERS }
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
    const items: PublicEstimateItem[] = enriched.items.map((item) => ({
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

    const response: PublicEstimateResponse = {
      eligible: enriched.eligible,
      codes: enriched.codes,
      zone_climatique: enriched.zone_climatique,
      items,
    }

    // Shape directe (eligible/codes/items) — pas de wrapper success:true, pour compat CeePrimeEstimateCard
    return NextResponse.json(response, { status: 200, headers: RESPONSE_HEADERS })
  } catch (err) {
    // Fail-open : on renvoie un résultat "non éligible" plutôt qu'une 500
    // pour ne jamais bloquer l'affichage du tunnel devis.
    logger.warn('cee_estimate_unexpected_error', {
      action: 'cee-estimate',
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json(
      {
        eligible: false,
        codes: [],
        zone_climatique: null,
        items: [],
      } satisfies PublicEstimateResponse,
      { status: 200, headers: RESPONSE_HEADERS }
    )
  }
}
