/**
 * PageHeroH1 — H1 canonical conforme DESIGN.md (L66).
 *
 * Spec :
 *   - `hero`    : pages racine fortes (homepage, hub service, landing).
 *                 font-extrabold | clamp(2rem, 5vw, 3.5rem) | tracking-[-0.04em]
 *   - `page`    : pages standard (locale, ville, départements, listings).
 *                 font-bold | text-3xl md:text-4xl | tracking-tight
 *   - `article` : pages contenu (blog, aides, guides).
 *                 font-bold | text-3xl | tracking-tight
 *
 * Police : `font-heading` (Sora via next/font).
 * Couleur : par défaut `text-charcoal-900` (override via className).
 *
 * Pourquoi :
 *   Drift visuel détecté audit 2026-05-13 — 100+ pages H1 utilisent
 *   `text-3xl font-bold` partout, perdant la hiérarchie hero/page/article
 *   et ne respectant pas le clamp() responsive de la spec.
 */

import type { ReactNode } from 'react'

type Size = 'hero' | 'page' | 'article'

type Props = {
  size?: Size
  children: ReactNode
  className?: string
  speakable?: boolean
  id?: string
}

const SIZE_CLASSES: Record<Size, string> = {
  hero: 'font-heading font-extrabold text-charcoal-900 tracking-[-0.04em] text-[clamp(2rem,5vw,3.5rem)] leading-[1.05]',
  page: 'font-heading font-bold text-charcoal-900 tracking-tight text-3xl md:text-4xl',
  article: 'font-heading font-bold text-charcoal-900 tracking-tight text-3xl',
}

export function PageHeroH1({
  size = 'page',
  children,
  className = '',
  speakable = true,
  id,
}: Props) {
  return (
    <h1
      id={id}
      data-speakable={speakable ? 'true' : undefined}
      className={`${SIZE_CLASSES[size]} ${className}`.trim()}
    >
      {children}
    </h1>
  )
}

export default PageHeroH1
