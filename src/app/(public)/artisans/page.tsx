import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { MapPin, Star, Phone, Search, Users, Building2 } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { SITE_URL, PHONE_TEL, getAlternates } from '@/lib/seo/config'
import { getArtisanUrl, getAvatarColor } from '@/lib/utils'
import { services as staticServicesList } from '@/lib/data/france'
import { resolveProviderCities } from '@/lib/insee-resolver'
import dynamic from 'next/dynamic'
const GeoPageCTA = dynamic(() => import('@/components/conversion/GeoPageCTA'), { ssr: false })

export const revalidate = 3600 // ISR - revalidate every hour

export const metadata: Metadata = {
  title: 'Annuaire Artisans RGE Certifiés France — SIREN Vérifiés',
  description:
    "Trouvez un artisan RGE certifié (Qualibat, Qualifelec, QualiPAC, Qualit'EnR) près de chez vous. Pompe à chaleur, isolation, photovoltaïque, plomberie et 20+ métiers RGE. Données SIREN officielles + certification RGE vérifiée ADEME.",
  alternates: getAlternates(`/artisans`),
  openGraph: {
    locale: 'fr_FR',
    title: 'Annuaire Artisans RGE Certifiés France — SIREN Vérifiés',
    description:
      "Trouvez un artisan RGE certifié (Qualibat, Qualifelec, QualiPAC, Qualit'EnR) en France. 100 % des artisans publiés sont RGE — données SIREN officielles et certification RGE vérifiée ADEME.",
    url: `${SITE_URL}/artisans`,
    siteName: 'ServicesArtisans',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Annuaire Artisans RGE Certifiés France — SIREN Vérifiés',
    description:
      "Trouvez un artisan RGE certifié (Qualibat, Qualifelec, QualiPAC, Qualit'EnR) près de chez vous. Données SIREN officielles + certification RGE vérifiée ADEME.",
  },
}

