import { Fragment, type ReactNode } from 'react'

import { type RgeGlossaryEntry, getAllRgeGlossaryEntries } from './rge-qualifications-glossary'

/**
 * glossary-autolink — Sprint L Ahrefs 2026-05-03.
 *
 * Auto-link les mentions de qualifications RGE dans un texte vers leur ancre
 * `#term-<slug>` rendue par `<RgeGlossaryBlock>`. Utilisé sur les body[] des
 * deep sections pour :
 *
 *   1. PageRank flow : chaque deep section devient un hub topical alimentant
 *      le glossaire (qui devient lui-même un hub interne fort).
 *   2. UX : l'utilisateur peut sauter directement vers la définition exacte
 *      d'un terme technique sans rompre la lecture.
 *   3. Schema.org cohérence : les `<a>` HTML matchent les `DefinedTerm @id`
 *      et les `WebPageElement.cssSelector` (Sprints F + J + K cohérents).
 *
 * Convention :
 *   - Match insensitive case + word boundaries (\b en regex)
 *   - Une seule mention auto-linkée par terme par paragraphe (évite spam)
 *   - Variants supportés : code exact ("Qualibat 7141"), code sans espaces
 *     ("Qualibat-7141" non — pas réaliste en prose), nom court ("QualiPAC").
 *   - Préserve le texte original — wrap juste les matches dans <a>.
 *
 * Module .tsx (renvoie ReactNode). Server-side uniquement, leaf, zéro JS client.
 */

type LinkableTerm = {
  /** Pattern regex sans flags (compile time avec 'gi' au runtime). */
  pattern: string
  /** Slug cible pour l'ancre `#term-<slug>`. */
  slug: string
  /** Libellé canonique pour title hover. */
  title: string
}

/**
 * Build l'index des patterns à matcher depuis le glossaire.
 * Les codes plus longs/spécifiques d'abord (évite que "Qualibat" matche avant
 * "Qualibat 7141").
 */
function buildLinkablePatterns(entries: readonly RgeGlossaryEntry[]): readonly LinkableTerm[] {
  const items: LinkableTerm[] = []
  for (const e of entries) {
    items.push({
      pattern: escapeRegExp(e.code),
      slug: e.slug,
      title: e.name,
    })
    // Variant : sans suffixe organisme/role (ex. "Qualifelec IRVE P1" → "IRVE P1")
    const stripped = e.code
      .replace(/^(Qualibat |QualiPAC |Qualifelec |OPQIBI |QualiPV|QualiSol|QualiBois)/, '')
      .trim()
    if (stripped && stripped !== e.code && stripped.length >= 3) {
      items.push({
        pattern: escapeRegExp(stripped),
        slug: e.slug,
        title: e.name,
      })
    }
  }
  // Tri par longueur décroissante (matches plus spécifiques d'abord).
  return items.sort((a, b) => b.pattern.length - a.pattern.length)
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

let CACHED_PATTERNS: readonly LinkableTerm[] | null = null

function getPatterns(): readonly LinkableTerm[] {
  if (CACHED_PATTERNS === null) {
    CACHED_PATTERNS = buildLinkablePatterns(getAllRgeGlossaryEntries())
  }
  return CACHED_PATTERNS
}

/**
 * Auto-link les mentions de qualifications RGE dans une string.
 * Renvoie un ReactNode (string si aucun match, sinon array <Fragment>/<a>).
 *
 * Limite anti-spam : 1 match par slug par appel (le 2e identique reste en
 * texte brut). Ça évite de spammer "Qualibat 7141" 5 fois liés dans le même
 * paragraphe.
 */
export function autoLinkRgeTerms(text: string, options?: { hostPath?: string }): ReactNode {
  if (!text || text.length === 0) return text
  const patterns = getPatterns()
  if (patterns.length === 0) return text

  // hostPath optionnel (Sprint R Ahrefs 2026-05-03) : préfixe path absolu
  // pour produire des liens cross-page vers /rge/glossaire#term-<slug> au
  // lieu de l'ancre relative same-page. Activé sur le blog pour mailler vers
  // l'entité canonique (Sprint O). Same-page ancre conservée par défaut sur
  // les hubs qui rendent leur propre RgeGlossaryBlock (Sprints J/M/P).
  const linkPrefix = options?.hostPath ?? ''

  // Build une regex combinée (alternation OR), word boundaries, gi flags.
  const combined = new RegExp(`\\b(${patterns.map((p) => p.pattern).join('|')})\\b`, 'gi')

  const out: ReactNode[] = []
  let lastIndex = 0
  const seenSlugs = new Set<string>()

  let m: RegExpExecArray | null
  while ((m = combined.exec(text)) !== null) {
    const matchedText = m[0]
    const matchedLower = matchedText.toLowerCase()
    // Find the term by lowercase pattern compare (cheap because patterns small).
    const term = patterns.find((p) => p.pattern.toLowerCase() === matchedLower)
    if (!term || seenSlugs.has(term.slug)) {
      // No-op : avance le scanner sans push d'ancre, on continue à chercher.
      continue
    }
    if (m.index > lastIndex) {
      out.push(text.slice(lastIndex, m.index))
    }
    out.push(
      <a
        key={`${term.slug}-${m.index}`}
        href={`${linkPrefix}#term-${term.slug}`}
        title={term.title}
        className="text-emerald-700 underline-offset-2 hover:underline"
      >
        {matchedText}
      </a>
    )
    seenSlugs.add(term.slug)
    lastIndex = m.index + matchedText.length
  }

  if (lastIndex === 0) return text
  if (lastIndex < text.length) {
    out.push(text.slice(lastIndex))
  }

  return <Fragment>{out}</Fragment>
}
