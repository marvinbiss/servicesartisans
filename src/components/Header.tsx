'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, Menu, X, ChevronDown, MapPin, Wrench, Zap, Key, Flame,
  PaintBucket, Home, Hammer, HardHat, Wind, Droplets, TreeDeciduous,
  ShieldCheck, Sparkles, Star, Clock, Phone, ArrowRight, Users, Award
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useMobileMenu } from '@/contexts/MobileMenuContext'

// Services populaires organisés par catégorie
const serviceCategories = [
  {
    category: 'Urgences 24h/24',
    color: 'red',
    icon: Clock,
    services: [
      { name: 'Plombier', slug: 'plombier', icon: Wrench, description: 'Fuites, débouchage, installation', urgent: true },
      { name: 'Serrurier', slug: 'serrurier', icon: Key, description: 'Ouverture de porte, serrure', urgent: true },
      { name: 'Électricien', slug: 'electricien', icon: Zap, description: 'Panne, dépannage électrique', urgent: true },
    ]
  },
  {
    category: 'Chauffage & Clim',
    color: 'orange',
    icon: Flame,
    services: [
      { name: 'Chauffagiste', slug: 'chauffagiste', icon: Flame, description: 'Chaudière, pompe à chaleur' },
      { name: 'Climaticien', slug: 'climaticien', icon: Wind, description: 'Installation, entretien clim' },
    ]
  },
  {
    category: 'Bâtiment',
    color: 'blue',
    icon: HardHat,
    services: [
      { name: 'Maçon', slug: 'macon', icon: HardHat, description: 'Construction, rénovation' },
      { name: 'Couvreur', slug: 'couvreur', icon: Home, description: 'Toiture, zinguerie' },
      { name: 'Menuisier', slug: 'menuisier', icon: Hammer, description: 'Fenêtres, portes, escaliers' },
    ]
  },
  {
    category: 'Finitions',
    color: 'green',
    icon: PaintBucket,
    services: [
      { name: 'Peintre', slug: 'peintre-en-batiment', icon: PaintBucket, description: 'Peinture int. et ext.' },
      { name: 'Carreleur', slug: 'carreleur', icon: Sparkles, description: 'Carrelage, faïence' },
    ]
  },
  {
    category: 'Extérieur',
    color: 'emerald',
    icon: TreeDeciduous,
    services: [
      { name: 'Paysagiste', slug: 'paysagiste', icon: TreeDeciduous, description: 'Jardin, aménagement' },
      { name: 'Pisciniste', slug: 'pisciniste', icon: Droplets, description: 'Piscine, entretien' },
    ]
  },
]

// Villes populaires
const popularCities = [
  { name: 'Paris', slug: 'paris', population: '2.1M', region: 'Île-de-France' },
  { name: 'Lyon', slug: 'lyon', population: '522K', region: 'Auvergne-Rhône-Alpes' },
  { name: 'Marseille', slug: 'marseille', population: '870K', region: 'PACA' },
  { name: 'Toulouse', slug: 'toulouse', population: '493K', region: 'Occitanie' },
  { name: 'Bordeaux', slug: 'bordeaux', population: '260K', region: 'Nouvelle-Aquitaine' },
  { name: 'Lille', slug: 'lille', population: '236K', region: 'Hauts-de-France' },
  { name: 'Nantes', slug: 'nantes', population: '320K', region: 'Pays de la Loire' },
  { name: 'Strasbourg', slug: 'strasbourg', population: '287K', region: 'Grand Est' },
  { name: 'Nice', slug: 'nice', population: '342K', region: 'PACA' },
  { name: 'Montpellier', slug: 'montpellier', population: '295K', region: 'Occitanie' },
  { name: 'Rennes', slug: 'rennes', population: '222K', region: 'Bretagne' },
  { name: 'Grenoble', slug: 'grenoble', population: '158K', region: 'Auvergne-Rhône-Alpes' },
]

