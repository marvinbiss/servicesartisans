import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Calendar, Clock, ArrowRight, ArrowLeft } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { SITE_URL, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { allArticlesMeta } from '@/lib/data/blog/articles-index'
import { allArticles } from '@/lib/data/blog/articles'
import {
  blogCategories,
  getCategoryBySlug,
  categoryToSlug,
  normalizeCategory,
} from '@/lib/data/blog/categories'
import { getBlogImage, BLUR_PLACEHOLDER } from '@/lib/data/images'
import { ArticleMeta } from '@/components/ArticleMeta'
import EnBrefBox from '@/components/seo/EnBrefBox'
import TldrBlock from '@/components/flagship/TldrBlock'
import { monthlyAnchorIso } from '@/lib/seo/sprint-helpers'
import { getPublishedDate } from '@/lib/seo/published-dates'

// Pre-render all category pages at build time
export function generateStaticParams() {
  return blogCategories.map((c) => ({ category: c.slug }))
}

export const dynamicParams = false
export const revalidate = 86400

interface PageProps {
  params: Promise<{ category: string }>
}

const PUBLISHED_DATE = getPublishedDate('/blog/categorie')

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: categorySlug } = await params
  const cat = getCategoryBySlug(categorySlug)
  if (!cat) return { title: 'Catégorie non trouvée' }

  return {
    title: cat.metaTitle,
    description: cat.metaDescription,
    alternates: getAlternates(`/blog/categorie/${categorySlug}`),
    robots: {
      index: true,
      follow: true,
      'max-snippet': -1 as const,
      'max-image-preview': 'large' as const,
    },
    openGraph: {
      ...getOgDefaults(),
      title: cat.metaTitle,
      description: cat.metaDescription,
      url: `${SITE_URL}/blog/categorie/${categorySlug}`,
      type: 'website',
      locale: 'fr_FR',
    },
    twitter: {
      card: 'summary_large_image',
      title: cat.metaTitle,
      description: cat.metaDescription,
    },
  }
}

