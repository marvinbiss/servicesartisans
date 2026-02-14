/**
 * Diagnostic: pourquoi ~24k numeros PJ ne matchent pas ?
 */
import * as fs from 'fs'
import * as path from 'path'
import { Client } from 'pg'

const PG_URL = 'postgresql://postgres:BEB6LnGlT6U9bkTe@db.umjmbdbwcsxrvfqktiui.supabase.co:5432/postgres'
const LISTINGS_FILE = path.join(__dirname, '.enrich-data', 'pj-listings.jsonl')

const COMMON_WORDS = new Set([
  'plomberie','plombier','chauffage','chauffagiste','electricite','electricien',
  'peinture','peintre','menuiserie','menuisier','maconnerie','macon',
  'carrelage','carreleur','couverture','couvreur','serrurerie','serrurier',
  'isolation','platrier','platrerie','renovation','batiment','travaux',
  'construction','entreprise','artisan','services','service','general',
  'generale','multi','pro','plus','france','sud','nord','est','ouest',
  'climatisation','terrassement','demolition','assainissement','domotique',
  'ramonage','etancheite','depannage','paysagiste','vitrier',
  'chauffagistes','electriciens','menuisiers','macons','peintres','carreleurs',
  'couvreurs','serruriers','plombiers','charpentier','charpente',
  'toiture','facade','ravalement','enduit','cloture',
  'amenagement','interieur','exterieur','habitat','logement','maison',
  'techni','technique','professionnel','groupe','agence','cabinet','atelier','bureau',
])

function normalizeName(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(sarl|sas|sa|eurl|sasu|eirl|ei|sci|snc|scop|scp|selarl|auto[- ]?entrepreneur|micro[- ]?entreprise|ets|etablissements?|entreprise|societe|ste|monsieur|madame|m\.|mme|mr|dr|cabinet|agence|atelier|groupe|holding)\b/gi, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ').trim()
}

interface PJListing {
  name: string
  phone?: string
  postalCode?: string
  deptCode: string
  trade: string
}

async function main() {
  const lines = fs.readFileSync(LISTINGS_FILE, 'utf-8').trim().split('\n')
  const listings: PJListing[] = lines.map(l => JSON.parse(l)).filter((l: any) => l.phone)

  // Dedup by phone
  const seen = new Set<string>()
  const unique: PJListing[] = []
  for (const l of listings) {
    if (!seen.has(l.phone!)) { seen.add(l.phone!); unique.push(l) }
  }

  const client = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false } })
  await client.connect()

  // Get all phones currently in DB
  const dbPhones = await client.query('SELECT phone FROM providers WHERE phone IS NOT NULL AND is_active = true')
  const dbPhoneSet = new Set(dbPhones.rows.map((r: any) => r.phone))

  const alreadyInDb = unique.filter(l => dbPhoneSet.has(l.phone!))
  const notInDb = unique.filter(l => !dbPhoneSet.has(l.phone!))

  console.log('=== DIAGNOSTIC DES NUMEROS PJ ===')
  console.log(`Telephones PJ uniques: ${unique.length}`)
  console.log(`Deja dans la DB: ${alreadyInDb.length} (matches reussis ou pre-existants)`)
  console.log(`PAS dans la DB: ${notInDb.length} (non matches)`)

  // Sample 50 unmatched and check WHY
  console.log('\n=== ECHANTILLON DE 50 NON-MATCHES ===')
  const shuffled = [...notInDb].sort(() => Math.random() - 0.5)
  const sample = shuffled.slice(0, 50)

  let foundSameCP = 0
  let foundSameDept = 0
  let foundDiffName = 0
  let totalNotFound = 0

  for (const l of sample) {
    const norm = normalizeName(l.name)
    const distinctive = norm.split(' ').filter(w => w.length >= 3 && !COMMON_WORDS.has(w))

    let status = 'INTROUVABLE'
    let dbMatch = ''

    // Strategy 1: exact word in same postal code
    if (distinctive.length > 0 && l.postalCode) {
      const r = await client.query(
        `SELECT name, phone FROM providers WHERE address_postal_code = $1 AND is_active = true AND LOWER(name) LIKE $2 LIMIT 1`,
        [l.postalCode, '%' + distinctive[0].toLowerCase() + '%']
      )
      if (r.rows.length > 0) {
        foundSameCP++
        status = 'TROUVABLE_CP'
        dbMatch = `${r.rows[0].name} | tel: ${r.rows[0].phone || 'NULL'}`
      }
    }

    // Strategy 2: same dept + name match
    if (status === 'INTROUVABLE' && distinctive.length > 0) {
      const r = await client.query(
        `SELECT name, phone FROM providers WHERE address_department = $1 AND is_active = true AND LOWER(name) LIKE $2 LIMIT 1`,
        [l.deptCode, '%' + distinctive[0].toLowerCase() + '%']
      )
      if (r.rows.length > 0) {
        foundSameDept++
        status = 'TROUVABLE_DEPT'
        dbMatch = `${r.rows[0].name} | tel: ${r.rows[0].phone || 'NULL'}`
      }
    }

    if (status === 'INTROUVABLE') totalNotFound++

    const tag = status === 'INTROUVABLE' ? '  X' : '  ✓'
    console.log(`${tag} [${status}] PJ: "${l.name}" (${l.deptCode}/${l.postalCode}) | dist: [${distinctive.join(',')}]${dbMatch ? ' → DB: ' + dbMatch : ''}`)
  }

  console.log('\n=== RESULTAT SUR 50 NON-MATCHES ===')
  console.log(`Trouvable meme CP: ${foundSameCP}`)
  console.log(`Trouvable meme dept: ${foundSameDept}`)
  console.log(`Total trouvable: ${foundSameCP + foundSameDept}`)
  console.log(`Vraiment introuvable: ${totalNotFound}`)
  console.log(`\n=== PROJECTION SUR ${notInDb.length} NON-MATCHES ===`)
  const recoverRate = (foundSameCP + foundSameDept) / 50
  console.log(`Taux recuperable: ${(recoverRate * 100).toFixed(0)}%`)
  console.log(`Potentiel: +${Math.round(notInDb.length * recoverRate)} telephones supplementaires`)

  await client.end()
}

main().catch(e => { console.error(e); process.exit(1) })
