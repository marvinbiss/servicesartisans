'use client'

import { Heart } from 'lucide-react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useFavorites } from '@/hooks/useFavorites'
import { cn } from '@/lib/utils'
import { setFavoriteMeta, removeFavoriteMeta } from '@/lib/storage/favorites-meta'

interface FavoriteButtonProps {
  providerId: string
  providerName: string
  /** Captured at favorite time so /mes-favoris can render without an extra fetch. */
  providerHref?: string
  providerSlug?: string | null
  providerCity?: string | null
  providerSpecialty?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: { button: 'w-[44px] h-[44px]', icon: 'w-4 h-4' },
  md: { button: 'w-[44px] h-[44px]', icon: 'w-5 h-5' },
  lg: { button: 'w-12 h-12', icon: 'w-5 h-5' },
}

export function FavoriteButton({
  providerId,
  providerName,
  providerHref,
  providerSlug = null,
  providerCity = null,
  providerSpecialty = null,
  size = 'md',
  className,
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const [animating, setAnimating] = useState(false)
  // Toast is keyed so rapid toggles re-announce even when the message
  // string is identical (e.g. add → remove → add yields two "ajouté"
  // states). A monotonic counter forces the useEffect to re-run.
  const [toast, setToast] = useState<{ message: string; key: number } | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const favorited = isFavorite(providerId)
  const { button: btnSize, icon: iconSize } = sizeMap[size]

  // Clear toast 2 s after the latest click. We key on toast?.key so a
  // re-click with the same message still resets the timer rather than
  // letting the prior schedule finish early.
  useEffect(() => {
    if (!toast) return
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(null), 2000)
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [toast])

  // Cleanup pending animation / toast timers on unmount so a
  // navigation mid-bounce doesn't fire setState on an unmounted node.
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      if (animTimerRef.current) clearTimeout(animTimerRef.current)
    }
  }, [])

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const willBeFavorite = !favorited
      toggleFavorite(providerId)

      // Companion metadata store (sa:favorites-meta:v1) — keeps name/slug/
      // city/specialty/href so /mes-favoris renders without an extra fetch.
      if (willBeFavorite && providerHref) {
        setFavoriteMeta({
          id: providerId,
          name: providerName,
          slug: providerSlug,
          specialty: providerSpecialty,
          city: providerCity,
          href: providerHref,
        })
      } else if (!willBeFavorite) {
        removeFavoriteMeta(providerId)
      }

      // Trigger bounce — clear the prior timer first so rapid clicks
      // don't leave us with `animating=false` while a fresh bounce is
      // mid-flight.
      if (animTimerRef.current) clearTimeout(animTimerRef.current)
      setAnimating(true)
      animTimerRef.current = setTimeout(() => setAnimating(false), 300)

      // Keyed toast forces re-announcement even when the message
      // string didn't change (e.g. fast double-tap on the same target).
      setToast({
        message: willBeFavorite
          ? `${providerName} ajouté aux favoris`
          : `${providerName} retiré des favoris`,
        key: Date.now(),
      })
    },
    [
      favorited,
      toggleFavorite,
      providerId,
      providerName,
      providerHref,
      providerSlug,
      providerSpecialty,
      providerCity,
    ]
  )

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={handleClick}
        aria-label={
          favorited ? `Retirer ${providerName} des favoris` : `Ajouter ${providerName} aux favoris`
        }
        aria-pressed={favorited}
        className={cn(
          btnSize,
          'bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-110',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2',
          'motion-reduce:transition-none motion-reduce:hover:scale-100',
          animating && 'animate-[favoriteScale_0.3s_ease-in-out] motion-reduce:animate-none'
        )}
      >
        <Heart
          className={cn(
            iconSize,
            'transition-colors duration-200 motion-reduce:transition-none',
            favorited ? 'text-red-500 fill-red-500' : 'text-charcoal-600 hover:text-red-400'
          )}
          aria-hidden="true"
        />
      </button>

      {/* sr-only live region — visible toast is aria-hidden so the
          announcement never doubles. */}
      <div role="status" aria-live="polite" className="sr-only">
        {toast?.message ?? ''}
      </div>
      {toast && (
        <div
          key={toast.key}
          className="absolute top-full right-0 mt-2 z-50 pointer-events-none"
          aria-hidden="true"
        >
          <div className="whitespace-nowrap bg-charcoal-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg animate-[toastFadeIn_0.2s_ease-out] motion-reduce:animate-none">
            {toast.message}
          </div>
        </div>
      )}
    </div>
  )
}
