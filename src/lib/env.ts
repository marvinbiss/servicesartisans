import { z } from 'zod'

/**
 * Environment variable validation schema.
 *
 * Categories:
 *   1. Core infrastructure (Supabase, Stripe) -- required at runtime
 *   2. Public client-side vars (NEXT_PUBLIC_*) -- required for frontend
 *   3. Optional third-party services (AI, Redis, Twilio, etc.)
 *   4. Optional business/config vars (company info, secrets, etc.)
 *
 * Usage:
 *   import { env } from '@/lib/env'
 *   // env.STRIPE_SECRET_KEY is guaranteed to be a valid string starting with 'sk_'
 *
 * This module est importé depuis `src/instrumentation.ts` (Node runtime) →
 * la validation court au boot du serveur. Voir aussi le wrapper
 * `process.env.NEXT_BUILD_SKIP_DB === '1'` dans `validateEnv()` qui skip
 * pendant `next build` pour ne pas bloquer le compile sur env partiel.
 */

// Empty-string coercion : les .env loaders (dotenv, Vercel) peuvent injecter
// `""` au lieu de undefined pour une var « non définie ». Pour Zod
// `.optional()`, "" est une chaîne valide donc passe le check string mais
// fail .url() / .regex() / .min(20). On preprocess pour traiter "" comme
// undefined → comportement attendu pour une var optionnelle vide.
//
// Type-safe : on cast le résultat en `ZodOptional<TInner>` pour que
// `z.infer<>` produise `string | undefined` plutôt que `unknown` (Zod
// preprocess perd l'inférence sinon, ce qui casse les call sites typés).
function optionalString<TInner extends z.ZodType<string>>(inner: TInner): z.ZodOptional<TInner> {
  return z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : v),
    inner.optional()
  ) as unknown as z.ZodOptional<TInner>
}

