'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Search, FileText, User, Phone } from 'lucide-react'
import { useMobileMenu } from '@/contexts/MobileMenuContext'

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  activeRoutes?: string[]
  urgent?: boolean
}

const navItems: NavItem[] = [
  {
    href: '/',
    icon: Home,
    label: 'Accueil',
    activeRoutes: ['/'],
  },
  {
    href: '/recherche',
    icon: Search,
    label: 'Rechercher',
    activeRoutes: ['/recherche', '/services'],
  },
  {
    href: '/devis',
    icon: FileText,
    label: 'Devis',
    activeRoutes: ['/devis'],
  },
  {
    href: '/urgence',
    icon: Phone,
    label: 'Urgence',
    activeRoutes: ['/urgence'],
    urgent: true,
  },
  {
    href: '/connexion',
    icon: User,
    label: 'Compte',
    activeRoutes: ['/connexion', '/inscription', '/espace-client', '/espace-artisan'],
  },
]

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { isMenuOpen } = useMobileMenu()

  // Ne pas afficher dans les espaces connectés (ils ont leur propre nav)
  const hideOnPages = ['/espace-client', '/espace-artisan', '/admin']
  const shouldHide = hideOnPages.some(page => pathname.startsWith(page))

  // Masquer quand le menu mobile est ouvert
  if (shouldHide || isMenuOpen) return null

  const isActive = (item: NavItem) => {
    if (item.activeRoutes) {
      return item.activeRoutes.some(route =>
        route === '/' ? pathname === '/' : pathname.startsWith(route)
      )
    }
    return pathname === item.href
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex items-center justify-around px-1 pb-safe">
        {navItems.map((item) => {
          const active = isActive(item)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[60px] min-h-[56px] px-2 py-2 rounded-lg transition-all ${
                item.urgent
                  ? 'text-red-600'
                  : active
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-500 active:bg-gray-100'
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${active && !item.urgent ? 'stroke-[2.5]' : ''}`} />
                {item.urgent && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 ${active || item.urgent ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// Wrapper component to add padding for bottom nav
export function MobileNavSpacer() {
  return <div className="h-16 md:hidden" />
}
