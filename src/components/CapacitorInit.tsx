'use client'

import { useEffect } from 'react'
import { initCapacitor, isNative, getPlatform } from '@/lib/capacitor'

export function CapacitorInit() {
  useEffect(() => {
    // Initialiser Capacitor au chargement
    initCapacitor()
  }, [])

  // Ce composant ne rend rien
  return null
}
