'use client'

import { useEffect, useState } from 'react'

export default function TestGPSPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Test l'API avec les coordonnées de Champigny-sur-Marne
    fetch('/api/search/map?north=48.83&south=48.80&east=2.52&west=2.47&limit=20')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Erreur:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-bold">Diagnostic GPS en cours...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">🗺️ DIAGNOSTIC GPS</h1>
        
        {/* Statistiques */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">📊 Résultats API</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-600">
                {data?.providers?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Providers retournés</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-600">
                {data?.providers?.filter((p: any) => p.latitude && p.longitude).length || 0}
              </div>
              <div className="text-sm text-gray-600">Avec GPS</div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-purple-600">
                {data?.providers?.filter((p: any) => p.is_premium).length || 0}
              </div>
              <div className="text-sm text-gray-600">Premium</div>
            </div>
          </div>

          {/* Statut */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-semibold">API Success:</span>
              <span className={data?.success ? 'text-green-600' : 'text-red-600'}>
                {data?.success ? '✅ OUI' : '❌ NON'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-semibold">Bounds:</span>
              <span className="text-sm text-gray-600">
                {JSON.stringify(data?.bounds)}
              </span>
            </div>
          </div>
        </div>

        {/* Liste des providers */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">📍 Providers avec GPS</h2>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {data?.providers?.map((provider: any) => (
              <div 
                key={provider.id} 
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg">{provider.name}</h3>
                      {provider.is_premium && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold">
                          ⭐ PREMIUM
                        </span>
                      )}
                      {provider.is_verified && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
                          ✓ Vérifié
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="font-semibold">Latitude:</span>{' '}
                        <span className={provider.latitude ? 'text-green-600 font-mono' : 'text-red-600'}>
                          {provider.latitude ? provider.latitude.toFixed(6) : '❌ NULL'}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold">Longitude:</span>{' '}
                        <span className={provider.longitude ? 'text-green-600 font-mono' : 'text-red-600'}>
                          {provider.longitude ? provider.longitude.toFixed(6) : '❌ NULL'}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold">Ville:</span> {provider.address_city || '—'}
                      </div>
                      <div>
                        <span className="font-semibold">Spécialité:</span> {provider.specialty || '—'}
                      </div>
                    </div>

                    {/* Google Maps Link */}
                    {provider.latitude && provider.longitude && (
                      <a
                        href={`https://www.google.com/maps?q=${provider.latitude},${provider.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm mt-2"
                      >
                        🗺️ Voir sur Google Maps →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* JSON Brut */}
        <details className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <summary className="font-bold text-xl cursor-pointer hover:text-blue-600">
            📋 JSON Brut (debug)
          </summary>
          <pre className="mt-4 p-4 bg-gray-50 rounded text-xs overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  )
}
