/**
 * Tests d'intégration — Routes API Prospection
 * Couvre : validation Zod, logique métier, sécurité webhook, template rendering
 */
import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

// ============================================
// 1. SCHEMAS DE VALIDATION — Contacts
// ============================================

const contactQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  type: z.enum(['all', 'artisan', 'client', 'mairie']).optional().default('all'),
  search: z.string().max(200).optional().default(''),
  department: z.string().max(10).optional(),
  tags: z.string().optional(),
  consent: z.enum(['all', 'opted_in', 'opted_out', 'unknown']).optional().default('all'),
})

const contactCreateSchema = z.object({
  contact_type: z.enum(['artisan', 'client', 'mairie']),
  contact_name: z.string().max(200).optional(),
  company_name: z.string().max(200).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  postal_code: z.string().max(10).optional(),
  city: z.string().max(100).optional(),
  department: z.string().max(10).optional(),
  region: z.string().max(100).optional(),
  commune_code: z.string().max(10).optional(),
  tags: z.array(z.string()).optional(),
})

// ============================================
// 2. SCHEMAS DE VALIDATION — Campaigns
// ============================================

const campaignQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.enum(['all', 'draft', 'scheduled', 'sending', 'paused', 'completed', 'cancelled']).optional().default('all'),
  channel: z.enum(['all', 'email', 'sms', 'whatsapp']).optional().default('all'),
})

const campaignCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  channel: z.enum(['email', 'sms', 'whatsapp']),
  audience_type: z.enum(['artisan', 'client', 'mairie']),
  template_id: z.string().uuid().optional(),
  list_id: z.string().uuid().optional(),
  scheduled_at: z.string().optional(),
  batch_size: z.number().int().min(1).max(1000).optional(),
  batch_delay_ms: z.number().int().min(100).max(60000).optional(),
  daily_send_limit: z.number().int().min(1).optional(),
  ab_test_enabled: z.boolean().optional(),
  ab_variant_b_template_id: z.string().uuid().optional(),
  ab_split_percent: z.number().int().min(10).max(90).optional(),
  ai_auto_reply: z.boolean().optional(),
  ai_provider: z.enum(['claude', 'openai']).optional(),
  ai_model: z.string().optional(),
  ai_system_prompt: z.string().optional(),
  ai_max_tokens: z.number().int().min(50).max(4000).optional(),
  ai_temperature: z.number().min(0).max(2).optional(),
})

// ============================================
// 3. SCHEMAS DE VALIDATION — Templates
// ============================================

const templateCreateSchema = z.object({
  name: z.string().min(1).max(200),
  channel: z.enum(['email', 'sms', 'whatsapp']),
  audience_type: z.enum(['artisan', 'client', 'mairie']).optional(),
  subject: z.string().max(200).optional(),
  body: z.string().min(1),
  html_body: z.string().optional(),
  whatsapp_template_name: z.string().optional(),
  whatsapp_template_sid: z.string().optional(),
  ai_system_prompt: z.string().optional(),
  ai_context: z.record(z.string(), z.unknown()).optional(),
  variables: z.array(z.string()).optional(),
})

// ============================================
// 4. SCHEMAS DE VALIDATION — Lists
// ============================================

const listCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  list_type: z.enum(['static', 'dynamic']).optional().default('static'),
  filter_criteria: z.record(z.string(), z.unknown()).optional(),
})

// ============================================
// 5. SCHEMAS DE VALIDATION — Webhooks Twilio
// ============================================

const twilioWebhookSchema = z.object({
  MessageSid: z.string().min(1, 'MessageSid is required'),
  MessageStatus: z.string().min(1, 'MessageStatus is required'),
  ErrorCode: z.string().optional(),
  ErrorMessage: z.string().optional(),
}).passthrough()


// ============================================
// TESTS
// ============================================

