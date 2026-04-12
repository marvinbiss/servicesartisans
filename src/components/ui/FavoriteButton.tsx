'use client'

import { Heart } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useFavorites } from '@/hooks/useFavorites'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  providerId: string
  providerName: string
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
  size = 'md',
  className,
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const [animating, setAnimating] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const favorited = isFavorite(providerId)
  const { button: btnSize, icon: iconSize } = sizeMap[size]

  // Clear toast after 2 seconds
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(timer)
  }, [toast])

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const willBeFavorite = !favorited
      toggleFavorite(providerId)

      // Trigger bounce animation
      setAnimating(true)
      setTimeout(() => setAnimating(false), 300)

      // Show toast
      setToast(
        willBeFavorite ? `${providerName} ajouté aux favoris` : `${providerName} retiré des favoris`
      )
    },
    [favorited, toggleFavorite, providerId, providerName]
  )

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={handleClick}
        aria-label={
          favorited ? `Retirer ${providerName} des favoris` : `Ajouter ${providerName} aux favoris`
        }
        className={cn(
          btnSize,
          'bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-110',
          animating && 'animate-[favoriteScale_0.3s_ease-in-out]'
        )}
      >
        <Heart
          className={cn(
            iconSize,
            'transition-colors duration-200',
            favorited ? 'text-red-500 fill-red-500' : 'text-charcoal-600 hover:text-red-400'
          )}
        />
      </button>

      {/* Toast notification */}
      {toast && (
        <div className="absolute top-full right-0 mt-2 z-50 pointer-events-none">
          <div className="whitespace-nowrap bg-charcoal-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg animate-[toastFadeIn_0.2s_ease-out]">
            {toast}
          </div>
        </div>
      )}
    </div>
  )
}
