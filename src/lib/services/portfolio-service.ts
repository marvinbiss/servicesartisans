/**
 * Portfolio Service — Business logic for portfolio CRUD operations
 * Framework-agnostic: no NextRequest/NextResponse
 */

import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'
import type { SupabaseClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PortfolioListParams {
  artisanId: string
  mediaType?: string | null
  category?: string | null
  limit: number
  offset: number
}

export interface PortfolioListResult {
  items: Record<string, unknown>[]
  total: number
  limit: number
  offset: number
}

export interface PortfolioCreateInput {
  title: string
  description?: string | null
  image_url: string
  thumbnail_url?: string | null
  video_url?: string | null
  before_image_url?: string | null
  after_image_url?: string | null
  category?: string | null
  tags?: string[] | null
  media_type: 'image' | 'video' | 'before_after'
  is_featured: boolean
  is_visible: boolean
}

export interface PortfolioUpdateInput {
  title?: string
  description?: string | null
  image_url?: string
  thumbnail_url?: string | null
  video_url?: string | null
  before_image_url?: string | null
  after_image_url?: string | null
  category?: string | null
  tags?: string[] | null
  media_type?: 'image' | 'video' | 'before_after'
  is_featured?: boolean
  is_visible?: boolean
  display_order?: number
}

export interface ReorderItem {
  id: string
  display_order: number
}

type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; status: number }

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function revalidateArtisanPages(supabase: SupabaseClient, userId: string): Promise<void> {
  try {
    const { data: provider } = await supabase
      .from('providers')
      .select('specialty, address_city, slug, stable_id')
      .eq('user_id', userId)
      .single()

    if (provider) {
      const toSlug = (s: string) => s.toLowerCase().replace(/\s+/g, '-')
      const serviceSlug = toSlug(provider.specialty || '')
      const locationSlug = toSlug(provider.address_city || '')
      if (serviceSlug && locationSlug && provider.stable_id) {
        revalidatePath(`/services/${serviceSlug}/${locationSlug}/${provider.stable_id}`)
        revalidatePath(`/services/${serviceSlug}/${locationSlug}`)
      }
    }
  } catch (revalidateError) {
    logger.error('Revalidation error for artisan pages:', revalidateError)
  }
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

export async function listPortfolioItems(
  supabase: SupabaseClient,
  params: PortfolioListParams
): Promise<ServiceResult<PortfolioListResult>> {
  const { artisanId, mediaType, category, limit, offset } = params

  let query = supabase
    .from('portfolio_items')
    .select('*', { count: 'exact' })
    .eq('artisan_id', artisanId)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (mediaType) {
    query = query.eq('media_type', mediaType)
  }

  if (category) {
    query = query.eq('category', category)
  }

  const { data: items, error, count } = await query

  if (error) {
    logger.error('Error fetching portfolio items:', error)
    return { success: false, error: 'Erreur lors de la récupération du portfolio', status: 500 }
  }

  return {
    success: true,
    data: {
      items: items || [],
      total: count || 0,
      limit,
      offset,
    },
  }
}

export async function getPortfolioItem(
  supabase: SupabaseClient,
  itemId: string,
  artisanId: string
): Promise<ServiceResult<Record<string, unknown>>> {
  const { data: item, error } = await supabase
    .from('portfolio_items')
    .select(
      'id, artisan_id, title, description, image_url, thumbnail_url, category, tags, is_featured, display_order, created_at, media_type, video_url, before_image_url, after_image_url, is_visible'
    )
    .eq('id', itemId)
    .eq('artisan_id', artisanId)
    .single()

  if (error || !item) {
    return { success: false, error: 'Élément non trouvé', status: 404 }
  }

  return { success: true, data: item }
}

export async function createPortfolioItem(
  supabase: SupabaseClient,
  artisanId: string,
  input: PortfolioCreateInput
): Promise<ServiceResult<Record<string, unknown>>> {
  // Get the highest display_order
  const { data: lastItem } = await supabase
    .from('portfolio_items')
    .select('display_order')
    .eq('artisan_id', artisanId)
    .order('display_order', { ascending: false })
    .limit(1)
    .single()

  const nextOrder = (lastItem?.display_order || 0) + 1

  // Create portfolio item
  const { data: item, error: createError } = await supabase
    .from('portfolio_items')
    .insert({
      artisan_id: artisanId,
      title: input.title,
      description: input.description,
      image_url: input.image_url,
      thumbnail_url: input.thumbnail_url,
      video_url: input.video_url,
      before_image_url: input.before_image_url,
      after_image_url: input.after_image_url,
      category: input.category,
      tags: input.tags,
      media_type: input.media_type,
      is_featured: input.is_featured,
      is_visible: input.is_visible,
      display_order: nextOrder,
    })
    .select()
    .single()

  if (createError) {
    logger.error('Error creating portfolio item:', createError)
    return { success: false, error: "Erreur lors de la création de l'élément", status: 500 }
  }

  // Revalidate public artisan page (ISR cache bust)
  await revalidateArtisanPages(supabase, artisanId)

  return { success: true, data: item }
}

export async function updatePortfolioItem(
  supabase: SupabaseClient,
  itemId: string,
  artisanId: string,
  input: PortfolioUpdateInput
): Promise<ServiceResult<Record<string, unknown>>> {
  // Verify ownership
  const { data: existingItem, error: fetchError } = await supabase
    .from('portfolio_items')
    .select('id')
    .eq('id', itemId)
    .eq('artisan_id', artisanId)
    .single()

  if (fetchError || !existingItem) {
    return { success: false, error: 'Élément non trouvé ou accès non autorisé', status: 404 }
  }

  // Update portfolio item
  const { data: item, error: updateError } = await supabase
    .from('portfolio_items')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', itemId)
    .eq('artisan_id', artisanId)
    .select()
    .single()

  if (updateError) {
    logger.error('Error updating portfolio item:', updateError)
    return { success: false, error: 'Erreur lors de la mise à jour', status: 500 }
  }

  // Revalidate public artisan page (ISR cache bust)
  await revalidateArtisanPages(supabase, artisanId)

  return { success: true, data: item }
}

export async function deletePortfolioItem(
  supabase: SupabaseClient,
  itemId: string,
  artisanId: string
): Promise<ServiceResult<{ message: string }>> {
  // Verify ownership
  const { data: item, error: fetchError } = await supabase
    .from('portfolio_items')
    .select('id')
    .eq('id', itemId)
    .eq('artisan_id', artisanId)
    .single()

  if (fetchError || !item) {
    return { success: false, error: 'Élément non trouvé ou accès non autorisé', status: 404 }
  }

  // Delete from database
  const { error: deleteError } = await supabase
    .from('portfolio_items')
    .delete()
    .eq('id', itemId)
    .eq('artisan_id', artisanId)

  if (deleteError) {
    logger.error('Error deleting portfolio item:', deleteError)
    return { success: false, error: 'Erreur lors de la suppression', status: 500 }
  }

  // Revalidate public artisan page (ISR cache bust)
  await revalidateArtisanPages(supabase, artisanId)

  return { success: true, data: { message: 'Élément supprimé' } }
}

export async function reorderPortfolioItems(
  supabase: SupabaseClient,
  artisanId: string,
  items: ReorderItem[]
): Promise<ServiceResult<{ message: string }>> {
  // Verify all items belong to the user
  const itemIds = items.map((i) => i.id)
  const { data: existingItems, error: fetchError } = await supabase
    .from('portfolio_items')
    .select('id')
    .eq('artisan_id', artisanId)
    .in('id', itemIds)

  if (fetchError) {
    logger.error('Error verifying portfolio items:', fetchError)
    return { success: false, error: 'Erreur de vérification', status: 500 }
  }

  const existingIds = new Set(existingItems?.map((i) => i.id) || [])
  const unauthorizedIds = itemIds.filter((id) => !existingIds.has(id))

  if (unauthorizedIds.length > 0) {
    return { success: false, error: 'Certains éléments ne vous appartiennent pas', status: 403 }
  }

  // Update display_order for each item
  const updates = items.map((item) =>
    supabase
      .from('portfolio_items')
      .update({ display_order: item.display_order })
      .eq('id', item.id)
      .eq('artisan_id', artisanId)
  )

  const results = await Promise.all(updates)
  const errors = results.filter((r) => r.error)

  if (errors.length > 0) {
    logger.error('Errors reordering portfolio items:', errors)
    return { success: false, error: 'Erreur lors du réordonnancement', status: 500 }
  }

  return { success: true, data: { message: 'Ordre mis à jour' } }
}
