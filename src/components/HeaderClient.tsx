'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, ChevronDown, Phone } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useMobileMenu } from '@/contexts/MobileMenuContext'
import { capture, EVENT } from '@/lib/analytics/posthog'
import QuickSearch from '@/components/search/QuickSearch'
import { trackEvent } from '@/lib/analytics/tracking'
import { PHONE_TEL } from '@/lib/seo/config'
import { cn } from '@/lib/utils'
import {
  getLocationFromCoords,
  type MenuType,
  type MobileAccordion,
  type RegionCities,
  type PopularCity,
  type MetroRegion,
  type DomTomRegion,
} from './header/header-data'
import DesktopMegaMenus from './header/DesktopMegaMenus'
import MobileMenu from './header/MobileMenu'

interface HeaderClientProps {
  artisanCount: number
  allServicesCount: number
  villesCount: number
  regionsCount: number
  departementsCount: number
}

export default function HeaderClient({
  artisanCount,
  allServicesCount,
  villesCount,
  regionsCount,
  departementsCount,
}: HeaderClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isMenuOpen, setIsMenuOpen } = useMobileMenu()

  // Mobile search state
  const [serviceQuery, setServiceQuery] = useState('')
  const [locationQuery, setLocationQuery] = useState('')
  const [isLocating, setIsLocating] = useState(false)

  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [openMenu, setOpenMenu] = useState<MenuType>(null)
  const [mobileAccordion, setMobileAccordion] = useState<MobileAccordion>(null)

  // Geo menu data loaded from API to keep france.ts out of client bundle
  const [citiesByRegion, setCitiesByRegion] = useState<RegionCities[]>([])
  const [popularCities, setPopularCities] = useState<PopularCity[]>([])
  const [metroRegions, setMetroRegions] = useState<MetroRegion[]>([])
  const [domTomRegions, setDomTomRegions] = useState<DomTomRegion[]>([])

  const megaMenuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch geo menu data
  useEffect(() => {
    fetch('/api/geo/menu-data')
      .then((res) => res.json())
      .then((data) => {
        setCitiesByRegion(data.citiesByRegion ?? [])
        setPopularCities(data.popularCities ?? [])
        setMetroRegions(data.metroRegions ?? [])
        setDomTomRegions(data.domTomRegions ?? [])
      })
      .catch(() => {})
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  // Scroll listener
  useEffect(() => {
    if (!mounted) return
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [mounted])

  // Close all menus on route change
  const prevPathnameRef = useRef(pathname)
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname
      setOpenMenu(null)
      setMobileAccordion(null)
      setIsMenuOpen(false)
    }
  }, [pathname, setIsMenuOpen])

  // Track openMenu in a ref for document click handler
  const openMenuRef = useRef(openMenu)
  openMenuRef.current = openMenu

  // Close mega menus when clicking outside
  useEffect(() => {
    if (!mounted) return
    const handleClick = (e: MouseEvent) => {
      if (!openMenuRef.current) return
      const target = e.target as HTMLElement
      if (!target.closest('[data-menu-trigger]') && !target.closest('[data-menu-content]')) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [mounted])

  // Close on Escape
  useEffect(() => {
    if (!mounted) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [mounted])

  // Mobile search handler
  const handleSearch = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault()
      const params = new URLSearchParams()
      if (serviceQuery.trim()) params.set('q', serviceQuery.trim())
      if (locationQuery.trim()) params.set('location', locationQuery.trim())
      if (params.toString()) {
        capture(EVENT.SEARCH_PERFORMED, {
          service: serviceQuery.trim() || null,
          city: locationQuery.trim() || null,
          source: 'header',
        })
        router.push(`/recherche?${params.toString()}`)
      }
    },
    [serviceQuery, locationQuery, router]
  )

  // Geolocation for mobile search
  const handleGeolocation = useCallback(async () => {
    if (!navigator.geolocation) return
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const city = await getLocationFromCoords(
            position.coords.longitude,
            position.coords.latitude
          )
          if (city) setLocationQuery(city)
        } catch {
          // Ignore
        } finally {
          setIsLocating(false)
        }
      },
      () => {
        setIsLocating(false)
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }, [])

  const toggleMenu = (menu: MenuType) => {
    setOpenMenu((current) => (current === menu ? null : menu))
  }

  const openMenuOnHover = (menu: MenuType) => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current)
      megaMenuTimeoutRef.current = null
    }
    setOpenMenu(menu)
  }

  const closeMenusWithDelay = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setOpenMenu(null)
    }, 400)
  }

  const closeMenus = () => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current)
      megaMenuTimeoutRef.current = null
    }
    setOpenMenu(null)
  }

  const toggleMobileAccordion = (section: MobileAccordion) => {
    setMobileAccordion((current) => (current === section ? null : section))
  }

  const closeMobileMenu = () => {
    setIsMenuOpen(false)
  }

  // Helper to render a nav trigger button
  const NavTrigger = ({ menu, label }: { menu: MenuType; label: string }) => (
    <div
      className="relative"
      onMouseEnter={() => openMenuOnHover(menu)}
      onMouseLeave={closeMenusWithDelay}
    >
      <button
        type="button"
        data-menu-trigger={menu}
        onClick={() => toggleMenu(menu)}
        aria-expanded={openMenu === menu}
        aria-haspopup="true"
        className={cn(
          'relative flex items-center gap-1 px-3 py-2 rounded-lg font-medium text-[0.85rem] transition-all duration-200',
          'after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:h-[2px] after:bg-primary-400 after:transition-all after:duration-300 after:rounded-full',
          openMenu === menu
            ? 'text-primary-400 bg-primary-50/80 after:w-[60%]'
            : 'text-charcoal-600 hover:text-primary-400 hover:bg-sand-100/80 after:w-0 hover:after:w-[60%]'
        )}
      >
        {label}
        <ChevronDown
          className={cn(
            'w-4 h-4 transition-transform duration-300',
            openMenu === menu && 'rotate-180'
          )}
        />
      </button>
      {/* Rénovation & aides dropdown inline */}
      {menu === 'renovation' && openMenu === 'renovation' && (
        <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-xl shadow-soft border border-sand-200 py-2 z-50">
          <Link
            href="/simulateur-aides-renovation"
            className="block px-4 py-2.5 text-sm font-medium text-charcoal-700 hover:text-primary-400 hover:bg-sand-50 transition-colors"
            onClick={() => setOpenMenu(null)}
          >
            Simuler mes aides
          </Link>
          <Link
            href="/aides"
            className="block px-4 py-2.5 text-sm font-medium text-charcoal-700 hover:text-primary-400 hover:bg-sand-50 transition-colors"
            onClick={() => setOpenMenu(null)}
          >
            Aides à la rénovation
          </Link>
          <Link
            href="/comparatif-primes-cee-2026"
            className="block px-4 py-2.5 text-sm font-medium text-charcoal-700 hover:text-primary-400 hover:bg-sand-50 transition-colors"
            onClick={() => setOpenMenu(null)}
          >
            Comparatif primes CEE 2026
          </Link>
          <Link
            href="/barometre"
            className="block px-4 py-2.5 text-sm font-medium text-charcoal-700 hover:text-primary-400 hover:bg-sand-50 transition-colors"
            onClick={() => setOpenMenu(null)}
          >
            Baromètre prix
          </Link>
        </div>
      )}
      {/* Aide dropdown inline */}
      {menu === 'aide' && openMenu === 'aide' && (
        <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-xl shadow-soft border border-sand-200 py-2 z-50">
          <Link
            href="/avis"
            className="block px-4 py-2.5 text-sm font-medium text-charcoal-700 hover:text-primary-400 hover:bg-sand-50 transition-colors"
            onClick={() => setOpenMenu(null)}
          >
            Avis artisans
          </Link>
          <Link
            href="/tarifs"
            className="block px-4 py-2.5 text-sm font-medium text-charcoal-700 hover:text-primary-400 hover:bg-sand-50 transition-colors"
            onClick={() => setOpenMenu(null)}
          >
            Tarifs
          </Link>
          <Link
            href="/blog"
            className="block px-4 py-2.5 text-sm font-medium text-charcoal-700 hover:text-primary-400 hover:bg-sand-50 transition-colors"
            onClick={() => setOpenMenu(null)}
          >
            Blog
          </Link>
          <Link
            href="/guides"
            className="block px-4 py-2.5 text-sm font-medium text-charcoal-700 hover:text-primary-400 hover:bg-sand-50 transition-colors"
            onClick={() => setOpenMenu(null)}
          >
            Guides travaux
          </Link>
          <div className="h-px bg-sand-200 my-1" />
          <Link
            href="/faq"
            className="block px-4 py-2.5 text-sm font-medium text-charcoal-700 hover:text-primary-400 hover:bg-sand-50 transition-colors"
            onClick={() => setOpenMenu(null)}
          >
            FAQ
          </Link>
          <Link
            href="/comparaison"
            className="block px-4 py-2.5 text-sm font-medium text-charcoal-700 hover:text-primary-400 hover:bg-sand-50 transition-colors"
            onClick={() => setOpenMenu(null)}
          >
            Comparatifs
          </Link>
          <Link
            href="/glossaire"
            className="block px-4 py-2.5 text-sm font-medium text-charcoal-700 hover:text-primary-400 hover:bg-sand-50 transition-colors"
            onClick={() => setOpenMenu(null)}
          >
            Glossaire
          </Link>
          <div className="h-px bg-sand-200 my-1" />
          <Link
            href="/devenir-partenaire-cee"
            className="block px-4 py-2.5 text-sm font-semibold text-amber-700 hover:text-amber-800 hover:bg-amber-50 transition-colors"
            onClick={() => setOpenMenu(null)}
          >
            Pour artisans : devenir partenaire CEE
          </Link>
          <Link
            href="/inscription-artisan"
            className="block px-4 py-2.5 text-sm font-medium text-charcoal-700 hover:text-primary-400 hover:bg-sand-50 transition-colors"
            onClick={() => setOpenMenu(null)}
          >
            Inscription artisan
          </Link>
        </div>
      )}
    </div>
  )

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-skip-link transition-all duration-300',
          scrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-soft border-b border-sand-200/60'
            : 'bg-white/60 backdrop-blur-sm border-b border-transparent'
        )}
      >
        {/* Reassurance bar */}
        <div
          className={cn(
            'hidden lg:block text-center py-1 text-xs font-medium text-accent-600 bg-accent-50/60 border-b border-accent-100/40 transition-all duration-300',
            scrolled && 'hidden'
          )}
        >
          <span className="inline-flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Artisans RGE certifiés — Service 100% gratuit
          </span>
        </div>

        {/* Main header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={cn(
              'flex justify-between items-center transition-all duration-300',
              scrolled ? 'h-14' : 'h-16'
            )}
          >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group/logo">
              <div className="flex items-center gap-2.5 transition-transform duration-200 hover:scale-[1.02]">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 48 48"
                  fill="none"
                  className="flex-shrink-0"
                >
                  <defs>
                    <linearGradient
                      id="headerBg"
                      x1="0"
                      y1="0"
                      x2="48"
                      y2="48"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#E86B4B" />
                      <stop offset="1" stopColor="#C24B2A" />
                    </linearGradient>
                    <radialGradient id="headerShine" cx=".32" cy=".26" r=".65">
                      <stop stopColor="#fff" stopOpacity=".16" />
                      <stop offset="1" stopColor="#fff" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#headerBg)" />
                  <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#headerShine)" />
                  <path
                    fillRule="evenodd"
                    fill="#fff"
                    fillOpacity="0.95"
                    d="M24 11 L38.5 24 L35 24 L35 37 L13 37 L13 24 L9.5 24Z M21 37 V29 A3 3 0 0 1 27 29 V37Z"
                  />
                </svg>
                <span className="hidden sm:inline text-xl font-heading font-extrabold tracking-tight text-charcoal-900 group-hover/logo:text-charcoal-700 transition-colors duration-200">
                  Services
                  <span className="text-primary-400 group-hover/logo:text-primary-300 transition-colors duration-200">
                    Artisans
                  </span>
                </span>
              </div>
            </Link>

            {/* Quick Search */}
            <div className="hidden md:flex flex-1 min-w-[220px] max-w-xl mx-4 lg:mx-8 items-center gap-2">
              {mounted ? (
                <QuickSearch />
              ) : (
                <div className="w-full rounded-full border border-sand-300 bg-sand-50 h-[38px]" />
              )}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event('sa:open-command-palette'))}
                className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-charcoal-500 bg-sand-50 hover:bg-sand-100 border border-sand-300 rounded-lg transition-colors"
                aria-label="Recherche rapide (Ctrl+K)"
                title="Recherche rapide"
              >
                <kbd className="font-mono text-2xs px-1 rounded bg-white border border-sand-300">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Navigation Desktop */}
            <nav
              className="hidden lg:flex items-center space-x-0.5"
              aria-label="Navigation principale"
            >
              <NavTrigger menu="trouver" label="Trouver un artisan" />
              <NavTrigger menu="lieu" label="Par lieu" />
              <NavTrigger menu="renovation" label="Rénovation & aides" />
              <NavTrigger menu="aide" label="Aide" />

              {/* Connexion réservée artisans/admins (espace particulier fermé
                  2026-06-05). Label explicite pour ne pas suggérer un compte
                  client. */}
              <Link
                href="/connexion"
                prefetch={false}
                className="relative text-charcoal-600 hover:text-primary-400 px-3 py-2 rounded-lg font-medium text-[0.85rem] hover:bg-sand-100/80 transition-all duration-200 after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:w-0 hover:after:w-[60%] after:h-[2px] after:bg-primary-400 after:transition-all after:duration-300 after:rounded-full"
              >
                Espace artisan
              </Link>

              {/* Pivot full RGE 2026-05-03 (revert partiel) : badge urgence
                  réintégré, restreint aux trades RGE-compatibles (plombier,
                  chauffagiste, electricien, couvreur, climaticien). Le hub
                  /urgence reste indexable + sitemap-listed. */}
              <Link
                href="/urgence"
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors duration-200"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                </span>
                Urgence RGE 24h
              </Link>

              <Link
                href="/demander-un-devis"
                onClick={() => trackEvent('header_devis_click', { source: 'header', pathname })}
                className="ml-2 px-5 py-2 bg-primary-500 hover:bg-primary-600 text-white font-heading font-semibold text-sm rounded-xl shadow-cta hover:shadow-cta-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                Devis gratuit
              </Link>
            </nav>

            {/* Mobile: CTA compact + hamburger */}
            <div className="flex lg:hidden items-center gap-2">
              <a
                href={PHONE_TEL}
                className="md:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-charcoal-600 hover:bg-sand-100 transition-colors"
                aria-label="Appeler ServicesArtisans"
              >
                <Phone className="w-5 h-5" />
              </a>
              <Link
                href="/demander-un-devis"
                className="px-3.5 py-2 bg-primary-500 hover:bg-primary-600 text-white font-heading font-semibold text-xs rounded-lg shadow-cta transition-all duration-200"
              >
                Devis gratuit
              </Link>
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                aria-expanded={isMenuOpen}
                aria-haspopup="dialog"
                aria-controls="mobile-menu-drawer"
                className="flex items-center justify-center w-11 h-11 rounded-lg active:bg-sand-200 hover:bg-sand-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-charcoal-700" aria-hidden="true" />
                ) : (
                  <Menu className="w-6 h-6 text-charcoal-700" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Mega Menus */}
        {mounted && (openMenu === 'trouver' || openMenu === 'lieu') && (
          <DesktopMegaMenus
            openMenu={openMenu}
            artisanCount={artisanCount}
            allServicesCount={allServicesCount}
            villesCount={villesCount}
            regionsCount={regionsCount}
            departementsCount={departementsCount}
            citiesByRegion={citiesByRegion}
            metroRegions={metroRegions}
            domTomRegions={domTomRegions}
            openMenuOnHover={openMenuOnHover}
            closeMenusWithDelay={closeMenusWithDelay}
            closeMenus={closeMenus}
          />
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <MobileMenu
            serviceQuery={serviceQuery}
            setServiceQuery={setServiceQuery}
            locationQuery={locationQuery}
            setLocationQuery={setLocationQuery}
            isLocating={isLocating}
            handleGeolocation={handleGeolocation}
            handleSearch={handleSearch}
            mobileAccordion={mobileAccordion}
            toggleMobileAccordion={toggleMobileAccordion}
            popularCities={popularCities}
            metroRegions={metroRegions}
            domTomRegions={domTomRegions}
            closeMobileMenu={closeMobileMenu}
          />
        )}
      </header>
      {/* Spacer to offset fixed header height (nav 64px + reassurance bar ~28px on lg) */}
      <div className="h-16 lg:h-[92px]" aria-hidden="true" />
    </>
  )
}
