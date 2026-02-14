'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Briefcase,
  Calendar,
  DollarSign,
  AlertTriangle,
  Shield,
  Star,
  BarChart3,
  Activity,
  Search,
  Filter,
  ChevronRight,
  Eye,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { ErrorBanner } from '@/components/admin/ErrorBanner'
import { ConfirmationModal } from '@/components/admin/ConfirmationModal'

interface PlatformStats {
  totalUsers: number
  totalArtisans: number
  totalBookings: number
  totalRevenue: number
  newUsersToday: number
  newBookingsToday: number
  activeUsers7d: number
  pendingReports: number
  averageRating: number
}

interface RecentActivity {
  id: string
  type: 'booking' | 'review' | 'report' | 'user'
  action: string
  details: string
  timestamp: string
  status?: string
}

interface Report {
  id: string
  targetType: string
  reason: string
  description: string
  status: string
  createdAt: string
  reporter: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [pendingReports, setPendingReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'reports' | 'reviews'>('overview')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setError(null)
      const response = await fetch('/api/admin/stats')
      if (!response.ok) throw new Error(`Erreur ${response.status}`)
      const data = await response.json()
      setStats(data.stats)
      setRecentActivity(data.recentActivity || [])
      setPendingReports(data.pendingReports || [])
    } catch {
      setError('Erreur lors du chargement du tableau de bord')
    } finally {
      setLoading(false)
    }
  }

  const [reportActionModal, setReportActionModal] = useState<{
    open: boolean
    reportId: string
    action: 'resolve' | 'dismiss'
    label: string
  }>({ open: false, reportId: '', action: 'resolve', label: '' })

  const confirmReportAction = async () => {
    try {
      setError(null)
      const response = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: reportActionModal.reportId, action: reportActionModal.action }),
      })
      if (!response.ok) throw new Error('Erreur lors de la mise à jour du signalement')
      setReportActionModal({ open: false, reportId: '', action: 'resolve', label: '' })
      fetchDashboardData()
    } catch {
      setError('Erreur lors de la mise à jour du signalement')
    }
  }

  const handleReportAction = (reportId: string, action: 'resolve' | 'dismiss') => {
    const actionLabel = action === 'resolve' ? 'résoudre' : 'rejeter'
    setReportActionModal({ open: true, reportId, action, label: actionLabel })
  }

  // Valeurs par défaut si les données ne sont pas encore chargées
  const defaultStats: PlatformStats = {
    totalUsers: 0,
    totalArtisans: 0,
    totalBookings: 0,
    totalRevenue: 0,
    newUsersToday: 0,
    newBookingsToday: 0,
    activeUsers7d: 0,
    pendingReports: 0,
    averageRating: 0,
  }

  const displayStats = stats || defaultStats

  const statCards = [
    {
      label: 'Utilisateurs total',
      value: displayStats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Artisans actifs',
      value: displayStats.totalArtisans.toLocaleString(),
      icon: Briefcase,
      color: 'blue',
    },
    {
      label: 'Réservations',
      value: displayStats.totalBookings.toLocaleString(),
      icon: Calendar,
      color: 'green',
    },
    {
      label: 'Revenus (€)',
      value: (displayStats.totalRevenue / 100).toLocaleString('fr-FR'),
      icon: DollarSign,
      color: 'amber',
    },
  ]

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" role="status" aria-busy="true">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="sr-only">Chargement du tableau de bord...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" aria-label="Tableau de bord administration">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Tableau de bord</h1>
                <p className="text-sm text-gray-500">ServicesArtisans</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {displayStats.pendingReports > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                  <AlertTriangle className="w-4 h-4" />
                  {displayStats.pendingReports} signalements
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-gray-100 rounded-lg p-1 w-fit overflow-x-auto max-w-full">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
            { id: 'users', label: 'Utilisateurs', icon: Users },
            { id: 'reports', label: 'Signalements', icon: AlertTriangle },
            { id: 'reviews', label: 'Avis', icon: Star },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <ErrorBanner
            message={error}
            onDismiss={() => setError(null)}
            onRetry={fetchDashboardData}
          />
        )}

        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Activité du jour</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nouveaux utilisateurs</span>
                    <span className="font-semibold">{displayStats.newUsersToday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nouvelles réservations</span>
                    <span className="font-semibold">{displayStats.newBookingsToday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Utilisateurs actifs (7j)</span>
                    <span className="font-semibold">{displayStats.activeUsers7d}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <Star className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-gray-900">Qualité</h3>
                </div>
                <div className="text-center py-4">
                  <p className="text-4xl font-bold text-gray-900">{displayStats.averageRating}</p>
                  <p className="text-sm text-gray-500 mt-1">Note moyenne plateforme</p>
                  <div className="flex justify-center mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(displayStats.averageRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-gray-900">Modération</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Signalements en attente</span>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      displayStats.pendingReports > 0
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {displayStats.pendingReports}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Voir les signalements
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Activité récente</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {recentActivity.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucune activité récente</p>
                  </div>
                ) : recentActivity.map((activity) => (
                  <div key={activity.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'booking' ? 'bg-green-100 text-green-600' :
                      activity.type === 'review' ? 'bg-amber-100 text-amber-600' :
                      activity.type === 'report' ? 'bg-red-100 text-red-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {activity.type === 'booking' && <Calendar className="w-5 h-5" />}
                      {activity.type === 'review' && <Star className="w-5 h-5" />}
                      {activity.type === 'report' && <AlertTriangle className="w-5 h-5" />}
                      {activity.type === 'user' && <Users className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.details}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">{activity.timestamp}</p>
                      {activity.status && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          activity.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          activity.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {activity.status === 'confirmed' ? 'Confirmé' :
                           activity.status === 'pending' ? 'En attente' :
                           activity.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Signalements</h3>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                  <Filter className="w-4 h-4" />
                  Filtrer
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {pendingReports.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucun signalement en attente</p>
                </div>
              ) : pendingReports.map((report) => (
                <div key={report.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${
                        report.reason === 'spam' ? 'bg-amber-100 text-amber-600' :
                        report.reason === 'fake' ? 'bg-red-100 text-red-600' :
                        report.reason === 'inappropriate' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{report.targetType}</span>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            {report.reason}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          Signalé le {report.createdAt} par {report.reporter}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReportAction(report.id, 'resolve')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Résoudre"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleReportAction(report.id, 'dismiss')}
                        className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg"
                        title="Rejeter"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg" aria-label="Voir le détail du signalement">
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Gestion des utilisateurs</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    aria-label="Rechercher un utilisateur"
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="p-8 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Fonctionnalité de recherche utilisateurs</p>
              <p className="text-sm">Recherchez par nom, email ou ID</p>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Modération des avis</h3>
            </div>
            <div className="p-8 text-center text-gray-500">
              <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Avis en attente de modération</p>
              <p className="text-sm">Les avis signalés apparaîtront ici</p>
            </div>
          </div>
        )}
      </div>

      {/* Report Action Confirmation Modal */}
      <ConfirmationModal
        isOpen={reportActionModal.open}
        onClose={() => setReportActionModal({ open: false, reportId: '', action: 'resolve', label: '' })}
        onConfirm={confirmReportAction}
        title={reportActionModal.action === 'resolve' ? 'Résoudre le signalement' : 'Rejeter le signalement'}
        message={`Êtes-vous sûr de vouloir ${reportActionModal.label} ce signalement ?`}
        confirmText={reportActionModal.action === 'resolve' ? 'Résoudre' : 'Rejeter'}
        variant={reportActionModal.action === 'resolve' ? 'success' : 'warning'}
      />
    </div>
  )
}
