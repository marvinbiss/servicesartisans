'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  MapPin,
  Euro,
  Calendar,
  Clock,
  FileText,
  History,
  MessageSquare,
  Shield,
} from 'lucide-react'
import ClientSidebar from '@/components/client/ClientSidebar'
import { EventTimeline } from '@/components/dashboard/EventTimeline'
import { URGENCY_META } from '@/types/leads'
import type { LeadEventType } from '@/types/leads'

interface LeadDetail {
  id: string
  service_name: string
  city: string | null
  postal_code: string | null
  description: string
  budget: string | null
  urgency: string
  status: string
  client_name: string
  client_email: string | null
  client_phone: string
  created_at: string
}

interface ClientEvent {
  id: string
  event_type: LeadEventType
  label: string
  metadata: Record<string, unknown>
  created_at: string
}

export default function LeadDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [lead, setLead] = useState<LeadDetail | null>(null)
  const [events, setEvents] = useState<ClientEvent[]>([])
  const [quotesCount, setQuotesCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)
      const res = await fetch(`/api/client/leads/${id}`)
      const data = await res.json()

      if (res.ok) {
        setLead(data.lead)
        setEvents(data.events || [])
        setQuotesCount(data.quotesCount || 0)
      } else if (res.status === 401) {
        window.location.href = '/connexion?redirect=/espace-client/mes-demandes'
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
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
          <p className="text-sm text-gray-500 mt-2">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error && !lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-red-200 p-8 max-w-md text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">{error}</p>
          <Link href="/espace-client/mes-demandes" className="text-primary-600 hover:underline text-sm mt-4 block">
            Retour à mes demandes
          </Link>
        </div>
      </div>
    )
  }

  if (!lead) return null

  const urg = URGENCY_META[lead.urgency] || URGENCY_META.normal

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/espace-client" className="hover:text-gray-900">Espace Client</Link>
            <span>/</span>
            <Link href="/espace-client/mes-demandes" className="hover:text-gray-900">Mes demandes</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Détail</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <ClientSidebar activePage="mes-demandes" />

          {/* Main content */}
          <div className="lg:col-span-3">
            <Link
              href="/espace-client/mes-demandes"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à mes demandes
            </Link>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Lead details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Lead header card */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl font-bold text-gray-900">{lead.service_name}</h1>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${urg.cls}`}>
                        {urg.label}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-gray-700 leading-relaxed mb-6">{lead.description}</p>

                    {lead.budget && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 p-3 bg-green-50 rounded-lg border border-green-100">
                        <Euro className="w-4 h-4 text-green-600" />
                        <span><strong>Budget indicatif :</strong> {lead.budget}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-400">Créée le</p>
                          <p className="text-sm text-gray-700">
                            {new Date(lead.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      {lead.city && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-400">Localisation</p>
                            <p className="text-sm text-gray-700">
                              {lead.city} {lead.postal_code && `(${lead.postal_code})`}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quotes info */}
                {quotesCount > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gray-400" />
                      Devis reçus
                    </h2>
                    <p className="text-sm text-gray-600">
                      Vous avez reçu <strong>{quotesCount}</strong> devis pour cette demande.
                      Consultez la timeline ci-contre pour voir les montants proposés.
                    </p>
                  </div>
                )}

                {/* Contact CTA */}
                <div className="bg-primary-50 rounded-xl border border-primary-100 p-6">
                  <h2 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary-500" />
                    Besoin d&apos;aide ?
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Si vous avez des questions sur cette demande, contactez-nous via la messagerie.
                  </p>
                  <Link
                    href="/espace-client/messages"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Ouvrir la messagerie
                  </Link>
                </div>
              </div>

              {/* Right sidebar: Timeline + info */}
              <div className="space-y-6">
                {/* Event timeline */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <History className="w-5 h-5 text-gray-400" />
                    Suivi de la demande
                  </h3>
                  <EventTimeline events={events} compact />
                </div>

                {/* Info card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-400" />
                    Informations
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Référence</span>
                      <span className="text-gray-700 font-mono text-xs">{id.slice(0, 8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Urgence</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${urg.cls}`}>
                        {urg.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Événements</span>
                      <span className="text-gray-700">{events.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Devis</span>
                      <span className="text-gray-700">{quotesCount}</span>
                    </div>
                  </div>
                </div>

                {/* Read-only notice */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Le suivi est mis à jour automatiquement. Les artisans répondent
                      généralement sous 24–48h.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
