'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  XCircle,
  Clock,
  User,
  Briefcase,
} from 'lucide-react'
import { BookingStatusBadge, PaymentStatusBadge } from '@/components/admin/StatusBadge'
import { ConfirmationModal } from '@/components/admin/ConfirmationModal'

interface Booking {
  id: string
  artisan_id: string
  client_email: string
  service: string
  booking_date: string
  time_slot: string
  status: string
  payment_status: string
  deposit_amount: number | null
  created_at: string
  profiles?: {
    id: string
    full_name: string | null
    email: string
    company_name: string | null
  }
}

export default function AdminReservationsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [cancelModal, setCancelModal] = useState<{ open: boolean; bookingId: string }>({
    open: false,
    bookingId: '',
  })

  useEffect(() => {
    fetchBookings()
  }, [page, status, search])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        status,
        search,
      })
      const response = await fetch(`/api/admin/bookings?${params}`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
        setTotalPages(data.totalPages || 1)
        setTotal(data.total || 0)
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    try {
      await fetch(`/api/admin/bookings/${cancelModal.bookingId}`, {
        method: 'DELETE',
      })
      setCancelModal({ open: false, bookingId: '' })
      fetchBookings()
    } catch (error) {
      console.error('Cancel failed:', error)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatAmount = (amount: number | null) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount / 100)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Réservations</h1>
          <p className="text-gray-500 mt-1">{total} réservations au total</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par email, service..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatus(s)
                    setPage(1)
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    status === s
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s === 'all' ? 'Tous' :
                   s === 'pending' ? 'En attente' :
                   s === 'confirmed' ? 'Confirmés' :
                   s === 'completed' ? 'Terminés' : 'Annulés'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune réservation trouvée</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Date & Heure
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Client
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Artisan
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Service
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Statut
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Paiement
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {formatDate(booking.booking_date)}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {booking.time_slot}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900">{booking.client_email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-gray-900">
                                {booking.profiles?.company_name || booking.profiles?.full_name || '-'}
                              </p>
                              <p className="text-sm text-gray-500">{booking.profiles?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {booking.service}
                        </td>
                        <td className="px-6 py-4">
                          <BookingStatusBadge status={booking.status} />
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <PaymentStatusBadge status={booking.payment_status} />
                            {booking.deposit_amount && (
                              <p className="text-xs text-gray-500 mt-1">
                                Acompte: {formatAmount(booking.deposit_amount)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                              <button
                                onClick={() => setCancelModal({ open: true, bookingId: booking.id })}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                title="Annuler"
                              >
                                <XCircle className="w-5 h-5" />
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
                  Page {page} sur {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      <ConfirmationModal
        isOpen={cancelModal.open}
        onClose={() => setCancelModal({ open: false, bookingId: '' })}
        onConfirm={handleCancel}
        title="Annuler la réservation"
        message="Êtes-vous sûr de vouloir annuler cette réservation ? Le client et l'artisan seront notifiés."
        confirmText="Annuler la réservation"
        variant="danger"
      />
    </div>
  )
}
