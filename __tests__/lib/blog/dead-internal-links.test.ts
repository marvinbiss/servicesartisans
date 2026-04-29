/**
 * Régression — aucun lien interne /blog/<slug> ne doit pointer vers un slug
 * absent de `articleSlugs`. Couvre les batch articles + le contenu rendu.
 *
 * Cas couverts :
 *  1. Liens Markdown statiques `[text](/blog/<slug>)` dans tous les batch files
 *  2. Liens dynamiques `/blog/${var}` sont exclus (validés en runtime via
 *     `if (article)` dans `topical-clusters.ts` + idem dans le template).
 *
 * Le test parse uniquement les chaînes statiques pour éviter les faux
 * positifs sur les template literals — les liens dynamiques sont vérifiés
 * par le code qui les génère.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, lstatSync } from 'node:fs'
import { join } from 'node:path'
import { allArticles } from '@/lib/data/blog/articles'

const BATCH_DIR = join(process.cwd(), 'src/lib/data/blog')

// Composants TSX à hardcoded blog hrefs (recommandation test-architect 2026-04-29).
// À étendre quand un nouveau composant introduit des liens blog statiques.
const COMPONENT_FILES = [
  join(
    process.cwd(),
    'src/app/(public)/services/[service]/[location]/_components/FaqAndBlogSection.tsx'
  ),
]

function listBatchFiles(): string[] {
  return readdirSync(BATCH_DIR)
    .filter((f) => f.startsWith('batch-') && f.endsWith('.ts'))
    .map((f) => join(BATCH_DIR, f))
    .filter((p) => !lstatSync(p).isSymbolicLink()) // hardening (security audit LOW)
}

function extractStaticBlogLinks(content: string): string[] {
  // Match `/blog/<slug>` only when followed by a non-template-literal char
  // (not `${`). This avoids matching dynamic links built at runtime.
  const re = /\/blog\/([a-z][a-z0-9-]+)(?![a-z0-9.${-])/g
  const slugs: string[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(content)) !== null) {
    slugs.push(m[1])
  }
  return slugs
}

describe('blog — dead internal links', () => {
  const liveSlugs = new Set(Object.keys(allArticles))

  it('no static /blog/<slug> link in batch articles points to a dead slug', () => {
    const dead: { file: string; slug: string }[] = []
    for (const file of listBatchFiles()) {
      const content = readFileSync(file, 'utf8')
      for (const slug of extractStaticBlogLinks(content)) {
        if (!liveSlugs.has(slug)) {
          dead.push({ file: file.replace(BATCH_DIR + '\\', '').replace(BATCH_DIR + '/', ''), slug })
        }
      }
    }
    if (dead.length > 0) {
      console.error(
        'Dead /blog/<slug> links found:\n' + dead.map((d) => `  ${d.slug}  ← ${d.file}`).join('\n')
      )
    }
    expect(dead).toEqual([])
  })

  it('no static /blog/<slug> href in component TSX points to a dead slug', () => {
    const dead: { file: string; slug: string }[] = []
    for (const file of COMPONENT_FILES) {
      if (lstatSync(file).isSymbolicLink()) continue
      const content = readFileSync(file, 'utf8')
      for (const slug of extractStaticBlogLinks(content)) {
        if (!liveSlugs.has(slug)) {
          dead.push({ file, slug })
        }
      }
    }
    if (dead.length > 0) {
      console.error(
        'Dead /blog/<slug> hrefs found in components:\n' +
          dead.map((d) => `  ${d.slug}  ← ${d.file}`).join('\n')
      )
    }
    expect(dead).toEqual([])
  })
})
