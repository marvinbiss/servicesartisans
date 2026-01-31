import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  MapPin,
  Phone,
  Globe,
  Mail,
  Star,
  BadgeCheck,
  Award,
  ArrowLeft,
  Share2,
  Heart,
  Calendar,
  Clock,
} from 'lucide-react'
import { getProviderBySlug, getServiceBySlug, getLocationBySlug } from '@/lib/supabase'
import BookingCalendar from '@/components/BookingCalendar'

interface PageProps {
  params: Promise<{
    service: string
    location: string
    provider: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { service: serviceSlug, location: locationSlug, provider: providerSlug } = await params

  try {
    const [provider, service, location] = await Promise.all([
      getProviderBySlug(providerSlug),
      getServiceBySlug(serviceSlug),
      getLocationBySlug(locationSlug),
    ])

    if (!provider) return { title: 'Artisan non trouvé' }

    const title = `${provider.name} - ${service?.name || 'Artisan'} à ${location?.name || provider.address_city}`
    const description = `${provider.name}, ${service?.name?.toLowerCase() || 'artisan'} à ${location?.name || provider.address_city}. Avis, tarifs et devis gratuit.`

    return { title, description, openGraph: { title, description, type: 'profile' } }
  } catch {
    return { title: 'Artisan non trouvé' }
  }
}

export default async function ProviderPage({ params }: PageProps) {
  const { service: serviceSlug, location: locationSlug, provider: providerSlug } = await params

  let provider, service, location
  try {
    ;[provider, service, location] = await Promise.all([
      getProviderBySlug(providerSlug),
      getServiceBySlug(serviceSlug),
      getLocationBySlug(locationSlug),
    ])
    if (!provider) notFound()
  } catch {
    notFound()
  }

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
    }
    return phone
  }

  const ensureHttps = (url: string) => {
    if (!url.startsWith('http')) return `https://${url}`
    return url
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm flex-wrap">
            <Link href="/" className="text-gray-500 hover:text-gray-700">Accueil</Link>
            <span className="text-gray-400">/</span>
            <Link href={`/services/${serviceSlug}`} className="text-gray-500 hover:text-gray-700">
              {service?.name}
            </Link>
            <span className="text-gray-400">/</span>
            <Link href={`/services/${serviceSlug}/${locationSlug}`} className="text-gray-500 hover:text-gray-700">
              {location?.name}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium truncate">{provider.name}</span>
          </nav>
        </div>
      </div>

      {/* Back button */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <Link href={`/services/${serviceSlug}/${locationSlug}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          Retour aux résultats
        </Link>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {provider.is_premium && (
                  <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    <Award className="w-4 h-4" /> Artisan Premium
                  </span>
                )}
                {provider.is_verified && (
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    <BadgeCheck className="w-4 h-4" /> Vérifié
                  </span>
                )}
              </div>

              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{provider.name}</h1>
                  <p className="text-gray-600 mt-1">{service?.name} à {location?.name || provider.address_city}</p>
                </div>
                <div className="flex items-center gap-1 bg-green-50 px-3 py-2 rounded-lg">
                  <Star className="w-5 h-5 text-green-600 fill-green-600" />
                  <span className="text-green-700 font-bold text-lg">4.5</span>
                  <span className="text-green-600 text-sm">(12)</span>
                </div>
              </div>

              {(provider.address_street || provider.address_city) && (
                <div className="flex items-start gap-3 mt-6 p-4 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    {provider.address_street && <p className="text-gray-900">{provider.address_street}</p>}
                    <p className="text-gray-600">{provider.address_postal_code} {provider.address_city}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Share2 className="w-4 h-4" /> Partager
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Heart className="w-4 h-4" /> Sauvegarder
                </button>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">À propos</h2>
              <p className="text-gray-600">
                {provider.name} est un professionnel {service?.name?.toLowerCase()} intervenant à {location?.name || provider.address_city} et ses environs.
              </p>
            </div>

            {/* Reviews placeholder */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Avis clients</h2>
              <div className="text-center py-8 text-gray-500">
                <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Aucun avis pour le moment</p>
              </div>
            </div>
          </div>

          {/* Right column - Contact & Booking */}
          <div className="lg:col-span-1 space-y-6">
            {/* Booking Calendar */}
            <div id="booking">
              <BookingCalendar
                artisanId={provider.id}
                artisanName={provider.name}
                serviceName={service?.name || 'Service'}
              />
            </div>

            {/* Contact Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Contact</h2>

              <div className="space-y-3">
                {provider.phone && (
                  <a href={`tel:${provider.phone}`} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors">
                    <Phone className="w-5 h-5" />
                    <span className="font-medium">{formatPhone(provider.phone)}</span>
                  </a>
                )}

                {provider.email && (
                  <a href={`mailto:${provider.email}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                    <Mail className="w-5 h-5" />
                    <span className="truncate">{provider.email}</span>
                  </a>
                )}

                {provider.website && (
                  <a href={ensureHttps(provider.website)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                    <Globe className="w-5 h-5" />
                    <span className="truncate">Site web</span>
                  </a>
                )}
              </div>

              {/* CTA */}
              <div className="mt-6 space-y-3" id="devis">
                <a
                  href="#booking"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Clock className="w-5 h-5" />
                  Réserver un créneau
                </a>
                {provider.phone && (
                  <a href={`tel:${provider.phone}`} className="block w-full border-2 border-green-600 text-green-600 py-3 px-4 rounded-lg font-semibold hover:bg-green-50 transition-colors text-center">
                    Appeler maintenant
                  </a>
                )}
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                Réservation en ligne disponible 24h/24
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
