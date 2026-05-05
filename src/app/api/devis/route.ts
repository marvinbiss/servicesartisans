/**
 * Devis API - ServicesArtisans
 * Thin handler: parse request, validate, call service, return response
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { cleanPhone } from '@/lib/validation/phone'
import { processDevis } from '@/lib/services/devis-service'
import { submitToIndexNow, getProviderAffectedUrls } from '@/lib/seo/indexnow'
import { slugify } from '@/lib/utils'
import { safeJsonBody } from '@/lib/api/handler'

export const dynamic = 'force-dynamic'

const devisSchema = z.object({
  service: z.string().min(1, 'Veuillez sélectionner un service'),
  // Funnel devis fix 2026-05-05 : urgency était requise côté serveur mais
  // optionnelle côté client (validateStep2 ne la check pas) → 400 fieldErrors
  // ramenait l'utilisateur step 2 sur step 3 = friction → drop. Default
  // 'flexible' aligné avec le UX intention "no rush". Downstream consumers
  // (devis-service.urgencyDbMap, pipedrive.lead.urgency) ont tous déjà un
  // fallback, donc pas d'impact data.
  urgency: z.enum(['flexible', 'mois', 'semaine', 'urgent']).optional().default('flexible'),
  budget: z.string().max(20).optional(),
  description: z.string().optional(),
  codePostal: z.string().optional(),
  ville: z.string().optional(),
  nom: z.string().min(2, 'Le nom est requis').optional().or(z.literal('')),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  telephone: z
    .string()
    .transform(cleanPhone)
    .pipe(
      z
        .string()
        .min(10, 'Numéro de téléphone invalide')
        .regex(/^(\+33|0033|0)[1-9]\d{8}$/, 'Format de téléphone français invalide')
    ),
  // Action #5 Ahrefs 2026-05-03 — attribution LP / Google Ads. Format strict
  // pour éviter pollution Pipedrive : 1-50 chars, [a-z0-9-_] uniquement.
  source: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9_-]+$/, 'Source invalide (a-z, 0-9, _, - uniquement)')
    .optional(),
})

export async function POST(request: Request) {
  try {
    // Rate limiting (public endpoint — 10 requests per minute per IP)
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`devis:${ip}`, { window: 60_000, max: 10, failOpen: true })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Trop de requêtes, veuillez réessayer plus tard' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((rl.resetTime - Date.now()) / 1000)) },
        }
      )
    }

    // Sprint 1 vague 4 (2026-05-04) — body invalide → 400 explicit, pas 500
    // catché en bas de fichier. Sentry signal de lead loss reste pertinent
    // uniquement pour les vraies exceptions serveur.
    const parsed = await safeJsonBody<unknown>(request)
    if (!parsed.ok) return parsed.response
    const body = parsed.data

    // Resolve authenticated user if present (null for anonymous submissions)
    let clientId: string | null = null
    try {
      const serverSupabase = await createServerClient()
      const {
        data: { user },
      } = await serverSupabase.auth.getUser()
      clientId = user?.id ?? null
    } catch {
      // Anonymous submission - no session cookie
    }

    // Validate input
    const validation = devisSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const data = validation.data

    // Call service
    const result = await processDevis(data, clientId)

    if (!result.success) {
      switch (result.code) {
        case 'duplicate':
          return NextResponse.json(
            {
              error:
                'Vous avez déjà soumis une demande similaire. Vérifiez votre email pour le suivi.',
            },
            { status: 409 }
          )
        case 'email_rate_limit':
          return NextResponse.json(
            { error: 'Vous avez atteint la limite de 5 demandes par jour. Réessayez demain.' },
            { status: 429 }
          )
        case 'db_error':
          return NextResponse.json(
            { error: "Erreur lors de l'enregistrement de votre demande. Veuillez réessayer." },
            { status: 500 }
          )
      }
    }

    // Audit 2026-04-25 (agent #3 SEO M1) : IndexNow trigger sur /api/devis
    // pour propager le lastmod des templates pSEO {services,devis,urgence,
    // avis,tarifs,rge}/{service}/{ville} dans les minutes qui suivent un
    // lead, au lieu d'attendre le cron 06h15. Fire-and-forget.
    if (result.success && data.service && data.ville) {
      const serviceSlug = slugify(data.service)
      const villeSlug = slugify(data.ville)
      if (serviceSlug && villeSlug) {
        const urls = getProviderAffectedUrls(serviceSlug, villeSlug)
        submitToIndexNow(urls).catch((err) =>
          logger.warn('[devis] IndexNow submit failed', {
            service: serviceSlug,
            ville: villeSlug,
            error: err,
          })
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Demande de devis envoyée avec succès',
      id: result.success ? result.id : undefined,
      artisans_notified: result.success ? result.artisans_notified : 0,
      ...(!result.success || !result.artisans_found ? { artisans_found: false } : {}),
      cee_eligible: result.success ? result.cee_eligible : false,
      ...(result.success && result.cee_eligible && result.cee_operation_codes
        ? { cee_operation_codes: result.cee_operation_codes }
        : {}),
    })
  } catch (error) {
    // Audit 2026-04-25 (agent #7 BLOCKER) : /api/devis = canal de conversion #1.
    // Toute 500 ici = lead perdu = revenue. Doit être visible en Sentry avec
    // tag `business_impact:lead_loss` pour saved search.
    logger.error('Devis API error', error)
    captureError(error, {
      tags: {
        route: 'api/devis',
        critical: 'true',
        business_impact: 'lead_loss',
      },
    })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
