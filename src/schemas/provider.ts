import { z } from 'zod'

export const providerUpdateSchema = z.object({
  name: z
    .string()
    .min(2, 'Nom trop court')
    .max(100, 'Nom trop long')
    .transform((v) => v.trim()),
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
    .transform((v) => v.replace(/\s/g, '')),
  phone_secondary: z
    .string()
    .regex(/^(\+33|0)[1-9](\d{8})$/, 'Numéro de téléphone invalide')
    .optional()
    .nullable()
    .transform((v) => v?.replace(/\s/g, '')),
  email: z.string().email('Email invalide').optional().nullable(),
  website: z.string().url('URL invalide').optional().nullable(),
  address_street: z.string().max(200).optional().nullable(),
  postal_code: z.string().regex(/^\d{5}$/, 'Code postal invalide').optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  intervention_radius_km: z.number().int().min(1).max(200).optional().default(30),
  hourly_rate_min: z.number().int().positive().optional().nullable(),
  hourly_rate_max: z.number().int().positive().optional().nullable(),
  free_quote: z.boolean().optional().default(true),
  available_24h: z.boolean().optional().default(false),
  emergency_available: z.boolean().optional().default(false),
  certifications: z.array(z.string()).optional().default([]),
}).refine(
  (data) => {
    if (data.hourly_rate_min && data.hourly_rate_max) {
      return data.hourly_rate_max >= data.hourly_rate_min
    }
    return true
  },
  {
    message: 'Le tarif max doit être supérieur ou égal au tarif min',
    path: ['hourly_rate_max'],
  }
)

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
  certifications: z.array(z.string()).optional(),
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
