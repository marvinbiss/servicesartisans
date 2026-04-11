/**
 * API — CEE Dispatch (wrapping HTTP de la brique 3 mandataire CEE)
 * ----------------------------------------------------------------------------
 * POST /api/cee/dispatch
 *
 * Expose `dispatchDevis` (cf. `src/lib/cee/dispatcher.ts`) derrière une route
 * HTTP pour que le tunnel devis (appel serveur-à-serveur, pas navigateur)
 * puisse router un devis entrant vers un artisan RGE éligible CEE et
 * déclencher la création du dossier brouillon.
 *
 * Auth — Option retenue : header `x-internal-secret` comparé en temps
 * constant à `process.env.INTERNAL_API_SECRET`. C'est le pattern le plus
 * cohérent pour un appel server-to-server idempotent :
 *   - pas de session utilisateur impliquée (le tunnel devis côté serveur
 *     appelle cette route avec un secret partagé) ;
 *   - pas de requirePermission admin : la route n'est pas ouverte à
 *     l'interface admin ;
 *   - symétrique au CRON_SECRET déjà utilisé par les routes cron.
 *
 * Options alternatives considérées (documentées pour traçabilité) :
 *   - Option 2 : `requirePermission('devis', 'write')` — pertinent si un
 *     jour la route devient une action admin (diagnostic / replay manuel).
 *   - Option 3 : supprimer la route HTTP et appeler `dispatchDevis`
 *     directement en SSR depuis le handler du tunnel devis. Envisageable
 *     si le tunnel devis partage le même process (monorepo Next.js) — plus
 *     rapide, mais couple le tunnel devis au module dispatcher.
 *
 * TODO : aligner la stratégie d'auth avec celle retenue pour `/api/devis`
 * quand Pipedrive / tunnel devis migreront vers un contrat stable
 * serveur-à-serveur (probablement la même variable INTERNAL_API_SECRET,
 * cf. pattern CRON_SECRET existant sur les crons Vercel).
 *
 * Client Supabase : `createAdminClient()` (service_role). Justification :
 * le dispatcher doit lire `cee_operations`, `cee_delegataires`,
 * `providers`/`rge_qualifications` et écrire dans `cee_dossiers` sans
 * contexte utilisateur authentifié — le tunnel devis côté serveur n'a
 * pas toujours de session Supabase à propager. Le fail-closed reste géré
 * en amont par le dispatcher lui-même (aucun throw non catché).
 *
 * Observabilité : logs structurés en entrée/sortie, zéro PII
 * (pas d'email, pas de téléphone, pas de SIRET dans les logs).
 *
 * Idempotence : déléguée à `dispatchDevis` (brouillon existant réutilisé).
 *
 * Exemple curl :
 *   curl -X POST https://servicesartisans.fr/api/cee/dispatch \
 *     -H 'Content-Type: application/json' \
 *     -H 'x-internal-secret: $INTERNAL_API_SECRET' \
 *     -d '{
 *       "devis_id":"...uuid...",
 *       "client_id":"...uuid...",
 *       "service_slug":"chauffagiste",
 *       "postal_code":"75011",
 *       "candidate_provider_ids":["...uuid..."]
 *     }'
 */

import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { z } from 'zod'
import { dispatchDevis, type DispatchOutcome } from '@/lib/cee/dispatcher'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Headers standards
// ---------------------------------------------------------------------------

/** Headers communs à toutes les réponses (jamais en cache, sniff bloqué). */
const RESPONSE_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
}

// ---------------------------------------------------------------------------
// Validation zod
// ---------------------------------------------------------------------------

/**
 * Contrat du body — strict (aucune clé additionnelle tolérée).
 *
 * `candidate_provider_ids` est capé à 50 entrées pour éviter qu'un
 * caller mal configuré ne déclenche un scan RGE illimité ; en pratique
 * le tunnel devis n'envoie jamais plus d'une dizaine de candidats.
 */
const dispatchBodySchema = z
  .object({
    devis_id: z.string().uuid(),
    // client_id est REQUIS mais peut être null (anonyme). Omission → 400.
    client_id: z.string().uuid().nullable(),
    service_slug: z.string().min(1).max(100),
    postal_code: z
      .string()
      .regex(/^\d{5}$/)
      .nullable()
      .optional(),
    candidate_provider_ids: z.array(z.string().uuid()).max(50),
  })
  .strict()

type DispatchBody = z.infer<typeof dispatchBodySchema>

// ---------------------------------------------------------------------------
// Auth — comparaison en temps constant
// ---------------------------------------------------------------------------

