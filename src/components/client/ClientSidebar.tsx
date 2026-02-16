'use client'

import Link from 'next/link'
import { FileText, MessageSquare, Star, Settings } from 'lucide-react'
import { QuickSiteLinks } from '@/components/InternalLinks'
import LogoutButton from '@/components/LogoutButton'

interface ClientSidebarProps {
  activePage?: 'mes-demandes' | 'messages' | 'avis-donnes' | 'parametres' | 'factures'
  unreadMessagesCount?: number
}

export default function ClientSidebar({ activePage = 'mes-demandes', unreadMessagesCount = 0 }: ClientSidebarProps) {
  return (
    <div className="lg:col-span-1">
      <nav className="bg-white rounded-xl shadow-sm p-4 space-y-1">
        <Link
          href="/espace-client/mes-demandes"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
            activePage === 'mes-demandes' ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FileText className="w-5 h-5" />
          Mes demandes
        </Link>
        <Link
          href="/espace-client/messages"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
            activePage === 'messages' ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          Messages
          {unreadMessagesCount > 0 && (
            <span className="ml-auto bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">{unreadMessagesCount}</span>
          )}
        </Link>
        <Link
          href="/espace-client/avis-donnes"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
            activePage === 'avis-donnes' ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Star className="w-5 h-5" />
          Avis donnés
        </Link>
        <Link
          href="/espace-client/parametres"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
            activePage === 'parametres' ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Settings className="w-5 h-5" />
          Paramètres
        </Link>
        <LogoutButton />
      </nav>

      {/* Liens vers le site - Maillage interne */}
      <QuickSiteLinks className="mt-4" />
    </div>
  )
}
