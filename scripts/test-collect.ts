import { supabase } from './lib/supabase-admin'

async function test() {
  console.log('1. Testing API fetch...')
  const t1 = Date.now()
  const r = await fetch('https://recherche-entreprises.api.gouv.fr/search?activite_principale=43.32A&departement=27&etat_administratif=A&per_page=25&page=1', {
    headers: { Accept: 'application/json' },
  })
  const data = await r.json() as any
  console.log('   API OK:', data.results?.length, 'results in', Date.now() - t1, 'ms')

  console.log('2. Testing Supabase select...')
  const t2 = Date.now()
  const siren = data.results?.[0]?.siren || '123456789'
  const { data: d2, error: e2 } = await supabase.from('providers').select('siren').eq('siren', siren).limit(1)
  console.log('   Supabase select:', e2 ? 'ERROR: ' + e2.message : 'OK, ' + d2?.length + ' results in ' + (Date.now() - t2) + 'ms')

  console.log('ALL OK')
  process.exit(0)
}

test().catch(e => { console.error('FATAL:', e.message); process.exit(1) })
setTimeout(() => { console.log('GLOBAL TIMEOUT'); process.exit(1) }, 20000)
