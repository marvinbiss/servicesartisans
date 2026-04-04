/**
 * Devis API - ServicesArtisans
 * Handles quote request submissions
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { getResendClient } from '@/lib/api/resend-client'
import { z } from 'zod'
import { cleanPhone } from '@/lib/validation/phone'
import { dispatchLead } from '@/app/actions/dispatch'
import { logLeadEvent } from '@/lib/dashboard/events'

export const dynamic = 'force-dynamic'

/** Escape HTML special chars to prevent XSS in email templates */
function htmlEscape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const getResend = () => getResendClient()


const devisSchema = z.object({
  service: z.string().min(1, 'Veuillez sélectionner un service'),
  urgency: z.string().min(1, 'Veuillez sélectionner l\'urgence'),
  budget: z.string().max(20).optional(),
  description: z.string().optional(),
  codePostal: z.string().optional(),
  ville: z.string().optional(),
  nom: z.string().min(2, 'Le nom est requis').optional().or(z.literal('')),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  telephone: z.string().transform(cleanPhone).pipe(
    z.string().min(10, 'Numéro de téléphone invalide').regex(/^(\+33|0033|0)[1-9]\d{8}$/, 'Format de téléphone français invalide')
  ),
})

const serviceNames: Record<string, string> = {
  plombier: 'Plombier',
  electricien: 'Électricien',
  serrurier: 'Serrurier',
  chauffagiste: 'Chauffagiste',
  'peintre-en-batiment': 'Peintre en bâtiment',
  couvreur: 'Couvreur',
  menuisier: 'Menuisier',
  macon: 'Maçon',
  carreleur: 'Carreleur',
  jardinier: 'Jardinier-paysagiste',
  vitrier: 'Vitrier',
  climaticien: 'Climaticien',
  cuisiniste: 'Cuisiniste',
  solier: 'Solier-moquettiste',
  nettoyage: 'Nettoyage professionnel',
  general: 'Demande générale',
}

/** Resolve a human-readable service name, with fallback for unknown slugs */
function resolveServiceName(service: string): string {
  return serviceNames[service] || service.charAt(0).toUpperCase() + service.slice(1).replace(/-/g, ' ')
}

const urgencyLabels: Record<string, string> = {
  urgent: 'Urgent',
  semaine: 'Cette semaine',
  mois: 'Ce mois-ci',
  flexible: 'Pas urgent',
}