// Flat list of services
const services = serviceCategories.flatMap(cat => cat.services)

export default function Header() {
  const router = useRouter()
  const { isMenuOpen, setIsMenuOpen } = useMobileMenu()
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/recherche?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Top bar premium */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              <span className="text-white/90">120 000+ artisans vérifiés</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="text-white/90">4.8/5 satisfaction</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/inscription-artisan" className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1">
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Espace Pro</span>
            </Link>
            <Link href="/urgence" className="flex items-center gap-2 bg-red-500/20 px-3 py-1 rounded-full hover:bg-red-500/30 transition-colors">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-red-300 font-medium">Urgences 24h</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-lg">SA</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xl font-bold text-gray-900">
                Services<span className="text-blue-600">Artisans</span>
              </span>
            </div>
          </Link>

          {/* Search Bar - Prominent */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Rechercher un artisan, un service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-12 pr-24 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-900 placeholder:text-gray-500"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Rechercher
              </button>
            </div>
          </form>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center space-x-1" ref={menuRef}>
            {/* Megamenu Services */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('services')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeMenu === 'services'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Services
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeMenu === 'services' ? 'rotate-180' : ''}`} />
              </button>

              {/* Megamenu Services Premium */}
              {activeMenu === 'services' && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[900px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                  style={{ animation: 'fadeInDown 0.2s ease-out' }}
                >
                  {/* Header du menu */}
                  <div className="bg-gradient-to-r from-slate-900 to-blue-900 px-6 py-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold text-lg">Nos services artisans</h3>
                      <p className="text-slate-300 text-sm">Plus de 50 métiers disponibles</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <Users className="w-4 h-4 text-amber-400" />
                        120 000+ artisans
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-5 gap-4">
                      {serviceCategories.map((cat) => {
                        const CatIcon = cat.icon
                        const isUrgent = cat.color === 'red'
                        return (
                          <div key={cat.category} className="space-y-3">
                            <div className={`flex items-center gap-2 pb-2 border-b ${
                              isUrgent ? 'border-red-200' : 'border-gray-100'
                            }`}>
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                isUrgent ? 'bg-red-100' : 'bg-blue-50'
                              }`}>
                                <CatIcon className={`w-4 h-4 ${isUrgent ? 'text-red-600' : 'text-blue-600'}`} />
                              </div>
                              <span className={`font-semibold text-sm ${isUrgent ? 'text-red-700' : 'text-gray-900'}`}>
                                {cat.category}
                              </span>
                            </div>
                            <div className="space-y-1">
                              {cat.services.map((service) => {
                                const Icon = service.icon
                                return (
                                  <Link
                                    key={service.slug}
                                    href={`/services/${service.slug}`}
                                    className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-all group ${
                                      isUrgent
                                        ? 'hover:bg-red-50'
                                        : 'hover:bg-blue-50'
                                    }`}
                                    onClick={() => setActiveMenu(null)}
                                  >
                                    <Icon className={`w-4 h-4 ${isUrgent ? 'text-red-500' : 'text-gray-400 group-hover:text-blue-600'}`} />
                                    <div className="flex-1">
                                      <div className={`text-sm font-medium ${
                                        isUrgent
                                          ? 'text-gray-900 group-hover:text-red-700'
                                          : 'text-gray-700 group-hover:text-blue-700'
                                      }`}>
                                        {service.name}
                                      </div>
                                      <div className="text-xs text-gray-500 truncate">{service.description}</div>
                                    </div>
                                  </Link>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Footer du menu */}
                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <Link
                        href="/services"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                        onClick={() => setActiveMenu(null)}
                      >
                        Voir tous les services
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        href="/urgence"
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors"
                        onClick={() => setActiveMenu(null)}
                      >
                        <Phone className="w-4 h-4" />
                        Urgence ? Artisan disponible maintenant
                      </Link>
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
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeMenu === 'villes'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Villes
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeMenu === 'villes' ? 'rotate-180' : ''}`} />
              </button>

              {/* Megamenu Villes Premium */}
              {activeMenu === 'villes' && (
                <div
                  className="absolute top-full right-0 mt-2 w-[700px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                  style={{ animation: 'fadeInDown 0.2s ease-out' }}
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-slate-900 to-blue-900 px-6 py-4">
                    <h3 className="text-white font-semibold text-lg">Trouvez un artisan par ville</h3>
                    <p className="text-slate-300 text-sm">35 000+ communes couvertes en France</p>
                  </div>

                  <div className="p-6">
                    {/* Navigation rapide */}
                    <div className="flex gap-3 mb-6">
                      <Link
                        href="/regions"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                        onClick={() => setActiveMenu(null)}
                      >
                        <MapPin className="w-4 h-4" />
                        Par région
                      </Link>
                      <Link
                        href="/departements"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                        onClick={() => setActiveMenu(null)}
                      >
                        <MapPin className="w-4 h-4" />
                        Par département
                      </Link>
                    </div>

                    {/* Villes populaires */}
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      Villes populaires
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                      {popularCities.map((city) => (
                        <Link
                          key={city.slug}
                          href={`/villes/${city.slug}`}
                          className="group flex items-center justify-between p-3 bg-gray-50 hover:bg-blue-50 rounded-xl transition-all"
                          onClick={() => setActiveMenu(null)}
                        >
                          <div>
                            <div className="font-medium text-gray-900 group-hover:text-blue-700">{city.name}</div>
                            <div className="text-xs text-gray-500">{city.region}</div>
                          </div>
                          <div className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full">{city.population}</div>
                        </Link>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <Link
                        href="/villes"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                        onClick={() => setActiveMenu(null)}
                      >
                        Toutes les villes
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                        Artisans vérifiés dans chaque ville
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/connexion"
              className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Connexion
            </Link>

            <Link
              href="/devis"
              className="ml-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all"
            >
              Devis gratuit
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isMenuOpen}
            className="lg:hidden flex items-center justify-center w-12 h-12 -mr-2 rounded-xl active:bg-gray-200 hover:bg-gray-100 transition-colors"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100 max-h-[calc(100vh-120px)] overflow-y-auto">
            {/* Search Mobile */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un artisan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white text-gray-900"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </form>

            <nav className="space-y-4">
              {/* Services Mobile */}
              <div>
                <div className="font-semibold text-gray-900 mb-3 px-1">Services populaires</div>
                <div className="grid grid-cols-2 gap-2">
                  {services.slice(0, 6).map((service) => {
                    const Icon = service.icon
                    return (
                      <Link
                        key={service.slug}
                        href={`/services/${service.slug}`}
                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Icon className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">{service.name}</span>
                      </Link>
                    )
                  })}
                </div>
                <Link
                  href="/services"
                  className="text-blue-600 text-sm font-medium mt-3 block px-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Tous les services →
                </Link>
              </div>

              {/* Villes Mobile */}
              <div className="pt-4 border-t border-gray-100">
                <div className="font-semibold text-gray-900 mb-3 px-1">Villes populaires</div>
                <div className="flex flex-wrap gap-2">
                  {popularCities.slice(0, 8).map((city) => (
                    <Link
                      key={city.slug}
                      href={`/villes/${city.slug}`}
                      className="text-sm bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 px-3 py-1.5 rounded-full transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {city.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <Link
                  href="/urgence"
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-red-600 text-white rounded-xl font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Phone className="w-5 h-5" />
                  Urgences 24h/24
                </Link>
                <div className="flex gap-3">
                  <Link
                    href="/connexion"
                    className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium text-center hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/devis"
                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-400 text-white rounded-xl font-semibold text-center shadow-lg shadow-amber-500/25"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Devis gratuit
                  </Link>
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </header>
  )
}
