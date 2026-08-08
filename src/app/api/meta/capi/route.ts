/**
 * Pont navigateur → Meta Conversions API.
 *
 * Le client appelle cette route au moment où il déclenche le Pixel, avec le même
 * `event_id` : Meta déduplique, et l'événement survit si le Pixel est bloqué
 * (ATT iOS, bloqueurs de pub, ITP).
 *
 * Garde-fous :
 * - `consent: true` obligatoire (consentement marketing RGPD côté client)
 * - allowlist stricte des noms d'événements (pas d'événement arbitraire)
 * - rate limit par IP
 * - `custom_data` borné en nombre de clés et en longueur
 * - les PII ne sont jamais loggées, et sont hachées avant envoi (`@/lib/meta/hash`)
 *
 * Les conversions qui transitent déjà par une route métier (ex. `/api/artisan-lead`)
 * n'utilisent PAS ce pont : elles envoient l'événement serveur directement.
 */
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { rateLimit } from '@/lib/rate-limit'
import { getClientContext, sendMetaEvent, type MetaEventName } from '@/lib/meta/capi'

export const dynamic = 'force-dynamic'

/** Événements que le navigateur est autorisé à relayer. */
const ALLOWED_EVENTS = [
  'PageView',
  'ViewContent',
  'Lead',
  'CompleteRegistration',
  'Contact',
  'Schedule',
] as const satisfies readonly MetaEventName[]

const MAX_CUSTOM_DATA_KEYS = 12
const MAX_VALUE_LENGTH = 200

const customDataSchema = z
  .record(z.string().max(40), z.union([z.string().max(MAX_VALUE_LENGTH), z.number(), z.boolean()]))
  .refine((obj) => Object.keys(obj).length <= MAX_CUSTOM_DATA_KEYS, {
    message: 'custom_data trop volumineux',
  })
  .optional()

const bodySchema = z.object({
  eventName: z.enum(ALLOWED_EVENTS),
  eventId: z.string().min(8).max(64),
  eventSourceUrl: z.string().url().max(2048).optional(),
  /** Consentement marketing explicite — sans lui, rien n'est envoyé. */
  consent: z.literal(true),
  fbp: z.string().max(128).optional(),
  fbc: z.string().max(256).optional(),
  userData: z
    .object({
      email: z.string().max(254).optional(),
      phone: z.string().max(32).optional(),
      firstName: z.string().max(100).optional(),
      lastName: z.string().max(100).optional(),
      city: z.string().max(100).optional(),
      zip: z.string().max(10).optional(),
    })
    .optional(),
  customData: customDataSchema,
})

export async function POST(request: Request) {
  try {
    const { clientIpAddress, clientUserAgent } = getClientContext(request)

    const limit = rateLimit(`meta-capi:${clientIpAddress ?? 'unknown'}`, 60, 60_000)
    if (!limit.success) {
      return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })
    }

    const parsed = bodySchema.safeParse(await request.json())
    if (!parsed.success) {
      // On ne renvoie ni ne logge le corps : il peut contenir des données perso.
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }

    const data = parsed.data
    const result = await sendMetaEvent({
      eventName: data.eventName,
      eventId: data.eventId,
      eventSourceUrl: data.eventSourceUrl,
      actionSource: 'website',
      userData: {
        ...data.userData,
        country: 'fr',
        fbp: data.fbp,
        fbc: data.fbc,
        clientIpAddress,
        clientUserAgent,
      },
      customData: data.customData,
    })

    return NextResponse.json({ success: result.sent, reason: result.reason })
  } catch (error) {
    logger.error('Meta CAPI bridge error', {
      err: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
