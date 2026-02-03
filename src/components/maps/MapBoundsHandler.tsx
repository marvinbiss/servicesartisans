'use client'

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

interface MapBoundsHandlerProps {
  onBoundsChange: (bounds: {
    north: number
    south: number
    east: number
    west: number
    center: { lat: number; lng: number }
    zoom: number
  }) => void
}

export default function MapBoundsHandler({ onBoundsChange }: MapBoundsHandlerProps) {
  const map = useMap()

  useEffect(() => {
    if (!map) return

    const handleMoveEnd = () => {
      const bounds = map.getBounds()
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
        center: map.getCenter(),
        zoom: map.getZoom()
      })
    }

    map.on('moveend', handleMoveEnd)
    map.on('zoomend', handleMoveEnd)

    // Initial bounds
    handleMoveEnd()

    return () => {
      map.off('moveend', handleMoveEnd)
      map.off('zoomend', handleMoveEnd)
    }
  }, [map, onBoundsChange])

  return null
}
