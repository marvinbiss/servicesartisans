import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, ArrowRight, Shield, Clock } from 'lucide-react'

import { SITE_URL, SITE_NAME, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { villes, parsePopulation, type Ville } from '@/lib/data/france'
import { getServiceBySlug } from '@/lib/supabase'
import { getBreadcrumbSchema, getFAQSchema, getItemListSchema } from '@/lib/seo/jsonld'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import TldrBlock from '@/components/flagship/TldrBlock'
import AroundMeGeolocator from '@/components/seo/AroundMeGeolocator'
import { isRgeAllowedService } from '@/lib/rge/service-city-listings'
import { getCeeOpsForRgeService } from '@/lib/rge/service-guides-map'

export const revalidate = 86400
export const dynamicParams = false

// 10 services éligibles au pattern "autour de moi" — volume de recherche
// significatif pour le long-tail "près de moi / près de chez moi".
const AROUND_ME_SERVICES: readonly string[] = [
  'plombier',
  'electricien',
  'serrurier',
  'chauffagiste',
  'peintre-en-batiment',
  'menuisier',
  'macon',
  'couvreur',
  'carreleur',
  'jardinier',
] as const

export function generateStaticParams() {
  return AROUND_ME_SERVICES.map((service) => ({ service }))
}

type Params = { service: string }

async function loadService(service: string) {
  if (!AROUND_ME_SERVICES.includes(service)) return null
  try {
    return await getServiceBySlug(service)
  } catch {
    return null
  }
}

function topCities(limit = 30): Ville[] {
  return [...villes]
    .sort((a, b) => parsePopulation(b.population) - parsePopulation(a.population))
    .slice(0, limit)
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { service } = await params
  const svc = await loadService(service)
  if (!svc) return { title: 'Page introuvable' }
  const name = svc.name
  const path = `/services/${service}/autour-de-moi`
  const url = `${SITE_URL}${path}`
  const title = `${name} autour de moi — trouver un ${name.toLowerCase()} proche | ${SITE_NAME}`
  const titleRoot = `${name} autour de moi — trouver un ${name.toLowerCase()} proche`
  const description = `Trouvez un ${name.toLowerCase()} près de chez vous. Géolocalisation + 30 villes les plus demandées. Devis gratuit 24h, artisans vérifiés SIREN.`
  return {
    title: titleRoot,
    description,
    alternates: getAlternates(path),
    openGraph: {
      ...getOgDefaults(),
      title,
      description,
      url,
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { service } = await params
  const svc = await loadService(service)
  if (!svc) notFound()

  const name = svc.name
  const nameLc = name.toLowerCase()
  const cities = topCities(30)
  const knownSlugs = new Set(villes.map((v) => v.slug))
  const pageUrl = `/services/${service}/autour-de-moi`

  const breadcrumb = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Services', url: '/services' },
    { name: name, url: `/services/${service}` },
    { name: 'Autour de moi', url: pageUrl },
  ])

  const itemList = getItemListSchema({
    name: `${name} par ville — 30 villes les plus demandées`,
    description: `Sélection des 30 villes françaises avec la plus forte demande en ${nameLc}s.`,
    url: pageUrl,
    items: cities.map((c, i) => ({
      name: `${name} à ${c.name}`,
      url: `/services/${service}/${c.slug}`,
      position: i + 1,
    })),
  })

  const faq = getFAQSchema(
    [
      {
        question: `Comment trouver un ${nameLc} près de chez moi ?`,
        answer: `Cliquez sur "Trouver un ${nameLc} près de moi" pour détecter automatiquement votre commune, ou choisissez parmi les 30 villes listées sur cette page. Vous serez redirigé·e vers la page dédiée à votre ville avec les artisans vérifiés et les tarifs locaux.`,
      },
      {
        question: `La géolocalisation est-elle obligatoire ?`,
        answer: `Non. Si vous refusez la localisation, la page affiche les 30 villes françaises avec le plus d'artisans actifs. Vous pouvez aussi demander directement un devis gratuit qui sera adressé aux artisans couvrant votre secteur.`,
      },
      {
        question: `Combien coûte un devis ?`,
        answer: `Les devis sont 100% gratuits et sans engagement. Vous recevez plusieurs propositions d'artisans vérifiés (SIREN contrôlé) sous 24h.`,
      },
      {
        question: `Combien d'artisans ${nameLc}s référencez-vous ?`,
        answer: `Plusieurs milliers d'artisans ${nameLc}s actifs en France, couverts par une base SIRENE mise à jour quotidiennement. Chaque fiche affiche l'ancienneté de l'entreprise et les qualifications RGE le cas échéant.`,
      },
    ],
    {
      pageUrl: `${SITE_URL}/services/${service}/autour-de-moi`,
      name: `FAQ — ${name} autour de moi`,
      includeSpeakable: true,
    }
  )

  const jsonLdItems: Record<string, unknown>[] = [breadcrumb, itemList]
  if (faq) jsonLdItems.push(faq as Record<string, unknown>)

  return (
    <>
      <JsonLd data={jsonLdItems} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumb
          items={[
            { label: 'Accueil', href: '/' },
            { label: 'Services', href: '/services' },
            { label: name, href: `/services/${service}` },
            { label: 'Autour de moi' },
          ]}
        />
      </div>

      <section className="py-8 md:py-14 bg-gradient-to-b from-sand-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-charcoal-900 mb-4 leading-tight">
            {name} autour de moi
          </h1>
          <p className="text-lg text-charcoal-600 mb-6 max-w-2xl mx-auto">
            Trouvez un {nameLc} proche de chez vous. Géolocalisation en un clic, ou choisissez parmi
            les 30 villes les plus demandées en France.
          </p>

          <div className="max-w-xl mx-auto mb-8">
            <AroundMeGeolocator
              serviceSlug={service}
              serviceName={name}
              knownCitySlugs={knownSlugs}
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-charcoal-600">
            <span className="inline-flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-primary-500" /> Artisans vérifiés SIREN
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary-500" /> Devis 24h
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary-500" /> Toute la France
            </span>
          </div>
        </div>
      </section>

      {/* Sprint 10x — TldrBlock featured snippets / AI Overviews. */}
      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <TldrBlock
            title={`${name} autour de moi — l'essentiel`}
            bullets={[
              `Géolocalisation 1-clic : trouve un ${nameLc} proche de chez vous`,
              'Artisans vérifiés SIREN officiel + qualifications RGE sync ADEME',
              'Devis gratuit sous 24h, sans engagement, lead exclusif',
              '30 villes populaires + couverture nationale 35 000+ communes',
            ]}
          />
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal-900 mb-2">
            {name}s par ville — 30 villes populaires
          </h2>
          <p className="text-charcoal-600 mb-8 max-w-2xl">
            Sélectionnez votre ville pour voir les artisans {nameLc}s référencés, les tarifs locaux
            et les artisans RGE éligibles aux aides.
          </p>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {cities.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/services/${service}/${c.slug}`}
                  className="group flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-sand-200 bg-white hover:border-primary-300 hover:bg-primary-50 transition-all duration-200"
                >
                  <span className="font-medium text-charcoal-800 group-hover:text-primary-700">
                    {c.name}
                  </span>
                  <ArrowRight className="w-4 h-4 text-charcoal-400 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-10 md:py-14 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal-900 mb-6">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            {[
              {
                q: `Comment trouver un ${nameLc} près de chez moi ?`,
                a: `Cliquez sur le bouton "Trouver un ${nameLc} près de moi" ci-dessus. Après votre autorisation, nous identifions votre commune via l'API officielle adresse.data.gouv.fr et vous redirigeons vers la page dédiée à votre ville.`,
              },
              {
                q: `La géolocalisation est-elle obligatoire ?`,
                a: `Non. Vous pouvez parcourir les 30 villes les plus demandées listées ci-dessus ou nous envoyer une demande de devis générique qui sera transmise aux artisans couvrant votre secteur.`,
              },
              {
                q: `Combien coûte un devis ?`,
                a: `Les devis sont 100 % gratuits et sans engagement. Vous recevez plusieurs propositions d'artisans vérifiés (SIREN contrôlé) sous 24h.`,
              },
              {
                q: `Qu'est-ce qu'un artisan vérifié SIREN ?`,
                a: `Chaque fiche artisan est rattachée à un numéro SIREN officiel validé auprès de l'INSEE. Nous vérifions l'activité, l'ancienneté et, le cas échéant, les qualifications RGE.`,
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-sand-200 bg-white px-4 py-3 open:shadow-sm"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between gap-3 font-heading font-semibold text-charcoal-900">
                  {item.q}
                  <span className="text-primary-500 group-open:rotate-45 transition-transform text-xl leading-none">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-charcoal-600 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {isRgeAllowedService(service) && (
        <section className="py-10 md:py-14 border-t border-emerald-100 bg-emerald-50/40">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal-900 mb-3">
              {name} RGE et primes associées
            </h2>
            <p className="text-charcoal-600 mb-5 max-w-3xl">
              {name}s certifiés RGE donnent accès aux aides MaPrimeRénov&apos;, primes CEE et TVA
              5,5 %. Consultez la page dédiée ou les guides par opération.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/rge/${service}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-100 hover:border-emerald-500 transition text-sm font-semibold text-emerald-900"
              >
                Artisans RGE {nameLc}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              {getCeeOpsForRgeService(service)
                .slice(0, 5)
                .map((op) => (
                  <Link
                    key={op.code}
                    href={`/cee/${op.code.toLowerCase()}/guide`}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-200 bg-white hover:bg-emerald-100 transition text-sm"
                  >
                    <span className="font-bold text-emerald-900">{op.code}</span>
                    <span className="text-charcoal-700">{op.label}</span>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal-900 mb-3">
            Votre ville n'est pas listée ?
          </h2>
          <p className="text-charcoal-600 mb-6">
            Demandez un devis gratuit en indiquant votre code postal. Nous transmettrons votre
            demande aux artisans {nameLc}s couvrant votre secteur.
          </p>
          <Link
            href={`/devis/${service}`}
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-4 rounded-xl shadow-cta hover:shadow-cta-hover hover:-translate-y-0.5 transition-all duration-300"
          >
            Demander un devis gratuit
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  )
}
