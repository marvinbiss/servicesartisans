import { Clock, Shield, CheckCircle, Star } from 'lucide-react'

interface TrustPoint {
  icon: React.ReactNode
  label: string
}

const trustPoints: TrustPoint[] = [
  {
    icon: <Clock className="h-4 w-4 text-primary-600 shrink-0" aria-hidden="true" />,
    label: 'Devis en 48h',
  },
  {
    icon: <CheckCircle className="h-4 w-4 text-primary-600 shrink-0" aria-hidden="true" />,
    label: '100% gratuit, sans engagement',
  },
  {
    icon: <Shield className="h-4 w-4 text-primary-600 shrink-0" aria-hidden="true" />,
    label: 'Artisans v\u00e9rifi\u00e9s SIREN',
  },
  {
    icon: <Star className="h-4 w-4 text-primary-600 shrink-0" aria-hidden="true" />,
    label: 'Satisfaction garantie',
  },
]

interface TrustPromiseBannerProps {
  variant?: 'compact' | 'full'
  className?: string
}

export default function TrustPromiseBanner({
  variant = 'compact',
  className = '',
}: TrustPromiseBannerProps) {
  const points = variant === 'compact' ? trustPoints.slice(0, 3) : trustPoints

  return (
    <div
      role="status"
      aria-label="Nos engagements"
      className={`bg-sand-50 border border-sand-200 rounded-xl py-3 px-4 ${className}`}
    >
      <ul
        className={
          variant === 'compact'
            ? 'flex flex-wrap items-center justify-center gap-x-6 gap-y-2'
            : 'grid grid-cols-2 gap-3 md:flex md:flex-row md:items-center md:justify-between md:gap-6'
        }
        role="list"
      >
        {points.map((point) => (
          <li
            key={point.label}
            className="flex items-center gap-2 text-sm text-charcoal-700 whitespace-nowrap"
          >
            {point.icon}
            <span className="font-medium">{point.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
