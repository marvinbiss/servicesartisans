'use client'

import { useEffect } from 'react'
import { initCapacitor, isNative, getPlatform } from '@/lib/capacitor'

export function CapacitorInit() {
  useEffect(() => {
    // Initialiser Capacitor au chargement
    initCapacitor()

    // Log pour debug
    if (typeof window !== 'undefined') {
      console.log('Platform:', getPlatform())
      console.log('Is Native:', isNative())
    }
  }, [])

  // Ce composant ne rend rien
  return null
}
