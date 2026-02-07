'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  Clock,
  MapPin,
  Phone,
  Mail,
  FileText,
  Eye,
  Send,
  X,
  History,
} from 'lucide-react'

interface LeadData {
  id: string
  service_name: string
  city: string | null
  postal_code: string | null
  description: string
  budget: string | null
  urgency: string
  client_name: string
  client_email: string | null
  client_phone: string
  created_at: string
  status: string
}

interface Assignment {
  id: string
  status: string
  assigned_at: string
  viewed_at: string | null
  lead: LeadData
}

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [quoteAmount, setQuoteAmount] = useState('')
  const [quoteDesc, setQuoteDesc] = useState('')

  const fetchLead = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch(`/api/artisan/leads/${id}`)
      const data = await res.json()
      if (res.ok) {
        setAssignment(data.assignment)
      } else if (res.status === 401) {
        window.location.href = '/connexion?redirect=/espace-artisan/leads'
        return
      } else {
        setError(data.error || 'Erreur')
      }
    } catch {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchLead()
  }, [fetchLead])

  // Auto-mark as viewed on first load
  useEffect(() => {
    if (assignment && assignment.status === 'pending') {
      fetch(`/api/artisan/leads/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'view' }),
      }).then(() => {
        setAssignment((prev) =>
          prev ? { ...prev, status: 'viewed', viewed_at: new Date().toISOString() } : prev
        )
      })
    }
  }, [assignment?.status, id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAction = async (action: string, extraData?: Record<string, unknown>) => {
    setActionLoading(action)
    try {
      const res = await fetch(`/api/artisan/leads/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extraData }),
      })
      if (res.ok) {
        router.push('/espace-artisan/leads')
      } else {
        const data = await res.json()
        setError(data.error || 'Erreur')
      }
    } catch {
      setError('Erreur de connexion')
    } finally {
      setActionLoading(null)
    }
  }

  const handleQuoteSubmit = () => {
    const amount = parseFloat(quoteAmount)
    if (isNaN(amount) || amount <= 0) {
      setError('Montant invalide')
      return
    }
    handleAction('quote', { amount, description: quoteDesc })
  }

  const urgencyLabel = (u: string) => {
    if (u === 'urgent') return { text: 'Urgent', cls: 'bg-red-100 text-red-700' }
    if (u === 'tres_urgent') return { text: 'Très urgent', cls: 'bg-red-200 text-red-800' }
    return { text: 'Normal', cls: 'bg-gray-100 text-gray-700' }
  }

  const statusLabel = (s: string) => {
    if (s === 'pending') return { text: 'Nouveau', cls: 'bg-blue-100 text-blue-700' }
    if (s === 'viewed') return { text: 'Vu', cls: 'bg-yellow-100 text-yellow-700' }
    if (s === 'quoted') return { text: 'Devis envoyé', cls: 'bg-green-100 text-green-700' }
    if (s === 'declined') return { text: 'Décliné', cls: 'bg-gray-100 text-gray-600' }
    return { text: s, cls: 'bg-gray-100 text-gray-700' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error && !assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <AlertCircle className="w-6 h-6 text-red-500 mb-2" />
          <p className="text-red-700">{error}</p>
          <Link href="/espace-artisan/leads" className="text-blue-600 hover:underline text-sm mt-4 block">
            Retour aux leads
          </Link>
        </div>
      </div>
    )
  }

  if (!assignment) return null
  const lead = assignment.lead
  const urg = urgencyLabel(lead.urgency)
  const st = statusLabel(assignment.status)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-3 text-sm text-gray-500">
          <Link href="/espace-artisan" className="hover:text-gray-900">Espace Artisan</Link>
          <span className="mx-2">/</span>
          <Link href="/espace-artisan/leads" className="hover:text-gray-900">Leads</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Détail</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/espace-artisan/leads"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Lead header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <h1 className="text-xl font-bold text-gray-900">{lead.service_name}</h1>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${urg.cls}`}>
              {urg.text}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>
              {st.text}
            </span>
          </div>

          <p className="text-gray-700 mb-6">{lead.description}</p>

          {lead.budget && (
            <p className="text-sm text-gray-500 mb-4">
              <strong>Budget indicatif :</strong> {lead.budget}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>Reçu le {new Date(lead.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}</span>
            </div>
            {lead.city && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{lead.city} {lead.postal_code && `(${lead.postal_code})`}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{lead.client_name} — {lead.client_phone}</span>
            </div>
            {lead.client_email && (
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{lead.client_email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {assignment.status !== 'quoted' && assignment.status !== 'declined' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">Actions</h2>

            {showQuoteForm ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Montant du devis (€)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={quoteAmount}
                    onChange={(e) => setQuoteAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    placeholder="ex: 350.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description du devis
                  </label>
                  <textarea
                    value={quoteDesc}
                    onChange={(e) => setQuoteDesc(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    placeholder="Détails de l'intervention..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleQuoteSubmit}
                    disabled={actionLoading === 'quote'}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {actionLoading === 'quote' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Envoyer le devis
                  </button>
                  <button
                    onClick={() => setShowQuoteForm(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {assignment.status === 'pending' && (
                  <button
                    onClick={() => handleAction('view')}
                    disabled={!!actionLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg text-sm font-medium hover:bg-yellow-100 disabled:opacity-50"
                  >
                    <Eye className="w-4 h-4" />
                    Marquer comme vu
                  </button>
                )}
                <button
                  onClick={() => setShowQuoteForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  <FileText className="w-4 h-4" />
                  Envoyer un devis
                </button>
                <button
                  onClick={() => handleAction('decline')}
                  disabled={!!actionLoading}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  {actionLoading === 'decline' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  Décliner
                </button>
              </div>
            )}
          </div>
        )}

        {/* History link */}
        <Link
          href={`/espace-artisan/leads/${id}/historique`}
          className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
        >
          <History className="w-4 h-4" />
          Voir l'historique complet
        </Link>
      </div>
    </div>
  )
}
