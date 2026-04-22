import { hashCode } from '@/lib/seo/hash'

// ---------------------------------------------------------------------------
// Varied anchor text system for internal links
// Deterministic selection based on hash — same input always produces same output
// ---------------------------------------------------------------------------

export type Intent = 'services' | 'tarifs' | 'avis' | 'devis' | 'urgence'

// ---------------------------------------------------------------------------
// Templates per intent — with city
// ---------------------------------------------------------------------------

const TEMPLATES_WITH_CITY: Record<Intent, string[]> = {
  services: [
    '{service} à {ville}',
    'Trouver un {service} à {ville}',
    'Artisan {service} à {ville}',
    'Les meilleurs {service}s à {ville}',
    '{service} de confiance à {ville}',
    'Comparer les {service}s à {ville}',
    '{service} près de {ville}',
    '{service}s disponibles à {ville}',
  ],
  tarifs: [
    'Tarifs {service} à {ville}',
    'Prix {service} à {ville}',
    'Combien coûte un {service} à {ville}',
    'Grille tarifaire {service} {ville}',
    'Tarifs et prix {service} à {ville}',
    'Budget {service} à {ville}',
    'Estimation prix {service} {ville}',
  ],
  avis: [
    'Avis {service} à {ville}',
    'Avis clients {service} {ville}',
    'Notes et avis {service} à {ville}',
    'Recommandations {service} {ville}',
    'Que pensent les clients des {service}s à {ville}',
    'Évaluations {service} {ville}',
  ],
  devis: [
    'Devis {service} à {ville}',
    'Devis gratuit {service} {ville}',
    'Demander un devis {service} à {ville}',
    'Devis en ligne {service} {ville}',
    'Estimation gratuite {service} {ville}',
  ],
  urgence: [
    'Urgence {service} à {ville}',
    '{service} en urgence à {ville}',
    'Dépannage {service} {ville}',
    '{service} disponible 24h/24 à {ville}',
    'Intervention rapide {service} {ville}',
  ],
}

// ---------------------------------------------------------------------------
// Templates per intent — hub (no city)
// ---------------------------------------------------------------------------

const TEMPLATES_HUB: Record<Intent, string[]> = {
  services: [
    'Tous les {service}s',
    '{service}s en France',
    'Trouver un {service}',
    'Annuaire {service}',
  ],
  tarifs: [
    'Tarifs {service} en France',
    'Guide des prix {service}',
    'Grille tarifaire {service}',
    'Combien coûte un {service}',
  ],
  avis: [
    'Avis {service} partout en France',
    'Avis clients {service}',
    'Notes {service}',
    'Recommandations {service}',
  ],
  devis: [
    'Devis {service}',
    'Devis gratuit {service}',
    'Demander un devis {service}',
    'Estimation {service}',
  ],
  urgence: [
    'Urgence {service}',
    'Dépannage {service}',
    '{service} en urgence',
    'Intervention rapide {service}',
  ],
}

// ---------------------------------------------------------------------------
// Main function
// ---------------------------------------------------------------------------

export function getAnchorText(params: {
  serviceSlug: string
  serviceName: string
  villeName?: string
  intent: Intent
  seed?: string
}): string {
  const { serviceSlug, serviceName, villeName, intent, seed } = params

  const hasCity = !!villeName
  const variants = hasCity ? TEMPLATES_WITH_CITY[intent] : TEMPLATES_HUB[intent]

  const hashInput = `anchor-${serviceSlug}-${villeName || 'france'}-${intent}-${seed || ''}`
  const index = hashCode(hashInput) % variants.length

  const text = variants[index]
    .replace(/\{service\}/g, serviceName.toLowerCase())
    .replace(/\{ville\}/g, villeName || 'France')

  return text
}
