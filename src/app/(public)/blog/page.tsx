import { allArticlesMeta, allCategories } from '@/lib/data/blog/articles-index'
import BlogPageClient from './BlogPageClient'

export default function BlogPage() {
  return <BlogPageClient articles={allArticlesMeta} categories={allCategories} />
}
