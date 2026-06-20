'use client'

import { usePathname } from 'next/navigation'

/**
 * Masque le chrome global (Header / Footer / barre mobile) sur les
 * landing pages publicitaires dédiées — focus conversion, zéro distraction.
 */
const HIDDEN_PREFIXES = ['/artisans/rejoindre']

interface SiteChromeProps {
  children: React.ReactNode
}

export function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname()
  const hidden = HIDDEN_PREFIXES.some((prefix) => pathname?.startsWith(prefix))

  if (hidden) return null
  return <>{children}</>
}
