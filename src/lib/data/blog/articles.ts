import { existingArticles } from './existing-articles'
import { prixArticles } from './batch-prix'
import { metiersArticles } from './batch-metiers'
import { projetsArticles } from './batch-projets'
import { conseilsArticles } from './batch-conseils'
import { reglementationArticles } from './batch-reglementation'

export interface BlogArticle {
  title: string
  excerpt: string
  content: string[]
  image: string
  author: string
  date: string
  readTime: string
  category: string
  tags: string[]
  authorBio?: string
  updatedDate?: string
  keyTakeaways?: string[]
  faq?: { question: string; answer: string }[]
}

/** Every blog article keyed by slug */
export const allArticles: Record<string, BlogArticle> = {
  ...existingArticles,
  ...prixArticles,
  ...metiersArticles,
  ...projetsArticles,
  ...conseilsArticles,
  ...reglementationArticles,
}

/** All slugs for generateStaticParams */
export const articleSlugs: string[] = Object.keys(allArticles)
