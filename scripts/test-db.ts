import { supabase } from './lib/supabase-admin'

async function main() {
  console.log('Testing Supabase...')

  // Simple count
  const t1 = Date.now()
  const { count, error: e1 } = await supabase
    .from('providers')
    .select('*', { count: 'planned', head: true })
  console.log(`1. Planned count: ${count} (${Date.now() - t1}ms) ${e1 ? 'ERROR: ' + e1.message : ''}`)

  // Sample by dept
  const t2 = Date.now()
  const { data: sample, error: e2 } = await supabase
    .from('providers')
    .select('name, address_department, phone, specialty')
    .eq('address_department', '75')
    .is('phone', null)
    .limit(5)
  console.log(`2. Dept 75 no phone: ${sample?.length ?? 'ERROR'} results (${Date.now() - t2}ms) ${e2 ? e2.message : ''}`)
  if (sample) sample.forEach(s => console.log(`   - ${s.name} | ${s.specialty}`))

  // Check if any artisans exist at all
  const t3 = Date.now()
  const { data: any5, error: e3 } = await supabase
    .from('providers')
    .select('name, address_department, phone, specialty')
    .limit(5)
  console.log(`3. Any 5 artisans: ${any5?.length ?? 'ERROR'} (${Date.now() - t3}ms) ${e3 ? e3.message : ''}`)
  if (any5) any5.forEach(s => console.log(`   - ${s.name} | dept ${s.address_department} | tel: ${s.phone || 'null'} | ${s.specialty}`))
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1) })
