import { Metadata } from 'next'
import Link from 'next/link'
import {
  MapPin,
  ArrowRight,
  Building2,
  Users,
  ChevronRight,
  Compass,
  ShieldCheck,
} from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import TldrBlock from '@/components/flagship/TldrBlock'
import { getFAQSchema } from '@/lib/seo/jsonld'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import { villes, regions, departements, services } from '@/lib/data/france'
import { getPageContent } from '@/lib/cms'
import { CmsContent } from '@/components/CmsContent'
import GeoPageCTA from '@/components/conversion/GeoPageCTA'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Artisans RGE par Ville — Annuaire France',
  description: `Trouvez un artisan RGE certifié (Qualibat, Qualifelec, QualiPAC, Qualit'EnR) dans votre ville. ${villes.length} villes couvertes, annuaire par commune dans 101 départements. Devis gratuits, sans engagement.`,
  alternates: getAlternates(`/villes`),
  openGraph: {
    title: 'Artisans RGE par Ville — Annuaire par commune en France',
    description: `Trouvez un artisan RGE certifié dans votre ville. ${villes.length} villes couvertes, annuaire par commune dans 101 départements.`,
    url: `${SITE_URL}/villes`,
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'ServicesArtisans — Artisans par ville',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Artisans RGE par Ville — Annuaire par commune en France',
    description: `Trouvez un artisan RGE certifié dans votre ville. ${villes.length} villes couvertes, annuaire par commune dans 101 départements. Devis gratuits, sans engagement.`,
  },
}

const villesByRegion = villes.reduce(
  (acc, ville) => {
    if (!acc[ville.region]) acc[ville.region] = []
    acc[ville.region].push(ville)
    return acc
  },
  {} as Record<string, typeof villes>
)

const sortedRegions = Object.entries(villesByRegion).sort((a, b) => b[1].length - a[1].length)

function slugifyRegion(region: string): string {
  return region
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
}