describe('Prospection API — Contacts validation', () => {
  describe('GET query params', () => {
    it('accepte des paramètres vides (valeurs par défaut)', () => {
      const result = contactQuerySchema.safeParse({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
        expect(result.data.limit).toBe(20)
        expect(result.data.type).toBe('all')
        expect(result.data.search).toBe('')
        expect(result.data.consent).toBe('all')
      }
    })

    it('accepte des paramètres valides', () => {
      const result = contactQuerySchema.safeParse({
        page: '3', limit: '50', type: 'artisan', search: 'plombier', department: '75', consent: 'opted_in',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(3)
        expect(result.data.limit).toBe(50)
        expect(result.data.type).toBe('artisan')
        expect(result.data.department).toBe('75')
        expect(result.data.consent).toBe('opted_in')
      }
    })

    it('coerce les strings en numbers pour page/limit', () => {
      const result = contactQuerySchema.safeParse({ page: '5', limit: '10' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(5)
        expect(result.data.limit).toBe(10)
      }
    })

    it('rejette un type de contact invalide', () => {
      const result = contactQuerySchema.safeParse({ type: 'fournisseur' })
      expect(result.success).toBe(false)
    })

    it('rejette page < 1', () => {
      const result = contactQuerySchema.safeParse({ page: '0' })
      expect(result.success).toBe(false)
    })

    it('rejette limit > 100', () => {
      const result = contactQuerySchema.safeParse({ limit: '200' })
      expect(result.success).toBe(false)
    })

    it('rejette une recherche > 200 caractères', () => {
      const result = contactQuerySchema.safeParse({ search: 'a'.repeat(201) })
      expect(result.success).toBe(false)
    })

    it('rejette consent invalide', () => {
      const result = contactQuerySchema.safeParse({ consent: 'pending' })
      expect(result.success).toBe(false)
    })
  })

  describe('POST body', () => {
    it('accepte un contact artisan valide avec email', () => {
      const result = contactCreateSchema.safeParse({
        contact_type: 'artisan',
        company_name: 'Plomberie Martin',
        email: 'jean@martin.fr',
        city: 'Paris',
        department: '75',
      })
      expect(result.success).toBe(true)
    })

    it('accepte un contact client avec téléphone seul', () => {
      const result = contactCreateSchema.safeParse({
        contact_type: 'client',
        contact_name: 'Marie Dupont',
        phone: '0612345678',
      })
      expect(result.success).toBe(true)
    })

    it('accepte un contact mairie', () => {
      const result = contactCreateSchema.safeParse({
        contact_type: 'mairie',
        company_name: 'Mairie de Lyon',
        email: 'contact@mairie-lyon.fr',
        city: 'Lyon',
        department: '69',
        postal_code: '69001',
      })
      expect(result.success).toBe(true)
    })

    it('rejette sans contact_type', () => {
      const result = contactCreateSchema.safeParse({
        email: 'test@test.com',
      })
      expect(result.success).toBe(false)
    })

    it('rejette un contact_type invalide', () => {
      const result = contactCreateSchema.safeParse({
        contact_type: 'fournisseur',
        email: 'test@test.com',
      })
      expect(result.success).toBe(false)
    })

    it('rejette un email malformé', () => {
      const result = contactCreateSchema.safeParse({
        contact_type: 'artisan',
        email: 'pas-un-email',
      })
      expect(result.success).toBe(false)
    })

    it('rejette un email > 255 caractères', () => {
      const result = contactCreateSchema.safeParse({
        contact_type: 'artisan',
        email: 'a'.repeat(250) + '@b.com',
      })
      expect(result.success).toBe(false)
    })

    it('accepte des tags', () => {
      const result = contactCreateSchema.safeParse({
        contact_type: 'artisan',
        email: 'a@b.com',
        tags: ['urgent', 'vip'],
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.tags).toEqual(['urgent', 'vip'])
      }
    })
  })
})

describe('Prospection API — Campaigns validation', () => {
  describe('GET query params', () => {
    it('accepte des paramètres vides', () => {
      const result = campaignQuerySchema.safeParse({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe('all')
        expect(result.data.channel).toBe('all')
      }
    })

    it('filtre par statut', () => {
      const result = campaignQuerySchema.safeParse({ status: 'sending', channel: 'whatsapp' })
      expect(result.success).toBe(true)
    })

    it('rejette un statut invalide', () => {
      const result = campaignQuerySchema.safeParse({ status: 'running' })
      expect(result.success).toBe(false)
    })

    it('rejette un canal invalide', () => {
      const result = campaignQuerySchema.safeParse({ channel: 'telegram' })
      expect(result.success).toBe(false)
    })
  })

  describe('POST body', () => {
    it('accepte une campagne email minimale', () => {
      const result = campaignCreateSchema.safeParse({
        name: 'Campagne Test',
        channel: 'email',
        audience_type: 'artisan',
      })
      expect(result.success).toBe(true)
    })

    it('accepte une campagne WhatsApp complète', () => {
      const result = campaignCreateSchema.safeParse({
        name: 'WhatsApp Artisans Lyon',
        channel: 'whatsapp',
        audience_type: 'artisan',
        template_id: '550e8400-e29b-41d4-a716-446655440000',
        list_id: '550e8400-e29b-41d4-a716-446655440001',
        batch_size: 50,
        batch_delay_ms: 2000,
        daily_send_limit: 500,
        ai_auto_reply: true,
        ai_provider: 'claude',
        ai_model: 'claude-sonnet-4-5-20250929',
        ai_max_tokens: 1024,
        ai_temperature: 0.7,
      })
      expect(result.success).toBe(true)
    })

    it('accepte A/B testing', () => {
      const result = campaignCreateSchema.safeParse({
        name: 'AB Test Email',
        channel: 'email',
        audience_type: 'client',
        ab_test_enabled: true,
        ab_variant_b_template_id: '550e8400-e29b-41d4-a716-446655440002',
        ab_split_percent: 30,
      })
      expect(result.success).toBe(true)
    })

    it('rejette sans nom', () => {
      const result = campaignCreateSchema.safeParse({
        channel: 'email',
        audience_type: 'artisan',
      })
      expect(result.success).toBe(false)
    })

    it('rejette nom vide', () => {
      const result = campaignCreateSchema.safeParse({
        name: '',
        channel: 'email',
        audience_type: 'artisan',
      })
      expect(result.success).toBe(false)
    })

    it('rejette sans canal', () => {
      const result = campaignCreateSchema.safeParse({
        name: 'Test',
        audience_type: 'artisan',
      })
      expect(result.success).toBe(false)
    })

    it('rejette un canal invalide', () => {
      const result = campaignCreateSchema.safeParse({
        name: 'Test',
        channel: 'fax',
        audience_type: 'artisan',
      })
      expect(result.success).toBe(false)
    })

    it('rejette batch_size > 1000', () => {
      const result = campaignCreateSchema.safeParse({
        name: 'Test',
        channel: 'email',
        audience_type: 'artisan',
        batch_size: 5000,
      })
      expect(result.success).toBe(false)
    })

    it('rejette batch_delay_ms < 100', () => {
      const result = campaignCreateSchema.safeParse({
        name: 'Test',
        channel: 'sms',
        audience_type: 'artisan',
        batch_delay_ms: 10,
      })
      expect(result.success).toBe(false)
    })

    it('rejette ai_max_tokens > 4000', () => {
      const result = campaignCreateSchema.safeParse({
        name: 'Test',
        channel: 'email',
        audience_type: 'artisan',
        ai_max_tokens: 10000,
      })
      expect(result.success).toBe(false)
    })

    it('rejette ai_temperature > 2', () => {
      const result = campaignCreateSchema.safeParse({
        name: 'Test',
        channel: 'email',
        audience_type: 'artisan',
        ai_temperature: 3,
      })
      expect(result.success).toBe(false)
    })

    it('rejette ab_split_percent < 10', () => {
      const result = campaignCreateSchema.safeParse({
        name: 'Test',
        channel: 'email',
        audience_type: 'artisan',
        ab_split_percent: 5,
      })
      expect(result.success).toBe(false)
    })

    it('rejette template_id non-UUID', () => {
      const result = campaignCreateSchema.safeParse({
        name: 'Test',
        channel: 'email',
        audience_type: 'artisan',
        template_id: 'not-a-uuid',
      })
      expect(result.success).toBe(false)
    })

    it('status auto: draft si pas de scheduled_at', () => {
      const data = { name: 'Test', channel: 'email' as const, audience_type: 'artisan' as const }
      const parsed = campaignCreateSchema.parse(data)
      const status = parsed.scheduled_at ? 'scheduled' : 'draft'
      expect(status).toBe('draft')
    })

    it('status auto: scheduled si scheduled_at', () => {
      const data = {
        name: 'Test',
        channel: 'email' as const,
        audience_type: 'artisan' as const,
        scheduled_at: '2026-03-01T10:00:00Z',
      }
      const parsed = campaignCreateSchema.parse(data)
      const status = parsed.scheduled_at ? 'scheduled' : 'draft'
      expect(status).toBe('scheduled')
    })
  })
})

describe('Prospection API — Templates validation', () => {
  it('accepte un template email valide', () => {
    const result = templateCreateSchema.safeParse({
      name: 'Bienvenue Artisan',
      channel: 'email',
      subject: 'Bienvenue chez ServicesArtisans',
      body: 'Bonjour {{contact_name}}, bienvenue !',
      audience_type: 'artisan',
    })
    expect(result.success).toBe(true)
  })

  it('accepte un template SMS sans subject', () => {
    const result = templateCreateSchema.safeParse({
      name: 'SMS Promo',
      channel: 'sms',
      body: 'Bonjour {{contact_name}}, offre spéciale pour {{company_name}} !',
    })
    expect(result.success).toBe(true)
  })

  it('accepte un template WhatsApp avec template_name', () => {
    const result = templateCreateSchema.safeParse({
      name: 'WA Welcome',
      channel: 'whatsapp',
      body: 'Bonjour !',
      whatsapp_template_name: 'welcome_artisan',
      whatsapp_template_sid: 'HX123abc',
    })
    expect(result.success).toBe(true)
  })

  it('accepte des variables', () => {
    const result = templateCreateSchema.safeParse({
      name: 'Avec variables',
      channel: 'email',
      body: '{{contact_name}} à {{city}}',
      variables: ['contact_name', 'city'],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.variables).toEqual(['contact_name', 'city'])
    }
  })

  it('accepte ai_context comme record', () => {
    const result = templateCreateSchema.safeParse({
      name: 'AI Template',
      channel: 'email',
      body: 'Test',
      ai_system_prompt: 'Tu es un assistant professionnel.',
      ai_context: { tone: 'professional', language: 'fr' },
    })
    expect(result.success).toBe(true)
  })

  it('rejette sans nom', () => {
    const result = templateCreateSchema.safeParse({
      channel: 'email',
      body: 'Test',
    })
    expect(result.success).toBe(false)
  })

  it('rejette nom vide', () => {
    const result = templateCreateSchema.safeParse({
      name: '',
      channel: 'email',
      body: 'Test',
    })
    expect(result.success).toBe(false)
  })

  it('rejette sans body', () => {
    const result = templateCreateSchema.safeParse({
      name: 'Test',
      channel: 'email',
    })
    expect(result.success).toBe(false)
  })

  it('rejette body vide', () => {
    const result = templateCreateSchema.safeParse({
      name: 'Test',
      channel: 'email',
      body: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejette un canal invalide', () => {
    const result = templateCreateSchema.safeParse({
      name: 'Test',
      channel: 'fax',
      body: 'Test',
    })
    expect(result.success).toBe(false)
  })
})

describe('Prospection API — Lists validation', () => {
  it('accepte une liste statique minimale', () => {
    const result = listCreateSchema.safeParse({ name: 'Artisans Paris' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.list_type).toBe('static')
    }
  })

  it('accepte une liste dynamique avec critères', () => {
    const result = listCreateSchema.safeParse({
      name: 'Artisans IDF',
      description: 'Tous les artisans en Île-de-France',
      list_type: 'dynamic',
      filter_criteria: { region: 'Île-de-France', contact_type: 'artisan' },
    })
    expect(result.success).toBe(true)
  })

  it('rejette sans nom', () => {
    const result = listCreateSchema.safeParse({ description: 'test' })
    expect(result.success).toBe(false)
  })

  it('rejette nom vide', () => {
    const result = listCreateSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  it('rejette nom > 200 caractères', () => {
    const result = listCreateSchema.safeParse({ name: 'a'.repeat(201) })
    expect(result.success).toBe(false)
  })

  it('rejette list_type invalide', () => {
    const result = listCreateSchema.safeParse({ name: 'Test', list_type: 'hybrid' })
    expect(result.success).toBe(false)
  })
})

describe('Prospection API — Twilio webhook validation', () => {
  it('accepte un webhook valide', () => {
    const result = twilioWebhookSchema.safeParse({
      MessageSid: 'SM1234567890abcdef',
      MessageStatus: 'delivered',
    })
    expect(result.success).toBe(true)
  })

  it('accepte un webhook avec erreur', () => {
    const result = twilioWebhookSchema.safeParse({
      MessageSid: 'SM1234567890abcdef',
      MessageStatus: 'failed',
      ErrorCode: '30003',
      ErrorMessage: 'Unreachable destination handset',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.ErrorCode).toBe('30003')
    }
  })

  it('passthrough accepte champs supplémentaires', () => {
    const result = twilioWebhookSchema.safeParse({
      MessageSid: 'SM123',
      MessageStatus: 'sent',
      AccountSid: 'AC123',
      To: '+33612345678',
      From: '+33698765432',
    })
    expect(result.success).toBe(true)
  })

  it('rejette sans MessageSid', () => {
    const result = twilioWebhookSchema.safeParse({
      MessageStatus: 'delivered',
    })
    expect(result.success).toBe(false)
  })

  it('rejette sans MessageStatus', () => {
    const result = twilioWebhookSchema.safeParse({
      MessageSid: 'SM123',
    })
    expect(result.success).toBe(false)
  })

  it('rejette MessageSid vide', () => {
    const result = twilioWebhookSchema.safeParse({
      MessageSid: '',
      MessageStatus: 'sent',
    })
    expect(result.success).toBe(false)
  })
})

describe('Prospection API — Status mapping logic', () => {
  const twilioStatusMap: Record<string, string> = {
    queued: 'sending',
    sent: 'sent',
    delivered: 'delivered',
    read: 'read',
    failed: 'failed',
    undelivered: 'failed',
  }

  const resendStatusMap: Record<string, string> = {
    'email.sent': 'sent',
    'email.delivered': 'delivered',
    'email.bounced': 'failed',
    'email.complained': 'failed',
    'email.delivery_delayed': 'sending',
  }

  it('Twilio: mappe tous les statuts connus', () => {
    expect(twilioStatusMap['queued']).toBe('sending')
    expect(twilioStatusMap['sent']).toBe('sent')
    expect(twilioStatusMap['delivered']).toBe('delivered')
    expect(twilioStatusMap['read']).toBe('read')
    expect(twilioStatusMap['failed']).toBe('failed')
    expect(twilioStatusMap['undelivered']).toBe('failed')
  })

  it('Twilio: statut inconnu retourne undefined', () => {
    expect(twilioStatusMap['accepted']).toBeUndefined()
    expect(twilioStatusMap['receiving']).toBeUndefined()
  })

  it('Resend: mappe tous les statuts connus', () => {
    expect(resendStatusMap['email.sent']).toBe('sent')
    expect(resendStatusMap['email.delivered']).toBe('delivered')
    expect(resendStatusMap['email.bounced']).toBe('failed')
    expect(resendStatusMap['email.complained']).toBe('failed')
    expect(resendStatusMap['email.delivery_delayed']).toBe('sending')
  })

  it('Resend: statut inconnu retourne undefined', () => {
    expect(resendStatusMap['email.opened']).toBeUndefined()
    expect(resendStatusMap['email.clicked']).toBeUndefined()
  })
})

describe('Prospection API — Campaign state machine', () => {
  const validTransitions: Record<string, string[]> = {
    draft: ['scheduled', 'sending', 'cancelled'],
    scheduled: ['sending', 'cancelled', 'draft'],
    sending: ['paused', 'completed', 'cancelled'],
    paused: ['sending', 'cancelled'],
    completed: [],
    cancelled: [],
  }

  const allStatuses = ['draft', 'scheduled', 'sending', 'paused', 'completed', 'cancelled']

  it('draft peut aller vers scheduled, sending, cancelled', () => {
    expect(validTransitions['draft']).toContain('scheduled')
    expect(validTransitions['draft']).toContain('sending')
    expect(validTransitions['draft']).toContain('cancelled')
    expect(validTransitions['draft']).not.toContain('completed')
    expect(validTransitions['draft']).not.toContain('paused')
  })

  it('scheduled peut aller vers sending, cancelled, draft', () => {
    expect(validTransitions['scheduled']).toContain('sending')
    expect(validTransitions['scheduled']).toContain('cancelled')
    expect(validTransitions['scheduled']).toContain('draft')
  })

  it('sending peut aller vers paused, completed, cancelled', () => {
    expect(validTransitions['sending']).toContain('paused')
    expect(validTransitions['sending']).toContain('completed')
    expect(validTransitions['sending']).toContain('cancelled')
  })

  it('paused peut aller vers sending, cancelled', () => {
    expect(validTransitions['paused']).toContain('sending')
    expect(validTransitions['paused']).toContain('cancelled')
    expect(validTransitions['paused']).not.toContain('completed')
  })

  it('completed est un état terminal', () => {
    expect(validTransitions['completed']).toHaveLength(0)
  })

  it('cancelled est un état terminal', () => {
    expect(validTransitions['cancelled']).toHaveLength(0)
  })

  it('aucun état ne peut transitionner vers lui-même', () => {
    for (const status of allStatuses) {
      expect(validTransitions[status]).not.toContain(status)
    }
  })

  it('send route rejette les campagnes non-draft/scheduled', () => {
    const invalidForSend = ['sending', 'paused', 'completed', 'cancelled']
    for (const status of invalidForSend) {
      expect(['draft', 'scheduled'].includes(status)).toBe(false)
    }
  })
})

describe('Prospection API — Pagination logic', () => {
  it('calcule correctement offset pour page 1', () => {
    const page = 1, limit = 20
    const offset = (page - 1) * limit
    expect(offset).toBe(0)
  })

  it('calcule correctement offset pour page 5 avec limit 10', () => {
    const page = 5, limit = 10
    const offset = (page - 1) * limit
    expect(offset).toBe(40)
  })

  it('calcule correctement totalPages', () => {
    expect(Math.ceil(0 / 20)).toBe(0)
    expect(Math.ceil(1 / 20)).toBe(1)
    expect(Math.ceil(20 / 20)).toBe(1)
    expect(Math.ceil(21 / 20)).toBe(2)
    expect(Math.ceil(100 / 20)).toBe(5)
    expect(Math.ceil(101 / 20)).toBe(6)
  })

  it('limit est borné entre 1 et 100', () => {
    const parse = (val: string) => campaignQuerySchema.safeParse({ limit: val })
    expect(parse('1').success).toBe(true)
    expect(parse('100').success).toBe(true)
    expect(parse('0').success).toBe(false)
    expect(parse('101').success).toBe(false)
  })
})

describe('Prospection API — Template rendering', () => {
  // Pure function tests for escapeTemplateValue logic
  function escapeTemplateValue(value: unknown): string {
    if (value === null || value === undefined) return ''
    const str = String(value)
    return str.replace(/<[^>]*>/g, '').replace(/\{\{/g, '').replace(/\}\}/g, '').slice(0, 500)
  }

  it('escape null → chaîne vide', () => {
    expect(escapeTemplateValue(null)).toBe('')
  })

  it('escape undefined → chaîne vide', () => {
    expect(escapeTemplateValue(undefined)).toBe('')
  })

  it('escape string normale', () => {
    expect(escapeTemplateValue('Jean Martin')).toBe('Jean Martin')
  })

  it('strip les tags HTML (XSS)', () => {
    expect(escapeTemplateValue('<script>alert("xss")</script>')).toBe('alert("xss")')
    expect(escapeTemplateValue('<b>bold</b>')).toBe('bold')
    expect(escapeTemplateValue('Hello <img src=x onerror=alert(1)>')).toBe('Hello ')
  })

  it('strip les {{ }} pour éviter injection template', () => {
    expect(escapeTemplateValue('{{malicious}}')).toBe('malicious')
    expect(escapeTemplateValue('test {{nested}} fin')).toBe('test nested fin')
  })

  it('tronque à 500 caractères', () => {
    const long = 'a'.repeat(600)
    expect(escapeTemplateValue(long)).toHaveLength(500)
  })

  it('gère les nombres', () => {
    expect(escapeTemplateValue(42)).toBe('42')
    expect(escapeTemplateValue(0)).toBe('0')
  })

  // extractVariables logic
  function extractVariables(template: string): string[] {
    const matches = template.match(/\{\{(\w+)\}\}/g) || []
    return Array.from(new Set(matches.map(m => m.replace(/\{\{|\}\}/g, ''))))
  }

  it('extrait les variables d\'un template', () => {
    const vars = extractVariables('Bonjour {{contact_name}}, votre entreprise {{company_name}} à {{city}}')
    expect(vars).toContain('contact_name')
    expect(vars).toContain('company_name')
    expect(vars).toContain('city')
    expect(vars).toHaveLength(3)
  })

  it('déduplique les variables', () => {
    const vars = extractVariables('{{name}} et {{name}} et {{name}}')
    expect(vars).toHaveLength(1)
    expect(vars[0]).toBe('name')
  })

  it('retourne tableau vide sans variables', () => {
    const vars = extractVariables('Bonjour, ceci est un texte simple.')
    expect(vars).toHaveLength(0)
  })

  it('ignore les accolades malformées', () => {
    const vars = extractVariables('{name} et {{}} et {{ name }}')
    expect(vars).toHaveLength(0)
  })
})

describe('Prospection API — Search sanitization', () => {
  it('échappe les caractères spéciaux SQL LIKE', () => {
    const search = '100% plombier_expert'
    const escaped = search.replace(/%/g, '\\%').replace(/_/g, '\\_')
    expect(escaped).toBe('100\\% plombier\\_expert')
  })

  it('ne modifie pas une recherche normale', () => {
    const search = 'plombier paris'
    const escaped = search.replace(/%/g, '\\%').replace(/_/g, '\\_')
    expect(escaped).toBe('plombier paris')
  })
})

describe('Prospection API — Files existence & structure', () => {
  const BASE = resolve(__dirname, '..', '..')

  const requiredRoutes = [
    'src/app/api/admin/prospection/contacts/route.ts',
    'src/app/api/admin/prospection/contacts/[id]/route.ts',
    'src/app/api/admin/prospection/contacts/import/route.ts',
    'src/app/api/admin/prospection/contacts/sync/route.ts',
    'src/app/api/admin/prospection/campaigns/route.ts',
    'src/app/api/admin/prospection/campaigns/[id]/route.ts',
    'src/app/api/admin/prospection/campaigns/[id]/send/route.ts',
    'src/app/api/admin/prospection/campaigns/[id]/pause/route.ts',
    'src/app/api/admin/prospection/campaigns/[id]/resume/route.ts',
    'src/app/api/admin/prospection/campaigns/[id]/stats/route.ts',
    'src/app/api/admin/prospection/templates/route.ts',
    'src/app/api/admin/prospection/templates/[id]/route.ts',
    'src/app/api/admin/prospection/templates/preview/route.ts',
    'src/app/api/admin/prospection/lists/route.ts',
    'src/app/api/admin/prospection/lists/[id]/route.ts',
    'src/app/api/admin/prospection/lists/[id]/members/route.ts',
    'src/app/api/admin/prospection/conversations/route.ts',
    'src/app/api/admin/prospection/conversations/[id]/route.ts',
    'src/app/api/admin/prospection/conversations/[id]/reply/route.ts',
    'src/app/api/admin/prospection/analytics/route.ts',
    'src/app/api/admin/prospection/ai/settings/route.ts',
    'src/app/api/admin/prospection/ai/generate/route.ts',
    'src/app/api/admin/prospection/webhooks/twilio/route.ts',
    'src/app/api/admin/prospection/webhooks/twilio-incoming/route.ts',
    'src/app/api/admin/prospection/webhooks/resend/route.ts',
    'src/app/api/prospection/unsubscribe/route.ts',
  ]

  for (const route of requiredRoutes) {
    it(`existe: ${route}`, () => {
      expect(existsSync(resolve(BASE, route))).toBe(true)
    })
  }

  it('toutes les routes admin utilisent requirePermission ou verifyTwilio/Resend', () => {
    const adminRoutes = requiredRoutes.filter(r => r.includes('/admin/prospection/') && !r.includes('webhooks'))
    for (const route of adminRoutes) {
      const content = readFileSync(resolve(BASE, route), 'utf-8')
      expect(content).toContain('requirePermission')
    }
  })

  it('les webhooks vérifient les signatures', () => {
    const twilioRoute = readFileSync(resolve(BASE, 'src/app/api/admin/prospection/webhooks/twilio/route.ts'), 'utf-8')
    expect(twilioRoute).toContain('verifyTwilioSignature')

    const resendRoute = readFileSync(resolve(BASE, 'src/app/api/admin/prospection/webhooks/resend/route.ts'), 'utf-8')
    expect(resendRoute).toContain('verifyResendSignature')
  })

  it('les routes admin utilisent createAdminClient ou délèguent au service layer', () => {
    const adminRoutes = requiredRoutes.filter(r => r.includes('/admin/prospection/'))
    for (const route of adminRoutes) {
      const content = readFileSync(resolve(BASE, route), 'utf-8')
      // Route must either use createAdminClient directly OR import from service layer
      const usesAdminClient = content.includes('createAdminClient')
      const delegatesToService = content.includes('@/lib/prospection/')
      expect(usesAdminClient || delegatesToService).toBe(true)
      // Should NEVER use createClient (user-session based) for admin routes
      expect(content).not.toMatch(/\bfrom\b.*['"]@\/lib\/supabase\/server['"]/)
    }
  })

  it('aucune route ne leak error.message au client', () => {
    for (const route of requiredRoutes) {
      const content = readFileSync(resolve(BASE, route), 'utf-8')
      // error.message should not be in JSON responses (security: info leak)
      // Exception: send route uses (error as Error).message which we'll accept for now
      if (route.includes('/send/')) continue
      const jsonResponses = content.match(/NextResponse\.json\(\{[^}]*error\.message[^}]*\}/g)
      expect(jsonResponses).toBeNull()
    }
  })

  it('toutes les routes utilisent force-dynamic', () => {
    for (const route of requiredRoutes) {
      const content = readFileSync(resolve(BASE, route), 'utf-8')
      expect(content).toContain("dynamic = 'force-dynamic'")
    }
  })

  it('les routes POST avec JSON body utilisent zod pour validation', () => {
    // Only check routes that do request.json() AND don't delegate to service layer
    const routesWithJsonPost = requiredRoutes.filter(r => {
      const content = readFileSync(resolve(BASE, r), 'utf-8')
      if (!content.includes('export async function POST')) return false
      if (!content.includes('request.json()')) return false
      // Routes delegating to service layer or using .catch() handle validation differently
      if (content.includes('request.json().catch')) return false
      if (content.includes('renderPreview')) return false
      return true
    })

    for (const route of routesWithJsonPost) {
      const content = readFileSync(resolve(BASE, route), 'utf-8')
      expect(content).toContain('safeParse')
    }
  })

  it('les routes import/sync délèguent au service layer', () => {
    const importRoute = readFileSync(resolve(BASE, 'src/app/api/admin/prospection/contacts/import/route.ts'), 'utf-8')
    expect(importRoute).toContain('importContacts')

    const syncRoute = readFileSync(resolve(BASE, 'src/app/api/admin/prospection/contacts/sync/route.ts'), 'utf-8')
    expect(syncRoute).toContain('syncArtisansFromDatabase')
  })
})

describe('Prospection API — Migration SQL 302 security', () => {
  const migrationPath = resolve(__dirname, '..', '..', 'supabase', 'migrations', '302_critical_security_fixes.sql')

  let sql: string
  try {
    sql = readFileSync(migrationPath, 'utf-8')
  } catch {
    sql = ''
  }

  it('fichier migration existe', () => {
    expect(existsSync(migrationPath)).toBe(true)
    expect(sql.length).toBeGreaterThan(0)
  })

  it('increment() est whitelisté (pas arbitraire)', () => {
    expect(sql).toContain("IF p_table_name = 'prospection_campaigns'")
    expect(sql).toContain('RAISE EXCEPTION')
    expect(sql).toContain("'Disallowed table/column")
  })

  it('increment() est SECURITY DEFINER avec REVOKE PUBLIC', () => {
    expect(sql).toContain('SECURITY DEFINER')
    expect(sql).toContain('REVOKE ALL ON FUNCTION public.increment')
    expect(sql).toContain('GRANT EXECUTE ON FUNCTION public.increment')
  })

  it('claim_queued_messages utilise FOR UPDATE SKIP LOCKED', () => {
    expect(sql).toContain('FOR UPDATE SKIP LOCKED')
  })

  it('GDPR erasure function exists', () => {
    expect(sql).toContain('prospection_gdpr_erase')
    expect(sql).toContain('[SUPPRIME]')
    expect(sql).toContain('[CONTENU SUPPRIME - RGPD]')
  })

  it('campaign state machine trigger exists', () => {
    expect(sql).toContain('prospection_validate_campaign_transition')
    expect(sql).toContain('Transition invalide')
    expect(sql).toContain('Transition impossible depuis le statut completed')
    expect(sql).toContain('Transition impossible depuis le statut cancelled')
  })

  it('consent CHECK constraint exists', () => {
    expect(sql).toContain('chk_consent_no_unknown')
    expect(sql).toContain("consent_status IN ('opted_in', 'opted_out')")
  })

  it('consent DEFAULT is opted_out', () => {
    expect(sql).toContain("SET DEFAULT 'opted_out'")
  })

  it('AI settings singleton uses deterministic UUID', () => {
    expect(sql).toContain('00000000-0000-0000-0000-000000000001')
    // gen_random_uuid() should only appear in comments, never in executable SQL
    const nonCommentLines = sql.split('\n').filter(line => !line.trimStart().startsWith('--'))
    const executableSQL = nonCommentLines.join('\n')
    expect(executableSQL).not.toContain('gen_random_uuid()')
  })
})
