import { Metadata } from 'next'
import ArtisanPageClient from './ArtisanPageClient'
import { Artisan, Review } from '@/components/artisan'

// Preload critical resources component for better performance
function PreloadHints({ artisan }: { artisan: Artisan | null }) {
  if (!artisan) return null

  return (
    <>
      {/* Preload hero image if available */}
      {artisan.avatar_url && (
        <link
          rel="preload"
          href={artisan.avatar_url}
          as="image"
          // @ts-expect-error - fetchPriority is valid but not in React types yet
          fetchpriority="high"
        />
      )}
      {/* DNS prefetch for external resources */}
      <link rel="dns-prefetch" href="//umjmbdbwcsxrvfqktiui.supabase.co" />
      <link rel="preconnect" href="https://umjmbdbwcsxrvfqktiui.supabase.co" crossOrigin="anonymous" />
      {/* Preload OpenStreetMap for map component */}
      <link rel="dns-prefetch" href="//www.openstreetmap.org" />
    </>
  )
}

// Helper function to get display name
function getDisplayName(artisan: Artisan): string {
  if (artisan.is_center && artisan.business_name) {
    return artisan.business_name
  }
  if (artisan.business_name) {
    return artisan.business_name
  }
  return `${artisan.first_name || ''} ${artisan.last_name || ''}`.trim() || 'Artisan'
}

// Fetch artisan data from API (server-side)
async function getArtisan(id: string): Promise<{ artisan: Artisan | null; reviews: Review[] }> {
  try {
    // Use localhost in development, production URL otherwise
    const isDev = process.env.NODE_ENV === 'development'
    const baseUrl = isDev
      ? 'http://localhost:3000'
      : (process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr')
    const response = await fetch(`${baseUrl}/api/artisans/${id}`, {
      cache: 'no-store',
    })

    if (response.ok) {
      const data = await response.json()
      if (data.success && data.artisan) {
        return { artisan: data.artisan, reviews: data.reviews || [] }
      }
    }
  } catch (error) {
    console.error('Error fetching artisan:', error)
  }

  return { artisan: null, reviews: [] }
}

// Helper function to truncate text to a specific length at word boundary
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  const truncated = text.substring(0, maxLength - 3)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...'
}

// Generate dynamic metadata with optimized lengths for SEO
export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const { artisan, reviews } = await getArtisan(params.id)

  if (!artisan) {
    return {
      title: 'Artisan non trouve | ServicesArtisans',
      description: 'Cet artisan n\'existe pas ou n\'est plus disponible sur ServicesArtisans.',
    }
  }

  const displayName = getDisplayName(artisan)

  // Optimized title: 50-60 characters for better SEO
  const baseTitle = `${displayName} - ${artisan.specialty} ${artisan.city}`
  const title = truncateText(baseTitle, 60)

  // Optimized description: 150-160 characters for better SERP display
  const ratingText = artisan.review_count > 0
    ? `Note ${artisan.average_rating}/5 (${artisan.review_count} avis).`
    : ''
  const verifiedText = artisan.is_verified ? 'Artisan verifie.' : ''
  const priceText = artisan.hourly_rate ? `Des ${artisan.hourly_rate}€/h.` : ''

  const descParts = [
    `${displayName}, ${artisan.specialty} a ${artisan.city}.`,
    ratingText,
    verifiedText,
    priceText,
    'Devis gratuit.'
  ].filter(Boolean).join(' ')

  const description = truncateText(descParts, 160)

  // Structured data for reviews (for rich snippets in search results)
  const reviewStructuredData = reviews.length > 0 ? reviews.slice(0, 10).map(review => ({
    '@type': 'Review',
    'reviewRating': {
      '@type': 'Rating',
      'ratingValue': review.rating,
      'bestRating': 5,
      'worstRating': 1
    },
    'author': {
      '@type': 'Person',
      'name': review.author
    },
    'datePublished': review.date,
    'reviewBody': review.comment,
    ...(review.verified && { 'isVerified': true })
  })) : []

  return {
    title,
    description,
    keywords: [
      artisan.specialty,
      `${artisan.specialty} ${artisan.city}`,
      artisan.city,
      artisan.postal_code,
      'artisan',
      'devis gratuit',
      ...artisan.services.slice(0, 5),
    ],
    openGraph: {
      title: truncateText(`${displayName} - ${artisan.specialty} a ${artisan.city}`, 70),
      description: truncateText(
        `Note ${artisan.average_rating}/5 sur ${artisan.review_count} avis. ${artisan.description || `${artisan.specialty} professionnel a ${artisan.city}`}`,
        200
      ),
      type: 'website',
      locale: 'fr_FR',
      url: `https://servicesartisans.fr/services/artisan/${artisan.id}`,
      siteName: 'ServicesArtisans',
      images: artisan.avatar_url ? [
        {
          url: artisan.avatar_url,
          width: 400,
          height: 400,
          alt: `${displayName} - ${artisan.specialty}`,
        },
      ] : [
        {
          url: 'https://servicesartisans.fr/og-artisan.jpg',
          width: 1200,
          height: 630,
          alt: `${displayName} - ${artisan.specialty} a ${artisan.city}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: truncateText(`${displayName} - ${artisan.specialty}`, 70),
      description: truncateText(`Note ${artisan.average_rating}/5 - ${artisan.review_count} avis verifies`, 200),
    },
    alternates: {
      canonical: `https://servicesartisans.fr/services/artisan/${artisan.id}`,
    },
    robots: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
    other: {
      'geo.region': 'FR',
      'geo.placename': artisan.city,
      ...(artisan.latitude && artisan.longitude && {
        'geo.position': `${artisan.latitude};${artisan.longitude}`,
        'ICBM': `${artisan.latitude}, ${artisan.longitude}`,
      }),
      ...(reviewStructuredData.length > 0 && {
        'review-count': String(artisan.review_count),
        'average-rating': String(artisan.average_rating),
      }),
    },
  }
}

// ISR configuration
export const revalidate = 3600 // Revalidate every hour

// Main page component (server component)
export default async function ArtisanPage({
  params,
}: {
  params: { id: string }
}) {
  const { artisan, reviews } = await getArtisan(params.id)

  return (
    <>
      {/* Preload critical resources for faster page load */}
      <PreloadHints artisan={artisan} />
      <ArtisanPageClient
        initialArtisan={artisan}
        initialReviews={reviews}
        artisanId={params.id}
      />
    </>
  )
}
