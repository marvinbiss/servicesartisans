import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Calendar, User, Clock, ArrowLeft, Facebook, Twitter, Linkedin, Tag, ChevronRight } from 'lucide-react'
import { SITE_URL } from '@/lib/seo/config'
import { getBlogArticleSchema } from '@/lib/seo/blog-schema'
import { allArticles, articleSlugs } from '@/lib/data/blog/articles'
import { categoryEmoji } from '@/lib/data/blog/articles-index'
import { getRelatedServiceLinks, getRelatedArticleSlugs } from '@/lib/seo/internal-links'
import JsonLd from '@/components/JsonLd'
import { ReadingProgress } from '@/components/ReadingProgress'

/** Lightweight map for the related-articles scorer */
const allArticlesMeta: Record<string, { category: string; tags: string[]; title: string }> =
  Object.fromEntries(
    Object.entries(allArticles).map(([slug, a]) => [
      slug,
      { category: a.category, tags: a.tags, title: a.title },
    ])
  )

export function generateStaticParams() {
  return articleSlugs.map((slug) => ({ slug }))
}

export const dynamicParams = false

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = allArticles[slug]
  if (!article) return { title: 'Article non trouvé' }

  return {
    title: `${article.title} | Blog ServicesArtisans`,
    description: article.excerpt,
    alternates: {
      canonical: `${SITE_URL}/blog/${slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.date,
      section: article.category,
      tags: article.tags,
      url: `${SITE_URL}/blog/${slug}`,
    },
  }
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = allArticles[slug]

  if (!article) {
    notFound()
  }

  const schemas = getBlogArticleSchema(article, slug)
  const serviceLinks = getRelatedServiceLinks(slug, article.category, article.tags)
  const relatedArticles = getRelatedArticleSlugs(
    slug,
    article.category,
    article.tags,
    articleSlugs,
    allArticlesMeta
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={schemas} />
      <ReadingProgress />

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au blog
          </Link>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category */}
        <div className="max-w-3xl mx-auto mb-4">
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            {article.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-heading text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-gray-900 mb-6 max-w-3xl mx-auto leading-tight tracking-tight">
          {article.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-6 text-gray-500 mb-10 max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            {article.author}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date(article.date).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {article.readTime} de lecture
          </div>
        </div>

        {/* Article Hero Image Area */}
        <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center mb-12">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.08),transparent_70%)]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }} />
          <span className="text-7xl mb-4 relative z-10">{categoryEmoji[article.category] || '📝'}</span>
          <span className="text-sm font-medium text-gray-400 uppercase tracking-wider relative z-10">{article.category}</span>
        </div>

        {/* Content — optimal reading width */}
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-lg max-w-none prose-headings:font-heading prose-h2:text-2xl prose-h2:font-bold prose-h2:text-gray-900 prose-h2:mt-10 prose-h2:mb-4 prose-p:text-gray-700 prose-p:leading-relaxed prose-blockquote:border-l-4 prose-blockquote:border-amber-400 prose-blockquote:bg-amber-50/50 prose-blockquote:rounded-r-xl prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:not-italic prose-blockquote:text-gray-700">
            {article.content.map((paragraph, index) => {
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={index}>
                    {paragraph.replace('## ', '')}
                  </h2>
                )
              }
              return (
                <p key={index}>
                  {paragraph}
                </p>
              )
            })}
          </div>

          {/* Services associes — gradient background */}
          {serviceLinks.length > 0 && (
            <div className="mt-12 p-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100/80 rounded-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-amber-500 rounded-full" />
                Services associés
              </h3>
              <ul className="space-y-3">
                {serviceLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium group transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Articles connexes */}
          {relatedArticles.length > 0 && (
            <div className="mt-10">
              <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-blue-500 rounded-full" />
                Articles connexes
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedArticles.map(({ slug: relSlug, title: relTitle }) => (
                  <Link
                    key={relSlug}
                    href={`/blog/${relSlug}`}
                    className="group p-5 bg-white border border-gray-200 rounded-2xl hover:border-amber-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">{relTitle}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="flex items-center gap-3 mt-10 pt-8 border-t border-gray-200">
            <Tag className="w-5 h-5 text-gray-400 shrink-0" />
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Share */}
          <div className="flex items-center gap-4 mt-8 pt-8 border-t border-gray-200">
            <span className="text-gray-600 font-medium">Partager :</span>
            <div className="flex gap-2">
              <button className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 hover:scale-110 transition-all duration-200">
                <Facebook className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 bg-sky-500 text-white rounded-full flex items-center justify-center hover:bg-sky-600 hover:scale-110 transition-all duration-200">
                <Twitter className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 bg-blue-700 text-white rounded-full flex items-center justify-center hover:bg-blue-800 hover:scale-110 transition-all duration-200">
                <Linkedin className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Author Box */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{article.author}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Rédacteur chez ServicesArtisans, passionné par le monde de l&apos;artisanat et de la rénovation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* CTA */}
      <div className="relative py-16 overflow-hidden bg-gradient-to-br from-[#0a0f1e] via-[#111827] to-[#0a0f1e]">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(245,158,11,0.06) 0%, transparent 60%)',
        }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4">
            Besoin d&apos;un artisan ?
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Trouvez le professionnel qu&apos;il vous faut en quelques clics
          </p>
          <Link
            href="/devis"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-slate-900 font-bold px-8 py-4 rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-[0_8px_30px_-4px_rgba(245,158,11,0.5)] hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] transition-all duration-200"
          >
            Demander un devis gratuit
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
