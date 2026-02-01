'use client'

import { clsx } from 'clsx'

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default' | 'purple'

interface StatusBadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  error: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  default: 'bg-gray-100 text-gray-700',
  purple: 'bg-violet-100 text-violet-700',
}

export function StatusBadge({ variant = 'default', children, className }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        'px-2 py-1 rounded-full text-xs font-medium inline-flex items-center',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

// Pre-defined status badges for common use cases
export function UserStatusBadge({ status }: { status: string }) {
  const variants: Record<string, BadgeVariant> = {
    active: 'success',
    pending: 'warning',
    suspended: 'error',
    banned: 'error',
    deleted: 'default',
  }
  const labels: Record<string, string> = {
    active: 'Actif',
    pending: 'En attente',
    suspended: 'Suspendu',
    banned: 'Banni',
    deleted: 'Supprimé',
  }
  return <StatusBadge variant={variants[status] || 'default'}>{labels[status] || status}</StatusBadge>
}

export function ProviderStatusBadge({ isVerified, isActive }: { isVerified: boolean; isActive: boolean }) {
  if (!isActive) {
    return <StatusBadge variant="error">Suspendu</StatusBadge>
  }
  if (!isVerified) {
    return <StatusBadge variant="warning">En attente</StatusBadge>
  }
  return <StatusBadge variant="success">Vérifié</StatusBadge>
}

export function SubscriptionBadge({ plan }: { plan: string }) {
  const variants: Record<string, BadgeVariant> = {
    premium: 'purple',
    pro: 'info',
    basic: 'info',
    gratuit: 'default',
    free: 'default',
  }
  return (
    <StatusBadge variant={variants[plan] || 'default'}>
      {plan.charAt(0).toUpperCase() + plan.slice(1)}
    </StatusBadge>
  )
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const variants: Record<string, BadgeVariant> = {
    succeeded: 'success',
    paid: 'success',
    pending: 'warning',
    failed: 'error',
    refunded: 'info',
    canceled: 'default',
  }
  const labels: Record<string, string> = {
    succeeded: 'Payé',
    paid: 'Payé',
    pending: 'En attente',
    failed: 'Échoué',
    refunded: 'Remboursé',
    canceled: 'Annulé',
  }
  return <StatusBadge variant={variants[status] || 'default'}>{labels[status] || status}</StatusBadge>
}

export function ReviewStatusBadge({ status }: { status: string }) {
  const variants: Record<string, BadgeVariant> = {
    approved: 'success',
    published: 'success',
    pending: 'warning',
    pending_review: 'warning',
    rejected: 'error',
    hidden: 'default',
    flagged: 'error',
  }
  const labels: Record<string, string> = {
    approved: 'Approuvé',
    published: 'Publié',
    pending: 'En attente',
    pending_review: 'À modérer',
    rejected: 'Rejeté',
    hidden: 'Masqué',
    flagged: 'Signalé',
  }
  return <StatusBadge variant={variants[status] || 'default'}>{labels[status] || status}</StatusBadge>
}

export function BookingStatusBadge({ status }: { status: string }) {
  const variants: Record<string, BadgeVariant> = {
    confirmed: 'success',
    completed: 'success',
    pending: 'warning',
    cancelled: 'error',
    canceled: 'error',
  }
  const labels: Record<string, string> = {
    confirmed: 'Confirmé',
    completed: 'Terminé',
    pending: 'En attente',
    cancelled: 'Annulé',
    canceled: 'Annulé',
  }
  return <StatusBadge variant={variants[status] || 'default'}>{labels[status] || status}</StatusBadge>
}

export function ReportStatusBadge({ status }: { status: string }) {
  const variants: Record<string, BadgeVariant> = {
    pending: 'warning',
    under_review: 'info',
    resolved: 'success',
    dismissed: 'default',
  }
  const labels: Record<string, string> = {
    pending: 'En attente',
    under_review: 'En cours',
    resolved: 'Résolu',
    dismissed: 'Rejeté',
  }
  return <StatusBadge variant={variants[status] || 'default'}>{labels[status] || status}</StatusBadge>
}
