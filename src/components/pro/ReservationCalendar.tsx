'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreVertical,
  Calendar,
} from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns'
import { fr } from 'date-fns/locale'

export interface Reservation {
  id: string
  clientName: string
  clientPhone: string
  service: string
  date: Date
  startTime: string
  endTime: string
  location: string
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled'
  notes?: string
}

interface ReservationCalendarProps {
  reservations: Reservation[]
  onReservationClick?: (reservation: Reservation) => void
  onDateClick?: (date: Date) => void
}

const statusConfig = {
  confirmed: {
    label: 'Confirmé',
    color: 'bg-green-100 text-green-700 border-green-200',
    dot: 'bg-green-500',
  },
  pending: {
    label: 'En attente',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    dot: 'bg-yellow-500',
  },
  completed: {
    label: 'Terminé',
    color: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  },
  cancelled: {
    label: 'Annulé',
    color: 'bg-red-100 text-red-700 border-red-200',
    dot: 'bg-red-500',
  },
}

export function ReservationCalendar({
  reservations,
  onReservationClick,
  onDateClick,
}: ReservationCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Get calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const days = []
    let day = startDate

    while (day <= endDate) {
      days.push(day)
      day = addDays(day, 1)
    }

    return days
  }, [currentMonth])

  // Get reservations for a specific day
  const getReservationsForDay = (date: Date) => {
    return reservations.filter((r) => isSameDay(r.date, date))
  }

  // Get reservations for selected date
  const selectedDateReservations = selectedDate
    ? getReservationsForDay(selectedDate)
    : []

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    onDateClick?.(date)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Calendar */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Month Navigation */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-500" />
          </button>
          <h2 className="text-lg font-semibold text-slate-900">
            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-slate-200">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
            <div
              key={day}
              className="py-3 text-center text-sm font-medium text-slate-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const dayReservations = getReservationsForDay(day)
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isSelected = selectedDate && isSameDay(day, selectedDate)
            const hasReservations = dayReservations.length > 0

            return (
              <button
                key={idx}
                onClick={() => handleDateClick(day)}
                className={`
                  min-h-[100px] p-2 border-b border-r border-slate-100 text-left transition-colors
                  ${!isCurrentMonth ? 'bg-slate-50 text-slate-400' : 'hover:bg-blue-50'}
                  ${isSelected ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset' : ''}
                  ${isToday(day) ? 'bg-blue-50/50' : ''}
                `}
              >
                <div
                  className={`
                    w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1
                    ${isToday(day) ? 'bg-blue-600 text-white' : ''}
                    ${isSelected && !isToday(day) ? 'bg-blue-100 text-blue-700' : ''}
                  `}
                >
                  {format(day, 'd')}
                </div>
                {hasReservations && isCurrentMonth && (
                  <div className="space-y-1">
                    {dayReservations.slice(0, 2).map((r) => (
                      <div
                        key={r.id}
                        className={`
                          text-xs px-1.5 py-0.5 rounded truncate
                          ${statusConfig[r.status].color}
                        `}
                      >
                        {r.startTime} {r.clientName}
                      </div>
                    ))}
                    {dayReservations.length > 2 && (
                      <div className="text-xs text-slate-500 px-1.5">
                        +{dayReservations.length - 2} autres
                      </div>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Day Detail */}
      <AnimatePresence mode="wait">
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="lg:w-[400px] bg-white rounded-2xl border border-slate-200 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-900">
                {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
              </h3>
              <p className="text-sm text-slate-500">
                {selectedDateReservations.length} rendez-vous
              </p>
            </div>

            <div className="max-h-[500px] overflow-y-auto">
              {selectedDateReservations.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {selectedDateReservations.map((reservation) => (
                    <ReservationItem
                      key={reservation.id}
                      reservation={reservation}
                      onClick={() => onReservationClick?.(reservation)}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Aucun rendez-vous ce jour</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Reservation item component
function ReservationItem({
  reservation,
  onClick,
}: {
  reservation: Reservation
  onClick?: () => void
}) {
  const status = statusConfig[reservation.status]

  return (
    <div
      onClick={onClick}
      className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status.dot}`} />
          <span className="font-medium text-slate-900">
            {reservation.startTime} - {reservation.endTime}
          </span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>
          {status.label}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-slate-400" />
          <span className="text-slate-700">{reservation.clientName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-slate-600">{reservation.service}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span className="text-slate-500">{reservation.location}</span>
        </div>
        {reservation.notes && (
          <div className="text-sm text-slate-500 bg-slate-50 p-2 rounded-lg mt-2">
            {reservation.notes}
          </div>
        )}
      </div>
    </div>
  )
}

// List view component
export function ReservationList({
  reservations,
  onReservationClick,
}: {
  reservations: Reservation[]
  onReservationClick?: (reservation: Reservation) => void
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
      {reservations.map((reservation) => (
        <ReservationItem
          key={reservation.id}
          reservation={reservation}
          onClick={() => onReservationClick?.(reservation)}
        />
      ))}
    </div>
  )
}
