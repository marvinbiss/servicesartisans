import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Calendar, Clock, ArrowRight, ArrowLeft, Tag } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { SITE_URL, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { allArticlesMeta } from '@/lib/data/blog/articles-index'
import { allArticles } from '@/lib/data/blog/articles'
import { getBlogImage, BLUR_PLACEHOLDER } from '@/lib/data/images'
import { slugifyTag, allBlogTags as allTags } from '@/lib/data/blog/tags'
import { ArticleMeta } from '@/components/ArticleMeta'
import EnBrefBox from '@/components/seo/EnBrefBox'
import TldrBlock from '@/components/flagship/TldrBlock'
import { monthlyAnchorIso } from '@/lib/seo/sprint-helpers'
import { getPublishedDate } from '@/lib/seo/published-dates'

export const revalidate = 86400

// Pre-render all tag pages at build time
export function generateStaticParams() {
  return allTags.map((t) => ({ tag: t.slug }))
}

export const dynamicParams = false

interface PageProps {
  params: Promise<{ tag: string }>
}

const PUBLISHED_DATE = getPublishedDate('/blog/tag')

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag: tagSlug } = await params
  const tagInfo = allTags.find((t) => t.slug === tagSlug)
  if (!tagInfo) return { title: 'Tag non trouvé' }

  const title = `${tagInfo.label} — Articles & Guides | ServicesArtisans`
  const titleRoot = `${tagInfo.label} — Articles & Guides`
  const description = `Tous les articles sur ${tagInfo.label.toLowerCase()} : conseils, prix, réglementation et guides pratiques par les experts ServicesArtisans.`

  return {
    title: titleRoot,
    description,
    alternates: getAlternates(`/blog/tag/${tagSlug}`),
    robots: {
      index: true,
      follow: true,
      'max-snippet': -1 as const,
      'max-image-preview': 'large' as const,
    },
    openGraph: {
      ...getOgDefaults(),
      title,
      description,
      url: `${SITE_URL}/blog/tag/${tagSlug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function BlogTagPage({ params }: PageProps) {
  const { tag: tagSlug } = await params
  const tagInfo = allTags.find((t) => t.slug === tagSlug)
  if (!tagInfo) notFound()

  const articles = allArticlesMeta.filter((a) => a.tags.some((t) => slugifyTag(t) === tagSlug))

  // Related tags: tags that co-occur in the same articles
  const relatedTagSlugs = new Set<string>()
  for (const a of articles) {
    for (const t of a.tags) {
      const s = slugifyTag(t)
      if (s !== tagSlug) relatedTagSlugs.add(s)
    }
  }
  const relatedTags = allTags.filter((t) => relatedTagSlugs.has(t.slug)).slice(0, 12)

  // JSON-LD
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Articles : ${tagInfo.label}`,
    description: `Articles et guides sur ${tagInfo.label.toLowerCase()}`,
    url: `${SITE_URL}/blog/tag/${tagSlug}`,
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
        name: tagInfo.label,
        item: `${SITE_URL}/blog/tag/${tagSlug}`,
      },
    ],
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${tagInfo.label} — Articles & Guides`,
    description: `Tous les articles sur ${tagInfo.label.toLowerCase()} : conseils, prix, réglementation et guides pratiques par les experts ServicesArtisans.`,
    url: `${SITE_URL}/blog/tag/${tagSlug}`,
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
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/tag/${tagSlug}` },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
  }

  const enBrefPoints = [
    `${articles.length} article${articles.length > 1 ? 's' : ''} taggé${articles.length > 1 ? 's' : ''} « ${tagInfo.label} »`,
    relatedTags.length > 0
      ? `${relatedTags.length} tag${relatedTags.length > 1 ? 's' : ''} associé${relatedTags.length > 1 ? 's' : ''} pour explorer`
      : 'Tags associés disponibles selon les articles',
    `Mis à jour mensuellement — sources INSEE, CAPEB, FFB, ANAH`,
    `Citation autorisée avec lien — licence CC BY 4.0`,
  ]

  const tldrBullets = [
    `Page tag « ${tagInfo.label} » : ${articles.length} guide${articles.length > 1 ? 's' : ''} pratique${articles.length > 1 ? 's' : ''} liés à ce sujet.`,
    `Chiffres et fourchettes issus de devis réels et de sources publiques (INSEE, CAPEB, FFB, ANAH).`,
    `Articles relus avant publication, datés et mis à jour ; citations gouvernementales pour les sujets aides/CEE.`,
    `Pour démarrer un projet, demande de devis gratuite auprès d'artisans certifiés via ServicesArtisans.`,
  ]

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
              items={[{ label: 'Blog', href: '/blog' }, { label: tagInfo.label }]}
              className="mb-6 text-charcoal-400 [&_a]:text-charcoal-400 [&_a:hover]:text-white [&_svg]:text-charcoal-600"
            />
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                <Tag className="w-4 h-4" />
                Tag
              </div>
              <h1
                data-speakable="true"
                className="font-heading text-4xl md:text-5xl font-extrabold mb-4 tracking-[-0.025em]"
              >
                {tagInfo.label}
              </h1>
              <p className="text-xl text-charcoal-400 max-w-2xl mx-auto">
                {articles.length} article{articles.length > 1 ? 's' : ''} sur{' '}
                {tagInfo.label.toLowerCase()}
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
                  Aucun article avec ce tag pour le moment.
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
                {articles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/blog/${article.slug}`}
                    className="bg-white rounded-2xl border border-sand-300 overflow-hidden hover:shadow-xl hover:-trancharcoal-y-2 transition-all duration-300 group"
                  >
                    <div className="relative overflow-hidden h-48">
                      <Image
                        src={getBlogImage(article.slug, article.category).src}
                        alt={getBlogImage(article.slug, article.category).alt}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        placeholder="blur"
                        blurDataURL={BLUR_PLACEHOLDER}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <span className="absolute top-4 left-4 z-10 bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-xs font-semibold">
                        {article.category}
                      </span>
                    </div>
                    <div className="p-6">
                      <h2 className="font-bold text-lg text-charcoal-900 mb-2 group-hover:text-primary-500 transition-colors duration-200">
                        {article.title}
                      </h2>
                      <p className="text-sm text-charcoal-600 mb-4">{article.excerpt}</p>
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
                ))}
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

        {/* Related tags */}
        {relatedTags.length > 0 && (
          <section className="py-12 bg-white border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-charcoal-900 mb-6 border-l-4 border-primary-400 pl-4">
                Tags associés
              </h2>
              <div className="flex flex-wrap gap-3">
                {relatedTags.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/blog/tag/${t.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-sand-100 hover:bg-primary-50 text-charcoal-700 hover:text-primary-600 rounded-full text-sm font-medium border border-sand-300 hover:border-primary-200 transition-all"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    {t.label}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

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
