'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MapPin } from 'lucide-react'

interface ServiceProvider {
  id: string
  name: string
  slug: string
  stable_id?: string
  address_city?: string
  address_postal_code?: string
  provider_locations?: Array<{
    location?: { name: string; slug: string } | null
  }>
}

interface RecentProvidersProps {
  initialProviders: ServiceProvider[]
  serviceSlug: string
  serviceName: string
}

export default function RecentProviders({
  initialProviders,
  serviceSlug,
  serviceName,
}: RecentProvidersProps) {
  const [providers, setProviders] = useState<ServiceProvider[]>(initialProviders)
  const [isHydrating, setIsHydrating] = useState(initialProviders.length === 0)

  useEffect(() => {
    if (initialProviders.length > 0 || !serviceSlug) {
      setIsHydrating(false)
      return
    }
    let cancelled = false
    fetch(`/api/providers/listing?service=${serviceSlug}&limit=12`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (cancelled) return
        if (data?.providers?.length) {
          setProviders(data.providers)
        }
        setIsHydrating(false)
      })
      .catch(() => { if (!cancelled) setIsHydrating(false) })
    return () => { cancelled = true }
  }, [initialProviders.length, serviceSlug])

  if (!isHydrating && providers.length === 0) return null

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6 tracking-tight">
          {serviceName}s récemment ajoutés
        </h2>
        {isHydrating ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.slice(0, 6).map((provider) => {
              const location = provider.provider_locations?.[0]?.location
              return (
                <Link
                  key={provider.id}
                  href={`/services/${serviceSlug}/${location?.slug || 'france'}/${provider.stable_id || provider.slug}`}
                  className="bg-sand-50 rounded-lg p-4 hover:bg-primary-50 transition-colors group"
                >
                  <h3 className="font-semibold text-charcoal-900 group-hover:text-primary-500">
                    {provider.name}
                  </h3>
                  {provider.address_city && (
                    <p className="text-sm text-charcoal-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {provider.address_postal_code} {provider.address_city}
                    </p>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
