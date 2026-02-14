/**
 * Lead Event -> Notification Processor (server-side only)
 *
 * Maps lead_events to transactional notifications (email + in-app).
 * Idempotent: uses notification_deliveries to prevent duplicates.
 * Based exclusively on lead_events (append-only source of truth).
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/api/resend-client'
import type { LeadEventType } from '@/lib/dashboard/events'
import { escapeHtml } from '@/lib/utils/html'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'
const SITE_NAME = 'ServicesArtisans'
const DEFAULT_FROM = 'ServicesArtisans <noreply@servicesartisans.fr>'

// ============================================================
// Types
// ============================================================

interface LeadEventPayload {
  id: string            // lead_events.id
  lead_id: string
  event_type: LeadEventType
  provider_id: string | null
  actor_id: string | null
  metadata: Record<string, unknown>
}

interface NotificationTarget {
  userId: string
  email: string | null
  name: string
  role: 'client' | 'artisan'
}

interface NotificationSpec {
  type: string
  title: string
  message: string
  link: string
  emailSubject: string
  emailHtml: string
  emailText: string
}

// ============================================================
// Event -> Notification mapping
// ============================================================

const EVENT_CONFIG: Record<string, {
  channels: ('email' | 'in_app')[]
  targetRoles: ('client' | 'artisan')[]
}> = {
  created:    { channels: ['email', 'in_app'], targetRoles: ['client'] },
  dispatched: { channels: ['email', 'in_app'], targetRoles: ['artisan'] },
  viewed:     { channels: ['in_app'],          targetRoles: ['client'] },
  quoted:     { channels: ['email', 'in_app'], targetRoles: ['client'] },
  completed:  { channels: ['email', 'in_app'], targetRoles: ['client', 'artisan'] },
  expired:    { channels: ['email', 'in_app'], targetRoles: ['client', 'artisan'] },
}

// ============================================================
// Main processor
// ============================================================

export async function processLeadEvent(event: LeadEventPayload): Promise<void> {
  const config = EVENT_CONFIG[event.event_type]
  if (!config) return // Not a notifiable event type

  const supabase = createAdminClient()

  // Resolve lead details (try devis_requests first, then leads table)
  let lead: LeadData & { client_email?: string; client_phone?: string; client_id?: string | null } | null = null

  const { data: devisLead } = await supabase
    .from('devis_requests')
    .select('id, service_name, city, postal_code, client_name, client_email, client_phone, client_id')
    .eq('id', event.lead_id)
    .single()

  if (devisLead) {
    lead = devisLead
  } else {
    // Fallback: try the leads table
    const { data: newLead } = await supabase
      .from('leads')
      .select('id, first_name, last_name, email, phone, project_city, project_postal_code, client_user_id')
      .eq('id', event.lead_id)
      .single()

    if (newLead) {
      lead = {
        id: newLead.id,
        service_name: (event.metadata.serviceName as string) || 'Service',
        city: newLead.project_city,
        postal_code: newLead.project_postal_code,
        client_name: [newLead.first_name, newLead.last_name].filter(Boolean).join(' '),
        client_email: newLead.email,
        client_phone: newLead.phone,
        client_id: newLead.client_user_id,
      }
    }
  }

  if (!lead) return

  // Build target list
  const targets: NotificationTarget[] = []

  if (config.targetRoles.includes('client') && lead.client_id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', lead.client_id)
      .single()

    if (profile) {
      targets.push({
        userId: profile.id,
        email: profile.email || lead.client_email,
        name: profile.full_name || lead.client_name,
        role: 'client',
      })
    }
  }

  if (config.targetRoles.includes('artisan') && event.provider_id) {
    const { data: provider } = await supabase
      .from('providers')
      .select('id, user_id, name, email')
      .eq('id', event.provider_id)
      .single()

    if (provider?.user_id) {
      targets.push({
        userId: provider.user_id,
        email: provider.email,
        name: provider.name,
        role: 'artisan',
      })
    }
  }

  // Process each target
  for (const target of targets) {
    const spec = buildNotificationSpec(event, lead, target)
    if (!spec) continue

    for (const channel of config.channels) {
      await deliverNotification(supabase, event.id, channel, target, spec)
    }
  }
}

// ============================================================
// Idempotent delivery
// ============================================================

async function deliverNotification(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  eventId: string,
  channel: 'email' | 'in_app',
  target: NotificationTarget,
  spec: NotificationSpec,
): Promise<void> {
  // Idempotency check: skip if already delivered
  const { data: existing } = await supabase
    .from('notification_deliveries')
    .select('id')
    .eq('event_id', eventId)
    .eq('channel', channel)
    .eq('recipient_id', target.userId)
    .maybeSingle()

  if (existing) return // Already processed

  let status: 'sent' | 'failed' = 'sent'
  let errorMessage: string | null = null

  try {
    if (channel === 'email' && target.email) {
      await sendEmail({
        to: target.email,
        from: DEFAULT_FROM,
        subject: spec.emailSubject,
        html: spec.emailHtml,
        text: spec.emailText,
        headers: {
          'List-Unsubscribe': `<mailto:unsubscribe@servicesartisans.fr?subject=unsubscribe>`,
        },
        tags: [
          { name: 'type', value: spec.type },
          { name: 'event_id', value: eventId },
        ],
      })
    } else if (channel === 'in_app') {
      await supabase.from('notifications').insert({
        user_id: target.userId,
        type: spec.type,
        title: spec.title,
        message: spec.message,
        link: spec.link,
        metadata: { event_id: eventId },
      })
    }
  } catch (err) {
    status = 'failed'
    errorMessage = err instanceof Error ? err.message : String(err)
    console.error(`Notification delivery failed [${channel}/${spec.type}]:`, errorMessage)
  }

  // Record delivery (idempotency key)
  await supabase.from('notification_deliveries').insert({
    event_id: eventId,
    channel,
    recipient_id: target.userId,
    status,
    error_message: errorMessage,
  }).catch(() => {
    // Unique constraint violation = already recorded by concurrent request
  })
}

// ============================================================
// Notification spec builders
// ============================================================

interface LeadData {
  id: string
  service_name: string
  city: string | null
  postal_code: string | null
  client_name: string
}

function buildNotificationSpec(
  event: LeadEventPayload,
  lead: LeadData,
  target: NotificationTarget,
): NotificationSpec | null {
  const safeServiceName = escapeHtml(lead.service_name)
  const safeClientName = escapeHtml(lead.client_name)
  const safeTargetName = escapeHtml(target.name)

  const rawLocation = lead.city
    ? `${lead.city}${lead.postal_code ? ` (${lead.postal_code})` : ''}`
    : lead.postal_code || ''
  const safeLocation = escapeHtml(rawLocation)

  switch (event.event_type) {
    case 'created':
      return {
        type: 'lead_created',
        title: 'Demande bien reçue',
        message: `Votre demande pour "${lead.service_name}" \u00e0 ${rawLocation} a \u00e9t\u00e9 enregistr\u00e9e. Nous recherchons les meilleurs artisans.`,
        link: '/espace-client/mes-demandes',
        emailSubject: `Demande re\u00e7ue \u2013 ${lead.service_name}`,
        emailHtml: emailTemplate({
          heading: 'Demande enregistr\u00e9e',
          color: '#2563eb',
          greeting: `Bonjour ${safeTargetName}`,
          body: `Votre demande de devis pour <strong>${safeServiceName}</strong> \u00e0 ${safeLocation} a bien \u00e9t\u00e9 enregistr\u00e9e. Nous allons contacter les artisans qualifi\u00e9s de votre zone.`,
          ctaUrl: `${SITE_URL}/espace-client/mes-demandes`,
          ctaLabel: 'Suivre ma demande',
          footer: 'Vous recevrez une notification d\u00e8s qu\'un artisan vous enverra un devis.',
        }),
        emailText: `Bonjour ${target.name},\n\nVotre demande de devis pour ${lead.service_name} \u00e0 ${rawLocation} a bien \u00e9t\u00e9 enregistr\u00e9e. Nous allons contacter les artisans qualifi\u00e9s de votre zone.\n\nSuivre ma demande : ${SITE_URL}/espace-client/mes-demandes\n\nVous recevrez une notification d\u00e8s qu'un artisan vous enverra un devis.\n\n${SITE_NAME} \u2014 La plateforme des artisans qualifi\u00e9s\ncontact@servicesartisans.fr`,
      }

    case 'dispatched':
      return {
        type: 'lead_dispatched',
        title: 'Nouveau lead re\u00e7u',
        message: `Demande de ${lead.client_name} pour "${lead.service_name}" \u00e0 ${rawLocation}.`,
        link: '/espace-artisan/leads',
        emailSubject: `Nouveau lead \u2013 ${lead.service_name} \u00e0 ${rawLocation}`,
        emailHtml: emailTemplate({
          heading: 'Nouveau lead disponible',
          color: '#059669',
          greeting: `Bonjour ${safeTargetName}`,
          body: `Vous avez re\u00e7u une nouvelle demande de <strong>${safeClientName}</strong> pour <strong>${safeServiceName}</strong> \u00e0 ${safeLocation}. Consultez-la et envoyez votre devis.`,
          ctaUrl: `${SITE_URL}/espace-artisan/leads`,
          ctaLabel: 'Voir le lead',
          footer: 'R\u00e9pondez rapidement pour maximiser vos chances.',
        }),
        emailText: `Bonjour ${target.name},\n\nVous avez re\u00e7u une nouvelle demande de ${lead.client_name} pour ${lead.service_name} \u00e0 ${rawLocation}. Consultez-la et envoyez votre devis.\n\nVoir le lead : ${SITE_URL}/espace-artisan/leads\n\nR\u00e9pondez rapidement pour maximiser vos chances.\n\n${SITE_NAME} \u2014 La plateforme des artisans qualifi\u00e9s\ncontact@servicesartisans.fr`,
      }

    case 'viewed':
      return {
        type: 'lead_viewed',
        title: 'Un artisan a consult\u00e9 votre demande',
        message: `Un artisan a pris connaissance de votre demande pour "${lead.service_name}".`,
        link: `/espace-client/mes-demandes/${lead.id}`,
        emailSubject: '',
        emailHtml: '',
        emailText: '',
      }

    case 'quoted': {
      const rawAmount = event.metadata.amount ? ` \u2013 ${event.metadata.amount} \u20ac` : ''
      const safeAmount = event.metadata.amount ? escapeHtml(String(event.metadata.amount)) : ''
      return {
        type: 'quote_received',
        title: 'Nouveau devis re\u00e7u',
        message: `Un artisan vous a envoy\u00e9 un devis pour "${lead.service_name}"${rawAmount}.`,
        link: `/espace-client/mes-demandes/${lead.id}`,
        emailSubject: `Devis re\u00e7u \u2013 ${lead.service_name}`,
        emailHtml: emailTemplate({
          heading: 'Vous avez re\u00e7u un devis',
          color: '#059669',
          greeting: `Bonjour ${safeTargetName}`,
          body: `Un artisan vous a envoy\u00e9 un devis pour <strong>${safeServiceName}</strong> \u00e0 ${safeLocation}${safeAmount ? `.<br><br>Montant propos\u00e9 : <strong>${safeAmount} \u20ac</strong>` : ''}.`,
          ctaUrl: `${SITE_URL}/espace-client/mes-demandes/${lead.id}`,
          ctaLabel: 'Voir le devis',
          footer: 'Consultez le d\u00e9tail et comparez les offres re\u00e7ues.',
        }),
        emailText: `Bonjour ${target.name},\n\nUn artisan vous a envoy\u00e9 un devis pour ${lead.service_name} \u00e0 ${rawLocation}${rawAmount}.\n\nVoir le devis : ${SITE_URL}/espace-client/mes-demandes/${lead.id}\n\nConsultez le d\u00e9tail et comparez les offres re\u00e7ues.\n\n${SITE_NAME} \u2014 La plateforme des artisans qualifi\u00e9s\ncontact@servicesartisans.fr`,
      }
    }

    case 'completed':
      if (target.role === 'client') {
        return {
          type: 'lead_closed',
          title: 'Mission termin\u00e9e',
          message: `La mission pour "${lead.service_name}" est termin\u00e9e. Merci de votre confiance !`,
          link: `/espace-client/mes-demandes/${lead.id}`,
          emailSubject: `Mission termin\u00e9e \u2013 ${lead.service_name}`,
          emailHtml: emailTemplate({
            heading: 'Mission termin\u00e9e',
            color: '#059669',
            greeting: `Bonjour ${safeTargetName}`,
            body: `La mission pour <strong>${safeServiceName}</strong> \u00e0 ${safeLocation} est termin\u00e9e. Merci de votre confiance !`,
            ctaUrl: `${SITE_URL}/espace-client/mes-demandes/${lead.id}`,
            ctaLabel: 'Voir le d\u00e9tail',
            footer: 'N\'h\u00e9sitez pas \u00e0 laisser un avis pour aider d\'autres clients.',
          }),
          emailText: `Bonjour ${target.name},\n\nLa mission pour ${lead.service_name} \u00e0 ${rawLocation} est termin\u00e9e. Merci de votre confiance !\n\nVoir le d\u00e9tail : ${SITE_URL}/espace-client/mes-demandes/${lead.id}\n\nN'h\u00e9sitez pas \u00e0 laisser un avis pour aider d'autres clients.\n\n${SITE_NAME} \u2014 La plateforme des artisans qualifi\u00e9s\ncontact@servicesartisans.fr`,
        }
      }
      return {
        type: 'lead_closed',
        title: 'Mission termin\u00e9e',
        message: `La mission "${lead.service_name}" pour ${lead.client_name} est termin\u00e9e.`,
        link: '/espace-artisan/leads',
        emailSubject: `Mission termin\u00e9e \u2013 ${lead.service_name}`,
        emailHtml: emailTemplate({
          heading: 'Mission termin\u00e9e',
          color: '#059669',
          greeting: `Bonjour ${safeTargetName}`,
          body: `La mission <strong>${safeServiceName}</strong> pour ${safeClientName} est termin\u00e9e. Bravo !`,
          ctaUrl: `${SITE_URL}/espace-artisan/leads`,
          ctaLabel: 'Voir mes leads',
          footer: '',
        }),
        emailText: `Bonjour ${target.name},\n\nLa mission ${lead.service_name} pour ${lead.client_name} est termin\u00e9e. Bravo !\n\nVoir mes leads : ${SITE_URL}/espace-artisan/leads\n\n${SITE_NAME} \u2014 La plateforme des artisans qualifi\u00e9s\ncontact@servicesartisans.fr`,
      }

    case 'expired':
      if (target.role === 'client') {
        return {
          type: 'lead_closed',
          title: 'Demande expir\u00e9e',
          message: `Votre demande pour "${lead.service_name}" a expir\u00e9 sans r\u00e9ponse.`,
          link: `/espace-client/mes-demandes/${lead.id}`,
          emailSubject: `Demande expir\u00e9e \u2013 ${lead.service_name}`,
          emailHtml: emailTemplate({
            heading: 'Demande expir\u00e9e',
            color: '#d97706',
            greeting: `Bonjour ${safeTargetName}`,
            body: `Votre demande pour <strong>${safeServiceName}</strong> \u00e0 ${safeLocation} a expir\u00e9. Vous pouvez en cr\u00e9er une nouvelle \u00e0 tout moment.`,
            ctaUrl: `${SITE_URL}/espace-client/mes-demandes`,
            ctaLabel: 'Mes demandes',
            footer: '',
          }),
          emailText: `Bonjour ${target.name},\n\nVotre demande pour ${lead.service_name} \u00e0 ${rawLocation} a expir\u00e9. Vous pouvez en cr\u00e9er une nouvelle \u00e0 tout moment.\n\nMes demandes : ${SITE_URL}/espace-client/mes-demandes\n\n${SITE_NAME} \u2014 La plateforme des artisans qualifi\u00e9s\ncontact@servicesartisans.fr`,
        }
      }
      return {
        type: 'lead_closed',
        title: 'Lead expir\u00e9',
        message: `Le lead "${lead.service_name}" de ${lead.client_name} a expir\u00e9.`,
        link: '/espace-artisan/leads',
        emailSubject: `Lead expir\u00e9 \u2013 ${lead.service_name}`,
        emailHtml: emailTemplate({
          heading: 'Lead expir\u00e9',
          color: '#d97706',
          greeting: `Bonjour ${safeTargetName}`,
          body: `Le lead <strong>${safeServiceName}</strong> de ${safeClientName} a expir\u00e9.`,
          ctaUrl: `${SITE_URL}/espace-artisan/leads`,
          ctaLabel: 'Voir mes leads',
          footer: '',
        }),
        emailText: `Bonjour ${target.name},\n\nLe lead ${lead.service_name} de ${lead.client_name} a expir\u00e9.\n\nVoir mes leads : ${SITE_URL}/espace-artisan/leads\n\n${SITE_NAME} \u2014 La plateforme des artisans qualifi\u00e9s\ncontact@servicesartisans.fr`,
      }

    default:
      return null
  }
}

// ============================================================
// Email template
// ============================================================

function emailTemplate(opts: {
  heading: string
  color: string
  greeting: string
  body: string
  ctaUrl: string
  ctaLabel: string
  footer: string
}): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: ${opts.color}; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 22px;">${opts.heading}</h1>
    </div>
    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <p style="color: #333; font-size: 16px; margin-bottom: 16px;">${opts.greeting},</p>
      <p style="color: #555; font-size: 15px; line-height: 1.6;">${opts.body}</p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${opts.ctaUrl}" style="display: inline-block; background: ${opts.color}; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">${opts.ctaLabel}</a>
      </div>
      ${opts.footer ? `<p style="color: #888; font-size: 13px; line-height: 1.5;">${opts.footer}</p>` : ''}
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
      <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
        ${SITE_NAME} \u2014 La plateforme des artisans qualifi\u00e9s<br>
        contact@servicesartisans.fr<br>
        <a href="https://servicesartisans.fr/confidentialite" style="color: #999;">Politique de confidentialit\u00e9</a>
      </p>
    </div>
  </div>
</body>
</html>`
}
