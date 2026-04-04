'use client'

import { useState, useEffect, useRef } from 'react'

interface ScrollNudgeProps {
  /** Scroll threshold as percentage (0-100). Default: 50 */
  threshold?: number
  /** Auto-dismiss delay in ms. Default: 5000 */
  dismissAfter?: number
  /** Session key to avoid repeat shows */
  sessionKey?: string
  /** Custom message */
  message?: string
  /** CTA action — if provided, tapping the nudge triggers it */
  onAction?: () => void
}

export default function ScrollNudge({
  threshold = 50,
  dismissAfter = 5000,
  sessionKey = 'sa:scroll-nudge-shown',
  message = 'Devis gratuit et sans engagement',
  onAction,
}: ScrollNudgeProps) {
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)
  const hasShown = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Don't show on /devis pages or if already shown this session
    if (typeof window === 'undefined') return
    if (window.location.pathname.startsWith('/devis')) return
    if (sessionStorage.getItem(sessionKey)) return

    // Only show on mobile
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    if (!isMobile) return

    const handleScroll = () => {
      if (hasShown.current) return

      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      if (scrollHeight <= 0) return

      const scrollPercent = (window.scrollY / scrollHeight) * 100
      if (scrollPercent >= threshold) {
        hasShown.current = true
        sessionStorage.setItem(sessionKey, '1')
        setVisible(true)

        // Auto-dismiss
        timerRef.current = setTimeout(() => {
          setExiting(true)
          exitTimerRef.current = setTimeout(() => setVisible(false), 300)
        }, dismissAfter)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (timerRef.current) clearTimeout(timerRef.current)
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current)
    }
  }, [threshold, dismissAfter, sessionKey])

  const handleDismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current)
    setExiting(true)
    exitTimerRef.current = setTimeout(() => setVisible(false), 300)
  }

  const handleTap = () => {
    if (onAction) {
      onAction()
      handleDismiss()
    }
  }

  if (!visible) return null

  return (
    <div
      className="fixed z-[54] md:hidden"
      style={{
        bottom: '72px', // Above MobileBottomNav (h-14 = 56px + 16px gap)
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    >
      <div
        role="status"
        aria-live="polite"
        onClick={onAction ? handleTap : handleDismiss}
        className={`
          px-4 py-2.5 rounded-full
          bg-charcoal-900/90 backdrop-blur-sm
          text-white text-sm font-medium
          shadow-premium
          cursor-pointer touch-manipulation
          whitespace-nowrap
          transition-all duration-300 ease-out
          ${exiting
            ? 'opacity-0 translate-y-2 scale-95'
            : 'opacity-100 translate-y-0 scale-100'
          }
        `}
        style={{
          animation: exiting ? 'none' : 'nudgeSlideUp 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        <span aria-hidden="true" className="mr-1.5">&#128161;</span>
        {message}
      </div>

      <style jsx>{`
        @keyframes nudgeSlideUp {
          0% {
            opacity: 0;
            transform: translateY(12px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  )
}
