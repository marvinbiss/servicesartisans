import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { createAdminClient } from '@/lib/supabase/admin'

async function main() {
  const s = createAdminClient()
  const { data, error } = await s.from('devis_requests').select('*').limit(1)
  if (error) {
    console.log('ERR:', JSON.stringify(error))
    return
  }
  const row = data?.[0] ?? {}
  console.log('COLUMNS:', Object.keys(row).join(', '))
}

main().catch((e) => console.error('fatal:', e))
