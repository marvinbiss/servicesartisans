import { ShieldCheck } from 'lucide-react'

import {
  type RgeGlossaryEntry,
  getAllRgeGlossaryEntries,
} from '@/lib/seo/rge-qualifications-glossary'

/**
 * RgeGlossaryBlock — Sprint K Ahrefs 2026-05-03.
 *
 * Affiche visuellement le vocabulaire RGE émis en DefinedTermSet (Schema.org)
 * par Sprints J + M. Sans rendu visible, le DefinedTermSet est ignoré par les
 * checkers Lighthouse "structured data should match visible content" et
 * Google peut diminuer le poids du Schema (les champs non visibles sont
 * dévalorisés depuis l'update Helpful Content 2024-09).
 *
 * Pattern : <dl><dt><dfn> compact, ancres `#term-<slug>` matchant le Schema
 * `getRgeDefinedTermSetSchema` (cohérence client/server).
 *
 * Le composant est server-side, leaf, zéro JS client envoyé.
 */
export default function RgeGlossaryBlock({
  entries = getAllRgeGlossaryEntries(),
  title = 'Glossaire des qualifications RGE',
  intro = 'Définitions officielles des certifications obligatoires pour bénéficier des aides MaPrimeRénov’ et CEE en 2026.',
}: {
  entries?: readonly RgeGlossaryEntry[]
  title?: string
  intro?: string
}) {
  if (entries.length === 0) return null

  return (
    <section
      id="glossaire-rge"
      aria-labelledby="glossaire-rge-title"
      className="bg-white border-y border-charcoal-100"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-emerald-700" aria-hidden="true" />
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            Glossaire RGE
          </span>
        </div>
        <h2
          id="glossaire-rge-title"
          className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-3"
        >
          {title}
        </h2>
        <p className="text-charcoal-600 max-w-3xl mb-8 leading-relaxed">{intro}</p>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {entries.map((e) => (
            <div key={e.slug} id={`term-${e.slug}`} className="scroll-mt-24">
              <dt className="font-heading font-bold text-charcoal-900 text-base flex items-baseline gap-2 flex-wrap">
                <dfn className="not-italic">{e.name}</dfn>
                <span className="text-xs font-semibold text-emerald-700">{e.organisme}</span>
              </dt>
              <dd className="text-sm text-charcoal-700 mt-1.5 leading-relaxed">{e.definition}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-charcoal-500 mt-8 leading-relaxed max-w-3xl">
          Sources officielles : france-renov.gouv.fr, annuaire-rge.ademe.fr, arrêté du 12 janvier
          2017 (IRVE), arrêté Anah du 23 décembre 2024 (RGE obligatoire MaPrimeRénov&apos;).
        </p>
      </div>
    </section>
  )
}
