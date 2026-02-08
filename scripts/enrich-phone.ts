/**
 * Enrichissement Telephonique des Artisans via Pages Jaunes
 *
 * Recherche les numeros de telephone des artisans sur pagesjaunes.fr
 * et met a jour la base de donnees Supabase.
 *
 * Usage:
 *   npx tsx scripts/enrich-phone.ts                    # Lancement complet
 *   npx tsx scripts/enrich-phone.ts --resume           # Reprendre apres interruption
 *   npx tsx scripts/enrich-phone.ts --limit 500        # Limiter a 500 artisans
 *   npx tsx scripts/enrich-phone.ts --dept 75          # Uniquement Paris
 *   npx tsx scripts/enrich-phone.ts --dept 13 --limit 100 --resume
 */

import { supabase } from './lib/supabase-admin'
import * as fs from 'fs'
import * as path from 'path'

// ============================================
// CONFIG
// ============================================

const BATCH_SIZE = 100
const RATE_LIMIT_MS = 1000         // 1 requete par seconde
const MAX_JITTER_MS = 500          // Jitter aleatoire 0-500ms
const MAX_RETRIES = 3
const BACKOFF_BASE_MS = 5000       // Backoff exponentiel: 5s, 10s, 20s
const PROGRESS_FILE = path.join(__dirname, '.enrich-phone-progress.json')
const PROGRESS_REPORT_INTERVAL = 50

// User-Agent realiste (Chrome sur Windows)
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
]

// ============================================
// STATE
// ============================================

let shuttingDown = false

const stats = {
  processed: 0,
  found: 0,
  notFound: 0,
  errors: 0,
  phonesUpdated: 0,
  emailsUpdated: 0,
  websitesUpdated: 0,
}

let startTime = Date.now()

// ============================================
// TYPES
// ============================================

interface Provider {
  id: string
  name: string
  address_city: string | null
  address_postal_code: string | null
  address_department: string | null
}

interface ScrapedContact {
  phone?: string
  email?: string
  website?: string
}

interface ProgressState {
  offset: number
  startedAt: string
  stats: typeof stats
  dept?: string
}

interface CliArgs {
  resume: boolean
  limit: number
  dept?: string
}

