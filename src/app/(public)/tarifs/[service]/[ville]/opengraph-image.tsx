import { ImageResponse } from 'next/og'
import { services as staticServicesList, getVilleBySlug } from '@/lib/data/france'
import { OgCard } from '@/lib/og/og-card'

export const runtime = 'edge'

export const alt = 'ServicesArtisans — Tarifs artisan'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ service: string; ville: string }>
}) {
  const { service: serviceSlug, ville: villeSlug } = await params

  const staticSvc = staticServicesList.find((s) => s.slug === serviceSlug)
  const ville = getVilleBySlug(villeSlug)

  const serviceName = staticSvc?.name || serviceSlug
  const cityName = ville?.name || villeSlug
  const departement = ville?.departement || ''

  return new ImageResponse(
    <OgCard
      badge="Guide tarifs 2026"
      badgeColor="#3D8B68"
      headline={`Tarifs ${serviceName}`}
      subline={`à ${cityName}`}
      detail={departement}
      tagline="Prix moyens · Grille détaillée · Devis gratuit"
    />,
    { ...size }
  )
}
