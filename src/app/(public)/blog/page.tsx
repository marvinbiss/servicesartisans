import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Calendar, Clock } from 'lucide-react'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import { allArticlesMeta } from '@/lib/data/blog/articles-index'
import { allArticles } from '@/lib/data/blog/articles'
import { blogCategories, categoryToSlug, normalizeCategory } from '@/lib/data/blog/categories'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import Breadcrumb from '@/components/Breadcrumb'
import { getBlogImage, BLUR_PLACEHOLDER } from '@/lib/data/images'
import { allBlogTags } from '@/lib/data/blog/tags'
import BlogNewsletter from './BlogNewsletter'
import { getPageContent } from '@/lib/cms'
import { CmsContent } from '@/components/CmsContent'
import { ArticleMeta } from '@/components/ArticleMeta'
import EnBrefBox from '@/components/seo/EnBrefBox'
import TldrBlock from '@/components/flagship/TldrBlock'
import { monthlyAnchorIso } from '@/lib/seo/sprint-helpers'
import { getPublishedDate } from '@/lib/seo/published-dates'

export const revalidate = 86400

const PUBLISHED_DATE = getPublishedDate('/blog')

export const metadata: Metadata = {
  title: `Blog Travaux 2026 : prix et guides`,
  description: `Prix artisans, guides rénovation et aides 2026. ${allArticlesMeta.length}+ articles vérifiés par des experts du bâtiment. Devis gratuit.`,
  alternates: {
    ...getAlternates('/blog'),
    types: {
      'application/rss+xml': `${SITE_URL}/blog/feed.xml`,
      'application/atom+xml': `${SITE_URL}/blog/atom.xml`,
      'application/feed+json': `${SITE_URL}/blog/feed.json`,
    },
  },
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

export default async function BlogPage() {
  const cmsPage = await getPageContent('blog', 'static')

  if (cmsPage?.content_html) {
    return (
      <div className="min-h-screen bg-sand-50">
        <section className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 data-speakable="true" className="font-heading text-3xl font-bold text-charcoal-900">
              {cmsPage.title}
            </h1>
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

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Blog Travaux 2026 — ${allArticlesMeta.length}+ guides de prix et conseils`,
    description: `Prix artisans, guides rénovation et aides 2026. ${allArticlesMeta.length}+ articles vérifiés par des experts du bâtiment.`,
    url: `${SITE_URL}/blog`,
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
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog` },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
  }

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Blog', url: '/blog' },
  ])

  const faqSchema = getFAQSchema([
    {
      question: 'À quelle fréquence le blog ServicesArtisans est-il mis à jour ?',
      answer: `Nous publions en moyenne 3 à 5 nouveaux articles par semaine. Le blog compte actuellement ${allArticlesMeta.length} guides couvrant les prix des travaux 2026, les aides à la rénovation (MaPrimeRénov', CEE), les fiches métier et les actualités du bâtiment.`,
    },
    {
      question: 'Qui rédige les articles du blog ?',
      answer:
        "Les articles sont rédigés par l'équipe éditoriale ServicesArtisans et, pour les guides techniques, revus par des artisans partenaires et des experts du bâtiment. Chaque article mentionne son auteur, sa date de publication et sa date de dernière mise à jour.",
    },
    {
      question: 'Les prix indiqués sont-ils fiables ?',
      answer:
        "Oui. Les fourchettes de prix sont mises à jour chaque année à partir des devis réels transmis par notre réseau d'artisans et croisées avec les données publiques (INSEE, CAPEB, FFB). Chaque guide prix précise les hypothèses retenues (métrés, gamme de matériaux, région, TVA).",
    },
  ])

  const categoryCounts = blogCategories
    .map((c) => ({
      ...c,
      count: allArticlesMeta.filter((a) => categoryToSlug(normalizeCategory(a.category)) === c.slug)
        .length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  const SSR_COUNT = 12
  const ssrArticles = allArticlesMeta.slice(0, SSR_COUNT)

  const enBrefPoints = [
    `${allArticlesMeta.length}+ guides experts publiés`,
    `${blogCategories.length} catégories : tarifs, aides, fiches métier, rénovation`,
    `Mis à jour mensuellement — sources INSEE, CAPEB, FFB, ANAH`,
  ]

  const tldrBullets = [
    `Le blog compte ${allArticlesMeta.length} articles vérifiés sur ${blogCategories.length} catégories.`,
    `Fourchettes de prix actualisées chaque année — devis réels + INSEE, CAPEB, FFB.`,
    `Articles + études propriétaires sous Creative Commons BY 4.0.`,
  ]

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

  const topTags = allBlogTags.slice(0, 30)

  return (
    <>
      <JsonLd data={[articleSchema, collectionSchema, breadcrumbSchema, faqSchema]} />

      <section className="relative bg-charcoal-950 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,107,75,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(232,107,75,0.1) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(232,107,75,0.06) 0%, transparent 50%)',
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
            <h1
              data-speakable="true"
              className="font-heading text-4xl md:text-5xl font-extrabold mb-4 tracking-[-0.025em]"
            >
              Blog & Actualités
            </h1>
            <p className="text-xl text-charcoal-400 max-w-2xl mx-auto">
              Conseils, guides de prix et tendances pour vos projets de travaux.
            </p>
          </div>
        </div>
      </section>

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

      <section className="py-16 bg-sand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-charcoal-900 mb-8 border-l-4 border-primary-400 pl-4">
            Derniers articles
          </h2>
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
                    <h3
                      className={`font-bold text-charcoal-900 mb-2 group-hover:text-primary-500 transition-colors duration-200 ${
                        isFeatured ? 'text-2xl md:text-3xl font-heading' : 'text-lg'
                      }`}
                    >
                      {article.title}
                    </h3>
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
        </div>
      </section>

      <section className="py-12 bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <TldrBlock bullets={tldrBullets} />
        </div>
      </section>

      <section className="py-12 bg-sand-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-charcoal-900 mb-6 border-l-4 border-primary-400 pl-4">
            Tags populaires
          </h2>
          <div className="flex flex-wrap gap-2">
            {topTags.map((t) => (
              <Link
                key={`tag-archive-${t.slug}`}
                href={`/blog/tag/${t.slug}`}
                className="text-sm text-charcoal-700 hover:text-primary-600 bg-white hover:bg-primary-50 border border-sand-200 hover:border-primary-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                {t.label}
                <span className="ml-1.5 text-xs text-charcoal-400">({t.count})</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <BlogNewsletter />
    </>
  )
}
