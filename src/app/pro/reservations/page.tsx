'use client'

import { useState } from 'react'
import {
  Calendar,
  List,
  Plus,
  CheckCircle2,
  Clock,
  Search,
} from 'lucide-react'
import { ReservationCalendar, ReservationList, Reservation } from '@/components/pro/ReservationCalendar'
import { addDays } from 'date-fns'

// Mock data
const mockReservations: Reservation[] = [
  {
    id: '1',
    clientName: 'Marc Petit',
    clientPhone: '06 12 34 56 78',
    service: 'Débouchage canalisation',
    date: new Date(),
    startTime: '09:00',
    endTime: '10:30',
    location: 'Paris 15ème',
    status: 'confirmed',
    notes: 'Accès par le code 1234',
  },
  {
    id: '2',
    clientName: 'Claire Moreau',
    clientPhone: '06 98 76 54 32',
    service: 'Réparation fuite',
    date: new Date(),
    startTime: '14:00',
    endTime: '15:00',
    location: 'Paris 11ème',
    status: 'pending',
  },
  {
    id: '3',
    clientName: 'Antoine Bernard',
    clientPhone: '06 55 44 33 22',
    service: 'Installation robinet',
    date: addDays(new Date(), 1),
    startTime: '10:00',
    endTime: '11:30',
    location: 'Boulogne',
    status: 'confirmed',
  },
  {
    id: '4',
    clientName: 'Sophie Lefebvre',
    clientPhone: '06 11 22 33 44',
    service: 'Devis rénovation SDB',
    date: addDays(new Date(), 1),
    startTime: '16:00',
    endTime: '17:00',
    location: 'Vincennes',
    status: 'confirmed',
  },
  {
    id: '5',
    clientName: 'Pierre Durand',
    clientPhone: '06 77 88 99 00',
    service: 'Réparation chauffe-eau',
    date: addDays(new Date(), 2),
    startTime: '09:30',
    endTime: '11:00',
    location: 'Paris 20ème',
    status: 'pending',
  },
  {
    id: '6',
    clientName: 'Marie Martin',
    clientPhone: '06 44 55 66 77',
    service: 'Détartrage',
    date: addDays(new Date(), 3),
    startTime: '14:00',
    endTime: '15:30',
    location: 'Montreuil',
    status: 'confirmed',
  },
  {
    id: '7',
    clientName: 'Jean Dupuis',
    clientPhone: '06 33 22 11 00',
    service: 'Installation douche',
    date: addDays(new Date(), -2),
    startTime: '10:00',
    endTime: '12:00',
    location: 'Paris 12ème',
    status: 'completed',
  },
  {
    id: '8',
    clientName: 'Isabelle Rousseau',
    clientPhone: '06 99 88 77 66',
    service: 'Dépannage urgent',
    date: addDays(new Date(), -1),
    startTime: '08:00',
    endTime: '09:00',
    location: 'Paris 5ème',
    status: 'completed',
  },
]

type ViewMode = 'calendar' | 'list'
type FilterStatus = 'all' | 'confirmed' | 'pending' | 'completed' | 'cancelled'

export default function ProReservationsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [_selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)

  // Filter reservations
  const filteredReservations = mockReservations.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        r.clientName.toLowerCase().includes(query) ||
        r.service.toLowerCase().includes(query) ||
        r.location.toLowerCase().includes(query)
      )
    }
    return true
  })

  // Stats
  const stats = {
    total: mockReservations.length,
    confirmed: mockReservations.filter((r) => r.status === 'confirmed').length,
    pending: mockReservations.filter((r) => r.status === 'pending').length,
    completed: mockReservations.filter((r) => r.status === 'completed').length,
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Réservations</h1>
          <p className="text-slate-500">
            Gérez votre agenda et vos rendez-vous clients
          </p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-colors">
          <Plus className="w-5 h-5" />
          Nouveau RDV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, icon: Calendar, color: 'blue' },
          { label: 'Confirmés', value: stats.confirmed, icon: CheckCircle2, color: 'green' },
          { label: 'En attente', value: stats.pending, icon: Clock, color: 'yellow' },
          { label: 'Terminés', value: stats.completed, icon: CheckCircle2, color: 'slate' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4"
          >
            <div className={`w-10 h-10 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un client, service..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* View Toggle */}
          <div className="flex bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Calendrier
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
              Liste
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="px-4 py-3 bg-slate-50 rounded-xl font-medium text-slate-600 cursor-pointer focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="confirmed">Confirmés</option>
            <option value="pending">En attente</option>
            <option value="completed">Terminés</option>
            <option value="cancelled">Annulés</option>
          </select>
        </div>
      </div>

      {/* Calendar or List View */}
      {viewMode === 'calendar' ? (
        <ReservationCalendar
          reservations={filteredReservations}
          onReservationClick={setSelectedReservation}
        />
      ) : (
        <ReservationList
          reservations={filteredReservations}
          onReservationClick={setSelectedReservation}
        />
      )}

      {/* Reservation Detail Modal would go here */}
    </div>
  )
}
