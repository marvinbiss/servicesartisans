import { allArticlesMeta } from './articles-index'

/**
 * Slugify a tag label to URL-safe form:
 * lowercase, diacritics stripped, non-alphanumeric replaced by '-'.
 */
export function slugifyTag(tag: string): string {
  return tag
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Collect all unique blog tags with their slugified slug + human label.
 * Sorted alphabetically (fr) for stable, crawl-friendly output.
 */
export function getAllTags(): { slug: string; label: string; count: number }[] {
  const tagMap = new Map<string, { label: string; count: number }>()
  for (const a of allArticlesMeta) {
    for (const t of a.tags) {
      const slug = slugifyTag(t)
      const existing = tagMap.get(slug)
      if (existing) {
        existing.count += 1
      } else {
        tagMap.set(slug, { label: t, count: 1 })
      }
    }
  }
  return Array.from(tagMap.entries())
    .map(([slug, { label, count }]) => ({ slug, label, count }))
    .sort((a, b) => a.label.localeCompare(b.label, 'fr'))
}

export const allBlogTags = getAllTags()
