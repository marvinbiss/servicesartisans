/**
 * PhotoGalleryBlock — Placeholder structuré pour les photos de réalisations.
 *
 * Crée la structure sémantique pour de futures photos UGC, avec un signal
 * vers Google Image Search. Affiché uniquement si providerCount > 0.
 *
 * Server Component — pas de 'use client'.
 */

import { Camera } from 'lucide-react'
import Link from 'next/link'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PhotoGalleryBlockProps {
  serviceName: string
  villeName: string
  departmentName: string
  providerCount: number
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PhotoGalleryBlock({
  serviceName,
  villeName,
  departmentName,
  providerCount,
}: PhotoGalleryBlockProps) {
  if (providerCount <= 0) return null

  return (
    <section className="py-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-md bg-accent-100 flex items-center justify-center flex-shrink-0">
          <Camera className="w-3.5 h-3.5 text-accent-600" />
        </div>
        <h4 className="text-sm font-bold text-charcoal-800">
          Photos de réalisations {serviceName} à {villeName}
        </h4>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="aspect-[4/3] rounded-lg border-2 border-dashed border-sand-300 bg-sand-50 flex flex-col items-center justify-center gap-2"
          >
            <Camera className="w-6 h-6 text-sand-400" />
            <span className="text-xs text-sand-500 font-medium">Photo à venir</span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-charcoal-500 leading-relaxed">
        Les artisans {serviceName} du {departmentName} ajouteront bientôt leurs réalisations.
      </p>

      <Link
        href="/inscription"
        className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
      >
        Vous êtes artisan ? Ajoutez vos photos
        <span aria-hidden="true">→</span>
      </Link>
    </section>
  )
}
