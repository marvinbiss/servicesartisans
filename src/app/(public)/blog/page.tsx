import { Metadata } from 'next'
import { allArticlesMeta, allCategories } from '@/lib/data/blog/articles-index'
import BlogPageClient from './BlogPageClient'

export const metadata: Metadata = {
  title: 'Blog Artisanat & Travaux | ServicesArtisans',
  description: 'Conseils, guides et actualités sur l\'artisanat, les travaux de rénovation, les prix et la réglementation. Plus de 120 articles par des experts.',
  alternates: {
    canonical: 'https://servicesartisans.fr/blog',
  },
  openGraph: {
    title: 'Blog Artisanat & Travaux | ServicesArtisans',
    description: 'Conseils, guides et actualités sur l\'artisanat et les travaux de rénovation.',
    url: 'https://servicesartisans.fr/blog',
    type: 'website',
    images: [{ url: 'https://servicesartisans.fr/opengraph-image', width: 1200, height: 630, alt: 'ServicesArtisans — Blog artisanat et travaux' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog Artisanat & Travaux | ServicesArtisans',
    description: 'Conseils, guides et actualités sur l\'artisanat et les travaux de rénovation.',
    images: ['https://servicesartisans.fr/opengraph-image'],
  },
}

export default function BlogPage() {
  return <BlogPageClient articles={allArticlesMeta} categories={allCategories} />
}
