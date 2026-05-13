'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  MapPin,
  List,
  Map as MapIcon,
  Search,
  ChevronDown,
  ArrowRight,
  FileText,
  SearchX,
  Star,
  Leaf,
} from 'lucide-react'
import { Provider, Service, Location } from '@/types'
import ProviderList from '@/components/ProviderList'
import { RgeTracking } from '@/lib/analytics/tracking'
import { buildDevisHref } from '@/lib/utils'
import { SaveSearchButton } from '@/components/providers/SaveSearchButton'
import { SortDropdown, type SortOrder } from '@/components/providers/SortDropdown'
import { FilterPanel, countActiveFilters, parseFilters } from '@/components/providers/FilterPanel'
import { ActiveFilterChips } from '@/components/providers/ActiveFilterChips'
import { ProviderListSkeleton } from '@/components/ui/Skeleton'
import { StickyMobileDevisCTA } from '@/components/providers/StickyMobileDevisCTA'
import { hasActiveRgeQualification } from '@/lib/rge/has-active-qualification'

const PAGE_SIZE = 50

// Import GeographicMap dynamically to avoid SSR issues with Leaflet
const GeographicMap = dynamic(() => import('@/components/maps/GeographicMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-sand-100 animate-pulse flex items-center justify-center rounded-xl">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <span className="text-charcoal-500 font-medium">Chargement de la carte...</span>
      </div>
    </div>
  ),
})

interface ServiceLocationPageClientProps {
  service: Service
  location: Location
  providers: Provider[]
  h1Text?: string
  totalCount?: number
  rgeCount?: number
  serviceSlug?: string
  locationSlug?: string
  recentDevisCount?: number
  rgeOnly?: boolean
}

