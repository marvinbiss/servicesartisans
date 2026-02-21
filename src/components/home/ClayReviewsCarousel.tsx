'use client'

import { useRef, useEffect, useCallback } from 'react'

const REVIEWS = [
  { name: 'Marie L.', city: 'Lyon', rating: 5, text: 'Plombier excellent, intervention rapide et propre. Je recommande vivement !' },
  { name: 'Thomas B.', city: 'Paris', rating: 5, text: 'Électricien très professionnel. Devis honnête, travail soigné.' },
  { name: 'Sophie M.', city: 'Bordeaux', rating: 5, text: 'Carreleur au top ! Ma salle de bain est magnifique.' },
  { name: 'Pierre D.', city: 'Marseille', rating: 5, text: 'Réactivité impressionnante pour une urgence plomberie. Merci !' },
  { name: 'Julie R.', city: 'Toulouse', rating: 5, text: 'Peintre très minutieux, le rendu est impeccable.' },
  { name: 'Marc T.', city: 'Nantes', rating: 4, text: 'Très bon menuisier, mes fenêtres sont parfaitement posées.' },
]

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg className={`w-3.5 h-3.5 ${filled ? 'text-amber-400' : 'text-stone-300'}`} viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

export function ClayReviewsCarousel() {
  const trackRef = useRef<HTMLDivElement>(null)
  const isPausedRef = useRef(false)

  const scroll = useCallback(() => {
    if (!trackRef.current || isPausedRef.current) return
    const track = trackRef.current
    track.scrollLeft += 1
    if (track.scrollLeft >= track.scrollWidth / 2) {
      track.scrollLeft = 0
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(scroll, 20)
    return () => clearInterval(interval)
  }, [scroll])

  const doubledReviews = [...REVIEWS, ...REVIEWS]

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-hidden"
        onMouseEnter={() => { isPausedRef.current = true }}
        onMouseLeave={() => { isPausedRef.current = false }}
      >
        {doubledReviews.map((review, idx) => (
          <div
            key={idx}
            className="shrink-0 w-72 bg-white/10 border border-white/20 rounded-2xl p-5 backdrop-blur-sm"
          >
            <div className="flex gap-0.5 mb-3">
              {[1, 2, 3, 4, 5].map(i => (
                <StarIcon key={i} filled={i <= review.rating} />
              ))}
            </div>
            <p className="text-white/90 text-sm leading-relaxed mb-4 line-clamp-3">{review.text}</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-clay-400/60 flex items-center justify-center text-white text-xs font-bold">
                {review.name[0]}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{review.name}</p>
                <p className="text-white/60 text-xs">{review.city}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
