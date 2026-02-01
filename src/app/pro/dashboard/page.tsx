'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Calendar,
  Euro,
  TrendingUp,
  Star,
  Clock,
  ArrowRight,
  Bell,
  CheckCircle2,
  AlertCircle,
  Zap,
  Eye,
  MessageSquare,
} from 'lucide-react'
import Link from 'next/link'
import { StatsCard, StatsCardMini } from '@/components/pro/StatsCard'
import { LeadCard, Lead } from '@/components/pro/LeadCard'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

// Mock data
const mockStats = {
  newLeads: 12,
  leadsTrend: 25,
  reservations: 8,
  reservationsTrend: 15,
  revenue: 2450,
  revenueTrend: 32,
  conversionRate: 67,
  conversionTrend: 5,
  profileViews: 342,
  viewsTrend: 18,
  avgRating: 4.8,
  reviewCount: 47,
}

const mockLeads: Lead[] = [
  {
    id: '1',
    clientName: 'Marie Martin',
    clientEmail: 'marie.martin@email.com',
    clientPhone: '06 12 34 56 78',
    service: 'Rénovation salle de bain',
    description: 'Je souhaite rénover complètement ma salle de bain de 8m². Remplacement baignoire par douche italienne, nouveau carrelage et meuble vasque.',
    location: 'Paris 15ème',
    budget: '5000€ - 8000€',
    urgency: 'normal',
    status: 'new',
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    preferredDate: 'Semaine prochaine',
    preferredTime: 'Matin',
  },
  {
    id: '2',
    clientName: 'Pierre Durand',
    clientEmail: 'p.durand@email.com',
    clientPhone: '06 98 76 54 32',
    service: 'Fuite robinet cuisine',
    description: 'Fuite importante sous l\'évier de la cuisine. Le robinet goutte constamment.',
    location: 'Paris 11ème',
    budget: '100€ - 200€',
    urgency: 'urgent',
    status: 'new',
    createdAt: new Date(Date.now() - 1000 * 60 * 10), // 10 min ago
  },
  {
    id: '3',
    clientName: 'Sophie Lefebvre',
    clientEmail: 'sophie.l@email.com',
    clientPhone: '06 55 44 33 22',
    service: 'Installation chauffe-eau',
    description: 'Remplacement ancien chauffe-eau par un modèle thermodynamique 200L.',
    location: 'Boulogne-Billancourt',
    budget: '1500€ - 2500€',
    urgency: 'flexible',
    status: 'contacted',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    preferredDate: 'Ce mois-ci',
  },
]

const mockReservations = [
  {
    id: '1',
    client: 'Marc Petit',
    service: 'Débouchage canalisation',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24), // Tomorrow
    time: '09:00',
    status: 'confirmed',
  },
  {
    id: '2',
    client: 'Claire Moreau',
    service: 'Réparation fuite',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // In 2 days
    time: '14:30',
    status: 'confirmed',
  },
  {
    id: '3',
    client: 'Antoine Bernard',
    service: 'Devis rénovation',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // In 3 days
    time: '10:00',
    status: 'pending',
  },
]

export default function ProDashboardPage() {
  const [leads, setLeads] = useState(mockLeads)
  const today = new Date()

  const handleAcceptLead = (id: string) => {
    setLeads(leads.map(l => l.id === id ? { ...l, status: 'accepted' as const } : l))
  }

  const handleRejectLead = (id: string) => {
    setLeads(leads.map(l => l.id === id ? { ...l, status: 'rejected' as const } : l))
  }

  const handleContactLead = (id: string) => {
    setLeads(leads.map(l => l.id === id ? { ...l, status: 'contacted' as const } : l))
  }

  const newLeadsCount = leads.filter(l => l.status === 'new').length

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Bonjour, Jean 👋
          </h1>
          <p className="text-slate-500">
            {format(today, 'EEEE d MMMM yyyy', { locale: fr })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <Bell className="w-6 h-6 text-slate-500" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>

      {/* Alert Banner for new leads */}
      {newLeadsCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl text-white flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold">
                {newLeadsCount} nouvelle{newLeadsCount > 1 ? 's' : ''} demande{newLeadsCount > 1 ? 's' : ''} !
              </div>
              <div className="text-sm text-blue-100">
                Répondez rapidement pour maximiser vos chances
              </div>
            </div>
          </div>
          <Link
            href="/pro/leads"
            className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
          >
            Voir les leads
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Nouveaux leads"
          value={mockStats.newLeads}
          subtitle="Ce mois"
          icon={Users}
          trend={{ value: mockStats.leadsTrend, label: 'vs mois dernier' }}
          color="blue"
        />
        <StatsCard
          title="Réservations"
          value={mockStats.reservations}
          subtitle="À venir"
          icon={Calendar}
          trend={{ value: mockStats.reservationsTrend, label: 'vs mois dernier' }}
          color="green"
        />
        <StatsCard
          title="Chiffre d'affaires"
          value={`${mockStats.revenue}€`}
          subtitle="Ce mois"
          icon={Euro}
          trend={{ value: mockStats.revenueTrend, label: 'vs mois dernier' }}
          color="purple"
        />
        <StatsCard
          title="Taux de conversion"
          value={`${mockStats.conversionRate}%`}
          subtitle="Leads → Clients"
          icon={TrendingUp}
          trend={{ value: mockStats.conversionTrend, label: 'vs mois dernier' }}
          color="orange"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Leads */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Leads */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">Dernières demandes</h2>
                  <p className="text-sm text-slate-500">
                    {newLeadsCount} en attente de réponse
                  </p>
                </div>
              </div>
              <Link
                href="/pro/leads"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                Tout voir
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-5 space-y-4">
              {leads.slice(0, 3).map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onAccept={handleAcceptLead}
                  onReject={handleRejectLead}
                  onContact={handleContactLead}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Performances</h3>
            <div className="space-y-3">
              <StatsCardMini
                title="Vues du profil"
                value={mockStats.profileViews}
                icon={Eye}
                color="blue"
              />
              <StatsCardMini
                title="Note moyenne"
                value={mockStats.avgRating}
                icon={Star}
                color="orange"
              />
              <StatsCardMini
                title="Avis clients"
                value={mockStats.reviewCount}
                icon={MessageSquare}
                color="green"
              />
            </div>
          </div>

          {/* Upcoming Reservations */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">Prochains RDV</h3>
              <Link
                href="/pro/reservations"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Voir tout
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {mockReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex flex-col items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">
                      {format(reservation.date, 'MMM', { locale: fr }).toUpperCase()}
                    </span>
                    <span className="text-lg font-bold text-blue-700">
                      {format(reservation.date, 'd')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 truncate">
                      {reservation.client}
                    </div>
                    <div className="text-sm text-slate-500 truncate">
                      {reservation.service}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-900">
                      {reservation.time}
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {reservation.status === 'confirmed' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          <span className="text-green-600">Confirmé</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-orange-500" />
                          <span className="text-orange-600">En attente</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <span className="font-semibold">Conseil du jour</span>
            </div>
            <p className="text-sm text-slate-300 mb-4">
              Répondez aux demandes dans l'heure pour augmenter vos chances de
              conversion de 40%.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400">
                Temps de réponse moyen : 45min
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
