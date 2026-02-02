'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Shield,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react'
import { ConfirmationModal } from '@/components/admin/ConfirmationModal'
import type { AdminRole, AdminUser } from '@/types/admin'

const ROLE_LABELS: Record<AdminRole, { label: string; color: string }> = {
  super_admin: { label: 'Super Admin', color: 'bg-red-100 text-red-700' },
  admin: { label: 'Admin', color: 'bg-blue-100 text-blue-700' },
  moderator: { label: 'Modérateur', color: 'bg-green-100 text-green-700' },
  viewer: { label: 'Lecteur', color: 'bg-gray-100 text-gray-700' },
}

export default function AdminsManagementPage() {
  const router = useRouter()
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Modal states
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; adminId: string; adminEmail: string }>({
    open: false,
    adminId: '',
    adminEmail: '',
  })
  const [addModal, setAddModal] = useState(false)
  const [newAdmin, setNewAdmin] = useState({ email: '', role: 'admin' as AdminRole })
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetchAdmins()
  }, [page])

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/admins?page=${page}&limit=20`)
      if (response.ok) {
        const data = await response.json()
        setAdmins(data.admins || [])
        setTotalPages(data.totalPages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch admins:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAdmin = async () => {
    try {
      setAdding(true)
      const response = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmin),
      })
      if (response.ok) {
        setAddModal(false)
        setNewAdmin({ email: '', role: 'admin' })
        fetchAdmins()
      }
    } catch (error) {
      console.error('Failed to add admin:', error)
    } finally {
      setAdding(false)
    }
  }

  const handleDeleteAdmin = async () => {
    try {
      await fetch(`/api/admin/admins/${deleteModal.adminId}`, {
        method: 'DELETE',
      })
      setDeleteModal({ open: false, adminId: '', adminEmail: '' })
      fetchAdmins()
    } catch (error) {
      console.error('Failed to delete admin:', error)
    }
  }

  const handleRoleChange = async (adminId: string, newRole: AdminRole) => {
    try {
      await fetch(`/api/admin/admins/${adminId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      fetchAdmins()
    } catch (error) {
      console.error('Failed to update role:', error)
    }
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => router.push('/admin/parametres')}
              className="text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1 text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour aux paramètres
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Administrateurs</h1>
            <p className="text-gray-500 mt-1">Gérer les rôles et permissions des administrateurs</p>
          </div>
          <button
            onClick={() => setAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Ajouter un admin
          </button>
        </div>

        {/* Role Legend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Niveaux de permissions</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(ROLE_LABELS).map(([role, { label, color }]) => (
              <div key={role} className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>
                  {label}
                </span>
                <span className="text-xs text-gray-500">
                  {role === 'super_admin' && '(Accès total)'}
                  {role === 'admin' && '(CRUD limité)'}
                  {role === 'moderator' && '(Modération)'}
                  {role === 'viewer' && '(Lecture seule)'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Admins List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : admins.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun administrateur trouvé</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Rôle
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Ajouté le
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {admins.map((admin) => (
                      <tr key={admin.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{admin.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={admin.role}
                            onChange={(e) => handleRoleChange(admin.id, e.target.value as AdminRole)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 ${ROLE_LABELS[admin.role].color}`}
                          >
                            {Object.entries(ROLE_LABELS).map(([role, { label }]) => (
                              <option key={role} value={role}>{label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(admin.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setDeleteModal({
                                open: true,
                                adminId: admin.id,
                                adminEmail: admin.email,
                              })}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              title="Supprimer"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
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
                  Page {page} sur {totalPages}
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

      {/* Add Admin Modal */}
      {addModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajouter un administrateur</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  placeholder="admin@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <select
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value as AdminRole })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(ROLE_LABELS).map(([role, { label }]) => (
                    <option key={role} value={role}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setAddModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={handleAddAdmin}
                disabled={adding || !newAdmin.email}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {adding ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, adminId: '', adminEmail: '' })}
        onConfirm={handleDeleteAdmin}
        title="Supprimer l'administrateur"
        message={`Êtes-vous sûr de vouloir retirer les droits d'administration de ${deleteModal.adminEmail} ?`}
        confirmText="Supprimer"
        variant="danger"
      />
    </div>
  )
}
