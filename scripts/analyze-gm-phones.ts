import * as fs from 'fs'
import * as path from 'path'

const DATA_DIR = path.join(__dirname, '.gm-data')
const files = ['gm-listings.jsonl', 'gm-listings-v2.jsonl', 'gm-listings-cities.jsonl']

interface GMRecord {
  gmId: string
  name: string
  phone: string
  trade: string
  deptCode: string
  rating?: number
  reviewCount?: number
  website?: string
  city?: string
}

const phoneMap = new Map<string, GMRecord>()

for (const file of files) {
  const filepath = path.join(DATA_DIR, file)
  const lines = fs.readFileSync(filepath, 'utf-8').trim().split('\n')
  console.log(`${file}: ${lines.length} lines`)
  for (const line of lines) {
    try {
      const obj: GMRecord = JSON.parse(line)
      if (!obj.phone) continue
      const existing = phoneMap.get(obj.phone)
      if (!existing || (obj.city && !existing.city) || (obj.website && !existing.website) || (obj.rating && !existing.rating)) {
        phoneMap.set(obj.phone, { ...existing, ...obj })
      }
    } catch {}
  }
}

console.log(`\nUnique phones across all files: ${phoneMap.size}`)

const trades: Record<string, number> = {}
for (const [, v] of phoneMap) { trades[v.trade] = (trades[v.trade] || 0) + 1 }
console.log('Trades:', JSON.stringify(trades, null, 2))

let withCity = 0, withWebsite = 0, withRating = 0
for (const [, v] of phoneMap) {
  if (v.city) withCity++
  if (v.website) withWebsite++
  if (v.rating) withRating++
}
console.log(`With city: ${withCity}, With website: ${withWebsite}, With rating: ${withRating}`)
