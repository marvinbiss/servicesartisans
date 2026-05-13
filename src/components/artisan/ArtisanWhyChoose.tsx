import { Trophy, Calendar, Shield, Users, MapPin, CheckCircle } from 'lucide-react'
import type { LegacyArtisan } from '@/types/legacy'

interface WhyCard {
  icon: React.ElementType
  title: string
  description: string
}

function getWhyCards(artisan: LegacyArtisan): WhyCard[] {
  const cards: WhyCard[] = []

  if (artisan.creation_date) {
    const creationYear = new Date(artisan.creation_date).getFullYear()
    const currentYear = new Date().getFullYear()
    const years = currentYear - creationYear
    if (years > 0) {
      cards.push({
        icon: Calendar,
        title: 'Expérience',
        description: `${years} ans d'activité`,
      })
    }
  }

  if (artisan.is_verified) {
    cards.push({
      icon: Shield,
      title: 'Fiabilité',
      description: 'Identité vérifiée (SIRET)',
    })
  }

  if (artisan.team_size && artisan.team_size > 1) {
    cards.push({
      icon: Users,
      title: 'Équipe',
      description: `Équipe de ${artisan.team_size} professionnels`,
    })
  }

  if (artisan.intervention_radius_km) {
    cards.push({
      icon: MapPin,
      title: 'Proximité',
      description: `Intervention dans un rayon de ${artisan.intervention_radius_km} km`,
    })
  }

  if (artisan.free_quote) {
    cards.push({
      icon: CheckCircle,
      title: 'Sans engagement',
      description: 'Devis gratuit',
    })
  }

  return cards.slice(0, 3)
}

export function ArtisanWhyChoose({ artisan }: { artisan: LegacyArtisan }) {
  const cards = getWhyCards(artisan)

  if (cards.length === 0) return null

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-sand-200 p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50">
          <Trophy className="w-4.5 h-4.5 text-amber-500" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-semibold text-charcoal-900 font-heading">
          Pourquoi choisir cet artisan
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <div
            key={card.title}
            className="animate-fade-in-up rounded-xl bg-sand-50 border border-sand-200 p-5 hover:border-primary-200 transition-colors"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-50 mb-3">
              <card.icon className="w-5 h-5 text-primary-400" aria-hidden="true" />
            </div>
            <p className="font-semibold text-charcoal-900 mb-1">{card.title}</p>
            <p className="text-sm text-charcoal-600">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
