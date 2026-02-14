import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Users, Building2, ArrowRight, Shield, Clock, ChevronRight, Wrench, HelpCircle } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getPlaceSchema, getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { SITE_URL } from '@/lib/seo/config'
import { villes, getVilleBySlug, services, getRegionSlugByName, getDepartementByCode } from '@/lib/data/france'
import { getCityImage, BLUR_PLACEHOLDER } from '@/lib/data/images'

// Pre-render top 200 cities, rest generated on-demand via ISR
const TOP_CITIES_COUNT = 200
export function generateStaticParams() {
  return villes.slice(0, TOP_CITIES_COUNT).map((ville) => ({ ville: ville.slug }))
}

export const dynamicParams = true
export const revalidate = 86400

interface PageProps {
  params: Promise<{ ville: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ville: villeSlug } = await params
  const ville = getVilleBySlug(villeSlug)
  if (!ville) return { title: 'Ville non trouvée' }

  const cityImage = getCityImage(villeSlug)
  const title = `Artisans à ${ville.name} (${ville.departementCode}) — Annuaire & Devis Gratuit | ServicesArtisans`
  const description = `Trouvez des artisans qualifiés à ${ville.name} (${ville.departementCode}). Plombiers, électriciens, serruriers, chauffagistes et plus. ${services.length} corps de métier, artisans référencés. Devis gratuit.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: [cityImage
        ? { url: cityImage.src, width: 1200, height: 630, alt: cityImage.alt }
        : { url: 'https://servicesartisans.fr/opengraph-image', width: 1200, height: 630, alt: `Artisans à ${ville.name}` }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [cityImage ? cityImage.src : 'https://servicesartisans.fr/opengraph-image'],
    },
    alternates: { canonical: `${SITE_URL}/villes/${villeSlug}` },
  }
}

export default async function VillePage({ params }: PageProps) {
  const { ville: villeSlug } = await params
  const ville = getVilleBySlug(villeSlug)
  if (!ville) notFound()

  // Get other villes in the same departement
  const nearbyVilles = villes.filter(
    (v) => v.departementCode === ville.departementCode && v.slug !== ville.slug
  )

  // Get other villes in the same region
  const regionVilles = villes.filter(
    (v) => v.region === ville.region && v.slug !== ville.slug
  ).slice(0, 8)

  const regionSlug = getRegionSlugByName(ville.region)
  const dept = getDepartementByCode(ville.departementCode)
  const deptSlug = dept?.slug

  // JSON-LD structured data
  const placeSchema = getPlaceSchema({
    name: ville.name,
    slug: ville.slug,
    region: ville.region,
    department: ville.departement,
    description: `Trouvez des artisans qualifiés à ${ville.name}. Plombiers, électriciens, serruriers et plus.`,
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Villes', url: '/villes' },
    { name: ville.name, url: `/villes/${ville.slug}` },
  ])

  const faqSchema = getFAQSchema([
    {
      question: `Comment trouver un artisan à ${ville.name} ?`,
      answer: `Sur ServicesArtisans, sélectionnez le type de service dont vous avez besoin (plombier, électricien, serrurier, etc.) puis choisissez ${ville.name} comme localisation. Vous accéderez à la liste des artisans référencés dans votre ville.`,
    },
    {
      question: `D'où proviennent les données des artisans à ${ville.name} ?`,
      answer: `Les artisans référencés sur notre plateforme sont répertoriés à partir des données SIREN officielles. Chaque professionnel listé dispose d'un numéro SIREN enregistré auprès des autorités compétentes.`,
    },
    {
      question: `Comment obtenir un devis gratuit à ${ville.name} ?`,
      answer: `Cliquez sur "Demander un devis gratuit", décrivez votre projet en quelques clics, et recevez jusqu'à 3 devis personnalisés d'artisans qualifiés à ${ville.name}. Le service est 100% gratuit et sans engagement.`,
    },
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={[placeSchema, breadcrumbSchema, faqSchema]} />

      {/* ─── PREMIUM DARK HERO ──────────────────────────────── */}
      <section className="relative bg-[#0a0f1e] text-white overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
            {getCityImage(villeSlug) && (
              <Image
                src={getCityImage(villeSlug)!.src}
                alt={getCityImage(villeSlug)!.alt}
                fill
                className="object-cover opacity-15"
                sizes="100vw"
                priority
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDER}
              />
            )}
            <div className="absolute inset-0 bg-[#0a0f1e]/80" />
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
                ...(regionSlug ? [{ label: ville.region, href: `/regions/${regionSlug}` }] : []),
                ...(deptSlug ? [{ label: `${ville.departement} (${ville.departementCode})`, href: `/departements/${deptSlug}` }] : []),
                { label: ville.name },
              ]}
              className="text-slate-400 [&_a]:text-slate-400 [&_a:hover]:text-white [&_svg]:text-slate-600"
            />
          </div>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/15 backdrop-blur-sm rounded-full border border-blue-400/25 mb-5">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-200">Ville</span>
            </div>

            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold mb-5 tracking-[-0.025em] leading-[1.1]">
              Artisans à{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300">
                {ville.name}
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl leading-relaxed mb-8">
              {ville.description}
            </p>

            {/* Location info */}
            <div className="flex flex-wrap gap-4 mb-8 text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>{ville.region}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>{ville.departement} ({ville.departementCode})</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Users className="w-4 h-4 text-blue-400" />
                <span>{ville.population} habitants</span>
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

      {/* ─── SERVICES GRID ──────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Wrench className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-slate-900 tracking-tight">
                Trouver un artisan à {ville.name}
              </h2>
              <p className="text-sm text-slate-500">{services.length} corps de métier disponibles</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}/${villeSlug}`}
                className="bg-white rounded-xl shadow-sm p-5 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group border border-gray-100"
              >
                <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors text-sm">{service.name}</h3>
                <p className="text-xs text-slate-400 mt-1.5">à {ville.name}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── QUARTIERS ────────────────────────────────────── */}
        {ville.quartiers && ville.quartiers.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="font-heading text-2xl font-bold text-slate-900 tracking-tight">
                  Quartiers desservis à {ville.name}
                </h2>
                <p className="text-sm text-slate-500">{ville.quartiers.length} quartiers couverts</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex flex-wrap gap-2.5">
                {ville.quartiers.map((quartier) => (
                  <span key={quartier} className="bg-gray-50 text-slate-700 px-4 py-2 rounded-full text-sm border border-gray-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors">
                    {quartier}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─── NEARBY VILLES ────────────────────────────────── */}
        {nearbyVilles.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-violet-600" />
              </div>
              <h2 className="font-heading text-xl font-bold text-slate-900 tracking-tight">
                Autres villes du {ville.departement}
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {nearbyVilles.map((v) => (
                <Link key={v.slug} href={`/villes/${v.slug}`} className="flex items-center gap-2.5 bg-white rounded-xl border border-gray-200 p-3.5 hover:border-blue-300 hover:shadow-md transition-all group">
                  <MapPin className="w-4 h-4 text-slate-400 group-hover:text-blue-600 flex-shrink-0 transition-colors" />
                  <div className="min-w-0">
                    <span className="block text-sm font-medium text-slate-800 group-hover:text-blue-600 truncate transition-colors">{v.name}</span>
                    <span className="text-xs text-slate-400">{v.population} hab.</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─── FAQ SECTION ──────────────────────────────────── */}
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
              <h3 className="font-semibold text-slate-900 mb-2">Comment trouver un artisan à {ville.name} ?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Sur ServicesArtisans, sélectionnez le type de service dont vous avez besoin (plombier, électricien, serrurier, etc.)
                puis choisissez {ville.name} comme localisation. Vous accéderez à la liste des artisans référencés dans votre ville.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-2">D&apos;où proviennent les données des artisans à {ville.name} ?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Les artisans référencés sur notre plateforme sont répertoriés à partir des données SIREN officielles.
                Chaque professionnel listé dispose d&apos;un numéro SIREN enregistré auprès des autorités compétentes.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-2">Comment obtenir un devis gratuit à {ville.name} ?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Cliquez sur &laquo; Demander un devis gratuit &raquo;, décrivez votre projet en quelques clics,
                et recevez jusqu&apos;à 3 devis personnalisés d&apos;artisans qualifiés à {ville.name}. Le service est 100% gratuit et sans engagement.
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
            Besoin d&apos;un artisan à {ville.name} ?
          </h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            Décrivez votre projet et recevez des devis gratuits d&apos;artisans qualifiés.
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
            {/* Services in this city */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Services à {ville.name}</h3>
              <div className="space-y-2">
                {services.slice(0, 6).map((s) => (
                  <Link key={s.slug} href={`/services/${s.slug}/${villeSlug}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 py-2 transition-colors">
                    <ChevronRight className="w-3 h-3" />
                    {s.name} à {ville.name}
                  </Link>
                ))}
              </div>
              <Link href="/services" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium mt-3">
                Tous les services <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Region cities */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Villes en {ville.region}</h3>
              <div className="space-y-2">
                {regionVilles.slice(0, 6).map((v) => (
                  <Link key={v.slug} href={`/villes/${v.slug}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 py-2 transition-colors">
                    <ChevronRight className="w-3 h-3" />
                    Artisans à {v.name}
                  </Link>
                ))}
              </div>
              <Link href="/villes" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium mt-3">
                Toutes les villes <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Geographic navigation */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Navigation</h3>
              <div className="space-y-2">
                {regionSlug && (
                  <Link href={`/regions/${regionSlug}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 py-2 transition-colors">
                    <ChevronRight className="w-3 h-3" />
                    Région {ville.region}
                  </Link>
                )}
                <Link href="/departements" className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 py-2 transition-colors">
                  <ChevronRight className="w-3 h-3" />
                  Tous les départements
                </Link>
                <Link href="/regions" className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 py-2 transition-colors">
                  <ChevronRight className="w-3 h-3" />
                  Toutes les régions
                </Link>
                <Link href="/villes" className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 py-2 transition-colors">
                  <ChevronRight className="w-3 h-3" />
                  Toutes les villes
                </Link>
                <Link href="/devis" className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 py-2 transition-colors">
                  <ChevronRight className="w-3 h-3" />
                  Demander un devis
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
