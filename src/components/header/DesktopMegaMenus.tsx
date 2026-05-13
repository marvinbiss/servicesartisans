'use client'

import Link from 'next/link'
import { MapPin, Phone, ArrowRight, Users, Map, Globe, ShieldCheck, Star } from 'lucide-react'
import {
  serviceCategories,
  getCategoryColors,
  type MenuType,
  type RegionCities,
  type MetroRegion,
  type DomTomRegion,
} from './header-data'

interface DesktopMegaMenusProps {
  openMenu: MenuType
  artisanCount: number
  allServicesCount: number
  villesCount: number
  regionsCount: number
  departementsCount: number
  citiesByRegion: RegionCities[]
  metroRegions: MetroRegion[]
  domTomRegions: DomTomRegion[]
  openMenuOnHover: (menu: MenuType) => void
  closeMenusWithDelay: () => void
  closeMenus: () => void
}

export default function DesktopMegaMenus({
  openMenu,
  artisanCount,
  allServicesCount,
  villesCount,
  regionsCount,
  departementsCount,
  citiesByRegion,
  metroRegions,
  domTomRegions,
  openMenuOnHover,
  closeMenusWithDelay,
  closeMenus,
}: DesktopMegaMenusProps) {
  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/10 backdrop-blur-[1px] transition-opacity duration-300"
        style={{ zIndex: 9990 }}
        onClick={closeMenus}
        aria-hidden="true"
      />

      {/* ===== SERVICES MEGA MENU ===== */}
      {openMenu === 'services' && (
        <div
          data-menu-content="services"
          role="menu"
          aria-label="Services artisans"
          className="absolute left-0 right-0 bg-white border-t border-sand-200 shadow-2xl rounded-b-xl"
          style={{ zIndex: 9995 }}
          onMouseEnter={() => openMenuOnHover('services')}
          onMouseLeave={closeMenusWithDelay}
        >
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-charcoal-900 via-charcoal-800 to-charcoal-900 px-8 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-white font-heading font-bold text-lg">
                  Tous nos services artisans
                </h3>
                <p className="text-charcoal-300 text-sm mt-0.5">
                  {allServicesCount} métiers, artisans RGE certifiés partout en France
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-white/80 bg-white/10 px-4 py-2 rounded-lg">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>
                    {artisanCount > 0
                      ? `${artisanCount.toLocaleString('fr-FR')}+`
                      : "Des milliers d'artisans"}{' '}
                    RGE certifiés
                  </span>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-3 xl:grid-cols-6 gap-6">
                {serviceCategories.map((cat) => {
                  const CatIcon = cat.icon
                  const colors = getCategoryColors(cat.color)
                  const isUrgent = cat.color === 'red'
                  return (
                    <div key={cat.category} className="space-y-3">
                      <div className={`flex items-center gap-2.5 pb-3 border-b ${colors.border}`}>
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors.iconBg}`}
                        >
                          <CatIcon className={`w-[18px] h-[18px] ${colors.text}`} />
                        </div>
                        <div>
                          <span className={`font-heading font-bold text-sm ${colors.text}`}>
                            {cat.category}
                          </span>
                          {isUrgent && (
                            <span className="ml-1.5 inline-flex items-center text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                              24h/24
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        {cat.services.map((service) => {
                          const Icon = service.icon
                          return (
                            <Link
                              key={`${cat.category}-${service.slug}`}
                              href={`/services/${service.slug}`}
                              onClick={closeMenus}
                              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 group/link ${colors.hoverBg} hover:shadow-sm`}
                            >
                              <Icon className="w-4 h-4 text-charcoal-400 group-hover/link:text-primary-500 transition-colors duration-200" />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-charcoal-700 group-hover/link:text-primary-500 transition-colors duration-200">
                                  {service.name}
                                </div>
                                <div className="text-xs text-charcoal-400 truncate">
                                  {service.description}
                                </div>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-charcoal-300 opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-200" />
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-8 pt-5 border-t border-sand-200 flex items-center justify-between">
                <Link
                  href="/services"
                  onClick={closeMenus}
                  className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-semibold group/cta transition-colors"
                >
                  Voir tous les services
                  <ArrowRight className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform duration-200" />
                </Link>
                {/* Pivot full RGE 2026-05-03 : CTA "Urgence" remplacé par
                    "Simulateur aides" — aligné repositionnement RGE +
                    monétisation mandataire CEE / MaPrimeRénov. */}
                <Link
                  href="/simulateur-aides-renovation"
                  onClick={closeMenus}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 font-semibold transition-all duration-200 hover:shadow-md"
                >
                  <Phone className="w-4 h-4" />
                  Simuler vos aides MaPrimeRénov & CEE
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== VILLES MEGA MENU ===== */}
      {openMenu === 'villes' && (
        <div
          data-menu-content="villes"
          role="menu"
          aria-label="Villes"
          className="absolute left-0 right-0 bg-white border-t border-sand-200 shadow-2xl rounded-b-xl"
          style={{ zIndex: 9995 }}
          onMouseEnter={() => openMenuOnHover('villes')}
          onMouseLeave={closeMenusWithDelay}
        >
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-charcoal-900 via-charcoal-800 to-charcoal-900 px-8 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-white font-heading font-bold text-lg">
                  Trouvez un artisan par ville
                </h3>
                <p className="text-charcoal-300 text-sm mt-0.5">
                  {villesCount} villes couvertes dans toute la France
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                <Link
                  href="/regions"
                  onClick={closeMenus}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <Map className="w-4 h-4" />
                  Voir par région
                </Link>
                <Link
                  href="/departements"
                  onClick={closeMenus}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <MapPin className="w-4 h-4" />
                  Par département
                </Link>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {citiesByRegion.map((group) => (
                  <div key={group.region}>
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-sand-200">
                      <Globe className="w-4 h-4 text-primary-400" />
                      <span className="font-heading font-bold text-xs text-charcoal-900 uppercase tracking-wider">
                        {group.region}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      {group.cities.map((city) => (
                        <Link
                          key={city.slug}
                          href={`/villes/${city.slug}`}
                          onClick={closeMenus}
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-primary-50 transition-all duration-200 group/city"
                        >
                          <div className="flex items-center gap-2.5">
                            <MapPin className="w-3.5 h-3.5 text-charcoal-300 group-hover/city:text-primary-400 transition-colors" />
                            <span className="text-sm font-medium text-charcoal-700 group-hover/city:text-primary-500 transition-colors">
                              {city.name}
                            </span>
                          </div>
                          <span className="text-[11px] text-charcoal-400 bg-sand-50 group-hover/city:bg-primary-100 group-hover/city:text-primary-500 px-2 py-0.5 rounded-full transition-colors">
                            {city.population}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-5 border-t border-sand-200 flex items-center justify-between">
                <Link
                  href="/villes"
                  onClick={closeMenus}
                  className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-semibold group/cta transition-colors"
                >
                  Voir toutes les villes
                  <ArrowRight className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform duration-200" />
                </Link>
                <div className="flex items-center gap-2 text-sm text-charcoal-900">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  Artisans RGE certifiés dans chaque ville
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== RÉGIONS MEGA MENU ===== */}
      {openMenu === 'regions' && (
        <div
          data-menu-content="regions"
          role="menu"
          aria-label="Régions"
          className="absolute left-0 right-0 bg-white border-t border-sand-200 shadow-2xl rounded-b-xl"
          style={{ zIndex: 9995 }}
          onMouseEnter={() => openMenuOnHover('regions')}
          onMouseLeave={closeMenusWithDelay}
        >
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-charcoal-900 via-charcoal-800 to-charcoal-900 px-8 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-white font-heading font-bold text-lg">Régions de France</h3>
                <p className="text-charcoal-300 text-sm mt-0.5">
                  {regionsCount} régions, {departementsCount} départements couverts
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                <Link
                  href="/departements"
                  onClick={closeMenus}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <MapPin className="w-4 h-4" />
                  Tous les départements
                </Link>
              </div>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Map className="w-4 h-4 text-primary-500" />
                  <h4 className="font-heading font-bold text-sm text-charcoal-900 uppercase tracking-wider">
                    France métropolitaine
                  </h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {metroRegions.map((region) => (
                    <Link
                      key={region.slug}
                      href={`/regions/${region.slug}`}
                      onClick={closeMenus}
                      className="group/region flex items-start gap-3 p-4 bg-sand-50/80 hover:bg-primary-50 rounded-xl border border-transparent hover:border-primary-200 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white group-hover/region:bg-primary-100 border border-charcoal-200 group-hover/region:border-primary-300 flex items-center justify-center flex-shrink-0 transition-all duration-200 shadow-sm">
                        <Map className="w-5 h-5 text-charcoal-400 group-hover/region:text-primary-500 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-charcoal-800 group-hover/region:text-primary-600 transition-colors truncate">
                          {region.name}
                        </div>
                        <div className="text-xs text-charcoal-400 mt-0.5">
                          {region.departments.length} département
                          {region.departments.length > 1 ? 's' : ''}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {domTomRegions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="w-4 h-4 text-accent-600" />
                    <h4 className="font-heading font-bold text-sm text-charcoal-900 uppercase tracking-wider">
                      Outre-mer
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {domTomRegions.map((region) => (
                      <Link
                        key={region.slug}
                        href={`/regions/${region.slug}`}
                        onClick={closeMenus}
                        className="group/region flex items-center gap-3 p-3 bg-accent-50/50 hover:bg-accent-50 rounded-xl border border-transparent hover:border-accent-200 transition-all duration-200"
                      >
                        <Globe className="w-4 h-4 text-accent-400 group-hover/region:text-accent-600 transition-colors flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-charcoal-700 group-hover/region:text-accent-700 transition-colors truncate">
                            {region.name}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 pt-5 border-t border-sand-200 flex items-center justify-between">
                <Link
                  href="/regions"
                  onClick={closeMenus}
                  className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-semibold group/cta transition-colors"
                >
                  Voir toutes les régions
                  <ArrowRight className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform duration-200" />
                </Link>
                <div className="flex items-center gap-2 text-sm text-charcoal-900">
                  <Star className="w-4 h-4 text-amber-500" />
                  Couverture nationale complète
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
