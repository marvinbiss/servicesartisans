'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  FileText,
  Star,
  CreditCard,
  Grid,
  MessageSquare,
  Flag,
  Shield,
  Lock,
  Settings,
  Database,
} from 'lucide-react'

const nav = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Utilisateurs', href: '/admin/utilisateurs', icon: Users },
  { name: 'Artisans', href: '/admin/artisans', icon: Briefcase },
  { name: 'Réservations', href: '/admin/reservations', icon: Calendar },
  { name: 'Devis', href: '/admin/devis', icon: FileText },
  { name: 'Avis', href: '/admin/avis', icon: Star },
  { name: 'Paiements', href: '/admin/paiements', icon: CreditCard },
  { name: 'Services', href: '/admin/services', icon: Grid },
  { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { name: 'Signalements', href: '/admin/signalements', icon: Flag },
  { name: 'Audit', href: '/admin/audit', icon: Shield },
  { name: 'RGPD', href: '/admin/rgpd', icon: Lock },
  { name: 'Import SIRENE', href: '/admin/import', icon: Database },
  { name: 'Paramètres', href: '/admin/parametres', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-64 bg-gray-900 min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <Link href="/admin" className="text-xl font-bold text-white flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Administration
        </Link>
      </div>
      <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
        {nav.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive(item.href)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          ← Retour au site
        </Link>
      </div>
    </aside>
  )
}
