'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, FileText, User } from 'lucide-react'
import { useMobileMenu } from '@/contexts/MobileMenuContext'

const navItems: { href: string; icon: typeof Home; label: string }[] = [
  { href: '/', icon: Home, label: 'Accueil' },
  { href: '/recherche', icon: Search, label: 'Recherche' },
  { href: '/devis', icon: FileText, label: 'Devis' },
  { href: '/connexion', icon: User, label: 'Mon compte' },
]

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { isMenuOpen } = useMobileMenu()
  const [estimationOpen, setEstimationOpen] = useState(false)

  // Watch for estimation widget open/close via body attribute
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setEstimationOpen(document.body.hasAttribute('data-estimation-open'))
    })
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-estimation-open'] })
    return () => observer.disconnect()
  }, [])

  // Ne pas afficher dans les espaces connectés (ils ont leur propre nav)
  const hideOnPages = ['/espace-client', '/espace-artisan', '/admin']
  const shouldHide = hideOnPages.some(page => pathname.startsWith(page))

  // Masquer quand le menu mobile est ouvert ou quand le widget estimation est ouvert
  if (shouldHide || isMenuOpen || estimationOpen) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white shadow-lg shadow-charcoal-900/10 border-t border-sand-200"
      aria-label="Navigation mobile"
    >
      <div className="flex items-center justify-around h-14 pb-safe">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors touch-manipulation active:scale-95 ${
                isActive ? 'text-primary-400' : 'text-charcoal-400'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
              <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// Wrapper component to add padding for bottom nav
export function MobileNavSpacer() {
  return <div className="h-14 md:hidden" />
}
