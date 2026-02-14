import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Building2, Users, ArrowRight, Shield, Clock, ChevronRight, Wrench, HelpCircle, Map } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { SITE_URL } from '@/lib/seo/config'
import { getBreadcrumbSchema, getCollectionPageSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { departements, getDepartementBySlug, getVillesByDepartement, services, getRegionSlugByName } from '@/lib/data/france'
import { slugify } from '@/lib/utils'

export function generateStaticParams() {
  return departements.map((dept) => ({ departement: dept.slug }))
}

export const dynamicParams = false
export const revalidate = 86400

interface PageProps {
  params: Promise<{ departement: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { departement: deptSlug } = await params
  const dept = getDepartementBySlug(deptSlug)
  if (!dept) return { title: 'Département non trouvé' }

  const title = `Artisans en ${dept.name} (${dept.code}) — Annuaire & Devis Gratuit | ServicesArtisans`
  const description = `Trouvez des artisans qualifiés dans le ${dept.name} (${dept.code}). ${dept.description} ${services.length} corps de métier, artisans référencés. Devis gratuit.`

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/departements/${deptSlug}` },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${SITE_URL}/departements/${deptSlug}`,
      images: [{ url: 'https://servicesartisans.fr/opengraph-image', width: 1200, height: 630, alt: `Artisans en ${dept.name}` }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: ['https://servicesartisans.fr/opengraph-image'],
    },
  }
}

export default async function DepartementPage({ params }: PageProps) {
  const { departement: deptSlug } = await params
  const dept = getDepartementBySlug(deptSlug)
  if (!dept) notFound()

  const villesDuDepartement = getVillesByDepartement(dept.code)

  // Other departments in the same region
  const siblingDepts = departements.filter(
    (d) => d.region === dept.region && d.slug !== dept.slug
  )

  const regionSlug = getRegionSlugByName(dept.region)

  // JSON-LD structured data
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Départements', url: '/departements' },
    { name: `${dept.name} (${dept.code})`, url: `/departements/${dept.slug}` },
  ])

  const collectionPageSchema = getCollectionPageSchema({
    name: `Artisans en ${dept.name} (${dept.code})`,
    description: `Trouvez des artisans qualifiés dans le ${dept.name} (${dept.code}). ${services.length} corps de métier, artisans référencés.`,
    url: `/departements/${dept.slug}`,
    itemCount: services.length,
  })

  const faqSchema = getFAQSchema([
    {
      question: `Combien d'artisans sont disponibles dans le ${dept.name} ?`,
      answer: `Le ${dept.name} (${dept.code}) fait partie de notre couverture nationale de 350 000+ artisans référencés. De nombreux professionnels de tous corps de métier sont disponibles dans les villes du département.`,
    },
    {
      question: `Comment obtenir un devis dans le ${dept.name} ?`,
      answer: `Sélectionnez le service souhaité, indiquez votre ville dans le ${dept.name}, et recevez jusqu'à 3 devis gratuits de professionnels qualifiés. Le service est 100% gratuit et sans engagement.`,
    },
    {
      question: `Quels services sont disponibles dans le ${dept.name} ?`,
      answer: `Tous les corps de métier du bâtiment sont représentés : plomberie, électricité, serrurerie, chauffage, peinture, menuiserie, couverture, maçonnerie, jardinage et bien d'autres encore.`,
    },
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={[breadcrumbSchema, collectionPageSchema, faqSchema]} />
      {/* ─── PREMIUM DARK HERO ──────────────────────────────── */}
      <section className="relative bg-[#0a0f1e] text-white overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(79,70,229,0.20) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(99,102,241,0.12) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(129,140,248,0.08) 0%, transparent 50%)',
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
                ...(regionSlug ? [{ label: dept.region, href: `/regions/${regionSlug}` }] : []),
                { label: 'Départements', href: '/departements' },
                { label: `${dept.name} (${dept.code})` },
              ]}
              className="text-slate-400 [&_a]:text-slate-400 [&_a:hover]:text-white [&_svg]:text-slate-600"
            />
          </div>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/15 backdrop-blur-sm rounded-full border border-indigo-400/25 mb-5">
              <Map className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-indigo-200">Département</span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-indigo-500/15 backdrop-blur rounded-2xl flex items-center justify-center border border-indigo-400/20">
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-300">{dept.code}</span>
              </div>
              <div>
                <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-[-0.025em] leading-[1.1]">
                  Artisans en{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-300 to-blue-300">
                    {dept.name}
                  </span>
                </h1>
                <p className="text-slate-400 mt-1">{dept.region}</p>
              </div>
            </div>

            <p className="text-lg text-slate-400 max-w-2xl leading-relaxed mb-8">
              {dept.description} Trouvez des artisans qualifiés et référencés dans tout le département.
            </p>

            {/* Location info */}
            <div className="flex flex-wrap gap-4 mb-8 text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span>Chef-lieu : {dept.chefLieu}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>{dept.population} habitants</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span>{dept.villes.length} villes principales</span>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* ─── SERVICES ─────────────────────────────────────── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Wrench className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-slate-900 tracking-tight">
                Trouver un artisan dans le {dept.name}
              </h2>
              <p className="text-sm text-slate-500">{services.length} corps de métier disponibles</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}/${villesDuDepartement[0]?.slug || slugify(dept.chefLieu)}`}
                className="bg-white rounded-xl shadow-sm p-5 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group border border-gray-100"
              >
                <span className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors block text-sm">{service.name}</span>
                <span className="block text-xs text-slate-400 mt-1.5">dans le {dept.code}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── PRINCIPALES VILLES ───────────────────────────── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-slate-900 tracking-tight">
                Principales villes du {dept.name}
              </h2>
              <p className="text-sm text-slate-500">{villesDuDepartement.length > 0 ? villesDuDepartement.length : dept.villes.length} villes référencées</p>
            </div>
          </div>
          {villesDuDepartement.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {villesDuDepartement.map((ville) => (
                <Link key={ville.slug} href={`/villes/${ville.slug}`} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-indigo-300 hover:-translate-y-0.5 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg flex items-center justify-center group-hover:from-indigo-100 group-hover:to-indigo-200 transition-colors">
                      <MapPin className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors text-sm truncate">{ville.name}</div>
                      <div className="text-xs text-slate-400">{ville.population} hab.</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {dept.villes.map((villeName) => (
                <span key={villeName} className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors">
                  {villeName}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* ─── SERVICES PAR VILLE ───────────────────────────── */}
        {villesDuDepartement.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <Wrench className="w-5 h-5 text-violet-600" />
              </div>
              <h2 className="font-heading text-xl font-bold text-slate-900 tracking-tight">
                Services par ville dans le {dept.name}
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {villesDuDepartement.slice(0, 6).map((ville) => (
                <div key={ville.slug} className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="font-heading font-semibold text-slate-900 mb-4">Artisans à {ville.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {services.slice(0, 6).map((service) => (
                      <Link
                        key={`${service.slug}-${ville.slug}`}
                        href={`/services/${service.slug}/${ville.slug}`}
                        className="text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                      >
                        {service.name}
                      </Link>
                    ))}
                  </div>
                  <Link href={`/villes/${ville.slug}`} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium mt-4">
                    Tous les artisans <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── OTHER DEPARTMENTS ─────────────────────────────── */}
        {siblingDepts.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="font-heading text-xl font-bold text-slate-900 tracking-tight">
                Autres départements en {dept.region}
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {siblingDepts.slice(0, 10).map((d) => (
                <Link key={d.slug} href={`/departements/${d.slug}`} className="bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-200 text-slate-700 hover:text-blue-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
                  {d.name} ({d.code})
                </Link>
              ))}
            </div>
          </section>
        )}

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
              <h3 className="font-semibold text-slate-900 mb-2">Combien d&apos;artisans sont disponibles dans le {dept.name} ?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Le {dept.name} ({dept.code}) fait partie de notre couverture nationale de 350 000+ artisans référencés.
                De nombreux professionnels de tous corps de métier sont disponibles dans les villes du département.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-2">Comment obtenir un devis dans le {dept.name} ?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Sélectionnez le service souhaité, indiquez votre ville dans le {dept.name}, et recevez jusqu&apos;à 3 devis
                gratuits de professionnels qualifiés. Le service est 100% gratuit et sans engagement.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-2">Quels services sont disponibles dans le {dept.name} ?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tous les corps de métier du bâtiment sont représentés : plomberie, électricité, serrurerie, chauffage,
                peinture, menuiserie, couverture, maçonnerie, jardinage et bien d&apos;autres encore.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ─── CTA ────────────────────────────────────────────── */}
      <section className="relative bg-[#0a0f1e] overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(79,70,229,0.12) 0%, transparent 60%)',
        }} />
        <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-20 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">
            Besoin d&apos;un artisan dans le {dept.name} ?
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
                {services.slice(0, 8).map((s) => (
                  <Link key={s.slug} href={`/services/${s.slug}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 py-2 transition-colors">
                    <ChevronRight className="w-3 h-3" />
                    {s.name}
                  </Link>
                ))}
              </div>
              <Link href="/services" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium mt-3">
                Tous les services <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Region */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Région {dept.region}</h3>
              <div className="space-y-2">
                {regionSlug && (
                  <Link href={`/regions/${regionSlug}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 py-2 transition-colors">
                    <ChevronRight className="w-3 h-3" />
                    Artisans en {dept.region}
                  </Link>
                )}
                {siblingDepts.slice(0, 5).map((d) => (
                  <Link key={d.slug} href={`/departements/${d.slug}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 py-2 transition-colors">
                    <ChevronRight className="w-3 h-3" />
                    {d.name} ({d.code})
                  </Link>
                ))}
              </div>
              <Link href="/departements" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium mt-3">
                Tous les départements <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Navigation</h3>
              <div className="space-y-2">
                <Link href="/villes" className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 py-2 transition-colors">
                  <ChevronRight className="w-3 h-3" />Toutes les villes
                </Link>
                <Link href="/regions" className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 py-2 transition-colors">
                  <ChevronRight className="w-3 h-3" />Toutes les régions
                </Link>
                <Link href="/departements" className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 py-2 transition-colors">
                  <ChevronRight className="w-3 h-3" />Tous les départements
                </Link>
                <Link href="/devis" className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 py-2 transition-colors">
                  <ChevronRight className="w-3 h-3" />Demander un devis
                </Link>
                <Link href="/comment-ca-marche" className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 py-2 transition-colors">
                  <ChevronRight className="w-3 h-3" />Comment ça marche
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
