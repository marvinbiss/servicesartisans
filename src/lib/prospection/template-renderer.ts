/**
 * Template Rendering Engine - Prospection
 * Substitution de variables {{variable}} dans les templates
 */

import type { ProspectionContact, ProspectionCampaign } from '@/types/prospection'

// Variables disponibles dans les templates
const CONTACT_VARIABLES: Record<string, (contact: ProspectionContact) => string> = {
  contact_name: (c) => c.contact_name || '',
  company_name: (c) => c.company_name || '',
  email: (c) => c.email || '',
  phone: (c) => c.phone || '',
  city: (c) => c.city || '',
  postal_code: (c) => c.postal_code || '',
  department: (c) => c.department || '',
  region: (c) => c.region || '',
  contact_type: (c) => c.contact_type,
  commune_code: (c) => c.commune_code || '',
}

const CAMPAIGN_VARIABLES: Record<string, (campaign: ProspectionCampaign) => string> = {
  campaign_name: (c) => c.name,
}

/**
 * Rend un template en substituant les {{variables}}
 */
export function renderTemplate(
  template: string,
  contact: ProspectionContact,
  campaign: ProspectionCampaign,
  customVars?: Record<string, string>
): string {
  let rendered = template

  // Substitution variables contact
  for (const [key, getter] of Object.entries(CONTACT_VARIABLES)) {
    rendered = rendered.replaceAll(`{{${key}}}`, getter(contact))
  }

  // Substitution variables campagne
  for (const [key, getter] of Object.entries(CAMPAIGN_VARIABLES)) {
    rendered = rendered.replaceAll(`{{${key}}}`, getter(campaign))
  }

  // Variables custom (champs personnalisés)
  if (customVars) {
    for (const [key, value] of Object.entries(customVars)) {
      rendered = rendered.replaceAll(`{{${key}}}`, value)
    }
  }

  // Custom fields du contact
  if (contact.custom_fields) {
    for (const [key, value] of Object.entries(contact.custom_fields)) {
      rendered = rendered.replaceAll(`{{custom_${key}}}`, String(value || ''))
    }
  }

  // Lien de désinscription
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'
  const unsubToken = Buffer.from(JSON.stringify({
    cid: contact.id,
    ch: campaign.channel,
    t: Date.now(),
  })).toString('base64url')
  rendered = rendered.replaceAll('{{unsubscribe_link}}', `${siteUrl}/api/prospection/unsubscribe?token=${unsubToken}`)

  // Date du jour
  rendered = rendered.replaceAll('{{date}}', new Date().toLocaleDateString('fr-FR'))

  return rendered
}

/**
 * Extrait les variables d'un template
 */
export function extractVariables(template: string): string[] {
  const matches = template.match(/\{\{(\w+)\}\}/g) || []
  return Array.from(new Set(matches.map(m => m.replace(/\{\{|\}\}/g, ''))))
}

/**
 * Valide qu'un template peut être rendu avec un contact
 */
export function validateTemplate(
  template: string,
  requiredVars?: string[]
): { valid: boolean; missing: string[] } {
  const vars = extractVariables(template)
  const allKnownVars = new Set([
    ...Object.keys(CONTACT_VARIABLES),
    ...Object.keys(CAMPAIGN_VARIABLES),
    'unsubscribe_link',
    'date',
  ])

  const missing = vars.filter(v =>
    !allKnownVars.has(v) && !v.startsWith('custom_')
  )

  const missingRequired = (requiredVars || []).filter(v => !vars.includes(v))

  return {
    valid: missing.length === 0 && missingRequired.length === 0,
    missing: [...missing, ...missingRequired],
  }
}

/**
 * Génère un aperçu avec des données fictives
 */
export function renderPreview(template: string): string {
  const sampleContact: ProspectionContact = {
    id: 'preview-id',
    contact_type: 'artisan',
    company_name: 'Plomberie Martin SARL',
    contact_name: 'Jean Martin',
    email: 'jean.martin@example.com',
    email_canonical: 'jean.martin@example.com',
    phone: '06 12 34 56 78',
    phone_e164: '+33612345678',
    address: '12 rue de la Paix',
    postal_code: '75001',
    city: 'Paris',
    department: '75',
    region: 'Île-de-France',
    commune_code: '75101',
    population: null,
    artisan_id: null,
    source: 'manual',
    source_file: null,
    source_row: null,
    tags: [],
    custom_fields: {},
    consent_status: 'unknown',
    opted_out_at: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const sampleCampaign = {
    id: 'preview-campaign',
    name: 'Campagne Test',
  } as ProspectionCampaign

  return renderTemplate(template, sampleContact, sampleCampaign)
}
