'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, MessageSquare, Star, Settings, TrendingUp, Users, Eye, Euro, ChevronRight, Calendar, ExternalLink, Search, Loader2, AlertCircle } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { QuickSiteLinks } from '@/components/InternalLinks'
import LogoutButton from '@/components/LogoutButton'

interface StatsData {
  profileViews: { value: number; change: string }
  demandesRecues: { value: number; change: string }
  devisEnvoyes: { value: number; change: string }
  clientsSatisfaits: { value: number; change: string }
  unreadMessages: number
}

interface Demande {
  id: string
  client_name: string
  service_name: string
  city: string | null
  created_at: string
  budget: string | null
  status: string
}

interface Profile {
  company_name: string | null
  full_name: string | null
  city: string | null
  is_verified: boolean
  subscription_plan: string
}

export default function EspaceArtisanPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [demandes, setDemandes] = useState<Demande[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setError(null)
      const response = await fetch('/api/artisan/stats')
      const data = await response.json()

      if (response.ok) {
        setStats(data.stats)
        setDemandes(data.recentDemandes || [])
        setProfile(data.profile)
      } else if (response.status === 401) {
        window.location.href = '/connexion?redirect=/espace-artisan'
        return
      } else if (response.status === 403) {
        setError('Accès réservé aux artisans. Veuillez vous inscrire en tant qu\'artisan.')
      } else {
        setError(data.error || 'Erreur lors du chargement des données')
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err)
      setError('Erreur de connexion. Veuillez vérifier votre connexion internet.')
    } finally {
      setLoading(false)
    }
  }

  const statsDisplay = [
    { label: 'Vues du profil', value: stats?.profileViews.value || 0, change: stats?.profileViews.change || '+0%', icon: Eye },
    { label: 'Demandes reçues', value: stats?.demandesRecues.value || 0, change: stats?.demandesRecues.change || '+0%', icon: FileText },
    { label: 'Devis envoyés', value: stats?.devisEnvoyes.value || 0, change: stats?.devisEnvoyes.change || '+0%', icon: Euro },
    { label: 'Clients satisfaits', value: stats?.clientsSatisfaits.value || 0, change: stats?.clientsSatisfaits.change || '+0%', icon: Users },
  ]

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
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setLoading(true)
                fetchDashboardData()
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Réessayer
            </button>
            <Link
              href="/inscription-artisan"
              className="text-blue-600 hover:underline text-sm"
            >
              S'inscrire en tant qu'artisan
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const displayName = profile?.company_name || profile?.full_name || 'Mon entreprise'
  const displayCity = profile?.city || ''

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb items={[{ label: 'Espace Artisan' }]} />
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Espace Artisan</h1>
              <p className="text-blue-100">{displayName}{displayCity && ` - ${displayCity}`}</p>
            </div>
            <div className="flex items-center gap-4">
              {profile?.is_verified && (
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Profil vérifié
                </span>
              )}
              {profile?.subscription_plan === 'premium' && (
                <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Premium
                </span>
              )}
              {profile?.subscription_plan === 'pro' && (
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Pro
                </span>
              )}
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
                href="/espace-artisan"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium"
              >
                <TrendingUp className="w-5 h-5" />
                Tableau de bord
              </Link>
              <Link
                href="/espace-artisan/calendrier"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Calendar className="w-5 h-5" />
                Calendrier
                <span className="ml-auto bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">Pro</span>
              </Link>
              <Link
                href="/espace-artisan/demandes"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <FileText className="w-5 h-5" />
                Demandes
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">3</span>
              </Link>
              <Link
                href="/espace-artisan/messages"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <MessageSquare className="w-5 h-5" />
                Messages
                <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">5</span>
              </Link>
              <Link
                href="/espace-artisan/avis"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Star className="w-5 h-5" />
                Avis clients
              </Link>
              <Link
                href="/espace-artisan/profil"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Settings className="w-5 h-5" />
                Mon profil
              </Link>
              <Link
                href="/espace-artisan/abonnement"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Euro className="w-5 h-5" />
                Abonnement
              </Link>
              <LogoutButton />
            </nav>

            {/* Voir mon profil public */}
            <div className="bg-white rounded-xl shadow-sm p-4 mt-4">
              <Link
                href="/services/artisan/martin-plomberie-paris"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Voir mon profil public
              </Link>
            </div>

            {/* Quick links */}
            <div className="mt-4">
              <QuickSiteLinks />
            </div>

            {/* Additional links */}
            <div className="bg-white rounded-xl shadow-sm p-4 mt-4">
              <h4 className="font-medium text-gray-900 mb-3">Liens utiles</h4>
              <div className="space-y-2 text-sm">
                <Link href="/services" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 py-1">
                  <Search className="w-4 h-4" />
                  Parcourir les services
                </Link>
                <Link href="/recherche" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 py-1">
                  <Search className="w-4 h-4" />
                  Rechercher un artisan
                </Link>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statsDisplay.map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="w-8 h-8 text-blue-600" />
                      <span className="text-green-600 text-sm font-medium">{stat.change}</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                )
              })}
            </div>

            {/* Dernières demandes */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Dernières demandes
                </h2>
                <Link href="/espace-artisan/demandes" className="text-blue-600 hover:underline text-sm">
                  Voir tout
                </Link>
              </div>
              <div className="space-y-4">
                {demandes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucune demande pour le moment</p>
                  </div>
                ) : (
                  demandes.map((demande) => (
                    <div
                      key={demande.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {demande.service_name}
                          </h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span>{demande.client_name}</span>
                            <span>{demande.city || 'Non précisé'}</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(demande.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          {demande.budget && (
                            <div className="mt-2 text-sm font-medium text-blue-600">
                              Budget : {demande.budget}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              demande.status === 'pending'
                                ? 'bg-red-100 text-red-700'
                                : demande.status === 'sent'
                                ? 'bg-yellow-100 text-yellow-700'
                                : demande.status === 'accepted'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {demande.status === 'pending' && 'Nouveau'}
                            {demande.status === 'sent' && 'Devis envoyé'}
                            {demande.status === 'accepted' && 'Accepté'}
                            {demande.status === 'refused' && 'Refusé'}
                            {demande.status === 'completed' && 'Terminé'}
                          </span>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Upgrade banner */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Passez à Premium</h3>
                  <p className="text-yellow-100">
                    Multipliez par 3 vos demandes de devis avec l'offre Premium
                  </p>
                </div>
                <Link
                  href="/tarifs-artisans"
                  className="bg-white text-orange-600 px-6 py-2 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
                >
                  Découvrir
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
