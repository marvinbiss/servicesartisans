#!/usr/bin/env npx tsx
/**
 * Test each public data API with code_insee=13055 (Marseille) and 75056 (Paris)
 * to identify which endpoints work and which need fixing.
 */

const TEST_INSEE = ['13055', '75056', '69123'] // Marseille, Paris, Lyon
const USER_AGENT = 'ServicesArtisans/1.0 (contact@servicesartisans.fr)'

async function fetch_(
  url: string,
  description: string
): Promise<{ ok: boolean; summary: string; sample?: unknown }> {
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 15000)
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
    })
    clearTimeout(t)
    const text = await res.text()
    const sample = text.slice(0, 300)
    if (!res.ok) return { ok: false, summary: `HTTP ${res.status} ${res.statusText} — ${sample}` }
    try {
      const json = JSON.parse(text)
      return {
        ok: true,
        summary: `${res.status} OK, json keys=${Object.keys(json).slice(0, 5).join(',')}`,
        sample: json,
      }
    } catch {
      return { ok: true, summary: `${res.status} OK, non-JSON body (${sample})` }
    }
  } catch (err) {
    return { ok: false, summary: `FETCH_FAILED: ${(err as Error).message}` }
  }
}

async function main() {
  for (const insee of TEST_INSEE) {
    console.log(`\n======================================================`)
    console.log(`Testing with code_insee=${insee}`)
    console.log(`======================================================`)

    // 1. DVF Cerema (current broken) vs alternatives
    console.log('\n--- 1) DVF: Cerema DV3F (currently broken)')
    const dvf1 = await fetch_(
      `https://apidf-preprod.cerema.fr/indicateurs/dv3f/prix/communes/${insee}?annee_min=2022&annee_max=2024`,
      'Cerema DV3F'
    )
    console.log('  ', dvf1.ok ? '✅' : '❌', dvf1.summary)

    console.log('--- 1bis) DVF: Etalab raw (official)')
    const dvf2 = await fetch_(
      `https://app.dvf.etalab.gouv.fr/api/mutations3/${insee}`,
      'Etalab raw DVF'
    )
    console.log('  ', dvf2.ok ? '✅' : '❌', dvf2.summary)

    console.log('--- 1ter) DVF: files.data.gouv.fr CSV 2024')
    const dvf3 = await fetch_(
      `https://files.data.gouv.fr/geo-dvf/latest/csv/2024/communes/${insee.slice(0, 2)}/${insee}.csv`,
      'DVF files.data.gouv.fr CSV'
    )
    console.log('  ', dvf3.ok ? '✅' : '❌', dvf3.summary)

    // 2. INSEE FILOSOFI
    console.log('\n--- 2) INSEE FILOSOFI: opendatasoft filosofi-2019 (currently broken)')
    const fs1 = await fetch_(
      `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/filosofi-2019/records?where=codgeo%3D%22${insee}%22&limit=1`,
      'FILOSOFI opendatasoft'
    )
    console.log('  ', fs1.ok ? '✅' : '❌', fs1.summary)

    console.log('--- 2bis) INSEE FILOSOFI: data.gouv.fr records')
    const fs2 = await fetch_(
      `https://www.data.gouv.fr/api/1/datasets/?q=filosofi+commune&page_size=3`,
      'data.gouv.fr catalog'
    )
    console.log('  ', fs2.ok ? '✅' : '❌', fs2.summary.slice(0, 200))

    console.log('--- 2ter) INSEE FILOSOFI: data.economie.gouv.fr')
    const fs3 = await fetch_(
      `https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/filosofi-2021/records?where=codgeo%3D%22${insee}%22&limit=1`,
      'data.economie.gouv.fr'
    )
    console.log('  ', fs3.ok ? '✅' : '❌', fs3.summary.slice(0, 200))

    // 3. ADEME DPE
    console.log('\n--- 3) ADEME DPE: data-fair v1 (current)')
    const dpe1 = await fetch_(
      `https://data.ademe.fr/data-fair/api/v1/datasets/dpe-v2-logements-existants/lines?q_mode=simple&qs=code_insee_ban:%22${insee}%22&size=0`,
      'ADEME DPE v1'
    )
    console.log('  ', dpe1.ok ? '✅' : '❌', dpe1.summary.slice(0, 250))

    console.log('--- 3bis) ADEME DPE: recherche simpler')
    const dpe2 = await fetch_(
      `https://data.ademe.fr/data-fair/api/v1/datasets/dpe-v2-logements-existants/lines?size=1`,
      'ADEME DPE no filter'
    )
    console.log('  ', dpe2.ok ? '✅' : '❌', dpe2.summary.slice(0, 250))

    // 4. Géorisques
    console.log('\n--- 4) Géorisques: api v1 gaspar/risques (current)')
    const g1 = await fetch_(
      `https://georisques.gouv.fr/api/v1/gaspar/risques?code_insee=${insee}`,
      'Géorisques v1'
    )
    console.log('  ', g1.ok ? '✅' : '❌', g1.summary.slice(0, 250))

    console.log('--- 4bis) Géorisques: rapport-risques')
    const g2 = await fetch_(
      `https://georisques.gouv.fr/api/v1/resultats_rapport_risque?code_insee=${insee}`,
      'Géorisques rapport_risque'
    )
    console.log('  ', g2.ok ? '✅' : '❌', g2.summary.slice(0, 250))

    console.log('--- 4ter) Géorisques: new pop endpoint')
    const g3 = await fetch_(
      `https://www.georisques.gouv.fr/api/v1/resultats_rapport_risque?code_insee=${insee}`,
      'Géorisques www'
    )
    console.log('  ', g3.ok ? '✅' : '❌', g3.summary.slice(0, 250))

    // 5. France Rénov / MaPrimeRénov'
    console.log('\n--- 5) MaPrimeRénov par département: opendatasoft')
    const dept = insee.slice(0, 2)
    const mpr1 = await fetch_(
      `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/maprimerenov-par-departement/records?where=code_departement%3D%22${dept}%22&limit=1`,
      'MaPrimeRénov par dept'
    )
    console.log('  ', mpr1.ok ? '✅' : '❌', mpr1.summary.slice(0, 250))

    console.log('--- 5bis) MaPrimeRénov: ADEME Open Data')
    const mpr2 = await fetch_(
      `https://data.ademe.fr/data-fair/api/v1/datasets?q=maprimerenov`,
      'ADEME catalog search'
    )
    console.log('  ', mpr2.ok ? '✅' : '❌', mpr2.summary.slice(0, 250))
  }
}
main()
