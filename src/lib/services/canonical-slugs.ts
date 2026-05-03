/**
 * Canonical service slugs — leaf module sans imports.
 *
 * Pourquoi un module séparé de `catalog.ts` ?
 *   - `catalog.ts` importe `france-light.ts` (1.1 MB données géo) qui est
 *     incompatible avec le bundle Edge (middleware) de `gone-paths.ts`.
 *   - Ce module n'a AUCUN import → coût bundle Edge ~0 (juste le tableau).
 *   - Une seule source de vérité partagée par catalog.ts (server) et
 *     gone-paths.ts (Edge middleware) — élimine le drift triple SSoT.
 *
 * Modification : éditer ICI uniquement. Test cohérence
 * `__tests__/lib/services/canonical-slugs-coherence.test.ts` vérifie
 * l'alignement avec `france-light.ts.services`.
 *
 * Pivot full RGE 2026-05-03 — 21 slugs canon (4 commodity + ebeniste retirés).
 */

export const CANONICAL_SERVICE_SLUGS = [
  'plombier',
  'electricien',
  'chauffagiste',
  'peintre-en-batiment',
  'menuisier',
  'couvreur',
  'macon',
  'climaticien',
  'charpentier',
  'zingueur',
  'etancheiste',
  'facadier',
  'platrier',
  'salle-de-bain',
  'pompe-a-chaleur',
  'panneaux-solaires',
  'isolation-thermique',
  'renovation-energetique',
  'borne-recharge',
  'ramoneur',
  'diagnostiqueur',
] as const

export type ServiceSlug = (typeof CANONICAL_SERVICE_SLUGS)[number]

export const CANONICAL_SERVICE_SLUGS_SET: ReadonlySet<string> = new Set(CANONICAL_SERVICE_SLUGS)
