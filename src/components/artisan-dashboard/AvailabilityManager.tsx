'use client'

import React, { useState, useCallback, useMemo } from 'react'
import useSWR from 'swr'
import { Clock, Plus, Trash2, Calendar, Loader2, AlertCircle } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AvailabilitySlot {
  id: string
  artisan_id: string
  date: string
  start_time: string
  end_time: string
  is_available: boolean
  created_at: string
}

interface SlotsResponse {
  success: boolean
  slots: AvailabilitySlot[]
  error?: { message: string }
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Tranches de 30 min, 06:00 -> 22:00 */
const TIME_OPTIONS: string[] = (() => {
  const opts: string[] = []
  for (let h = 6; h <= 22; h++) {
    opts.push(`${String(h).padStart(2, '0')}:00`)
    if (h < 22) opts.push(`${String(h).padStart(2, '0')}:30`)
  }
  return opts
})()

const JOUR_LABELS: Record<number, string> = {
  0: 'Dimanche',
  1: 'Lundi',
  2: 'Mardi',
  3: 'Mercredi',
  4: 'Jeudi',
  5: 'Vendredi',
  6: 'Samedi',
}

// ---------------------------------------------------------------------------
// Fetcher
// ---------------------------------------------------------------------------

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.error?.message ?? `Erreur ${res.status}`)
  }
  return res.json()
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format YYYY-MM-DD -> "Lun. 14 avr. 2026" */
function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Get YYYY-MM-DD for today */
function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Grouper les slots par date */
function groupByDate(slots: AvailabilitySlot[]): Map<string, AvailabilitySlot[]> {
  const map = new Map<string, AvailabilitySlot[]>()
  for (const s of slots) {
    const list = map.get(s.date) ?? []
    list.push(s)
    map.set(s.date, list)
  }
  return map
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function AvailabilityManagerInner() {
  // ----- State -----
  const [newDate, setNewDate] = useState(todayISO())
  const [newStart, setNewStart] = useState('09:00')
  const [newEnd, setNewEnd] = useState('10:00')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  // ----- Data -----
  const { data, error: loadError, isLoading, mutate } = useSWR<SlotsResponse>(
    '/api/artisan/availability',
    fetcher,
    { revalidateOnFocus: false },
  )

  const slots = data?.slots ?? []

  // Only keep future or today slots
  const today = todayISO()
  const futureSlots = useMemo(
    () => slots.filter((s) => s.date >= today),
    [slots, today],
  )

  const grouped = useMemo(() => groupByDate(futureSlots), [futureSlots])
  const sortedDates = useMemo(
    () => Array.from(grouped.keys()).sort(),
    [grouped],
  )

  // ----- Validation inline -----
  const timeError = useMemo(() => {
    if (newEnd <= newStart) return "L'heure de fin doit être après l'heure de début"
    return null
  }, [newStart, newEnd])

  // ----- Handlers -----

  const handleCreate = useCallback(async () => {
    if (timeError) {
      setFormError(timeError)
      return
    }
    setFormError(null)
    setFormSuccess(null)
    setSaving(true)

    try {
      const res = await fetch('/api/artisan/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: newDate,
          start_time: newStart,
          end_time: newEnd,
          is_available: true,
        }),
      })
      const result = await res.json()

      if (!res.ok) {
        setFormError(result?.error?.message ?? 'Erreur lors de la création')
        return
      }

      setFormSuccess('Créneau ajouté')
      setTimeout(() => setFormSuccess(null), 3000)
      mutate()
    } catch {
      setFormError('Erreur réseau. Réessayez.')
    } finally {
      setSaving(false)
    }
  }, [newDate, newStart, newEnd, timeError, mutate])

  const handleDelete = useCallback(
    async (slotId: string) => {
      setDeletingId(slotId)
      setFormError(null)

      try {
        const res = await fetch(`/api/artisan/availability?slotId=${slotId}`, {
          method: 'DELETE',
        })
        const result = await res.json()

        if (!res.ok) {
          setFormError(result?.error?.message ?? 'Erreur lors de la suppression')
          return
        }

        mutate()
      } catch {
        setFormError('Erreur reseau. Reessayez.')
      } finally {
        setDeletingId(null)
      }
    },
    [mutate],
  )

  // ----- Render -----

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-primary-600" />
        <h3 className="text-base font-semibold text-charcoal-900">
          Créneaux de disponibilité
        </h3>
      </div>

      <p className="text-sm text-charcoal-500">
        Ajoutez des créneaux sur lesquels vos clients peuvent prendre rendez-vous.
        Les horaires d&apos;ouverture ci-dessus définissent vos heures générales ;
        les créneaux ci-dessous sont les plages horaires précises ouvertes à la réservation.
      </p>

      {/* ---------- Formulaire d'ajout ---------- */}
      <div className="bg-sand-50 border border-sand-200 rounded-xl p-4 space-y-4">
        <p className="text-sm font-medium text-charcoal-700 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Ajouter un créneau
        </p>

        <div className="flex flex-wrap items-end gap-3">
          {/* Date */}
          <div className="flex flex-col gap-1">
            <label htmlFor="slot-date" className="text-xs font-medium text-charcoal-600">
              Date
            </label>
            <input
              id="slot-date"
              type="date"
              value={newDate}
              min={todayISO()}
              onChange={(e) => setNewDate(e.target.value)}
              className="px-3 py-2 border border-sand-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Heure debut */}
          <div className="flex flex-col gap-1">
            <label htmlFor="slot-start" className="text-xs font-medium text-charcoal-600">
              Debut
            </label>
            <select
              id="slot-start"
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
              className="px-3 py-2 border border-sand-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Heure fin */}
          <div className="flex flex-col gap-1">
            <label htmlFor="slot-end" className="text-xs font-medium text-charcoal-600">
              Fin
            </label>
            <select
              id="slot-end"
              value={newEnd}
              onChange={(e) => setNewEnd(e.target.value)}
              className={`px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                timeError ? 'border-red-400 bg-red-50' : 'border-sand-300'
              }`}
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Bouton */}
          <button
            type="button"
            onClick={handleCreate}
            disabled={saving || !!timeError}
            aria-busy={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Ajouter
          </button>
        </div>

        {timeError && (
          <p className="text-xs text-red-600">{timeError}</p>
        )}
      </div>

      {/* ---------- Messages ---------- */}
      {formError && (
        <div role="alert" className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {formError}
        </div>
      )}

      {formSuccess && (
        <div role="status" aria-live="polite" className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {formSuccess}
        </div>
      )}

      {/* ---------- Liste des créneaux ---------- */}
      {isLoading && (
        <div className="flex items-center gap-2 text-charcoal-500 text-sm py-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          Chargement des créneaux...
        </div>
      )}

      {loadError && (
        <div role="alert" className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          Impossible de charger les créneaux : {loadError.message}
        </div>
      )}

      {!isLoading && !loadError && sortedDates.length === 0 && (
        <div className="text-center py-8 text-charcoal-400 text-sm">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
          Aucun créneau à venir. Ajoutez-en un ci-dessus.
        </div>
      )}

      {sortedDates.map((date) => {
        const daySlots = grouped.get(date)!
        const d = new Date(date + 'T00:00:00')
        const dayOfWeek = d.getDay()

        return (
          <div key={date} className="border border-sand-200 rounded-xl overflow-hidden">
            {/* En-tete du jour */}
            <div className="bg-sand-50 px-4 py-2.5 flex items-center gap-2 border-b border-sand-200">
              <span className="text-sm font-semibold text-charcoal-800">
                {JOUR_LABELS[dayOfWeek]}
              </span>
              <span className="text-sm text-charcoal-500">
                {formatDateLabel(date)}
              </span>
              <span className="ml-auto text-xs text-charcoal-400">
                {daySlots.length} créneau{daySlots.length > 1 ? 'x' : ''}
              </span>
            </div>

            {/* Slots */}
            <div className="divide-y divide-sand-100">
              {daySlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-sand-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-charcoal-400" />
                    <span className="text-sm font-medium text-charcoal-800">
                      {slot.start_time} - {slot.end_time}
                    </span>
                    {!slot.is_available && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                        Indisponible
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(slot.id)}
                    disabled={deletingId === slot.id}
                    aria-label={`Supprimer le créneau ${slot.start_time} - ${slot.end_time}`}
                    className="p-1.5 text-charcoal-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deletingId === slot.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export const AvailabilityManager = React.memo(AvailabilityManagerInner)
