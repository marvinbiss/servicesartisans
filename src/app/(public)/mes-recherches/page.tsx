'use client'

/**
 * Page personnelle des recherches sauvegardées (`sa:saved-searches:v1`).
 *
 * 100% client-side (localStorage) — pas d'auth requise. Le contenu est
 * propre à chaque navigateur, identique à `/mes-favoris`.
 */
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bookmark, ArrowRight, MapPin, Trash2, Search as SearchIcon } from 'lucide-react'
import { useSavedSearches } from '@/hooks/useSavedSearches'
import { buildSearchHref } from '@/lib/storage/saved-searches'
import { EmptyState } from '@/components/ui/EmptyState'

function formatRelative(ts: number): string {
  const diffMs = Date.now() - ts
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return "À l'instant"
  if (diffMin < 60) return `il y a ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `il y a ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `il y a ${diffD}j`
  return new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export default function MesRecherchesPage() {
  const { searches, remove, clear } = useSavedSearches()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-charcoal-900 flex items-center gap-2">
              <Bookmark className="w-6 h-6 text-primary-500" aria-hidden="true" />
              Mes recherches
            </h1>
            <p className="text-charcoal-600 mt-1">
              {mounted && searches.length > 0
                ? `${searches.length} recherche${searches.length > 1 ? 's' : ''} sauvegardée${searches.length > 1 ? 's' : ''}.`
                : 'Vos recherches sauvegardées apparaissent ici.'}
            </p>
          </div>
          {mounted && searches.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-1.5 text-sm text-charcoal-500 hover:text-red-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Tout effacer
            </button>
          )}
        </div>

        {/* Empty state — only render after mount to avoid SSR/CSR mismatch */}
        {mounted && searches.length === 0 && (
          <div className="bg-white rounded-2xl border border-sand-300">
            <EmptyState
              variant="search"
              title="Aucune recherche sauvegardée"
              description="Sur n'importe quel hub métier+ville, cliquez sur « Enregistrer » pour la retrouver ici en un clic."
              action={{ label: 'Parcourir les services', href: '/services' }}
              secondaryAction={{ label: 'Demander un devis', href: '/devis' }}
            />
          </div>
        )}

        {/* Searches grid */}
        {mounted && searches.length > 0 && (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searches.map((s) => {
              const href = buildSearchHref(s)
              return (
                <li
                  key={s.id}
                  className="relative bg-white border border-sand-300 rounded-2xl p-5 hover:border-primary-200 hover:shadow-card-hover transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => remove(s.id)}
                    aria-label={`Retirer ${s.serviceLabel} à ${s.villeLabel}`}
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-charcoal-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Link href={href} className="group/search block pr-8">
                    <h2 className="font-heading font-bold text-lg text-charcoal-900 group-hover/search:text-primary-500 transition-colors">
                      {s.serviceLabel}
                    </h2>
                    <p className="inline-flex items-center gap-1 text-sm text-charcoal-600 mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {s.villeLabel}
                    </p>
                    {s.filters && (
                      <p className="text-xs text-charcoal-500 mt-2">
                        Filtres : <span className="font-mono">{s.filters}</span>
                      </p>
                    )}
                    <p className="text-xs text-charcoal-400 mt-3">
                      Enregistrée {formatRelative(s.savedAt)}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-500 mt-3 group-hover/search:gap-2 transition-all">
                      Relancer la recherche
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}

        {/* CTA bas pour découvrabilité quand la liste existe */}
        {mounted && searches.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-sand-300 text-charcoal-700 rounded-xl hover:bg-sand-100 transition-colors"
            >
              <SearchIcon className="w-4 h-4" />
              Nouvelle recherche
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