export default async function BlogCategoryPage({ params }: PageProps) {
  const { category: categorySlug } = await params
  const cat = getCategoryBySlug(categorySlug)
  if (!cat) notFound()

  const articles = allArticlesMeta.filter(
    (a) => categoryToSlug(normalizeCategory(a.category)) === categorySlug
  )

  // Other categories for cross-linking
  const otherCategories = blogCategories.filter((c) => c.slug !== categorySlug)

  // JSON-LD CollectionPage
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: cat.label,
    description: cat.description,
    url: `${SITE_URL}/blog/categorie/${categorySlug}`,
    numberOfItems: articles.length,
    isPartOf: {
      '@type': 'Blog',
      name: 'Blog ServicesArtisans',
      url: `${SITE_URL}/blog`,
    },
    hasPart: articles.slice(0, 10).map((a) => ({
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

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      {
        '@type': 'ListItem',
        position: 3,
        name: cat.label,
        item: `${SITE_URL}/blog/categorie/${categorySlug}`,
      },
    ],
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: cat.metaTitle,
    description: cat.metaDescription,
    url: `${SITE_URL}/blog/categorie/${categorySlug}`,
    datePublished: PUBLISHED_DATE,
    dateModified: monthlyAnchorIso(),
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    image: `${SITE_URL}/opengraph-image`,
    author: {
      '@type': 'Organization',
      name: 'Équipe éditoriale ServicesArtisans',
      url: `${SITE_URL}/a-propos`,
      '@id': `${SITE_URL}#organization`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'ServicesArtisans',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/categorie/${categorySlug}`,
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
  }

  const enBrefPoints = [
    `${articles.length} article${articles.length > 1 ? 's' : ''} dans la catégorie « ${cat.label} »`,
    `Mis à jour mensuellement — sources INSEE, CAPEB, FFB, ANAH`,
    `Rédigé par l'équipe éditoriale + relecture par des artisans partenaires`,
    `Citation autorisée avec lien vers la source — licence CC BY 4.0`,
  ]

  const tldrBullets = [
    `${cat.label} : ${articles.length} guide${articles.length > 1 ? 's' : ''} ${cat.description.toLowerCase()}`,
    `Tous les chiffres et fourchettes proviennent de devis réels et de sources publiques (INSEE, CAPEB, FFB).`,
    `Articles relus avant publication, datés et mis à jour ; chaque guide cite ses sources.`,
    `Pour démarrer un projet : demander un devis gratuit auprès d'artisans certifiés via ServicesArtisans.`,
  ]

  const categoryColors: Record<string, string> = {
    Conseils: 'bg-amber-100 text-amber-700',
    Tarifs: 'bg-emerald-100 text-emerald-700',
    'Fiches métier': 'bg-primary-100 text-primary-600',
    Guides: 'bg-purple-100 text-purple-700',
    Réglementation: 'bg-sand-200 text-charcoal-700',
    'Aides & Subventions': 'bg-green-100 text-green-700',
    Saisonnier: 'bg-lime-100 text-lime-700',
    Sécurité: 'bg-red-100 text-red-700',
    Énergie: 'bg-teal-100 text-teal-700',
    DIY: 'bg-orange-100 text-orange-700',
    Inspiration: 'bg-pink-100 text-pink-700',
    Matériaux: 'bg-cyan-100 text-cyan-700',
    Urgences: 'bg-red-100 text-red-700',
  }

  const badgeColor = categoryColors[cat.label] || 'bg-primary-100 text-primary-600'

  return (
    <>
      <JsonLd data={[articleSchema, collectionSchema, breadcrumbSchema]} />

      <div className="min-h-screen bg-sand-50">
        {/* Hero */}
        <section className="relative bg-charcoal-950 text-white overflow-hidden">
          <div className="absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,107,75,0.18) 0%, transparent 60%)',
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-sand-50 to-transparent" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-28 md:pt-14 md:pb-36">
            <Breadcrumb
              items={[{ label: 'Blog', href: '/blog' }, { label: cat.label }]}
              className="mb-6 text-charcoal-400 [&_a]:text-charcoal-400 [&_a:hover]:text-white [&_svg]:text-charcoal-600"
            />
            <div className="text-center">
              <span
                className={`inline-block ${badgeColor} px-4 py-1.5 rounded-full text-sm font-semibold mb-4`}
              >
                {cat.label}
              </span>
              <h1
                data-speakable="true"
                className="font-heading text-4xl md:text-5xl font-extrabold mb-4 tracking-[-0.025em]"
              >
                {cat.metaTitle.split('—')[0].trim()}
              </h1>
              <p className="text-xl text-charcoal-400 max-w-2xl mx-auto">{cat.description}</p>
              <p className="text-sm text-charcoal-900 mt-3">
                {articles.length} article{articles.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </section>

        {/* Byline + En bref — E-E-A-T signal post-hero */}
        <section className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ArticleMeta
              author="Équipe éditoriale ServicesArtisans"
              authorHref="/a-propos"
              datePublished={PUBLISHED_DATE}
              dateModified={monthlyAnchorIso()}
              className="mb-6"
            />
            <EnBrefBox keyPoints={enBrefPoints} />
          </div>
        </section>

        {/* Articles */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {articles.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-charcoal-500 text-lg">
                  Aucun article dans cette catégorie pour le moment.
                </p>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 mt-4 text-primary-500 font-medium hover:text-primary-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour au blog
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article, index) => {
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
                          {cat.label}
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
                            Lire <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* TL;DR — capture FS Position 0 / AI Overviews */}
        <section className="py-12 bg-white border-t">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <TldrBlock bullets={tldrBullets} />
          </div>
        </section>

        {/* Other categories — cross-linking */}
        <section className="py-12 bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-charcoal-900 mb-8 border-l-4 border-primary-400 pl-4">
              Autres catégories
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {otherCategories.map((c) => {
                const count = allArticlesMeta.filter(
                  (a) => categoryToSlug(normalizeCategory(a.category)) === c.slug
                ).length
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
                        {count} article{count > 1 ? 's' : ''}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-charcoal-400 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* Back to blog */}
        <section className="py-8 bg-sand-50 border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-primary-500 font-medium hover:text-primary-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Tous les articles
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
