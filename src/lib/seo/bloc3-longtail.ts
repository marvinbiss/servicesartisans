/**
 * Bloc 3 long-tail loader (Sprint 3 vague 4 — 2026-05-04).
 *
 * @ahrefs-source tmp/ahrefs/bloc3-longtail-2026-05-04.csv (532 KW unique,
 *   coût 6.6K unités). Sourcing 7 seeds critiques : vmc, pompe a chaleur,
 *   panneau solaire, ma prime renov, cee, dpe, isolation. Filtres :
 *   volume>=100, kd<=30. Endpoint Ahrefs v3 keywords-explorer/matching-terms.
 * @snapshot 2026-05-04
 *
 * Charge le CSV au build (Node fs sync) et expose les top N KW pour le
 * `generateStaticParams` de la route `/guides/long-tail/[slug]`. Cap 50
 * pré-rendus pour limiter build time + reste accessible en ISR
 * (dynamicParams=true).
 */
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

export type LongTailKw = {
  /** Seed Ahrefs ayant matché ce KW */
  seed: string
  /** KW exact tel que retourné par Ahrefs (peut contenir accents/espaces) */
  keyword: string
  /** Slug stable URL-safe dérivé du KW (kebab-case ASCII sans accent) */
  slug: string
  /** Volume mensuel France */
  volume: number
  /** Keyword Difficulty Ahrefs (0-100) */
  kd: number
  /** CPC € (peut être null si Ahrefs n'a pas la donnée) */
  cpc: number | null
}

const CSV_PATH = join(process.cwd(), 'tmp', 'ahrefs', 'bloc3-longtail-2026-05-04.csv')

/**
 * Slugifie un keyword pour usage URL :
 *   "isolation par l'extérieur" → "isolation-par-l-exterieur"
 *   "vmc salle de bain"         → "vmc-salle-de-bain"
 *   "vmc hygroréglable"         → "vmc-hygroreglable"
 */
export function slugifyKeyword(kw: string): string {
  return kw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['']/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
}

function parseCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (c === ',' && !inQuotes) {
      out.push(cur)
      cur = ''
    } else {
      cur += c
    }
  }
  out.push(cur)
  return out
}

let cached: LongTailKw[] | null = null

export function loadLongTailKeywords(): LongTailKw[] {
  if (cached) return cached
  if (!existsSync(CSV_PATH)) {
    cached = []
    return cached
  }
  const raw = readFileSync(CSV_PATH, 'utf8')
  const lines = raw.split(/\r?\n/).filter((l) => l.length > 0)
  const [, ...rows] = lines // skip header
  const seenSlugs = new Set<string>()
  const parsed: LongTailKw[] = []
  for (const line of rows) {
    const [seed, keyword, volumeStr, kdStr, cpcStr] = parseCsvLine(line)
    if (!seed || !keyword) continue
    const slug = slugifyKeyword(keyword)
    if (slug.length < 3 || seenSlugs.has(slug)) continue
    seenSlugs.add(slug)
    const volume = Number.parseInt(volumeStr, 10)
    const kd = Number.parseInt(kdStr, 10)
    const cpc = cpcStr === '' ? null : Number.parseFloat(cpcStr)
    if (!Number.isFinite(volume) || !Number.isFinite(kd)) continue
    parsed.push({
      seed,
      keyword,
      slug,
      volume,
      kd,
      cpc: Number.isFinite(cpc as number) ? cpc : null,
    })
  }
  parsed.sort((a, b) => b.volume - a.volume || a.kd - b.kd)
  cached = parsed
  return cached
}

export function getLongTailBySlug(slug: string): LongTailKw | undefined {
  return loadLongTailKeywords().find((k) => k.slug === slug)
}

/**
 * Top N KW pour pré-rendu — cap volontaire pour limiter build time.
 * Reste 100% accessible en ISR (dynamicParams=true).
 */
export function getTopLongTailKeywords(limit = 50): LongTailKw[] {
  return loadLongTailKeywords().slice(0, limit)
}

/**
 * Mapping seed → slug topic de la nav SA. Permet de pointer le breadcrumb
 * et le maillage interne vers le hub cluster correspondant.
 */
export function getTopicHubForSeed(seed: string): { label: string; href: string } | null {
  switch (seed) {
    case 'vmc':
      return { label: 'VMC', href: '/renovation-energetique/travaux/vmc' }
    case 'pompe a chaleur':
      return { label: 'Pompe à chaleur', href: '/renovation-energetique/travaux/pompe-a-chaleur' }
    case 'panneau solaire':
      return { label: 'Solaire', href: '/renovation-energetique/travaux' }
    case 'ma prime renov':
      return { label: 'MaPrimeRénov', href: '/aides/maprimerenov' }
    case 'cee':
      return { label: 'CEE', href: '/cee' }
    case 'dpe':
      return { label: 'DPE', href: '/renovation-energetique/diagnostic/dpe' }
    case 'isolation':
      return { label: 'Isolation', href: '/renovation-energetique/travaux/isolation' }
    default:
      return null
  }
}
