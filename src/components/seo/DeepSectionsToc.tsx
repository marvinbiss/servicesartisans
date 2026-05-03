import { ListOrdered } from 'lucide-react'

import type { TradeDeepSection } from '@/lib/seo/trade-deep-sections'

/**
 * DeepSectionsToc — Sprint N Ahrefs 2026-05-03.
 *
 * Table of Contents auto-générée à partir des deep sections d'une page.
 * Insérée juste avant le bloc deep sections — sert simultanément :
 *   1. UX : l'utilisateur scanne le contenu en un coup d'œil et ancre
 *      directement la section qui l'intéresse (réduit pogo-sticking).
 *   2. SEO : ajoute des liens internes ancrés (signal cocon sémantique +
 *      sitelinks Google sur les ancres `#section-id` les plus cliquées).
 *   3. Scroll depth signal : Google AI Overviews valorise les pages avec
 *      structure éditoriale claire (headings + ToC = signal de qualité).
 *
 * Composant server-side, leaf, zéro JS client envoyé. Chaque <a> pointe sur
 * `#${section.id}` matchant les ancres déjà rendues par les deep sections
 * et les `WebPageElement` du TechArticle Schema (Sprint F).
 */
export default function DeepSectionsToc({
  sections,
  title = 'Sommaire de ce guide',
}: {
  sections: readonly TradeDeepSection[]
  title?: string
}) {
  if (sections.length === 0) return null

  return (
    <nav
      aria-labelledby="deep-toc-title"
      className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-6 my-8 max-w-4xl mx-auto"
    >
      <div className="flex items-center gap-2 mb-3">
        <ListOrdered className="w-5 h-5 text-emerald-700" aria-hidden="true" />
        <h2
          id="deep-toc-title"
          className="font-heading text-base font-bold text-charcoal-900 uppercase tracking-wider"
        >
          {title}
        </h2>
      </div>
      <ol className="space-y-2 list-decimal list-inside marker:text-emerald-600 marker:font-bold">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className="text-charcoal-700 hover:text-emerald-700 underline-offset-2 hover:underline transition"
            >
              {s.h2}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
