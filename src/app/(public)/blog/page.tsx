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
  },
}

export default function BlogPage() {
  return <BlogPageClient articles={allArticlesMeta} categories={allCategories} />
}
