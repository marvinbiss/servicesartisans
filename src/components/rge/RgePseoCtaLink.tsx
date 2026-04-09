'use client'

/**
 * RgePseoCtaLink — wrapper client autour de next/link pour dispatcher
 * l'event analytics `rge_pseo_cta_click` sur les CTAs RGE des pSEO
 * (bandeaux guides, tarifs, villes, hubs). Ne change rien au SSR/SEO :
 * le rendu reste un <Link> Next.js standard, le dispatch est ajouté
 * en onClick.
 */

import Link from 'next/link'
import type { ReactNode, MouseEvent } from 'react'
import { RgeTracking, type RgePseoSurface } from '@/lib/analytics/tracking'

interface RgePseoCtaLinkProps {
  href: string
  surface: RgePseoSurface
  className?: string
  children: ReactNode
  prefetch?: boolean
  'aria-label'?: string
}

export default function RgePseoCtaLink({
  href,
  surface,
  className,
  children,
  prefetch,
  'aria-label': ariaLabel,
}: RgePseoCtaLinkProps) {
  const handleClick = (_e: MouseEvent<HTMLAnchorElement>) => {
    RgeTracking.pseoCtaClick({ surface, target: href })
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={className}
      prefetch={prefetch}
      aria-label={ariaLabel}
    >
      {children}
    </Link>
  )
}
