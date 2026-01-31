'use client'

import Link from 'next/link'
import {
  Search, Menu, X, ChevronDown, MapPin, Wrench, Zap, Key, Flame,
  PaintBucket, Home, Hammer, HardHat, Wind, Droplets, TreeDeciduous,
  ShieldCheck, Sparkles, Star, Clock, Phone
} from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'

// Services populaires organisés par catégorie
const serviceCategories = [
  {
    category: 'Urgences',
    color: 'red',
    services: [
      { name: 'Plombier', slug: 'plombier', icon: Wrench, description: 'Fuites, débouchage, installation', urgent: true },
      { name: 'Serrurier', slug: 'serrurier', icon: Key, description: 'Ouverture de porte, serrure', urgent: true },
      { name: 'Électricien', slug: 'electricien', icon: Zap, description: 'Panne, dépannage électrique', urgent: true },
    ]
  },
  {
    category: 'Chauffage & Climatisation',
    color: 'orange',
    services: [
      { name: 'Chauffagiste', slug: 'chauffagiste', icon: Flame, description: 'Chaudière, pompe à chaleur' },
      { name: 'Climaticien', slug: 'climaticien', icon: Wind, description: 'Installation, entretien clim' },
    ]
  },
  {
    category: 'Bâtiment',
    color: 'blue',
    services: [
      { name: 'Maçon', slug: 'macon', icon: HardHat, description: 'Construction, rénovation' },
      { name: 'Couvreur', slug: 'couvreur', icon: Home, description: 'Toiture, zinguerie' },
      { name: 'Menuisier', slug: 'menuisier', icon: Hammer, description: 'Fenêtres, portes, escaliers' },
    ]
  },
  {
    category: 'Finitions',
    color: 'green',
    services: [
      { name: 'Peintre', slug: 'peintre-en-batiment', icon: PaintBucket, description: 'Peinture int. et ext.' },
      { name: 'Carreleur', slug: 'carreleur', icon: Sparkles, description: 'Carrelage, faïence' },
    ]
  },
  {
    category: 'Extérieur',
    color: 'emerald',
    services: [
      { name: 'Paysagiste', slug: 'paysagiste', icon: TreeDeciduous, description: 'Jardin, aménagement' },
      { name: 'Pisciniste', slug: 'pisciniste', icon: Droplets, description: 'Piscine, entretien' },
    ]
  },
]

