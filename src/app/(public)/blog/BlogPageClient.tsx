'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, ArrowRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { getBlogImage, BLUR_PLACEHOLDER } from '@/lib/data/images'

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

interface BlogPageClientProps {
  articles: BlogArticleMeta[]
  categories: string[]
  initialTag?: string
}

const ARTICLES_PER_PAGE = 12

export default function BlogPageClient({ articles, categories, initialTag }: BlogPageClientProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState('')
  const [newsletterConsent, setNewsletterConsent] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('Tous')
  const [activeTag, setActiveTag] = useState(initialTag || '')
  const [visibleCount, setVisibleCount] = useState(ARTICLES_PER_PAGE)

  // When no filter is active, the first 12 articles are already server-rendered above
  const isDefaultView = selectedCategory === 'Tous' && !activeTag

  const categoryFiltered = selectedCategory === 'Tous'
    ? articles
    : articles.filter(a => a.category === selectedCategory)

  const filteredArticles = activeTag
    ? categoryFiltered.filter(a =>
        a.tags?.some(t => t.toLowerCase() === activeTag.toLowerCase()) ||
        a.category.toLowerCase() === activeTag.toLowerCase()
      )
    : categoryFiltered

  const visibleArticles = filteredArticles.slice(0, visibleCount)
  const hasMore = visibleCount < filteredArticles.length

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ARTICLES_PER_PAGE)
  }

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat)
    setActiveTag('')
    setVisibleCount(ARTICLES_PER_PAGE)
  }

  const handleClearTag = () => {
    setActiveTag('')
    setVisibleCount(ARTICLES_PER_PAGE)
    // Update URL without the tag param
    window.history.replaceState(null, '', '/blog')
  }

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!newsletterConsent) {
      setError('Veuillez accepter la politique de confidentialité pour vous inscrire.')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription')
      }

      setIsSubscribed(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-gray-50">
      {/* Categories — interactive filters */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-3 overflow-x-auto md:overflow-x-visible md:flex-wrap scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  cat === selectedCategory
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Active tag filter indicator */}
      {activeTag && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Filtré par :</span>
              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">{activeTag}</span>
              <button
                onClick={handleClearTag}
                className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                &times; Effacer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Articles — when filtered, show all matching articles; default view shows only extras beyond SSR */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!isDefaultView && (
            <p className="text-sm text-gray-500 mb-6">
              {filteredArticles.length} article{filteredArticles.length > 1 ? 's' : ''} trouvé{filteredArticles.length > 1 ? 's' : ''}
            </p>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(isDefaultView
              ? visibleArticles.slice(ARTICLES_PER_PAGE)
              : visibleArticles
            ).map((article, index) => {
              // Category color mapping for pill badges
              const categoryColors: Record<string, string> = {
                'Guides pratiques': 'bg-blue-100 text-blue-700',
                'Tendances': 'bg-purple-100 text-purple-700',
                'Rénovation': 'bg-emerald-100 text-emerald-700',
                'Conseils': 'bg-amber-100 text-amber-700',
                'Actualités': 'bg-rose-100 text-rose-700',
                'Énergie': 'bg-green-100 text-green-700',
                'Décoration': 'bg-pink-100 text-pink-700',
                'Budget': 'bg-orange-100 text-orange-700',
              }
              const badgeColor = categoryColors[article.category] || 'bg-blue-100 text-blue-700'
              const isFeatured = index === 0 && !isDefaultView && selectedCategory === 'Tous' && !activeTag

              return (
                <Link
                  key={article.slug}
                  href={`/blog/${article.slug}`}
                  className={`bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group ${
                    isFeatured ? 'md:col-span-2 lg:col-span-3' : ''
                  }`}
                >
                  {/* Image */}
                  <div className={`relative overflow-hidden ${
                    isFeatured ? 'h-64 md:h-80' : 'h-48'
                  }`}>
                    <Image
                      src={getBlogImage(article.slug, article.category).src}
                      alt={getBlogImage(article.slug, article.category).alt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes={isFeatured
                        ? '(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 100vw'
                        : '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'}
                      placeholder="blur"
                      blurDataURL={BLUR_PLACEHOLDER}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    {/* Category badge overlay */}
                    <span className={`absolute top-4 left-4 z-10 ${badgeColor} px-3 py-1 rounded-full text-xs font-semibold`}>
                      {article.category}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h2 className={`font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200 ${
                      isFeatured ? 'text-2xl md:text-3xl font-heading' : 'text-lg'
                    }`}>
                      {article.title}
                    </h2>
                    <p className={`text-gray-600 mb-4 ${isFeatured ? 'text-base max-w-3xl' : 'text-sm'}`}>
                      {article.excerpt}
                    </p>

                    {/* Bottom bar — date, read time, and CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(article.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {article.readTime}
                        </span>
                      </div>
                      <span className="text-blue-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                        Lire
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="text-center mt-12">
              <button
                onClick={handleLoadMore}
                className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Voir plus d&apos;articles ({filteredArticles.length - visibleCount} restants)
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl font-bold text-white mb-4">
            Restez informé
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Recevez nos derniers articles et conseils directement dans votre boîte mail
          </p>
          {isSubscribed ? (
            <div className="max-w-md mx-auto bg-white/20 rounded-lg p-6 flex items-center justify-center gap-3 text-white">
              <CheckCircle className="w-6 h-6" />
              <span className="font-medium">Merci ! Vous êtes inscrit à notre newsletter.</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre email"
                  required
                  className="flex-1 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-300"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "S'inscrire"
                  )}
                </button>
              </div>
              <label className="flex items-start gap-2 mt-4 text-left">
                <input
                  type="checkbox"
                  checked={newsletterConsent}
                  onChange={(e) => setNewsletterConsent(e.target.checked)}
                  className="mt-1 rounded border-blue-300 text-blue-600 focus:ring-blue-300"
                />
                <span className="text-sm text-blue-100">
                  J&apos;accepte que mes données soient utilisées pour recevoir la newsletter. Consultez notre{' '}
                  <Link href="/confidentialite" className="underline hover:text-white">
                    politique de confidentialité
                  </Link>.
                </span>
              </label>
              {error && (
                <div className="mt-4 flex items-center justify-center gap-2 text-red-200">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
