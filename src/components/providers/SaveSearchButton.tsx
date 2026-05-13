'use client'

/**
 * Bouton toggle "Enregistrer cette recherche" pour les hubs
 * `/services/[service]/[ville]`.
 *
 * Affiché en haut du listing (à côté du H1). Bascule l'état localStorage
 * (`sa:saved-searches:v1`) et propage via storage event aux autres tabs.
 * Aucun appel API.
 *
 * Feedback : flash visuel 1.6s (label "Enregistrée !" + icône check) plutôt
 * qu'un toast — pas de dépendance à un toast container global.
 */
import { useCallback, useEffect, useState } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { useSavedSearches } from '@/hooks/useSavedSearches'
import { buildSearchId } from '@/lib/storage/saved-searches'

interface SaveSearchButtonProps {
  service: string
  serviceLabel: string
  ville: string
  villeLabel: string
  filters?: string
  className?: string
}

export function SaveSearchButton({
  service,
  serviceLabel,
  ville,
  villeLabel,
  filters = '',
  className,
}: SaveSearchButtonProps) {
  const { isSaved, save, remove } = useSavedSearches()
  const saved = isSaved(service, ville, filters)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(false), 1600)
    return () => clearTimeout(t)
  }, [flash])

  const handleClick = useCallback(() => {
    if (saved) {
      remove(buildSearchId(service, ville, filters))
      return
    }
    save({ service, serviceLabel, ville, villeLabel, filters })
    setFlash(true)
  }, [saved, service, ville, filters, serviceLabel, villeLabel, save, remove])

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? 'Retirer cette recherche des favoris' : 'Enregistrer cette recherche'}
      className={
        'inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg text-sm font-medium border transition-all duration-200 ' +
        (saved
          ? 'bg-primary-50 text-primary-600 border-primary-200 hover:bg-primary-100'
          : 'bg-white text-charcoal-600 border-sand-300 hover:bg-sand-50 hover:border-sand-400') +
        (className ? ` ${className}` : '')
      }
    >
      {saved ? (
        <>
          <BookmarkCheck className="w-4 h-4" />
          <span className="hidden sm:inline">{flash ? 'Enregistrée !' : 'Enregistrée'}</span>
        </>
      ) : (
        <>
          <Bookmark className="w-4 h-4" />
          <span className="hidden sm:inline">Enregistrer</span>
        </>
      )}
    </button>
  )
}

export default SaveSearchButton
