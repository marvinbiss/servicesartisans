const API_KEY = process.env.SCRAPER_API_KEY!
const PJ = 'https://www.pagesjaunes.fr/annuaire/bouches-du-rhone-13/plombiers'

async function test(label: string, params: string) {
  console.log(`\n--- ${label} ---`)
  const url = `https://api.scraperapi.com?api_key=${API_KEY}&url=${encodeURIComponent(PJ)}${params}`
  try {
    const t = Date.now()
    const res = await fetch(url, { signal: AbortSignal.timeout(120000) })
    const html = await res.text()
    console.log(`  Status: ${res.status} | ${html.length} chars | ${Date.now()-t}ms`)
    if (res.status === 200 && html.length > 10000) {
      const phones = (html.match(/(?:0[1-9])(?:[\s.-]?\d{2}){4}/g) || []).length
      const jsonLd = (html.match(/application\/ld\+json/g) || []).length
      console.log(`  phones: ${phones} | JSON-LD: ${jsonLd}`)
      if (html.includes('Un instant') || html.includes('datadome')) console.log('  ⛔ CHALLENGE')
    } else {
      console.log(`  ${html.substring(0, 200)}`)
    }
  } catch (e: any) { console.log(`  ERROR: ${e.message}`) }
}

async function main() {
  // Already consumed credits on basic, now test enhanced modes
  await test('render=true', '&render=true')
  await test('premium+render', '&premium=true&render=true')
  await test('ultra_premium', '&ultra_premium=true')
}

main().catch(e => console.error(e))
