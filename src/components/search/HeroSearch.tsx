'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, TrendingUp, Zap, Wrench, Key, Flame, PaintBucket, Hammer, Grid3X3, Home, TreeDeciduous } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { slugify } from '@/lib/utils'

// Map des icônes
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Wrench, Zap, Key, Flame, PaintBucket, Hammer, Grid3X3, Home, TreeDeciduous
}

// Services avec icônes premium
const services = [
  { name: 'Plombier', slug: 'plombier', icon: 'Wrench', color: 'from-blue-500 to-blue-600', searches: '15k/mois', urgent: true },
  { name: 'Électricien', slug: 'electricien', icon: 'Zap', color: 'from-amber-500 to-amber-600', searches: '12k/mois', urgent: true },
  { name: 'Serrurier', slug: 'serrurier', icon: 'Key', color: 'from-slate-600 to-slate-700', searches: '9k/mois', urgent: true },
  { name: 'Chauffagiste', slug: 'chauffagiste', icon: 'Flame', color: 'from-orange-500 to-orange-600', searches: '7k/mois', urgent: false },
  { name: 'Peintre', slug: 'peintre-en-batiment', icon: 'PaintBucket', color: 'from-purple-500 to-purple-600', searches: '6k/mois', urgent: false },
  { name: 'Menuisier', slug: 'menuisier', icon: 'Hammer', color: 'from-amber-600 to-amber-700', searches: '5k/mois', urgent: false },
  { name: 'Carreleur', slug: 'carreleur', icon: 'Grid3X3', color: 'from-teal-500 to-teal-600', searches: '4k/mois', urgent: false },
  { name: 'Couvreur', slug: 'couvreur', icon: 'Home', color: 'from-red-500 to-red-600', searches: '4k/mois', urgent: false },
  { name: 'Maçon', slug: 'macon', icon: 'Wrench', color: 'from-stone-500 to-stone-600', searches: '3k/mois', urgent: false },
  { name: 'Jardinier', slug: 'jardinier', icon: 'TreeDeciduous', color: 'from-green-500 to-green-600', searches: '3k/mois', urgent: false },
]

const cities = [
  { name: 'Paris', slug: 'paris', pop: '2.1M' },
  { name: 'Marseille', slug: 'marseille', pop: '870k' },
  { name: 'Lyon', slug: 'lyon', pop: '520k' },
  { name: 'Toulouse', slug: 'toulouse', pop: '490k' },
  { name: 'Nice', slug: 'nice', pop: '340k' },
  { name: 'Nantes', slug: 'nantes', pop: '320k' },
  { name: 'Bordeaux', slug: 'bordeaux', pop: '260k' },
  { name: 'Lille', slug: 'lille', pop: '230k' },
]