export default function ServiceLocationPageClient({
  service,
  location,
  providers: initialProviders,
  h1Text,
  totalCount = 0,
  rgeCount = 0,
  serviceSlug,
  locationSlug,
  recentDevisCount = 0,
  rgeOnly = true, // 2026-05-05 pivot full RGE — default on côté serveur
}: ServiceLocationPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [allProviders, setAllProviders] = useState<Provider[]>(initialProviders)
  const [liveCount, setLiveCount] = useState(totalCount)

  // When the server re-renders with a different rgeOnly (URL ?rge change),
  // reset the client state to the fresh server data.
  useEffect(() => {
    setAllProviders(initialProviders)
    setLiveCount(totalCount)
  }, [initialProviders, totalCount, rgeOnly])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split')
  const [_isMobile, setIsMobile] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [mapHoveredProviderId, setMapHoveredProviderId] = useState<string | null>(null)

  // Read initial values from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [sortOrder, setSortOrder] = useState<SortOrder>(
    (searchParams.get('sort') as SortOrder) || 'relevance'
  )

  // Update URL params when search/sort change
  const updateUrlParams = useCallback(
    (q: string, sort: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (q) {
        params.set('q', q)
      } else {
        params.delete('q')
      }
      if (sort && sort !== 'relevance' && sort !== 'default') {
        params.set('sort', sort)
      } else {
        params.delete('sort')
      }
      const qs = params.toString()
      router.replace(`${window.location.pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
    },
    [router, searchParams]
  )

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value)
      updateUrlParams(value, sortOrder)
    },
    [sortOrder, updateUrlParams]
  )

  const handleSortChange = useCallback(
    (value: SortOrder) => {
      setSortOrder(value)
      updateUrlParams(searchQuery, value)
    },
    [searchQuery, updateUrlParams]
  )

  // Toggle RGE filter via URL — triggers a server re-render with filtered data
  const handleRgeToggle = useCallback(
    (next: boolean) => {
      const params = new URLSearchParams(searchParams.toString())
      if (next) {
        params.set('rge', '1')
      } else {
        params.delete('rge')
      }
      const qs = params.toString()
      router.replace(`${window.location.pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
      RgeTracking.filterApply({
        service: serviceSlug || service.slug,
        city: locationSlug || location.slug,
        active: next,
      })
    },
    [router, searchParams, serviceSlug, locationSlug, service.slug, location.slug]
  )

  const hasMore = allProviders.length < liveCount

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || !serviceSlug || !locationSlug) return
    setIsLoadingMore(true)
    try {
      const res = await fetch(
        `/api/providers/listing?service=${serviceSlug}&location=${locationSlug}&offset=${allProviders.length}&limit=${PAGE_SIZE}${rgeOnly ? '&rge=1' : ''}`
      )
      if (!res.ok) throw new Error('fetch error')
      const data = await res.json()
      if (data.providers?.length) {
        setAllProviders((prev) => [...prev, ...data.providers])
      }
    } catch {
      // silently fail — user can retry by clicking again
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingMore, hasMore, serviceSlug, locationSlug, allProviders.length, rgeOnly])

  // Client-side fallback: if the server pre-rendered with 0 providers
  // (e.g. build with NEXT_BUILD_SKIP_DB=1), fetch them from the API.
  const [isHydrating, setIsHydrating] = useState(initialProviders.length === 0)
  useEffect(() => {
    if (initialProviders.length > 0 || !serviceSlug || !locationSlug) {
      setIsHydrating(false)
      return
    }
    let cancelled = false
    fetch(
      `/api/providers/listing?service=${serviceSlug}&location=${locationSlug}&limit=${PAGE_SIZE}${rgeOnly ? '&rge=1' : ''}`
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return
        if (data?.providers?.length) {
          setAllProviders(data.providers)
        }
        if (typeof data?.totalCount === 'number' && data.totalCount > 0) {
          setLiveCount(data.totalCount)
        }
        setIsHydrating(false)
      })
      .catch(() => {
        if (!cancelled) setIsHydrating(false)
      })
    return () => {
      cancelled = true
    }
  }, [initialProviders.length, serviceSlug, locationSlug, rgeOnly])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Read URL filters + derive filtered list (client-side over `allProviders`).
  // `rgeOnly` reste géré séparément (déclenche un re-fetch serveur). Les
  // filtres ci-dessous sont strictement client-side : aucune requête réseau
  // pour les toggles, latence < 16ms.
  const filters = useMemo(() => parseFilters(searchParams), [searchParams])
  const activeFilterCount = countActiveFilters(filters)
  const filteredProviders = useMemo(() => {
    if (activeFilterCount === 0) return allProviders
    return allProviders.filter((p) => {
      if (filters.rge && !hasActiveRgeQualification(p.rge_qualifications)) return false
      if (filters.verified && !p.is_verified) return false
      if (filters.claimed && !p.user_id) return false
      if (filters.emergency && !p.emergency_available) return false
      if (filters.freeQuote && !p.free_quote) return false
      if (filters.ratingMin > 0 && (p.rating_average ?? 0) < filters.ratingMin) return false
      return true
    })
  }, [allProviders, filters, activeFilterCount])

  // Memoize providers for the map — uses `filteredProviders` pour synchro
  // liste/carte avec les filtres actifs.
  const mapProviders = useMemo(
    () =>
      filteredProviders.map((p) => ({
        id: p.id,
        name: p.name || '',
        stable_id: p.stable_id ?? undefined,
        slug: p.slug,
        latitude: p.latitude || 0,
        longitude: p.longitude || 0,
        rating_average: p.rating_average,
        review_count: p.review_count,
        specialty: p.specialty,
        address_city: p.address_city,
        is_verified: p.is_verified || false,
        address_street: p.address_street,
        address_postal_code: p.address_postal_code,
      })),
    [filteredProviders]
  )

  // Default center: location coordinates -> provider average -> France fallback
  let computedLat = location.latitude
  let computedLng = location.longitude
  if (!computedLat || !computedLng) {
    const withCoords = allProviders.filter(
      (p): p is typeof p & { latitude: number; longitude: number } =>
        p.latitude != null && p.longitude != null
    )
    if (withCoords.length > 0) {
      computedLat = withCoords.reduce((sum, p) => sum + p.latitude, 0) / withCoords.length
      computedLng = withCoords.reduce((sum, p) => sum + p.longitude, 0) / withCoords.length
    }
  }
  const mapCenter: [number, number] = [computedLat || 46.603354, computedLng || 1.888334]
  const mapZoom = computedLat ? 12 : 6

  // Compute average rating for reassurance bar
  const avgRating = useMemo(() => {
    const rated = allProviders.filter((p) => p.rating_average && p.rating_average > 0)
    if (rated.length === 0) return null
    const sum = rated.reduce((s, p) => s + (p.rating_average || 0), 0)
    return (sum / rated.length).toFixed(1)
  }, [allProviders])

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Header with H1 + Reassurance bar */}
      <div className="bg-white border-b border-sand-300 md:sticky md:top-[60px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          {/* Title & View toggle */}
          <div className="flex items-center justify-between">
            <div>
              {/* Tier 0 bleeding stop 2026-05-04 : downgrade <h1> → <p>.
                  Le H1 SSR canonical vit dans page.tsx ligne ~1139 (server
                  component, prioritaire Googlebot). Avoir 2 H1 sur la même
                  URL produit le bug "Multiple H1 tags 8 207 pages" (audit
                  Ahrefs site_audit_issues_2026-05). Cette barre sticky
                  mobile garde le même rendu visuel mais ne pollue plus le
                  signal hierarchical headings. */}
              <p className="font-heading text-2xl md:text-3xl font-bold text-charcoal-900 tracking-tight">
                {h1Text || `${service.name} à ${location.name}`}
              </p>
              {(location.department_name || location.postal_code) && (
                <p className="text-charcoal-500 text-sm flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  {location.department_name
                    ? `${location.department_name}${location.department_code ? ` (${location.department_code})` : ''}`
                    : location.postal_code}
                </p>
              )}

              {/* Reassurance bar
                  2026-05-05 pivot full RGE — `liveCount` est désormais déjà
                  RGE-only (rgeOnly default true côté listing). On unifie les
                  deux compteurs en "artisans RGE certifiés" pour ne plus
                  surcompter "artisans vérifiés" + "certifiés RGE". */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3">
                {liveCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-charcoal-600">
                    <Leaf className="w-4 h-4 text-accent-600" />
                    <span className="font-semibold text-charcoal-900">{liveCount}</span> artisan
                    {liveCount > 1 ? 's' : ''} RGE certifié{liveCount > 1 ? 's' : ''}
                  </span>
                )}
                {avgRating && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-charcoal-600">
                    <Star className="w-4 h-4 text-secondary-400 fill-secondary-400" />
                    <span className="font-semibold text-charcoal-900">{avgRating}</span>/5
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-sm text-accent-700 font-medium">
                  <FileText className="w-4 h-4" />
                  Devis gratuit
                </span>
              </div>

              {/* Compteur réel issu de `devis_requests.created_at` >= now()-30j
                  filtré par ville. Seuil 25 plutôt que 120 pour exposer le
                  signal sur les villes moyennes — la donnée reste authentique
                  (issue de la table, pas d'un compteur fabriqué). */}
              {recentDevisCount >= 25 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-50 text-accent-700 rounded-full text-sm font-medium mt-2">
                  <span className="w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
                  {recentDevisCount} devis envoyés ces 30 derniers jours
                </div>
              )}
            </div>

            {/* Save search + View toggle (desktop, regroupés à droite du H1) */}
            <div className="hidden md:flex items-center gap-2">
              <SaveSearchButton
                service={serviceSlug || service.slug}
                serviceLabel={service.name}
                ville={locationSlug || location.slug}
                villeLabel={location.name}
                filters={rgeOnly ? 'rge=1' : ''}
              />
              <SortDropdown value={sortOrder} onChange={handleSortChange} />
              <div className="flex items-center gap-1 bg-sand-200 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'split'
                      ? 'bg-white text-charcoal-900 shadow-soft'
                      : 'text-charcoal-600 hover:text-charcoal-900'
                  }`}
                >
                  Les deux
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                    viewMode === 'list'
                      ? 'bg-white text-charcoal-900 shadow-soft'
                      : 'text-charcoal-600 hover:text-charcoal-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                  Liste
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                    viewMode === 'map'
                      ? 'bg-white text-charcoal-900 shadow-soft'
                      : 'text-charcoal-600 hover:text-charcoal-900'
                  }`}
                >
                  <MapIcon className="w-4 h-4" />
                  Carte
                </button>
              </div>
            </div>

            {/* View toggle - Mobile */}
            <div className="flex md:hidden items-center gap-1 bg-sand-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-charcoal-900 shadow-soft'
                    : 'text-charcoal-500'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'map'
                    ? 'bg-white text-charcoal-900 shadow-soft'
                    : 'text-charcoal-500'
                }`}
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky search/filter bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm py-2 px-4 border-b border-sand-200 flex items-center gap-2 md:hidden">
        <button
          type="button"
          onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          className="flex items-center gap-2 flex-1 px-3 py-2.5 bg-sand-100 rounded-xl text-sm text-charcoal-500 min-h-[44px] active:bg-sand-200 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>{searchQuery || 'Rechercher un artisan...'}</span>
        </button>
        <SortDropdown value={sortOrder} onChange={handleSortChange} variant="mobile" />
        <div className="flex items-center gap-1 bg-sand-200 rounded-xl p-1">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center ${
              viewMode !== 'map' ? 'bg-white text-charcoal-900 shadow-soft' : 'text-charcoal-500'
            }`}
            aria-label="Vue liste"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`p-2 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center ${
              viewMode === 'map' ? 'bg-white text-charcoal-900 shadow-soft' : 'text-charcoal-500'
            }`}
            aria-label="Vue carte"
          >
            <MapIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      {mobileSearchOpen && (
        <div className="bg-white border-b border-sand-200 px-4 py-3 md:hidden">
          <div className="flex items-center gap-2 bg-sand-50 rounded-xl px-3 py-2 border border-sand-300 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-400/20 transition-all">
            <Search className="w-4 h-4 text-charcoal-400 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Nom, specialite, adresse..."
              className="w-full bg-transparent text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none min-h-[40px]"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="text-xs text-primary-500 font-semibold whitespace-nowrap px-2 py-1"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* CTA Banner - Devis above the fold */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 border-b border-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-white">
            <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-white/15 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-center sm:text-left">
              <p className="font-heading font-bold text-base sm:text-lg">
                Devis gratuit de {service.name.toLowerCase()} à {location.name}
              </p>
              <p className="text-primary-100 text-sm hidden sm:block">
                Comparez les prix et choisissez un artisan de confiance
              </p>
            </div>
          </div>
          <Link
            href={buildDevisHref(serviceSlug || service.slug, location.name)}
            className="inline-flex items-center gap-2 bg-white text-primary-600 font-bold px-6 py-2.5 rounded-xl shadow-cta hover:bg-sand-50 hover:shadow-cta-hover hover:-translate-y-0.5 transition-all duration-200 text-sm sm:text-base whitespace-nowrap"
          >
            Recevoir mes devis gratuits
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main content - Split view */}
      <div
        className={`flex flex-col md:flex-row md:h-[calc(100vh-180px)] ${viewMode === 'map' ? 'h-[calc(100vh-200px)]' : ''}`}
      >
        {/* Provider List */}
        {(viewMode === 'split' || viewMode === 'list') && (
          <div
            className={`bg-white border-r border-sand-300 overflow-y-auto md:h-full md:overflow-y-auto ${
              viewMode === 'split' ? 'w-full md:w-1/2 lg:w-2/5' : 'w-full'
            }`}
          >
            {isHydrating ? (
              /* Skeleton state while client-side fetch is in progress.
                 5 cards match typical PAGE_SIZE viewport hint. */
              <div className="px-4 py-4">
                <ProviderListSkeleton count={5} />
              </div>
            ) : allProviders.length === 0 ? (
              /* Empty state when 0 providers — primary CTA devis + fallback élargir zone */
              <div className="flex flex-col items-center justify-center text-center px-6 py-16 sm:py-24">
                <div className="w-16 h-16 bg-sand-200 rounded-2xl flex items-center justify-center mb-6">
                  <SearchX className="w-8 h-8 text-charcoal-400" />
                </div>
                <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-2">
                  Aucun {service.name.toLowerCase()} référencé à {location.name} pour le moment
                </h2>
                <p className="text-charcoal-500 max-w-md mb-8">
                  Demandez un devis et nous rechercherons un artisan RGE certifié pour vous dans les
                  plus brefs délais. Réponse sous 24-48h ouvrées.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={buildDevisHref(serviceSlug || service.slug, location.name)}
                    className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold px-8 py-3.5 rounded-xl shadow-cta hover:shadow-cta-hover hover:-translate-y-0.5 transition-all duration-200 text-base"
                  >
                    <FileText className="w-5 h-5" />
                    Recevoir mes devis gratuits
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href={`/services/${serviceSlug || service.slug}`}
                    className="inline-flex items-center justify-center gap-2 border-2 border-charcoal-300 text-charcoal-700 hover:bg-sand-100 font-semibold px-6 py-3.5 rounded-xl transition-all duration-200 text-base"
                  >
                    Voir d&apos;autres villes
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {rgeCount > 0 && (
                  <div className="mx-4 mt-4 mb-2 flex items-start gap-2.5 rounded-xl border border-accent-200 bg-accent-50 px-3.5 py-2.5 text-sm text-accent-900">
                    <Leaf className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent-600" />
                    <p className="leading-snug">
                      Pour les aides <span className="font-semibold">MaPrimeRénov&apos;</span>,{' '}
                      <span className="font-semibold">CEE</span> et{' '}
                      <span className="font-semibold">TVA 5,5&nbsp;%</span> : choisissez un artisan
                      certifié RGE.
                    </p>
                  </div>
                )}
                <div className="mx-4 mt-3 mb-2">
                  <FilterPanel resultCount={filteredProviders.length} variant="inline" />
                </div>
                {activeFilterCount > 0 && (
                  <div className="mx-4 mb-3">
                    <ActiveFilterChips />
                  </div>
                )}
                {/* a11y: announce filter result count to screen readers. */}
                <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
                  {activeFilterCount > 0
                    ? `${filteredProviders.length} artisan${filteredProviders.length > 1 ? 's' : ''} après filtrage`
                    : ''}
                </div>
                {activeFilterCount > 0 && filteredProviders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center px-6 py-12">
                    <div className="w-14 h-14 bg-sand-200 rounded-2xl flex items-center justify-center mb-4">
                      <SearchX className="w-7 h-7 text-charcoal-400" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-charcoal-900 mb-1">
                      Aucun artisan ne correspond à ces filtres
                    </h3>
                    <p className="text-charcoal-500 text-sm max-w-sm">
                      Essayez d&apos;assouplir vos critères depuis le panneau de filtres ci-dessus.
                    </p>
                  </div>
                ) : (
                  <ProviderList
                    providers={filteredProviders}
                    onProviderHover={setSelectedProvider}
                    totalCount={
                      activeFilterCount > 0
                        ? filteredProviders.length
                        : liveCount || allProviders.length
                    }
                    searchQuery={searchQuery}
                    sortOrder={sortOrder}
                    highlightedProviderId={mapHoveredProviderId}
                    rgeOnly={rgeOnly}
                    onRgeToggle={handleRgeToggle}
                  />
                )}
                {hasMore && activeFilterCount === 0 && (
                  <div className="p-4 border-t border-sand-200 bg-white sticky bottom-0">
                    <button
                      onClick={loadMore}
                      disabled={isLoadingMore}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-sand-100 hover:bg-sand-200 text-charcoal-700 font-semibold rounded-xl transition-colors disabled:opacity-60"
                    >
                      {isLoadingMore ? (
                        <span className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                      {isLoadingMore
                        ? 'Chargement...'
                        : `Afficher plus (${allProviders.length} / ${liveCount.toLocaleString('fr-FR')})`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Map */}
        {(viewMode === 'split' || viewMode === 'map') && (
          <div
            className={`${
              viewMode === 'split'
                ? 'hidden md:block md:w-1/2 lg:w-3/5'
                : 'w-full h-[calc(100vh-200px)] md:h-auto'
            }`}
          >
            <GeographicMap
              centerLat={mapCenter[0]}
              centerLng={mapCenter[1]}
              zoom={mapZoom}
              providers={mapProviders}
              highlightedProviderId={selectedProvider?.id}
              locationName={location.name}
              height="100%"
              className="h-full"
              onMarkerHover={setMapHoveredProviderId}
              fitBoundsTrigger={`${activeFilterCount}-${filteredProviders.length}`}
            />
          </div>
        )}
      </div>

      <StickyMobileDevisCTA
        href={buildDevisHref(serviceSlug || service.slug, location.name)}
        serviceLabel={service.name}
        villeLabel={location.name}
      />
    </div>
  )
}