// ============================================
// HELPERS
// ============================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function randomJitter(): number {
  return Math.floor(Math.random() * MAX_JITTER_MS)
}

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}h${m % 60}m${s % 60}s`
  if (m > 0) return `${m}m${s % 60}s`
  return `${s}s`
}

function formatNumber(n: number): string {
  return n.toLocaleString('fr-FR')
}

// ============================================
// PHONE VALIDATION & NORMALIZATION
// ============================================

/**
 * Nettoie et normalise un numero de telephone francais.
 * Retourne le format 0XXXXXXXXX (10 chiffres) ou null si invalide.
 */
function normalizePhone(raw: string): string | null {
  if (!raw) return null

  // Supprimer tous les caracteres non-numeriques sauf le +
  let cleaned = raw.replace(/[^\d+]/g, '')

  // Convertir +33 en 0
  if (cleaned.startsWith('+33')) {
    cleaned = '0' + cleaned.substring(3)
  }

  // Convertir 0033 en 0
  if (cleaned.startsWith('0033')) {
    cleaned = '0' + cleaned.substring(4)
  }

  // Verifier le format: 10 chiffres commencant par 0[1-9]
  if (!/^0[1-9]\d{8}$/.test(cleaned)) {
    return null
  }

  // Exclure les numeros surtaxes (08XX) sauf 0800 (gratuit)
  if (cleaned.startsWith('089') || cleaned.startsWith('0891') || cleaned.startsWith('0892') || cleaned.startsWith('0899')) {
    return null
  }

  return cleaned
}

/**
 * Valide qu'un email a un format correct.
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !email.includes('..')
}

/**
 * Valide et nettoie une URL de site web.
 */
function normalizeWebsite(raw: string): string | null {
  if (!raw) return null

  let url = raw.trim()

  // Ajouter https:// si absent
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }

  try {
    const parsed = new URL(url)
    // Exclure les domaines generiques (pages jaunes, facebook, etc.)
    const excludedDomains = ['pagesjaunes.fr', 'facebook.com', 'instagram.com', 'twitter.com', 'linkedin.com']
    if (excludedDomains.some(d => parsed.hostname.includes(d))) {
      return null
    }
    return parsed.toString()
  } catch {
    return null
  }
}

// ============================================
// PAGES JAUNES SCRAPING
// ============================================

/**
 * Extrait les numeros de telephone depuis le HTML de Pages Jaunes.
 * Recherche dans plusieurs patterns courants du site.
 */
function extractPhoneFromHtml(html: string): string | null {
  const phones: string[] = []

  // Pattern 1: data-phone attribute
  const dataPhoneRegex = /data-phone="([^"]+)"/gi
  let match: RegExpExecArray | null
  while ((match = dataPhoneRegex.exec(html)) !== null) {
    const normalized = normalizePhone(match[1])
    if (normalized) phones.push(normalized)
  }

  // Pattern 2: tel: links
  const telLinkRegex = /href="tel:([^"]+)"/gi
  while ((match = telLinkRegex.exec(html)) !== null) {
    const normalized = normalizePhone(match[1])
    if (normalized) phones.push(normalized)
  }

  // Pattern 3: data-num attribute (PJ specific)
  const dataNumRegex = /data-num="([^"]+)"/gi
  while ((match = dataNumRegex.exec(html)) !== null) {
    const normalized = normalizePhone(match[1])
    if (normalized) phones.push(normalized)
  }

  // Pattern 4: Phone number in visible text (French format)
  // 0X XX XX XX XX or 0X.XX.XX.XX.XX or 0X-XX-XX-XX-XX or +33 X XX XX XX XX
  const visiblePhoneRegex = /(?:(?:\+33|0033)\s*[1-9](?:[\s.-]*\d{2}){4}|0[1-9](?:[\s.-]*\d{2}){4})/g
  while ((match = visiblePhoneRegex.exec(html)) !== null) {
    const normalized = normalizePhone(match[0])
    if (normalized) phones.push(normalized)
  }

  // Pattern 5: JSON-LD structured data
  const jsonLdRegex = /"telephone"\s*:\s*"([^"]+)"/gi
  while ((match = jsonLdRegex.exec(html)) !== null) {
    const normalized = normalizePhone(match[1])
    if (normalized) phones.push(normalized)
  }

  // Retourner le premier numero valide trouve (priorite aux patterns specifiques PJ)
  if (phones.length > 0) {
    return phones[0]
  }

  return null
}

/**
 * Extrait l'email depuis le HTML de Pages Jaunes.
 */
function extractEmailFromHtml(html: string): string | null {
  // Pattern 1: mailto: links
  const mailtoRegex = /href="mailto:([^"?]+)"/gi
  const match = mailtoRegex.exec(html)
  if (match) {
    const email = match[1].trim().toLowerCase()
    if (isValidEmail(email)) return email
  }

  // Pattern 2: data-email attribute
  const dataEmailRegex = /data-email="([^"]+)"/gi
  const match2 = dataEmailRegex.exec(html)
  if (match2) {
    const email = match2[1].trim().toLowerCase()
    if (isValidEmail(email)) return email
  }

  // Pattern 3: JSON-LD structured data
  const jsonLdRegex = /"email"\s*:\s*"([^"]+)"/gi
  const match3 = jsonLdRegex.exec(html)
  if (match3) {
    const email = match3[1].trim().toLowerCase()
    if (isValidEmail(email)) return email
  }

  return null
}

/**
 * Extrait le site web depuis le HTML de Pages Jaunes.
 */
function extractWebsiteFromHtml(html: string): string | null {
  // Pattern 1: Lien vers le site web (class contenant "website" ou "site")
  const websiteLinkRegex = /class="[^"]*(?:website|site-internet|site_web)[^"]*"[^>]*href="([^"]+)"/gi
  const match = websiteLinkRegex.exec(html)
  if (match) {
    return normalizeWebsite(match[1])
  }

  // Pattern 2: data-pjlb contenant "website" suivi d'un href
  const pjWebsiteRegex = /data-pjlb="[^"]*website[^"]*"[^>]*href="([^"]+)"/gi
  const match2 = pjWebsiteRegex.exec(html)
  if (match2) {
    return normalizeWebsite(match2[1])
  }

  // Pattern 3: JSON-LD structured data
  const jsonLdRegex = /"url"\s*:\s*"([^"]+)"/gi
  let jsonMatch: RegExpExecArray | null
  while ((jsonMatch = jsonLdRegex.exec(html)) !== null) {
    const url = normalizeWebsite(jsonMatch[1])
    if (url) return url
  }

  return null
}

/**
 * Recherche un artisan sur Pages Jaunes et extrait ses coordonnees.
 */
async function searchPagesJaunes(
  name: string,
  city: string,
  postalCode?: string,
): Promise<ScrapedContact | null> {
  // Premiere tentative: recherche par nom + ville
  const searchUrl = `https://www.pagesjaunes.fr/pagesblanches/recherche?quoiqui=${encodeURIComponent(name)}&ou=${encodeURIComponent(city)}`

  let html = await fetchPageWithRetry(searchUrl)

  // Si la recherche par ville ne donne rien, essayer avec le code postal
  if (!html && postalCode) {
    const fallbackUrl = `https://www.pagesjaunes.fr/pagesblanches/recherche?quoiqui=${encodeURIComponent(name)}&ou=${encodeURIComponent(postalCode)}`
    html = await fetchPageWithRetry(fallbackUrl)
  }

  if (!html) return null

  // Extraire les informations de contact
  const phone = extractPhoneFromHtml(html)
  const email = extractEmailFromHtml(html)
  const website = extractWebsiteFromHtml(html)

  // Si on n'a trouve aucune information utile, retourner null
  if (!phone && !email && !website) return null

  const result: ScrapedContact = {}
  if (phone) result.phone = phone
  if (email) result.email = email
  if (website) result.website = website

  return result
}

