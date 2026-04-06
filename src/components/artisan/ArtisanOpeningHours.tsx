'use client'

import { Phone } from 'lucide-react'

export function ArtisanOpeningHours() {
  return (
    <div className="rounded-2xl bg-green-50 border border-green-200 px-5 py-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
        <Phone className="w-4.5 h-4.5 text-green-600" aria-hidden="true" />
      </div>
      <p className="text-sm font-semibold text-green-800">
        Besoin d&apos;un artisan ? Disponible 7/7 de 8h à 20h
      </p>
    </div>
  )
}
