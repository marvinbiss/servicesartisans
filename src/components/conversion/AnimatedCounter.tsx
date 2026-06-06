'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
  /** Valeur finale à atteindre */
  end: number
  /** Durée de l'animation en ms */
  duration?: number
  /** Préfixe (ex: "~") */
  prefix?: string
  /** Suffixe (ex: "+", "%", "h") */
  suffix?: string
  /** Formater avec le séparateur de milliers français */
  locale?: boolean
  /** Classes CSS additionnelles */
  className?: string
  /** Décimales */
  decimals?: number
}

/**
 * Hook useCountUp — anime un nombre de 0 à `end` quand l'élément entre dans le viewport.
 * Utilise IntersectionObserver + requestAnimationFrame.
 *
 * L'observer vit dans un useEffect keyé sur l'élément (state, pas ref) : le
 * pattern précédent créait l'observer dans le callback ref et le détruisait
 * dans le cleanup d'un useEffect vide — en React 18 StrictMode (dev), le
 * double-invoke des effects déconnectait l'observer sans jamais ré-observer,
 * et le compteur restait figé à 0.
 */
function useCountUp(
  end: number,
  duration: number,
  decimals: number
): { ref: (node: HTMLElement | null) => void; value: number; hasAnimated: boolean } {
  const [value, setValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [element, setElement] = useState<HTMLElement | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!element || hasAnimated) return

    if (typeof IntersectionObserver === 'undefined') {
      // Fallback : pas d'IO, afficher directement
      setValue(end)
      setHasAnimated(true)
      return
    }

    // prefers-reduced-motion : valeur finale immédiate, pas d'animation
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            observer.disconnect()
            setValue(end)
            setHasAnimated(true)
          }
        },
        { threshold: 0.2 }
      )
      observer.observe(element)
      return () => observer.disconnect()
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        observer.disconnect()

        const startTime = performance.now()
        const tick = (now: number) => {
          const elapsed = now - startTime
          const progress = Math.min(elapsed / duration, 1)

          // Easing: easeOutCubic pour un effet naturel
          const eased = 1 - Math.pow(1 - progress, 3)
          const factor = Math.pow(10, decimals)
          setValue(Math.round(eased * end * factor) / factor)

          if (progress < 1) {
            rafRef.current = requestAnimationFrame(tick)
          } else {
            setValue(end)
            setHasAnimated(true)
          }
        }
        rafRef.current = requestAnimationFrame(tick)
      },
      { threshold: 0.2 }
    )

    observer.observe(element)
    return () => {
      observer.disconnect()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [element, hasAnimated, end, duration, decimals])

  return { ref: setElement, value, hasAnimated }
}

/**
 * Compteur animé qui incrémente de 0 au nombre final
 * quand il entre dans le viewport.
 *
 * Utilisation :
 * <AnimatedCounter end={14500} suffix="+" className="text-3xl font-heading font-bold" />
 */
export default function AnimatedCounter({
  end,
  duration = 2000,
  prefix = '',
  suffix = '',
  locale = true,
  className = '',
  decimals = 0,
}: AnimatedCounterProps) {
  const { ref, value } = useCountUp(end, duration, decimals)

  const formatted = locale
    ? value.toLocaleString('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : decimals > 0
      ? value.toFixed(decimals)
      : String(Math.round(value))

  return (
    <span
      ref={ref}
      className={className}
      aria-live="polite"
      aria-label={`${prefix}${end.toLocaleString('fr-FR')}${suffix}`}
    >
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
