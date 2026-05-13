'use client'

import { useState } from 'react'
import { Scale } from 'lucide-react'
import { clsx } from 'clsx'
import { useCompare } from '@/components/compare/CompareProvider'
import type { CompareProvider } from '@/components/compare/CompareProvider'

interface CompareButtonProps {
  provider: CompareProvider
  size?: 'sm' | 'md'
  className?: string
}

export function CompareButton({ provider, size = 'sm', className }: CompareButtonProps) {
  const { addToCompare, removeFromCompare, isInCompare } = useCompare()
  const active = isInCompare(provider.id)
  const [pressed, setPressed] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Trigger a one-shot press animation that survives the active->Ajouté
    // re-render via a separate state flag.
    setPressed(true)
    window.setTimeout(() => setPressed(false), 220)

    if (active) {
      removeFromCompare(provider.id)
      setAnnouncement(`${provider.name} retiré de la comparaison`)
    } else {
      addToCompare(provider)
      setAnnouncement(`${provider.name} ajouté à la comparaison`)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={clsx(
          'inline-flex items-center gap-1.5 rounded-lg border font-medium transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2',
          'motion-reduce:transform-none',
          pressed && 'scale-[0.94]',
          size === 'sm' && 'px-3 py-2 text-xs min-h-[44px]',
          size === 'md' && 'px-3 py-2.5 text-sm min-h-[44px]',
          active
            ? 'bg-primary-50 text-primary-600 border-primary-300 hover:bg-primary-100'
            : 'bg-white text-charcoal-600 border-sand-300 hover:bg-sand-50 hover:border-sand-400',
          className
        )}
        aria-label={
          active
            ? `Retirer ${provider.name} de la comparaison`
            : `Ajouter ${provider.name} à la comparaison`
        }
        aria-pressed={active}
      >
        <Scale
          className={clsx(
            'flex-shrink-0 transition-transform duration-200 motion-reduce:transition-none motion-reduce:transform-none',
            pressed && 'rotate-12 scale-110',
            size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
          )}
          aria-hidden="true"
        />
        <span>{active ? 'Ajouté' : 'Comparer'}</span>
      </button>
      {/* SR-only live region — announces add/remove without stealing focus
          or triggering an audible toast for everyone. */}
      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </>
  )
}

export default CompareButton
