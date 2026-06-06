'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Gate du chrome public (Header/Footer/MobileBottomNav) par préfixe d'URL.
 *
 * Les espaces applicatifs (/espace-artisan, /espace-client, /admin) ont leur
 * propre shell (sidebar + topbar) — le chrome marketing public n'y a pas sa
 * place (refonte espace artisan 2026-06-06).
 *
 * Pourquoi un composant client et pas un conditionnel server dans le root
 * layout : lire le pathname côté server (headers()) forcerait le rendu
 * dynamic de TOUT le site et tuerait l'ISR des ~459K pages publiques.
 * `usePathname` est résolu dès le SSR/SSG (pas de flash) ; header/footer
 * restent rendus server-side dans le root layout et arrivent ici en props
 * ReactNode — le SSR Googlebot du Header public est préservé.
 */
const HIDDEN_PREFIXES = ['/espace-artisan', '/espace-client', '/admin']

interface SiteChromeProps {
  header: ReactNode
  footer: ReactNode
  mobileNav: ReactNode
  children: ReactNode
}

export default function SiteChrome({ header, footer, mobileNav, children }: SiteChromeProps) {
  const pathname = usePathname()
  const hideChrome = HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )

  if (hideChrome) {
    return (
      <main id="main-content" tabIndex={-1} className="outline-none">
        {children}
      </main>
    )
  }

  return (
    <>
      {header}
      <main id="main-content" tabIndex={-1} className="pb-16 md:pb-0 outline-none">
        {children}
      </main>
      {footer}
      {mobileNav}
    </>
  )
}
