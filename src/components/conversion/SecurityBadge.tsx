import { Lock, ShieldCheck } from 'lucide-react'

interface SecurityBadgeProps {
  className?: string
}

export default function SecurityBadge({ className = '' }: SecurityBadgeProps) {
  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-2xs text-charcoal-400 ${className}`}
      aria-label="Sécurité et confidentialité"
    >
      <span className="inline-flex items-center gap-1">
        <Lock className="h-3 w-3" aria-hidden="true" />
        Connexion sécurisée SSL
      </span>
      <span className="hidden sm:inline text-charcoal-200" aria-hidden="true">
        |
      </span>
      <span className="inline-flex items-center gap-1">
        <ShieldCheck className="h-3 w-3" aria-hidden="true" />
        Données protégées RGPD
      </span>
    </div>
  )
}
