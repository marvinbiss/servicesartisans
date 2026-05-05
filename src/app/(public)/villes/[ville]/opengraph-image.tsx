import { ImageResponse } from 'next/og'
import { getVilleBySlug } from '@/lib/data/france'
import { OgCard } from '@/lib/og/og-card'

export const runtime = 'edge'

export const alt = 'ServicesArtisans — Artisans RGE certifiés dans votre ville'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ ville: string }> }) {
  const { ville: villeSlug } = await params

  const ville = getVilleBySlug(villeSlug)
  const cityName = ville?.name || villeSlug
  const departement = ville?.departement || ''

  return new ImageResponse(
    <OgCard
      headline={`Artisans RGE à ${cityName}`}
      detail={departement}
      tagline="Métiers RGE · Qualibat · Qualifelec · QualiPAC"
    />,
    { ...size }
  )
}
