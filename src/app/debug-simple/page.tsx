import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export default async function DebugSimplePage() {
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // 1. Service
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('slug', 'plombier')
      .single()

    // 2. Location
    const { data: location, error: locationError } = await supabase
      .from('locations')
      .select('*')
      .eq('slug', 'paris')
      .single()

    // 3. Tous les artisans à Paris (sans filtre)
    const { data: allProviders } = await supabase
      .from('providers')
      .select('*')
      .ilike('address_city', 'Paris')
      .eq('is_active', true)

    // 4. Plombiers à Paris (avec filtre service)
    const { data: plumbers } = await supabase
      .from('providers')
      .select(`
        *,
        provider_services!inner(service_id)
      `)
      .eq('provider_services.service_id', service?.id || '')
      .ilike('address_city', 'Paris')
      .eq('is_active', true)

    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">🔍 Debug Simple</h1>

          {/* Timestamp */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-400">
              Généré le: {new Date().toLocaleString('fr-FR')}
            </p>
          </div>

          {/* Résultats principaux */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-600 rounded-lg p-6">
              <p className="text-sm text-blue-200 mb-2">Tous artisans Paris</p>
              <p className="text-4xl font-bold">{allProviders?.length || 0}</p>
            </div>
            
            <div className="bg-green-600 rounded-lg p-6">
              <p className="text-sm text-green-200 mb-2">Plombiers Paris</p>
              <p className="text-4xl font-bold">{plumbers?.length || 0}</p>
            </div>

            <div className="bg-purple-600 rounded-lg p-6">
              <p className="text-sm text-purple-200 mb-2">Différence</p>
              <p className="text-4xl font-bold">
                {(allProviders?.length || 0) - (plumbers?.length || 0)}
              </p>
            </div>
          </div>

          {/* Service */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Service</h2>
            {serviceError ? (
              <p className="text-red-400">Erreur: {serviceError.message}</p>
            ) : (
              <div className="space-y-2 text-sm">
                <p><strong>ID:</strong> {service?.id}</p>
                <p><strong>Nom:</strong> {service?.name}</p>
                <p><strong>Slug:</strong> {service?.slug}</p>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Location</h2>
            {locationError ? (
              <p className="text-red-400">Erreur: {locationError.message}</p>
            ) : (
              <div className="space-y-2 text-sm">
                <p><strong>ID:</strong> {location?.id}</p>
                <p><strong>Nom:</strong> {location?.name}</p>
                <p><strong>Slug:</strong> {location?.slug}</p>
              </div>
            )}
          </div>

          {/* Premiers plombiers */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              Premiers 10 plombiers ({plumbers?.length || 0} total)
            </h2>
            <div className="space-y-2">
              {plumbers?.slice(0, 10).map((p, i) => (
                <div key={p.id} className="bg-gray-700 p-3 rounded text-sm">
                  <p>
                    <strong>{i + 1}.</strong> {p.name}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {p.address_city} | Premium: {p.is_premium ? '✅' : '❌'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Env check */}
          <div className="mt-6 bg-gray-800 rounded-lg p-4">
            <p className="text-xs text-gray-400">
              <strong>Supabase URL:</strong> {supabaseUrl?.substring(0, 30)}...
            </p>
            <p className="text-xs text-gray-400">
              <strong>Has Key:</strong> {supabaseKey ? '✅' : '❌'}
            </p>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="min-h-screen bg-red-900 text-white p-8">
        <h1 className="text-3xl font-bold mb-4">❌ Erreur</h1>
        <pre className="bg-black p-4 rounded overflow-auto">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    )
  }
}
