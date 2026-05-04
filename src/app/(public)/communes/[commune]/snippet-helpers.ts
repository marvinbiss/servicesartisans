/**
 * Sprint AI Wave F 2026-05-03 — Snippet-bait helpers pour /communes/[commune].
 *
 * Conditionnel : ne génère summary + bullets QUE si la commune dispose d'au
 * moins 3 signaux data réels. Sinon retourne null → la page n'affiche aucun
 * EnBref/Tldr (respect du commentaire historique l.166-167 : « pas de
 * padding sur communes data-sparse »).
 *
 * Pure module : aucun I/O, importable depuis Server Components et tests.
 */
import type { CommuneData } from '@/lib/data/commune-data'
import { formatEuro, formatNumber } from '@/lib/data/commune-data'

const MIN_BULLETS = 3

export interface CommuneSnippetData {
  summary: string
  bullets: string[]
}

export function buildCommuneSnippetData(commune: CommuneData): CommuneSnippetData | null {
  const dept = commune.departement_name ?? commune.departement_code
  const cp = commune.code_postal ?? commune.departement_code

  const bullets: string[] = []

  if (commune.population) {
    const densite = commune.densite_population
      ? ` (${formatNumber(commune.densite_population)} hab/km²)`
      : ''
    bullets.push(`${formatNumber(commune.population)} habitants${densite}`)
  }

  if (commune.nb_artisans_btp) {
    const rgePart = commune.nb_artisans_rge
      ? ` dont ${formatNumber(commune.nb_artisans_rge)} certifiés RGE`
      : ''
    bullets.push(`${formatNumber(commune.nb_artisans_btp)} artisans BTP locaux${rgePart}`)
  } else if (commune.nb_artisans_rge) {
    bullets.push(`${formatNumber(commune.nb_artisans_rge)} artisans certifiés RGE référencés`)
  }

  if (commune.climat_zone) {
    const gelPart =
      commune.jours_gel_annuels != null && commune.jours_gel_annuels > 0
        ? ` — ${commune.jours_gel_annuels} jours de gel/an`
        : ''
    bullets.push(`Zone climatique RT2012 : ${commune.climat_zone}${gelPart}`)
  }

  if (commune.pct_passoires_dpe != null && commune.pct_passoires_dpe > 0) {
    bullets.push(
      `${commune.pct_passoires_dpe.toFixed(0)} % de passoires énergétiques (DPE F+G) — éligibles MaPrimeRénov’`
    )
  }

  if (commune.prix_m2_moyen) {
    bullets.push(`Prix médian DVF au m² : ${formatEuro(commune.prix_m2_moyen)}`)
  }

  if (commune.nb_maprimerenov_annuel != null && commune.nb_maprimerenov_annuel > 0) {
    bullets.push(
      `${formatNumber(commune.nb_maprimerenov_annuel)} dossiers MaPrimeRénov’ financés (dernière année connue)`
    )
  }

  if (bullets.length < MIN_BULLETS) return null

  // Garder ≤ 5 bullets pour éviter l'effet "wall of stats" et préserver la
  // lisibilité Featured Snippets (Google tronque souvent au-delà).
  const trimmed = bullets.slice(0, 5)

  const headline = `${commune.name} (${cp}, ${dept})`
  const populationFr = commune.population ? `${formatNumber(commune.population)} habitants, ` : ''
  const artisansFr = commune.nb_artisans_btp
    ? `${formatNumber(commune.nb_artisans_btp)} artisans BTP, `
    : ''
  const summary = `${headline} : ${populationFr}${artisansFr}données INSEE et indicateurs locaux pour piloter votre projet de rénovation énergétique. Trouvez un artisan local qualifié et chiffrez vos aides 2026.`

  return { summary, bullets: trimmed }
}
