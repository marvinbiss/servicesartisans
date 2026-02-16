'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import {
  LayoutDashboard,
  Users,
  List,
  FileText,
  Send,
  Inbox,
  BarChart3,
  Settings,
} from 'lucide-react'

const tabs = [
  { name: 'Vue d\'ensemble', href: '/admin/prospection', icon: LayoutDashboard, exact: true },
  { name: 'Contacts', href: '/admin/prospection/contacts', icon: Users },
  { name: 'Listes', href: '/admin/prospection/lists', icon: List },
  { name: 'Modèles', href: '/admin/prospection/templates', icon: FileText },
  { name: 'Campagnes', href: '/admin/prospection/campaigns', icon: Send },
  { name: 'Boîte de réception', href: '/admin/prospection/inbox', icon: Inbox },
  { name: 'Statistiques', href: '/admin/prospection/analytics', icon: BarChart3 },
  { name: 'Paramètres IA', href: '/admin/prospection/settings', icon: Settings },
]

export function ProspectionNav() {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <nav aria-label="Navigation prospection" className="flex gap-1 overflow-x-auto border-b border-gray-200 pb-px mb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const active = isActive(tab.href, tab.exact)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors border-b-2',
              active
                ? 'text-blue-600 border-blue-600 bg-blue-50'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
            )}
          >
            <Icon className="w-4 h-4" />
            {tab.name}
          </Link>
        )
      })}
    </nav>
  )
}
