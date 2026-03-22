import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Users, ArrowRight, Shield, Clock, Building2, ChevronRight, Wrench, HelpCircle, Globe } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema, getCollectionPageSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { SITE_URL } from '@/lib/seo/config'
import { regions, getRegionBySlug, services as allServices, getVillesByDepartement } from '@/lib/data/france'
import { getProviderCountByRegion, formatProviderCount } from '@/lib/data/stats'
import { getRegionImage } from '@/lib/data/images'
import { generateRegionContent, hashCode } from '@/lib/seo/location-content'
import { Thermometer, TrendingUp, AlertTriangle, Mountain } from 'lucide-react'
import problems from '@/lib/data/problems'

export function generateStaticParams() {
  return regions.map((region) => ({ region: region.slug }))
}

export const dynamicParams = false
export const revalidate = 86400

interface PageProps {
  params: Promise<{ region: string }>
}

function truncateTitle(title: string, maxLen = 42): string {
  if (title.length <= maxLen) return title
  return title.slice(0, maxLen - 1).replace(/\s+\S*$/, '') + '…'
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { region: regionSlug } = await params
  const region = getRegionBySlug(regionSlug)
  if (!region) return { title: 'Région non trouvée' }

  const metaContent = generateRegionContent(region)
  const deptCount = region.departments.length
  const cityCount = region.departments.reduce((acc, d) => acc + getVillesByDepartement(d.code).length, 0)
  const artisanCount = await getProviderCountByRegion(region.name)

  const titleHash = Math.abs(hashCode(`title-region-${region.slug}`))
  const titleTemplates = [
    `Artisans ${region.name} — Devis Gratuit`,
    `Artisan ${region.name} : annuaire vérifiés`,
    `${region.name} : artisans qualifiés — Devis`,
    `Artisans en ${region.name} — Comparez`,
    `${region.name} — Annuaire artisans vérifiés`,
  ]
  const title = truncateTitle(titleTemplates[titleHash % titleTemplates.length])

  const descHash = Math.abs(hashCode(`desc-region-${region.slug}`))
  const artisanStr = artisanCount > 0 ? `${formatProviderCount(artisanCount)} artisans, ` : ''
  const descTemplates = [
    `Trouvez un artisan en ${region.name}. ${artisanStr}${deptCount} départements, ${cityCount} villes. Devis gratuits.`,
    `${region.name} : ${artisanStr}annuaire d'artisans référencés SIREN. ${metaContent.profile.geoLabel}, ${metaContent.profile.climateLabel.toLowerCase()}. Comparez les devis.`,
    `Artisans en ${region.name} : ${cityCount} villes couvertes, ${allServices.length} corps de métier. ${artisanStr}${metaContent.profile.economyLabel}. Devis gratuit.`,
    `Tous les artisans de ${region.name}. ${artisanStr}${deptCount} départements, ${metaContent.profile.geoLabel.toLowerCase()}. Comparez gratuitement.`,
    `${region.name} — ${deptCount} dép., ${cityCount} villes${artisanCount > 0 ? `, ${formatProviderCount(artisanCount)} artisans` : ''}. ${metaContent.profile.climateLabel}. Devis gratuits en ligne.`,
  ]
  const description = descTemplates[descHash % descTemplates.length]

  const regionImage = getRegionImage(regionSlug)

  return {
    title,
    description,
    // Hub pages are always indexed — rich geographic content has value even with 0 providers
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_URL}/regions/${regionSlug}` },
    openGraph: {
      locale: 'fr_FR',
      title,
      description,
      type: 'website',
      url: `${SITE_URL}/regions/${regionSlug}`,
      images: [{ url: regionImage.src, width: 1200, height: 630, alt: `Artisans en ${region.name}` }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: [regionImage.src],
    },
  }
}

export default async function RegionPage({ params }: PageProps) {
  const { region: regionSlug } = await params
  const region = getRegionBySlug(regionSlug)
  if (!region) notFound()

  const deptCount = region.departments.length
  const deptCitiesMap = Object.fromEntries(
    region.departments.map(dept => [dept.code, getVillesByDepartement(dept.code)])
  )
  const allCities = region.departments.flatMap(dept => deptCitiesMap[dept.code])
  const cityCount = allCities.length
  const content = generateRegionContent(region, cityCount)
  const regionArtisanCount = await getProviderCountByRegion(region.name)

  // Reorder services by climate-based priority
  const topServiceSlugsSet = new Set(content.profile.topServiceSlugs.slice(0, 5))
  const orderedServices = [...allServices].sort((a, b) => {
    const ai = content.profile.topServiceSlugs.indexOf(a.slug)
    const bi = content.profile.topServiceSlugs.indexOf(b.slug)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })

  // Other regions
  const otherRegions = regions.filter(r => r.slug !== regionSlug)

  // JSON-LD structured data
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Régions', url: '/regions' },
    { name: region.name, url: `/regions/${regionSlug}` },
  ])
  const collectionSchema = getCollectionPageSchema({
    name: `Artisans en ${region.name}`,
    description: `Trouvez un artisan qualifié en ${region.name}. ${deptCount} départements, ${cityCount} villes couvertes.`,
    url: `/regions/${regionSlug}`,
    itemCount: cityCount,
  })

  const faqSchema = getFAQSchema(content.faqItems)

  return (
    <div className="min-h-screen bg-sand-50">
      <JsonLd data={[breadcrumbSchema, collectionSchema, faqSchema]} />

      {/* ─── PREMIUM DARK HERO ──────────────────────────────── */}
      <section className="relative bg-charcoal-950 text-white overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(61,139,104,0.20) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(232,107,75,0.10) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(61,139,104,0.06) 0%, transparent 50%)',
          }} />
          <div className="absolute inset-0 opacity-[0.025]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }} />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-sand-50 to-transparent" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-28 md:pt-14 md:pb-36">
          {/* Breadcrumb */}
          <div className="mb-10">
            <Breadcrumb
              items={[
                { label: 'Régions', href: '/regions' },
                { label: region.name },
              ]}
              className="text-charcoal-400 [[&_a]:text-charcoal-400_a]:text-charcoal-400 [[&_a:hover]:text-white_a:hover]:text-primary-400 [[&_svg]:text-charcoal-600_svg]:text-charcoal-600"
            />
          </div>

          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-3 mb-5">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-sand-1000/15 backdrop-blur-sm rounded-full border border-charcoal-400/25">
                <Globe className="w-4 h-4 text-charcoal-300" />
                <span className="text-sm font-medium text-charcoal-200">Région</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/15 backdrop-blur-sm rounded-full border border-cyan-400/25">
                <Thermometer className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-200">{content.profile.climateLabel}</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/15 backdrop-blur-sm rounded-full border border-accent-400/25">
                <Mountain className="w-4 h-4 text-accent-400" />
                <span className="text-sm font-medium text-accent-200">{content.profile.geoLabel}</span>
              </div>
            </div>

            {(() => {
              const h1Hash = Math.abs(hashCode(`h1-region-${region.slug}`))
              const h1Templates = [
                `Artisans en ${region.name}`,
                `Trouver un artisan en ${region.name}`,
                `${region.name} : artisans par département`,
                `Artisans qualifiés en ${region.name}`,
                `Tous les artisans de ${region.name}`,
              ]
              return (
                <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold mb-5 tracking-[-0.025em] leading-[1.1]">
                  {h1Templates[h1Hash % h1Templates.length]}
                </h1>
              )
            })()}
            <p className="text-lg text-charcoal-400 max-w-2xl leading-relaxed mb-8">
              {content.profile.climateLabel}, {content.profile.geoLabel.toLowerCase()}, {content.profile.economyLabel.toLowerCase()}. {allServices.length} corps de métier disponibles.
            </p>

            {/* Stats badges */}
            <div className="flex flex-wrap gap-4 mb-8 text-sm">
              {regionArtisanCount > 0 && (
                <div className="flex items-center gap-2 text-charcoal-300">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>{formatProviderCount(regionArtisanCount)} artisan{regionArtisanCount > 1 ? 's' : ''}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-charcoal-300">
                <Building2 className="w-4 h-4 text-charcoal-400" />
                <span>{deptCount} département{deptCount > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2 text-charcoal-300">
                <MapPin className="w-4 h-4 text-charcoal-400" />
                <span>{cityCount} ville{cityCount > 1 ? 's' : ''} couvertes</span>
              </div>
              <div className="flex items-center gap-2 text-charcoal-300">
                <Users className="w-4 h-4 text-charcoal-400" />
                <span>{allServices.length} corps de métier</span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10">
                <Shield className="w-4 h-4 text-amber-400" /><span className="text-sm font-medium">Données SIREN officielles</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10">
                <Clock className="w-4 h-4 text-amber-400" /><span className="text-sm font-medium">Devis gratuits</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── QUICK SERVICES BAR ─────────────────────────────── */}
      <section className="py-6 bg-white border-b border-sand-200 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-charcoal-500 font-medium">Services prioritaires :</span>
            {orderedServices.map((service) => (
              <Link
                key={service.slug}
                href={`/regions/${regionSlug}/${service.slug}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${topServiceSlugsSet.has(service.slug) ? 'bg-accent-50 text-accent-700 border-accent-200 hover:bg-accent-100' : 'bg-sand-50 text-charcoal-700 border-sand-300 hover:bg-sand-100'}`}
              >
                {service.name} en {region.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* ─── PROFIL RÉGIONAL ──────────────────────────────── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
              <Thermometer className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-semibold text-charcoal-900 tracking-tight">
                Profil de la région {region.name}
              </h2>
              <p className="text-sm text-charcoal-500">{content.profile.climateLabel} · {content.profile.geoLabel}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-sand-300 p-8">
            <p className="text-charcoal-700 leading-relaxed mb-6">{content.intro}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-cyan-50 rounded-xl p-4">
                <div className="text-xs font-semibold text-cyan-700 uppercase tracking-wider mb-1">Climat</div>
                <div className="text-sm text-charcoal-800 font-medium">{content.profile.climateLabel}</div>
              </div>
              <div className="bg-accent-50 rounded-xl p-4">
                <div className="text-xs font-semibold text-accent-700 uppercase tracking-wider mb-1">Géographie</div>
                <div className="text-sm text-charcoal-800 font-medium">{content.profile.geoLabel}</div>
              </div>
              <div className="bg-violet-50 rounded-xl p-4">
                <div className="text-xs font-semibold text-violet-700 uppercase tracking-wider mb-1">Économie</div>
                <div className="text-sm text-charcoal-800 font-medium">{content.profile.economyLabel}</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-4">
                <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">Couverture</div>
                <div className="text-sm text-charcoal-800 font-medium">
                  {regionArtisanCount > 0 ? `${formatProviderCount(regionArtisanCount)} artisans · ` : ''}{deptCount} dép. · {cityCount} villes
                </div>
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Caractéristiques du territoire
              </h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {content.profile.keyFacts.map((fact, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-charcoal-600">
                    <span className="text-amber-500 mt-0.5">•</span>
                    {fact}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-charcoal-700 leading-relaxed">{content.contexteRegional}</p>
          </div>
        </section>

        {/* ─── CONTENU SEO ────────────────────────────────────── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-400" />
            </div>
            <h2 className="font-heading text-2xl font-semibold text-charcoal-900 tracking-tight">
              Artisanat en {region.name}
            </h2>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-sand-300 p-8">
              <h3 className="font-heading text-lg font-bold text-charcoal-900 mb-4">Services prioritaires</h3>
              <p className="text-charcoal-700 leading-relaxed">{content.servicesPrioritaires}</p>
            </div>
            <div className="bg-white rounded-2xl border border-sand-300 p-8">
              <h3 className="font-heading text-lg font-bold text-charcoal-900 mb-4">Conseils pour vos travaux</h3>
              <p className="text-charcoal-700 leading-relaxed">{content.conseilsRegion}</p>
            </div>
          </div>
        </section>

        {/* ─── DEPARTMENTS ──────────────────────────────────── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-sand-200 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-charcoal-600" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-semibold text-charcoal-900 tracking-tight">
                Départements de la région {region.name}
              </h2>
              <p className="text-sm text-charcoal-500">{deptCount} département{deptCount > 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {region.departments.map((dept) => (
              <Link
                key={dept.code}
                href={`/departements/${dept.slug}`}
                className="bg-white rounded-2xl border border-sand-300 p-6 hover:shadow-card-hover hover:border-charcoal-400 hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center group-hover:from-slate-100 group-hover:to-slate-200 transition-colors">
                      <span className="text-charcoal-700 font-bold text-sm">{dept.code}</span>
                    </div>
                    <div>
                      <h3 className="font-heading text-base font-bold text-charcoal-900 group-hover:text-primary-400 transition-colors">{dept.name}</h3>
                      <span className="text-xs text-charcoal-400">{deptCitiesMap[dept.code].length} ville{deptCitiesMap[dept.code].length > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-charcoal-300 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {deptCitiesMap[dept.code].slice(0, 4).map((city) => (
                    <span key={city.slug} className="text-xs bg-sand-50 text-charcoal-500 px-2.5 py-1 rounded-full group-hover:bg-sand-100 group-hover:text-primary-400 transition-colors">
                      {city.name}
                    </span>
                  ))}
                  {deptCitiesMap[dept.code].length > 4 && (
                    <span className="text-xs text-charcoal-400 px-2 py-1">+{deptCitiesMap[dept.code].length - 4}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── SERVICES BY CITY ─────────────────────────────── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
              <Wrench className="w-5 h-5 text-accent-600" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-semibold text-charcoal-900 tracking-tight">
                Services par ville en {region.name}
              </h2>
              <p className="text-sm text-charcoal-500">Accès rapide aux artisans par ville</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allCities.slice(0, 12).map((city) => (
              <div key={city.slug} className="bg-white rounded-2xl border border-sand-300 p-6">
                <h3 className="font-heading font-semibold text-charcoal-900 mb-4">Artisans à {city.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {allServices.map((service) => (
                    <Link
                      key={`${service.slug}-${city.slug}`}
                      href={`/services/${service.slug}/${city.slug}`}
                      className="text-sm text-charcoal-600 hover:text-primary-400 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-primary-100"
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
                <Link href={`/villes/${city.slug}`} className="inline-flex items-center gap-1 text-primary-400 hover:text-primary-500 text-sm font-medium mt-4">
                  Tous les artisans <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ─── OTHER REGIONS ────────────────────────────────── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-violet-600" />
            </div>
            <h2 className="font-heading text-xl font-semibold text-charcoal-900 tracking-tight">
              Autres régions
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {otherRegions.slice(0, 12).map((r) => (
              <Link key={r.slug} href={`/regions/${r.slug}`} className="bg-white border border-sand-300 hover:bg-sand-50 hover:border-sand-400 text-charcoal-700 hover:text-charcoal-900 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
                {r.name}
              </Link>
            ))}
          </div>
        </section>

        {/* ─── FAQ ───────────────────────────────────────────── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="font-heading text-2xl font-semibold text-charcoal-900 tracking-tight">
              Questions fréquentes
            </h2>
          </div>
          <div className="space-y-4">
            {content.faqItems.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-sand-300 p-6">
                <h3 className="font-semibold text-charcoal-900 mb-2">{faq.question}</h3>
                <p className="text-sm text-charcoal-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ─── CTA ────────────────────────────────────────────── */}
      <section className="relative bg-charcoal-950 overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(232,107,75,0.12) 0%, transparent 60%)',
        }} />
        <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-20 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">
            Besoin d&apos;un artisan en {region.name} ?
          </h2>
          <p className="text-charcoal-400 mb-8 max-w-lg mx-auto">
            Recevez jusqu&apos;à 3 devis gratuits de professionnels qualifiés.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/devis" className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-400 via-primary-400 to-primary-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-cta hover:shadow-cta hover:-translate-y-0.5 transition-all duration-300">
              Demander un devis gratuit
            </Link>
            <Link href="/services" className="inline-flex items-center gap-2 text-charcoal-300 hover:text-white font-medium transition-colors">
              Voir les services <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SEO INTERNAL LINKS ─────────────────────────────── */}
      <section className="py-16 bg-white border-t border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-8 tracking-tight">
            Voir aussi
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {/* Services */}
            <div>
              <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-4">Services en {region.name}</h3>
              <div className="space-y-2">
                {allServices.slice(0, 8).map((s) => (
                  <Link key={s.slug} href={`/regions/${regionSlug}/${s.slug}`} className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-400 py-2 transition-colors">
                    <ChevronRight className="w-3 h-3" />
                    {s.name} en {region.name}
                  </Link>
                ))}
              </div>
              <Link href="/services" className="inline-flex items-center gap-1 text-primary-400 hover:text-primary-500 text-sm font-medium mt-3">
                Tous les services <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Other regions */}
            <div>
              <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-4">Autres régions</h3>
              <div className="space-y-2">
                {otherRegions.slice(0, 6).map((r) => (
                  <Link key={r.slug} href={`/regions/${r.slug}`} className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-400 py-2 transition-colors">
                    <ChevronRight className="w-3 h-3" />
                    Artisans en {r.name}
                  </Link>
                ))}
              </div>
              <Link href="/regions" className="inline-flex items-center gap-1 text-primary-400 hover:text-primary-500 text-sm font-medium mt-3">
                Toutes les régions <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Cities in this region */}
            <div>
              <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-4">Villes en {region.name}</h3>
              <div className="space-y-2">
                {allCities.slice(0, 6).map((city) => (
                  <Link key={city.slug} href={`/villes/${city.slug}`} className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-400 py-2 transition-colors">
                    <ChevronRight className="w-3 h-3" />
                    Artisans à {city.name}
                  </Link>
                ))}
              </div>
              <Link href="/villes" className="inline-flex items-center gap-1 text-primary-400 hover:text-primary-500 text-sm font-medium mt-3">
                Toutes les villes <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Intent variant links — devis, avis, tarifs */}
          <div className="mt-10 grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-4">Devis en {region.name}</h3>
              <div className="space-y-1.5">
                {allCities.slice(0, 6).flatMap((city) =>
                  allServices.slice(0, 5).map((s) => (
                    <Link key={`devis-${s.slug}-${city.slug}`} href={`/devis/${s.slug}/${city.slug}`} className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-400 py-1 transition-colors">
                      <ChevronRight className="w-3 h-3" />
                      Devis {s.name.toLowerCase()} à {city.name}
                    </Link>
                  ))
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-4">Avis en {region.name}</h3>
              <div className="space-y-1.5">
                {allCities.slice(0, 6).flatMap((city) =>
                  allServices.slice(0, 5).map((s) => (
                    <Link key={`avis-${s.slug}-${city.slug}`} href={`/avis/${s.slug}/${city.slug}`} className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-400 py-1 transition-colors">
                      <ChevronRight className="w-3 h-3" />
                      Avis {s.name.toLowerCase()} à {city.name}
                    </Link>
                  ))
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-4">Tarifs en {region.name}</h3>
              <div className="space-y-1.5">
                {allCities.slice(0, 6).flatMap((city) =>
                  allServices.slice(0, 5).map((s) => (
                    <Link key={`tarifs-${s.slug}-${city.slug}`} href={`/tarifs/${s.slug}/${city.slug}`} className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-400 py-1 transition-colors">
                      <ChevronRight className="w-3 h-3" />
                      Tarifs {s.name.toLowerCase()} à {city.name}
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wider mb-4">Urgences en {region.name}</h3>
            <div className="flex flex-wrap gap-2">
              {allCities.slice(0, 6).flatMap((city) =>
                allServices.slice(0, 5).map((s) => (
                  <Link key={`urgence-${s.slug}-${city.slug}`} href={`/urgence/${s.slug}/${city.slug}`} className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 px-3 py-1.5 rounded-lg text-sm transition-colors border border-red-100 hover:border-red-200">
                    Urgence {s.name.toLowerCase()} à {city.name}
                  </Link>
                ))
              )}
            </div>
          </div>
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-orange-700 uppercase tracking-wider mb-4">Problèmes courants en {region.name}</h3>
            <div className="flex flex-wrap gap-2">
              {allCities.slice(0, 4).flatMap((city) =>
                problems.slice(0, 6).map((p) => (
                  <Link key={`prob-${p.slug}-${city.slug}`} href={`/problemes/${p.slug}/${city.slug}`} className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:text-orange-800 px-3 py-1.5 rounded-lg text-sm transition-colors border border-orange-100 hover:border-orange-200">
                    {p.name} à {city.name}
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

        {/* ─── EDITORIAL CREDIBILITY ──────────────────────────── */}
        <section className="mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-sand-100 rounded-2xl border border-sand-300 p-6">
              <h3 className="text-sm font-semibold text-charcoal-700 mb-2">Méthodologie éditoriale</h3>
              <p className="text-xs text-charcoal-500 leading-relaxed">
                Les profils géographiques et économiques sont des estimations régionales. Les données proviennent de sources publiques (INSEE, base SIRENE). ServicesArtisans est un annuaire indépendant — nous ne réalisons pas de travaux et ne garantissons pas les prestations.
              </p>
            </div>
          </div>
        </section>

      {/* Confiance & Sécurité */}
      <section className="py-8 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-bold text-charcoal-900 mb-4">Confiance & Sécurité</h2>
          <div className="flex flex-wrap gap-4">
            <Link href="/notre-processus-de-verification" className="text-sm text-primary-400 hover:text-primary-600 flex items-center gap-1.5">
              Processus de vérification
            </Link>
            <Link href="/politique-avis" className="text-sm text-primary-400 hover:text-primary-600 flex items-center gap-1.5">
              Politique d&apos;avis
            </Link>
            <Link href="/mediation" className="text-sm text-primary-400 hover:text-primary-600 flex items-center gap-1.5">
              Médiation
            </Link>
            <Link href="/cgv" className="text-sm text-primary-400 hover:text-primary-600 flex items-center gap-1.5">
              CGV
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