const envSchema = z.object({
  // ──────────────────────────────────────────────
  // Core infrastructure -- required at runtime
  // ──────────────────────────────────────────────
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: optionalString(z.string().startsWith('sk_')),
  STRIPE_WEBHOOK_SECRET: optionalString(z.string().startsWith('whsec_')),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optionalString(z.string().startsWith('pk_')),

  // ──────────────────────────────────────────────
  // Node / Next.js
  // ──────────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // ──────────────────────────────────────────────
  // Public client-side vars (optional -- may not be set in all envs)
  // ──────────────────────────────────────────────
  NEXT_PUBLIC_SITE_URL: optionalString(z.string().url()),
  NEXT_PUBLIC_APP_URL: optionalString(z.string().url()),
  NEXT_PUBLIC_APP_VERSION: z.string().optional(),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),

  // ──────────────────────────────────────────────
  // AI services (optional)
  // ──────────────────────────────────────────────
  ANTHROPIC_API_KEY: optionalString(
    z.string().regex(/^sk-ant-/, 'ANTHROPIC_API_KEY doit commencer par sk-ant-')
  ),
  OPENAI_API_KEY: optionalString(z.string()),

  // ──────────────────────────────────────────────
  // Redis / rate-limiting (optional)
  // ──────────────────────────────────────────────
  UPSTASH_REDIS_REST_URL: optionalString(z.string().url()),
  UPSTASH_REDIS_REST_TOKEN: optionalString(z.string()),

  // ──────────────────────────────────────────────
  // Two-factor authentication (optional)
  // ──────────────────────────────────────────────
  TWO_FACTOR_ENCRYPTION_KEY: optionalString(z.string().min(32)),
  TWO_FACTOR_SALT: optionalString(z.string().min(8)),

  // ──────────────────────────────────────────────
  // Email (Resend) (optional)
  // ──────────────────────────────────────────────
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
  RESEND_WEBHOOK_SECRET: z.string().optional(),
  FROM_EMAIL: z.string().optional(),

  // ──────────────────────────────────────────────
  // Twilio (optional)
  // ──────────────────────────────────────────────
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  TWILIO_WHATSAPP_NUMBER: z.string().optional(),

  // ──────────────────────────────────────────────
  // Stripe plan price IDs (optional)
  // ──────────────────────────────────────────────
  STRIPE_PRO_PRICE_ID: z.string().optional(),
  STRIPE_PREMIUM_PRICE_ID: z.string().optional(),

  // ──────────────────────────────────────────────
  // INSEE / Pappers API (optional)
  // ──────────────────────────────────────────────
  INSEE_API_TOKEN: z.string().optional(),
  INSEE_CONSUMER_KEY: z.string().optional(),
  INSEE_CONSUMER_SECRET: z.string().optional(),
  PAPPERS_API_KEY: z.string().optional(),

  // ──────────────────────────────────────────────
  // Misc secrets & config (optional)
  // ──────────────────────────────────────────────
  CRON_SECRET: z.string().optional(),
  INDEXNOW_API_KEY: z.string().optional(),
  REVALIDATE_SECRET: z.string().optional(),
  REVIEW_HMAC_SECRET: z.string().optional(),
  UNSUBSCRIBE_SECRET: z.string().optional(),
  ADMIN_EMAILS: z.string().optional(),
  NEXTAUTH_URL: optionalString(z.string().url()),
  VAPID_PRIVATE_KEY: optionalString(z.string()),

  // ──────────────────────────────────────────────
  // Observability (2026-05-02 — chantier monitoring 90+/100)
  // ──────────────────────────────────────────────
  HEALTHCHECKS_PING_BASE_URL: optionalString(z.string().url()),

  // ──────────────────────────────────────────────
  // KV (Vercel marketplace — alias Upstash, certains crons les lisent)
  // ──────────────────────────────────────────────
  KV_REST_API_URL: optionalString(z.string().url()),
  KV_REST_API_TOKEN: optionalString(z.string().min(20)),

  // ──────────────────────────────────────────────
  // Pipedrive 3 canaux (cf CLAUDE.md projet)
  // ──────────────────────────────────────────────
  PIPEDRIVE_API_TOKEN: optionalString(z.string().min(20)),
  PIPEDRIVE_PIPELINE_ID: optionalString(z.string()),
  PIPEDRIVE_PIPELINE_SIMULATEUR: optionalString(z.string()),

  // ──────────────────────────────────────────────
  // Notifications transactionnelles (Brevo, Mailpace)
  // ──────────────────────────────────────────────
  BREVO_API_KEY: optionalString(
    z.string().regex(/^xkeysib-/, 'BREVO_API_KEY doit commencer par xkeysib-')
  ),
  MAILPACE_API_TOKEN: optionalString(z.string().min(20)),

  // ──────────────────────────────────────────────
  // Google Maps
  // ──────────────────────────────────────────────
  GOOGLE_MAPS_API_KEY: optionalString(
    z.string().regex(/^AIza/, 'GOOGLE_MAPS_API_KEY doit commencer par AIza')
  ),

  // ──────────────────────────────────────────────
  // RGPD purges (cf cron purge-rgpd)
  // ──────────────────────────────────────────────
  AUDIT_LOGS_RETENTION_DAYS: z.coerce.number().int().min(30).max(3650).optional(),
  INACTIVE_USERS_RETENTION_DAYS: z.coerce.number().int().min(365).max(3650).optional(),

  // ──────────────────────────────────────────────
  // Company / legal metadata (optional -- used in legal pages)
  // ──────────────────────────────────────────────
  COMPANY_LEGAL_NAME: z.string().optional(),
  COMPANY_ADDRESS: z.string().optional(),
  COMPANY_PHONE: z.string().optional(),
  COMPANY_SIRET: z.string().optional(),
  COMPANY_RCS: z.string().optional(),
  COMPANY_TVA: z.string().optional(),
  COMPANY_CAPITAL_SOCIAL: z.string().optional(),
  COMPANY_FORME_JURIDIQUE: z.string().optional(),
  COMPANY_DIRECTEUR_PUBLICATION: z.string().optional(),
  COMPANY_STATUS: z.string().optional(),
  COMPANY_FOUNDING_DATE: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
  // Skip validation during build and tests
  if (process.env.NEXT_BUILD_SKIP_DB || process.env.NODE_ENV === 'test' || process.env.VITEST) {
    return process.env as unknown as Env
  }

  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n')

    throw new Error(
      [
        '',
        '===========================================',
        ' Invalid environment variables',
        '===========================================',
        issues,
        '',
        'Hint: check your .env.local file or hosting environment variables.',
        '===========================================',
        '',
      ].join('\n')
    )
  }

  return result.data
}

export const env = validateEnv()
