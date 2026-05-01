/**
 * Maps service slugs to NAF/APE codes for SIRENE API queries.
 * Used by enrichment scripts to count active businesses per trade per commune.
 *
 * Source: INSEE nomenclature d'activités française (NAF rév. 2)
 * Division 41: Construction de bâtiments
 * Division 43: Travaux de construction spécialisés
 *
 * Pivot RGE 2026-05-01 : 16 métiers Tier C niche supprimés (solier, terrassier,
 * metallier, ferronnier, poseur-de-parquet, miroitier, storiste, architecte-
 * interieur, decorateur, domoticien, pisciniste, antenniste, ascensoriste,
 * geometre, desinsectisation, deratisation).
 */

/** NAF codes associated with each service slug */
export const SERVICE_TO_NAF: Record<string, string[]> = {
  // Core BTP trades
  plombier: ['4322A'], // Travaux d'installation d'eau et de gaz
  electricien: ['4321A', '4321B'], // Installation électrique
  chauffagiste: ['4322B'], // Équipements thermiques et climatisation
  climaticien: ['4322B'], // Same NAF as chauffagiste
  'peintre-en-batiment': ['4334Z'], // Peinture et vitrerie
  menuisier: ['4332A'], // Menuiserie bois et PVC
  serrurier: ['4332B'], // Menuiserie métallique et serrurerie
  carreleur: ['4333Z'], // Revêtement des sols et murs
  couvreur: ['4391B'], // Couverture par éléments
  macon: ['4399C'], // Maçonnerie générale
  vitrier: ['4334Z'], // Peinture et vitrerie (same NAF)

  // Specialized trades
  jardinier: ['8130Z'], // Services d'aménagement paysager
  paysagiste: ['7111Z', '8130Z'], // Architecture + aménagement paysager
  cuisiniste: ['4332C', '3102Z'], // Agencement + fabrication meubles cuisine
  nettoyage: ['8121Z', '8122Z'], // Nettoyage de bâtiments
  charpentier: ['4391A'], // Charpente
  zingueur: ['4391B'], // Couverture (zinguerie = sous-spécialité)
  etancheiste: ['4399A'], // Étanchéification
  facadier: ['4334Z', '4399C'], // Peinture + maçonnerie
  platrier: ['4331Z'], // Plâtrerie

  // Bathroom/Interior
  'salle-de-bain': ['4322A', '4333Z'], // Plomberie + revêtement

  // Tech/Energy
  'borne-recharge': ['4321A'], // Installation électrique
  'pompe-a-chaleur': ['4322B'], // Équipements thermiques
  'panneaux-solaires': ['4321A', '4322B'], // Électricité + thermique
  'isolation-thermique': ['4329A'], // Isolation
  'renovation-energetique': ['4329A', '4322B'], // Isolation + thermique

  // Maintenance & security
  ramoneur: ['8129B'], // Autres services de nettoyage
  'alarme-securite': ['4321A', '8020Z'], // Installation électrique + systèmes de sécurité

  // Other
  diagnostiqueur: ['7120B'], // Analyses techniques
  demenageur: ['4942Z'], // Déménagement
}

/** Get all NAF codes for a service slug */
export function getNafCodesForService(serviceSlug: string): string[] {
  return SERVICE_TO_NAF[serviceSlug] || []
}

/** Get the primary (first) NAF code for a service slug */
export function getPrimaryNafCode(serviceSlug: string): string | null {
  const codes = SERVICE_TO_NAF[serviceSlug]
  return codes?.[0] || null
}