/**
 * Fetch une page avec gestion des erreurs et retries.
 */
async function fetchPageWithRetry(url: string): Promise<string | null> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.5,en;q=0.3',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Cache-Control': 'max-age=0',
        },
        signal: AbortSignal.timeout(15000),
        redirect: 'follow',
      })

      // Gestion du rate limiting (429)
      if (response.status === 429) {
        const backoffMs = BACKOFF_BASE_MS * Math.pow(2, attempt - 1)
        console.warn(`   [429] Rate limit atteint, attente ${backoffMs / 1000}s (tentative ${attempt}/${MAX_RETRIES})`)
        await sleep(backoffMs)
        continue
      }

      // Page non trouvee ou erreur client
      if (response.status === 404 || response.status === 403) {
        return null
      }

      // Autres erreurs serveur
      if (!response.ok) {
        if (attempt === MAX_RETRIES) return null
        await sleep(2000 * attempt)
        continue
      }

      const html = await response.text()

      // Verification que le contenu est du HTML valide (pas une page d'erreur vide)
      if (html.length < 500) return null

      return html
    } catch {
      // Erreur reseau ou timeout
      if (attempt === MAX_RETRIES) {
        return null
      }

      // Attendre avant de reessayer en cas d'erreur reseau
      await sleep(2000 * attempt)
    }
  }

  return null
}

// ============================================
// PROGRESS MANAGEMENT
// ============================================

function loadProgress(): ProgressState {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'))
      return data as ProgressState
    }
  } catch { /* ignorer */ }
  return {
    offset: 0,
    startedAt: new Date().toISOString(),
    stats: { ...stats },
  }
}

function saveProgress(offset: number, dept?: string): void {
  const progress: ProgressState = {
    offset,
    startedAt: new Date().toISOString(),
    stats: { ...stats },
    dept,
  }
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2))
}

function clearProgress(): void {
  try { fs.unlinkSync(PROGRESS_FILE) } catch { /* ignorer */ }
}

// ============================================
// CLI ARGS
// ============================================

function parseArgs(): CliArgs {
  const args = process.argv.slice(2)
  const result: CliArgs = {
    resume: false,
    limit: 0, // 0 = pas de limite
  }

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--resume':
        result.resume = true
        break
      case '--limit':
        result.limit = parseInt(args[++i], 10)
        if (isNaN(result.limit) || result.limit <= 0) {
          console.error('Erreur: --limit doit etre un nombre positif')
          process.exit(1)
        }
        break
      case '--dept':
        result.dept = args[++i]
        if (!result.dept || result.dept.length < 1) {
          console.error('Erreur: --dept doit etre un code departement valide (ex: 75, 13, 2A)')
          process.exit(1)
        }
        break
      case '--help':
      case '-h':
        console.log(`
Usage: npx tsx scripts/enrich-phone.ts [options]

Options:
  --resume        Reprendre apres interruption
  --limit N       Limiter a N artisans a traiter
  --dept XX       Filtrer par departement (ex: 75, 13, 2A)
  --help, -h      Afficher cette aide
`)
        process.exit(0)
        break
      default:
        console.error(`Option inconnue: ${args[i]}`)
        console.error('Utiliser --help pour afficher les options disponibles')
        process.exit(1)
    }
  }

  return result
}