// Direct Supabase query — revalidated via ISR (revalidate = 3600)
async function getRecentProviders(limit = 50) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
      return { providers: [], count: 0, error: `Env vars missing: URL=${!!url}, KEY=${!!key}` }
    }

    const supabase = createClient(url, key)
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('providers')
      .select(
        'id, stable_id, name, slug, specialty, address_street, address_postal_code, address_city, address_region, is_verified, is_active, phone, siret, rating_average, review_count'
      )
      .eq('is_active', true)
      .not('rge_qualifications', 'is', null)
      .gte('rge_valid_until', today)
      .order('phone', { ascending: false, nullsFirst: false })
      .order('is_verified', { ascending: false })
      .limit(limit)

    if (error) {
      return {
        providers: [],
        count: 0,
        error: `Query error: ${error.message} (code: ${error.code})`,
      }
    }

    // Get total count — RGE-only (~49 611 fiches publiées)
    let totalCount = data?.length ?? 0
    try {
      const { count } = await supabase
        .from('providers')
        .select('id', { count: 'estimated', head: true })
        .eq('is_active', true)
        .not('rge_qualifications', 'is', null)
        .gte('rge_valid_until', today)
      if (count && count > 0) totalCount = count
    } catch {
      // Count failed — use 0 to avoid displaying false numbers
      totalCount = 0
    }

    return {
      providers: resolveProviderCities(data || []),
      count: totalCount,
      error: null,
    }
  } catch (error: unknown) {
    return {
      providers: [],
      count: 0,
      error: `Exception: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export default async function ArtisansPage() {
  const { providers, count, error } = await getRecentProviders(60)
  const topServices = staticServicesList.slice(0, 15)

  const breadcrumbItems = [{ label: 'Accueil', href: '/' }, { label: 'Artisans' }]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Artisans', url: '/artisans' },
  ])

  const faqSchema = getFAQSchema([
    {
      question: 'Comment sont sélectionnés les artisans RGE certifiés ?',
      answer:
        "Nous référençons uniquement les artisans titulaires d'une qualification RGE (Reconnu Garant de l'Environnement) en cours de validité : Qualibat, Qualifelec, QualiPAC, Qualit'EnR (qui regroupe les certifications QualiBois, QualiSol et QualiPV). Chaque fiche est vérifiée SIRET via SIRENE/INSEE et synchronisée chaque semaine avec la base ADEME officielle (france-renov.gouv.fr). Les fiches dont le RGE expire ou en cessation d'activité sont automatiquement masquées.",
    },
    {
      question: 'Comment savoir si un artisan est certifié RGE ?',
      answer:
        "Tous les artisans publiés sur ServicesArtisans sont RGE certifiés. Chaque fiche affiche les qualifications RGE en cours de validité (Qualibat, Qualifelec, QualiPAC, Qualit'EnR — incluant QualiBois, QualiSol, QualiPV), leur numéro, leur domaine et leur date d'expiration. Ces données proviennent de la base officielle ADEME et sont synchronisées chaque semaine.",
    },
    {
      question: 'Les avis sont-ils vraiment authentiques ?',
      answer:
        "Oui. Seuls les clients ayant fait une demande de devis via notre plateforme peuvent laisser un avis, après la fin du chantier. Nous utilisons un token HMAC signé lié à l'identifiant du devis pour empêcher la fabrication d'avis fictifs. Les avis suspects sont modérés et retirés.",
    },
    {
      question: 'Comment contacter un artisan RGE ?',
      answer:
        "Depuis chaque fiche, vous pouvez demander un devis gratuit en précisant votre besoin, votre ville et vos coordonnées. L'artisan RGE vous recontacte sous 24 à 48 h ouvrées. Pour les urgences, utilisez la ligne d'assistance téléphonique dédiée. Nous ne partageons jamais votre demande avec plusieurs artisans en parallèle : 1 demande = 1 artisan.",
    },
    {
      question: 'Un artisan peut-il modifier ou revendiquer sa fiche ?',
      answer:
        "Oui. Un artisan RGE avec un SIRET actif et une qualification RGE en cours de validité peut revendiquer sa fiche gratuitement : création de compte, vérification SIRET via provider_claims, modification des informations (description, photos, horaires, zones d'intervention). La revendication est validée par notre équipe admin sous 48 h.",
    },
  ])

  return (
    <>
      <JsonLd data={[breadcrumbSchema, faqSchema]} />
      <Breadcrumb items={breadcrumbItems} />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-charcoal-900 text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 25% 25%, rgba(251,191,36,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(232,107,75,0.2) 0%, transparent 50%)',
            }}
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-4 py-1.5 mb-6">
            <Users className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-300">
              {count > 0
                ? `${count.toLocaleString('fr-FR')} artisans RGE certifiés`
                : 'Annuaire des artisans RGE'}
            </span>
          </div>
          <h1
            data-speakable="true"
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight"
          >
            Artisans{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              RGE certifiés
            </span>{' '}
            près de chez vous
          </h1>
          <p className="text-lg md:text-xl text-charcoal-300 max-w-3xl mx-auto mb-8">
            {count > 0
              ? `Plus de ${Math.floor(count / 1000) * 1000} artisans RGE certifiés (Qualibat, Qualifelec, QualiPAC, Qualit'EnR) dans toute la France. Pompe à chaleur, isolation, photovoltaïque, plomberie et 20+ métiers RGE.`
              : "Tous les artisans RGE certifiés (Qualibat, Qualifelec, QualiPAC, Qualit'EnR) dans toute la France."}
          </p>

          {/* Quick search links */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {topServices.slice(0, 8).map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 rounded-full text-sm font-medium text-white transition-all duration-200"
              >
                {s.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      {count > 0 && (
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 text-center">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-charcoal-900">
                  {count.toLocaleString('fr-FR')}
                </div>
                <div className="text-sm text-charcoal-900 mt-1">Artisans RGE certifiés</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-charcoal-900">4</div>
                <div className="text-sm text-charcoal-900 mt-1">
                  Labels RGE (Qualibat, Qualifelec, QualiPAC, Qualit&apos;EnR)
                </div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-charcoal-900">101</div>
                <div className="text-sm text-charcoal-900 mt-1">Départements</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-charcoal-900">35 999</div>
                <div className="text-sm text-charcoal-900 mt-1">Communes couvertes</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Error state */}
      {error && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-800 font-medium">Erreur de chargement des artisans</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </section>
      )}

      {/* Providers listing */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-charcoal-900 mb-2">
          Artisans RGE récemment référencés
        </h2>
        <p className="text-charcoal-900 mb-8">
          {providers.length > 0
            ? `${providers.length} artisans RGE affichés sur ${count.toLocaleString('fr-FR')} au total`
            : 'Chargement en cours...'}
        </p>

        {providers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => {
              const providerUrl = getArtisanUrl({
                stable_id: provider.stable_id,
                slug: provider.slug,
                specialty: provider.specialty,
                city: provider.address_city,
              })
              const ratingValue = provider.rating_average?.toFixed(1)

              return (
                <div
                  key={provider.id}
                  className="group relative overflow-hidden rounded-2xl border border-sand-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-trancharcoal-y-1 hover:shadow-lg hover:border-amber-200 before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-gradient-to-r before:from-amber-400 before:via-amber-500 before:to-orange-500 before:opacity-0 hover:before:opacity-100 before:transition-opacity"
                >
                  {/* Name + verification */}
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`w-11 h-11 rounded-full bg-gradient-to-br ${getAvatarColor(provider.name)} flex items-center justify-center text-white text-lg font-bold shadow-sm flex-shrink-0`}
                    >
                      {provider.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={providerUrl}
                          className="text-lg font-bold text-charcoal-900 hover:text-primary-600 transition-colors truncate"
                        >
                          {provider.name}
                        </Link>
                        {provider.is_verified && (
                          <span
                            className="inline-flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: '#1877f2' }}
                            title="Artisan RGE certifié vérifié"
                          >
                            <svg
                              className="w-3 h-3 text-white"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                            </svg>
                          </span>
                        )}
                      </div>
                      {provider.specialty && (
                        <p className="text-sm text-charcoal-900 font-medium mt-0.5 capitalize">
                          {provider.specialty}
                        </p>
                      )}
                    </div>
                    {ratingValue && provider.review_count > 0 && (
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                          <span className="text-lg font-bold">{ratingValue}</span>
                        </div>
                        <span className="text-xs text-charcoal-500">
                          {provider.review_count} avis
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  {provider.address_city && (
                    <div className="flex items-center gap-2 text-sm text-charcoal-600 mb-1">
                      <MapPin className="w-4 h-4 text-charcoal-400 flex-shrink-0" />
                      <span>
                        {provider.address_street
                          ? provider.address_postal_code &&
                            provider.address_street.includes(provider.address_postal_code)
                            ? provider.address_street
                            : `${provider.address_street}, ${provider.address_postal_code ?? ''} ${provider.address_city ?? ''}`.trim()
                          : `${provider.address_postal_code ?? ''} ${provider.address_city ?? ''}`.trim()}
                      </span>
                    </div>
                  )}

                  {/* SIRET */}
                  {provider.siret && (
                    <p className="text-xs text-charcoal-400 mb-3 ml-6">
                      SIREN {provider.siret.slice(0, 9)}
                    </p>
                  )}

                  {/* Badges */}
                  {provider.address_region && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-600 font-medium">
                        {provider.address_region}
                      </span>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="flex gap-3">
                    <Link
                      href={`${providerUrl}#devis`}
                      className="flex-1 py-2.5 text-center bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold shadow-md shadow-amber-500/25 hover:from-amber-600 hover:to-amber-700 hover:shadow-lg transition-all duration-200 text-sm"
                    >
                      Demander un devis
                    </Link>
                    <a
                      href={PHONE_TEL}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 border-2 border-sand-300 text-charcoal-700 rounded-xl font-semibold hover:bg-sand-50 hover:border-sand-400 transition-all duration-200 text-sm"
                      aria-label="Appeler ServicesArtisans"
                    >
                      <Phone className="w-4 h-4" aria-hidden="true" />
                      Appeler
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        ) : !error ? (
          <div className="text-center py-16 bg-sand-50 rounded-2xl">
            <Search className="w-12 h-12 text-sand-500 mx-auto mb-4" />
            <p className="text-lg text-charcoal-600 font-medium">Aucun artisan trouvé</p>
            <p className="text-charcoal-400 mt-2">
              La base de données est peut-être temporairement indisponible.
            </p>
          </div>
        ) : null}
      </section>

      {/* Browse by service */}
      <section className="bg-sand-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-charcoal-900 mb-6">
            Rechercher un artisan RGE par métier
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {staticServicesList.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-sand-200 hover:border-amber-200 hover:shadow-md transition-all duration-200 group"
              >
                <Building2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span className="text-sm font-medium text-charcoal-700 group-hover:text-amber-700 truncate">
                  {s.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by city */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-charcoal-900 mb-6">Villes populaires</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              'paris',
              'marseille',
              'lyon',
              'toulouse',
              'nice',
              'nantes',
              'montpellier',
              'strasbourg',
              'bordeaux',
              'lille',
              'rennes',
              'reims',
            ].map((city) => (
              <Link
                key={city}
                href={`/villes/${city}`}
                className="px-4 py-3 bg-white rounded-xl border border-sand-200 hover:border-amber-200 hover:shadow-md transition-all duration-200 text-center"
              >
                <span className="text-sm font-medium text-charcoal-700 capitalize">{city}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <GeoPageCTA variant="sticky-only" />
    </>
  )
}
