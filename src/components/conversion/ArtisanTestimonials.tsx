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

// Vrais témoignages d'artisans inscrits uniquement (avec accord écrit).
// Tant que ce tableau est vide, la section ne s'affiche pas — on ne shippe
// JAMAIS de faux avis nominatifs (risque DGCCRF + perte de crédibilité).
const QUOTES: ArtisanQuote[] = []

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
  if (QUOTES.length === 0) return null

  return (
    <section aria-label="Témoignages d'artisans" className="border-y border-sand-200 bg-sand-50">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-center font-heading text-2xl font-bold text-charcoal-900 lg:text-3xl">
          Ils ont arrêté de courir après les clients
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {QUOTES.map((q) => (
            <figure
              key={q.name}
              className="flex flex-col rounded-2xl bg-white p-6 ring-1 ring-sand-200"
            >
              <Quote className="h-7 w-7 text-primary-200" aria-hidden="true" />
              <blockquote className="mt-3 flex-1 text-charcoal-700">{q.text}</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${q.avatarBg}`}
                >
                  {q.initials}
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-semibold text-charcoal-900">{q.name}</div>
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
