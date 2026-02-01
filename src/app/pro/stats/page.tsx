'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Euro,
  Star,
  Eye,
  Calendar,
  Clock,
  Target,
  ArrowUpRight,
  ChevronDown,
} from 'lucide-react'
import { StatsCard } from '@/components/pro/StatsCard'
import {
  format,
  subDays,
  subMonths,
  eachDayOfInterval,
  eachMonthOfInterval,
} from 'date-fns'
import { fr } from 'date-fns/locale'

// Mock chart data
const generateChartData = (days: number, baseValue: number, variance: number) => {
  return eachDayOfInterval({
    start: subDays(new Date(), days - 1),
    end: new Date(),
  }).map((date) => ({
    date: format(date, 'dd/MM'),
    value: Math.floor(baseValue + Math.random() * variance - variance / 2),
  }))
}

const revenueData = generateChartData(30, 150, 100)
const leadsData = generateChartData(30, 5, 4)
const viewsData = generateChartData(30, 50, 30)

// Mock monthly data
const monthlyData = eachMonthOfInterval({
  start: subMonths(new Date(), 11),
  end: new Date(),
}).map((date) => ({
  month: format(date, 'MMM', { locale: fr }),
  revenue: Math.floor(2000 + Math.random() * 3000),
  leads: Math.floor(10 + Math.random() * 20),
  conversions: Math.floor(5 + Math.random() * 15),
}))

type TimeRange = '7d' | '30d' | '90d' | '12m'

export default function ProStatsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')

  // Summary stats
  const summaryStats = {
    revenue: { value: 4850, change: 23, label: 'Chiffre d\'affaires' },
    leads: { value: 42, change: 15, label: 'Leads reçus' },
    conversions: { value: 28, change: 8, label: 'Conversions' },
    avgRating: { value: 4.8, change: 0.2, label: 'Note moyenne' },
    responseTime: { value: '45min', change: -12, label: 'Temps de réponse' },
    profileViews: { value: 1247, change: 32, label: 'Vues du profil' },
  }

  // Top services
  const topServices = [
    { name: 'Réparation fuite', count: 15, revenue: 1200 },
    { name: 'Débouchage', count: 12, revenue: 960 },
    { name: 'Installation sanitaire', count: 8, revenue: 1600 },
    { name: 'Rénovation SDB', count: 4, revenue: 3200 },
    { name: 'Dépannage urgent', count: 10, revenue: 800 },
  ]

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Statistiques</h1>
          <p className="text-slate-500">
            Analysez vos performances et optimisez votre activité
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex bg-white rounded-xl border border-slate-200 p-1">
          {[
            { key: '7d', label: '7 jours' },
            { key: '30d', label: '30 jours' },
            { key: '90d', label: '90 jours' },
            { key: '12m', label: '12 mois' },
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setTimeRange(option.key as TimeRange)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === option.key
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatsCard
          title="Chiffre d'affaires"
          value={`${summaryStats.revenue.value}€`}
          subtitle="Ce mois"
          icon={Euro}
          trend={{ value: summaryStats.revenue.change, label: 'vs mois dernier' }}
          color="purple"
          size="large"
        />
        <StatsCard
          title="Leads reçus"
          value={summaryStats.leads.value}
          subtitle="Ce mois"
          icon={Users}
          trend={{ value: summaryStats.leads.change, label: 'vs mois dernier' }}
          color="blue"
        />
        <StatsCard
          title="Conversions"
          value={summaryStats.conversions.value}
          subtitle="Leads → Clients"
          icon={Target}
          trend={{ value: summaryStats.conversions.change, label: 'vs mois dernier' }}
          color="green"
        />
        <StatsCard
          title="Note moyenne"
          value={summaryStats.avgRating.value}
          subtitle="47 avis"
          icon={Star}
          trend={{ value: summaryStats.avgRating.change, label: 'vs mois dernier' }}
          color="orange"
        />
        <StatsCard
          title="Temps de réponse"
          value={summaryStats.responseTime.value}
          subtitle="Moyenne"
          icon={Clock}
          trend={{ value: summaryStats.responseTime.change, label: 'amélioration' }}
          color="blue"
        />
        <StatsCard
          title="Vues du profil"
          value={summaryStats.profileViews.value}
          subtitle="Ce mois"
          icon={Eye}
          trend={{ value: summaryStats.profileViews.change, label: 'vs mois dernier' }}
          color="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-900">Évolution du CA</h3>
              <p className="text-sm text-slate-500">Derniers 30 jours</p>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+23%</span>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="h-48 flex items-end gap-1">
            {revenueData.map((d, i) => (
              <div
                key={i}
                className="flex-1 bg-blue-100 hover:bg-blue-200 rounded-t transition-colors cursor-pointer group relative"
                style={{ height: `${(d.value / 250) * 100}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {d.value}€
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leads Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-900">Leads reçus</h3>
              <p className="text-sm text-slate-500">Derniers 30 jours</p>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+15%</span>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="h-48 flex items-end gap-1">
            {leadsData.map((d, i) => (
              <div
                key={i}
                className="flex-1 bg-green-100 hover:bg-green-200 rounded-t transition-colors cursor-pointer group relative"
                style={{ height: `${(d.value / 10) * 100}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {d.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Services */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Top Services</h3>
            <p className="text-sm text-slate-500">Par nombre de demandes</p>
          </div>
          <div className="divide-y divide-slate-100">
            {topServices.map((service, i) => (
              <div
                key={service.name}
                className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900">{service.name}</div>
                  <div className="text-sm text-slate-500">
                    {service.count} demandes
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-900">{service.revenue}€</div>
                  <div className="text-xs text-slate-500">CA généré</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Entonnoir de conversion</h3>
          <div className="space-y-4">
            {[
              { label: 'Vues profil', value: 1247, width: 100, color: 'bg-slate-200' },
              { label: 'Leads reçus', value: 42, width: 75, color: 'bg-blue-200' },
              { label: 'Devis envoyés', value: 35, width: 60, color: 'bg-blue-400' },
              { label: 'Réservations', value: 28, width: 45, color: 'bg-green-500' },
            ].map((step, i) => (
              <div key={step.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600">{step.label}</span>
                  <span className="font-semibold text-slate-900">{step.value}</span>
                </div>
                <div className="h-8 bg-slate-100 rounded-lg overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${step.width}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className={`h-full ${step.color} rounded-lg`}
                  />
                </div>
                {i < 3 && (
                  <div className="text-xs text-slate-400 text-center mt-1">
                    {i === 0 && '3.4% →'}
                    {i === 1 && '83% →'}
                    {i === 2 && '80% →'}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-green-50 rounded-xl">
            <div className="flex items-center gap-2 text-green-700 font-semibold mb-1">
              <Target className="w-4 h-4" />
              Taux de conversion global
            </div>
            <div className="text-2xl font-bold text-green-600">67%</div>
            <div className="text-sm text-green-600">+5% vs mois dernier</div>
          </div>
        </div>
      </div>
    </div>
  )
}
