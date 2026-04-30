import { ImageResponse } from 'next/og'
import { getCommuneBySlug } from '@/lib/data/commune-data'

export const runtime = 'edge'

export const alt = 'ServicesArtisans — Trouvez un artisan dans votre commune'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ commune: string }> }) {
  const { commune } = await params

  const data = await getCommuneBySlug(commune).catch(() => null)
  const name = data?.name || commune
  const departement = data?.departement_name || data?.departement_code || ''
  const region = data?.region_name || ''
  const population = data?.population
    ? data.population.toLocaleString('fr-FR') + ' habitants'
    : null

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0F0E0C',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'radial-gradient(ellipse at 30% 20%, rgba(232, 107, 75, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(245, 158, 11, 0.15) 0%, transparent 55%)',
          display: 'flex',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: 'linear-gradient(90deg, #2563eb, #f59e0b, #2563eb)',
          display: 'flex',
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
          padding: '0 60px',
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: 16,
            display: 'flex',
            letterSpacing: 1,
          }}
        >
          ARTISANS DANS VOTRE COMMUNE
        </div>
        <div
          style={{
            fontSize: 70,
            fontWeight: 800,
            color: 'white',
            marginBottom: 18,
            textAlign: 'center',
            lineHeight: 1.05,
            display: 'flex',
            letterSpacing: -1,
          }}
        >
          {name}
        </div>
        {departement && (
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: '#f59e0b',
              marginBottom: 12,
              display: 'flex',
              textAlign: 'center',
            }}
          >
            {departement}
            {region ? ` · ${region}` : ''}
          </div>
        )}
        {population && (
          <div
            style={{
              fontSize: 22,
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.65)',
              marginBottom: 30,
              display: 'flex',
            }}
          >
            {population}
          </div>
        )}
        <div
          style={{
            width: 120,
            height: 4,
            borderRadius: 2,
            background: 'linear-gradient(90deg, #E86B4B, #f59e0b)',
            marginBottom: 36,
            display: 'flex',
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #E86B4B, #C24B2A)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="26" height="26" viewBox="0 0 48 48" fill="white">
              <path
                fillRule="evenodd"
                d="M24 11 L38.5 24 L35 24 L35 37 L13 37 L13 24 L9.5 24 Z M21 37 V29 A3 3 0 0 1 27 29 V37 Z"
              />
            </svg>
          </div>
          <span
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: 'white',
              letterSpacing: -0.5,
            }}
          >
            Services
            <span style={{ color: '#f59e0b' }}>Artisans</span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>.fr</span>
          </span>
        </div>
      </div>
    </div>,
    { ...size }
  )
}
