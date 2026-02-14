import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import { Geolocation } from '@capacitor/geolocation'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'

// Vérifier si on est sur une plateforme native
export const isNative = () => Capacitor.isNativePlatform()
export const getPlatform = () => Capacitor.getPlatform() // 'web', 'ios', 'android'

// ========== SPLASH SCREEN ==========
export const hideSplash = async () => {
  if (isNative()) {
    await SplashScreen.hide()
  }
}

// ========== STATUS BAR ==========
export const setStatusBarStyle = async (style: 'light' | 'dark') => {
  if (isNative()) {
    await StatusBar.setStyle({
      style: style === 'light' ? Style.Light : Style.Dark,
    })
  }
}

export const setStatusBarColor = async (color: string) => {
  if (isNative() && getPlatform() === 'android') {
    await StatusBar.setBackgroundColor({ color })
  }
}

// ========== PUSH NOTIFICATIONS ==========
export const initPushNotifications = async () => {
  if (!isNative()) return null

  // Demander la permission
  const permStatus = await PushNotifications.requestPermissions()

  if (permStatus.receive === 'granted') {
    // Enregistrer pour recevoir les notifications
    await PushNotifications.register()

    // Écouter l'enregistrement
    PushNotifications.addListener('registration', (token) => {
      if (process.env.NODE_ENV === 'development') console.log('Push registration success, token:', token.value)
      // Envoyer le token au backend pour l'associer à l'utilisateur
      return token.value
    })

    // Écouter les erreurs
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error)
    })

    // Notification reçue en foreground
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      if (process.env.NODE_ENV === 'development') console.log('Push notification received:', notification)
    })

    // Notification cliquée
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      if (process.env.NODE_ENV === 'development') console.log('Push notification action:', notification)
    })
  }

  return permStatus.receive
}

// ========== GEOLOCATION ==========
export const getCurrentPosition = async () => {
  if (!isNative()) {
    // Fallback navigateur
    return new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject)
    })
  }

  const permStatus = await Geolocation.checkPermissions()

  if (permStatus.location !== 'granted') {
    const newStatus = await Geolocation.requestPermissions()
    if (newStatus.location !== 'granted') {
      throw new Error('Permission géolocalisation refusée')
    }
  }

  const position = await Geolocation.getCurrentPosition({
    enableHighAccuracy: true,
    timeout: 10000,
  })

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
  }
}

export const watchPosition = (callback: (position: { latitude: number; longitude: number }) => void) => {
  if (!isNative()) {
    const watchId = navigator.geolocation.watchPosition((pos) => {
      callback({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      })
    })
    return () => navigator.geolocation.clearWatch(watchId)
  }

  const watchId = Geolocation.watchPosition(
    { enableHighAccuracy: true },
    (position, err) => {
      if (position) {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      }
      if (err) {
        console.error('Geolocation error:', err)
      }
    }
  )

  return () => {
    watchId.then((id) => Geolocation.clearWatch({ id }))
  }
}

// ========== CAMERA ==========
export const takePhoto = async () => {
  if (!isNative()) {
    // Fallback: input file pour le web
    return new Promise<string>((resolve, reject) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.capture = 'environment'
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        }
      }
      input.click()
    })
  }

  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.DataUrl,
    source: CameraSource.Camera,
  })

  return image.dataUrl
}

export const pickImage = async () => {
  if (!isNative()) {
    // Fallback: input file pour le web
    return new Promise<string>((resolve, reject) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        }
      }
      input.click()
    })
  }

  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.DataUrl,
    source: CameraSource.Photos,
  })

  return image.dataUrl
}

// ========== INITIALISATION ==========
export const initCapacitor = async () => {
  if (!isNative()) return

  // Cacher le splash screen après un délai
  setTimeout(() => {
    hideSplash()
  }, 1000)

  // Configurer la status bar
  setStatusBarStyle('light')
  setStatusBarColor('#2563eb')

  // Initialiser les notifications push
  await initPushNotifications()
}
