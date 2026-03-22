'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

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
 */
function useCountUp(
  end: number,
  duration: number,
  decimals: number,
): { ref: React.RefCallback<HTMLElement>; value: number; hasAnimated: boolean } {
  const [value, setValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const elementRef = useRef<HTMLElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const rafRef = useRef<number | null>(null)

  const animate = useCallback(() => {
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing: easeOutCubic pour un effet naturel
      const eased = 1 - Math.pow(1 - progress, 3)
      const factor = Math.pow(10, decimals)
      const current = Math.round(eased * end * factor) / factor

      setValue(current)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setValue(end)
        setHasAnimated(true)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [end, duration, decimals])

  const ref = useCallback(
    (node: HTMLElement | null) => {
      // Cleanup précédent
      if (observerRef.current && elementRef.current) {
        observerRef.current.unobserve(elementRef.current)
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }

      elementRef.current = node

      if (!node || hasAnimated) return

      if (typeof IntersectionObserver === 'undefined') {
        // Fallback : pas d'IO, afficher directement
        setValue(end)
        setHasAnimated(true)
        return
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting && !hasAnimated) {
            animate()
            observerRef.current?.disconnect()
          }
        },
        { threshold: 0.2 },
      )

      observerRef.current.observe(node)
    },
    [animate, end, hasAnimated],
  )

  // Cleanup au démontage
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (observerRef.current) observerRef.current.disconnect()
    }
  }, [])

  return { ref, value, hasAnimated }
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
