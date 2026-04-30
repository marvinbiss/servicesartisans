import { ImageResponse } from 'next/og'
import { services as staticServicesList, getVilleBySlug } from '@/lib/data/france'

export const runtime = 'edge'

export const alt = 'ServicesArtisans — Artisans RGE certifiés près de chez vous'
export const size = {
  width: 1200,
  height: 630,
}
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
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#064E3B',
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
            'radial-gradient(ellipse at 30% 20%, rgba(16, 185, 129, 0.35) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(34, 197, 94, 0.18) 0%, transparent 55%)',
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
          background: 'linear-gradient(90deg, #10b981, #f59e0b, #10b981)',
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
            color: '#10b981',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            padding: '8px 18px',
            borderRadius: 999,
            marginBottom: 24,
            display: 'flex',
            letterSpacing: 1,
          }}
        >
          ARTISAN RGE CERTIFIÉ
        </div>
        <div
          style={{
            fontSize: 60,
            fontWeight: 800,
            color: 'white',
            marginBottom: 18,
            textAlign: 'center',
            lineHeight: 1.1,
            display: 'flex',
          }}
        >
          {serviceName} RGE
        </div>
        <div
          style={{
            fontSize: 42,
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
          MaPrimeRénov&apos; · CEE · TVA 5,5 %
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
              background: 'linear-gradient(135deg, #10b981, #047857)',
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
