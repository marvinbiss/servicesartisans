'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Plus,
  Search,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Euro,
  User,
  MapPin,
  Calendar,
  MoreVertical,
  Download,
  Copy,
  Eye,
  Edit3,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Quote {
  id: string
  clientName: string
  clientEmail: string
  clientPhone: string
  service: string
  description: string
  location: string
  amount: number
  validUntil: Date
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired'
  createdAt: Date
  sentAt?: Date
  items: { description: string; quantity: number; unitPrice: number }[]
}

const mockQuotes: Quote[] = [
  {
    id: '1',
    clientName: 'Marie Martin',
    clientEmail: 'marie.martin@email.com',
    clientPhone: '06 12 34 56 78',
    service: 'Rénovation salle de bain',
    description: 'Rénovation complète avec douche italienne',
    location: 'Paris 15ème',
    amount: 5800,
    validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
    status: 'sent',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    items: [
      { description: 'Démolition ancienne SDB', quantity: 1, unitPrice: 800 },
      { description: 'Plomberie', quantity: 1, unitPrice: 1500 },
      { description: 'Carrelage (pose + fourniture)', quantity: 12, unitPrice: 150 },
      { description: 'Douche italienne', quantity: 1, unitPrice: 1200 },
      { description: 'Meuble vasque', quantity: 1, unitPrice: 500 },
    ],
  },
  {
    id: '2',
    clientName: 'Pierre Durand',
    clientEmail: 'p.durand@email.com',
    clientPhone: '06 98 76 54 32',
    service: 'Réparation fuite',
    description: 'Fuite sous évier cuisine',
    location: 'Paris 11ème',
    amount: 180,
    validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    status: 'accepted',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    items: [
      { description: 'Déplacement', quantity: 1, unitPrice: 50 },
      { description: 'Main d\'oeuvre', quantity: 1, unitPrice: 80 },
      { description: 'Pièces détachées', quantity: 1, unitPrice: 50 },
    ],
  },
  {
    id: '3',
    clientName: 'Sophie Lefebvre',
    clientEmail: 'sophie.l@email.com',
    clientPhone: '06 55 44 33 22',
    service: 'Installation chauffe-eau',
    description: 'Remplacement chauffe-eau 200L thermodynamique',
    location: 'Boulogne-Billancourt',
    amount: 2200,
    validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
    status: 'draft',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    items: [
      { description: 'Chauffe-eau thermodynamique 200L', quantity: 1, unitPrice: 1500 },
      { description: 'Installation', quantity: 1, unitPrice: 500 },
      { description: 'Dépose ancien', quantity: 1, unitPrice: 200 },
    ],
  },
  {
    id: '4',
    clientName: 'François Blanc',
    clientEmail: 'f.blanc@email.com',
    clientPhone: '06 11 22 33 44',
    service: 'Débouchage canalisation',
    description: 'Débouchage urgent WC',
    location: 'Paris 20ème',
    amount: 150,
    validUntil: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    status: 'expired',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
    items: [
      { description: 'Intervention urgente', quantity: 1, unitPrice: 150 },
    ],
  },
]

const statusConfig = {
  draft: { label: 'Brouillon', color: 'bg-slate-100 text-slate-600', icon: Edit3 },
  sent: { label: 'Envoyé', color: 'bg-blue-100 text-blue-700', icon: Send },
  viewed: { label: 'Vu', color: 'bg-purple-100 text-purple-700', icon: Eye },
  accepted: { label: 'Accepté', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  rejected: { label: 'Refusé', color: 'bg-red-100 text-red-700', icon: XCircle },
  expired: { label: 'Expiré', color: 'bg-orange-100 text-orange-700', icon: Clock },
}

type FilterStatus = 'all' | Quote['status']

export default function ProDevisPage() {
  const [quotes] = useState(mockQuotes)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [_selectedQuote, _setSelectedQuote] = useState<Quote | null>(null)

  const filteredQuotes = quotes.filter((q) => {
    if (filterStatus !== 'all' && q.status !== filterStatus) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        q.clientName.toLowerCase().includes(query) ||
        q.service.toLowerCase().includes(query)
      )
    }
    return true
  })

  const stats = {
    total: quotes.length,
    draft: quotes.filter((q) => q.status === 'draft').length,
    sent: quotes.filter((q) => q.status === 'sent' || q.status === 'viewed').length,
    accepted: quotes.filter((q) => q.status === 'accepted').length,
    totalAmount: quotes.filter((q) => q.status === 'accepted').reduce((sum, q) => sum + q.amount, 0),
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mes Devis</h1>
          <p className="text-slate-500">Créez et gérez vos devis clients</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-colors">
          <Plus className="w-5 h-5" />
          Nouveau devis
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
              <div className="text-sm text-slate-500">Total</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Send className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{stats.sent}</div>
              <div className="text-sm text-slate-500">En attente</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{stats.accepted}</div>
              <div className="text-sm text-slate-500">Acceptés</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Euro className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{stats.totalAmount}€</div>
              <div className="text-sm text-slate-500">CA accepté</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un devis..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {(['all', 'draft', 'sent', 'accepted', 'rejected', 'expired'] as FilterStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status === 'all' ? 'Tous' : statusConfig[status].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quotes List */}
      <div className="space-y-4">
        {filteredQuotes.map((quote) => {
          const config = statusConfig[quote.status]
          const StatusIcon = config.icon

          return (
            <motion.div
              key={quote.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-blue-300 transition-colors"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-slate-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{quote.clientName}</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <MapPin className="w-3.5 h-3.5" />
                        {quote.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${config.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {config.label}
                    </span>
                    <button className="p-2 hover:bg-slate-100 rounded-lg">
                      <MoreVertical className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="font-medium text-slate-900">{quote.service}</div>
                  <p className="text-sm text-slate-500">{quote.description}</p>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Euro className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold">{quote.amount}€</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    Valide jusqu'au {format(quote.validUntil, 'd MMM yyyy', { locale: fr })}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-4 h-4" />
                    Créé {formatDistanceToNow(quote.createdAt, { addSuffix: true, locale: fr })}
                  </div>
                </div>
              </div>

              <div className="flex border-t border-slate-100 divide-x divide-slate-100">
                <button className="flex-1 flex items-center justify-center gap-2 py-3 text-slate-600 hover:bg-slate-50 transition-colors">
                  <Eye className="w-4 h-4" />
                  Voir
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 text-slate-600 hover:bg-slate-50 transition-colors">
                  <Copy className="w-4 h-4" />
                  Dupliquer
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 text-slate-600 hover:bg-slate-50 transition-colors">
                  <Download className="w-4 h-4" />
                  PDF
                </button>
                {quote.status === 'draft' && (
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 text-blue-600 hover:bg-blue-50 transition-colors font-medium">
                    <Send className="w-4 h-4" />
                    Envoyer
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
