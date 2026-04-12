'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ArtisanSidebar from '@/components/artisan-dashboard/ArtisanSidebar'
import {
  Users,
  Plus,
  X,
  Mail,
  Phone,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Trash2,
  Edit2,
} from 'lucide-react'
import { useFocusTrap } from '@/lib/hooks/use-focus-trap'
import { logger } from '@/lib/logger'

interface TeamMember {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  color: string
  avatar_url?: string
  is_active: boolean
  created_at: string
}

const COLORS = [
  { name: 'Bleu', value: '#3b82f6' },
  { name: 'Vert', value: '#22c55e' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Rose', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
]

export default function EquipePage() {
  const router = useRouter()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const equipeModalRef = useRef<HTMLDivElement>(null)
  useFocusTrap(equipeModalRef, showAddModal, () => {
    setShowAddModal(false)
    setEditingMember(null)
  })

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    color: COLORS[0].value,
  })
  const [consentRgpd, setConsentRgpd] = useState(false)

  // Fetch team members via API route
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/artisan/equipe')

        if (res.status === 401) {
          router.push('/connexion')
          return
        }

        if (res.status === 403) {
          router.push('/espace-artisan')
          return
        }

        if (!res.ok) {
          setError("Impossible de charger l'équipe")
          setIsLoading(false)
          return
        }

        const data = await res.json()
        setMembers(data.members ?? [])
      } catch (err) {
        logger.error('Error fetching team', err)
        setError("Impossible de charger l'équipe")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  // Add or update team member
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingMember && !consentRgpd) {
      setError(
        'Veuillez confirmer avoir informé cette personne conformément à la politique de confidentialité.'
      )
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      if (editingMember) {
        // Update existing member
        const res = await fetch(`/api/artisan/equipe/${editingMember.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone || undefined,
            role: formData.role,
            color: formData.color,
          }),
        })

        if (!res.ok) {
          const body = await res.json()
          throw new Error(body.error ?? 'Erreur lors de la mise à jour')
        }

        setMembers(members.map((m) => (m.id === editingMember.id ? { ...m, ...formData } : m)))
      } else {
        // Add new member
        const res = await fetch('/api/artisan/equipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone || undefined,
            role: formData.role,
            color: formData.color,
          }),
        })

        if (!res.ok) {
          const body = await res.json()
          throw new Error(body.error ?? "Erreur lors de l'ajout")
        }

        const body = await res.json()
        setMembers([...members, body.member])
      }

      setShowAddModal(false)
      setEditingMember(null)
      setConsentRgpd(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: '',
        color: COLORS[0].value,
      })
    } catch (err) {
      logger.error('Error saving member', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete team member
  const handleDelete = async (memberId: string) => {
    if (!confirm("Supprimer ce membre de l'équipe ?")) return

    try {
      const res = await fetch(`/api/artisan/equipe/${memberId}`, {
        method: 'DELETE',
      })

      if (!res.ok && res.status !== 204) {
        const body = await res.json()
        throw new Error(body.error ?? 'Erreur lors de la suppression')
      }

      setMembers(members.filter((m) => m.id !== memberId))
    } catch (err) {
      logger.error('Error deleting member', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    }
  }

  // Toggle member active status
  const toggleActive = async (member: TeamMember) => {
    try {
      const res = await fetch(`/api/artisan/equipe/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: member.name,
          email: member.email,
          phone: member.phone,
          role: member.role,
          color: member.color,
          is_active: !member.is_active,
        }),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Erreur lors de la mise à jour')
      }

      setMembers(members.map((m) => (m.id === member.id ? { ...m, is_active: !m.is_active } : m)))
    } catch (err) {
      logger.error('Error toggling member', err)
      setError('Impossible de modifier le statut du membre. Veuillez réessayer.')
    }
  }

  // Open edit modal
  const openEditModal = (member: TeamMember) => {
    setEditingMember(member)
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      role: member.role,
      color: member.color,
    })
    setShowAddModal(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            <ArtisanSidebar activePage="equipe" />
            <div className="lg:col-span-3 flex items-center justify-center min-h-[50vh]">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <Link href="/espace-artisan/dashboard" className="p-2 hover:bg-white/10 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Gestion de l'équipe</h1>
              <p className="text-primary-100">
                Gérez les membres de votre équipe et leurs créneaux
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <ArtisanSidebar activePage="equipe" />
          <div className="lg:col-span-3">
            {/* Error message */}
            {error && (
              <div
                role="alert"
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
              >
                <AlertCircle
                  className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Add member button */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold text-charcoal-900">
                  Membres de l'équipe ({members.length})
                </h2>
                <p className="text-sm text-charcoal-500">
                  Ajoutez des membres pour leur assigner des créneaux
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingMember(null)
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    role: '',
                    color: COLORS[0].value,
                  })
                  setShowAddModal(true)
                }}
                className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
              >
                <Plus className="w-4 h-4" />
                Ajouter un membre
              </button>
            </div>

            {/* Team members grid */}
            {members.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Users className="w-12 h-12 text-sand-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-charcoal-900 mb-2">
                  Aucun membre dans l'équipe
                </h3>
                <p className="text-charcoal-500 mb-6">
                  Ajoutez des membres pour leur assigner des créneaux de disponibilité
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter le premier membre
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${
                      member.is_active ? '' : 'opacity-60'
                    }`}
                    style={{ borderLeftColor: member.color }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                          style={{ backgroundColor: member.color }}
                        >
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-charcoal-900">{member.name}</h3>
                          <p className="text-sm text-charcoal-500">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(member)}
                          className="p-2 text-charcoal-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg"
                          aria-label={`Modifier ${member.name}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="p-2 text-charcoal-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          aria-label={`Supprimer ${member.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-charcoal-600">
                        <Mail className="w-4 h-4" />
                        <span>{member.email}</span>
                      </div>
                      {member.phone && (
                        <div className="flex items-center gap-2 text-charcoal-600">
                          <Phone className="w-4 h-4" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <span
                        className={`text-sm ${member.is_active ? 'text-green-600' : 'text-charcoal-400'}`}
                      >
                        {member.is_active ? 'Actif' : 'Inactif'}
                      </span>
                      <button
                        onClick={() => toggleActive(member)}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          member.is_active
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {member.is_active ? 'Désactiver' : 'Activer'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Info box */}
            <div className="mt-8 p-4 bg-primary-50 rounded-lg">
              <h4 className="font-medium text-primary-800 mb-2">Comment ça fonctionne ?</h4>
              <ul className="text-sm text-primary-600 space-y-1">
                <li>1. Ajoutez les membres de votre équipe avec leur nom et rôle</li>
                <li>2. Définissez leur rôle (employé ou apprenti)</li>
                <li>3. Gérez votre équipe depuis cette page</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            ref={equipeModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="equipe-modal-title"
            className="bg-white rounded-xl max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h3 id="equipe-modal-title" className="text-lg font-semibold text-charcoal-900">
                {editingMember ? 'Modifier le membre' : 'Ajouter un membre'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingMember(null)
                }}
                className="p-2 hover:bg-sand-100 rounded-lg"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label
                  htmlFor="equipe-name"
                  className="block text-sm font-medium text-charcoal-700 mb-1"
                >
                  Nom complet *
                </label>
                <input
                  id="equipe-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-sand-400 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="equipe-email"
                  className="block text-sm font-medium text-charcoal-700 mb-1"
                >
                  Email *
                </label>
                <input
                  id="equipe-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-sand-400 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="equipe-phone"
                  className="block text-sm font-medium text-charcoal-700 mb-1"
                >
                  Téléphone
                </label>
                <input
                  id="equipe-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-sand-400 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="equipe-role"
                  className="block text-sm font-medium text-charcoal-700 mb-1"
                >
                  Rôle / Spécialité *
                </label>
                <input
                  id="equipe-role"
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Ex: Coiffeur senior, Apprenti..."
                  className="w-full border border-sand-400 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Couleur dans le calendrier
                </label>
                <div className="flex gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color.value
                          ? 'border-charcoal-900 scale-110'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                      aria-label={`Couleur ${color.name}${formData.color === color.value ? ' (sélectionnée)' : ''}`}
                    />
                  ))}
                </div>
              </div>

              {!editingMember && (
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentRgpd}
                    onChange={(e) => setConsentRgpd(e.target.checked)}
                    className="mt-0.5 w-5 h-5 rounded border-sand-400 text-primary-500 focus:ring-primary-400 flex-shrink-0"
                  />
                  <span className="text-sm text-charcoal-600 leading-relaxed">
                    Je confirme avoir informé cette personne conformément à la{' '}
                    <Link
                      href="/confidentialite"
                      className="text-primary-500 underline hover:text-primary-800"
                    >
                      politique de confidentialité
                    </Link>
                  </span>
                </label>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingMember(null)
                  }}
                  className="flex-1 border border-sand-400 text-charcoal-700 px-4 py-3 rounded-lg font-medium hover:bg-sand-50"
                  disabled={isSaving}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-primary-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingMember ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
