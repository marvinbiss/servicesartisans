'use client'

import { useMemo } from 'react'
import { ChevronLeft, ChevronRight, Clock, User, Phone } from 'lucide-react'
import { StatusBadge } from '@/components/ui/Badge'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CalendarBooking {
  id: string
  client_name: string
  client_email: string | null
  client_phone: string | null
  service_description: string | null
  status: string
  date: string | null
  start_time: string | null
  end_time: string | null
}

export interface CalendarAvailabilitySlot {
  id: string
  date: string
  start_time: string
  end_time: string
}

interface CalendarProps {
  year: number
  month: number // 0-11
  bookings: CalendarBooking[]
  availabilitySlots?: CalendarAvailabilitySlot[]
  selectedDate: string | null // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void
  onPreviousMonth: () => void
  onNextMonth: () => void
  isLoading?: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function formatDateLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = []
  const date = new Date(year, month, 1)
  while (date.getMonth() === month) {
    days.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }
  return days
}

function getFirstDayOffset(year: number, month: number): number {
  // Lundi = 0, Dimanche = 6
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

function isToday(date: Date): boolean {
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

// ─── Composant Calendrier ────────────────────────────────────────────────────

export default function Calendar({
  year,
  month,
  bookings,
  availabilitySlots = [],
  selectedDate,
  onSelectDate,
  onPreviousMonth,
  onNextMonth,
  isLoading = false,
}: CalendarProps) {
  // Indexer les bookings par date
  const bookingsByDate = useMemo(() => {
    const map: Record<string, CalendarBooking[]> = {}
    for (const b of bookings) {
      if (!b.date) continue
      if (!map[b.date]) map[b.date] = []
      map[b.date].push(b)
    }
    return map
  }, [bookings])

  // Indexer les créneaux de disponibilité par date
  const slotsByDate = useMemo(() => {
    const map: Record<string, CalendarAvailabilitySlot[]> = {}
    for (const s of availabilitySlots) {
      if (!s.date) continue
      if (!map[s.date]) map[s.date] = []
      map[s.date].push(s)
    }
    return map
  }, [availabilitySlots])

  const days = getDaysInMonth(year, month)
  const offset = getFirstDayOffset(year, month)

  const selectedBookings = selectedDate ? (bookingsByDate[selectedDate] ?? []) : []
  const selectedSlots = selectedDate ? (slotsByDate[selectedDate] ?? []) : []

  return (
    <div className="space-y-6">
      {/* Grille calendrier */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        {/* En-tête navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onPreviousMonth}
            className="p-2 hover:bg-sand-200 rounded-lg transition-colors"
            aria-label="Mois précédent"
          >
            <ChevronLeft className="w-5 h-5 text-charcoal-700" />
          </button>
          <h3 className="text-lg font-semibold text-charcoal-900">
            {MONTH_NAMES[month]} {year}
          </h3>
          <button
            onClick={onNextMonth}
            className="p-2 hover:bg-sand-200 rounded-lg transition-colors"
            aria-label="Mois suivant"
          >
            <ChevronRight className="w-5 h-5 text-charcoal-700" />
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-sm text-charcoal-500">Chargement...</span>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Grille desktop (7 colonnes) */}
            <div className="hidden sm:grid grid-cols-7 gap-1">
              {/* Noms des jours */}
              {DAY_NAMES.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-charcoal-500 uppercase tracking-wider py-2"
                >
                  {day}
                </div>
              ))}

              {/* Cases vides avant le 1er du mois */}
              {Array.from({ length: offset }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Jours du mois */}
              {days.map((date) => {
                const dateStr = formatDateLocal(date)
                const dayBookings = bookingsByDate[dateStr] ?? []
                const daySlots = slotsByDate[dateStr] ?? []
                const count = dayBookings.length
                const hasSlots = daySlots.length > 0
                const isSelected = selectedDate === dateStr
                const today = isToday(date)

                return (
                  <button
                    key={dateStr}
                    onClick={() => onSelectDate(dateStr)}
                    className={`
                      relative aspect-square p-1 rounded-lg border-2 transition-all text-left
                      ${
                        isSelected
                          ? 'border-primary-400 bg-primary-50'
                          : today
                            ? 'border-primary-200 bg-primary-50/50'
                            : hasSlots && count === 0
                              ? 'border-accent-200 bg-accent-50/50 hover:bg-accent-50'
                              : 'border-transparent hover:bg-sand-100'
                      }
                    `}
                    aria-label={`${date.getDate()} ${MONTH_NAMES[month]} ${year}${count > 0 ? ` - ${count} RDV` : ''}${hasSlots ? ` - ${daySlots.length} créneaux disponibles` : ''}`}
                    aria-pressed={isSelected}
                  >
                    <span
                      className={`text-sm font-medium ${
                        today ? 'text-primary-600' : 'text-charcoal-900'
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    {/* Indicateurs : dispo (vert) en bas à gauche, bookings en bas à droite */}
                    {hasSlots && (
                      <span
                        className="absolute bottom-1 left-1 w-2 h-2 rounded-full bg-accent-500"
                        title={`${daySlots.length} créneau(x) disponible(s)`}
                      />
                    )}
                    {count > 0 && (
                      <span
                        className={`
                        absolute bottom-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center
                        text-[10px] font-bold rounded-full
                        ${
                          count >= 3
                            ? 'bg-red-500 text-white'
                            : count >= 2
                              ? 'bg-secondary-500 text-white'
                              : 'bg-primary-400 text-white'
                        }
                      `}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Vue liste mobile */}
            <div className="sm:hidden space-y-2">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-charcoal-500">{days.length} jours</span>
                <span className="text-sm text-charcoal-500">{bookings.length} RDV au total</span>
              </div>
              {days.map((date) => {
                const dateStr = formatDateLocal(date)
                const dayBookings = bookingsByDate[dateStr] ?? []
                const daySlots = slotsByDate[dateStr] ?? []
                const count = dayBookings.length
                const hasSlots = daySlots.length > 0
                const isSelected = selectedDate === dateStr
                const today = isToday(date)

                if (count === 0 && !hasSlots && !today && !isSelected) return null

                return (
                  <button
                    key={dateStr}
                    onClick={() => onSelectDate(dateStr)}
                    className={`
                      w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left
                      ${
                        isSelected
                          ? 'border-primary-400 bg-primary-50'
                          : hasSlots && count === 0
                            ? 'border-accent-200 bg-accent-50/50'
                            : 'border-sand-300 hover:bg-sand-100'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${today ? 'text-primary-600' : 'text-charcoal-900'}`}
                      >
                        {date.toLocaleDateString('fr-FR', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          timeZone: 'Europe/Paris',
                        })}
                      </span>
                      {today && (
                        <span className="text-xs text-primary-500 font-medium">
                          Aujourd&apos;hui
                        </span>
                      )}
                      {hasSlots && (
                        <span className="text-xs text-accent-600 font-medium">
                          {daySlots.length} dispo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {hasSlots && (
                        <span className="w-2.5 h-2.5 rounded-full bg-accent-500 shrink-0" />
                      )}
                      {count > 0 && (
                        <span
                          className={`
                          min-w-[24px] h-[24px] flex items-center justify-center
                          text-xs font-bold rounded-full
                          ${
                            count >= 3
                              ? 'bg-red-500 text-white'
                              : count >= 2
                                ? 'bg-secondary-500 text-white'
                                : 'bg-primary-400 text-white'
                          }
                        `}
                        >
                          {count}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Légende */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-sand-200 text-xs text-charcoal-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-500" />
                Disponible
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-primary-400" />1 RDV
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-secondary-500" />2 RDV
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                3+ RDV
              </div>
            </div>
          </>
        )}
      </div>

      {/* Détails du jour sélectionné */}
      {selectedDate && (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h4 className="text-base font-semibold text-charcoal-900 mb-4">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              timeZone: 'Europe/Paris',
            })}
          </h4>

          {/* Créneaux de disponibilité */}
          {selectedSlots.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-accent-700 mb-2 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-500" />
                Créneaux disponibles ({selectedSlots.length})
              </h5>
              <div className="flex flex-wrap gap-2">
                {selectedSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-accent-200 bg-accent-50 text-sm text-accent-700"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rendez-vous */}
          {selectedBookings.length === 0 && selectedSlots.length === 0 ? (
            <p className="text-charcoal-500 text-sm py-4 text-center">
              Aucun rendez-vous ni créneau ce jour
            </p>
          ) : selectedBookings.length === 0 ? (
            <p className="text-charcoal-500 text-sm py-2 text-center">Aucun rendez-vous ce jour</p>
          ) : (
            <div className="space-y-3">
              {selectedSlots.length > 0 && (
                <h5 className="text-sm font-semibold text-charcoal-700 flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-primary-400" />
                  Rendez-vous ({selectedBookings.length})
                </h5>
              )}
              {selectedBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg border border-sand-300 bg-sand-50"
                >
                  {/* Heure */}
                  {booking.start_time && (
                    <div className="flex items-center gap-2 text-sm font-medium text-charcoal-700 sm:w-32 shrink-0">
                      <Clock className="w-4 h-4 text-charcoal-400" />
                      {booking.start_time.slice(0, 5)}
                      {booking.end_time && ` - ${booking.end_time.slice(0, 5)}`}
                    </div>
                  )}

                  {/* Infos client */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-charcoal-400 shrink-0" />
                      <span className="font-medium text-charcoal-900 truncate">
                        {booking.client_name || 'Client anonyme'}
                      </span>
                    </div>
                    {booking.service_description && (
                      <p className="text-sm text-charcoal-500 mt-1 truncate">
                        {booking.service_description}
                      </p>
                    )}
                    {booking.client_phone && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Phone className="w-3.5 h-3.5 text-charcoal-400" />
                        <a
                          href={`tel:${booking.client_phone.replace(/[\s.\-()]/g, '')}`}
                          className="text-sm text-primary-600 hover:underline"
                        >
                          {booking.client_phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Statut */}
                  <div className="shrink-0">
                    <StatusBadge status={booking.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
