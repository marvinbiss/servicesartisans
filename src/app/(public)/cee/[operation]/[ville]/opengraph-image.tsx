import { ImageResponse } from 'next/og'
import { getVilleBySlug } from '@/lib/data/france'

export const runtime = 'edge'

export const alt = 'ServicesArtisans — Prime CEE locale'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ operation: string; ville: string }>
}) {
  const { operation: operationSlug, ville: villeSlug } = await params

  const ville = getVilleBySlug(villeSlug)
  const cityName = ville?.name || villeSlug
  const departement = ville?.departement || ''
  const operationCode = operationSlug.toUpperCase()

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0F2A47',
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
            'radial-gradient(ellipse at 30% 20%, rgba(59, 130, 246, 0.35) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(245, 158, 11, 0.2) 0%, transparent 55%)',
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
          background: 'linear-gradient(90deg, #3b82f6, #f59e0b, #3b82f6)',
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
            fontSize: 26,
            fontWeight: 700,
            color: '#60a5fa',
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            padding: '8px 18px',
            borderRadius: 999,
            marginBottom: 24,
            display: 'flex',
            letterSpacing: 1,
          }}
        >
          PRIME CEE 2026
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: 'white',
            marginBottom: 18,
            textAlign: 'center',
            lineHeight: 1.05,
            display: 'flex',
            letterSpacing: -1,
          }}
        >
          {operationCode}
        </div>
        <div
          style={{
            fontSize: 40,
            fontWeight: 600,
            color: '#fcd34d',
            marginBottom: 12,
            display: 'flex',
            textAlign: 'center',
          }}
        >
          {`à ${cityName}`}
        </div>
        {departement && (
          <div
            style={{
              fontSize: 24,
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.65)',
              marginBottom: 30,
              display: 'flex',
            }}
          >
            {departement}
          </div>
        )}
        <div
          style={{
            fontSize: 22,
            color: 'rgba(255, 255, 255, 0.85)',
            marginBottom: 36,
            display: 'flex',
          }}
        >
          Artisan RGE · Cumul MaPrimeRénov&apos;
        </div>
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
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
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
            <span style={{ color: '#fcd34d' }}>Artisans</span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>.fr</span>
          </span>
        </div>
      </div>
    </div>,
    { ...size }
  )
}
