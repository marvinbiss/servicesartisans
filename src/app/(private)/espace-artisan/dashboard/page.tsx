'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import {
  FileText,
  Eye,
  Phone,
  PhoneCall,
  ChevronRight,
  Calendar,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import ArtisanSidebar from '@/components/artisan-dashboard/ArtisanSidebar'
import ProfileCompleteness from '@/components/artisan-dashboard/ProfileCompleteness'
import { StatCard } from '@/components/dashboard/StatCard'
import PhotoUploadBanner from '@/components/dashboard/PhotoUploadBanner'
import { getArtisanUrl } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

interface StatsData {
  profileViews: { value: number; change: string }
  phoneReveals: { value: number; change: string }
  phoneClicks: { value: number; change: string }
  demandesRecues: { value: number; change: string }
  unreadMessages: number
  pendingDemandesCount: number
  portfolioPhotoCount?: number
}

interface Demande {
  id: string
  client_name: string
  service_name: string
  city: string | null
  postal_code: string | null
  created_at: string
  status:
    | 'pending'
    | 'viewed'
    | 'quoted'
    | 'declined'
    | 'sent'
    | 'accepted'
    | 'refused'
    | 'completed'
}

interface Profile {
  full_name: string | null
  role: string | null
}

interface Provider {
  id: string
  stable_id: string | null
  slug: string | null
  specialty: string | null
  address_city: string | null
  address_postal_code: string | null
  is_verified: boolean
  name: string | null
  description: string | null
  bio: string | null
  phone: string | null
  email: string | null
  siret: string | null
  avatar_url: string | null
  services_offered: string[] | null
  service_prices: unknown[] | null
  opening_hours: Record<string, unknown> | null
  website: string | null
}

interface DashboardData {
  stats: StatsData
  recentDemandes: Demande[]
  profile: Profile
  provider: Provider
}

interface FetchError {
  status: number
  message?: string
}

// ─── SWR Fetcher ─────────────────────────────────────────────────────────────

const fetcher = (url: string): Promise<DashboardData> =>
  fetch(url).then((r) => {
    if (!r.ok) throw { status: r.status } as FetchError
    return r.json()
  })

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseTrend(change: string): { value: number; isPositive: boolean } | undefined {
  const num = parseInt(change.replace(/[^-\d]/g, ''), 10)
  if (isNaN(num) || num === 0) return undefined
  return { value: Math.abs(num), isPositive: num >= 0 }
}

function getStatusLabel(status: Demande['status']): string {
  switch (status) {
    // Statuts lead_assignments
    case 'pending':
      return 'Nouveau'
    case 'viewed':
      return 'Consulté'
    case 'quoted':
      return 'Devis envoyé'
    case 'declined':
      return 'Refusé'
    // Statuts devis_requests (compatibilité)
    case 'sent':
      return 'Devis envoyé'
    case 'accepted':
      return 'Accepté'
    case 'refused':
      return 'Refusé'
    case 'completed':
      return 'Terminé'
    default:
      return status
  }
}

function getStatusClasses(status: Demande['status']): string {
  switch (status) {
    // Statuts lead_assignments
    case 'pending':
      return 'bg-red-100 text-red-700'
    case 'viewed':
      return 'bg-yellow-100 text-yellow-700'
    case 'quoted':
      return 'bg-primary-100 text-primary-600'
    case 'declined':
      return 'bg-red-100 text-red-700'
    // Statuts devis_requests (compatibilité)
    case 'sent':
      return 'bg-yellow-100 text-yellow-700'
    case 'accepted':
      return 'bg-green-100 text-green-700'
    case 'refused':
      return 'bg-sand-100 text-charcoal-700'
    case 'completed':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-sand-100 text-charcoal-600'
  }
}

// ─── Skeletons ───────────────────────────────────────────────────────────────

function StatsSkeleton() {
  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      aria-busy="true"
      aria-label="Chargement des statistiques"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-sand-300 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-sand-300 animate-pulse" />
            <div className="w-14 h-5 rounded-full bg-sand-300 animate-pulse" />
          </div>
          <div className="w-16 h-8 rounded bg-sand-300 animate-pulse mb-1" />
          <div className="w-24 h-4 rounded bg-sand-300 animate-pulse" />
        </div>
      ))}
    </div>
  )
}