export async function POST(request: Request) {
  try {
    // Rate limiting (public endpoint — 10 requests per minute per IP)
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`devis:${ip}`, { window: 60_000, max: 10 })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Trop de requêtes, veuillez réessayer plus tard' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetTime - Date.now()) / 1000)) } }
      )
    }

    const supabase = createAdminClient()
    const body = await request.json()

    // Resolve authenticated user if present (null for anonymous submissions)
    let clientId: string | null = null
    try {
      const serverSupabase = await createServerClient()
      const { data: { user } } = await serverSupabase.auth.getUser()
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

    // Map urgency to devis_requests CHECK values
    // DB constraint: ('normal', 'urgent', 'tres_urgent', 'semaine', 'mois', 'flexible')
    // See migration 361_devis_urgency_values.sql
    const urgencyDbMap: Record<string, string> = {
      urgent: 'urgent',
      semaine: 'semaine',
      mois: 'mois',
      flexible: 'flexible',
    }

    // Vérifier doublon (même email + service + ville dans la dernière heure)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const serviceName = resolveServiceName(data.service)
    const { data: existing } = await supabase
      .from('devis_requests')
      .select('id')
      .eq('client_email', data.email || '')
      .eq('service_name', serviceName)
      .eq('city', data.ville || '')
      .gte('created_at', oneHourAgo)
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'Vous avez déjà soumis une demande similaire. Vérifiez votre email pour le suivi.' },
        { status: 409 }
      )
    }

    // Rate limiting per email — max 5 requests per 24h
    if (data.email) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { count } = await supabase
        .from('devis_requests')
        .select('id', { count: 'exact', head: true })
        .eq('client_email', data.email)
        .gte('created_at', oneDayAgo)

      if (count !== null && count >= 5) {
        return NextResponse.json(
          { error: 'Vous avez atteint la limite de 5 demandes par jour. Réessayez demain.' },
          { status: 429 }
        )
      }
    }

    // Store in devis_requests table
    const { data: lead, error: dbError } = await supabase
      .from('devis_requests')
      .insert({
        client_id: clientId,
        client_name: data.nom || 'Rappel',
        client_email: data.email || '',
        client_phone: data.telephone,
        service_name: serviceName,
        description: data.description || 'Demande de devis',
        budget: data.budget || null,
        urgency: urgencyDbMap[data.urgency] || 'normal',
        city: data.ville || null,
        postal_code: data.codePostal || '',
        status: 'pending',
      })
      .select()
      .single()

    if (dbError) {
      logger.error('Database error', dbError)
      return NextResponse.json(
        { error: 'Erreur lors de l\'enregistrement de votre demande. Veuillez réessayer.' },
        { status: 500 }
      )
    }

    // Log 'created' event - triggers "Demande bien reçue" notification to client
    if (lead) {
      logLeadEvent(lead.id, 'created', { actorId: clientId ?? undefined }).catch((err) => logger.error('Failed to log lead created event', err))
    }

    // Dispatch to eligible artisans
    let assignedProviders: string[] = []
    if (lead) {
      const urgencyMap: Record<string, string> = {
        urgent: 'urgent',
        semaine: 'semaine',
        mois: 'mois',
        flexible: 'flexible',
      }
      assignedProviders = await dispatchLead(lead.id, {
        serviceName: serviceName,
        city: data.ville,
        postalCode: data.codePostal,
        urgency: urgencyMap[data.urgency] || 'normal',
        sourceTable: 'devis_requests',
      }).catch((err) => {
        logger.error('Failed to dispatch lead', err)
        return []
      })
      if (assignedProviders.length > 0) {
        logLeadEvent(lead.id, 'dispatched', { metadata: { count: assignedProviders.length } }).catch((err) => logger.error('Failed to log lead dispatched event', err))
        // Log devis_completed analytics event (server-side)
        supabase.from('analytics_events').insert({
          event_type: 'devis_completed',
          metadata: { devisId: lead.id, serviceSlug: data.service, city: data.ville, artisanCount: assignedProviders.length },
        }).then(({ error: analyticsErr }) => {
          if (analyticsErr) logger.error('Failed to log devis_completed event', analyticsErr)
        })
      }
    }

    // Send both confirmation emails in parallel (use allSettled so one failure doesn't block the other)
    let resend: ReturnType<typeof getResend> | null = null
    try {
      resend = getResend()
    } catch (emailInitError) {
      logger.error('Resend not configured, skipping emails', emailInitError)
    }
    const fromEmail = process.env.FROM_EMAIL || 'noreply@servicesartisans.fr'

    const emailPromises: Promise<unknown>[] = []

    // Confirmation to client (only if email provided)
    if (resend && data.email) {
      emailPromises.push(
        resend.emails.send({
          from: fromEmail,
          to: data.email,
          subject: 'Votre demande de devis - ServicesArtisans',
          html: `
            <h2>Bonjour ${htmlEscape(data.nom || 'Rappel')},</h2>
            <p>Nous avons bien reçu votre demande de devis. Voici le récapitulatif :</p>
            <ul>
              <li><strong>Service :</strong> ${htmlEscape(resolveServiceName(data.service))}</li>
              <li><strong>Délai :</strong> ${htmlEscape(urgencyLabels[data.urgency] || data.urgency)}</li>
              ${data.ville ? `<li><strong>Ville :</strong> ${htmlEscape(data.ville)}</li>` : ''}
              ${data.description ? `<li><strong>Description :</strong> ${htmlEscape(data.description)}</li>` : ''}
            </ul>
            <p><strong>Que se passe-t-il maintenant ?</strong></p>
            <p>Nous allons transmettre votre demande aux artisans disponibles dans votre région. Un conseiller vous rappelle rapidement.</p>
            <p>Cordialement,<br />L'équipe ServicesArtisans</p>
            <p style="color: #666; font-size: 12px;">
              <a href="https://servicesartisans.fr">servicesartisans.fr</a>
            </p>
          `,
        })
      )
    }

    // Notification to admin
    if (resend) emailPromises.push(
      resend.emails.send({
        from: fromEmail,
        to: 'contact@servicesartisans.fr',
        subject: `[Nouveau Devis] ${resolveServiceName(data.service)} - ${data.ville || 'France'}`,
        html: `
          <h2>Nouvelle demande de devis</h2>
          <h3>Client</h3>
          <ul>
            <li><strong>Nom :</strong> ${htmlEscape(data.nom || 'Rappel')}</li>
            <li><strong>Email :</strong> ${htmlEscape(data.email || 'Non fourni')}</li>
            <li><strong>Téléphone :</strong> ${htmlEscape(data.telephone)}</li>
          </ul>
          <h3>Demande</h3>
          <ul>
            <li><strong>Service :</strong> ${htmlEscape(resolveServiceName(data.service))}</li>
            <li><strong>Délai :</strong> ${htmlEscape(urgencyLabels[data.urgency] || data.urgency)}</li>
            <li><strong>Ville :</strong> ${htmlEscape(data.ville || 'Non précisé')}</li>
            <li><strong>Code postal :</strong> ${htmlEscape(data.codePostal || 'Non précisé')}</li>
            <li><strong>Budget :</strong> ${htmlEscape(data.budget || 'Non précisé')}</li>
            <li><strong>Description :</strong> ${htmlEscape(data.description || 'Non précisé')}</li>
          </ul>
          ${lead ? `<p>ID: ${lead.id}</p>` : ''}
        `,
      })
    )

    const emailResults = await Promise.allSettled(emailPromises)

    // Log any email failures (devis is already saved in DB, so we still return success)
    emailResults.forEach((result, i) => {
      if (result.status === 'rejected') {
        logger.error(`Failed to send email ${i}`, result.reason)
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Demande de devis envoyée avec succès',
      id: lead?.id,
      artisans_notified: assignedProviders.length,
      ...(assignedProviders.length === 0 && { artisans_found: false }),
    })
  } catch (error) {
    logger.error('Devis API error', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
