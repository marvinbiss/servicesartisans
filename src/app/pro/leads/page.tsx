'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  SlidersHorizontal,
  Users,
  Zap,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  ChevronDown,
} from 'lucide-react'
import { LeadCard, LeadEmptyState, Lead } from '@/components/pro/LeadCard'

// Mock data - in production comes from API
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
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
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
    createdAt: new Date(Date.now() - 1000 * 60 * 10),
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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    preferredDate: 'Ce mois-ci',
  },
  {
    id: '4',
    clientName: 'François Blanc',
    clientEmail: 'f.blanc@email.com',
    clientPhone: '06 11 22 33 44',
    service: 'Débouchage canalisation',
    description: 'Canalisation bouchée dans la salle de bain, l\'eau ne s\'écoule plus.',
    location: 'Paris 20ème',
    budget: '150€ - 300€',
    urgency: 'urgent',
    status: 'new',
    createdAt: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: '5',
    clientName: 'Isabelle Rousseau',
    clientEmail: 'isabelle.r@email.com',
    clientPhone: '06 77 88 99 00',
    service: 'Réparation chasse d\'eau',
    description: 'Chasse d\'eau qui coule en continu, impossible de l\'arrêter.',
    location: 'Vincennes',
    budget: '80€ - 150€',
    urgency: 'normal',
    status: 'quoted',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: '6',
    clientName: 'Thomas Girard',
    clientEmail: 't.girard@email.com',
    clientPhone: '06 44 55 66 77',
    service: 'Installation robinetterie',
    description: 'Installation d\'un nouveau mitigeur thermostatique dans la douche.',
    location: 'Montreuil',
    budget: '200€ - 400€',
    urgency: 'flexible',
    status: 'accepted',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    preferredDate: 'Fin de mois',
  },
]

type FilterStatus = 'all' | 'new' | 'contacted' | 'quoted' | 'accepted' | 'rejected'
type FilterUrgency = 'all' | 'urgent' | 'normal' | 'flexible'
type SortBy = 'date' | 'urgency' | 'budget'

export default function ProLeadsPage() {
  const [leads, setLeads] = useState(mockLeads)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterUrgency, setFilterUrgency] = useState<FilterUrgency>('all')
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [showFilters, setShowFilters] = useState(false)

  // Filter and sort leads
  const filteredLeads = useMemo(() => {
    let result = [...leads]

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (l) =>
          l.clientName.toLowerCase().includes(query) ||
          l.service.toLowerCase().includes(query) ||
          l.location.toLowerCase().includes(query)
      )
    }

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter((l) => l.status === filterStatus)
    }

    // Filter by urgency
    if (filterUrgency !== 'all') {
      result = result.filter((l) => l.urgency === filterUrgency)
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'urgency':
          const urgencyOrder = { urgent: 0, normal: 1, flexible: 2 }
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
        case 'date':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime()
      }
    })

    return result
  }, [leads, searchQuery, filterStatus, filterUrgency, sortBy])

  const handleAcceptLead = (id: string) => {
    setLeads(leads.map((l) => (l.id === id ? { ...l, status: 'accepted' as const } : l)))
  }

  const handleRejectLead = (id: string) => {
    setLeads(leads.map((l) => (l.id === id ? { ...l, status: 'rejected' as const } : l)))
  }

  const handleContactLead = (id: string) => {
    setLeads(leads.map((l) => (l.id === id ? { ...l, status: 'contacted' as const } : l)))
  }

  // Stats
  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === 'new').length,
    contacted: leads.filter((l) => l.status === 'contacted').length,
    accepted: leads.filter((l) => l.status === 'accepted').length,
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mes Leads</h1>
          <p className="text-slate-500">
            Gérez vos demandes clients et convertissez-les en réservations
          </p>
        </div>
      </div>

      {/* Stats Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'Tous', count: stats.total, icon: Users },
          { key: 'new', label: 'Nouveaux', count: stats.new, icon: Zap, color: 'blue' },
          { key: 'contacted', label: 'Contactés', count: stats.contacted, icon: Clock, color: 'yellow' },
          { key: 'accepted', label: 'Acceptés', count: stats.accepted, icon: CheckCircle2, color: 'green' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key as FilterStatus)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all
              ${filterStatus === tab.key
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }
            `}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span
              className={`
                px-2 py-0.5 rounded-full text-xs font-bold
                ${filterStatus === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}
              `}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, service, lieu..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all
              ${showFilters ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}
            `}
          >
            <SlidersHorizontal className="w-5 h-5" />
            Filtres
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="appearance-none px-4 py-3 pr-10 bg-slate-50 rounded-xl font-medium text-slate-600 cursor-pointer focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Plus récents</option>
              <option value="urgency">Par urgence</option>
            </select>
            <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Urgency Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Urgence
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: 'all', label: 'Toutes' },
                        { key: 'urgent', label: 'Urgent', color: 'red' },
                        { key: 'normal', label: 'Normal', color: 'blue' },
                        { key: 'flexible', label: 'Flexible', color: 'green' },
                      ].map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => setFilterUrgency(opt.key as FilterUrgency)}
                          className={`
                            px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                            ${filterUrgency === opt.key
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }
                          `}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Leads List */}
      <div className="space-y-4">
        {filteredLeads.length > 0 ? (
          filteredLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onAccept={handleAcceptLead}
              onReject={handleRejectLead}
              onContact={handleContactLead}
            />
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <LeadEmptyState />
          </div>
        )}
      </div>
    </div>
  )
}