function DemandesSkeleton() {
  return (
    <div
      className="bg-white rounded-xl border border-sand-300 p-6"
      aria-busy="true"
      aria-label="Chargement des demandes"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="w-40 h-6 rounded bg-sand-300 animate-pulse" />
        <div className="w-16 h-4 rounded bg-sand-300 animate-pulse" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border border-sand-300 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="w-48 h-5 rounded bg-sand-300 animate-pulse" />
                <div className="flex gap-4">
                  <div className="w-24 h-4 rounded bg-sand-300 animate-pulse" />
                  <div className="w-20 h-4 rounded bg-sand-300 animate-pulse" />
                  <div className="w-28 h-4 rounded bg-sand-300 animate-pulse" />
                </div>
              </div>
              <div className="w-20 h-6 rounded-full bg-sand-300 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Empty Demandes State (Linear/Shopify pattern) ───────────────────────────

function EmptyDemandesState() {
  return (
    <div className="text-center py-12 px-4">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-sand-100 flex items-center justify-center mb-5">
        <FileText className="w-8 h-8 text-charcoal-400" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-charcoal-900 mb-2">
        Vous n'avez pas encore de demandes
      </h3>
      <p className="text-sm text-charcoal-500 max-w-sm mx-auto mb-6">
        Complétez votre profil et ajoutez des photos pour apparaître dans les résultats de recherche
      </p>
      <Link
        href="/espace-artisan/profil"
        className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 transition-colors"
      >
        Compléter mon profil
        <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </div>
  )
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function DashboardArtisanPage() {
  const router = useRouter()

  const { data, error, isLoading, mutate } = useSWR<DashboardData, FetchError>(
    '/api/artisan/stats',
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 30_000,
      dedupingInterval: 5_000,
    }
  )

  // Redirect on 401
  useEffect(() => {
    if (error && (error as FetchError).status === 401) {
      router.push('/connexion?redirect=/espace-artisan')
    }
  }, [error, router])

  const stats = data?.stats ?? null
  const demandes = data?.recentDemandes ?? []
  const profile = data?.profile ?? null
  const provider = data?.provider ?? null

  // 403 — artisan-only access
  if (error && (error as FetchError).status === 403) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-xl font-semibold text-charcoal-900 mb-2">Accès réservé</h2>
          <p className="text-charcoal-600 mb-6">
            Accès réservé aux artisans. Veuillez vous inscrire en tant qu'artisan.
          </p>
          <Link
            href="/inscription-artisan"
            className="inline-block bg-primary-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-600 focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 transition-colors"
          >
            S'inscrire en tant qu'artisan
          </Link>
        </div>
      </div>
    )
  }

  // Generic error (non-401, non-403)
  const hasGenericError =
    error && (error as FetchError).status !== 401 && (error as FetchError).status !== 403

  const displayName = profile?.full_name || 'Mon entreprise'
  const displayCity = provider?.address_city || ''
  const publicUrl = provider
    ? getArtisanUrl({
        stable_id: provider.stable_id,
        slug: provider.slug,
        specialty: provider.specialty,
        city: provider.address_city,
      })
    : null

  const statsCards = stats
    ? [
        {
          title: 'Vues du profil',
          value: stats.profileViews.value,
          trend: parseTrend(stats.profileViews.change),
          icon: <Eye className="w-5 h-5" aria-hidden="true" />,
          color: 'blue' as const,
        },
        {
          title: 'Numéros affichés',
          value: stats.phoneReveals.value,
          trend: parseTrend(stats.phoneReveals.change),
          icon: <Phone className="w-5 h-5" aria-hidden="true" />,
          color: 'green' as const,
        },
        {
          title: 'Appels reçus',
          value: stats.phoneClicks.value,
          trend: parseTrend(stats.phoneClicks.change),
          icon: <PhoneCall className="w-5 h-5" aria-hidden="true" />,
          color: 'indigo' as const,
        },
        {
          title: 'Demandes reçues',
          value: stats.demandesRecues.value,
          trend: parseTrend(stats.demandesRecues.change),
          icon: <FileText className="w-5 h-5" aria-hidden="true" />,
          color: 'yellow' as const,
        },
      ]
    : []

  const showProfileWidget = !!provider

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb
            items={[
              { label: 'Espace Artisan', href: '/espace-artisan' },
              { label: 'Tableau de bord' },
            ]}
          />
        </div>
      </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-primary-500 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Tableau de bord</h1>
              <p className="text-primary-100">
                {displayName}
                {displayCity && ` — ${displayCity}`}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {provider?.is_verified && (
                <span
                  className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium"
                  role="status"
                >
                  Profil référencé
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <ArtisanSidebar
            activePage="dashboard"
            newDemandesCount={stats?.pendingDemandesCount ?? 0}
            unreadMessagesCount={stats?.unreadMessages ?? 0}
            publicUrl={publicUrl}
          />

          {/* Main content */}
          <main id="main-content" className="lg:col-span-3 space-y-8">
            {/* Inline error banner */}
            {hasGenericError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4"
                role="alert"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" aria-hidden="true" />
                <p className="text-sm text-red-700 flex-1">
                  Erreur de connexion. Veuillez vérifier votre connexion internet.
                </p>
                <button
                  onClick={() => mutate()}
                  className="text-sm font-medium text-red-700 hover:text-red-800 underline focus-visible:ring-2 focus-visible:ring-red-500 rounded"
                >
                  Réessayer
                </button>
              </motion.div>
            )}

            {/* Photo Upload Banner */}
            {data?.stats?.portfolioPhotoCount !== undefined && (
              <PhotoUploadBanner photoCount={data.stats.portfolioPhotoCount} />
            )}

            {/* Stats Section */}
            <section aria-label="Statistiques" aria-live="polite">
              {isLoading ? (
                <StatsSkeleton />
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {statsCards.map((card, index) => (
                    <StatCard
                      key={card.title}
                      title={card.title}
                      value={card.value}
                      trend={card.trend}
                      icon={card.icon}
                      color={card.color}
                      delay={index * 0.05}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Two-column layout: Demandes + Profile widget */}
            <div className={showProfileWidget ? 'grid lg:grid-cols-3 gap-8' : ''}>
              {/* Dernières demandes */}
              <section
                className={showProfileWidget ? 'lg:col-span-2' : ''}
                aria-label="Dernières demandes"
              >
                {isLoading ? (
                  <DemandesSkeleton />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl border border-sand-300 p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-charcoal-900">
                        Dernières demandes
                      </h2>
                      <Link
                        href="/espace-artisan/demandes-recues"
                        className="text-primary-500 hover:underline text-sm focus-visible:ring-2 focus-visible:ring-primary-400 rounded"
                      >
                        Voir tout
                      </Link>
                    </div>
                    <div className="space-y-4">
                      {demandes.length === 0 ? (
                        <EmptyDemandesState />
                      ) : (
                        demandes.map((demande, index) => (
                          <motion.div
                            key={demande.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 + index * 0.04 }}
                          >
                            <Link
                              href={`/espace-artisan/demandes-recues?id=${demande.id}`}
                              className="block border border-sand-300 rounded-lg p-4 hover:shadow-md hover:border-primary-200 focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 transition-all"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-medium text-charcoal-900">
                                      {demande.service_name}
                                    </h3>
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClasses(demande.status)}`}
                                      role="status"
                                    >
                                      {getStatusLabel(demande.status)}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-sm text-charcoal-500">
                                    <span>{demande.client_name}</span>
                                    <span>{demande.city || 'Non précisé'}</span>
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" aria-hidden="true" />
                                      {new Date(demande.created_at).toLocaleDateString('fr-FR', {
                                        timeZone: 'Europe/Paris',
                                      })}
                                    </span>
                                  </div>
                                  {demande.postal_code && (
                                    <div className="mt-2 text-sm font-medium text-primary-500">
                                      Code postal : {demande.postal_code}
                                    </div>
                                  )}
                                </div>
                                <ChevronRight
                                  className="w-5 h-5 text-charcoal-400 hidden sm:block shrink-0"
                                  aria-hidden="true"
                                />
                              </div>
                            </Link>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </section>

              {/* Profile Completeness widget (right column) */}
              {showProfileWidget && !isLoading && provider && (
                <motion.aside
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  aria-label="Complétion du profil"
                >
                  <ProfileCompleteness provider={provider} />
                </motion.aside>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
