'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Eye,
  Ban,
  CheckCircle,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  User,
  Shield,
} from 'lucide-react'
import { SubscriptionBadge, UserStatusBadge } from '@/components/admin/StatusBadge'
import { ConfirmationModal } from '@/components/admin/ConfirmationModal'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  user_type: 'client' | 'artisan'
  is_verified: boolean
  is_banned: boolean
  subscription_plan: 'gratuit' | 'pro' | 'premium'
  subscription_status: string | null
  created_at: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'clients' | 'artisans' | 'banned'>('all')
  const [plan, setPlan] = useState<'all' | 'gratuit' | 'pro' | 'premium'>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Modal state
  const [banModal, setBanModal] = useState<{ open: boolean; userId: string; userName: string; isBanned: boolean }>({
    open: false,
    userId: '',
    userName: '',
    isBanned: false,
  })
  const [banReason, setBanReason] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [page, filter, plan, search])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        filter,
        plan,
        search,
      })
      const response = await fetch(`/api/admin/users?${params}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
        setTotalPages(data.totalPages || 1)
        setTotal(data.total || 0)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBanAction = async () => {
    try {
      const action = banModal.isBanned ? 'unban' : 'ban'
      await fetch(`/api/admin/users/${banModal.userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason: banReason }),
      })
      setBanModal({ open: false, userId: '', userName: '', isBanned: false })
      setBanReason('')
      fetchUsers()
    } catch (error) {
      console.error('Ban action failed:', error)
    }
  }

  const getUserStatus = (user: UserProfile): string => {
    if (user.is_banned) return 'banned'
    if (!user.is_verified) return 'pending'
    return 'active'
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
            <p className="text-gray-500 mt-1">{total} utilisateurs au total</p>
          </div>
          <button
            onClick={() => router.push('/admin/utilisateurs/nouveau')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Nouvel utilisateur
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email, téléphone..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Type filter */}
            <div className="flex gap-2">
              {(['all', 'clients', 'artisans', 'banned'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFilter(f)
                    setPage(1)
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f === 'all' ? 'Tous' :
                   f === 'clients' ? 'Clients' :
                   f === 'artisans' ? 'Artisans' : 'Bannis'}
                </button>
              ))}
            </div>

            {/* Plan filter */}
            <select
              value={plan}
              onChange={(e) => {
                setPlan(e.target.value as typeof plan)
                setPage(1)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les plans</option>
              <option value="gratuit">Gratuit</option>
              <option value="pro">Pro</option>
              <option value="premium">Premium</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Inscription
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.full_name || 'Sans nom'}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                <Phone className="w-3 h-3" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {user.user_type === 'artisan' ? (
                              <Shield className="w-4 h-4 text-blue-500" />
                            ) : (
                              <User className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="capitalize">{user.user_type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <UserStatusBadge status={getUserStatus(user)} />
                        </td>
                        <td className="px-6 py-4">
                          <SubscriptionBadge plan={user.subscription_plan} />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => router.push(`/admin/utilisateurs/${user.id}`)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Voir le profil"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            {user.is_banned ? (
                              <button
                                onClick={() => setBanModal({
                                  open: true,
                                  userId: user.id,
                                  userName: user.full_name || user.email,
                                  isBanned: true,
                                })}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                                title="Débannir"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => setBanModal({
                                  open: true,
                                  userId: user.id,
                                  userName: user.full_name || user.email,
                                  isBanned: false,
                                })}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                title="Bannir"
                              >
                                <Ban className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Page {page} sur {totalPages} ({total} résultats)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Ban Modal */}
      <ConfirmationModal
        isOpen={banModal.open}
        onClose={() => {
          setBanModal({ open: false, userId: '', userName: '', isBanned: false })
          setBanReason('')
        }}
        onConfirm={handleBanAction}
        title={banModal.isBanned ? 'Débannir utilisateur' : 'Bannir utilisateur'}
        message={
          banModal.isBanned
            ? `Êtes-vous sûr de vouloir débannir ${banModal.userName} ?`
            : `Êtes-vous sûr de vouloir bannir ${banModal.userName} ? L'utilisateur ne pourra plus accéder à la plateforme.`
        }
        confirmText={banModal.isBanned ? 'Débannir' : 'Bannir'}
        variant={banModal.isBanned ? 'success' : 'danger'}
      />
    </div>
  )
}
