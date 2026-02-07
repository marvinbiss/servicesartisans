import { villes, departements, services } from '@/lib/data/france'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Debug Routes | ServicesArtisans',
  robots: { index: false, follow: false },
}

async function getProviderStats() {
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()

    const [
      { count: totalActive },
      { count: withSlug },
      { count: noindexFalse },
      { count: noindexTrue },
    ] = await Promise.all([
      supabase.from('providers').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('providers').select('*', { count: 'exact', head: true }).eq('is_active', true).not('slug', 'is', null),
      supabase.from('providers').select('*', { count: 'exact', head: true }).eq('is_active', true).eq('noindex', false),
      supabase.from('providers').select('*', { count: 'exact', head: true }).eq('is_active', true).eq('noindex', true),
    ])

    return { totalActive, withSlug, noindexFalse, noindexTrue }
  } catch (err) {
    return { totalActive: null, withSlug: null, noindexFalse: null, noindexTrue: null, error: String(err) }
  }
}

export default async function DebugRoutesPage() {
  const dbStats = await getProviderStats()

  const geoStats = {
    villes: villes.length,
    departements: departements.length,
    regions: 18, // 13 metro + 5 DOM-TOM
    services: services.length,
  }

  // Sitemap estimate
  const staticPages = 19
  const servicePages = 15
  const serviceVillePages = 15 * 10 // top 10 cities
  const blogPages = 4
  const geoPages = geoStats.villes + geoStats.departements + geoStats.regions
  const providerPages = dbStats.withSlug || 0
  const totalSitemap = staticPages + servicePages + serviceVillePages + blogPages + geoPages + Number(providerPages)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Debug: Routes & Sitemap</h1>
        <p className="text-gray-500 mb-8">Diagnostic page — not indexed</p>

        {/* Geo data */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Geo Data (france.ts)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Villes" value={geoStats.villes} />
            <Stat label="Départements" value={geoStats.departements} />
            <Stat label="Régions" value={geoStats.regions} />
            <Stat label="Services" value={geoStats.services} />
          </div>
        </section>

        {/* DB stats */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Database Providers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Total actifs" value={dbStats.totalActive} />
            <Stat label="Avec slug" value={dbStats.withSlug} />
            <Stat label="noindex=false" value={dbStats.noindexFalse} color="green" />
            <Stat label="noindex=true" value={dbStats.noindexTrue} color="red" />
          </div>
          {'error' in dbStats && dbStats.error && (
            <p className="text-red-600 text-sm mt-4">DB Error: {dbStats.error}</p>
          )}
        </section>

        {/* Sitemap estimate */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sitemap Estimate</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-gray-600">Section</th>
                <th className="text-right py-2 text-gray-600">Count</th>
              </tr>
            </thead>
            <tbody>
              <Row label="Static pages" count={staticPages} />
              <Row label="Service pages" count={servicePages} />
              <Row label="Service × Ville hubs" count={serviceVillePages} />
              <Row label="Ville pages" count={geoStats.villes} />
              <Row label="Département pages" count={geoStats.departements} />
              <Row label="Région pages" count={geoStats.regions} />
              <Row label="Blog pages" count={blogPages} />
              <Row label="Provider pages (DB)" count={Number(providerPages)} />
              <tr className="border-t-2 font-bold">
                <td className="py-2">TOTAL Sitemap URLs</td>
                <td className="text-right py-2 text-blue-600">{totalSitemap.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Active routes */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Active Route Patterns</h2>
          <div className="space-y-2 text-sm font-mono">
            <Route path="/villes" type="SSG index" count={1} />
            <Route path="/villes/[ville]" type="SSG" count={geoStats.villes} />
            <Route path="/departements" type="SSG index" count={1} />
            <Route path="/departements/[dept]" type="SSG" count={geoStats.departements} />
            <Route path="/regions" type="SSG index" count={1} />
            <Route path="/regions/[region]" type="SSG" count={geoStats.regions} />
            <Route path="/services/[service]" type="ISR 30min" count={15} />
            <Route path="/services/[service]/[location]" type="force-dynamic" count="∞" />
            <Route path="/services/[s]/[l]/[publicId]" type="force-dynamic" count="∞" />
            <Route path="/blog/[slug]" type="static" count={4} />
          </div>
        </section>
      </div>
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: number | null; color?: string }) {
  const colorClass = color === 'green' ? 'text-green-600' : color === 'red' ? 'text-red-600' : 'text-blue-600'
  return (
    <div className="text-center p-3 bg-gray-50 rounded-lg">
      <div className={`text-2xl font-bold ${colorClass}`}>
        {value !== null ? Number(value).toLocaleString() : '?'}
      </div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}

function Row({ label, count }: { label: string; count: number }) {
  return (
    <tr className="border-b">
      <td className="py-2 text-gray-700">{label}</td>
      <td className="text-right py-2 font-medium">{count.toLocaleString()}</td>
    </tr>
  )
}

function Route({ path, type, count }: { path: string; type: string; count: number | string }) {
  return (
    <div className="flex items-center justify-between py-1 px-3 bg-gray-50 rounded">
      <span className="text-blue-600">{path}</span>
      <div className="flex items-center gap-3">
        <span className="text-gray-500 text-xs">{type}</span>
        <span className="font-bold text-gray-900">{count}</span>
      </div>
    </div>
  )
}
