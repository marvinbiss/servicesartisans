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
 *
 * Pivot full RGE 2026-05-03 : retrait de serrurier, carreleur, vitrier,
 * cuisiniste (commodity hors RGE — code 4332B/4333Z/4334Z/4332C/3102Z
 * désormais inutilisés par le mapping service→NAF).
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
  couvreur: ['4391B'], // Couverture par éléments
  macon: ['4399C'], // Maçonnerie générale

  // Specialized trades — pivot pure-play BTP énergétique 2026-05-02 :
  // jardinier, paysagiste, nettoyage retirés (services à la personne hors BTP).
  charpentier: ['4391A'], // Charpente
  zingueur: ['4391B'], // Couverture (zinguerie = sous-spécialité)
  etancheiste: ['4399A'], // Étanchéification
  facadier: ['4334Z', '4399C'], // Peinture + maçonnerie
  platrier: ['4331Z'], // Plâtrerie

  // Bathroom/Interior
  'salle-de-bain': ['4322A'], // Plomberie (revêtement 4333Z retiré post-pivot RGE)

  // Tech/Energy
  'borne-recharge': ['4321A'], // Installation électrique
  'pompe-a-chaleur': ['4322B'], // Équipements thermiques
  'panneaux-solaires': ['4321A', '4322B'], // Électricité + thermique
  'isolation-thermique': ['4329A'], // Isolation
  'renovation-energetique': ['4329A', '4322B'], // Isolation + thermique

  // Maintenance & security — pivot 2026-05-02 : alarme-securite retiré
  // (marché dominé installateurs marques, hors thèse BTP).
  ramoneur: ['8129B'], // Autres services de nettoyage

  // Other — pivot 2026-05-02 : demenageur retiré (logistique hors BTP).
  diagnostiqueur: ['7120B'], // Analyses techniques
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
