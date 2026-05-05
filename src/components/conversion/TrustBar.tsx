import { Users, Star, ShieldCheck, MapPin } from 'lucide-react'
import { getSiteStats, formatProviderCount } from '@/lib/data/stats'

interface TrustBarProps {
  className?: string
}

/**
 * Barre de confiance horizontale affichant les indicateurs clés du site.
 * Server component — récupère les stats réelles depuis Supabase.
 * Fallback vers des valeurs statiques si la DB est indisponible.
 */
export default async function TrustBar({ className = '' }: TrustBarProps) {
  const stats = await getSiteStats()

  // 2026-05-05 pivot full RGE — labels alignés sur "100% RGE certifiés"
  // (Qualibat, Qualifelec, QualiPAC, Qualit'EnR…). artisanCount déjà filtré
  // RGE-only en amont via getSiteStats.
  const artisanLabel =
    stats.artisanCount > 0
      ? `${formatProviderCount(stats.artisanCount)}+ artisans RGE certifiés`
      : '45 000+ artisans RGE certifiés'

  const reviewLabel =
    stats.reviewCount > 0
      ? `${formatProviderCount(stats.reviewCount)} avis vérifiés`
      : 'Avis vérifiés'

  const deptLabel =
    stats.deptCount > 0 ? `${stats.deptCount} départements couverts` : '101 départements couverts'

  const points = [
    {
      icon: <Users className="h-4 w-4 text-primary-600 shrink-0" aria-hidden="true" />,
      label: artisanLabel,
    },
    {
      icon: <Star className="h-4 w-4 text-primary-600 shrink-0" aria-hidden="true" />,
      label: reviewLabel,
    },
    {
      icon: <ShieldCheck className="h-4 w-4 text-primary-600 shrink-0" aria-hidden="true" />,
      label: 'RGE vérifié ADEME',
    },
    {
      icon: <MapPin className="h-4 w-4 text-primary-600 shrink-0" aria-hidden="true" />,
      label: deptLabel,
    },
  ]

  return (
    <div
      role="status"
      aria-label="Chiffres clés ServicesArtisans"
      className={`bg-primary-50/60 border-b border-primary-100 py-2.5 px-4 ${className}`}
    >
      <div className="max-w-6xl mx-auto">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 md:flex md:items-center md:justify-between md:gap-6">
          {points.map((point) => (
            <li
              key={point.label}
              className="flex items-center gap-1.5 text-xs sm:text-sm text-charcoal-700"
            >
              {point.icon}
              <span className="font-medium">{point.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