export default async function VillesIndexPage() {
  const cmsPage = await getPageContent('villes', 'static')

  if (cmsPage?.content_html) {
    return (
      <div className="min-h-screen bg-sand-50">
        <section className="bg-white border-b border-sand-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 data-speakable="true" className="font-heading text-3xl font-bold text-charcoal-900">
              {cmsPage.title}
            </h1>
          </div>
        </section>
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-soft p-8">
              <CmsContent html={cmsPage.content_html} />
            </div>
          </div>
        </section>
      </div>
    )
  }

  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Artisans par ville en France',
    description: `Annuaire d'artisans RGE certifiés dans ${villes.length} villes de France.`,
    url: `${SITE_URL}/villes`,
    numberOfItems: villes.length,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Villes' },
      ],
    },
  }

  const faqSchema = getFAQSchema([
    {
      question: 'Combien de villes sont couvertes par ServicesArtisans ?',
      answer: `Notre annuaire couvre ${villes.length} communes de France métropolitaine et d'outre-mer, dans ${regions.length} régions et ${departements.length} départements. Chaque page ville liste les artisans RGE certifiés par corps de métier.`,
    },
    {
      question: 'Ma commune n’apparaît pas : que faire ?',
      answer:
        "Si votre commune n'est pas listée, nous affichons les artisans du département ou des villes limitrophes. Vous pouvez également faire une demande de devis classique en précisant votre code postal : les artisans du secteur géographique recevront votre demande (déplacement souvent gratuit dans un rayon de 30-50 km).",
    },
    {
      question: 'Les artisans proposés interviennent-ils uniquement dans la ville ?',
      answer:
        "Non. Les artisans RGE certifiés sur une page ville interviennent typiquement dans toute la zone de chalandise (commune + communes limitrophes + département dans certains cas). Le rayon d'intervention exact est précisé sur chaque fiche artisan.",
    },
    {
      question: 'Comment sont choisies les villes principales mises en avant ?',
      answer:
        "Les villes mises en avant dans chaque région sont triées par volume d'artisans RGE certifiés et par volumétrie de recherches des utilisateurs. Les métropoles régionales (Paris, Lyon, Marseille, Toulouse, Bordeaux, Nantes, Lille, Strasbourg, Nice, Montpellier) sont systématiquement visibles.",
    },
    {
      question: 'Puis-je filtrer les artisans par note ou par RGE ?',
      answer:
        "Oui. Depuis chaque page métier + ville (ex : /services/plombier/lyon), vous pouvez filtrer par note moyenne, nombre d'avis et qualification RGE. Les artisans avec une qualification RGE valide sont mis en avant pour les travaux d'économie d'énergie.",
    },
  ])

  return (
    <div className="min-h-screen bg-sand-50">
      <JsonLd data={[collectionPageSchema, faqSchema]} />

      {/* HERO bento — sombre, gros titre, stats sur la droite */}
      <section className="px-4 sm:px-6 lg:px-8 pt-6 md:pt-10">
        <div className="max-w-7xl mx-auto rounded-[2rem] md:rounded-[2.5rem] bg-charcoal-900 text-white overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute -top-40 -right-40 w-[28rem] h-[28rem] rounded-full bg-primary-500/15 blur-3xl" />
            <div className="absolute -bottom-32 -left-24 w-80 h-80 rounded-full bg-accent-500/10 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
                backgroundSize: '64px 64px',
              }}
            />
          </div>

          <div className="relative px-6 md:px-12 lg:px-16 py-14 md:py-20">
            <div className="mb-6">
              <Breadcrumb
                items={[{ label: 'Villes' }]}
                className="text-charcoal-300 [&_a]:text-charcoal-300 [&_a:hover]:text-primary-300"
              />
            </div>

            <div className="grid lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-400/15 backdrop-blur-sm border border-primary-400/25 text-sm font-medium text-primary-200 mb-6">
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                  {villes.length}+ villes couvertes
                </span>

                <h1
                  data-speakable="true"
                  className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] mb-6"
                >
                  Un artisan RGE certifié,
                  <br className="hidden md:block" />{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 via-primary-400 to-secondary-400">
                    dans votre ville.
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-charcoal-300 leading-relaxed max-w-2xl mb-8">
                  Annuaire par commune des artisans titulaires d&apos;une qualification RGE active
                  (Qualibat, Qualifelec, QualiPAC, Qualit&apos;EnR), synchronisé chaque semaine avec
                  la base ADEME.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/devis"
                    className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-primary-400 hover:bg-primary-500 text-white font-semibold shadow-cta hover:shadow-cta-hover transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-900 focus-visible:ring-primary-300"
                  >
                    Obtenir mon devis gratuit
                    <ArrowRight className="w-5 h-5" aria-hidden="true" />
                  </Link>
                  <Link
                    href="#regions"
                    className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold backdrop-blur-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                  >
                    Parcourir les régions
                  </Link>
                </div>
              </div>

              {/* Stats column */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-3 md:gap-4">
                <div className="rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
                  <MapPin className="w-6 h-6 text-primary-400 mb-3" aria-hidden="true" />
                  <div className="font-heading text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                    {villes.length}+
                  </div>
                  <div className="text-sm text-charcoal-300 mt-1">Villes</div>
                </div>
                <div className="rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
                  <Building2 className="w-6 h-6 text-accent-400 mb-3" aria-hidden="true" />
                  <div className="font-heading text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                    {departements.length}
                  </div>
                  <div className="text-sm text-charcoal-300 mt-1">Départements</div>
                </div>
                <div className="rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
                  <Users className="w-6 h-6 text-primary-300 mb-3" aria-hidden="true" />
                  <div className="font-heading text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                    {regions.length}
                  </div>
                  <div className="text-sm text-charcoal-300 mt-1">Régions</div>
                </div>
                <div className="rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
                  <ShieldCheck className="w-6 h-6 text-secondary-400 mb-3" aria-hidden="true" />
                  <div className="font-heading text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                    SIREN
                  </div>
                  <div className="text-sm text-charcoal-300 mt-1">Vérifiés INSEE</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TLDR */}
      <section className="bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          <TldrBlock
            title="L'essentiel de l'annuaire villes 2026"
            bullets={[
              `${villes.length}+ villes couvertes en France métropolitaine et outre-mer`,
              `${departements.length} départements, ${regions.length} régions — couverture nationale`,
              "Artisans RGE certifiés (Qualibat, Qualifelec, QualiPAC, Qualit'EnR) — SIREN officiel, sync ADEME quotidien",
              'Devis gratuit sous 24h, lead exclusif (1 demande = 1 artisan)',
            ]}
          />
        </div>
      </section>

      {/* QUICK NAV — chips régions */}
      <section id="regions" className="bg-sand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-20">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold text-primary-500 tracking-[0.18em] uppercase mb-3">
              Maillage géographique
            </span>
            <h2 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tight text-charcoal-900 mb-4">
              Toutes les villes par région.
            </h2>
            <p className="text-lg text-charcoal-600 max-w-2xl mx-auto">
              Sélectionnez une région pour déployer l&apos;ensemble des communes couvertes par
              l&apos;annuaire ServicesArtisans.
            </p>
          </div>

          <nav
            className="flex flex-wrap justify-center gap-2 mb-12"
            aria-label="Accès rapide aux régions"
          >
            {sortedRegions.map(([region, regionVilles]) => (
              <a
                key={region}
                href={`#region-${slugifyRegion(region)}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-charcoal-700 bg-white hover:bg-primary-50 hover:text-primary-600 px-4 py-2 rounded-full border border-sand-200 hover:border-primary-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
              >
                <span>{region}</span>
                <span className="text-xs text-charcoal-400">{regionVilles.length}</span>
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* REGIONS — bloc accordion par région, design plus aéré */}
      <section className="bg-sand-50 pb-20 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {sortedRegions.map(([region, regionVilles]) => {
            const regionId = slugifyRegion(region)
            return (
              <details
                key={region}
                id={`region-${regionId}`}
                className="group rounded-3xl bg-white border border-sand-200 hover:border-sand-300 shadow-sm hover:shadow-md transition-all"
              >
                <summary className="flex items-center gap-4 px-6 md:px-8 py-5 cursor-pointer list-none select-none">
                  <div
                    className="w-11 h-11 rounded-2xl bg-accent-50 flex items-center justify-center shrink-0"
                    aria-hidden="true"
                  >
                    <Building2 className="w-5 h-5 text-accent-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading text-base md:text-lg font-bold text-charcoal-900 tracking-tight truncate">
                      {region}
                    </h3>
                    <p className="text-sm text-charcoal-500">
                      {regionVilles.length} villes couvertes
                    </p>
                  </div>
                  <ChevronRight
                    className="w-5 h-5 text-charcoal-400 group-open:rotate-90 transition-transform"
                    aria-hidden="true"
                  />
                </summary>
                <div className="px-6 md:px-8 pb-6 pt-2">
                  <div className="rounded-2xl bg-sand-50 border border-sand-200 p-5">
                    <div className="flex flex-wrap gap-x-1 gap-y-1.5">
                      {regionVilles.map((ville, i) => (
                        <span key={ville.slug} className="inline-flex items-baseline">
                          <Link
                            href={`/villes/${ville.slug}`}
                            className="text-sm text-charcoal-700 hover:text-primary-500 hover:underline transition-colors"
                          >
                            {ville.name}
                          </Link>
                          {i < regionVilles.length - 1 && (
                            <span className="text-sand-400 mx-1.5" aria-hidden="true">
                              ·
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </details>
            )
          })}
        </div>
      </section>

      {/* MAILLAGE — 3 colonnes régions / dépts / services */}
      <section className="bg-white border-y border-sand-200 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold text-primary-500 tracking-[0.18em] uppercase mb-3">
              Explorer également
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-charcoal-900">
              Trois manières de chercher un artisan.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {/* Régions */}
            <div className="rounded-3xl bg-sand-50 border border-sand-200 p-7">
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <Compass className="w-5 h-5 text-accent-600" />
                </div>
                <h3 className="font-heading text-lg font-bold text-charcoal-900">Par région</h3>
              </div>
              <ul className="space-y-1 mb-5">
                {regions.slice(0, 8).map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/regions/${r.slug}`}
                      className="flex items-center gap-2 text-sm text-charcoal-700 hover:text-primary-500 py-1.5 transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-charcoal-400" aria-hidden="true" />
                      Artisans en {r.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/regions"
                className="inline-flex items-center gap-1.5 text-primary-500 hover:text-primary-600 text-sm font-semibold"
              >
                Toutes les régions <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            {/* Départements */}
            <div className="rounded-3xl bg-sand-50 border border-sand-200 p-7">
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <Building2 className="w-5 h-5 text-primary-600" />
                </div>
                <h3 className="font-heading text-lg font-bold text-charcoal-900">
                  Par département
                </h3>
              </div>
              <ul className="space-y-1 mb-5">
                {departements.slice(0, 8).map((d) => (
                  <li key={d.slug}>
                    <Link
                      href={`/departements/${d.slug}`}
                      className="flex items-center gap-2 text-sm text-charcoal-700 hover:text-primary-500 py-1.5 transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-charcoal-400" aria-hidden="true" />
                      {d.name} ({d.code})
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/departements"
                className="inline-flex items-center gap-1.5 text-primary-500 hover:text-primary-600 text-sm font-semibold"
              >
                Tous les départements <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            {/* Services */}
            <div className="rounded-3xl bg-sand-50 border border-sand-200 p-7">
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-10 h-10 rounded-xl bg-secondary-100 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <ShieldCheck className="w-5 h-5 text-secondary-700" />
                </div>
                <h3 className="font-heading text-lg font-bold text-charcoal-900">
                  Services populaires
                </h3>
              </div>
              <ul className="space-y-1 mb-5">
                {services.slice(0, 8).map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/services/${s.slug}`}
                      className="flex items-center gap-2 text-sm text-charcoal-700 hover:text-primary-500 py-1.5 transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-charcoal-400" aria-hidden="true" />
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/services"
                className="inline-flex items-center gap-1.5 text-primary-500 hover:text-primary-600 text-sm font-semibold"
              >
                Tous les services <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL — bento color primary */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-primary-500 to-primary-700 text-white overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-secondary-400/20 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-accent-500/15 blur-3xl" />
          </div>
          <div className="relative px-6 md:px-12 lg:px-20 py-16 md:py-20 text-center">
            <h2 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tight leading-tight mb-5">
              Prêt à lancer vos travaux&nbsp;?
            </h2>
            <p className="text-lg text-primary-50/95 max-w-xl mx-auto leading-relaxed mb-10">
              Décrivez votre projet en 2 minutes, recevez un devis gratuit d&apos;un artisan RGE
              certifié de votre secteur. Lead exclusif&nbsp;: 1 demande = 1 artisan.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/devis"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-primary-700 font-bold shadow-cta hover:bg-sand-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-500 focus-visible:ring-white"
              >
                Obtenir mon devis gratuit
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-secondary-500 hover:bg-secondary-400 text-charcoal-900 font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-500 focus-visible:ring-secondary-300"
              >
                Voir les services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Conversion: Sticky mobile CTA + Exit intent */}
      <GeoPageCTA variant="sticky-only" />
    </div>
  )
}
