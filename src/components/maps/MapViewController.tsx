'use client'

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

interface Provider {
  id: string
  latitude: number
  longitude: number
}

interface MapViewControllerProps {
  selectedProvider: Provider | null
  providers: Provider[]
}

/**
 * World-class MapViewController for smooth provider selection animations
 */
export default function MapViewController({ 
  selectedProvider, 
  providers 
}: MapViewControllerProps) {
  const map = useMap()

  useEffect(() => {
    if (!map || !selectedProvider) return

    const provider = providers.find(p => p.id === selectedProvider.id)
    if (provider?.latitude && provider?.longitude && 
        !isNaN(provider.latitude) && !isNaN(provider.longitude)) {
      // World-class: smooth animation with flyTo
      map.flyTo(
        [provider.latitude, provider.longitude], 
        Math.max(map.getZoom(), 15),
        {
          duration: 1.5,
          easeLinearity: 0.25
        }
      )
    }
  }, [selectedProvider, providers, map])

  return null
}
