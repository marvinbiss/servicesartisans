import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Calendar, Clock } from 'lucide-react'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import { allArticlesMeta, allCategories } from '@/lib/data/blog/articles-index'
import { allArticles } from '@/lib/data/blog/articles'
import { blogCategories, categoryToSlug, normalizeCategory } from '@/lib/data/blog/categories'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import Breadcrumb from '@/components/Breadcrumb'
import { getBlogImage, BLUR_PLACEHOLDER } from '@/lib/data/images'
import BlogPageClient from './BlogPageClient'
import { getPageContent } from '@/lib/cms'
import { CmsContent } from '@/components/CmsContent'

export const revalidate = 86400

export const metadata: Metadata = {
  title: `Blog Travaux 2026 : ${allArticlesMeta.length}+ guides de prix et conseils`,
  description: `Prix artisans, guides rénovation et aides 2026. ${allArticlesMeta.length}+ articles vérifiés par des experts du bâtiment. Tarifs réels + devis gratuit.`,
  alternates: getAlternates('/blog'),
  openGraph: {
    title: `Blog Travaux 2026 : ${allArticlesMeta.length}+ guides de prix et conseils`,
    description: `Prix artisans, guides rénovation et aides 2026. ${allArticlesMeta.length}+ articles vérifiés par des experts du bâtiment.`,
    url: `${SITE_URL}/blog`,
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'ServicesArtisans — Blog travaux et artisanat',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Blog Travaux 2026 : ${allArticlesMeta.length}+ guides de prix et conseils`,
    description: `Prix artisans, guides rénovation et aides 2026. ${allArticlesMeta.length}+ articles vérifiés par des experts du bâtiment.`,
    images: [`${SITE_URL}/opengraph-image`],
  },
}

interface PageProps {
  searchParams: Promise<{ tag?: string }>
}

export default async function BlogPage({ searchParams }: PageProps) {
  const { tag } = await searchParams

  const cmsPage = await getPageContent('blog', 'static')

  if (cmsPage?.content_html) {
    return (
      <div className="min-h-screen bg-sand-50">
        <section className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="font-heading text-3xl font-bold text-charcoal-900">{cmsPage.title}</h1>
          </div>
        </section>
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4">
            <CmsContent html={cmsPage.content_html} />
          </div>
        </section>
      </div>
    )
  }

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Blog Artisanat & Travaux',
    description: "Conseils, guides et actualités sur l'artisanat et les travaux de rénovation.",
    url: `${SITE_URL}/blog`,
    numberOfItems: allArticlesMeta.length,
    hasPart: allArticlesMeta.slice(0, 10).map((a) => ({
      '@type': 'BlogPosting',
      headline: a.title,
      url: `${SITE_URL}/blog/${a.slug}`,
      datePublished: a.date,
      author: (() => {
        const authorName = allArticles[a.slug]?.author || 'ServicesArtisans'
        return authorName === 'ServicesArtisans'
          ? {
              '@type': 'Organization',
              name: 'Équipe éditoriale ServicesArtisans',
              url: `${SITE_URL}/a-propos`,
              '@id': `${SITE_URL}#organization`,
            }
          : { '@type': 'Person', name: authorName }
      })(),
    })),
  }

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Blog', url: '/blog' },
  ])

  // Category article counts for the cross-link section — top 8 by article count
  const categoryCounts = blogCategories
    .map((c) => ({
      ...c,
      count: allArticlesMeta.filter((a) => categoryToSlug(normalizeCategory(a.category)) === c.slug)
        .length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  // First 12 articles for SSR — Google sees real content on first paint
  const SSR_COUNT = 12
  const ssrArticles = allArticlesMeta.slice(0, SSR_COUNT)

  const categoryColors: Record<string, string> = {
    Conseils: 'bg-amber-100 text-amber-700',
    Tarifs: 'bg-emerald-100 text-emerald-700',
    'Fiches métier': 'bg-primary-100 text-primary-600',
    Guides: 'bg-purple-100 text-purple-700',
    'Guides pratiques': 'bg-primary-100 text-primary-600',
    Réglementation: 'bg-sand-200 text-charcoal-700',
    'Aides & Subventions': 'bg-green-100 text-green-700',
    Saisonnier: 'bg-lime-100 text-lime-700',
    Sécurité: 'bg-red-100 text-red-700',
    Énergie: 'bg-teal-100 text-teal-700',
    DIY: 'bg-orange-100 text-orange-700',
    Inspiration: 'bg-pink-100 text-pink-700',
    Tendances: 'bg-purple-100 text-purple-700',
    Rénovation: 'bg-emerald-100 text-emerald-700',
    Actualités: 'bg-rose-100 text-rose-700',
    Décoration: 'bg-pink-100 text-pink-700',
    Budget: 'bg-orange-100 text-orange-700',
  }

  return (
    <>
      <JsonLd data={[collectionSchema, breadcrumbSchema]} />

      {/* Server-rendered hero with H1 — visible to crawlers */}
      <section className="relative bg-charcoal-950 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,107,75,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(232,107,75,0.1) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(232,107,75,0.06) 0%, transparent 50%)',
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-sand-50 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-28 md:pt-14 md:pb-36">
          <Breadcrumb
            items={[{ label: 'Blog' }]}
            className="mb-6 text-charcoal-400 [&_a]:text-charcoal-400 [&_a:hover]:text-white [&_svg]:text-charcoal-600"
          />
          <div className="text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-extrabold mb-4 tracking-[-0.025em]">
              Blog & Actualités
            </h1>
            <p className="text-xl text-charcoal-400 max-w-2xl mx-auto">
              Conseils, guides de prix et tendances pour vos projets de travaux. Par les experts de
              ServicesArtisans.
            </p>
          </div>
        </div>
      </section>

      {/* Server-rendered article grid — first 12 articles visible in HTML for SEO */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ssrArticles.map((article, index) => {
              const badgeColor =
                categoryColors[article.category] || 'bg-primary-100 text-primary-600'
              const isFeatured = index === 0

              return (
                <Link
                  key={article.slug}
                  href={`/blog/${article.slug}`}
                  className={`bg-white rounded-2xl border border-sand-300 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group ${
                    isFeatured ? 'md:col-span-2 lg:col-span-3' : ''
                  }`}
                >
                  <div
                    className={`relative overflow-hidden ${isFeatured ? 'h-64 md:h-80' : 'h-48'}`}
                  >
                    <Image
                      src={getBlogImage(article.slug, article.category).src}
                      alt={getBlogImage(article.slug, article.category).alt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes={
                        isFeatured
                          ? '(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 100vw'
                          : '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
                      }
                      placeholder="blur"
                      blurDataURL={BLUR_PLACEHOLDER}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <span
                      className={`absolute top-4 left-4 z-10 ${badgeColor} px-3 py-1 rounded-full text-xs font-semibold`}
                    >
                      {article.category}
                    </span>
                  </div>
                  <div className="p-6">
                    <h2
                      className={`font-bold text-charcoal-900 mb-2 group-hover:text-primary-500 transition-colors duration-200 ${
                        isFeatured ? 'text-2xl md:text-3xl font-heading' : 'text-lg'
                      }`}
                    >
                      {article.title}
                    </h2>
                    <p
                      className={`text-charcoal-600 mb-4 ${isFeatured ? 'text-base max-w-3xl' : 'text-sm'}`}
                    >
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-sand-200">
                      <div className="flex items-center gap-4 text-sm text-charcoal-500">
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
                      <span className="text-primary-500 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                        Lire
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Client component for interactive features (filters, search, load more) */}
      <BlogPageClient articles={allArticlesMeta} categories={allCategories} initialTag={tag} />

      {/* Crawlable category links — server-rendered for SEO */}
      <section className="py-12 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-charcoal-900 mb-8 border-l-4 border-primary-400 pl-4">
            Parcourir par catégorie
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categoryCounts.map((c) => {
              const color = categoryColors[c.label] || 'bg-sand-100 text-charcoal-700'
              return (
                <Link
                  key={c.slug}
                  href={`/blog/categorie/${c.slug}`}
                  className="flex items-center justify-between p-4 bg-sand-50 hover:bg-white rounded-xl border border-sand-200 hover:border-sand-300 hover:shadow-sm transition-all group"
                >
                  <div>
                    <span
                      className={`inline-block ${color} px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1`}
                    >
                      {c.label}
                    </span>
                    <p className="text-sm text-charcoal-500 mt-1">
                      {c.count} article{c.count > 1 ? 's' : ''}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-charcoal-400 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
                </Link>
              )
            })}
          </div>
          {blogCategories.length > 8 && (
            <div className="text-center mt-6">
              <p className="text-sm text-charcoal-500">
                Et {blogCategories.length - 8} autres catégories disponibles via les filtres
                ci-dessus.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