// ============================================
// PROVIDER FETCHING
// ============================================

/**
 * Recupere un batch de providers necessitant un enrichissement telephonique.
 */
async function fetchProviderBatch(
  offset: number,
  batchSize: number,
  dept?: string,
): Promise<Provider[]> {
  let query = supabase
    .from('providers')
    .select('id, name, address_city, address_postal_code, address_department')
    .is('phone', null)
    .eq('source', 'annuaire_entreprises')
    .eq('is_active', true)
    .order('data_quality_score', { ascending: false })
    .range(offset, offset + batchSize - 1)

  if (dept) {
    query = query.eq('address_department', dept)
  }

  const { data, error } = await query

  if (error) {
    console.error(`Erreur recuperation providers: ${error.message}`)
    return []
  }

  return (data || []) as Provider[]
}

// ============================================
// ENRICHMENT
// ============================================

/**
 * Enrichit un seul provider avec les donnees Pages Jaunes.
 */
async function enrichProvider(provider: Provider): Promise<boolean> {
  const city = provider.address_city
  if (!city) {
    stats.notFound++
    return false
  }

  try {
    const contact = await searchPagesJaunes(
      provider.name,
      city,
      provider.address_postal_code || undefined,
    )

    if (!contact) {
      stats.notFound++
      return false
    }

    // Construire les champs a mettre a jour
    const updateFields: Record<string, unknown> = {}

    if (contact.phone) {
      updateFields.phone = contact.phone
      stats.phonesUpdated++
    }

    if (contact.email) {
      updateFields.email = contact.email
      stats.emailsUpdated++
    }

    if (contact.website) {
      updateFields.website = contact.website
      stats.websitesUpdated++
    }

    if (Object.keys(updateFields).length === 0) {
      stats.notFound++
      return false
    }

    // Mise a jour en base
    const { error } = await supabase
      .from('providers')
      .update(updateFields)
      .eq('id', provider.id)

    if (error) {
      console.error(`   Erreur mise a jour ${provider.name}: ${error.message}`)
      stats.errors++
      return false
    }

    stats.found++
    return true
  } catch {
    stats.errors++
    return false
  }
}

// ============================================
// PROGRESS DISPLAY
// ============================================

function printProgress(): void {
  const elapsed = Date.now() - startTime
  const rate = elapsed > 0 ? Math.round(stats.processed / (elapsed / 60000)) : 0
  const successRate = stats.processed > 0
    ? Math.round((stats.found / stats.processed) * 100)
    : 0

  console.log('')
  console.log(`   --- Progression (${formatNumber(stats.processed)} traites) ---`)
  console.log(`   Telephones trouves:    ${formatNumber(stats.found)}`)
  console.log(`   Non trouves:           ${formatNumber(stats.notFound)}`)
  console.log(`   Erreurs:               ${formatNumber(stats.errors)}`)
  console.log(`   Taux de reussite:      ${successRate}%`)
  console.log(`   Debit:                 ${formatNumber(rate)}/min`)
  console.log(`   Duree ecoulee:         ${formatDuration(elapsed)}`)
  console.log('')
}

function printSummary(): void {
  const elapsed = Date.now() - startTime
  const rate = elapsed > 0 ? Math.round(stats.processed / (elapsed / 60000)) : 0
  const successRate = stats.processed > 0
    ? Math.round((stats.found / stats.processed) * 100)
    : 0

  console.log('')
  console.log('='.repeat(60))
  console.log('  RESUME DE L\'ENRICHISSEMENT TELEPHONIQUE')
  console.log('='.repeat(60))
  console.log(`  Duree:                  ${formatDuration(elapsed)}`)
  console.log(`  Artisans traites:       ${formatNumber(stats.processed)}`)
  console.log('  ' + '-'.repeat(40))
  console.log(`  Telephones trouves:     ${formatNumber(stats.phonesUpdated)}`)
  console.log(`  Emails trouves:         ${formatNumber(stats.emailsUpdated)}`)
  console.log(`  Sites web trouves:      ${formatNumber(stats.websitesUpdated)}`)
  console.log('  ' + '-'.repeat(40))
  console.log(`  Contacts trouves:       ${formatNumber(stats.found)}`)
  console.log(`  Non trouves:            ${formatNumber(stats.notFound)}`)
  console.log(`  Erreurs:                ${formatNumber(stats.errors)}`)
  console.log('  ' + '-'.repeat(40))
  console.log(`  Taux de reussite:       ${successRate}%`)
  console.log(`  Debit:                  ${formatNumber(rate)} artisans/min`)
  console.log('='.repeat(60))
  console.log('')
}

