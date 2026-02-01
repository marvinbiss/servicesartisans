'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  MessageSquare,
  Check,
  X,
  ChevronDown,
  Euro,
  Zap,
  Star,
  AlertCircle,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export interface Lead {
  id: string
  clientName: string
  clientEmail: string
  clientPhone: string
  service: string
  description: string
  location: string
  budget?: string
  urgency: 'normal' | 'urgent' | 'flexible'
  status: 'new' | 'contacted' | 'quoted' | 'accepted' | 'rejected'
  createdAt: Date
  preferredDate?: string
  preferredTime?: string
}

interface LeadCardProps {
  lead: Lead
  onAccept?: (id: string) => void
  onReject?: (id: string) => void
  onContact?: (id: string) => void
  variant?: 'default' | 'compact'
}

const urgencyConfig = {
  urgent: {
    label: 'Urgent',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: Zap,
  },
  normal: {
    label: 'Normal',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Clock,
  },
  flexible: {
    label: 'Flexible',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: Calendar,
  },
}

const statusConfig = {
  new: { label: 'Nouveau', color: 'bg-blue-500' },
  contacted: { label: 'Contacté', color: 'bg-yellow-500' },
  quoted: { label: 'Devis envoyé', color: 'bg-purple-500' },
  accepted: { label: 'Accepté', color: 'bg-green-500' },
  rejected: { label: 'Refusé', color: 'bg-slate-400' },
}

export function LeadCard({
  lead,
  onAccept,
  onReject,
  onContact,
  variant = 'default',
}: LeadCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const urgency = urgencyConfig[lead.urgency]
  const status = statusConfig[lead.status]
  const UrgencyIcon = urgency.icon

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-colors"
      >
        <div className={`w-2 h-2 rounded-full ${status.color}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900 truncate">
              {lead.clientName}
            </span>
            <span className="text-sm text-slate-500">•</span>
            <span className="text-sm text-slate-600 truncate">{lead.service}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{lead.location}</span>
          </div>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full border ${urgency.color}`}
        >
          {urgency.label}
        </span>
        <span className="text-xs text-slate-400">
          {formatDistanceToNow(lead.createdAt, { addSuffix: true, locale: fr })}
        </span>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className={`
        bg-white rounded-2xl border-2 overflow-hidden transition-all
        ${lead.status === 'new' ? 'border-blue-300 shadow-lg shadow-blue-100' : 'border-slate-200'}
      `}
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{lead.clientName}</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <MapPin className="w-3.5 h-3.5" />
                {lead.location}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${urgency.color}`}
            >
              <UrgencyIcon className="w-3 h-3" />
              {urgency.label}
            </span>
            {lead.status === 'new' && (
              <span className="flex items-center gap-1 text-xs bg-blue-600 text-white px-2.5 py-1 rounded-full">
                <Star className="w-3 h-3" />
                Nouveau
              </span>
            )}
          </div>
        </div>

        {/* Service & Description */}
        <div className="mb-4">
          <div className="font-medium text-slate-900 mb-1">{lead.service}</div>
          <p className="text-sm text-slate-600 line-clamp-2">{lead.description}</p>
        </div>

        {/* Quick Info */}
        <div className="flex flex-wrap gap-3 mb-4">
          {lead.budget && (
            <div className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
              <Euro className="w-4 h-4 text-slate-500" />
              {lead.budget}
            </div>
          )}
          {lead.preferredDate && (
            <div className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
              <Calendar className="w-4 h-4 text-slate-500" />
              {lead.preferredDate}
            </div>
          )}
          {lead.preferredTime && (
            <div className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
              <Clock className="w-4 h-4 text-slate-500" />
              {lead.preferredTime}
            </div>
          )}
        </div>

        {/* Expandable Contact Info */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Voir les coordonnées
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
                <a
                  href={`tel:${lead.clientPhone}`}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <Phone className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-slate-900">{lead.clientPhone}</span>
                </a>
                <a
                  href={`mailto:${lead.clientEmail}`}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-slate-900">{lead.clientEmail}</span>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions Footer */}
      {lead.status === 'new' && (
        <div className="flex border-t border-slate-200">
          <button
            onClick={() => onReject?.(lead.id)}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 text-slate-600 hover:bg-slate-50 transition-colors border-r border-slate-200"
          >
            <X className="w-5 h-5" />
            Refuser
          </button>
          <button
            onClick={() => onContact?.(lead.id)}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 text-blue-600 hover:bg-blue-50 transition-colors border-r border-slate-200"
          >
            <MessageSquare className="w-5 h-5" />
            Contacter
          </button>
          <button
            onClick={() => onAccept?.(lead.id)}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 text-white bg-green-500 hover:bg-green-600 transition-colors font-medium"
          >
            <Check className="w-5 h-5" />
            Accepter
          </button>
        </div>
      )}

      {/* Status Footer for other states */}
      {lead.status !== 'new' && (
        <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status.color}`} />
            <span className="text-sm font-medium text-slate-600">
              {status.label}
            </span>
          </div>
          <span className="text-xs text-slate-400">
            {formatDistanceToNow(lead.createdAt, { addSuffix: true, locale: fr })}
          </span>
        </div>
      )}
    </motion.div>
  )
}

// Empty state for no leads
export function LeadEmptyState() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="font-semibold text-slate-900 mb-2">
        Aucune demande pour le moment
      </h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto">
        Les nouvelles demandes de clients apparaîtront ici. Assurez-vous que votre
        profil est complet pour recevoir plus de leads.
      </p>
    </div>
  )
}
