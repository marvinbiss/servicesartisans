'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, MessageSquare, Star, Settings, ChevronRight, Clock, CheckCircle, AlertCircle, Search, Loader2 } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { QuickSiteLinks } from '@/components/InternalLinks'
import LogoutButton from '@/components/LogoutButton'

interface Profile {
  full_name: string | null
  email: string
}

interface Demande {
  id: string
  service_name: string
  city: string | null
  postal_code: string
  created_at: string
  status: string
  devis?: { id: string }[]
}

interface Stats {
  total: number
  enAttente: number
  devisRecus: number
  acceptes: number
  termines: number
}

const statusConfig: Record<string, { label: string; color: string; icon?: React.ComponentType<{ className?: string }> }> = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
  sent: { label: 'Devis reçus', color: 'bg-blue-100 text-blue-700' },
  accepted: { label: 'En cours', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Terminé', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  refused: { label: 'Refusé', color: 'bg-gray-100 text-gray-700' },
}

export default function EspaceClientPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [demandes, setDemandes] = useState<Demande[]>([])
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setError(null)
      // Fetch profile and demandes in parallel
      const [profileRes, demandesRes] = await Promise.all([
        fetch('/api/client/profile'),
        fetch('/api/client/demandes'),
      ])

      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setProfile(profileData.profile)
      } else if (profileRes.status === 401) {
        // User is not authenticated, redirect to login
        window.location.href = '/connexion?redirect=/espace-client'
        return
      }

      if (demandesRes.ok) {
        const demandesData = await demandesRes.json()
        setDemandes(demandesData.demandes || [])
        setStats(demandesData.stats)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Erreur lors du chargement des données. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const displayName = profile?.full_name || 'Bienvenue'

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => {
              setLoading(true)
              fetchData()
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumb items={[{ label: 'Mon espace' }]} className="mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mon espace</h1>
              <p className="text-gray-600">Bienvenue, {displayName}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/recherche"
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Search className="w-4 h-4" />
                Rechercher
              </Link>
              <Link
                href="/devis"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Nouvelle demande
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-xl shadow-sm p-4 space-y-1">
              <Link
                href="/espace-client"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium"
              >
                <FileText className="w-5 h-5" />
                Mes demandes
              </Link>
              <Link
                href="/espace-client/messages"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <MessageSquare className="w-5 h-5" />
                Messages
                <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">2</span>
              </Link>
              <Link
                href="/espace-client/avis"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Star className="w-5 h-5" />
                Mes avis
              </Link>
              <Link
                href="/espace-client/parametres"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Settings className="w-5 h-5" />
                Paramètres
              </Link>
              <LogoutButton />
            </nav>

            {/* Liens vers le site - Maillage interne */}
            <QuickSiteLinks className="mt-4" />
          </div>

          {/* Main content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Stats Summary */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  <div className="text-sm text-gray-500">Demandes</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.enAttente}</div>
                  <div className="text-sm text-gray-500">En attente</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.devisRecus}</div>
                  <div className="text-sm text-gray-500">Devis reçus</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.termines}</div>
                  <div className="text-sm text-gray-500">Terminés</div>
                </div>
              </div>
            )}

            {/* Demandes de devis */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Mes demandes de devis
                </h2>
                <Link href="/devis" className="text-sm text-blue-600 hover:underline">
                  Nouvelle demande
                </Link>
              </div>
              <div className="space-y-4">
                {demandes.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Aucune demande de devis pour le moment</p>
                    <Link
                      href="/devis"
                      className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Faire une demande
                    </Link>
                  </div>
                ) : (
                  demandes.map((demande) => {
                    const statusInfo = statusConfig[demande.status] || { label: demande.status, color: 'bg-gray-100 text-gray-700' }
                    const devisCount = demande.devis?.length || 0
                    return (
                      <div
                        key={demande.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {demande.service_name} - {demande.city || demande.postal_code}
                            </h3>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {new Date(demande.created_at).toLocaleDateString('fr-FR')}
                              </span>
                              <span>{devisCount} devis reçu{devisCount > 1 ? 's' : ''}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${statusInfo.color}`}>
                              {statusInfo.icon && <statusInfo.icon className="w-4 h-4" />}
                              {statusInfo.label}
                            </span>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
