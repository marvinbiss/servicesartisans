'use client'

import { useState, useEffect, useCallback } from 'react'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'

interface Testimonial {
  name: string
  city: string
  rating: number
  service: string
  text: string
  initials: string
  avatarBg: string
}

const testimonials: Testimonial[] = [
  {
    name: 'Nathalie D.',
    city: 'Lyon',
    rating: 5,
    service: 'Plomberie',
    text: 'Fuite sous l\'évier un dimanche soir. J\'ai envoyé ma demande et dès le lundi matin, un plombier m\'a rappelée. Intervention rapide, prix conforme au devis. Je recommande.',
    initials: 'ND',
    avatarBg: 'bg-primary-100 text-primary-700',
  },
  {
    name: 'François M.',
    city: 'Bordeaux',
    rating: 5,
    service: 'Électricité',
    text: 'Je devais refaire le tableau électrique de ma maison des années 70. Trois devis reçus en moins de 24h, j\'ai pu comparer sereinement. L\'artisan choisi a fait un travail impeccable.',
    initials: 'FM',
    avatarBg: 'bg-accent-100 text-accent-700',
  },
  {
    name: 'Sophie L.',
    city: 'Toulouse',
    rating: 4,
    service: 'Peinture',
    text: 'Appartement de 60m² à repeindre avant emménagement. Le service m\'a permis de trouver un peintre sérieux sans passer des heures au téléphone. Très pratique.',
    initials: 'SL',
    avatarBg: 'bg-secondary-100 text-secondary-700',
  },
  {
    name: 'Marc B.',
    city: 'Nantes',
    rating: 5,
    service: 'Couverture',
    text: 'Toiture qui fuyait après la tempête. J\'étais inquiet du coût. Grâce aux 3 devis gratuits, j\'ai trouvé un couvreur compétent à un prix juste. Réparation durable.',
    initials: 'MB',
    avatarBg: 'bg-primary-100 text-primary-700',
  },
  {
    name: 'Isabelle R.',
    city: 'Strasbourg',
    rating: 5,
    service: 'Serrurerie',
    text: 'Porte claquée avec les clés à l\'intérieur. J\'ai utilisé le service en urgence et un serrurier est intervenu dans l\'heure. Tarif transparent, pas de mauvaise surprise.',
    initials: 'IR',
    avatarBg: 'bg-accent-100 text-accent-700',
  },
  {
    name: 'Philippe G.',
    city: 'Marseille',
    rating: 4,
    service: 'Chauffage',
    text: 'Entretien annuel de ma chaudière gaz. Premier devis reçu 2h après ma demande. Le chauffagiste était ponctuel et professionnel. Je réutiliserai le service.',
    initials: 'PG',
    avatarBg: 'bg-secondary-100 text-secondary-700',
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} étoiles sur 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < rating
              ? 'fill-secondary-400 text-secondary-400'
              : 'fill-charcoal-200 text-charcoal-200'
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

interface InlineTestimonialProps {
  /** How many testimonials to show at a time (desktop) */
  count?: 1 | 2 | 3
  /** Auto-rotate interval in ms. 0 to disable. */
  autoRotate?: number
  className?: string
}

export default function InlineTestimonial({
  count = 1,
  autoRotate = 6000,
  className = '',
}: InlineTestimonialProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }, [])

  const prev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }, [])

  useEffect(() => {
    if (!autoRotate) return
    const timer = setInterval(next, autoRotate)
    return () => clearInterval(timer)
  }, [autoRotate, next])

  // Get visible testimonials with wrapping
  const visible: Testimonial[] = []
  for (let i = 0; i < count; i++) {
    visible.push(testimonials[(currentIndex + i) % testimonials.length])
  }

  return (
    <section aria-label="Avis clients" className={className}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading text-sm font-semibold text-charcoal-900">
          Ils nous font confiance
        </h3>
        {testimonials.length > count && (
          <div className="flex items-center gap-1">
            <button
              onClick={prev}
              className="rounded-full p-1 text-charcoal-400 transition-colors hover:bg-sand-100 hover:text-charcoal-700"
              aria-label="Avis précédent"
              type="button"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              className="rounded-full p-1 text-charcoal-400 transition-colors hover:bg-sand-100 hover:text-charcoal-700"
              aria-label="Avis suivant"
              type="button"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div
        className={`grid gap-3 ${
          count === 1 ? 'grid-cols-1' : count === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'
        }`}
      >
        {visible.map((t) => (
          <article
            key={t.name}
            className="rounded-xl border border-sand-300 bg-white p-4 shadow-soft transition-shadow hover:shadow-soft-lg"
          >
            <div className="flex items-center gap-3 mb-2.5">
              {/* Avatar */}
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${t.avatarBg}`}
                aria-hidden="true"
              >
                {t.initials}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-charcoal-900 truncate">
                  {t.name}
                </p>
                <p className="text-2xs text-charcoal-500">
                  {t.city} &middot; {t.service}
                </p>
              </div>
            </div>

            <StarRating rating={t.rating} />

            <p className="mt-2 text-xs leading-relaxed text-charcoal-600 line-clamp-3">
              &laquo; {t.text} &raquo;
            </p>
          </article>
        ))}
      </div>

      {/* Dots indicator */}
      {testimonials.length > count && (
        <div className="flex justify-center gap-1.5 mt-3" aria-hidden="true">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? 'w-4 bg-primary-400'
                  : 'w-1.5 bg-charcoal-200 hover:bg-charcoal-300'
              }`}
              aria-label={`Aller au témoignage ${i + 1}`}
              type="button"
            />
          ))}
        </div>
      )}
    </section>
  )
}
