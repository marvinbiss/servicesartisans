import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'ServicesArtisans - Trouvez les meilleurs artisans près de chez vous'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Logo/Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 20,
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <span
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: 'white',
              letterSpacing: -2,
            }}
          >
            ServicesArtisans
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            color: 'rgba(255,255,255,0.9)',
            marginBottom: 30,
            textAlign: 'center',
            maxWidth: 800,
          }}
        >
          Trouvez les meilleurs artisans pres de chez vous
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            gap: 40,
            marginTop: 20,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,255,255,0.15)',
              padding: '12px 24px',
              borderRadius: 50,
              color: 'white',
              fontSize: 20,
            }}
          >
            Artisans verifies
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,255,255,0.15)',
              padding: '12px 24px',
              borderRadius: 50,
              color: 'white',
              fontSize: 20,
            }}
          >
            Devis gratuits
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,255,255,0.15)',
              padding: '12px 24px',
              borderRadius: 50,
              color: 'white',
              fontSize: 20,
            }}
          >
            59K+ avis Google
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
