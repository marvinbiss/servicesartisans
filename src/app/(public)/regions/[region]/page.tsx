import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Users, ArrowRight, Shield, Star, Clock, Building2, ChevronRight, Wrench, HelpCircle, Globe } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema, getCollectionPageSchema } from '@/lib/seo/jsonld'
import { SITE_URL } from '@/lib/seo/config'
import { regions, getRegionBySlug, services as allServices } from '@/lib/data/france'

export function generateStaticParams() {
  return regions.map((region) => ({ region: region.slug }))
}

export const dynamicParams = false
export const revalidate = 86400

interface PageProps {
  params: Promise<{ region: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { region: regionSlug } = await params
  const region = getRegionBySlug(regionSlug)
  if (!region) return { title: 'Région non trouvée' }

  const deptCount = region.departments.length
  const cityCount = region.departments.reduce((acc, d) => acc + d.cities.length, 0)

  return {
    title: `Artisans en ${region.name} — Annuaire & Devis Gratuit | ServicesArtisans`,
    description: `Trouvez un artisan qualifié en ${region.name}. ${deptCount} départements, ${cityCount} villes couvertes. Plombiers, électriciens, serruriers et plus. Devis gratuits, artisans vérifiés par SIREN.`,
    alternates: { canonical: `${SITE_URL}/regions/${regionSlug}` },
  }
}

export default async function RegionPage({ params }: PageProps) {
  const { region: regionSlug } = await params
  const region = getRegionBySlug(regionSlug)
  if (!region) notFound()

  const deptCount = region.departments.length
  const cityCount = region.departments.reduce((acc, d) => acc + d.cities.length, 0)
  const allCities = region.departments.flatMap(dept => dept.cities)

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

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={[breadcrumbSchema, collectionSchema]} />

      {/* ─── PREMIUM DARK HERO ──────────────────────────────── */}
      <section className="relative bg-[#0a0f1e] text-white overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37,99,235,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(37,99,235,0.1) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(59,130,246,0.06) 0%, transparent 50%)',
          }} />
          <div className="absolute inset-0 opacity-[0.025]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }} />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-28 md:pt-14 md:pb-36">
          {/* Breadcrumb */}
          <div className="mb-10">
            <Breadcrumb
              items={[
                { label: 'Régions', href: '/regions' },
                { label: region.name },
              ]}
              className="text-slate-400 [&_a]:text-slate-400 [&_a:hover]:text-white [&_svg]:text-slate-600"
            />
          </div>

          <div className="max-w-3xl">
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold mb-5 tracking-[-0.025em] leading-[1.1]">
              Artisans en{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300">
                {region.name}
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl leading-relaxed mb-8">
              {region.description}
            </p>

            {/* Stats badges */}
            <div className="flex flex-wrap gap-4 mb-8 text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>{deptCount} département{deptCount > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>{cityCount} ville{cityCount > 1 ? 's' : ''} couvertes</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Users className="w-4 h-4 text-blue-400" />
                <span>{allServices.length} corps de métier</span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10">
                <Shield className="w-4 h-4 text-amber-400" /><span className="text-sm font-medium">Artisans vérifiés SIREN</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10">
                <Star className="w-4 h-4 text-amber-400" /><span className="text-sm font-medium">Avis authentiques</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10">
                <Clock className="w-4 h-4 text-amber-400" /><span className="text-sm font-medium">Devis sous 24h</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── QUICK SERVICES BAR ─────────────────────────────── */}
      <section className="py-6 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-500 font-medium">Recherche rapide :</span>
            {allServices.slice(0, 6).map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="px-4 py-2 bg-gray-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-full text-sm font-medium transition-colors border border-gray-200 hover:border-blue-200"
              >
                {service.name} en {region.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* ─── DEPARTMENTS ──────────────────────────────────── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-slate-900 tracking-tight">
                Départements de la région {region.name}
              </h2>
              <p className="text-sm text-slate-500">{deptCount} département{deptCount > 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {region.departments.map((dept) => (
              <Link
                key={dept.code}
                href={`/departements/${dept.slug}`}
                className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
                      <span className="text-blue-600 font-bold text-sm">{dept.code}</span>
                    </div>
                    <div>
                      <h3 className="font-heading text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{dept.name}</h3>
                      <span className="text-xs text-slate-400">{dept.cities.length} ville{dept.cities.length > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {dept.cities.slice(0, 4).map((city) => (
                    <span key={city.slug} className="text-xs bg-gray-50 text-slate-500 px-2.5 py-1 rounded-full group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      {city.name}
                    </span>
                  ))}
                  {dept.cities.length > 4 && (
                    <span className="text-xs text-slate-400 px-2 py-1">+{dept.cities.length - 4}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── SERVICES BY CITY ─────────────────────────────── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Wrench className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-slate-900 tracking-tight">
                Services par ville en {region.name}
              </h2>
              <p className="text-sm text-slate-500">Accès rapide aux artisans par ville</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allCities.slice(0, 6).map((city) => (
              <div key={city.slug} className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-heading font-semibold text-slate-900 mb-4">Artisans à {city.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {allServices.slice(0, 6).map((service) => (
                    <Link
                      key={`${service.slug}-${city.slug}`}
                      href={`/services/${service.slug}/${city.slug}`}
                      className="text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
                <Link href={`/villes/${city.slug}`} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium mt-4">
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
            <h2 className="font-heading text-xl font-bold text-slate-900 tracking-tight">
              Autres régions
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {otherRegions.slice(0, 12).map((r) => (
              <Link key={r.slug} href={`/regions/${r.slug}`} className="bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-200 text-slate-700 hover:text-blue-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
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
            <h2 className="font-heading text-2xl font-bold text-slate-900 tracking-tight">
              Questions fréquentes
            </h2>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-2">Comment trouver un artisan en {region.name} ?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Parcourez les {deptCount} départements de la région {region.name} ou sélectionnez directement
                votre ville. Choisissez le type de service dont vous avez besoin et accédez aux artisans vérifiés disponibles.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-2">Les artisans en {region.name} sont-ils vérifiés ?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Oui, tous les artisans référencés sur ServicesArtisans sont vérifiés via le registre SIREN.
                Nous vérifions l&apos;immatriculation et les assurances de chaque professionnel.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-2">Combien coûte un devis en {region.name} ?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Les devis sont 100% gratuits et sans engagement. Décrivez votre projet et recevez jusqu&apos;à 3 devis
                personnalisés d&apos;artisans qualifiés de votre région.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ─── CTA ────────────────────────────────────────────── */}
      <section className="relative bg-[#0a0f1e] overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(37,99,235,0.12) 0%, transparent 60%)',
        }} />
        <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-20 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">
            Besoin d&apos;un artisan en {region.name} ?
          </h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            Recevez jusqu&apos;à 3 devis gratuits de professionnels qualifiés.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/devis" className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35 hover:-translate-y-0.5 transition-all duration-300">
              Demander un devis gratuit
            </Link>
            <Link href="/services" className="inline-flex items-center gap-2 text-slate-300 hover:text-white font-medium transition-colors">
              Voir les services <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SEO INTERNAL LINKS ─────────────────────────────── */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-xl font-bold text-slate-900 mb-8 tracking-tight">
            Voir aussi
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {/* Services */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Services populaires</h3>
              <div className="space-y-2">
                {allServices.slice(0, 8).map((s) => (
                  <Link key={s.slug} href={`/services/${s.slug}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 py-1 transition-colors">
                    <ChevronRight className="w-3 h-3" />
                    {s.name}
                  </Link>
                ))}
              </div>
              <Link href="/services" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium mt-3">
                Tous les services <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Other regions */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Autres régions</h3>
              <div className="space-y-2">
                {otherRegions.slice(0, 6).map((r) => (
                  <Link key={r.slug} href={`/regions/${r.slug}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 py-1 transition-colors">
                    <ChevronRight className="w-3 h-3" />
                    Artisans en {r.name}
                  </Link>
                ))}
              </div>
              <Link href="/regions" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium mt-3">
                Toutes les régions <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Cities in this region */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Villes en {region.name}</h3>
              <div className="space-y-2">
                {allCities.slice(0, 6).map((city) => (
                  <Link key={city.slug} href={`/villes/${city.slug}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 py-1 transition-colors">
                    <ChevronRight className="w-3 h-3" />
                    Artisans à {city.name}
                  </Link>
                ))}
              </div>
              <Link href="/villes" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium mt-3">
                Toutes les villes <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
