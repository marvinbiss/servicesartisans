'use client'

import type { Ref } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star,
  ChevronDown,
  ChevronUp,
  Loader2,
  X,
  Shield,
  Heart,
  ExternalLink,
  MapPin,
} from 'lucide-react'
import Link from 'next/link'
import NextImage from 'next/image'
import { getArtisanUrl } from '@/lib/utils'

export interface MapProvider {
  id: string
  name: string
  stable_id?: string
  slug: string
  latitude: number
  longitude: number
  rating_average: number
  review_count: number
  address_city: string
  phone?: string
  services: string[]
  specialty?: string
  is_verified: boolean
  avatar_url?: string
}

/* ─── Desktop Results Sidebar ───────────────────────────────────── */

interface DesktopSidebarProps {
  providers: MapProvider[]
  loading: boolean
  selectedProvider: MapProvider | null
  hoveredProvider: MapProvider | null
  viewMode: 'split' | 'map' | 'list'
  favorites: Set<string>
  listRef: Ref<HTMLDivElement>
  onSelectProvider: (provider: MapProvider) => void
  onHoverProvider: (provider: MapProvider | null) => void
  onToggleFavorite: (id: string) => void
}

export function DesktopResultsSidebar({
  providers,
  loading,
  selectedProvider,
  hoveredProvider,
  viewMode,
  favorites,
  listRef,
  onSelectProvider,
  onHoverProvider,
  onToggleFavorite,
}: DesktopSidebarProps) {
  return (
    <AnimatePresence>
      {(viewMode === 'split' || viewMode === 'list') && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: viewMode === 'list' ? '100%' : '420px', opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border-r overflow-hidden hidden md:flex flex-col"
        >
          {/* Results Header */}
          <div className="p-4 border-b bg-gradient-to-r from-sand-50 to-white flex items-center justify-between">
            <div>
              <p className="font-semibold text-charcoal-900">{providers.length} artisans</p>
              <p className="text-sm text-charcoal-500">dans cette zone</p>
            </div>
            {loading && <Loader2 className="w-5 h-5 animate-spin text-primary-500" />}
          </div>

          {/* Results List */}
          <div ref={listRef} className="flex-1 overflow-y-auto">
            {providers.map((provider) => (
              <motion.div
                key={provider.id}
                id={`provider-${provider.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onMouseEnter={() => onHoverProvider(provider)}
                onMouseLeave={() => onHoverProvider(null)}
                onClick={() => onSelectProvider(provider)}
                className={`p-4 border-b cursor-pointer transition-all ${
                  selectedProvider?.id === provider.id
                    ? 'bg-primary-50 border-l-4 border-l-primary-500'
                    : hoveredProvider?.id === provider.id
                      ? 'bg-sand-50'
                      : 'hover:bg-sand-50'
                }`}
              >
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 bg-gradient-to-br from-sand-300 to-sand-400 rounded-xl flex items-center justify-center overflow-hidden">
                      {provider.avatar_url ? (
                        <NextImage
                          src={provider.avatar_url}
                          alt={provider.name}
                          width={80}
                          height={80}
                          sizes="80px"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl font-bold text-charcoal-400">
                          {provider.name.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-charcoal-900 truncate">{provider.name}</h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleFavorite(provider.id)
                        }}
                        className="flex-shrink-0 p-1 rounded-full hover:bg-sand-100"
                      >
                        <Heart
                          className={`w-5 h-5 transition-colors ${
                            favorites.has(provider.id)
                              ? 'fill-red-500 text-red-500'
                              : 'text-charcoal-400'
                          }`}
                        />
                      </button>
                    </div>

                    <p className="text-sm text-primary-500 font-medium">
                      {provider.specialty || 'Artisan'}
                    </p>

                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="font-semibold text-sm">
                          {provider.rating_average?.toFixed(1)}
                        </span>
                        <span className="text-charcoal-400 text-sm">({provider.review_count})</span>
                      </div>
                      {provider.is_verified && (
                        <span className="flex items-center gap-1 text-green-600 text-xs">
                          <Shield className="w-3 h-3" />
                          Vérifié
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-charcoal-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {provider.address_city}
                    </p>

                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-3">
                      <Link
                        href={getArtisanUrl({
                          stable_id: provider.stable_id,
                          slug: provider.slug,
                          specialty: provider.specialty,
                          city: provider.address_city,
                        })}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 text-center py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
                      >
                        Voir profil
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Empty State */}
            {providers.length === 0 && !loading && (
              <div className="p-8 text-center">
                <MapPin className="w-16 h-16 text-sand-500 mx-auto mb-4" />
                <p className="text-charcoal-600 font-medium">Aucun artisan trouvé</p>
                <p className="text-sm text-charcoal-400 mt-1">
                  Déplacez la carte ou modifiez vos filtres
                </p>
              </div>
            )}

            {/* Loading Skeletons */}
            {loading && providers.length === 0 && (
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-20 h-20 bg-sand-300 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-sand-300 rounded w-3/4" />
                      <div className="h-3 bg-sand-300 rounded w-1/2" />
                      <div className="h-3 bg-sand-300 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ─── Mobile Results Toggle (inside map div) ────────────────────── */

interface MobileToggleProps {
  providerCount: number
  mobileDrawerOpen: boolean
  onToggle: () => void
}

export function MobileResultsToggle({
  providerCount,
  mobileDrawerOpen,
  onToggle,
}: MobileToggleProps) {
  return (
    <div className="md:hidden absolute bottom-4 left-4 right-4 z-20">
      <button
        onClick={onToggle}
        className="w-full bg-white shadow-lg rounded-2xl py-4 px-6 flex items-center justify-between"
      >
        <div>
          <span className="font-bold text-lg">{providerCount}</span>
          <span className="text-charcoal-600 ml-1">artisans trouvés</span>
        </div>
        {mobileDrawerOpen ? (
          <ChevronDown className="w-6 h-6 text-charcoal-400" />
        ) : (
          <ChevronUp className="w-6 h-6 text-charcoal-400" />
        )}
      </button>
    </div>
  )
}

/* ─── Mobile Drawer (fixed overlay) ─────────────────────────────── */

interface MobileDrawerProps {
  providers: MapProvider[]
  mobileDrawerOpen: boolean
  onClose: () => void
}

export function MobileResultsDrawer({ providers, mobileDrawerOpen, onClose }: MobileDrawerProps) {
  return (
    <AnimatePresence>
      {mobileDrawerOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25 }}
          className="md:hidden fixed inset-x-0 bottom-0 h-[70vh] bg-white rounded-t-3xl shadow-2xl z-40"
        >
          <div className="p-4 border-b">
            <div className="w-12 h-1 bg-sand-400 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">{providers.length} artisans</h2>
              <button onClick={onClose}>
                <X className="w-6 h-6 text-charcoal-400" />
              </button>
            </div>
          </div>
          <div className="overflow-y-auto h-[calc(70vh-80px)]">
            {providers.map((provider) => (
              <Link
                key={provider.id}
                href={getArtisanUrl({
                  stable_id: provider.stable_id,
                  slug: provider.slug,
                  specialty: provider.specialty,
                  city: provider.address_city,
                })}
                className="flex gap-4 p-4 border-b hover:bg-sand-50"
              >
                <div className="w-16 h-16 bg-sand-300 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-charcoal-400">
                    {provider.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{provider.name}</h3>
                  <p className="text-sm text-primary-500">{provider.specialty}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-medium text-sm">
                      {provider.rating_average?.toFixed(1)}
                    </span>
                    <span className="text-charcoal-400 text-sm">• {provider.address_city}</span>
                  </div>
                </div>
                <ExternalLink className="w-5 h-5 text-charcoal-400 self-center" />
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