/**
 * Compare deux secrets en temps constant pour éviter les attaques timing.
 * Retourne false si l'une des valeurs est absente ou si les longueurs
 * diffèrent (timingSafeEqual throw sur longueurs inégales).
 */
function safeCompare(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  if (bufA.length !== bufB.length) return false
  try {
    return timingSafeEqual(bufA, bufB)
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// Mapping outcome → HTTP
// ---------------------------------------------------------------------------

/**
 * Mappe un `DispatchOutcome` vers une réponse HTTP.
 *
 * - `cee_routed` → 200, outcome complet
 * - `fallback_non_cee` → 200 (c'est un résultat valide, le dispatch CEE
 *   n'est tout simplement pas applicable pour ce devis)
 * - `error` → 500, payload d'erreur
 */
function outcomeToResponse(outcome: DispatchOutcome): NextResponse {
  if (outcome.kind === 'error') {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'dispatch_error',
          message: outcome.message,
        },
      },
      { status: 500, headers: RESPONSE_HEADERS }
    )
  }

  return NextResponse.json({ success: true, outcome }, { status: 200, headers: RESPONSE_HEADERS })
}

// ---------------------------------------------------------------------------
// Handler POST
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ---- Étape 1 : auth via internal-secret -------------------------------
  const expectedSecret = process.env.INTERNAL_API_SECRET
  if (!expectedSecret) {
    // Fail-closed : en l'absence de secret configuré, la route est
    // inopérante (plutôt que d'accepter tout le monde).
    logger.error('cee_dispatch_auth_missing_secret', undefined, {
      action: 'cee-dispatch-auth',
    })
    return NextResponse.json(
      { success: false, error: { code: 'unauthorized', message: 'Non autorisé' } },
      { status: 401, headers: RESPONSE_HEADERS }
    )
  }

  const providedSecret = request.headers.get('x-internal-secret')
  if (!safeCompare(providedSecret, expectedSecret)) {
    return NextResponse.json(
      { success: false, error: { code: 'unauthorized', message: 'Non autorisé' } },
      { status: 401, headers: RESPONSE_HEADERS }
    )
  }

  // ---- Étape 2 : parse body ---------------------------------------------
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'invalid_body', message: 'Corps de requête invalide' },
      },
      { status: 400, headers: RESPONSE_HEADERS }
    )
  }

  // ---- Étape 3 : validation zod -----------------------------------------
  const parsed = dispatchBodySchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'invalid_body',
          message: 'Données invalides',
          details: parsed.error.flatten().fieldErrors,
        },
      },
      { status: 400, headers: RESPONSE_HEADERS }
    )
  }
  const body: DispatchBody = parsed.data

  // ---- Étape 4 : log entrée (zéro PII) ----------------------------------
  logger.info('cee_dispatch_request', {
    action: 'cee-dispatch-request',
    devis_id: body.devis_id,
    service_slug: body.service_slug,
    n_candidates: body.candidate_provider_ids.length,
    has_postal_code: body.postal_code !== undefined && body.postal_code !== null,
  })

  // ---- Étape 5 : appel dispatcher ---------------------------------------
  const supabase = createAdminClient()
  let outcome: DispatchOutcome
  try {
    outcome = await dispatchDevis(supabase, {
      devisId: body.devis_id,
      clientId: body.client_id,
      serviceSlug: body.service_slug,
      postalCode: body.postal_code ?? null,
      candidateProviderIds: body.candidate_provider_ids,
    })
  } catch (err) {
    // Filet de sécurité ultime : le dispatcher est déjà fail-safe, mais
    // on ne veut en aucun cas qu'une exception non catchée remonte au
    // client HTTP.
    logger.error('cee_dispatch_unexpected_throw', err, {
      action: 'cee-dispatch-throw',
      devis_id: body.devis_id,
      service_slug: body.service_slug,
    })
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'dispatch_error',
          message: 'dispatch_unexpected_error',
        },
      },
      { status: 500, headers: RESPONSE_HEADERS }
    )
  }

  // ---- Étape 6 : log sortie (zéro PII) ----------------------------------
  logger.info('cee_dispatch_outcome', {
    action: 'cee-dispatch-outcome',
    devis_id: body.devis_id,
    service_slug: body.service_slug,
    kind: outcome.kind,
    reason: outcome.kind === 'fallback_non_cee' ? outcome.reason : undefined,
  })

  // ---- Étape 7 : mapping HTTP -------------------------------------------
  return outcomeToResponse(outcome)
}
