'use client'

/**
 * Carousel "Consultés récemment" — pattern Amazon "Recently viewed items".
 *
 * Affiche en horizontale les 10 dernières fiches artisan consultées (LRU,
 * TTL 30j, source localStorage). Le composant retourne `null` si la liste
 * est vide — pas de slot vide réservé sur la home.
 *
 * Mobile : scroll snap-x (un card visible à la fois). Desktop : grille
 * 2-3-4 selon viewport. Bouton "Effacer mon historique" en fin de liste
 * permet de retirer le composant sans passer par les params navigateur.
 */
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { History, Trash2, ArrowRight, MapPin } from 'lucide-react'
import { initials, monoClass } from '@/lib/ui/monogram'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'

interface RecentlyViewedCarouselProps {
  /** Heading visible — sert aussi de label aria. */
  heading?: string
  /** Quand `true`, la version compacte (footer fiche artisan) supprime
   *  le bouton "Effacer" et limite à 5 cartes. */
  compact?: boolean
  /** ID à exclure du carousel (ex : la fiche actuellement affichée pour
   *  ne pas la lister sous elle-même). */
  excludeId?: string
}

export function RecentlyViewedCarousel({
  heading = 'Consultés récemment',
  compact = false,
  excludeId,
}: RecentlyViewedCarouselProps) {
  const { items, clear } = useRecentlyViewed()
  const [mounted, setMounted] = useState(false)

  // Mount-gate pour éviter le mismatch SSR/CSR : sur le serveur, la liste
  // est vide ; on rendrait `null`. L'hydratation lit le localStorage et
  // populerait — décalage visible. On préfère un saut net post-mount.
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null
  const filtered = excludeId ? items.filter((i) => i.id !== excludeId) : items
  const visible = compact ? filtered.slice(0, 5) : filtered
  if (visible.length === 0) return null

  return (
    <section
      aria-label={heading}
      className={`${compact ? 'py-6' : 'py-10 md:py-14'} bg-white border-t border-sand-200`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            <History
              className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-primary-500`}
              aria-hidden="true"
            />
            <h2
              className={`font-heading font-bold text-charcoal-900 ${
                compact ? 'text-base' : 'text-xl md:text-2xl'
              }`}
            >
              {heading}
            </h2>
          </div>
          {!compact && (
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-1.5 text-xs text-charcoal-500 hover:text-red-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50"
              aria-label="Effacer mon historique de consultation"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Effacer
            </button>
          )}
        </div>

        <div
          role="list"
          className="flex md:grid md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:pb-0 scroll-px-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
        >
          {visible.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              role="listitem"
              className="group/recent flex-shrink-0 w-[220px] md:w-auto snap-start bg-white border border-sand-300 rounded-2xl p-4 transition-all duration-200 hover:border-primary-200 hover:shadow-card-hover hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-soft ${monoClass(item.id || item.name)}`}
                  aria-hidden="true"
                >
                  {initials(item.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-charcoal-900 text-sm truncate group-hover/recent:text-primary-500 transition-colors">
                    {item.name}
                  </p>
                  {item.specialty && (
                    <p className="text-xs text-charcoal-500 truncate">{item.specialty}</p>
                  )}
                </div>
              </div>
              {item.city && (
                <p className="flex items-center gap-1 text-xs text-charcoal-500 mb-3">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  {item.city}
                </p>
              )}
              <p className="inline-flex items-center gap-1 text-xs font-semibold text-primary-500 group-hover/recent:gap-2 transition-all">
                Revoir la fiche
                <ArrowRight className="w-3 h-3" />
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default RecentlyViewedCarousel
