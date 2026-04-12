/**
 * Type canonique pour la table `public.reviews`.
 *
 * Source de vérité : schéma prod Supabase vérifié 2026-04-12 via
 * information_schema.columns (cf. memory servicesartisans-reviews-schema-drift.md).
 *
 * - `ReviewRow`   : représentation 1:1 des colonnes de la table (snake_case).
 *                   C'est ce que retourne `supabase.from('reviews').select('*')`.
 * - `ReviewDTO`   : forme camelCase exposée aux composants UI et aux routes API
 *                   publiques. Toutes les interfaces frontend doivent consommer
 *                   ce type (pas `ReviewRow` directement).
 * - `rowToDTO`    : transformer unique row → DTO. Centralise la mapping pour
 *                   éviter la dérive schema drift qui a motivé cette refonte.
 *
 * Règle : AUCUN fichier ne doit redéclarer une interface `Review` locale. Tout
 * passage du DB au composant doit emprunter ce module.
 */

export type ReviewStatus = 'pending_review' | 'published' | 'rejected' | 'flagged' | 'hidden'

/**
 * Représentation brute d'une ligne de `public.reviews` (snake_case).
 * Refléter exactement les colonnes prod vérifiées 2026-04-12.
 * Les colonnes `booking_id` et `would_recommend` sont ajoutées par la
 * migration 415_reviews_add_missing_columns.sql.
 */
export interface ReviewRow {
  id: string
  provider_id: string
  booking_id: string | null
  author_name: string | null
  author_email: string | null
  author_verified: boolean | null
  rating: number
  title: string | null
  content: string | null
  reply: string | null
  reply_date: string | null
  status: ReviewStatus | string | null
  moderated_at: string | null
  moderated_by: string | null
  source: string | null
  source_id: string | null
  source_date: string | null
  created_at: string | null
  updated_at: string | null
  authenticity_score: number | null
  sentiment_score: number | null
  keywords: string[] | null
  has_media: boolean | null
  is_verified_purchase: boolean | null
  helpful_count: number | null
  would_recommend: boolean | null
  // Colonnes doublons héritées (à NE PAS consommer — cleanup séparé plus tard).
  response_at?: string | null
  response_text?: string | null
}

/**
 * Forme camelCase exposée aux composants et aux réponses API publiques.
 * Seules les colonnes réellement consommées par le frontend sont mappées ;
 * les champs internes (moderated_by, source_id, sentiment_score, ...) restent
 * côté serveur.
 */
export interface ReviewDTO {
  id: string
  providerId: string
  bookingId: string | null
  authorName: string | null
  authorVerified: boolean
  rating: number
  title: string | null
  content: string | null
  reply: string | null
  replyDate: string | null
  status: ReviewStatus | string
  source: string | null
  createdAt: string
  updatedAt: string | null
  hasMedia: boolean
  isVerifiedPurchase: boolean
  helpfulCount: number
  wouldRecommend: boolean | null
}

/**
 * Input Zod-ready pour la création d'une review depuis le formulaire public.
 * Ne contient que les champs fournis par l'utilisateur ; le serveur renseigne
 * provider_id (résolu via URL/slug), status = 'pending_review', timestamps,
 * authenticity_score, etc.
 */
export interface CreateReviewInput {
  providerId: string
  bookingId?: string | null
  authorName: string
  authorEmail: string
  rating: number
  title?: string
  content: string
  wouldRecommend?: boolean
}

/** Transformer unique row → DTO. Point d'entrée obligatoire côté frontend. */
export function rowToDTO(row: ReviewRow): ReviewDTO {
  return {
    id: row.id,
    providerId: row.provider_id,
    bookingId: row.booking_id,
    authorName: row.author_name,
    authorVerified: row.author_verified ?? false,
    rating: row.rating,
    title: row.title,
    content: row.content,
    reply: row.reply,
    replyDate: row.reply_date,
    status: row.status ?? 'pending_review',
    source: row.source,
    createdAt: row.created_at ?? new Date(0).toISOString(),
    updatedAt: row.updated_at,
    hasMedia: row.has_media ?? false,
    isVerifiedPurchase: row.is_verified_purchase ?? false,
    helpfulCount: row.helpful_count ?? 0,
    wouldRecommend: row.would_recommend,
  }
}

/** Mapper en lot (nullable safe). */
export function dtoListFromRows(rows: ReviewRow[] | null | undefined): ReviewDTO[] {
  if (!rows) return []
  return rows.map(rowToDTO)
}

/** Helper pour le filtrage côté serveur / composants. */
export function isPublishedReview(row: ReviewRow): boolean {
  return row.status === 'published'
}
