'use client'

import { useEffect, useState } from 'react'
import { Star, Quote } from 'lucide-react'
import { getArtisanUrl } from '@/lib/utils'
import Link from 'next/link'

type ReviewItem = {
  id: string
  rating: number
  content: string
  author_name: string
  provider_id: string
  provider_name: string | null
  created_at: string
}

type Props = {
  providerIds: string[]
  heading?: string
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

export function HubReviewsCarousel({ providerIds, heading = 'Avis récents' }: Props) {
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (providerIds.length === 0) {
      setLoaded(true)
      return
    }
    let cancelled = false
    const ids = providerIds.slice(0, 50).join(',')
    fetch(`/api/reviews/by-providers?ids=${encodeURIComponent(ids)}`)
      .then((r) => (r.ok ? r.json() : { reviews: [] }))
      .then((data) => {
        if (cancelled) return
        setReviews(Array.isArray(data?.reviews) ? data.reviews : [])
        setLoaded(true)
      })
      .catch(() => {
        if (!cancelled) setLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [providerIds])

  if (!loaded) return null
  if (reviews.length === 0) return null

  return (
    <section
      aria-labelledby="hub-reviews-heading"
      className="mx-4 mb-3 bg-white border border-sand-300 rounded-2xl p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Quote className="w-4 h-4 text-primary-500" aria-hidden="true" />
        <h2 id="hub-reviews-heading" className="text-sm font-bold text-charcoal-900">
          {heading}
        </h2>
      </div>
      <div className="-mx-1 px-1 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 motion-reduce:scroll-auto">
        {reviews.map((r) => (
          <article
            key={r.id}
            className="snap-start min-w-[260px] max-w-[320px] flex-shrink-0 bg-sand-50 border border-sand-200 rounded-xl p-3"
          >
            <div className="flex items-center gap-1 mb-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-secondary-400 text-secondary-400' : 'text-sand-400'}`}
                  aria-hidden="true"
                />
              ))}
              <span className="sr-only">Note {r.rating} sur 5</span>
            </div>
            <p className="text-xs text-charcoal-700 leading-relaxed line-clamp-4 mb-2">
              {r.content}
            </p>
            <div className="text-2xs text-charcoal-500 flex items-center justify-between gap-2">
              <span className="font-medium text-charcoal-700 truncate">{r.author_name}</span>
              <time dateTime={r.created_at}>{formatDate(r.created_at)}</time>
            </div>
            {r.provider_name && (
              <Link
                href={getArtisanUrl({ stable_id: r.provider_id, slug: r.provider_name })}
                className="mt-1.5 inline-block text-2xs font-medium text-primary-600 hover:text-primary-700 truncate"
              >
                {r.provider_name} →
              </Link>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
