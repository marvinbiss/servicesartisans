import { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo/config'
import { allArticlesMeta, allCategories } from '@/lib/data/blog/articles-index'
import BlogPageClient from './BlogPageClient'

export const metadata: Metadata = {
  title: 'Blog Artisanat & Travaux | ServicesArtisans',
  description: 'Conseils, guides et actualités sur l\'artisanat, les travaux de rénovation, les prix et la réglementation. Plus de 120 articles par des experts.',
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: 'Blog Artisanat & Travaux | ServicesArtisans',
    description: 'Conseils, guides et actualités sur l\'artisanat et les travaux de rénovation.',
    url: `${SITE_URL}/blog`,
    type: 'website',
    images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: 'ServicesArtisans — Blog artisanat et travaux' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog Artisanat & Travaux | ServicesArtisans',
    description: 'Conseils, guides et actualités sur l\'artisanat et les travaux de rénovation.',
    images: [`${SITE_URL}/opengraph-image`],
  },
}

export default function BlogPage() {
  return <BlogPageClient articles={allArticlesMeta} categories={allCategories} />
}
