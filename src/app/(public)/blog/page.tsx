import { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo/config'
import { allArticlesMeta, allCategories } from '@/lib/data/blog/articles-index'
import { allArticles } from '@/lib/data/blog/articles'
import BlogPageClient from './BlogPageClient'

export const metadata: Metadata = {
  title: 'Blog Artisanat & Travaux',
  description: 'Conseils, guides et actualités sur l\'artisanat, les travaux de rénovation, les prix et la réglementation. Plus de 120 articles par des experts.',
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: 'Blog Artisanat & Travaux',
    description: 'Conseils, guides et actualités sur l\'artisanat et les travaux de rénovation.',
    url: `${SITE_URL}/blog`,
    type: 'website',
    images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: 'ServicesArtisans — Blog artisanat et travaux' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog Artisanat & Travaux',
    description: 'Conseils, guides et actualités sur l\'artisanat et les travaux de rénovation.',
    images: [`${SITE_URL}/opengraph-image`],
  },
}

export default function BlogPage() {
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Blog Artisanat & Travaux',
    description: 'Conseils, guides et actualités sur l\'artisanat et les travaux de rénovation.',
    url: `${SITE_URL}/blog`,
    numberOfItems: allArticlesMeta.length,
    hasPart: allArticlesMeta.slice(0, 10).map(a => ({
      '@type': 'BlogPosting',
      headline: a.title,
      url: `${SITE_URL}/blog/${a.slug}`,
      datePublished: a.date,
      author: { '@type': 'Person', name: allArticles[a.slug]?.author || 'ServicesArtisans' },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <BlogPageClient articles={allArticlesMeta} categories={allCategories} />
    </>
  )
}
