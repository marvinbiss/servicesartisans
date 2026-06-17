import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = "ServicesArtisans — Annuaire d'artisans RGE certifiés en France"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
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
      {/* Background gradient overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'radial-gradient(ellipse at 30% 20%, rgba(200, 73, 42, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)',
          display: 'flex',
        }}
      />

      {/* Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        {/* Logo area */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 40,
          }}
        >
          {/* House icon */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #E0723F, #A23A1F)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: 40,
                fontWeight: 800,
                color: 'white',
                letterSpacing: -1.8,
                lineHeight: 1,
              }}
            >
              SA
            </div>
          </div>
          <span
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: 'white',
              letterSpacing: -1,
            }}
          >
            Services
            <span style={{ color: '#E0723F' }}>Artisans</span>
          </span>
        </div>

        {/* Main tagline */}
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: 'white',
            marginBottom: 16,
            display: 'flex',
          }}
        >
          Artisans référencés en France — Données SIREN
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
          }}
        >
          Annuaire d'artisans RGE certifiés — Données SIREN officielles
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            width: 120,
            height: 4,
            borderRadius: 2,
            background: 'linear-gradient(90deg, #E0723F, #E0723F)',
            marginTop: 40,
            display: 'flex',
          }}
        />
      </div>
    </div>,
    {
      ...size,
    }
  )
}
