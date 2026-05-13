'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Search,
  ChevronDown,
  MapPin,
  Wrench,
  ArrowRight,
  Star,
  Layers,
  Sparkles,
  Navigation,
  Map,
  Building2,
  Phone,
  Heart,
  BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  serviceCategories,
  type MobileAccordion,
  type PopularCity,
  type MetroRegion,
  type DomTomRegion,
} from './header-data'

interface MobileMenuProps {
  serviceQuery: string
  setServiceQuery: (v: string) => void
  locationQuery: string
  setLocationQuery: (v: string) => void
  isLocating: boolean
  handleGeolocation: () => void
  handleSearch: (e?: React.FormEvent) => void
  mobileAccordion: MobileAccordion
  toggleMobileAccordion: (section: MobileAccordion) => void
  popularCities: PopularCity[]
  metroRegions: MetroRegion[]
  domTomRegions: DomTomRegion[]
  favoritesCount: number
  closeMobileMenu: () => void
}

export default function MobileMenu({
  serviceQuery,
  setServiceQuery,
  locationQuery,
  setLocationQuery,
  isLocating,
  handleGeolocation,
  handleSearch,
  mobileAccordion,
  toggleMobileAccordion,
  popularCities,
  metroRegions,
  domTomRegions,
  favoritesCount,
  closeMobileMenu,
}: MobileMenuProps) {
  const closeAndResetAccordion = () => {
    closeMobileMenu()
  }

  const dialogRef = useRef<HTMLDivElement>(null)

  // a11y — Escape to close, focus trap inside the drawer, restore focus
  // on the trigger when the drawer unmounts. The hamburger button in
  // HeaderClient is the prior focus target.
  useEffect(() => {
    const node = dialogRef.current
    if (!node) return
    const previouslyFocused = (document.activeElement as HTMLElement | null) ?? null

    // Move focus into the drawer so SR users hear the new landmark.
    const focusables = node.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    if (focusables.length > 0) {
      focusables[0].focus()
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        closeMobileMenu()
        return
      }
      if (e.key !== 'Tab') return
      const live = node.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (live.length === 0) return
      const first = live[0]
      const last = live[live.length - 1]
      const active = document.activeElement
      if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      // Restore focus to the hamburger button so the keyboard user lands
      // where they left off. Guard against the trigger having been
      // removed (e.g., route change unmounts header).
      if (previouslyFocused && document.body.contains(previouslyFocused)) {
        previouslyFocused.focus()
      }
    }
  }, [closeMobileMenu])

  return (
    <div
      ref={dialogRef}
      id="mobile-menu-drawer"
      data-menu-content="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu de navigation"
      className="lg:hidden border-t border-sand-200/50 max-h-[calc(100vh-120px)] overflow-y-auto bg-white/95 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        {/* Search Mobile - Dual Field */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex items-center bg-white border-2 border-sand-300 rounded-2xl overflow-hidden focus-within:border-clay-400 focus-within:shadow-lg focus-within:shadow-clay-400/10 transition-all duration-200">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
              <label htmlFor="mobile-search-service" className="sr-only">
                Service recherché
              </label>
              <input
                id="mobile-search-service"
                type="text"
                placeholder="Service..."
                value={serviceQuery}
                onChange={(e) => setServiceQuery(e.target.value)}
                className="w-full h-12 pl-9 pr-2 bg-transparent text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none text-sm"
              />
            </div>
            <div className="w-px h-7 bg-sand-300" />
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
              <label htmlFor="mobile-search-location" className="sr-only">
                Ville ou code postal
              </label>
              <input
                id="mobile-search-location"
                type="text"
                placeholder="Ville..."
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="w-full h-12 pl-9 pr-10 bg-transparent text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none text-sm"
              />
              <button
                type="button"
                onClick={handleGeolocation}
                disabled={isLocating}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-2 hover:bg-sand-100 rounded-full transition-colors disabled:opacity-50"
                aria-label="Utiliser ma position"
                title="Ma position"
              >
                <Navigation
                  className={`w-4 h-4 ${isLocating ? 'animate-spin text-clay-400' : 'text-charcoal-400'}`}
                />
              </button>
            </div>
            <button
              type="submit"
              className="flex-shrink-0 m-1.5 w-10 h-10 bg-clay-400 hover:bg-clay-600 text-white rounded-full transition-all flex items-center justify-center"
              aria-label="Rechercher"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>

        <nav className="space-y-2" aria-label="Menu mobile">
          {/* ===== Services Accordion ===== */}
          <div className="rounded-xl border border-sand-200 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleMobileAccordion('services')}
              aria-expanded={mobileAccordion === 'services'}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3.5 transition-colors',
                mobileAccordion === 'services' ? 'bg-primary-50' : 'bg-sand-50 hover:bg-sand-100'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    mobileAccordion === 'services' ? 'bg-primary-100' : 'bg-white'
                  }`}
                >
                  <Wrench
                    className={`w-4 h-4 ${mobileAccordion === 'services' ? 'text-primary-500' : 'text-charcoal-900'}`}
                  />
                </div>
                <span
                  className={`font-semibold text-sm ${mobileAccordion === 'services' ? 'text-primary-600' : 'text-charcoal-900'}`}
                >
                  Services
                </span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-charcoal-400 transition-transform duration-300 ${
                  mobileAccordion === 'services' ? 'rotate-180 text-primary-400' : ''
                }`}
              />
            </button>

            {mobileAccordion === 'services' && (
              <div className="px-4 pb-4 pt-2 bg-white">
                {serviceCategories.map((cat) => (
                  <div key={cat.category} className="mb-3 last:mb-0">
                    <div className="text-xs font-bold text-charcoal-400 uppercase tracking-wider mb-2 px-1">
                      {cat.category}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {cat.services.map((service) => {
                        const Icon = service.icon
                        return (
                          <Link
                            key={`mob-${cat.category}-${service.slug}`}
                            href={`/services/${service.slug}`}
                            className="flex items-center gap-2 p-2.5 bg-sand-50 rounded-lg hover:bg-primary-50 transition-colors"
                            onClick={closeAndResetAccordion}
                          >
                            <Icon className="w-4 h-4 text-primary-500" />
                            <span className="text-sm font-medium text-charcoal-700">
                              {service.name}
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                ))}
                <Link
                  href="/services"
                  className="flex items-center gap-2 text-primary-500 text-sm font-semibold mt-3 px-1"
                  onClick={closeAndResetAccordion}
                >
                  Voir tous les services
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* ===== Villes Accordion ===== */}
          <div className="rounded-xl border border-sand-200 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleMobileAccordion('villes')}
              aria-expanded={mobileAccordion === 'villes'}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3.5 transition-colors',
                mobileAccordion === 'villes' ? 'bg-primary-50' : 'bg-sand-50 hover:bg-sand-100'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    mobileAccordion === 'villes' ? 'bg-primary-100' : 'bg-white'
                  }`}
                >
                  <Building2
                    className={`w-4 h-4 ${mobileAccordion === 'villes' ? 'text-primary-500' : 'text-charcoal-900'}`}
                  />
                </div>
                <span
                  className={`font-semibold text-sm ${mobileAccordion === 'villes' ? 'text-primary-600' : 'text-charcoal-900'}`}
                >
                  Villes
                </span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-charcoal-400 transition-transform duration-300 ${
                  mobileAccordion === 'villes' ? 'rotate-180 text-primary-400' : ''
                }`}
              />
            </button>

            {mobileAccordion === 'villes' && (
              <div className="px-4 pb-4 pt-2 bg-white">
                <div className="flex flex-wrap gap-2">
                  {popularCities.map((city) => (
                    <Link
                      key={city.slug}
                      href={`/villes/${city.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm bg-sand-100 hover:bg-primary-100 text-charcoal-700 hover:text-primary-600 px-3 py-2 rounded-lg font-medium transition-colors"
                      onClick={closeAndResetAccordion}
                    >
                      <MapPin className="w-3 h-3" />
                      {city.name}
                    </Link>
                  ))}
                </div>
                <Link
                  href="/villes"
                  className="flex items-center gap-2 text-primary-500 text-sm font-semibold mt-3 px-1"
                  onClick={closeAndResetAccordion}
                >
                  Voir toutes les villes
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* ===== Régions Accordion ===== */}
          <div className="rounded-xl border border-sand-200 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleMobileAccordion('regions')}
              aria-expanded={mobileAccordion === 'regions'}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3.5 transition-colors',
                mobileAccordion === 'regions' ? 'bg-primary-50' : 'bg-sand-50 hover:bg-sand-100'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    mobileAccordion === 'regions' ? 'bg-primary-100' : 'bg-white'
                  }`}
                >
                  <Map
                    className={`w-4 h-4 ${mobileAccordion === 'regions' ? 'text-primary-500' : 'text-charcoal-900'}`}
                  />
                </div>
                <span
                  className={`font-semibold text-sm ${mobileAccordion === 'regions' ? 'text-primary-600' : 'text-charcoal-900'}`}
                >
                  Régions
                </span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-charcoal-400 transition-transform duration-300 ${
                  mobileAccordion === 'regions' ? 'rotate-180 text-primary-400' : ''
                }`}
              />
            </button>

            {mobileAccordion === 'regions' && (
              <div className="px-4 pb-4 pt-2 bg-white">
                <div className="grid grid-cols-2 gap-1.5">
                  {[...metroRegions, ...domTomRegions].map((region) => (
                    <Link
                      key={region.slug}
                      href={`/regions/${region.slug}`}
                      className="flex items-center gap-2 p-2.5 bg-sand-50 rounded-lg hover:bg-primary-50 transition-colors"
                      onClick={closeAndResetAccordion}
                    >
                      <Map className="w-3.5 h-3.5 text-charcoal-400" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-charcoal-700 truncate">
                          {region.name}
                        </div>
                        <div className="text-[11px] text-charcoal-400">
                          {region.departments?.length ?? 0} dép.
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  href="/regions"
                  className="flex items-center gap-2 text-primary-500 text-sm font-semibold mt-3 px-1"
                  onClick={closeAndResetAccordion}
                >
                  Voir toutes les régions
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Liens directs SEO */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/avis"
              className="flex items-center gap-2.5 px-4 py-3 bg-sand-50 hover:bg-primary-50 rounded-xl transition-colors"
              onClick={closeMobileMenu}
            >
              <Star className="w-4 h-4 text-amber-500" />
              <span className="font-medium text-sm text-charcoal-700">Avis</span>
            </Link>
            <Link
              href="/tarifs"
              className="flex items-center gap-2.5 px-4 py-3 bg-sand-50 hover:bg-primary-50 rounded-xl transition-colors"
              onClick={closeMobileMenu}
            >
              <Layers className="w-4 h-4 text-primary-400" />
              <span className="font-medium text-sm text-charcoal-700">Tarifs</span>
            </Link>
            <Link
              href="/blog"
              className="flex items-center gap-2.5 px-4 py-3 bg-sand-50 hover:bg-primary-50 rounded-xl transition-colors"
              onClick={closeMobileMenu}
            >
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="font-medium text-sm text-charcoal-700">Blog</span>
            </Link>
            <Link
              href="/guides"
              className="flex items-center gap-2.5 px-4 py-3 bg-sand-50 hover:bg-primary-50 rounded-xl transition-colors"
              onClick={closeMobileMenu}
            >
              <BookOpen className="w-4 h-4 text-green-500" />
              <span className="font-medium text-sm text-charcoal-700">Guides</span>
            </Link>
          </div>

          {/* CTAs */}
          <div className="pt-3 space-y-3">
            <Link
              href="/mes-favoris"
              className="flex items-center justify-center gap-2 w-full py-3 border-2 border-red-100 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-all duration-200"
              onClick={closeMobileMenu}
            >
              <Heart className="w-5 h-5" />
              Mes favoris
              {favoritesCount > 0 && (
                <span className="min-w-[20px] h-[20px] flex items-center justify-center bg-red-500 text-white text-[11px] font-bold rounded-full px-1 leading-none">
                  {favoritesCount > 99 ? '99+' : favoritesCount}
                </span>
              )}
            </Link>
            {/* Pivot full RGE 2026-05-03 : CTA mobile "Urgences 24h"
                remplacé par "Simuler aides MaPrimeRénov & CEE". */}
            <Link
              href="/simulateur-aides-renovation"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors duration-200 shadow-lg shadow-green-600/20"
              onClick={closeMobileMenu}
            >
              <Phone className="w-5 h-5" />
              Simuler mes aides rénovation
            </Link>
            <div className="flex gap-3">
              <Link
                href="/connexion"
                className="flex-1 py-3 border-2 border-sand-300 text-charcoal-700 rounded-xl font-medium text-center hover:bg-sand-50 hover:border-sand-400 transition-all duration-200"
                onClick={closeMobileMenu}
              >
                Connexion
              </Link>
              <Link
                href="/devis"
                className="flex-1 py-3 bg-gradient-to-r from-clay-400 to-clay-600 hover:from-clay-500 hover:to-clay-700 text-white rounded-xl font-semibold text-center shadow-md shadow-clay-400/20 transition-all duration-200"
                onClick={closeMobileMenu}
              >
                Devis gratuit
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </div>
  )
}
