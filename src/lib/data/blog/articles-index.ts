/**
 * Lightweight article metadata for the blog index page.
 * This avoids importing the full article content into the client bundle.
 */

import { allArticles } from './articles'

export interface BlogArticleMeta {
  slug: string
  title: string
  excerpt: string
  category: string
  tags: string[]
  date: string
  readTime: string
  image: string
}

/** Map category to a default emoji for the blog listing grid */
export const categoryEmoji: Record<string, string> = {
  Tarifs: '💰',
  Conseils: '💡',
  'Fiches métier': '👷',
  Guides: '📋',
  Réglementation: '⚖️',
  'Aides & Subventions': '🏛️',
  Saisonnier: '🌿',
  Sécurité: '🔒',
  Securite: '🔒',
  Énergie: '⚡',
  Energie: '⚡',
  DIY: '🔧',
  Inspiration: '✨',
  Matériaux: '🧱',
  Urgences: '🚨',
}

/** Emojis assigned to the original 27 articles (preserve exact existing ones) */
const existingEmojis: Record<string, string> = {
  'comment-choisir-son-plombier': '🔧',
  'renovation-energetique-aides-2026': '🏠',
  'tendances-salle-de-bain-2026': '🛁',
  'devis-travaux-comprendre': '📋',
  // 'isolation-thermique-guide' removed — redirected to prix-isolation-thermique-2026-tarifs
  'electricite-normes-securite': '⚡',
  'peinture-interieure-conseils': '🎨',
  'chauffage-solution-economique': '🔥',
  'combien-coute-un-plombier-tarifs-devis': '💰',
  'trouver-artisan-verifie-siren': '🔍',
  'renovation-maison-par-ou-commencer': '🏗️',
  'artisan-pas-cher-attention-arnaques': '🚨',
  'prix-plombier-2026-tarifs-horaires': '🔧',
  'aide-maprimerenov-2026-montants-conditions': '🏛️',
  'comment-verifier-artisan-avant-engager': '✅',
  'travaux-renovation-energetique-par-ou-commencer': '🌱',
  'devis-travaux-comment-comparer-choisir': '📊',
  '10-arnaques-courantes-batiment': '⚠️',
  'prix-electricien-2026-tarifs-travaux': '⚡',
  'prix-peintre-batiment-2026-guide-complet': '🎨',
  'garantie-decennale-tout-savoir': '🛡️',
  'comment-choisir-cuisine-equipee-guide': '🍳',
  // 'isolation-thermique-meilleures-solutions-2026' removed — redirected to prix-isolation-thermique-2026-tarifs
  // 'prix-couvreur-2026-cout-refection-toiture' removed — redirected to prix-toiture-2026-refection-reparation-materiaux
  'renovation-salle-de-bain-budget-etapes': '🚿',
  'chauffage-pompe-chaleur-vs-chaudiere-gaz-2026': '🔥',
  'droits-obligations-travaux-chez-soi': '⚖️',
  // Batch prix-btp
  'prix-charpentier-2026-tarifs-travaux': '🪵',
  'prix-zingueur-2026-tarifs-travaux': '💧',
  'prix-etancheiste-2026-tarifs-travaux': '🛡️',
  'prix-platrier-2026-tarifs-travaux': '🏠',
  // Batch prix-design
  'prix-ramoneur-2026-tarifs-travaux': '🔥',
  'prix-paysagiste-2026-tarifs-travaux': '🌳',
  // Batch prix-tech
  'prix-alarme-securite-2026-tarifs-travaux': '🚨',
  'prix-diagnostiqueur-2026-tarifs-travaux': '📋',
  // Batch prix-services
  'prix-demenageur-2026-tarifs-travaux': '🚚',
  'prix-isolation-thermique-2026-tarifs-travaux': '❄️',
  'prix-renovation-energetique-2026-tarifs-travaux': '🌱',
  // 200 articles prix x ville (batch-prix-villes.ts) — catégorie Tarifs, emoji par défaut via categoryEmoji
  // 50 articles thématiques (aides, urgences, guides, saisonniers) — emoji par défaut via categoryEmoji
  // 22 articles prestations/problèmes/projets (batch-prestations-problemes.ts) — catégories Tarifs/Conseils/Guides/Sécurité, emoji par défaut via categoryEmoji
  // 10 articles piliers 3000+ mots (batch-piliers-2026.ts)
  'renovation-maison-guide-ultime-2026': '🏠',
  'prix-renovation-salle-de-bain-guide-complet-2026': '🚿',
  'prix-renovation-cuisine-guide-complet-2026': '🍳',
  'isolation-maison-guide-ultime-2026': '❄️',
  'pompe-a-chaleur-guide-achat-2026': '🔥',
  'travaux-maison-par-ou-commencer-guide-2026': '🏗️',
  'extension-maison-prix-demarches-2026': '📐',
  'choisir-artisan-guide-anti-arnaque-2026': '🛡️',
  'aides-renovation-energetique-cumul-2026': '🏛️',
  'prix-toiture-refection-complete-2026': '🏠',
  // Bloc 3 Action #3 Ahrefs 2026-05-03 — striking distance "isolation phonique mur mitoyen"
  'isolation-phonique-mur-mitoyen': '🔇',
  // Vague E Tarifs 2026-05-04 (audit STRATEGIE-RENOVATION-ENERGETIQUE.md)
  'prix-isolation-combles-2026': '🏠',
  'prix-chaudiere-condensation-2026': '🔥',
  'prix-poele-granules-2026': '🔥',
  'prix-audit-energetique-2026': '📊',
}

/** Normalize non-accented category names to their accented equivalents */
const categoryNormalize: Record<string, string> = {
  Securite: 'Sécurité',
  Energie: 'Énergie',
}

function normalizeCategory(category: string): string {
  return categoryNormalize[category] || category
}

function getEmoji(slug: string, category: string): string {
  if (existingEmojis[slug]) return existingEmojis[slug]
  return categoryEmoji[category] || categoryEmoji[normalizeCategory(category)] || '📰'
}

/** All articles as lightweight metadata, sorted by date (newest first) */
export const allArticlesMeta: BlogArticleMeta[] = Object.entries(allArticles)
  .map(([slug, a]) => ({
    slug,
    title: a.title,
    excerpt: a.excerpt,
    category: normalizeCategory(a.category),
    tags: a.tags || [],
    date: a.date,
    readTime: a.readTime,
    image: getEmoji(slug, a.category),
  }))
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

/** All unique categories across every article */
export const allCategories: string[] = [
  'Tous',
  ...Array.from(new Set(allArticlesMeta.map((a) => a.category))).sort(),
]
