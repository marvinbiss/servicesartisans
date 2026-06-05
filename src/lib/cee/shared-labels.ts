/**
 * CEE shared labels — single source of truth pour les libellés courts des
 * opérations CEE résidentielles (« BAR-… »).
 *
 * Consommé par :
 *  - `src/lib/rge/service-guides-map.ts` (mapping service RGE → CEE)
 *  - `src/components/artisan/ArtisanRgeEnrichedSection.tsx` (fiches artisan)
 *  - Potentiellement toute future surface qui affiche un code CEE.
 *
 * Pourquoi un module séparé : avant 2026-04-20 le même dict était copié
 * à 3 endroits et divergait silencieusement à chaque ajout d'opération
 * (BAR-TH-143, 159, EN-108 ont été ajoutés à une seule des 3 copies
 * pendant 24h, causant des libellés `undefined` en prod).
 *
 * Règle d'or : ne JAMAIS dupliquer ce mapping ailleurs dans le repo.
 * Toute nouvelle opération CEE doit être ajoutée ici et ici seulement.
 */

/**
 * Libellés courts éditoriaux des opérations CEE — format user-facing
 * (pas le nom complet du BOAMP qui est trop long pour un chip UI).
 *
 * Notes d'abrogation :
 *  - BAR-TH-104 (PAC air/eau standard) — abrogée 01/01/2024 → BAR-TH-171
 *  - BAR-TH-106 (chaudière gaz/fioul condensation) — abrogée 01/01/2024,
 *    pas de remplacement (fossiles exclus)
 *  - BAR-TH-160 (raccordement réseau chaleur renouvelable) — supprimée
 *    01/08/2025, pas de remplacement direct
 *  - BAR-TH-164 (rénovation globale performante) — abrogée → BAR-TH-174
 */
export const CEE_SHORT_LABELS: Readonly<Record<string, string>> = Object.freeze({
  'BAR-TH-171': 'Pompe à chaleur air/eau haute performance',
  'BAR-TH-172': 'Pompe à chaleur eau/eau ou sol/eau',
  'BAR-TH-174': "Rénovation d'ampleur d'une maison individuelle",
  'BAR-TH-175': "Rénovation d'ampleur d'un appartement",
  'BAR-TH-112': 'Appareil indépendant de chauffage au bois',
  'BAR-TH-113': 'Chaudière biomasse individuelle',
  'BAR-TH-125': 'Ventilation mécanique double flux',
  'BAR-TH-127': 'Ventilation mécanique simple flux hygroréglable',
  'BAR-TH-129': 'Pompe à chaleur air/air',
  'BAR-TH-143': 'Système solaire combiné (SSC)',
  'BAR-TH-148': 'Chauffe-eau thermodynamique',
  'BAR-TH-159': 'Pompe à chaleur hybride individuelle',
  'BAR-TH-161': "Isolation de points singuliers d'un réseau",
  // 173 + SE-104 : intitulés corrigés mig 384 (sources legifrance + PDF DGEC).
  // L'ancien seed 383 (« sonde extérieure » / « intermittence ») était FAUX.
  'BAR-TH-173': 'Régulation par programmation horaire pièce par pièce',
  'BAR-SE-104': "Réglage des organes d'équilibrage du chauffage",
  'BAR-EN-101': 'Isolation des combles ou toitures',
  'BAR-EN-102': 'Isolation des murs',
  'BAR-EN-103': 'Isolation des planchers bas',
  'BAR-EN-104': 'Fenêtres ou baies vitrées',
  'BAR-EN-108': 'Fermeture isolante (volets)',
})

/**
 * Lookup safe — retourne le libellé court ou le code brut si pas de
 * libellé dédié (fail-open : jamais `undefined`).
 */
export function getCeeShortLabel(code: string): string {
  const upper = code.toUpperCase()
  return CEE_SHORT_LABELS[upper] ?? upper
}
