'use client'

/**
 * MagneticLink — same magnetic gravity as MagneticButton, but renders an
 * anchor inside a Next.js Link. Use for `<Link>`-based CTAs in the hero or
 * any primary in-page conversion path.
 *
 * Mirror of `MagneticButton.tsx`. Kept as a separate component to avoid
 * `cloneElement`-style indirection and to keep the prop surface explicit.
 */
import Link, { type LinkProps } from 'next/link'
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type AnchorHTMLAttributes,
  type ReactNode,
} from 'react'

type MagneticLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    children: ReactNode
    strength?: number
    maxDistance?: number
    className?: string
  }

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
function supportsHover(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

export const MagneticLink = forwardRef<HTMLAnchorElement, MagneticLinkProps>(function MagneticLink(
  { children, strength = 0.18, maxDistance = 12, className, ...rest },
  ref
) {
  const innerRef = useRef<HTMLAnchorElement>(null)
  useImperativeHandle(ref, () => innerRef.current as HTMLAnchorElement, [])
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
    (e: React.PointerEvent<HTMLAnchorElement>) => {
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
    <Link
      ref={innerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`will-change-transform transition-transform duration-300 ease-out motion-reduce:!transform-none ${className ?? ''}`}
      {...rest}
    >
      {children}
    </Link>
  )
})

export default MagneticLink
