import { z } from 'zod'

export const providerUpdateSchema = z.object({
  name: z
    .string()
    .min(2, 'Nom trop court')
    .max(100, 'Nom trop long')
    .transform((v) => v.trim())
    .optional(),
  description: z
    .string()
    .min(50, 'La description doit contenir au moins 50 caractères')
    .max(2000, 'Description trop longue')
    .optional()
    .nullable(),
  specialties: z.string().max(500).optional().nullable(),
  phone: z
    .string()
    .regex(/^(\+33|0)[1-9](\d{8})$/, 'Numéro de téléphone invalide')
    .transform((v) => v.replace(/\s/g, ''))
    .optional(),
  phone_secondary: z
    .string()
    .regex(/^(\+33|0)[1-9](\d{8})$/, 'Numéro de téléphone invalide')
    .optional()
    .nullable()
    .transform((v) => v?.replace(/\s/g, '')),
  email: z.string().email('Email invalide').optional().nullable(),
  website: z.string().url('URL invalide').optional().nullable(),
  address_street: z.string().max(200).optional().nullable(),
  address_postal_code: z
    .string()
    .regex(/^\d{5}$/, 'Code postal invalide')
    .optional()
    .nullable(),
  address_city: z.string().max(100).optional().nullable(),
  intervention_radius_km: z.number().int().min(5).max(200).optional().default(30),
  free_quote: z.boolean().optional().default(true),
  available_24h: z.boolean().optional().default(false),
})

// ============================================================
// Sub-schemas for artisan profile editor
// ============================================================
export const dayScheduleSchema = z.object({
  ouvert: z.boolean(),
  debut: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .or(z.literal('')),
  fin: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .or(z.literal('')),
})

export const openingHoursSchema = z.object({
  lundi: dayScheduleSchema,
  mardi: dayScheduleSchema,
  mercredi: dayScheduleSchema,
  jeudi: dayScheduleSchema,
  vendredi: dayScheduleSchema,
  samedi: dayScheduleSchema,
  dimanche: dayScheduleSchema,
})

export const servicePriceSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional().default(''),
  price: z.string().min(1).max(100),
  duration: z.string().max(50).optional().default(''),
})

export const faqItemSchema = z.object({
  question: z.string().min(5, 'Question trop courte').max(500),
  answer: z.string().min(10, 'Réponse trop courte').max(2000),
})

// ============================================================
// Artisan self-service update schema (PUT /api/artisan/provider)
// Excludes admin-only fields: is_verified, noindex, is_active,
// rating_average, review_count.
// ============================================================
export const providerArtisanUpdateSchema = z
  .object({
    // Identity
    name: z
      .string()
      .min(2)
      .max(100)
      .transform((v) => v.trim())
      .optional(),
    siret: z
      .string()
      .regex(/^\d{14}$/, 'Le SIRET doit contenir 14 chiffres')
      .optional()
      .nullable(),
    team_size: z.number().int().min(1).max(1000).optional().nullable(),

    // Contact
    phone: z
      .string()
      .transform((v) => v.replace(/[\s.\-()]/g, ''))
      .pipe(z.string().regex(/^(\+33|0)[1-9](\d{8})$/, 'Numéro invalide'))
      .optional(),
    phone_secondary: z
      .string()
      .transform((v) => v.replace(/[\s.\-()]/g, ''))
      .pipe(z.string().regex(/^(\+33|0)[1-9](\d{8})$/, 'Numéro invalide'))
      .optional()
      .nullable(),
    email: z.string().email('Email invalide').optional().nullable(),
    website: z.string().url('URL invalide').optional().nullable(),

    // Location — address_department, latitude, longitude exist in providers (migrations 009, 007)
    address_street: z.string().max(200).optional().nullable(),
    address_city: z.string().max(100).optional().nullable(),
    address_postal_code: z
      .string()
      .regex(/^\d{5}$/, 'Code postal invalide')
      .optional()
      .nullable(),
    address_region: z.string().max(50).optional().nullable(),
    address_department: z.string().max(50).optional().nullable(),
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
    intervention_radius_km: z.number().int().min(5).max(200).optional(),

    // Presentation
    description: z.string().max(5000).optional().nullable(),
    bio: z.string().max(5000).optional().nullable(),
    // Mig 546 — « Le mot de l'artisan » : citation courte affichée dans le
    // hero de la fiche publique (CHECK 200 chars en DB)
    artisan_quote: z.string().max(200).optional().nullable(),
    specialty: z.string().max(200).optional().nullable(),

    // Services & Pricing
    services_offered: z.array(z.string().min(1).max(100)).max(30).optional(),
    // DEFAUT DB '{}'::jsonb : les fiches jamais éditées renvoient un objet
    // vide — le tolérer comme tableau vide (uniquement s'il est VIDE), sinon
    // tout save de la section Services échoue en 400 tant que la colonne n'a
    // pas été réécrite.
    service_prices: z.preprocess(
      (v) =>
        v !== null && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0
          ? []
          : v,
      z.array(servicePriceSchema).max(20).optional()
    ),
    free_quote: z.boolean().optional(),
    // hourly_rate_min/max : NUMERIC(10,2) + CHECK max >= min (mig 306)
    hourly_rate_min: z.number().min(0).max(10000).optional().nullable(),
    hourly_rate_max: z.number().min(0).max(10000).optional().nullable(),
    payment_methods: z.array(z.string().min(1).max(50)).max(10).optional(),

    // Availability
    opening_hours: openingHoursSchema.optional(),
    available_24h: z.boolean().optional(),
    accepts_new_clients: z.boolean().optional(),
    emergency_available: z.boolean().optional(),

    // Credentials déclaratifs (mig 306 — TEXT[] bornés en DB)
    certifications: z.array(z.string().min(1).max(100)).max(20).optional(),
    insurance: z.array(z.string().min(1).max(100)).max(10).optional(),
    languages: z.array(z.string().min(1).max(50)).max(10).optional(),

    // FAQ
    faq: z.array(faqItemSchema).max(15, 'Maximum 15 questions').optional(),
  })
  .refine(
    (v) =>
      v.hourly_rate_min == null ||
      v.hourly_rate_max == null ||
      v.hourly_rate_max >= v.hourly_rate_min,
    {
      message: 'Le tarif horaire maximum doit être supérieur ou égal au minimum',
      path: ['hourly_rate_max'],
    }
  )

export type ProviderArtisanUpdateInput = z.infer<typeof providerArtisanUpdateSchema>

export const providerSearchSchema = z.object({
  q: z.string().optional(),
  service: z.string().optional(),
  city: z.string().optional(),
  department: z.string().optional(),
  region: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radius_km: z.coerce.number().int().min(1).max(100).optional().default(30),
  verified_only: z.coerce.boolean().optional().default(false),
  min_rating: z.coerce.number().min(1).max(5).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
})

export const photoUploadSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().regex(/^image\/(jpeg|png|webp|gif)$/, 'Type de fichier non supporté'),
  size: z.number().max(5 * 1024 * 1024, 'Le fichier ne doit pas dépasser 5MB'),
})

export type ProviderUpdateInput = z.infer<typeof providerUpdateSchema>
export type ProviderSearchInput = z.infer<typeof providerSearchSchema>
export type PhotoUploadInput = z.infer<typeof photoUploadSchema>
