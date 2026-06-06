'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import useSWR from 'swr'
import {
  LayoutDashboard,
  Inbox,
  Contact,
  Zap,
  Settings,
  ExternalLink,
  Menu,
  X,
  Plus,
  GraduationCap,
  Banknote,
} from 'lucide-react'
import LogoutButton from '@/components/LogoutButton'
import { NotificationBell } from '@/components/notifications/NotificationBell'

/**
 * Shell de l'espace artisan (refonte 2026-06-06) — sidebar desktop + topbar
 * mobile, monté UNE FOIS dans (private)/espace-artisan/layout.tsx.
 * Remplace l'ancienne ArtisanSidebar 13 entrées montée en dur dans chaque page.
 *
 * Nav 4 sections + paramètres discret :
 *   Aujourd'hui · Mes demandes · Ma fiche · Dossiers CEE · Paramètres
 * Gelés (hors nav, routes redirigées) : calendrier, équipe, abonnement.
 * Messages : gelé lecture seule, accessible par URL directe uniquement.
 */

interface BadgeData {
  stats: {
    pendingDemandesCount: number
  }
}

const badgeFetcher = (url: string): Promise<BadgeData> =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error('Failed to fetch badges')
    return r.json()
  })

interface NavEntry {
  href: string
  label: string
  icon: typeof LayoutDashboard
  /** Préfixes additionnels considérés actifs (anciens paths redirigés) */
  match?: string[]
  /** href exact uniquement (index) */
  exact?: boolean
  badge?: boolean
}

const NAV: NavEntry[] = [
  {
    href: '/espace-artisan',
    label: "Aujourd'hui",
    icon: LayoutDashboard,
    exact: true,
    match: ['/espace-artisan/dashboard', '/espace-artisan/statistiques'],
  },
  {
    href: '/espace-artisan/demandes',
    label: 'Mes demandes',
    icon: Inbox,
    match: ['/espace-artisan/demandes-recues', '/espace-artisan/leads'],
    badge: true,
  },
  {
    href: '/espace-artisan/profil',
    label: 'Ma fiche',
    icon: Contact,
    match: ['/espace-artisan/portfolio', '/espace-artisan/avis-recus', '/espace-artisan/avis'],
  },
  {
    href: '/espace-artisan/cee',
    label: 'Dossiers CEE',
    icon: Zap,
  },
]

const CEE_SUBNAV: NavEntry[] = [
  { href: '/espace-artisan/cee/nouveau', label: 'Nouveau dossier', icon: Plus },
  { href: '/espace-artisan/cee/formation', label: 'Formation', icon: GraduationCap },
  { href: '/espace-artisan/cee/commissions', label: 'Commissions', icon: Banknote },
]

const PARAMETRES: NavEntry = {
  href: '/espace-artisan/parametres',
  label: 'Paramètres',
  icon: Settings,
  match: ['/espace-artisan/securite'],
}

const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface ArtisanShellProps {
  userId: string
  publicUrl?: string | null
  children: React.ReactNode
}

export default function ArtisanShell({ userId, publicUrl, children }: ArtisanShellProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  const { data: badgeData } = useSWR<BadgeData>('/api/artisan/stats', badgeFetcher, {
    revalidateOnFocus: true,
    refreshInterval: 60_000,
    dedupingInterval: 10_000,
  })
  const pendingCount = badgeData?.stats?.pendingDemandesCount ?? 0

  const isActive = useCallback(
    (entry: NavEntry): boolean => {
      if (entry.exact && pathname === entry.href) return true
      if (!entry.exact && (pathname === entry.href || pathname.startsWith(`${entry.href}/`)))
        return true
      return (entry.match ?? []).some((m) => pathname === m || pathname.startsWith(`${m}/`))
    },
    [pathname]
  )

  // Fermer le drawer à chaque navigation
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (mobileOpen) {
      const timer = setTimeout(() => closeButtonRef.current?.focus(), 50)
      document.body.style.overflow = 'hidden'
      return () => {
        clearTimeout(timer)
        document.body.style.overflow = ''
      }
    }
  }, [mobileOpen])

  const handleDrawerKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      setMobileOpen(false)
      return
    }
    if (e.key === 'Tab' && drawerRef.current) {
      const focusables = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(focusableSelector)
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }, [])

  const ceeActive =
    pathname === '/espace-artisan/cee' || pathname.startsWith('/espace-artisan/cee/')

  const renderEntry = (entry: NavEntry, sub = false) => {
    const Icon = entry.icon
    const active = sub
      ? pathname === entry.href || pathname.startsWith(`${entry.href}/`)
      : isActive(entry)
    return (
      <Link
        key={entry.href}
        href={entry.href}
        aria-current={active ? 'page' : undefined}
        className={`flex items-center gap-3 rounded-lg border-l-[3px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 ${
          sub ? 'px-3 py-1.5 ml-7 text-sm' : 'px-3 py-2.5'
        } ${
          active
            ? 'bg-primary-50 text-primary-600 font-medium border-primary-500'
            : 'text-charcoal-700 hover:bg-sand-50 border-transparent'
        }`}
      >
        <Icon className={`${sub ? 'w-4 h-4' : 'w-5 h-5'} shrink-0`} aria-hidden="true" />
        <span>{entry.label}</span>
        {entry.badge && pendingCount > 0 && (
          <span
            role="status"
            aria-label={`${pendingCount} nouvelle${pendingCount > 1 ? 's' : ''} demande${pendingCount > 1 ? 's' : ''}`}
            className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full"
          >
            {pendingCount}
          </span>
        )}
      </Link>
    )
  }

  const navContent = (
    <div className="flex flex-col h-full">
      <div className="space-y-1">
        {NAV.map((entry) => (
          <div key={entry.href}>
            {renderEntry(entry)}
            {entry.href === '/espace-artisan/cee' && ceeActive && (
              <div className="mt-1 space-y-0.5">
                {CEE_SUBNAV.map((sub) => renderEntry(sub, true))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-auto pt-4 space-y-1">
        {publicUrl && (
          <Link
            href={publicUrl}
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg border-l-[3px] border-transparent text-charcoal-700 hover:bg-sand-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
          >
            <ExternalLink className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>Voir ma fiche publique</span>
          </Link>
        )}
        {renderEntry(PARAMETRES)}
        <div className="pt-2 border-t border-sand-200">
          <LogoutButton />
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-sand-200">
        <div className="flex items-center justify-between px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 text-charcoal-700 hover:bg-sand-50 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
            <Link
              href="/espace-artisan"
              className="font-heading font-bold text-charcoal-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded"
            >
              Services<span className="text-primary-500">Artisans</span>
              <span className="hidden sm:inline text-charcoal-400 font-normal text-sm ml-2">
                Espace artisan
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell userId={userId} />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar desktop */}
        <nav
          aria-label="Menu espace artisan"
          className="hidden lg:flex flex-col w-64 shrink-0 border-r border-sand-200 bg-white px-3 py-4 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto"
        >
          {navContent}
        </nav>

        {/* Drawer mobile */}
        <div
          className={`lg:hidden fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ${
            mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu espace artisan"
          onKeyDown={handleDrawerKeyDown}
          className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-200 ease-in-out flex flex-col ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-sand-200">
            <span className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider">
              Menu
            </span>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setMobileOpen(false)}
              className="p-1 text-charcoal-500 hover:text-charcoal-700 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
          <nav aria-label="Menu espace artisan" className="flex-1 px-3 py-4 overflow-y-auto">
            {navContent}
          </nav>
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0 px-4 py-6 lg:px-8">{children}</div>
      </div>
    </div>
  )
}
