import Link from 'next/link'
import { BookOpen, Euro, FileText, Wrench, AlertCircle, BarChart3 } from 'lucide-react'
import { getClusterLinksForArticle, getClusterRelatedArticles } from '@/lib/seo/topical-clusters'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BlogClusterLinksProps {
  articleSlug: string
  /** Max cluster service links per service */
  maxServiceLinks?: number
  /** Max related articles to show */
  maxRelatedArticles?: number
}

// ---------------------------------------------------------------------------
// Type icon mapping
// ---------------------------------------------------------------------------

const TYPE_ICONS: Record<string, typeof Euro> = {
  pillar: Wrench,
  tarifs: Euro,
  devis: FileText,
  avis: Euro,
  urgence: AlertCircle,
  blog: BookOpen,
  probleme: AlertCircle,
  service: Wrench,
  barometre: BarChart3,
  guide: BookOpen,
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Affiche les liens du cluster thematique pour un article de blog.
 * Detecte automatiquement le(s) service(s) associe(s) a l'article
 * et affiche les pages satellites du cluster.
 *
 * Deux sections :
 * 1. "Articles liés" — autres articles du meme cluster
 * 2. "Pages associees" — service hub, tarifs, devis, problemes
 *
 * Server component.
 */
export default function BlogClusterLinks({
  articleSlug,
  maxServiceLinks = 5,
  maxRelatedArticles = 4,
}: BlogClusterLinksProps) {
  const clusterData = getClusterLinksForArticle(articleSlug, maxServiceLinks)
  const relatedArticles = getClusterRelatedArticles(articleSlug, maxRelatedArticles)

  const hasClusterLinks = clusterData.some((c) => c.links.length > 0)
  const hasRelatedArticles = relatedArticles.length > 0

  if (!hasClusterLinks && !hasRelatedArticles) return null

  return (
    <section className="py-10 border-t border-charcoal-200 bg-sand-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Related articles from same cluster */}
        {hasRelatedArticles && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-stone-800 uppercase tracking-wider mb-4">
              Articles liés
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {relatedArticles.map(({ slug, title }) => (
                <Link
                  key={slug}
                  href={`/blog/${slug}`}
                  className="group flex items-start gap-3 p-4 bg-white rounded-xl border border-charcoal-200 hover:border-primary-200 hover:shadow-sm transition-all"
                  prefetch={false}
                >
                  <BookOpen className="w-4 h-4 mt-0.5 text-primary-400 flex-shrink-0" />
                  <span className="text-sm text-stone-700 group-hover:text-primary-600 transition-colors leading-snug">
                    {title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Cluster links per service */}
        {clusterData.map(({ service, serviceName, links }) => {
          if (links.length === 0) return null

          // Filter out blog links (we already show related articles above)
          const nonBlogLinks = links.filter((l) => l.type !== 'blog')
          if (nonBlogLinks.length === 0) return null

          return (
            <div key={service} className="mb-6 last:mb-0">
              <h3 className="text-sm font-semibold text-stone-800 uppercase tracking-wider mb-3">
                Dossier {serviceName.toLowerCase()}
              </h3>
              <div className="flex flex-wrap gap-2">
                {nonBlogLinks.map((link) => {
                  const Icon = TYPE_ICONS[link.type] || Wrench
                  return (
                    <Link
                      key={link.path}
                      href={link.path}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-stone-600 bg-white hover:bg-primary-50 hover:text-primary-600 rounded-full border border-charcoal-200 hover:border-primary-200 transition-colors"
                      prefetch={false}
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{link.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
