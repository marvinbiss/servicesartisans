import { getProvidersByServiceAndLocation, getServiceBySlug, getLocationBySlug } from '@/lib/supabase'

export const dynamic = 'force-dynamic' // Toujours dynamique, jamais de cache
export const revalidate = 0

export default async function DebugPlombiersPage() {
  const serviceSlug = 'plombier'
  const locationSlug = 'paris'

  try {
    // Test 1: Récupérer service et location
    const [service, location] = await Promise.all([
      getServiceBySlug(serviceSlug),
      getLocationBySlug(locationSlug),
    ])

    // Test 2: Récupérer les providers
    const providers = await getProvidersByServiceAndLocation(serviceSlug, locationSlug)

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">🔍 Debug Page - Plombiers Paris</h1>

          {/* Service Info */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">1️⃣ Service</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(service, null, 2)}
            </pre>
          </div>

          {/* Location Info */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">2️⃣ Location</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(location, null, 2)}
            </pre>
          </div>

          {/* Providers Count */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">3️⃣ Providers</h2>
            <p className="text-2xl font-bold text-blue-600 mb-4">
              Total: {providers?.length || 0} plombiers trouvés
            </p>
            
            {/* Premiers 10 providers */}
            <div className="space-y-2">
              <h3 className="font-semibold">Premiers 10:</h3>
              {providers?.slice(0, 10).map((p, i) => (
                <div key={p.id} className="bg-gray-50 p-2 rounded text-sm">
                  {i + 1}. <strong>{p.name}</strong> - {p.address_city || 'N/A'}
                </div>
              ))}
            </div>
          </div>

          {/* Raw Data */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">4️⃣ Raw Providers Data (premiers 3)</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
              {JSON.stringify(providers?.slice(0, 3), null, 2)}
            </pre>
          </div>

          {/* Timestamp */}
          <div className="mt-6 text-center text-gray-500 text-sm">
            Généré le: {new Date().toLocaleString('fr-FR')}
          </div>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="min-h-screen bg-red-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-red-600 mb-4">❌ Erreur</h1>
          <pre className="bg-white p-4 rounded shadow">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      </div>
    )
  }
}
