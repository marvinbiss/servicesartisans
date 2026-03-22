'use client'

import { ReactNode } from 'react'
import { clsx } from 'clsx'

export interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
  icon?: ReactNode
  children: ReactNode
  className?: string
}

const variantStyles = {
  primary: 'bg-primary-50 text-primary-700 border-primary-200',
  secondary: 'bg-charcoal-100 text-charcoal-700 border-charcoal-200',
  success: 'bg-accent-50 text-accent-700 border-accent-200',
  warning: 'bg-secondary-50 text-secondary-700 border-secondary-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  neutral: 'bg-sand-200 text-charcoal-700 border-sand-300',
}

const dotColors = {
  primary: 'bg-primary-400',
  secondary: 'bg-charcoal-500',
  success: 'bg-accent-500',
  warning: 'bg-secondary-500',
  error: 'bg-red-500',
  neutral: 'bg-charcoal-400',
}

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
}

export default function Badge({
  variant = 'neutral',
  size = 'md',
  dot = false,
  icon,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full',
            dotColors[variant]
          )}
        />
      )}
      {icon}
      {children}
    </span>
  )
}

// Preset badges for booking statuses
export function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    confirmed: { variant: 'success', label: 'Confirmé' },
    pending: { variant: 'warning', label: 'En attente' },
    cancelled: { variant: 'error', label: 'Annulé' },
    completed: { variant: 'primary', label: 'Terminé' },
    no_show: { variant: 'neutral', label: 'Absent' },
  }

  const config = statusConfig[status] || { variant: 'neutral' as const, label: status }

  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  )
}

// Slot availability badges
export function SlotBadge({ type }: { type: 'popular' | 'recommended' | 'last_minute' | 'available' }) {
  const config: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    popular: { variant: 'warning', label: 'Très demandé' },
    recommended: { variant: 'primary', label: 'Recommandé' },
    last_minute: { variant: 'error', label: 'Dernière minute' },
    available: { variant: 'success', label: 'Disponible' },
  }

  const { variant, label } = config[type]

  return (
    <Badge variant={variant} size="sm">
      {label}
    </Badge>
  )
}
