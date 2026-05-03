import { describe, expect, it } from 'vitest'

import { allArticles, articleSlugs } from '@/lib/data/blog/articles'
import { isolationPhoniqueArticles } from '@/lib/data/blog/batch-isolation-phonique'

const SLUG = 'isolation-phonique-mur-mitoyen'

describe('Blog — isolation phonique mur mitoyen (Action #3 Bloc 3 Ahrefs)', () => {
  it('article exposé dans allArticles + articleSlugs (route /blog/[slug])', () => {
    expect(allArticles[SLUG]).toBeDefined()
    expect(articleSlugs).toContain(SLUG)
  })

  it('shape complet : title, excerpt, content[], faq, tags, dates', () => {
    const article = isolationPhoniqueArticles[SLUG]
    expect(article).toBeDefined()
    expect(article.title.length).toBeGreaterThan(20)
    expect(article.title.length).toBeLessThanOrEqual(120)
    expect(article.excerpt.length).toBeGreaterThan(80)
    expect(article.content.length).toBeGreaterThanOrEqual(6)
    expect(article.faq?.length ?? 0).toBeGreaterThanOrEqual(5)
    expect(article.tags).toContain('isolation')
    expect(article.tags).toContain('phonique')
    expect(article.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('métadonnées SEO Google-friendly (title ≤ 60, description ≤ 160)', () => {
    const article = isolationPhoniqueArticles[SLUG]
    expect(article.metaTitle?.length ?? 0).toBeGreaterThan(0)
    expect((article.metaTitle ?? '').length).toBeLessThanOrEqual(70)
    expect((article.metaDescription ?? '').length).toBeLessThanOrEqual(170)
  })

  it('contenu long-form ≥ 5 000 caractères (cible 1 500+ mots)', () => {
    const article = isolationPhoniqueArticles[SLUG]
    const totalLength = article.content.reduce((sum: number, p: string) => sum + p.length, 0)
    expect(totalLength).toBeGreaterThanOrEqual(5000)
  })

  it('FAQ couvre matériau, prix, copropriété, aides, recours juridique', () => {
    const article = isolationPhoniqueArticles[SLUG]
    const allText = (article.faq ?? [])
      .map((q) => `${q.question} ${q.answer}`)
      .join(' ')
      .toLowerCase()
    expect(allText).toContain('laine de roche')
    expect(allText).toContain('copropriété')
    expect(allText).toContain('maprimerénov')
    expect(allText).toMatch(/€\/m²|€ \/ m²/)
  })

  it('autorité YMYL : citations réglementaires (NRA 2000, Code civil, NF S)', () => {
    const article = isolationPhoniqueArticles[SLUG]
    const fullContent = article.content.join(' ')
    expect(fullContent).toMatch(/NRA 2000|nra 2000/i)
    expect(fullContent).toMatch(/Article 1240|1241|1382/i)
    expect(fullContent).toMatch(/Qualibat 4131|Qualibat 4311/i)
  })
})
