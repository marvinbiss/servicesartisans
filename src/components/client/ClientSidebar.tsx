'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { FileText, MessageSquare, Star, Settings, Menu, X } from 'lucide-react'
import { QuickSiteLinks } from '@/components/InternalLinks'
import LogoutButton from '@/components/LogoutButton'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { getSupabaseClient } from '@/lib/supabase/client'

interface ClientSidebarProps {
  activePage?: 'mes-demandes' | 'messages' | 'avis-donnes' | 'parametres' | 'factures'
  unreadMessagesCount?: number
}

const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function ClientSidebar({
  activePage = 'mes-demandes',
  unreadMessagesCount = 0,
}: ClientSidebarProps) {
  const [userId, setUserId] = useState<string | undefined>(undefined)
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const mobileSidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = getSupabaseClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })
  }, [])

  // Auto-focus close button when mobile sidebar opens
  useEffect(() => {
    if (mobileOpen) {
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [mobileOpen])

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [mobileOpen])

  // Focus trap + Escape handler for mobile sidebar
  const handleMobileKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      setMobileOpen(false)
      return
    }

    if (e.key === 'Tab' && mobileSidebarRef.current) {
      const focusables = Array.from(
        mobileSidebarRef.current.querySelectorAll<HTMLElement>(focusableSelector)
      )
      if (focusables.length === 0) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
  }, [])

  const navItems = [
    {
      key: 'mes-demandes',
      href: '/espace-client/mes-demandes',
      icon: FileText,
      label: 'Mes demandes',
    },
    {
      key: 'messages',
      href: '/espace-client/messages',
      icon: MessageSquare,
      label: 'Messages',
      badge: unreadMessagesCount,
    },
    { key: 'avis-donnes', href: '/espace-client/avis-donnes', icon: Star, label: 'Avis donnés' },
    { key: 'parametres', href: '/espace-client/parametres', icon: Settings, label: 'Paramètres' },
  ]

  const navContent = (
    <>
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = activePage === item.key
        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 ${
              isActive
                ? 'bg-primary-50 text-primary-500 font-medium'
                : 'text-charcoal-700 hover:bg-sand-50'
            }`}
          >
            <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>{item.label}</span>
            {item.badge && item.badge > 0 ? (
              <span
                role="status"
                aria-label={`${item.badge} message${item.badge > 1 ? 's' : ''} non lu${item.badge > 1 ? 's' : ''}`}
                className="ml-auto bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full"
              >
                {item.badge}
              </span>
            ) : null}
          </Link>
        )
      })}
      <LogoutButton />
    </>
  )

  return (
    <div className="lg:col-span-1">
      {/* Mobile toggle button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden flex items-center gap-2 px-3 py-2 mb-2 bg-white rounded-lg shadow-sm text-charcoal-700 hover:bg-sand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
        aria-label="Ouvrir le menu"
      >
        <Menu className="w-5 h-5" aria-hidden="true" />
        <span className="text-sm font-medium">Menu</span>
      </button>

      {/* Mobile backdrop */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile sidebar */}
      <div
        ref={mobileSidebarRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal client"
        onKeyDown={handleMobileKeyDown}
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'trancharcoal-x-0' : '-trancharcoal-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-sand-200">
          <span className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider">
            Menu
          </span>
          <div className="flex items-center gap-2">
            <NotificationBell userId={userId} />
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setMobileOpen(false)}
              className="p-1 text-charcoal-500 hover:text-charcoal-700 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
        <nav
          role="navigation"
          aria-label="Menu principal client"
          className="p-2 space-y-0.5 overflow-y-auto max-h-[calc(100vh-56px)]"
        >
          {navContent}
        </nav>
      </div>

      {/* Desktop sidebar */}
      <nav
        role="navigation"
        aria-label="Menu principal client"
        className="hidden lg:block bg-white rounded-xl shadow-sm p-4 space-y-1"
      >
        {/* Notifications */}
        <div className="flex items-center justify-between px-2 pb-2 mb-1 border-b border-sand-200">
          <span className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider">
            Menu
          </span>
          <NotificationBell userId={userId} />
        </div>
        {navContent}
      </nav>

      {/* Liens vers le site - Maillage interne */}
      <div className="hidden lg:block">
        <QuickSiteLinks className="mt-4" />
      </div>
    </div>
  )
}
