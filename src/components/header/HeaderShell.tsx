/**
 * HeaderShell — Server Component static HTML shell.
 *
 * Rendered server-side so Googlebot always sees the full navigation.
 * The interactive Header loads on top via dynamic({ ssr: false })
 * and replaces this shell visually once hydrated.
 *
 * MUST stay in sync with Header.tsx layout/design.
 */

import Link from 'next/link'

export function HeaderShell({ artisanCount: _artisanCount = 0 }: { artisanCount?: number }) {
  return (
    <div id="header-shell">
      <header className="fixed top-0 left-0 right-0 z-[9999] bg-white/60 backdrop-blur-sm border-b border-transparent">
        {/* Reassurance bar */}
        <div className="hidden lg:block text-center py-1 text-xs font-medium text-accent-600 bg-accent-50/60 border-b border-accent-100/40">
          <span className="inline-flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Artisans vérifiés SIREN — Service 100% gratuit
          </span>
        </div>

        {/* Main header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
              <svg width="36" height="36" viewBox="0 0 48 48" fill="none" className="flex-shrink-0">
                <defs>
                  <linearGradient id="shellBg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#E86B4B" />
                    <stop offset="1" stopColor="#C24B2A" />
                  </linearGradient>
                </defs>
                <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#shellBg)" />
                <path fillRule="evenodd" fill="#fff" fillOpacity="0.95" d="M24 11 L38.5 24 L35 24 L35 37 L13 37 L13 24 L9.5 24Z M21 37 V29 A3 3 0 0 1 27 29 V37Z" />
              </svg>
              <span className="hidden sm:inline text-xl font-heading font-extrabold tracking-tight text-charcoal-900">
                Services<span className="text-primary-400">Artisans</span>
              </span>
            </Link>

            {/* Search placeholder */}
            <div className="hidden md:flex flex-1 min-w-[220px] max-w-xl mx-4 lg:mx-8">
              <div className="w-full rounded-full border border-sand-300 bg-sand-50 h-[38px]" />
            </div>

            {/* Navigation Desktop — static links for SEO */}
            <nav className="hidden lg:flex items-center space-x-0.5" aria-label="Navigation principale">
              <Link href="/services" className="px-3 py-2 rounded-lg font-medium text-[0.85rem] text-charcoal-600 hover:text-primary-400 hover:bg-sand-100/80 transition-all duration-200">
                Services
              </Link>
              <Link href="/villes" className="px-3 py-2 rounded-lg font-medium text-[0.85rem] text-charcoal-600 hover:text-primary-400 hover:bg-sand-100/80 transition-all duration-200">
                Villes
              </Link>
              <Link href="/regions" className="px-3 py-2 rounded-lg font-medium text-[0.85rem] text-charcoal-600 hover:text-primary-400 hover:bg-sand-100/80 transition-all duration-200">
                Régions
              </Link>
              <Link href="/blog" className="px-3 py-2 rounded-lg font-medium text-[0.85rem] text-charcoal-600 hover:text-primary-400 hover:bg-sand-100/80 transition-all duration-200">
                Blog
              </Link>
              <Link href="/connexion" className="px-3 py-2 rounded-lg font-medium text-[0.85rem] text-charcoal-600 hover:text-primary-400 hover:bg-sand-100/80 transition-all duration-200">
                Connexion
              </Link>
              <Link
                href="/urgence"
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors duration-200"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                </span>
                Urgences 24h
              </Link>
              <Link
                href="/devis"
                className="ml-2 px-5 py-2 bg-primary-400 hover:bg-primary-500 text-white font-heading font-semibold text-sm rounded-xl shadow-cta hover:shadow-cta-hover transition-all duration-200"
              >
                Trouver un artisan
              </Link>
            </nav>

            {/* Mobile CTA */}
            <div className="flex lg:hidden items-center gap-2">
              <Link
                href="/devis"
                className="px-3.5 py-2 bg-primary-400 hover:bg-primary-500 text-white font-heading font-semibold text-xs rounded-lg shadow-cta transition-all duration-200"
              >
                Devis gratuit
              </Link>
              {/* Hamburger placeholder — interactive Header replaces this */}
              <div className="flex items-center justify-center w-11 h-11 rounded-lg">
                <svg className="w-6 h-6 text-charcoal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Spacer */}
      <div className="h-16" aria-hidden="true" />
    </div>
  )
}
