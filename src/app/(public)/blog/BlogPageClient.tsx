'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'

export interface BlogArticleMeta {
  slug: string
  title: string
  excerpt: string
  category: string
  date: string
  readTime: string
  image: string
}

interface BlogPageClientProps {
  articles: BlogArticleMeta[]
  categories: string[]
}

const ARTICLES_PER_PAGE = 24

export default function BlogPageClient({ articles, categories }: BlogPageClientProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Tous')
  const [visibleCount, setVisibleCount] = useState(ARTICLES_PER_PAGE)

  const filteredArticles = selectedCategory === 'Tous'
    ? articles
    : articles.filter(a => a.category === selectedCategory)

  const visibleArticles = filteredArticles.slice(0, visibleCount)
  const hasMore = visibleCount < filteredArticles.length

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ARTICLES_PER_PAGE)
  }

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat)
    setVisibleCount(ARTICLES_PER_PAGE)
  }

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

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
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative bg-[#0a0f1e] text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37,99,235,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(37,99,235,0.1) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(59,130,246,0.06) 0%, transparent 50%)',
          }} />
          <div className="absolute inset-0 opacity-[0.025]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }} />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-28 md:pt-14 md:pb-36">
          <Breadcrumb
            items={[{ label: 'Blog' }]}
            className="mb-6 text-slate-400 [&_a]:text-slate-400 [&_a:hover]:text-white [&_svg]:text-slate-600"
          />
          <div className="text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-extrabold mb-4 tracking-[-0.025em]">
              Blog & Actualit&eacute;s
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Conseils, guides de prix et tendances pour vos projets de travaux. Par les experts de ServicesArtisans.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
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

      {/* Articles */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleArticles.map((article, index) => {
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
              const isFeatured = index === 0 && selectedCategory === 'Tous'

              return (
                <Link
                  key={article.slug}
                  href={`/blog/${article.slug}`}
                  className={`bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group ${
                    isFeatured ? 'md:col-span-2 lg:col-span-3' : ''
                  }`}
                >
                  {/* Image */}
                  <div className={`relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center overflow-hidden ${
                    isFeatured ? 'h-64 md:h-80' : 'h-48'
                  }`}>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.08),transparent_70%)]" />
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                      backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                      backgroundSize: '40px 40px',
                    }} />
                    <span className={`relative z-10 ${isFeatured ? 'text-7xl' : 'text-5xl'}`}>{article.image}</span>
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
                Voir plus d&apos;articles
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
