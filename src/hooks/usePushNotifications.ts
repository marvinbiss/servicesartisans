'use client'

import { useState, useEffect, useCallback } from 'react'

interface UsePushNotificationsReturn {
  isSupported: boolean
  isSubscribed: boolean
  permission: NotificationPermission | 'default'
  isLoading: boolean
  error: string | null
  subscribe: () => Promise<boolean>
  unsubscribe: () => Promise<boolean>
  requestPermission: () => Promise<NotificationPermission>
}

export function usePushNotifications(userId: string | null): UsePushNotificationsReturn {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check support and current state
  useEffect(() => {
    const checkSupport = async () => {
      const supported =
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window

      setIsSupported(supported)

      if (supported) {
        setPermission(Notification.permission)

        // Check existing subscription
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        setIsSubscribed(!!subscription)
      }

      setIsLoading(false)
    }

    checkSupport()
  }, [])

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      return 'denied'
    }

    const result = await Notification.requestPermission()
    setPermission(result)
    return result
  }, [isSupported])

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !userId) {
      setError('Push notifications not supported or user not logged in')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      // Request permission if needed
      if (Notification.permission === 'default') {
        const result = await requestPermission()
        if (result !== 'granted') {
          setError('Permission denied')
          setIsLoading(false)
          return false
        }
      }

      if (Notification.permission !== 'granted') {
        setError('Notifications are blocked')
        setIsLoading(false)
        return false
      }

      // Get VAPID public key
      const keyResponse = await fetch('/api/push/subscribe')
      if (!keyResponse.ok) {
        throw new Error('Failed to get VAPID key')
      }
      const { vapidPublicKey } = await keyResponse.json()

      // Convert VAPID key to Uint8Array
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey)

      // Subscribe with service worker
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as BufferSource,
      })

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          subscription: subscription.toJSON(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save subscription')
      }

      setIsSubscribed(true)
      setIsLoading(false)
      return true
    } catch (err) {
      console.error('Push subscribe error:', err)
      setError(err instanceof Error ? err.message : 'Failed to subscribe')
      setIsLoading(false)
      return false
    }
  }, [isSupported, userId, requestPermission])

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()

        // Remove from server
        await fetch(
          `/api/push/subscribe?endpoint=${encodeURIComponent(subscription.endpoint)}`,
          { method: 'DELETE' }
        )
      }

      setIsSubscribed(false)
      setIsLoading(false)
      return true
    } catch (err) {
      console.error('Push unsubscribe error:', err)
      setError(err instanceof Error ? err.message : 'Failed to unsubscribe')
      setIsLoading(false)
      return false
    }
  }, [isSupported])

  return {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    requestPermission,
  }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

export default usePushNotifications
