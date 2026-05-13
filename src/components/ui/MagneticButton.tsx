'use client'

/**
 * MagneticButton — subtle "magnetic gravity" effect (Linear/Stripe pattern).
 *
 * On pointer hover, translates the button towards the cursor by a small factor
 * (`strength` * delta). Returns to origin on leave with a snappy spring.
 *
 * Performance & accessibility guard-rails :
 * - Hover-only devices (`(hover: hover) and (pointer: fine)`). Mobile/touch is
 *   a no-op — the magnetic feel doesn't translate to touch input.
 * - `prefers-reduced-motion: reduce` disables the effect entirely.
 * - Animation runs in `requestAnimationFrame` driven by GPU-friendly transforms
 *   (translate3d) — no layout thrash, no React re-renders during the motion.
 */
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react'

interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  /**
   * Fraction of the pointer delta applied as translation. 0.15 = subtle,
   * 0.35 = pronounced. Default 0.18 (Stripe-like).
   */
  strength?: number
  /**
   * Max translation in px (clamps very large deltas at the edge of the
   * button's bounding box). Default 12.
   */
  maxDistance?: number
  asChild?: false
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function supportsHover(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

export const MagneticButton = forwardRef<HTMLButtonElement, MagneticButtonProps>(
  function MagneticButton(
    { children, strength = 0.18, maxDistance = 12, className, ...rest },
    ref
  ) {
    const innerRef = useRef<HTMLButtonElement>(null)
    useImperativeHandle(ref, () => innerRef.current as HTMLButtonElement, [])
    const rafRef = useRef<number | null>(null)
    const enabledRef = useRef<boolean>(false)

    useEffect(() => {
      enabledRef.current = supportsHover() && !prefersReducedMotion()
    }, [])

    const applyTransform = useCallback((x: number, y: number) => {
      const node = innerRef.current
      if (!node) return
      node.style.transform = `translate3d(${x}px, ${y}px, 0)`
    }, [])

    const handlePointerMove = useCallback(
      (e: React.PointerEvent<HTMLButtonElement>) => {
        if (!enabledRef.current) return
        const node = innerRef.current
        if (!node) return
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(() => {
          const rect = node.getBoundingClientRect()
          const cx = rect.left + rect.width / 2
          const cy = rect.top + rect.height / 2
          const dx = (e.clientX - cx) * strength
          const dy = (e.clientY - cy) * strength
          // Clamp to maxDistance for sanity at edges
          const clampedX = Math.max(-maxDistance, Math.min(maxDistance, dx))
          const clampedY = Math.max(-maxDistance, Math.min(maxDistance, dy))
          applyTransform(clampedX, clampedY)
        })
      },
      [strength, maxDistance, applyTransform]
    )

    const handlePointerLeave = useCallback(() => {
      if (!enabledRef.current) return
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      applyTransform(0, 0)
    }, [applyTransform])

    useEffect(() => {
      return () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      }
    }, [])

    return (
      <button
        ref={innerRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className={`will-change-transform transition-transform duration-300 ease-out motion-reduce:!transform-none ${className ?? ''}`}
        {...rest}
      >
        {children}
      </button>
    )
  }
)

export default MagneticButton
