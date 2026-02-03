'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Eye,
  MessageSquare,
  Calendar,
  Star,
  PhoneCall,
  FileText,
  CreditCard,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type ActivityType =
  | 'profile_view'
  | 'message'
  | 'booking'
  | 'review'
  | 'call'
  | 'quote_request'
  | 'payment'
  | 'new_client'

interface Activity {
  id: string
  type: ActivityType
  title: string
  description?: string
  metadata?: Record<string, any>
  isImportant?: boolean
  createdAt: string
}

interface LiveActivityFeedProps {
  providerId: string
  initialActivities?: Activity[]
  maxItems?: number
  showTimestamps?: boolean
  className?: string
}

const ACTIVITY_CONFIG: Record<
  ActivityType,
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  profile_view: {
    icon: Eye,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  message: {
    icon: MessageSquare,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  booking: {
    icon: Calendar,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  review: {
    icon: Star,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
  call: {
    icon: PhoneCall,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
  },
  quote_request: {
    icon: FileText,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  payment: {
    icon: CreditCard,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  new_client: {
    icon: User,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
  },
}

export function LiveActivityFeed({
  providerId,
  initialActivities = [],
  maxItems = 10,
  showTimestamps = true,
  className,
}: LiveActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities)
  const [newActivityId, setNewActivityId] = useState<string | null>(null)
  const feedRef = useRef<HTMLDivElement>(null)

  // Subscribe to real-time updates
  useEffect(() => {
    // In production, this would connect to Supabase Realtime
    // For demo, we simulate periodic updates
    const interval = setInterval(() => {
      const types: ActivityType[] = [
        'profile_view',
        'message',
        'booking',
        'review',
        'quote_request',
      ]
      const randomType = types[Math.floor(Math.random() * types.length)]

      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        type: randomType,
        title: getActivityTitle(randomType),
        createdAt: new Date().toISOString(),
        isImportant: randomType === 'booking' || randomType === 'review',
      }

      setActivities((prev) => [newActivity, ...prev].slice(0, maxItems))
      setNewActivityId(newActivity.id)

      // Clear highlight after animation
      setTimeout(() => setNewActivityId(null), 2000)
    }, 30000) // Every 30 seconds for demo

    return () => clearInterval(interval)
  }, [providerId, maxItems])

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffMs / 60000)

    if (diffSecs < 60) return 'À l\'instant'
    if (diffMins < 60) return `Il y a ${diffMins} min`
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div
      ref={feedRef}
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Activité en temps réel
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
        </div>
      </div>

      {/* Activity list */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Aucune activité récente</p>
          </div>
        ) : (
          activities.map((activity) => {
            const config = ACTIVITY_CONFIG[activity.type]
            const Icon = config.icon
            const isNew = activity.id === newActivityId

            return (
              <div
                key={activity.id}
                className={cn(
                  'flex items-start gap-3 p-4 transition-colors',
                  isNew && 'bg-blue-50 dark:bg-blue-900/20 animate-pulse',
                  activity.isImportant && 'bg-yellow-50/50 dark:bg-yellow-900/10'
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    'p-2 rounded-full flex-shrink-0',
                    config.bgColor
                  )}
                >
                  <Icon className={cn('w-4 h-4', config.color)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {activity.title}
                  </p>
                  {activity.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {activity.description}
                    </p>
                  )}
                </div>

                {/* Timestamp */}
                {showTimestamps && (
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {formatTime(activity.createdAt)}
                  </span>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function getActivityTitle(type: ActivityType): string {
  const titles: Record<ActivityType, string[]> = {
    profile_view: [
      'Quelqu\'un a consulté votre profil',
      'Nouvelle vue sur votre profil',
      'Un visiteur regarde votre profil',
    ],
    message: [
      'Nouveau message reçu',
      'Un client vous a envoyé un message',
    ],
    booking: [
      'Nouvelle réservation !',
      'Un client a réservé un créneau',
    ],
    review: [
      'Nouvel avis reçu',
      'Un client a laissé un avis',
    ],
    call: [
      'Appel manqué',
      'Tentative d\'appel',
    ],
    quote_request: [
      'Nouvelle demande de devis',
      'Un client demande un devis',
    ],
    payment: [
      'Paiement reçu',
      'Nouveau paiement confirmé',
    ],
    new_client: [
      'Nouveau client inscrit',
      'Un nouveau client vous a découvert',
    ],
  }

  const options = titles[type]
  return options[Math.floor(Math.random() * options.length)]
}

export default LiveActivityFeed
