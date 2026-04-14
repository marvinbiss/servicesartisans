'use client'

import { useState, useCallback, useEffect } from 'react'
import useSWR from 'swr'
import { Calendar as CalendarIcon, AlertCircle } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import ArtisanSidebar from '@/components/artisan-dashboard/ArtisanSidebar'
import Calendar, {
  type CalendarBooking,
  type CalendarAvailabilitySlot,
} from '@/components/artisan-dashboard/Calendar'
import { getArtisanUrl } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

interface StatsResponse {
  profile: { id: string; full_name: string | null } | null
  provider: {
    id: string
    stable_id: string | null
    slug: string | null
    specialty: string | null
    address_city: string | null
  } | null
}

interface BookingsResponse {
  bookings: CalendarBooking[]
  availabilitySlots?: CalendarAvailabilitySlot[]
  error?: string
}

// ─── SWR fetcher ─────────────────────────────────────────────────────────────

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? `Erreur ${res.status}`)
  }
  return res.json()
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CalendrierPage() {
  const [year, setYear] = useState(() => new Date().getFullYear())
  const [month, setMonth] = useState(() => new Date().getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Charger le profil artisan (pour la sidebar)
  const { data: statsData } = useSWR<StatsResponse>('/api/artisan/stats', fetcher, {
    revalidateOnFocus: false,
  })

  // Charger les bookings du mois
  const {
    data: bookingsData,
    error: bookingsError,
    isLoading,
  } = useSWR<BookingsResponse>(`/api/artisan/bookings?month=${month}&year=${year}`, fetcher, {
    revalidateOnFocus: false,
  })

  const bookings = bookingsData?.bookings ?? []
  const availabilitySlots = bookingsData?.availabilitySlots ?? []
  const profile = statsData?.profile
  const provider = statsData?.provider

  // URL publique de l'artisan
  const publicUrl = provider
    ? getArtisanUrl({
        stable_id: provider.stable_id,
        slug: provider.slug,
        specialty: provider.specialty,
        city: provider.address_city,
      })
    : null

  // Auto-sélectionner aujourd'hui quand on est sur le mois courant
  useEffect(() => {
    const now = new Date()
    if (year === now.getFullYear() && month === now.getMonth()) {
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      setSelectedDate(todayStr)
    } else {
      setSelectedDate(null)
    }
  }, [year, month])

  const handlePreviousMonth = useCallback(() => {
    setMonth((prev) => {
      if (prev === 0) {
        setYear((y) => y - 1)
        return 11
      }
      return prev - 1
    })
  }, [])

  const handleNextMonth = useCallback(() => {
    setMonth((prev) => {
      if (prev === 11) {
        setYear((y) => y + 1)
        return 0
      }
      return prev + 1
    })
  }, [])

  return (
    <div className="min-h-screen bg-sand-100">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb
            items={[{ label: 'Espace Artisan', href: '/espace-artisan' }, { label: 'Calendrier' }]}
          />
        </div>
      </div>

      {/* Header */}
      <div className="bg-charcoal-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-primary-400" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Mon Calendrier</h1>
              <p className="text-charcoal-300 text-sm">
                {profile?.full_name ? `${profile.full_name} — ` : ''}
                Consultez vos rendez-vous et disponibilités
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid lg:grid-cols-4 gap-4 lg:gap-8">
          {/* Sidebar */}
          <ArtisanSidebar activePage="calendrier" publicUrl={publicUrl} />

          {/* Main */}
          <div className="lg:col-span-3">
            {/* Erreur */}
            {bookingsError && (
              <div className="mb-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Erreur de chargement</p>
                  <p className="text-sm text-red-600 mt-1">
                    {bookingsError.message ||
                      'Impossible de charger les réservations. Veuillez réessayer.'}
                  </p>
                </div>
              </div>
            )}

            {/* Calendrier */}
            <Calendar
              year={year}
              month={month}
              bookings={bookings}
              availabilitySlots={availabilitySlots}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onPreviousMonth={handlePreviousMonth}
              onNextMonth={handleNextMonth}
              isLoading={isLoading}
            />

            {/* Stats rapides */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
              <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-primary-600">{bookings.length}</div>
                <div className="text-xs text-charcoal-500 mt-1">RDV ce mois</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-accent-600">
                  {bookings.filter((b) => b.status === 'confirmed').length}
                </div>
                <div className="text-xs text-charcoal-500 mt-1">Confirmés</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 text-center col-span-2 sm:col-span-1">
                <div className="text-2xl font-bold text-secondary-600">
                  {bookings.filter((b) => b.status === 'pending').length}
                </div>
                <div className="text-xs text-charcoal-500 mt-1">En attente</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
