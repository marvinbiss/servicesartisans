/**
 * 📍 PREMIUM MARKERS - Style Google Maps
 * Marqueurs bleus (standard) et orange (premium)
 */

// Types pour éviter les erreurs TypeScript
declare const L: any

export interface MarkerConfig {
  isPremium?: boolean
  isHighlighted?: boolean
  size?: number
}

/**
 * Crée un marqueur dans le style premium Google Maps
 * Bleu pour standard, Orange/Gold pour premium
 */
export function createPremiumMarker(config: MarkerConfig = {}) {
  if (typeof window === 'undefined' || !L) return undefined

  const { 
    isPremium = false, 
    isHighlighted = false,
    size = 36 
  } = config

  // Couleurs selon le style de l'image
  const baseColor = isPremium ? '#f59e0b' : '#2563eb' // Orange premium ou Bleu standard
  const glowColor = isPremium ? '#fbbf24' : '#3b82f6'
  const finalSize = isHighlighted ? size * 1.15 : size

  return L.divIcon({
    className: `custom-marker ${isPremium ? 'marker-premium' : ''}`,
    html: `
      <div style="
        position: relative;
        width: ${finalSize}px;
        height: ${finalSize}px;
      ">
        <!-- Effet de glow pour premium -->
        ${isPremium ? `
          <div style="
            position: absolute;
            inset: -8px;
            background: radial-gradient(circle, ${glowColor}40 0%, transparent 70%);
            border-radius: 50%;
            animation: glowPulse 2s ease-in-out infinite;
          "></div>
        ` : ''}
        
        <!-- Pin principal -->
        <div style="
          position: relative;
          width: 100%;
          height: 100%;
          background: ${baseColor};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.25),
            inset 0 -2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        ">
          <!-- Icône intérieure -->
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="${finalSize * 0.45}" 
            height="${finalSize * 0.45}" 
            viewBox="0 0 24 24" 
            fill="white"
            style="
              transform: rotate(45deg);
              filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
            "
          >
            ${isPremium ? `
              <!-- Étoile pour premium -->
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            ` : `
              <!-- Pin standard -->
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            `}
          </svg>
          
          ${isPremium ? `
            <!-- Badge "Premium" pour les premium -->
            <div style="
              position: absolute;
              top: -6px;
              right: -6px;
              background: linear-gradient(135deg, #fbbf24, #f59e0b);
              color: white;
              font-size: 8px;
              font-weight: 900;
              padding: 2px 4px;
              border-radius: 4px;
              transform: rotate(45deg);
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              letter-spacing: 0.5px;
            ">P</div>
          ` : ''}
        </div>
      </div>

      <style>
        @keyframes glowPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
      </style>
    `,
    iconSize: [finalSize, finalSize],
    iconAnchor: [finalSize / 2, finalSize],
    popupAnchor: [0, -finalSize],
  })
}

/**
 * Crée le HTML pour une popup premium
 */
export function createPremiumPopupHTML(provider: {
  name: string
  is_premium?: boolean
  is_verified?: boolean
  rating_average?: number
  review_count?: number
  phone?: string
  address_street?: string
  address_city?: string
  address_postal_code?: string
  specialty?: string
  slug?: string
  id: string
}) {
  return `
    <div style="padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <!-- Badge Premium -->
      ${provider.is_premium ? `
        <div class="premium-badge" style="margin-bottom: 12px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          ARTISAN PREMIUM
        </div>
      ` : ''}

      <!-- Titre et Vérification -->
      <div style="display: flex; align-items: start; gap: 8px; margin-bottom: 12px;">
        <h3 class="artisan-title" style="flex: 1; margin: 0;">${provider.name}</h3>
        ${provider.is_verified ? `
          <div class="verified-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Vérifié
          </div>
        ` : ''}
      </div>

      <!-- Rating -->
      ${provider.rating_average ? `
        <div class="rating-container">
          <svg class="rating-star" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span class="rating-value">${provider.rating_average.toFixed(1)}</span>
          <span class="rating-count">(${provider.review_count || 0} avis)</span>
        </div>
      ` : ''}

      <!-- Infos -->
      <div style="margin: 16px 0; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; padding: 12px 0;">
        ${provider.specialty ? `
          <div class="info-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
            <span>${provider.specialty}</span>
          </div>
        ` : ''}
        
        ${provider.address_street || provider.address_city ? `
          <div class="info-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>
              ${provider.address_street ? provider.address_street + ', ' : ''}
              ${provider.address_postal_code || ''} ${provider.address_city || ''}
            </span>
          </div>
        ` : ''}

        ${provider.phone ? `
          <div class="info-item info-item-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <span style="font-weight: 600;">Répond en < 2h</span>
          </div>
        ` : ''}
      </div>

      <!-- Boutons d'action -->
      <div style="display: flex; gap: 10px; margin-top: 16px;">
        ${provider.phone ? `
          <a href="tel:${provider.phone}" class="btn-call" style="flex: 1; text-decoration: none; text-align: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            Appeler
          </a>
        ` : ''}
        <a href="/services/${provider.specialty?.toLowerCase()}/${provider.address_city?.toLowerCase()}/${provider.slug}" class="btn-devis" style="flex: 1; text-decoration: none; text-align: center;">
          Demander un devis
        </a>
      </div>
    </div>
  `
}
