/**
 * Phase 1 probe — Validate that recherche-entreprises.api.gouv.fr returns
 * enough E-E-A-T signals to unblock the 730 hard-case providers.
 *
 * Reads a sample of SIREN/SIRET from the diagnose script, fetches the public
 * API (no auth), and prints the signals we plan to feed into v1.1 prompt :
 *   - date_creation  (Experience pillar)
 *   - tranche_effectif_salarie (size / credibility)
 *   - activite_principale (NAF code → label)
 *   - liste_rge (cross-check with ADEME)
 *   - etat_administratif (is the business still active ?)
 *   - nombre_etablissements (multi-site presence)
 */

const SAMPLE = [
  '928760172', // 2M ENERGIE-BORDEAUX (fail 7.1)
  '887698223', // BH ENERGY (fail 7.4)
  '494866502', // DELTA FRANCE (fail 7.3)
  '981552466', // ECO PLUS (fail 7.2)
  '892108226', // EH IMPACT (fail 6.9)
]

type DataGouvHit = {
  siren: string
  nom_complet: string
  nombre_etablissements: number
  nombre_etablissements_ouverts: number
  date_creation: string | null
  etat_administratif: string
  tranche_effectif_salarie: string | null
  annee_tranche_effectif_salarie?: number | null
  siege: {
    activite_principale: string
    libelle_commune: string
    code_postal: string
    region: string
    date_creation: string | null
    etat_administratif: string
    liste_rge: string[] | null
    tranche_effectif_salarie: string | null
  }
}

type DataGouvResponse = {
  results: DataGouvHit[]
}

const TRANCHE_LABELS: Record<string, string> = {
  NN: 'unités non employeuses',
  '00': '0 salarié',
  '01': '1 ou 2 salariés',
  '02': '3 à 5 salariés',
  '03': '6 à 9 salariés',
  '11': '10 à 19 salariés',
  '12': '20 à 49 salariés',
  '21': '50 à 99 salariés',
  '22': '100 à 199 salariés',
  '31': '200 à 249 salariés',
  '32': '250 à 499 salariés',
  '41': '500 à 999 salariés',
  '42': '1 000 à 1 999 salariés',
  '51': '2 000 à 4 999 salariés',
  '52': '5 000 à 9 999 salariés',
  '53': '10 000 salariés et plus',
}

async function fetchSiren(siren: string): Promise<DataGouvHit | null> {
  const url = `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(siren)}&page=1&per_page=1`
  const res = await fetch(url)
  if (!res.ok) {
    console.error(`  HTTP ${res.status} on ${siren}`)
    return null
  }
  const body = (await res.json()) as DataGouvResponse
  return body.results?.[0] ?? null
}

function yearsSince(iso: string | null): number | null {
  if (!iso) return null
  const y = Number(iso.slice(0, 4))
  if (!Number.isFinite(y)) return null
  return new Date().getFullYear() - y
}

async function main() {
  for (const siren of SAMPLE) {
    const hit = await fetchSiren(siren)
    if (!hit) {
      console.log(`─ ${siren}: no hit`)
      continue
    }
    const tranche = hit.tranche_effectif_salarie ?? hit.siege?.tranche_effectif_salarie ?? null
    const trancheLabel = tranche ? (TRANCHE_LABELS[tranche] ?? `code ${tranche}`) : 'non renseigné'
    const age = yearsSince(hit.date_creation)
    console.log(`─ ${hit.nom_complet} (SIREN ${hit.siren})`)
    console.log(
      `  etat_administratif=${hit.etat_administratif} etabl=${hit.nombre_etablissements} ouverts=${hit.nombre_etablissements_ouverts}`
    )
    console.log(`  date_creation=${hit.date_creation} (age=${age === null ? '?' : age + ' ans'})`)
    console.log(`  effectif=${trancheLabel}`)
    console.log(`  NAF principal=${hit.siege?.activite_principale}`)
    console.log(`  siege=${hit.siege?.libelle_commune} ${hit.siege?.code_postal}`)
    const rgeCount = hit.siege?.liste_rge?.length ?? 0
    console.log(`  liste_rge=${rgeCount} codes`)
    console.log('')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
