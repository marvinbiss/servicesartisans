'use client'

import { motion } from 'framer-motion'
import { MapPin, Navigation } from 'lucide-react'
import type { LegacyArtisan } from '@/types/legacy'

interface ArtisanMapProps {
  artisan: LegacyArtisan
}

export function ArtisanMap({ artisan }: ArtisanMapProps) {
  const hasCoordinates = artisan.latitude && artisan.longitude
  const hasAddress = artisan.address && artisan.address.length > 0
  const hasZones = artisan.intervention_zones && artisan.intervention_zones.length > 0
  const hasRadius = !!artisan.intervention_zone

  // Hide entire section when there's no useful location data
  if (!hasCoordinates && !hasAddress && !hasZones && !hasRadius) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-blue-600" aria-hidden="true" />
        Zone d'intervention
      </h2>

      {/* Map — only show when coordinates are available */}
      {hasCoordinates && (
        <div className="rounded-xl overflow-hidden bg-gray-100 mb-4" style={{ height: '280px' }}>
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${artisan.longitude! - 0.08},${artisan.latitude! - 0.05},${artisan.longitude! + 0.08},${artisan.latitude! + 0.05}&layer=mapnik&marker=${artisan.latitude},${artisan.longitude}`}
            title={`Carte de localisation de l'artisan à ${artisan.city}`}
            aria-label={`Carte interactive montrant la zone d'intervention autour de ${artisan.city}`}
          />
        </div>
      )}

      {/* Address */}
      {artisan.address && (
        <address className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 mb-4 not-italic">
          <Navigation className="w-5 h-5 text-gray-400 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-gray-900">{artisan.address}</p>
            <p className="text-gray-500">{artisan.postal_code} {artisan.city}</p>
          </div>
        </address>
      )}

      {/* Intervention zones */}
      {artisan.intervention_zones && artisan.intervention_zones.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Communes desservies</h3>
          <div className="flex flex-wrap gap-2" role="list" aria-label="Communes desservies">
            {artisan.intervention_zones.map((zone, i) => (
              <span
                key={i}
                role="listitem"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm"
              >
                <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                {zone}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Intervention radius */}
      {artisan.intervention_zone && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-gray-600">
            <Navigation className="w-4 h-4" aria-hidden="true" />
            <span>Rayon d'intervention : <strong>{artisan.intervention_zone}</strong></span>
          </div>
        </div>
      )}
    </motion.div>
  )
}