export function HeroSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [activeField, setActiveField] = useState<'service' | 'location' | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveField(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Filtrer services
  const filteredServices = query
    ? services.filter(s => s.name.toLowerCase().includes(query.toLowerCase()))
    : services

  // Géolocalisation
  const handleGeolocate = () => {
    if (!navigator.geolocation) return
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocation('Autour de moi')
        setIsLocating(false)
        setActiveField(null)
      },
      () => setIsLocating(false),
      { timeout: 5000 }
    )
  }

  // Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const serviceSlug = services.find(s => s.name.toLowerCase() === query.toLowerCase())?.slug || query.toLowerCase()
    const citySlug = cities.find(c => c.name.toLowerCase() === location.toLowerCase())?.slug || slugify(location)

    if (serviceSlug && citySlug) {
      router.push(`/services/${serviceSlug}/${citySlug}`)
    } else if (serviceSlug) {
      router.push(`/services/${serviceSlug}`)
    } else {
      router.push(`/recherche?q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`)
    }
  }

  const selectService = (service: typeof services[0]) => {
    setQuery(service.name)
    setActiveField('location')
  }

  const selectCity = (city: typeof cities[0]) => {
    setLocation(city.name)
    setActiveField(null)
  }

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto">
      {/* Search Box - Style Airbnb/Doctolib */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl shadow-slate-900/10 overflow-hidden"
      >
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row">
            {/* Service Field */}
            <div className="flex-1 relative">
              <div
                className={`p-4 md:p-5 cursor-text border-b md:border-b-0 md:border-r transition-colors ${
                  activeField === 'service' ? 'bg-slate-50' : 'hover:bg-slate-50/50'
                }`}
                onClick={() => setActiveField('service')}
              >
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Quel service ?
                </label>
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setActiveField('service')}
                    placeholder="Plombier, électricien, peintre..."
                    className="w-full bg-transparent text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Service Suggestions */}
              <AnimatePresence>
                {activeField === 'service' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 md:left-4 md:right-4 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden max-h-[400px] overflow-y-auto"
                  >
                    {/* Urgence Banner */}
                    <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 text-white">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        <span className="font-medium text-sm">Urgence 24h/24 ?</span>
                        <button
                          type="button"
                          onClick={() => router.push('/urgence')}
                          className="ml-auto text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
                        >
                          Trouver maintenant →
                        </button>
                      </div>
                    </div>

                    {/* Services List */}
                    <div className="p-2">
                      <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500">
                        <TrendingUp className="w-3 h-3" />
                        {query ? 'Résultats' : 'Services populaires'}
                      </div>
                      {filteredServices.map((service) => {
                        const IconComponent = iconMap[service.icon] || Wrench
                        return (
                          <button
                            key={service.slug}
                            type="button"
                            onClick={() => selectService(service)}
                            className="w-full flex items-center gap-3 px-3 py-3 hover:bg-blue-50 rounded-lg transition-colors group"
                          >
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${service.color} flex items-center justify-center shadow-sm`}>
                              <IconComponent className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 text-left">
                              <div className="font-medium text-slate-900 group-hover:text-blue-600">
                                {service.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                {service.searches} recherches
                              </div>
                            </div>
                            {service.urgent && (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                                Urgence 24h
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Location Field */}
            <div className="flex-1 relative">
              <div
                className={`p-4 md:p-5 cursor-text transition-colors ${
                  activeField === 'location' ? 'bg-slate-50' : 'hover:bg-slate-50/50'
                }`}
                onClick={() => setActiveField('location')}
              >
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Où ?
                </label>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onFocus={() => setActiveField('location')}
                    placeholder="Ville, code postal..."
                    className="w-full bg-transparent text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Location Suggestions */}
              <AnimatePresence>
                {activeField === 'location' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 md:left-4 md:right-4 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden"
                  >
                    {/* Geolocation */}
                    <button
                      type="button"
                      onClick={handleGeolocate}
                      disabled={isLocating}
                      className="w-full flex items-center gap-3 p-4 hover:bg-blue-50 border-b border-slate-100 transition-colors"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        {isLocating ? (
                          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <MapPin className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-slate-900">
                          Utiliser ma position
                        </div>
                        <div className="text-sm text-slate-500">
                          Artisans autour de vous
                        </div>
                      </div>
                    </button>

                    {/* Cities */}
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs text-slate-500">
                        Villes populaires
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {cities.map((city) => (
                          <button
                            key={city.slug}
                            type="button"
                            onClick={() => selectCity(city)}
                            className="flex items-center justify-between px-3 py-2.5 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <span className="font-medium text-slate-900">{city.name}</span>
                            <span className="text-xs text-slate-400">{city.pop}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Submit Button */}
            <div className="p-3 md:p-2 md:pr-3 flex items-center">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/30 hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                <span className="md:hidden lg:inline">Rechercher</span>
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 flex flex-wrap items-center justify-center gap-3"
      >
        <span className="text-sm text-white/60">Populaire :</span>
        {services.slice(0, 4).map((service) => {
          const IconComponent = iconMap[service.icon] || Wrench
          return (
            <button
              key={service.slug}
              onClick={() => {
                setQuery(service.name)
                setActiveField('location')
              }}
              className="text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
            >
              <IconComponent className="w-3.5 h-3.5" />
              {service.name}
            </button>
          )
        })}
      </motion.div>
    </div>
  )
}
