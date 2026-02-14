/**
 * Export all artisans from Supabase to local JSONL cache.
 * Uses child_process curl (bypasses Node.js fetch timeout issues).
 * Pagination by PK (id) — no filters = always fast.
 * Supports --resume to continue from last exported ID.
 */
import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const CACHE_FILE = path.join(__dirname, '.enrich-data', 'artisans-cache.jsonl')
const PAGE_SIZE = 1000

function curlFetch(restUrl: string): string {
  return execSync(
    `curl -sS --max-time 120 "${restUrl}" -H "apikey: ${KEY}" -H "Authorization: Bearer ${KEY}"`,
    { encoding: 'utf-8', timeout: 130000 }
  )
}

async function main() {
  const resume = process.argv.includes('--resume')

  console.log('\n' + '='.repeat(60))
  console.log('  EXPORT ARTISANS → CACHE LOCAL')
  console.log('='.repeat(60))

  let lastId = ''
  let activeCount = 0
  let totalRead = 0

  // Resume support: read last ID from existing cache
  if (resume && fs.existsSync(CACHE_FILE)) {
    const existing = fs.readFileSync(CACHE_FILE, 'utf-8').trim().split('\n')
    activeCount = existing.length
    if (existing.length > 0) {
      const lastLine = JSON.parse(existing[existing.length - 1])
      lastId = lastLine.id
      totalRead = activeCount  // approximate (assumes ~100% active)
      console.log(`  Reprise depuis ${activeCount.toLocaleString('fr-FR')} artisans, dernier ID: ${lastId.substring(0, 8)}...`)
    }
  }

  const flags = resume ? 'a' : 'w'
  const outStream = fs.createWriteStream(CACHE_FILE, { flags })

  let retries = 0
  const startTime = Date.now()

  while (true) {
    let restUrl = `${URL}/rest/v1/providers?select=id,name,phone,address_postal_code,address_city,address_department,is_active&order=id.asc&limit=${PAGE_SIZE}`
    if (lastId) restUrl += `&id=gt.${lastId}`

    let rawJson: string
    try {
      rawJson = curlFetch(restUrl)
    } catch (e: any) {
      retries++
      if (retries > 20) {
        console.log(`  ABANDON: 20 retries à ${totalRead} lignes`)
        break
      }
      const wait = Math.min(3000 + retries * 2000, 30000)
      console.log(`  Retry ${retries} à ${totalRead} (attente ${wait/1000}s)...`)
      await new Promise(r => setTimeout(r, wait))
      continue
    }

    let data: any[]
    try {
      data = JSON.parse(rawJson)
      if ((data as any).code) {
        // Supabase error response: {"code":"PGRST003","message":"..."}
        throw new Error((data as any).message || 'Supabase error')
      }
    } catch (e: any) {
      retries++
      if (retries > 20) break
      const wait = Math.min(5000 + retries * 3000, 30000)
      console.log(`  Erreur parse/DB à ${totalRead}: ${e.message?.substring(0, 60)} (retry ${retries}, attente ${wait/1000}s)`)
      await new Promise(r => setTimeout(r, wait))
      continue
    }

    if (!Array.isArray(data) || data.length === 0) break
    retries = 0

    const lines: string[] = []
    for (const a of data) {
      totalRead++
      if (!a.is_active) continue
      activeCount++
      lines.push(JSON.stringify({
        id: a.id,
        name: a.name,
        phone: a.phone,
        cp: a.address_postal_code,
        city: a.address_city,
        dept: a.address_department
      }))
    }

    if (lines.length > 0) {
      outStream.write(lines.join('\n') + '\n')
    }

    lastId = data[data.length - 1].id

    if (totalRead % 5000 < PAGE_SIZE) {
      const elapsed = (Date.now() - startTime) / 1000
      const rate = elapsed > 0 ? Math.round(totalRead / elapsed) : 0
      console.log(`  ${totalRead.toLocaleString('fr-FR')} lus, ${activeCount.toLocaleString('fr-FR')} actifs (${rate}/s)`)
    }

    if (data.length < PAGE_SIZE) break
  }

  outStream.end()
  const elapsed = Math.round((Date.now() - startTime) / 1000)
  console.log(`\n  ✓ ${activeCount.toLocaleString('fr-FR')} artisans actifs exportés (${totalRead.toLocaleString('fr-FR')} lus)`)
  console.log(`  Durée: ${elapsed}s`)
  console.log(`  → artisans-cache.jsonl`)
  console.log('='.repeat(60) + '\n')
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
