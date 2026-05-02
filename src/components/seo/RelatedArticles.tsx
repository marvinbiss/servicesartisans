import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { allArticlesMeta } from '@/lib/data/blog/articles-index'

interface RelatedArticlesProps {
  serviceSlug: string
  /** Max articles to display (default 5) */
  limit?: number
}

/**
 * Server component — displays 3-5 blog articles related to a given service.
 * Matches articles whose slug or title contains the service slug or common variants.
 * Uses lightweight metadata (no full content) for optimal bundle size.
 */
export default function RelatedArticles({ serviceSlug, limit = 5 }: RelatedArticlesProps) {
  // Build search terms from the service slug (e.g. "plombier" → ["plombier", "plomberie"])
  const searchTerms = buildSearchTerms(serviceSlug)

  // Score and rank articles by relevance
  const scored = allArticlesMeta
    .map((article) => {
      let score = 0
      const slugLower = article.slug.toLowerCase()
      const titleLower = article.title.toLowerCase()
      const excerptLower = article.excerpt.toLowerCase()
      const tagsLower = article.tags.map((t) => t.toLowerCase())

      for (const term of searchTerms) {
        // Slug match (strongest signal)
        if (slugLower.includes(term)) score += 3
        // Title match
        if (titleLower.includes(term)) score += 2
        // Tag match
        if (tagsLower.some((t) => t.includes(term) || term.includes(t))) score += 2
        // Excerpt match
        if (excerptLower.includes(term)) score += 1
      }

      return { article, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  if (scored.length === 0) return null

  return (
    <section className="py-12 bg-sand-50 border-t border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-50 rounded-lg">
            <BookOpen className="w-5 h-5 text-primary-500" />
          </div>
          <h2 className="text-xl font-bold text-charcoal-900">Guides et conseils</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scored.map(({ article }) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="flex flex-col gap-2 p-5 bg-white hover:bg-primary-50 rounded-xl border border-sand-200 hover:border-primary-300 shadow-sm transition-all group"
            >
              <span className="font-medium text-charcoal-900 group-hover:text-primary-600 text-sm leading-snug">
                {article.title}
              </span>
              <span className="text-xs text-charcoal-500 leading-relaxed line-clamp-2">
                {article.excerpt}
              </span>
              <span className="text-xs text-primary-500 font-medium mt-auto pt-1">
                Lire l&apos;article →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Build search terms from a service slug, including common French morphological variants */
function buildSearchTerms(slug: string): string[] {
  const terms = new Set<string>()
  terms.add(slug)

  // Common trade-name → topic mappings
  const variants: Record<string, string[]> = {
    plombier: ['plombier', 'plomberie', 'plombiers'],
    electricien: ['electricien', 'electrique', 'electricite', 'electriques', 'electriq'],
    chauffagiste: ['chauffagiste', 'chauffage', 'chaudiere', 'pompe-a-chaleur'],
    couvreur: ['couvreur', 'toiture', 'couverture', 'toit'],
    menuisier: ['menuisier', 'menuiserie', 'fenetre', 'bois'],
    'peintre-en-batiment': ['peintre', 'peinture', 'ravalement'],
    macon: ['macon', 'maconnerie', 'beton', 'fondation'],
    carreleur: ['carreleur', 'carrelage', 'faience'],
    cuisiniste: ['cuisiniste', 'cuisine'],
    climaticien: ['climaticien', 'climatisation', 'clim'],
    vitrier: ['vitrier', 'vitre', 'vitrage', 'verre'],
    charpentier: ['charpentier', 'charpente', 'ossature'],
    serrurier: ['serrurier', 'serrure', 'serrurerie'],
    facade: ['facade', 'ravalement', 'enduit'],
    'isolation-thermique': ['isolation', 'isolant', 'thermique'],
    'pompe-a-chaleur': ['pompe-a-chaleur', 'pac', 'chauffage'],
    'salle-de-bain': ['salle-de-bain', 'bain', 'douche', 'sanitaire'],
  }

  const found = variants[slug]
  if (found) {
    found.forEach((t) => terms.add(t))
  }

  // Also add slug parts (e.g. "peintre-en-batiment" → "peintre", "batiment")
  slug
    .split('-')
    .filter((p) => p.length > 2 && p !== 'en' && p !== 'de')
    .forEach((p) => terms.add(p))

  return Array.from(terms)
}