// ============================================
// MAIN
// ============================================

async function main() {
  const args = parseArgs()

  console.log('')
  console.log('='.repeat(60))
  console.log('  ENRICHISSEMENT TELEPHONIQUE DES ARTISANS')
  console.log('  Source: Pages Jaunes (pagesjaunes.fr)')
  console.log('='.repeat(60))
  console.log('')

  // Arret gracieux sur Ctrl+C
  process.on('SIGINT', () => {
    if (shuttingDown) {
      console.log('\n\n   Arret force')
      process.exit(1)
    }
    console.log('\n\n   Arret gracieux en cours... sauvegarde de la progression...')
    shuttingDown = true
  })

  // Gestion de la reprise
  let currentOffset = 0

  if (args.resume) {
    const progress = loadProgress()
    currentOffset = progress.offset

    // Restaurer les stats de la session precedente
    if (progress.stats) {
      Object.assign(stats, progress.stats)
    }

    console.log(`   Reprise a l'offset ${formatNumber(currentOffset)}`)
    if (progress.dept) {
      console.log(`   Departement precedent: ${progress.dept}`)
    }
    console.log('')
  }

  if (args.dept) {
    console.log(`   Filtre departement: ${args.dept}`)
  }
  if (args.limit > 0) {
    console.log(`   Limite: ${formatNumber(args.limit)} artisans`)
  }
  console.log(`   Taille des batchs: ${BATCH_SIZE}`)
  console.log(`   Delai entre requetes: ${RATE_LIMIT_MS}ms + jitter ${MAX_JITTER_MS}ms`)
  console.log('')

  startTime = Date.now()
  let totalProcessed = 0
  let hasMore = true

  while (hasMore && !shuttingDown) {
    // Verifier la limite
    if (args.limit > 0 && totalProcessed >= args.limit) {
      console.log(`   Limite de ${formatNumber(args.limit)} artisans atteinte`)
      break
    }

    // Calculer la taille du batch en tenant compte de la limite
    let batchSize = BATCH_SIZE
    if (args.limit > 0) {
      batchSize = Math.min(BATCH_SIZE, args.limit - totalProcessed)
    }

    // Recuperer le prochain batch
    const providers = await fetchProviderBatch(currentOffset, batchSize, args.dept)

    if (providers.length === 0) {
      hasMore = false
      console.log('   Plus aucun artisan a enrichir')
      break
    }

    console.log(`   Batch: offset=${formatNumber(currentOffset)}, taille=${providers.length}`)

    // Traiter chaque provider du batch
    for (const provider of providers) {
      if (shuttingDown) break

      // Verifier la limite
      if (args.limit > 0 && totalProcessed >= args.limit) break

      // Afficher le provider en cours
      const cityInfo = provider.address_city || 'ville inconnue'
      process.stdout.write(
        `\r   [${formatNumber(totalProcessed + 1)}] ${provider.name.substring(0, 40).padEnd(40)} | ${cityInfo.substring(0, 20).padEnd(20)}`,
      )

      // Enrichir
      const found = await enrichProvider(provider)

      if (found) {
        process.stdout.write(' -> TROUVE\n')
      }

      stats.processed++
      totalProcessed++

      // Rapport de progression periodique
      if (stats.processed % PROGRESS_REPORT_INTERVAL === 0) {
        printProgress()
      }

      // Rate limiting avec jitter
      await sleep(RATE_LIMIT_MS + randomJitter())
    }

    // Avancer l'offset.
    // Les providers enrichis (phone != null) disparaissent du filtre phone IS NULL,
    // mais les providers non trouves restent. On avance l'offset pour eviter
    // de retraiter les memes providers sans resultats en boucle.
    currentOffset += providers.length

    // Sauvegarder la progression
    saveProgress(currentOffset, args.dept)
  }

  // Nettoyage de la progression si termine sans interruption
  if (!shuttingDown && (!args.limit || totalProcessed < args.limit || !hasMore)) {
    clearProgress()
  } else if (shuttingDown) {
    saveProgress(currentOffset, args.dept)
    console.log(`\n   Progression sauvegardee (offset: ${formatNumber(currentOffset)})`)
    console.log(`   Utilisez --resume pour reprendre`)
  }

  // Resume final
  printSummary()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n   Erreur fatale:', error)
    process.exit(1)
  })
