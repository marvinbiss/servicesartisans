#!/usr/bin/env npx tsx
/**
 * Test each public data API with code_insee=13055 (Marseille) and 75056 (Paris)
 * to identify which endpoints work and which need fixing.
 */

// Codes INSEE testables : pour Paris/Marseille/Lyon, DVF ne sert pas l'INSEE
// central (75056/13055/69123) mais uniquement les arrondissements (75101+,
// 13201+, 69381+). On utilise donc le 1er arrondissement pour avoir un test
// DVF non faux-négatif. Les autres APIs (FILOSOFI/ADEME/Géorisques/MaPrime)
// fonctionnent au niveau commune central.
const TEST_INSEE = ['13201', '75101', '69381'] // Marseille 1er, Paris 1er, Lyon 1er
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

    // 2. INSEE FILOSOFI — endpoints canoniques avril 2026 (orchestrator)
    console.log('\n--- 2) INSEE FILOSOFI: data.economie.gouv.fr/filosofi-2021 (canonical)')
    const fs1 = await fetch_(
      `https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/filosofi-2021/records?where=codgeo%3D%22${insee}%22&limit=1`,
      'FILOSOFI data.economie.gouv.fr'
    )
    console.log('  ', fs1.ok ? '✅' : '❌', fs1.summary.slice(0, 250))

    console.log('--- 2bis) INSEE FILOSOFI: opendatasoft filosofi-2021-comm (fallback)')
    const fs2 = await fetch_(
      `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/filosofi-2021-comm/records?where=codgeo%3D%22${insee}%22&limit=1`,
      'FILOSOFI opendatasoft v2'
    )
    console.log('  ', fs2.ok ? '✅' : '❌', fs2.summary.slice(0, 250))

    console.log('--- 2ter) INSEE FILOSOFI: data.economie.gouv.fr/filosofi-niveau-communes')
    const fs3 = await fetch_(
      `https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/filosofi-niveau-communes/records?where=codgeo%3D%22${insee}%22&limit=1`,
      'FILOSOFI niveau-communes'
    )
    console.log('  ', fs3.ok ? '✅' : '❌', fs3.summary.slice(0, 250))

    // 3. ADEME DPE — dataset canonical (orchestrator post-2026-04-29 fix)
    // Vérifié 2026-04-29 : c'est l'id technique `meg-83tjwtg8dyz4vv7h1dqe`
    // qui répond 200 OK. Le slug humain `dpe-v2-logements-existants` retourne
    // 404 — anomalie ADEME persistante depuis 2025.
    console.log('\n--- 3) ADEME DPE: meg-83tjwtg8dyz4vv7h1dqe (canonical)')
    const dpe1 = await fetch_(
      `https://data.ademe.fr/data-fair/api/v1/datasets/meg-83tjwtg8dyz4vv7h1dqe/lines?qs=${encodeURIComponent(`code_insee_ban:${insee}`)}&size=0`,
      'ADEME DPE meg-id'
    )
    console.log('  ', dpe1.ok ? '✅' : '❌', dpe1.summary.slice(0, 250))

    console.log('--- 3bis) ADEME DPE: F+G filter (passoires)')
    const dpe2 = await fetch_(
      `https://data.ademe.fr/data-fair/api/v1/datasets/meg-83tjwtg8dyz4vv7h1dqe/lines?qs=${encodeURIComponent(`code_insee_ban:${insee} AND etiquette_dpe:(F OR G)`)}&size=0`,
      'ADEME DPE F+G'
    )
    console.log('  ', dpe2.ok ? '✅' : '❌', dpe2.summary.slice(0, 250))

    console.log('--- 3ter) ADEME DPE: human slug (404 attendu, anomalie ADEME)')
    const dpe3 = await fetch_(
      `https://data.ademe.fr/data-fair/api/v1/datasets/dpe-v2-logements-existants/lines?size=0`,
      'ADEME DPE human slug'
    )
    console.log('  ', dpe3.ok ? '✅' : '❌', dpe3.summary.slice(0, 250))

    // 4. Géorisques — orchestrator essaie www. d'abord, apex en fallback
    console.log('\n--- 4) Géorisques: www. (canonical)')
    const g1 = await fetch_(
      `https://www.georisques.gouv.fr/api/v1/resultats_rapport_risque?code_insee=${insee}`,
      'Géorisques www'
    )
    console.log('  ', g1.ok ? '✅' : '❌', g1.summary.slice(0, 250))

    console.log('--- 4bis) Géorisques: apex (fallback)')
    const g2 = await fetch_(
      `https://georisques.gouv.fr/api/v1/resultats_rapport_risque?code_insee=${insee}`,
      'Géorisques apex'
    )
    console.log('  ', g2.ok ? '✅' : '❌', g2.summary.slice(0, 250))

    // 5. MaPrimeRénov' — orchestrator essaie 2 sources data.economie + opendatasoft
    console.log('\n--- 5) MaPrimeRénov: data.economie.gouv.fr/aides-france-renov-departements')
    const dept = insee.slice(0, 2)
    const mpr1 = await fetch_(
      `https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/aides-france-renov-departements/records?where=code_departement%3D%22${dept}%22&limit=1`,
      'MaPrimeRénov data.economie'
    )
    console.log('  ', mpr1.ok ? '✅' : '❌', mpr1.summary.slice(0, 250))

    console.log('--- 5bis) MaPrimeRénov: opendatasoft maprimerenov-departements')
    const mpr2 = await fetch_(
      `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/maprimerenov-departements/records?where=code_departement%3D%22${dept}%22&limit=1`,
      'MaPrimeRénov opendatasoft'
    )
    console.log('  ', mpr2.ok ? '✅' : '❌', mpr2.summary.slice(0, 250))

    console.log('--- 5ter) MaPrimeRénov: data.gouv.fr catalog search')
    const mpr3 = await fetch_(
      `https://www.data.gouv.fr/api/1/datasets/?q=maprimerenov+departement&page_size=3`,
      'data.gouv.fr catalog search'
    )
    console.log('  ', mpr3.ok ? '✅' : '❌', mpr3.summary.slice(0, 250))
  }
}
main()
