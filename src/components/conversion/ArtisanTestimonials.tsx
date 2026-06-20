import { Star, Quote } from 'lucide-react'

/**
 * Témoignages côté ARTISAN (pas côté client) pour la landing d'acquisition.
 *
 * ⚠️ PLACEHOLDERS — à remplacer par de vrais témoignages d'artisans inscrits
 * (avec accord écrit). Ne pas shipper de faux avis nominatifs en production :
 * risque juridique (DGCCRF / faux avis) + perte de crédibilité.
 */
interface ArtisanQuote {
  name: string
  trade: string
  city: string
  rating: number
  text: string
  initials: string
  avatarBg: string
}

const QUOTES: ArtisanQuote[] = [
  {
    name: 'Karim B.',
    trade: 'Plombier',
    city: 'Lyon',
    rating: 5,
    text: "J'ai reçu ma première demande la semaine de mon inscription. Aujourd'hui je remplis mon planning sans démarcher.",
    initials: 'KB',
    avatarBg: 'bg-primary-100 text-primary-700',
  },
  {
    name: 'Sandrine M.',
    trade: 'Électricienne',
    city: 'Nantes',
    rating: 5,
    text: 'Des demandes locales, sérieuses, avec le budget annoncé. Je choisis les chantiers qui me conviennent.',
    initials: 'SM',
    avatarBg: 'bg-accent-100 text-accent-700',
  },
  {
    name: 'José F.',
    trade: 'Maçon',
    city: 'Toulouse',
    rating: 5,
    text: "Gratuit pour commencer, et je ne paie que quand ça m'intéresse. Rien à voir avec les annuaires payants.",
    initials: 'JF',
    avatarBg: 'bg-secondary-100 text-secondary-700',
  },
]

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} étoiles sur 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? 'fill-secondary-400 text-secondary-400' : 'fill-charcoal-200 text-charcoal-200'}`}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

export function ArtisanTestimonials() {
  return (
    <section aria-label="Témoignages d'artisans" className="bg-sand-50 border-y border-sand-200">
      <div className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="font-heading text-2xl lg:text-3xl font-bold text-charcoal-900 text-center">
          Ils ont arrêté de courir après les clients
        </h2>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {QUOTES.map((q) => (
            <figure key={q.name} className="rounded-2xl bg-white p-6 ring-1 ring-sand-200 flex flex-col">
              <Quote className="w-7 h-7 text-primary-200" aria-hidden="true" />
              <blockquote className="mt-3 text-charcoal-700 flex-1">{q.text}</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${q.avatarBg}`}>
                  {q.initials}
                </div>
                <div className="leading-tight">
                  <div className="font-semibold text-charcoal-900 text-sm">{q.name}</div>
                  <div className="text-xs text-charcoal-500">
                    {q.trade} · {q.city}
                  </div>
                </div>
                <div className="ml-auto">
                  <Stars rating={q.rating} />
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
