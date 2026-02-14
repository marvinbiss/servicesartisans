import { supabase } from './lib/supabase-admin'

async function main() {
  console.log('Comptage des artisans dans Supabase...\n')

  // Use estimated count for large tables (much faster)
  const { count: total, error } = await supabase
    .from('providers')
    .select('id', { count: 'planned', head: true })

  if (error) {
    console.log('Erreur:', error.message)
    // Fallback: count by batches
    let totalCount = 0
    let offset = 0
    const batchSize = 1000
    while (true) {
      const { data } = await supabase.from('providers').select('id').range(offset, offset + batchSize - 1)
      if (!data || data.length === 0) break
      totalCount += data.length
      offset += batchSize
      if (data.length < batchSize) break
    }
    console.log('Total artisans (batch):', totalCount.toLocaleString('fr-FR'))
  } else {
    console.log('Total artisans:        ', total?.toLocaleString('fr-FR'))
  }

  const { count: withPhone } = await supabase
    .from('providers')
    .select('id', { count: 'exact', head: true })
    .not('phone', 'is', null)
  console.log('Avec telephone:        ', withPhone?.toLocaleString('fr-FR'))

  const { count: fromApi } = await supabase
    .from('providers')
    .select('id', { count: 'exact', head: true })
    .eq('source', 'annuaire_entreprises')
  console.log('Source API Annuaire:   ', fromApi?.toLocaleString('fr-FR'))

  const { count: active } = await supabase
    .from('providers')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)
  console.log('Actifs:                ', active?.toLocaleString('fr-FR'))

  process.exit(0)
}

main()
