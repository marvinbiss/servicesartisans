'use client'

import { ReactNode } from 'react'
import { clsx } from 'clsx'
import { Search, Inbox, FileQuestion, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export interface EmptyStateProps {
  variant?: 'search' | 'inbox' | 'notFound' | 'error'
  title: string
  description?: string
  icon?: ReactNode
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  secondaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

const defaultIcons = {
  search: Search,
  inbox: Inbox,
  notFound: FileQuestion,
  error: AlertCircle,
}

const iconColors = {
  search: 'text-primary-400 bg-primary-50',
  inbox: 'text-charcoal-500 bg-sand-50',
  notFound: 'text-amber-500 bg-amber-50',
  error: 'text-red-500 bg-red-50',
}

export function EmptyState({
  variant = 'search',
  title,
  description,
  icon,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const DefaultIcon = defaultIcons[variant]
  const IconComponent = icon || <DefaultIcon className="w-12 h-12" />

  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center py-12 px-4',
        className
      )}
    >
      <div
        className={clsx(
          'w-20 h-20 rounded-2xl flex items-center justify-center mb-6',
          iconColors[variant]
        )}
      >
        {IconComponent}
      </div>
      <h3 className="text-xl font-semibold text-charcoal-900 mb-2">{title}</h3>
      {description && <p className="text-charcoal-600 mb-8 max-w-md">{description}</p>}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action &&
            (action.href ? (
              <Link
                href={action.href}
                className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors shadow-lg shadow-primary-400/25"
              >
                {action.label}
              </Link>
            ) : (
              <button
                onClick={action.onClick}
                className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors shadow-lg shadow-primary-400/25"
              >
                {action.label}
              </button>
            ))}
          {secondaryAction &&
            (secondaryAction.href ? (
              <Link
                href={secondaryAction.href}
                className="inline-flex items-center justify-center gap-2 bg-white border-2 border-charcoal-400 text-charcoal-900 px-6 py-3 rounded-xl font-semibold hover:bg-sand-100 focus:outline-none focus:ring-2 focus:ring-charcoal-400 focus:ring-offset-2 transition-colors"
              >
                {secondaryAction.label}
              </Link>
            ) : (
              <button
                onClick={secondaryAction.onClick}
                className="inline-flex items-center justify-center gap-2 bg-white border-2 border-charcoal-400 text-charcoal-900 px-6 py-3 rounded-xl font-semibold hover:bg-sand-100 focus:outline-none focus:ring-2 focus:ring-charcoal-400 focus:ring-offset-2 transition-colors"
              >
                {secondaryAction.label}
              </button>
            ))}
        </div>
      )}
    </div>
  )
}

export default EmptyState
