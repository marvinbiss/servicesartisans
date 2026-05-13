'use client'

import { useState } from 'react'
import { X, Scale, Share2 } from 'lucide-react'
import { clsx } from 'clsx'
import { useCompare } from '@/components/compare/CompareProvider'
import { buildCompareShareUrl } from '@/lib/storage/compare-store'
import { CompareView } from './CompareView'

function ProviderInitial({ name, index }: { name: string; index: number }) {
  const colors = ['bg-primary-400', 'bg-accent-500', 'bg-amber-500']
  return (
    <div
      className={clsx(
        'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm',
        colors[index % colors.length]
      )}
      title={name}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export function CompareBar() {
  const { compareList, removeFromCompare, clearCompare, notifySuccess, notifyError } = useCompare()
  const [showModal, setShowModal] = useState(false)

  if (compareList.length === 0) return null

  const handleShare = async () => {
    const url = buildCompareShareUrl(compareList)
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Ma sélection d’artisans',
          text: `Je compare ${compareList.length} artisan(s) sur ServicesArtisans`,
          url,
        })
        return
      }
      await navigator.clipboard.writeText(url)
      notifySuccess('Lien copié', 'Collez-le pour partager votre comparatif')
    } catch (err) {
      // navigator.share AbortError when the user dismisses the OS sheet — silent
      if (err instanceof Error && err.name === 'AbortError') return
      notifyError('Impossible de partager', url)
    }
  }

  return (
    <>
      {/* Fixed bottom bar */}
      <div
        className={clsx(
          'fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-sand-300 shadow-lg',
          'transform transition-transform duration-300 ease-out',
          'md:bottom-0',
          // On mobile, account for bottom nav (~64px)
          'pb-16 md:pb-0'
        )}
        role="region"
        aria-label="Barre de comparaison"
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Selected providers */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Scale className="w-5 h-5 text-primary-500 flex-shrink-0" />
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {compareList.map((provider, index) => (
                  <div key={provider.id} className="flex items-center gap-1 group">
                    <ProviderInitial name={provider.name} index={index} />
                    <span className="hidden sm:inline text-sm font-medium text-charcoal-700 truncate max-w-[120px]">
                      {provider.name}
                    </span>
                    <button
                      onClick={() => removeFromCompare(provider.id)}
                      className="p-0.5 rounded-full text-charcoal-400 hover:text-red-500 hover:bg-red-50 transition-colors md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
                      aria-label={`Retirer ${provider.name}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {compareList.length < 3 && (
                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-sand-400 flex items-center justify-center text-charcoal-400 text-xs">
                    +
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 text-sm text-charcoal-600 hover:text-primary-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
                aria-label="Partager ce comparatif"
              >
                <Share2 className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Partager</span>
              </button>
              <button
                onClick={clearCompare}
                className="text-sm text-charcoal-500 hover:text-red-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50"
              >
                Effacer
              </button>
              <button
                onClick={() => setShowModal(true)}
                disabled={compareList.length < 2}
                className={clsx(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                  compareList.length >= 2
                    ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm'
                    : 'bg-sand-100 text-charcoal-400 cursor-not-allowed'
                )}
              >
                <Scale className="w-4 h-4" />
                Comparer ({compareList.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Compare modal */}
      {showModal && <CompareView onClose={() => setShowModal(false)} />}
    </>
  )
}

export default CompareBar
