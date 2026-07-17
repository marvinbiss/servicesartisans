'use client'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Leaflet is SSR-incompatible, so this map must stay client-only. In Next 16
// `ssr: false` is only allowed inside a Client Component, hence this wrapper.
const CarteClient = dynamic(() => import('./CarteClient'), {
  ssr: false,
  loading: () => (
    <div
      className="bg-sand-100 rounded-xl flex items-center justify-center"
      style={{ height: '600px' }}
    >
      <div className="text-center text-charcoal-500">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
        <p>Chargement de la carte...</p>
      </div>
    </div>
  ),
})

export default CarteClient
