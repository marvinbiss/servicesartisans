import { useState, useCallback, useEffect } from 'react'

export interface GeolocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  error: string | null
  loading: boolean
}

export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  watch?: boolean
}

/**
 * World-class geolocation hook with error handling and caching
 */
export function useGeolocation(options: UseGeolocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 300000, // 5 minutes cache
    watch = false
  } = options

  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: false
  })

  const [watchId, setWatchId] = useState<number | null>(null)

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    setState({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      error: null,
      loading: false
    })
  }, [])

  const handleError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = 'Une erreur est survenue lors de la géolocalisation'

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Vous avez refusé l\'accès à votre position. Veuillez autoriser la géolocalisation dans les paramètres de votre navigateur.'
        break
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Votre position n\'est pas disponible pour le moment.'
        break
      case error.TIMEOUT:
        errorMessage = 'La demande de géolocalisation a expiré. Veuillez réessayer.'
        break
    }

    setState(prev => ({
      ...prev,
      error: errorMessage,
      loading: false
    }))
  }, [])

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'La géolocalisation n\'est pas supportée par votre navigateur',
        loading: false
      }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    const geoOptions: PositionOptions = {
      enableHighAccuracy,
      timeout,
      maximumAge
    }

    if (watch) {
      const id = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        geoOptions
      )
      setWatchId(id)
    } else {
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        geoOptions
      )
    }
  }, [enableHighAccuracy, timeout, maximumAge, watch, handleSuccess, handleError])

  const clearWatch = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
    }
  }, [watchId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearWatch()
    }
  }, [clearWatch])

  return {
    ...state,
    getLocation,
    clearWatch,
    isWatching: watchId !== null
  }
}
