'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import {
  TrendingUp,
  Calendar,
  Euro,
  Star,
  Clock,
  ChevronLeft,
  Loader2,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

interface Stats {
  totalBookings: number
  totalBookingsChange: number
  monthlyRevenue: number
  monthlyRevenueChange: number
  averageRating: number
  totalReviews: number
  newClients: number
  newClientsChange: number
  fillRate: number
  cancelRate: number
  bookingsByDay: { day: string; count: number }[]
  bookingsByMonth: { month: string; count: number }[]
  topServices: { name: string; count: number }[]
  upcomingBookings: number
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function StatistiquesPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')

  useEffect(() => {
    async function fetchStats() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          id,
          status,
          created_at,
          service_description,
          deposit_amount,
          slot:availability_slots(date, start_time, end_time)
        `)
        .eq('artisan_id', user.id)

      // Fetch reviews
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('artisan_id', user.id)

      // Calculate stats
      const now = new Date()
      const thisMonth = now.getMonth()
      const thisYear = now.getFullYear()
      const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
      const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear

      // Helper to get slot data (handles array from Supabase join)
      const getSlotDate = (slot: unknown, fallback: string) => {
        if (Array.isArray(slot)) return slot[0]?.date || fallback
        return (slot as { date?: string })?.date || fallback
      }

      const allBookings = bookings || []
      const confirmedBookings = allBookings.filter(b => b.status === 'confirmed' || b.status === 'completed')
      const cancelledBookings = allBookings.filter(b => b.status === 'cancelled')

      // This month bookings
      const thisMonthBookings = confirmedBookings.filter(b => {
        const date = new Date(getSlotDate(b.slot, b.created_at))
        return date.getMonth() === thisMonth && date.getFullYear() === thisYear
      })

      // Last month bookings
      const lastMonthBookings = confirmedBookings.filter(b => {
        const date = new Date(getSlotDate(b.slot, b.created_at))
        return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear
      })

      // Bookings by day of week
      const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
      const bookingsByDay = dayNames.map((day, index) => ({
        day,
        count: confirmedBookings.filter(b => {
          const date = new Date(getSlotDate(b.slot, b.created_at))
          return date.getDay() === index
        }).length,
      }))

      // Bookings by month (last 6 months)
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
      const bookingsByMonth = []
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const month = monthDate.getMonth()
        const year = monthDate.getFullYear()
        bookingsByMonth.push({
          month: monthNames[month],
          count: confirmedBookings.filter(b => {
            const date = new Date(getSlotDate(b.slot, b.created_at))
            return date.getMonth() === month && date.getFullYear() === year
          }).length,
        })
      }

      // Top services
      const serviceCount: Record<string, number> = {}
      confirmedBookings.forEach(b => {
        const service = b.service_description || 'Non spécifié'
        serviceCount[service] = (serviceCount[service] || 0) + 1
      })
      const topServices = Object.entries(serviceCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Calculate revenue (from deposits)
      const monthlyRevenue = thisMonthBookings.reduce(
        (sum, b) => sum + (b.deposit_amount || 0) / 100,
        0
      )
      const lastMonthRevenue = lastMonthBookings.reduce(
        (sum, b) => sum + (b.deposit_amount || 0) / 100,
        0
      )

      // Average rating
      const allReviews = reviews || []
      const avgRating = allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : 0

      // Upcoming bookings
      const upcomingBookings = confirmedBookings.filter(b => {
        const date = new Date(getSlotDate(b.slot, ''))
        return date >= now
      }).length

      // Calculate changes
      const bookingsChange = lastMonthBookings.length > 0
        ? ((thisMonthBookings.length - lastMonthBookings.length) / lastMonthBookings.length) * 100
        : 0

      const revenueChange = lastMonthRevenue > 0
        ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0

      setStats({
        totalBookings: confirmedBookings.length,
        totalBookingsChange: bookingsChange,
        monthlyRevenue,
        monthlyRevenueChange: revenueChange,
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: allReviews.length,
        newClients: thisMonthBookings.length, // Simplified
        newClientsChange: bookingsChange,
        fillRate: 85, // Placeholder - would need slot data
        cancelRate: allBookings.length > 0
          ? Math.round((cancelledBookings.length / allBookings.length) * 100)
          : 0,
        bookingsByDay,
        bookingsByMonth,
        topServices,
        upcomingBookings,
      })

      setIsLoading(false)
    }

    fetchStats()
  }, [period])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <Link
              href="/espace-artisan/calendrier"
              className="p-2 hover:bg-white/10 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Statistiques</h1>
              <p className="text-primary-100">Analysez les performances de votre activité</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Period selector */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'week', label: 'Semaine' },
            { id: 'month', label: 'Mois' },
            { id: 'year', label: 'Année' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id as any)}
              className={`px-4 py-2 rounded-lg font-medium ${
                period === p.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Key metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8 text-primary-600" />
              <span className={`flex items-center text-sm font-medium ${
                stats!.totalBookingsChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats!.totalBookingsChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {Math.abs(Math.round(stats!.totalBookingsChange))}%
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats!.totalBookings}</div>
            <div className="text-sm text-gray-500">Réservations totales</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <Euro className="w-8 h-8 text-green-600" />
              <span className={`flex items-center text-sm font-medium ${
                stats!.monthlyRevenueChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats!.monthlyRevenueChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {Math.abs(Math.round(stats!.monthlyRevenueChange))}%
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats!.monthlyRevenue.toFixed(0)}EUR</div>
            <div className="text-sm text-gray-500">Revenus ce mois</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <Star className="w-8 h-8 text-yellow-500" />
              <span className="text-sm text-gray-500">{stats!.totalReviews} avis</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats!.averageRating || '-'}</div>
            <div className="text-sm text-gray-500">Note moyenne</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats!.upcomingBookings}</div>
            <div className="text-sm text-gray-500">RDV à venir</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Bookings by day chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              Réservations par jour
            </h3>
            <div className="flex items-end justify-between h-40">
              {stats!.bookingsByDay.map((day) => {
                const maxCount = Math.max(...stats!.bookingsByDay.map(d => d.count), 1)
                const height = (day.count / maxCount) * 100
                return (
                  <div key={day.day} className="flex flex-col items-center gap-2">
                    <div className="text-xs text-gray-600">{day.count}</div>
                    <div
                      className="w-10 bg-primary-500 rounded-t transition-all"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                    <div className="text-xs text-gray-500">{day.day}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bookings by month chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Evolution mensuelle
            </h3>
            <div className="flex items-end justify-between h-40">
              {stats!.bookingsByMonth.map((month, i) => {
                const maxCount = Math.max(...stats!.bookingsByMonth.map(m => m.count), 1)
                const height = (month.count / maxCount) * 100
                return (
                  <div key={month.month} className="flex flex-col items-center gap-2">
                    <div className="text-xs text-gray-600">{month.count}</div>
                    <div
                      className={`w-10 rounded-t transition-all ${
                        i === stats!.bookingsByMonth.length - 1 ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                    <div className="text-xs text-gray-500">{month.month}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top services */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-600" />
              Services les plus demandés
            </h3>
            {stats!.topServices.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune donnée</p>
            ) : (
              <div className="space-y-4">
                {stats!.topServices.map((service, i) => {
                  const maxCount = stats!.topServices[0].count
                  const width = (service.count / maxCount) * 100
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 truncate">{service.name}</span>
                        <span className="text-gray-500">{service.count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Performance indicators */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Indicateurs clés</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <div className="text-sm text-green-700">Taux de remplissage</div>
                  <div className="text-2xl font-bold text-green-800">{stats!.fillRate}%</div>
                </div>
                <div className="w-16 h-16 relative">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32" cy="32" r="28"
                      stroke="#dcfce7"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="32" cy="32" r="28"
                      stroke="#22c55e"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${stats!.fillRate * 1.76} 176`}
                    />
                  </svg>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div>
                  <div className="text-sm text-red-700">Taux d'annulation</div>
                  <div className="text-2xl font-bold text-red-800">{stats!.cancelRate}%</div>
                </div>
                <div className="w-16 h-16 relative">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32" cy="32" r="28"
                      stroke="#fef2f2"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="32" cy="32" r="28"
                      stroke="#ef4444"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${stats!.cancelRate * 1.76} 176`}
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
