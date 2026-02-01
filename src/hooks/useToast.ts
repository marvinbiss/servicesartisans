'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface UseToastReturn {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  clearToasts: () => void
  success: (title: string, message?: string) => string
  error: (title: string, message?: string) => string
  warning: (title: string, message?: string) => string
  info: (title: string, message?: string) => string
}

const DEFAULT_DURATION = 5000

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const removeToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback((toast: Omit<Toast, 'id'>): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const duration = toast.duration ?? DEFAULT_DURATION

    setToasts(prev => [...prev, { ...toast, id }])

    if (duration > 0) {
      const timer = setTimeout(() => {
        removeToast(id)
      }, duration)
      timersRef.current.set(id, timer)
    }

    return id
  }, [removeToast])

  const clearToasts = useCallback(() => {
    timersRef.current.forEach(timer => clearTimeout(timer))
    timersRef.current.clear()
    setToasts([])
  }, [])

  const success = useCallback((title: string, message?: string) => {
    return addToast({ type: 'success', title, message })
  }, [addToast])

  const error = useCallback((title: string, message?: string) => {
    return addToast({ type: 'error', title, message, duration: 8000 })
  }, [addToast])

  const warning = useCallback((title: string, message?: string) => {
    return addToast({ type: 'warning', title, message })
  }, [addToast])

  const info = useCallback((title: string, message?: string) => {
    return addToast({ type: 'info', title, message })
  }, [addToast])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer))
    }
  }, [])

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
  }
}

export default useToast