// Villes populaires par région avec population
const villesByRegion = [
  {
    region: 'Île-de-France',
    highlight: true,
    villes: [
      { name: 'Paris', slug: 'paris', population: '2.1M' },
      { name: 'Boulogne-Billancourt', slug: 'boulogne-billancourt', population: '121K' },
      { name: 'Saint-Denis', slug: 'saint-denis', population: '113K' },
      { name: 'Versailles', slug: 'versailles', population: '85K' },
      { name: 'Nanterre', slug: 'nanterre', population: '96K' },
    ]
  },
  {
    region: 'Auvergne-Rhône-Alpes',
    villes: [
      { name: 'Lyon', slug: 'lyon', population: '522K' },
      { name: 'Grenoble', slug: 'grenoble', population: '158K' },
      { name: 'Saint-Étienne', slug: 'saint-etienne', population: '173K' },
      { name: 'Villeurbanne', slug: 'villeurbanne', population: '154K' },
    ]
  },
  {
    region: 'Provence-Alpes-Côte d\'Azur',
    villes: [
      { name: 'Marseille', slug: 'marseille', population: '870K' },
      { name: 'Nice', slug: 'nice', population: '342K' },
      { name: 'Toulon', slug: 'toulon', population: '176K' },
      { name: 'Aix-en-Provence', slug: 'aix-en-provence', population: '145K' },
    ]
  },
  {
    region: 'Occitanie',
    villes: [
      { name: 'Toulouse', slug: 'toulouse', population: '493K' },
      { name: 'Montpellier', slug: 'montpellier', population: '295K' },
      { name: 'Nîmes', slug: 'nimes', population: '151K' },
      { name: 'Perpignan', slug: 'perpignan', population: '121K' },
    ]
  },
  {
    region: 'Nouvelle-Aquitaine',
    villes: [
      { name: 'Bordeaux', slug: 'bordeaux', population: '260K' },
      { name: 'Limoges', slug: 'limoges', population: '132K' },
      { name: 'Poitiers', slug: 'poitiers', population: '89K' },
      { name: 'La Rochelle', slug: 'la-rochelle', population: '77K' },
    ]
  },
  {
    region: 'Hauts-de-France',
    villes: [
      { name: 'Lille', slug: 'lille', population: '236K' },
      { name: 'Amiens', slug: 'amiens', population: '135K' },
      { name: 'Roubaix', slug: 'roubaix', population: '98K' },
      { name: 'Dunkerque', slug: 'dunkerque', population: '86K' },
    ]
  },
  {
    region: 'Grand Est',
    villes: [
      { name: 'Strasbourg', slug: 'strasbourg', population: '287K' },
      { name: 'Reims', slug: 'reims', population: '182K' },
      { name: 'Metz', slug: 'metz', population: '118K' },
      { name: 'Nancy', slug: 'nancy', population: '105K' },
    ]
  },
  {
    region: 'Pays de la Loire',
    villes: [
      { name: 'Nantes', slug: 'nantes', population: '320K' },
      { name: 'Angers', slug: 'angers', population: '155K' },
      { name: 'Le Mans', slug: 'le-mans', population: '144K' },
      { name: 'Saint-Nazaire', slug: 'saint-nazaire', population: '72K' },
    ]
  },
]

