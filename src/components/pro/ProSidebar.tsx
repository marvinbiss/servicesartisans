'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  Star,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
  Bell,
  LogOut,
  CreditCard,
  FileText,
  Briefcase,
  Crown,
  Zap,
} from 'lucide-react'

interface ProSidebarProps {
  artisanName: string
  artisanAvatar?: string
  subscription: 'free' | 'pro' | 'premium'
  unreadNotifications?: number
  newLeads?: number
}

const menuItems = [
  {
    label: 'Dashboard',
    href: '/pro/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Leads',
    href: '/pro/leads',
    icon: Users,
    badge: 'newLeads',
  },
  {
    label: 'Réservations',
    href: '/pro/reservations',
    icon: Calendar,
  },
  {
    label: 'Messages',
    href: '/pro/messages',
    icon: MessageSquare,
  },
  {
    label: 'Avis clients',
    href: '/pro/avis',
    icon: Star,
  },
  {
    label: 'Statistiques',
    href: '/pro/stats',
    icon: BarChart3,
  },
  {
    label: 'Devis',
    href: '/pro/devis',
    icon: FileText,
  },
  {
    label: 'Mon profil',
    href: '/pro/profil',
    icon: Briefcase,
  },
]

const bottomMenuItems = [
  {
    label: 'Abonnement',
    href: '/pro/abonnement',
    icon: CreditCard,
  },
  {
    label: 'Paramètres',
    href: '/pro/parametres',
    icon: Settings,
  },
  {
    label: 'Aide',
    href: '/pro/aide',
    icon: HelpCircle,
  },
]

const subscriptionConfig = {
  free: {
    label: 'Gratuit',
    color: 'bg-slate-100 text-slate-600',
    icon: null,
  },
  pro: {
    label: 'Pro',
    color: 'bg-blue-100 text-blue-700',
    icon: Zap,
  },
  premium: {
    label: 'Premium',
    color: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white',
    icon: Crown,
  },
}

export function ProSidebar({
  artisanName,
  artisanAvatar,
  subscription,
  unreadNotifications = 0,
  newLeads = 0,
}: ProSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const sub = subscriptionConfig[subscription]
  const SubIcon = sub.icon

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-40"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                  SA
                </div>
                <div>
                  <div className="font-bold text-slate-900">ServicesArtisans</div>
                  <div className="text-xs text-slate-500">Espace Pro</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft
              className={`w-5 h-5 text-slate-500 transition-transform ${
                isCollapsed ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* User Profile */}
      <div className={`p-4 border-b border-slate-200 ${isCollapsed ? 'px-3' : ''}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="relative">
            {artisanAvatar ? (
              <img
                src={artisanAvatar}
                alt={artisanName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center text-slate-600 font-semibold">
                {artisanName.charAt(0)}
              </div>
            )}
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <div className="font-medium text-slate-900 truncate">{artisanName}</div>
                <div className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${sub.color}`}>
                  {SubIcon && <SubIcon className="w-3 h-3" />}
                  {sub.label}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          const badgeCount = item.badge === 'newLeads' ? newLeads : 0

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative
                ${isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600' : ''}`} />
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {badgeCount > 0 && (
                <span
                  className={`
                    bg-red-500 text-white text-xs font-bold rounded-full
                    ${isCollapsed ? 'absolute -top-1 -right-1 w-5 h-5' : 'px-2 py-0.5'}
                    flex items-center justify-center
                  `}
                >
                  {badgeCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Upgrade CTA (for free users) */}
      {subscription === 'free' && !isCollapsed && (
        <div className="mx-3 mb-3">
          <Link
            href="/pro/abonnement"
            className="block p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white"
          >
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-yellow-300" />
              <span className="font-semibold">Passez Pro</span>
            </div>
            <p className="text-sm text-blue-100">
              Débloquez plus de leads et fonctionnalités
            </p>
          </Link>
        </div>
      )}

      {/* Bottom Menu */}
      <div className="p-3 border-t border-slate-200 space-y-1">
        {bottomMenuItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                ${isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <item.icon className="w-5 h-5" />
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}

        {/* Logout */}
        <button
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all w-full
            text-slate-500 hover:bg-red-50 hover:text-red-600
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut className="w-5 h-5" />
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-medium"
              >
                Déconnexion
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  )
}
