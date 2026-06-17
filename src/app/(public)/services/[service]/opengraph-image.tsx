import { ImageResponse } from 'next/og'
import { services as staticServicesList } from '@/lib/data/france'

export const runtime = 'edge'

export const alt = 'ServicesArtisans — Artisans RGE certifiés en France'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ service: string }> }) {
  const { service: serviceSlug } = await params

  const staticSvc = staticServicesList.find((s) => s.slug === serviceSlug)
  const serviceName = staticSvc?.name || serviceSlug

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

      {/* Top amber accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: 'linear-gradient(90deg, #2563eb, #E0723F, #2563eb)',
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
          padding: '0 60px',
        }}
      >
        {/* Service name */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: 'white',
            marginBottom: 20,
            textAlign: 'center',
            lineHeight: 1.1,
            display: 'flex',
          }}
        >
          {serviceName}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 34,
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: 16,
            display: 'flex',
            textAlign: 'center',
          }}
        >
          {`Artisans RGE certifiés en France`}
        </div>

        {/* Sub-subtitle */}
        <div
          style={{
            fontSize: 24,
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: 40,
            display: 'flex',
          }}
        >
          Comparez les profils et demandez un devis gratuit
        </div>

        {/* Accent divider */}
        <div
          style={{
            width: 120,
            height: 4,
            borderRadius: 2,
            background: 'linear-gradient(90deg, #E0723F, #E0723F)',
            marginBottom: 40,
            display: 'flex',
          }}
        />

        {/* Brand footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          {/* House icon */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #E0723F, #A23A1F)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: 24,
                fontWeight: 800,
                color: 'white',
                letterSpacing: -1.1,
                lineHeight: 1,
              }}
            >
              SA
            </div>
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
            <span style={{ color: '#E0723F' }}>Artisans</span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>.fr</span>
          </span>
        </div>
      </div>
    </div>,
    {
      ...size,
    }
  )
}