// Flat list of services for backward compatibility
const services = serviceCategories.flatMap(cat => cat.services)

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeMenu, setActiveMenu] = useState<'services' | 'villes' | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMouseEnter = (menu: 'services' | 'villes') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveMenu(menu)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null)
    }, 150)
  }

  return (
    <header className="bg-white/95 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 py-3">
          {/* Logo Premium */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-lg tracking-tight">SA</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-heading font-bold text-gray-900 tracking-tight">
                Services<span className="text-gradient-blue">Artisans</span>
              </span>
              <span className="text-[10px] text-gray-500 font-medium tracking-wide hidden lg:block">L&apos;EXCELLENCE ARTISANALE</span>
            </div>
          </Link>

          {/* Search Bar Premium - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full group">
              <input
                type="text"
                placeholder="Rechercher un artisan, un service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 focus:bg-white transition-all duration-300 text-gray-900 placeholder:text-gray-400"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary-500 transition-colors" />
            </div>
          </div>

          {/* Trust Badge - Desktop */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-200 mr-4">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span className="text-xs font-semibold text-green-700">120 000+ artisans vérifiés</span>
          </div>

          {/* Navigation - Desktop avec Megamenu */}
          <nav className="hidden md:flex items-center space-x-1" ref={menuRef}>
            {/* Megamenu Services */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('services')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeMenu === 'services'
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                Services
                <ChevronDown className={`w-4 h-4 transition-transform ${activeMenu === 'services' ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Services - Premium Megamenu */}
              {activeMenu === 'services' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[820px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-premium border border-gray-100/50 animate-fade-in-down overflow-hidden">
                  <div className="flex">
                    {/* Categories sidebar */}
                    <div className="w-1/3 bg-gray-50 p-4 border-r border-gray-100">
                      <div className="mb-4">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Catégories</h3>
                        {serviceCategories.map((cat) => (
                          <div key={cat.category} className="mb-3">
                            <h4 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                              {cat.category === 'Urgences' && <Clock className="w-3.5 h-3.5 text-red-500" />}
                              {cat.category}
                            </h4>
                            <div className="text-xs text-gray-500">
                              {cat.services.length} services
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="pt-3 border-t border-gray-200">
                        <Link
                          href="/services"
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1"
                          onClick={() => setActiveMenu(null)}
                        >
                          Tous les services →
                        </Link>
                      </div>
                    </div>

                    {/* Services grid */}
                    <div className="w-2/3 p-4">
                      <div className="grid grid-cols-2 gap-2">
                        {serviceCategories.flatMap(cat =>
                          cat.services.map((service) => {
                            const Icon = service.icon
                            const isUrgent = 'urgent' in service && service.urgent
                            return (
                              <Link
                                key={service.slug}
                                href={`/services/${service.slug}`}
                                className={`flex items-center gap-3 p-3 rounded-lg transition-all group ${
                                  isUrgent
                                    ? 'hover:bg-red-50 border border-transparent hover:border-red-200'
                                    : 'hover:bg-primary-50'
                                }`}
                                onClick={() => setActiveMenu(null)}
                              >
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                                  isUrgent
                                    ? 'bg-red-100 group-hover:bg-red-200'
                                    : 'bg-primary-100 group-hover:bg-primary-200'
                                }`}>
                                  <Icon className={`w-4 h-4 ${isUrgent ? 'text-red-600' : 'text-primary-600'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className={`font-medium text-sm ${
                                    isUrgent
                                      ? 'text-gray-900 group-hover:text-red-700'
                                      : 'text-gray-900 group-hover:text-primary-600'
                                  }`}>
                                    {service.name}
                                    {isUrgent && <span className="ml-1.5 text-xs text-red-500">24h</span>}
                                  </div>
                                  <div className="text-xs text-gray-500 truncate">{service.description}</div>
                                </div>
                              </Link>
                            )
                          })
                        )}
                      </div>

                      {/* Quick action */}
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <Link
                          href="/urgence"
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium"
                          onClick={() => setActiveMenu(null)}
                        >
                          <Phone className="w-4 h-4" />
                          Urgence ? Trouvez un artisan disponible maintenant
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Megamenu Villes */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('villes')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeMenu === 'villes'
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                Villes
                <ChevronDown className={`w-4 h-4 transition-transform ${activeMenu === 'villes' ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Villes - Premium Megamenu */}
              {activeMenu === 'villes' && (
                <div className="absolute top-full right-0 mt-2 w-[860px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-premium border border-gray-100/50 animate-fade-in-down overflow-hidden">
                  <div className="flex">
                    {/* Search & Quick links sidebar */}
                    <div className="w-1/4 bg-gray-50 p-4 border-r border-gray-100">
                      <div className="mb-4">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Navigation</h3>
                        <div className="space-y-2">
                          <Link
                            href="/regions"
                            className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600 py-1.5"
                            onClick={() => setActiveMenu(null)}
                          >
                            <MapPin className="w-4 h-4" />
                            Par région
                          </Link>
                          <Link
                            href="/departements"
                            className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600 py-1.5"
                            onClick={() => setActiveMenu(null)}
                          >
                            <MapPin className="w-4 h-4" />
                            Par département
                          </Link>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-500 mb-2">Statistiques</div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Star className="w-3.5 h-3.5 text-yellow-500" />
                            <span className="text-gray-700">35 000+ villes</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                            <span className="text-gray-700">Artisans vérifiés</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Villes grid */}
                    <div className="w-3/4 p-4">
                      <div className="grid grid-cols-4 gap-4">
                        {villesByRegion.slice(0, 8).map((region) => (
                          <div key={region.region}>
                            <h4 className={`font-semibold text-sm mb-2 ${
                              'highlight' in region && region.highlight ? 'text-primary-700' : 'text-gray-900'
                            }`}>
                              {region.region}
                            </h4>
                            <ul className="space-y-1">
                              {region.villes.slice(0, 4).map((ville) => (
                                <li key={ville.slug}>
                                  <Link
                                    href={`/villes/${ville.slug}`}
                                    className="text-gray-600 hover:text-primary-600 text-sm flex items-center justify-between gap-1 py-0.5 group"
                                    onClick={() => setActiveMenu(null)}
                                  >
                                    <span className="group-hover:underline">{ville.name}</span>
                                    {'population' in ville && (
                                      <span className="text-xs text-gray-400">{ville.population}</span>
                                    )}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      {/* Bottom links */}
                      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                        <Link
                          href="/villes"
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                          onClick={() => setActiveMenu(null)}
                        >
                          Toutes les villes →
                        </Link>
                        <div className="flex gap-4">
                          <Link
                            href="/villes/paris"
                            className="text-sm text-gray-500 hover:text-primary-600"
                            onClick={() => setActiveMenu(null)}
                          >
                            Paris
                          </Link>
                          <Link
                            href="/villes/lyon"
                            className="text-sm text-gray-500 hover:text-primary-600"
                            onClick={() => setActiveMenu(null)}
                          >
                            Lyon
                          </Link>
                          <Link
                            href="/villes/marseille"
                            className="text-sm text-gray-500 hover:text-primary-600"
                            onClick={() => setActiveMenu(null)}
                          >
                            Marseille
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/urgence"
              className="relative text-red-600 hover:text-red-700 px-3 py-2 rounded-lg font-medium hover:bg-red-50 transition-all duration-200 flex items-center gap-1.5"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Urgences
            </Link>

            <Link
              href="/connexion"
              className="text-gray-600 hover:text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 hover-underline"
            >
              Connexion
            </Link>

            <Link
              href="/devis"
              className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-white px-6 py-2.5 rounded-xl font-semibold ml-3 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 hover:-translate-y-0.5 group"
            >
              <span className="relative z-10">Demander un devis</span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu Premium */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 bg-gradient-to-b from-white to-gray-50/50 animate-fade-in-down">
            {/* Search Bar - Mobile */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            <nav className="flex flex-col space-y-2">
              {/* Services Mobile */}
              <div className="border-b border-gray-100 pb-3">
                <div className="font-semibold text-gray-900 mb-2 px-2">Services</div>
                <div className="grid grid-cols-2 gap-2">
                  {services.slice(0, 6).map((service) => {
                    const Icon = service.icon
                    return (
                      <Link
                        key={service.slug}
                        href={`/services/${service.slug}`}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-gray-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Icon className="w-4 h-4 text-primary-600" />
                        <span className="text-sm">{service.name}</span>
                      </Link>
                    )
                  })}
                </div>
                <Link
                  href="/services"
                  className="text-primary-600 text-sm font-medium mt-2 block px-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Tous les services →
                </Link>
              </div>

              {/* Villes Mobile */}
              <div className="border-b border-gray-100 pb-3">
                <div className="font-semibold text-gray-900 mb-2 px-2">Villes populaires</div>
                <div className="flex flex-wrap gap-2 px-2">
                  {villesByRegion.flatMap(r => r.villes).slice(0, 8).map((ville) => (
                    <Link
                      key={ville.slug}
                      href={`/services/plombier/${ville.slug}`}
                      className="text-sm bg-gray-100 hover:bg-primary-100 text-gray-700 hover:text-primary-700 px-3 py-1 rounded-full"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {ville.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-3">
                <Link
                  href="/urgence"
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-3.5 rounded-xl font-semibold text-center shadow-lg shadow-red-500/25 active:scale-[0.98] transition-transform"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Urgences 24h/24
                </Link>
                <Link
                  href="/connexion"
                  className="flex-1 border-2 border-gray-200 text-gray-700 px-4 py-3.5 rounded-xl font-semibold text-center hover:bg-gray-50 active:scale-[0.98] transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Connexion
                </Link>
              </div>

              <Link
                href="/devis"
                className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-white px-4 py-4 rounded-xl font-bold text-center mt-3 shadow-lg shadow-amber-500/30 active:scale-[0.98] transition-transform"
                onClick={() => setIsMenuOpen(false)}
              >
                Demander un devis gratuit
              </Link>
            </nav>
          </div>
        )}
      </div>

      {/* CSS Animation */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </header>
  )
}
