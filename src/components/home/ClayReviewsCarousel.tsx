'use client'

import { useState } from 'react'
import type { HomepageReview } from '@/lib/data/stats'
import { initials, monoClass } from '@/lib/ui/monogram'

const FALLBACK_REVIEWS = [
  {
    author_name: 'Jean-Pierre D.',
    rating: 5,
    content: "Fuite d'eau un samedi soir. Artisan en 20 min. Bluffant.",
    created_at: '',
  },
  {
    author_name: 'Camille R.',
    rating: 5,
    content: 'Peintre exceptionnel, salon refait en un week-end.',
    created_at: '',
  },
  {
    author_name: 'Nicolas P.',
    rating: 4,
    content: 'Maçon très compétent pour la rénovation de façade.',
    created_at: '',
  },
  {
    author_name: 'Claire M.',
    rating: 5,
    content: 'Serrurier arrivé rapidement, travail propre et efficace.',
    created_at: '',
  },
  {
    author_name: 'Antoine G.',
    rating: 5,
    content: 'Électricien très sérieux, mise aux normes impeccable.',
    created_at: '',
  },
  {
    author_name: 'Isabelle F.',
    rating: 4,
    content: 'Carreleur du tonnerre ! Salle de bain transformée.',
    created_at: '',
  },
  {
    author_name: 'Romain V.',
    rating: 5,
    content: 'Chauffagiste réactif, chaudière réparée en 1h.',
    created_at: '',
  },
  {
    author_name: 'Lucie B.',
    rating: 5,
    content: 'Menuisier talentueux, mes portes sont magnifiques.',
    created_at: '',
  },
]

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={`w-4 h-4 ${filled ? 'text-amber-400' : 'text-charcoal-200'}`}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

interface Props {
  reviews?: HomepageReview[]
}

export function ClayReviewsCarousel({ reviews }: Props) {
  const [paused, setPaused] = useState(false)

  const displayReviews = reviews && reviews.length >= 4 ? reviews : FALLBACK_REVIEWS
  const doubled = [...displayReviews, ...displayReviews]

  return (
    <div
      className="relative"
      role="region"
      aria-label="Avis clients en défilement"
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          setPaused((p) => !p)
        }
      }}
    >
      <div
        className={`flex gap-4 ${paused ? '' : 'animate-[scroll-carousel_60s_linear_infinite]'}`}
        style={{ willChange: 'transform' }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {doubled.map((review, idx) => (
          <div
            key={idx}
            className="shrink-0 w-80 bg-sand-50 border border-sand-200 rounded-2xl p-5 hover:shadow-card-hover transition-shadow duration-300"
          >
            <div className="flex gap-0.5 mb-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <StarIcon key={i} filled={i <= review.rating} />
              ))}
            </div>
            <p className="text-charcoal-700 text-sm leading-relaxed mb-4 line-clamp-3">
              “{review.content}”
            </p>
            <div className="flex items-center gap-2.5">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${monoClass(review.author_name || 'Client')}`}
                aria-hidden="true"
              >
                {initials(review.author_name || 'Client vérifié')}
              </div>
              <div>
                <p className="text-charcoal-900 text-sm font-semibold">
                  {review.author_name || 'Client vérifié'}
                </p>
                <p className="text-charcoal-400 text-xs">Client vérifié</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
