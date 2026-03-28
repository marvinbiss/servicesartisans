/**
 * Page Enhancer — ServicesArtisans
 * Détermine quels blocs d'enrichissement afficher sur une page
 * en fonction de sa priorité SEO (positions 8-15).
 *
 * Usage dans les templates :
 *   const enhancements = await getPageEnhancements(pathname)
 *   if (enhancements.showAnswerBlock) { ... }
 */

import { getPriorityData, type PriorityPage } from '@/lib/seo/priority-pages'
import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PageEnhancements {
  /** Page est prioritaire et les enrichissements sont activés */
  isPriority: boolean
  /** Afficher le bloc de réponse immédiate */
  showAnswerBlock: boolean
  /** Afficher la vitrine de prestataires locaux */
  showProviderShowcase: boolean
  /** Afficher le tableau de tarifs structuré */
  showPricingTable: boolean
  /** Afficher le bloc d'insights locaux */
  showInsightsBlock: boolean
  /** Utiliser le titre/meta optimisé */
  useOptimizedMeta: boolean
  /** Données Search Console associées */
  priorityData: PriorityPage | null
}

/** Résultat par défaut — aucun enrichissement (backward compatible) */
const DEFAULT_ENHANCEMENTS: PageEnhancements = {
  isPriority: false,
  showAnswerBlock: false,
  showProviderShowcase: false,
  showPricingTable: false,
  showInsightsBlock: false,
  useOptimizedMeta: false,
  priorityData: null,
}

// ---------------------------------------------------------------------------
// Enhancement types for logging
// ---------------------------------------------------------------------------

export type EnhancementType =
  | 'answer_block'
  | 'provider_showcase'
  | 'pricing_table'
  | 'insights_block'
  | 'optimized_meta'

// ---------------------------------------------------------------------------
// Core function
// ---------------------------------------------------------------------------

/**
 * Détermine si une page doit être enrichie et avec quels blocs.
 * Retourne un objet avec des booléens pour chaque bloc.
 *
 * Si la page n'est pas prioritaire, retourne les valeurs par défaut
 * (tous false) — le template reste inchangé.
 */
export async function getPageEnhancements(pathname: string): Promise<PageEnhancements> {
  try {
    const priorityData = await getPriorityData(pathname)

    if (!priorityData) {
      return DEFAULT_ENHANCEMENTS
    }

    // Page prioritaire non encore marquée enhanced : appliquer tous les blocs
    // Page déjà enhanced : continuer à afficher les blocs
    const enhancements: PageEnhancements = {
      isPriority: true,
      showAnswerBlock: true,
      showProviderShowcase: true,
      showPricingTable: true,
      showInsightsBlock: true,
      useOptimizedMeta: true,
      priorityData,
    }

    // Log l'application des enrichissements
    await logEnhancement(pathname, enhancements)

    return enhancements
  } catch (error) {
    logger.error('Error getting page enhancements', error)
    // Fail-open : en cas d'erreur, pas d'enrichissement (backward compatible)
    return DEFAULT_ENHANCEMENTS
  }
}

/**
 * Vérifie simplement si une page doit être enrichie (sans les détails).
 * Utile pour les conditions rapides dans les templates.
 */
export async function shouldEnhancePage(pathname: string): Promise<boolean> {
  try {
    const priorityData = await getPriorityData(pathname)
    return priorityData !== null
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// Enhancement logging
// ---------------------------------------------------------------------------

/**
 * Enregistre l'application des enrichissements dans seo_enhancement_log.
 * Fire-and-forget — ne bloque jamais le rendu.
 */
async function logEnhancement(
  pagePath: string,
  enhancements: PageEnhancements
): Promise<void> {
  try {
    const supabase = createAdminClient()
    const types: EnhancementType[] = []

    if (enhancements.showAnswerBlock) types.push('answer_block')
    if (enhancements.showProviderShowcase) types.push('provider_showcase')
    if (enhancements.showPricingTable) types.push('pricing_table')
    if (enhancements.showInsightsBlock) types.push('insights_block')
    if (enhancements.useOptimizedMeta) types.push('optimized_meta')

    // Batch insert — un log par type d'enrichissement
    const rows = types.map(type => ({
      page_path: pagePath,
      enhancement_type: type,
      applied_at: new Date().toISOString(),
    }))

    if (rows.length > 0) {
      const { error } = await supabase
        .from('seo_enhancement_log')
        .insert(rows)

      if (error) {
        logger.warn('Failed to log enhancement', { pagePath, error: error.message })
      }
    }
  } catch (error) {
    // Le logging ne doit jamais casser le rendu
    logger.warn('Enhancement logging error', { pagePath, error: String(error) })
  }
}
