import Link from 'next/link'
import { ArrowRight, Sparkles, ShieldCheck, Euro, FileText, Calculator, Wrench } from 'lucide-react'

import type { RelatedLink, RelatedLinkIntent } from '@/lib/seo/related-links'

const INTENT_ICON: Record<RelatedLinkIntent, typeof Sparkles> = {
  service: Wrench,
  rge: ShieldCheck,
  aide: Sparkles,
  cee: Euro,
  cluster: FileText,
  simulateur: Calculator,
}

/**
 * Composant topical maillage : rend une grille de liens internes corrélés
 * (aides + CEE + services + cluster reno).
 *
 * Server component — pas de 'use client'.
 *
 * Règle de masquage : `links.length < 2` → return null (un seul lien
 * n'apporte pas de valeur topical, on évite le bruit visuel).
 */
export default function RelatedLinks({
  title = 'Pour aller plus loin',
  links,
  ariaLabel,
  className = '',
}: {
  title?: string
  links: readonly RelatedLink[]
  ariaLabel?: string
  className?: string
}) {
  if (links.length < 2) return null

  return (
    <nav
      aria-label={ariaLabel ?? title}
      className={`bg-sand-50 border-t border-sand-200 py-10 ${className}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h3 className="text-sm font-semibold text-charcoal-400 uppercase tracking-wider mb-4">
          {title}
        </h3>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link) => {
            const Icon = INTENT_ICON[link.intent]
            const relAttr = link.rel ? { rel: link.rel } : {}
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  prefetch={false}
                  className="group flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white border border-sand-200 hover:border-accent-400 hover:shadow-sm transition-colors"
                  {...relAttr}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Icon className="w-4 h-4 text-accent-600 flex-shrink-0" aria-hidden="true" />
                    <span className="text-sm font-medium text-charcoal-800 group-hover:text-accent-700 truncate">
                      {link.label}
                    </span>
                  </span>
                  <ArrowRight
                    className="w-4 h-4 text-charcoal-400 group-hover:text-accent-600 flex-shrink-0"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
