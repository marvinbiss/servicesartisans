/**
 * GlossaireTooltips — Bloc "Lexique" affichant les termes de glossaire
 * pertinents pour un service donné.
 *
 * Filtre les termes du glossaire par `relatedService` ou par catégorie,
 * et les affiche sous forme de liste de définitions (<dl>) sémantique.
 *
 * Server Component — pas de 'use client'.
 */

import { BookOpen } from 'lucide-react'
import Link from 'next/link'
import { glossaireTerms } from '@/lib/data/glossaire'
import type { GlossaireTerm } from '@/lib/data/glossaire'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GlossaireTooltipsProps {
  serviceSlug: string
  maxTerms?: number
}

// ---------------------------------------------------------------------------
// Category ↔ service domain mapping (fallback when relatedService is absent)
// ---------------------------------------------------------------------------

const CATEGORY_SERVICE_MAP: Record<string, string[]> = {
  'Gros œuvre': ['macon', 'demolition'],
  'Charpente & toiture': ['charpentier', 'couvreur'],
  Plomberie: ['plombier'],
  Électricité: ['electricien'],
  'Isolation & énergie': ['isolation', 'chauffagiste', 'climatisation'],
  Menuiserie: ['menuisier', 'fenetre', 'volet'],
  Revêtements: ['carreleur', 'peintre', 'sol'],
  'Administratif & juridique': [],
}

function getMatchingTerms(serviceSlug: string, maxTerms: number): GlossaireTerm[] {
  // 1. Direct relatedService match (highest relevance)
  const directMatches = glossaireTerms.filter((t) => t.relatedService === serviceSlug)

  if (directMatches.length >= maxTerms) {
    return directMatches.slice(0, maxTerms)
  }

  // 2. Category fallback — find categories that map to this service
  const matchingCategories = Object.entries(CATEGORY_SERVICE_MAP)
    .filter(([, slugs]) => slugs.includes(serviceSlug))
    .map(([cat]) => cat)

  const categoryMatches = glossaireTerms.filter(
    (t) => matchingCategories.includes(t.category) && !directMatches.some((d) => d.slug === t.slug)
  )

  return [...directMatches, ...categoryMatches].slice(0, maxTerms)
}

// ---------------------------------------------------------------------------
// Service slug → display name (simple heuristic)
// ---------------------------------------------------------------------------

function formatServiceName(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GlossaireTooltips({ serviceSlug, maxTerms = 5 }: GlossaireTooltipsProps) {
  const terms = getMatchingTerms(serviceSlug, maxTerms)

  if (terms.length === 0) return null

  const serviceName = formatServiceName(serviceSlug)

  return (
    <section className="py-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-md bg-primary-100 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-3.5 h-3.5 text-primary-600" />
        </div>
        <h4 className="text-sm font-bold text-charcoal-800 uppercase tracking-wider">
          Lexique {serviceName}
        </h4>
      </div>

      <dl className="space-y-2">
        {terms.map((term) => (
          <div key={term.slug} className="flex flex-col">
            <dt className="font-semibold text-charcoal-800 text-sm">
              <Link
                href={`/glossaire#${term.slug}`}
                className="hover:text-primary-600 transition-colors"
              >
                {term.term}
              </Link>
            </dt>
            <dd className="text-sm text-charcoal-600 leading-relaxed line-clamp-2">
              {term.definition}
            </dd>
          </div>
        ))}
      </dl>

      <Link
        href="/glossaire"
        className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
      >
        Voir tout le glossaire
        <span aria-hidden="true">→</span>
      </Link>
    </section>
  )
}
