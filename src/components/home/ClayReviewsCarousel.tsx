'use client'

import { useRef, useEffect, useCallback } from 'react'

const REVIEWS = [
  { name: 'Jean-Pierre D.', city: 'Marseille', rating: 5, text: '"Fuite d\'eau un samedi soir. Artisan en 20 min. Bluffant."',        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face&q=80' },
  { name: 'Camille R.',     city: 'Nantes',    rating: 5, text: '"Peintre exceptionnel, salon refait en un week-end."',               avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face&q=80' },
  { name: 'Nicolas P.',     city: 'Toulouse',  rating: 5, text: '"Maçon très compétent pour la rénovation de façade."',              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face&q=80' },
  { name: 'Claire M.',      city: 'Lille',     rating: 5, text: '"Serrurier arrivé rapidement, travail propre et efficace."',        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face&q=80' },
  { name: 'Antoine G.',     city: 'Lyon',      rating: 5, text: '"Électricien très sérieux, mise aux normes impeccable."',           avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face&q=80' },
  { name: 'Isabelle F.',    city: 'Paris',     rating: 5, text: '"Carreleur du tonnerre ! Salle de bain transformée."',              avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face&q=80' },
  { name: 'Romain V.',      city: 'Bordeaux',  rating: 5, text: '"Chauffagiste réactif, chaudière réparée en 1h."',                  avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face&q=80' },
  { name: 'Lucie B.',       city: 'Strasbourg',rating: 5, text: '"Menuisier talentueux, mes portes sont magnifiques."',              avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=face&q=80' },
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={review.avatar}
                alt={review.name}
                className="w-9 h-9 rounded-full object-cover shrink-0"
                style={{ border: '2px solid rgba(255,255,255,.15)' }}
              />
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
