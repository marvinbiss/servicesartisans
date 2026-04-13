/**
 * Composant partagé pour les OG images dynamiques.
 * Utilisé par toutes les routes opengraph-image.tsx du site.
 *
 * Design : card sombre (#0F0E0C) avec gradient terracotta/ambre,
 * logo ServicesArtisans en bas, texte dynamique au centre.
 */

interface OgCardProps {
  /** Ligne principale (ex: "Plombier") */
  headline: string
  /** Sous-titre coloré ambre (ex: "à Paris") */
  subline?: string
  /** Info complémentaire grisée (ex: "Seine (75)") */
  detail?: string
  /** Badge contextuel en haut (ex: "DEVIS GRATUIT", "URGENCE 24/7") */
  badge?: string
  /** Couleur du badge (défaut: ambre) */
  badgeColor?: string
  /** Tagline sous le divider */
  tagline?: string
}

export function OgCard({
  headline,
  subline,
  detail,
  badge,
  badgeColor = '#f59e0b',
  tagline = 'Comparez les profils · Devis gratuit',
}: OgCardProps) {
  return (
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
            'radial-gradient(ellipse at 30% 20%, rgba(232, 107, 75, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)',
          display: 'flex',
        }}
      />

      {/* Top accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: 'linear-gradient(90deg, #E86B4B, #f59e0b, #E86B4B)',
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
          padding: '0 60px',
        }}
      >
        {/* Badge */}
        {badge && (
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: badgeColor,
              textTransform: 'uppercase',
              letterSpacing: 3,
              marginBottom: 24,
              padding: '6px 20px',
              border: `2px solid ${badgeColor}`,
              borderRadius: 8,
              display: 'flex',
            }}
          >
            {badge}
          </div>
        )}

        {/* Headline */}
        <div
          style={{
            fontSize: headline.length > 25 ? 52 : 64,
            fontWeight: 800,
            color: 'white',
            marginBottom: subline ? 16 : 24,
            textAlign: 'center',
            lineHeight: 1.1,
            display: 'flex',
          }}
        >
          {headline}
        </div>

        {/* Subline */}
        {subline && (
          <div
            style={{
              fontSize: 44,
              fontWeight: 600,
              color: '#f59e0b',
              marginBottom: 12,
              display: 'flex',
              textAlign: 'center',
            }}
          >
            {subline}
          </div>
        )}

        {/* Detail */}
        {detail && (
          <div
            style={{
              fontSize: 24,
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: 36,
              display: 'flex',
            }}
          >
            {detail}
          </div>
        )}

        {/* Tagline */}
        {tagline && !detail && (
          <div
            style={{
              fontSize: 24,
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: 36,
              display: 'flex',
            }}
          >
            {tagline}
          </div>
        )}

        {/* Accent divider */}
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

        {/* Brand footer */}
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
    </div>
  )
}
