'use client'

import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Hook réutilisable de focus trap pour les modals et dialogues.
 *
 * - Capture le focus au mount (premier élément focusable)
 * - Boucle le Tab / Shift+Tab dans le conteneur
 * - Ferme via Escape
 * - Restore le focus sur l'élément précédemment actif au unmount
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  onClose?: () => void,
) {
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    // Sauvegarder l'élément actif précédent
    previousActiveElement.current = document.activeElement as HTMLElement

    // Focus le premier élément focusable après un court délai (laisse le DOM se mettre à jour)
    const focusTimer = setTimeout(() => {
      const container = containerRef.current
      if (!container) return
      const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      if (focusable.length > 0) {
        focusable[0].focus()
      } else {
        // Fallback : focus le conteneur lui-même s'il est focusable
        container.focus()
      }
    }, 50)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose()
        return
      }

      if (e.key !== 'Tab') return

      const container = containerRef.current
      if (!container) return

      const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimeout(focusTimer)
      document.removeEventListener('keydown', handleKeyDown)
      // Restaurer le focus
      previousActiveElement.current?.focus()
    }
  }, [isOpen, containerRef, onClose])
}
