'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Search, Calendar, User, MessageSquare } from 'lucide-react'

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  activeRoutes?: string[]
}

const navItems: NavItem[] = [
  {
    href: '/',
    icon: Home,
    label: 'Accueil',
    activeRoutes: ['/'],
  },
  {
    href: '/services',
    icon: Search,
    label: 'Services',
    activeRoutes: ['/services'],
  },
  {
    href: '/espace-client',
    icon: Calendar,
    label: 'Mes RDV',
    activeRoutes: ['/espace-client', '/booking'],
  },
  {
    href: '/messages',
    icon: MessageSquare,
    label: 'Messages',
    activeRoutes: ['/messages'],
  },
  {
    href: '/profil',
    icon: User,
    label: 'Profil',
    activeRoutes: ['/profil', '/espace-artisan'],
  },
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  const isActive = (item: NavItem) => {
    if (item.activeRoutes) {
      return item.activeRoutes.some(route =>
        route === '/' ? pathname === '/' : pathname.startsWith(route)
      )
    }
    return pathname === item.href
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const active = isActive(item)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`w-6 h-6 ${active ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-xs mt-1 ${active ? 'font-medium' : ''}`}>
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
