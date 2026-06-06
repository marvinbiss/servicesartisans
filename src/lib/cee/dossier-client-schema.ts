/**
 * Schéma d'entrée CLIENT du POST /api/cee/dossiers.
 *
 * Le formulaire envoie des données en clair ; tout ce qui est sensible ou
 * faisant autorité est résolu CÔTÉ SERVEUR par la route :
 *   - partner_id / provider_id     → depuis cee_artisan_partners (user_id auth)
 *   - chiffrement PII              → pii-crypto.ts (CEE_PII_KEY)
 *   - client_email_hash            → hashEmailForDossier
 *   - zone climatique              → zones_climatiques_ref (commune_insee)
 *   - forfait_id / version / prime → bareme.ts (cee_forfaits)
 *   - commission_rate              → cee_artisan_partners.commission_rate_effective
 *
 * Le client ne peut donc influencer ni l'attribution, ni la prime, ni la
 * commission — uniquement les données déclaratives du dossier.
 */

import { z } from 'zod'

const DATE_RE = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/

export const DossierClientInputSchema = z
  .object({
    operation_code: z.string().regex(/^(BAR|BAT|IND|RES|TRA|AGRI)-[A-Z]{2}-[0-9]{3}$/),
    client: z.object({
      nom: z.string().trim().min(1).max(100),
      prenom: z.string().trim().min(1).max(100),
      email: z.string().trim().toLowerCase().email().max(254),
      telephone: z
        .string()
        .trim()
        .transform((v) => v.replace(/[\s.-]/g, ''))
        .pipe(z.string().regex(/^(\+33|0)[1-9][0-9]{8}$/, 'Téléphone FR invalide'))
        .nullish(),
      adresse: z.string().trim().min(5).max(300),
      code_postal: z.string().regex(/^[0-9]{5}$/),
      commune_insee: z.string().regex(/^[0-9AB]{5}$/),
    }),
    foyer_personnes: z.number().int().min(1).max(12),
    revenus_categorie: z.enum(['tres_modeste', 'modeste', 'intermediaire', 'superieur']),
    type_travaux: z.string().trim().min(1).max(200),
    surface_m2: z.number().positive().max(10000).nullish(),
    annee_construction: z.number().int().min(1800).max(2100).nullish(),
    energie_remplacee: z.string().trim().max(50).nullish(),
    montant_ht_eur: z.number().positive().max(1_000_000),
    montant_ttc_eur: z.number().positive().max(1_000_000),
    date_devis: z.string().regex(DATE_RE),
    date_chantier_prevue: z.string().regex(DATE_RE).nullish(),
  })
  .refine((d) => d.montant_ttc_eur >= d.montant_ht_eur, {
    message: 'Le montant TTC doit être supérieur ou égal au montant HT',
    path: ['montant_ttc_eur'],
  })

export type DossierClientInput = z.infer<typeof DossierClientInputSchema>
