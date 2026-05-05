import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { isRedirectError } from 'next/dist/client/components/redirect'
import { isNotFoundError } from 'next/dist/client/components/not-found'
import { logger } from '@/lib/logger'
import { isDynamicServerError } from 'next/dist/client/components/hooks-server-context'
import { Users, Thermometer, AlertTriangle, TrendingUp, Leaf, Building2 } from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema, getReviewedByPersonSchema } from '@/lib/seo/jsonld'
import { authors, getReviewerForAuthor } from '@/lib/data/authors'

const COMM_AUTHOR = authors['sophie-martin']
const COMM_REVIEWER = getReviewerForAuthor(COMM_AUTHOR)
import { monthlyAnchorIso } from '@/lib/seo/sprint-helpers'
import { SITE_URL, SITE_NAME, getAlternates, getOgDefaults } from '@/lib/seo/config'
import {
  getCommuneBySlug,
  hasDemographicData,
  hasGeorisquesData,
  formatNumber,
  formatEuro,
  monthName,
  isCommuneQualified,
  type CommuneData,
} from '@/lib/data/commune-data'
import {
  getVilleBySlug,
  services,
  villes as villesData,
  getDepartementByCode,
  getVillesByDepartement,
  getRegionSlugByName,
} from '@/lib/data/france'
import AEOAnswerBlock from '@/components/seo/AEOAnswerBlock'
import CalendrierSaisonnierBlock from '@/components/seo/CalendrierSaisonnierBlock'
import UserQuestionBlock from '@/components/seo/UserQuestionBlock'
import EnBrefBox from '@/components/seo/EnBrefBox'
import TldrBlock from '@/components/flagship/TldrBlock'
import { buildCommuneSnippetData } from './snippet-helpers'

export const dynamicParams = true
export const revalidate = 86_400

interface PageProps {
  params: Promise<{ commune: string }>
}

// Pivot full RGE 2026-05-03 : serrurier retiré (commodity hors RGE) — remplacé
// par pompe-a-chaleur (gravity hub RGE).
const TIER_A_SERVICES = [
  'plombier',
  'electricien',
  'chauffagiste',
  'pompe-a-chaleur',
  'couvreur',
  'menuisier',
  'macon',
  'peintre-en-batiment',
] as const

function getCanonicalRedirectTarget(slug: string): string | null {
  const ville = getVilleBySlug(slug)
  return ville ? `/villes/${ville.slug}` : null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { commune: slug } = await params

  // WHY: déclenche le 301 dès `generateMetadata` plutôt que de retourner un
  // metadata `noindex` puis attendre le `permanentRedirect` du render. L'ancien
  // pattern émettait un `<meta robots="noindex">` qui pouvait être consommé par
  // Google avant le suivi du 301 → perte de PageRank sur la cible canonical
  // (audit indexabilité 2026-04-30). Avec `permanentRedirect` ici, Next.js
  // throw NEXT_REDIRECT immédiatement et la réponse HTTP est 308/301 sans
  // jamais render le body ni envoyer de meta robots conflictuel.
  const canonical = getCanonicalRedirectTarget(slug)
  if (canonical) permanentRedirect(canonical)

  const commune = await getCommuneBySlug(slug)
  if (!commune) notFound()

  const dept = commune.departement_name ?? commune.departement_code
  const cp = commune.code_postal ?? commune.departement_code
  const title = `${commune.name} (${cp}) — Artisans, données INSEE & RGE 2026`
  const truncated = title.length > 60 ? title.slice(0, 59).replace(/\s+\S*$/, '') + '…' : title

  const populationFr = commune.population ? `${formatNumber(commune.population)} habitants` : ''
  const description =
    `${commune.name} (${dept}) : ${populationFr ? populationFr + ', ' : ''}` +
    `${commune.nb_artisans_btp ? formatNumber(commune.nb_artisans_btp) + ' artisans BTP, ' : ''}` +
    `${commune.nb_artisans_rge ? formatNumber(commune.nb_artisans_rge) + ' artisans RGE, ' : ''}` +
    `données INSEE, climat, risques Géorisques. Trouvez un artisan local 2026.`
  const descTruncated =
    description.length > 160 ? description.slice(0, 159).replace(/\s+\S*$/, '') + '…' : description

  // Vague γ nettoyage 2026-05-02 : commune hors filter qualifié (population
  // <500 ET 0 artisan) → noindex pour aligner avec l'omission sitemap.
  // Sans ce check, Google peut indexer ces pages via découvertes externes.
  const isExcludedByQualification = !isCommuneQualified(commune)

  return {
    title: truncated,
    description: descTruncated,
    alternates: getAlternates(`/communes/${slug}`),
    robots: isExcludedByQualification
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      ...getOgDefaults(),
      locale: 'fr_FR',
      title: truncated,
      description: descTruncated,
      url: `${SITE_URL}/communes/${slug}`,
      type: 'website',
      images: [
        {
          url: `${SITE_URL}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${commune.name} — données locales`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: truncated,
      description: descTruncated,
      images: [`${SITE_URL}/opengraph-image`],
    },
  }
}

export default async function CommunePage(props: PageProps) {
  try {
    return await renderCommunePage(props)
  } catch (err) {
    if (isRedirectError(err) || isNotFoundError(err) || isDynamicServerError(err)) throw err
    const params = await props.params.catch(() => null)
    logger.error('commune.unhandled_render_error', err as Error, {
      route: 'communes/[commune]',
      commune: params?.commune ?? null,
    })
    notFound()
  }
}

async function renderCommunePage({ params }: PageProps) {
  const { commune: slug } = await params

  const canonical = getCanonicalRedirectTarget(slug)
  if (canonical) permanentRedirect(canonical)

  const commune = await getCommuneBySlug(slug)
  if (!commune) notFound()

  const cp = commune.code_postal ?? commune.departement_code
  const dept = commune.departement_name ?? commune.departement_code
  const region = commune.region_name ?? ''

  const breadcrumbSchemaItems = [
    { name: 'Accueil', url: SITE_URL },
    { name: 'Communes', url: `${SITE_URL}/communes` },
    { name: commune.name, url: `${SITE_URL}/communes/${slug}` },
  ]
  const breadcrumbUiItems = [{ label: 'Communes', href: '/communes' }, { label: commune.name }]

  const placeSchema = buildPlaceSchema(commune, slug)
  const datasetSchema = buildDatasetSchema(commune, slug)

  // Sprint ULTRA — signal YMYL freshness sur 35K URLs INSEE.
  // Sprint AI Wave F 2026-05-03 — EnBref/Tldr réintroduits MAIS gated par
  // `buildCommuneSnippetData` qui retourne null si <3 signaux data réels.
  // Préserve le principe historique (« pas de padding sur communes
  // data-sparse ») tout en captant le snippet-bait sur les communes riches
  // (les seules réellement indexables via `isCommuneQualified`).
  const snippetData = buildCommuneSnippetData(commune)
  const monthlyAnchor = monthlyAnchorIso()
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${commune.name} (${cp}) — données locales & artisans`,
    image: [`${SITE_URL}/og-default.jpg`],
    datePublished: '2026-01-01T00:00:00+02:00',
    dateModified: monthlyAnchor,
    author: COMM_AUTHOR
      ? {
          '@type': 'Person',
          name: COMM_AUTHOR.name,
          jobTitle: COMM_AUTHOR.role,
          url: `${SITE_URL}/equipe/${COMM_AUTHOR.slug}`,
          ...(COMM_AUTHOR.methodology &&
            COMM_AUTHOR.methodology.length > 0 && { skills: COMM_AUTHOR.methodology }),
        }
      : { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    ...(COMM_REVIEWER && { reviewedBy: getReviewedByPersonSchema(COMM_REVIEWER) }),
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: `${SITE_URL}/communes/${slug}`,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
  }

  return (
    <>
      <JsonLd data={getBreadcrumbSchema(breadcrumbSchemaItems)} />
      <JsonLd data={placeSchema} />
      <JsonLd data={datasetSchema} />
      <JsonLd data={articleSchema} />

      <main className="min-h-screen bg-warm-cream-50">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <Breadcrumb items={breadcrumbUiItems} />

          <header className="mt-6 mb-8">
            <h1 data-speakable="true" className="text-3xl md:text-4xl font-bold text-charcoal-900">
              {commune.name} ({cp}) — Données locales & artisans
            </h1>
            <p className="mt-2 text-charcoal-600">
              {region ? `${region} · ` : ''}
              {dept}
              {commune.gentile ? ` · Habitants : ${commune.gentile}` : ''}
            </p>
            <p className="mt-2 text-sm text-charcoal-500">
              Auteur :{' '}
              <span className="font-medium text-charcoal-700">la rédaction ServicesArtisans</span>
              {' · '}
              Mis à jour le{' '}
              <time dateTime={monthlyAnchor.slice(0, 10)}>
                {new Date(monthlyAnchor).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  timeZone: 'Europe/Paris',
                })}
              </time>
            </p>
          </header>

          {snippetData && (
            <section aria-labelledby="en-bref-commune" className="mb-8">
              <h2 id="en-bref-commune" className="sr-only">
                En bref : {commune.name}
              </h2>
              <EnBrefBox summary={snippetData.summary} keyPoints={snippetData.bullets} />
            </section>
          )}

          <DemographicsSection commune={commune} />
          <ClimateSection commune={commune} />
          <GeorisquesSection commune={commune} />
          <PropertyMarketSection commune={commune} />
          <ArtisansSection commune={commune} />

          {/* Sprint 4 — AEO + UGC + saisonnalité pour 35K URLs commune.
              CommuneContextBlock / ContexteDPEBlock / RisquesGeoBlock déjà
              couverts par DemographicsSection / PropertyMarketSection /
              GeorisquesSection custom au-dessus. On ajoute uniquement les
              composants AEO encore manquants (LLM citation + UGC + calendrier). */}
          <section className="mb-8">
            <AEOAnswerBlock
              serviceSlug="renovation-energetique"
              serviceName="Rénovation énergétique"
              villeName={commune.name}
              departmentName={dept}
              providerCount={commune.nb_artisans_btp ?? 0}
              avgRating={null}
              priceRange={null}
              communePopulation={commune.population ?? null}
            />
          </section>

          <section className="mb-8">
            <CalendrierSaisonnierBlock
              serviceSlug="renovation-energetique"
              serviceName="Rénovation énergétique"
              villeName={commune.name}
              climatZone={commune.climat_zone ?? null}
            />
          </section>

          <section className="mb-8">
            <UserQuestionBlock
              serviceSlug="renovation-energetique"
              serviceName="Artisans"
              villeName={commune.name}
              villeSlug={slug}
            />
          </section>

          {snippetData && (
            <section aria-labelledby="essentiel-commune" className="mb-8">
              <h2 id="essentiel-commune" className="sr-only">
                L’essentiel sur {commune.name}
              </h2>
              <TldrBlock bullets={snippetData.bullets} />
            </section>
          )}

          <ServicesCallToActionSection commune={commune} />
          <RelatedHubsCommuneSection commune={commune} />
          <SourcesSection />
        </div>
      </main>
    </>
  )
}

function DemographicsSection({ commune }: { commune: CommuneData }) {
  if (!hasDemographicData(commune) && !commune.population) return null
  return (
    <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-charcoal-900">
        <Users className="h-6 w-6" /> Démographie & habitat
      </h2>
      <dl className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {commune.population ? (
          <Stat label="Population" value={formatNumber(commune.population)} />
        ) : null}
        {commune.densite_population ? (
          <Stat label="Densité" value={`${formatNumber(commune.densite_population)} hab/km²`} />
        ) : null}
        {commune.superficie_km2 ? (
          <Stat label="Superficie" value={`${formatNumber(commune.superficie_km2)} km²`} />
        ) : null}
        {commune.nb_logements ? (
          <Stat label="Logements" value={formatNumber(commune.nb_logements)} />
        ) : null}
        {commune.part_maisons_pct ? (
          <Stat label="Part de maisons" value={`${commune.part_maisons_pct} %`} />
        ) : null}
        {commune.revenu_median ? (
          <Stat label="Revenu médian" value={formatEuro(commune.revenu_median)} />
        ) : null}
      </dl>
      <p className="mt-3 text-xs text-charcoal-500">Source : INSEE — données démographiques.</p>
    </section>
  )
}

function ClimateSection({ commune }: { commune: CommuneData }) {
  const hasClimate =
    commune.jours_gel_annuels ||
    commune.precipitation_annuelle ||
    commune.temperature_moyenne_hiver ||
    commune.temperature_moyenne_ete ||
    commune.climat_zone
  if (!hasClimate) return null
  return (
    <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-charcoal-900">
        <Thermometer className="h-6 w-6" /> Climat & contraintes saisonnières
      </h2>
      <dl className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {commune.climat_zone ? <Stat label="Zone climatique" value={commune.climat_zone} /> : null}
        {commune.jours_gel_annuels != null ? (
          <Stat label="Jours de gel/an" value={String(commune.jours_gel_annuels)} />
        ) : null}
        {commune.precipitation_annuelle != null ? (
          <Stat
            label="Précipitations"
            value={`${formatNumber(Math.round(commune.precipitation_annuelle))} mm/an`}
          />
        ) : null}
        {commune.temperature_moyenne_hiver != null ? (
          <Stat label="Hiver (moy)" value={`${commune.temperature_moyenne_hiver} °C`} />
        ) : null}
        {commune.temperature_moyenne_ete != null ? (
          <Stat label="Été (moy)" value={`${commune.temperature_moyenne_ete} °C`} />
        ) : null}
        {commune.mois_travaux_ext_debut && commune.mois_travaux_ext_fin ? (
          <Stat
            label="Saison travaux ext."
            value={`${monthName(commune.mois_travaux_ext_debut)} → ${monthName(
              commune.mois_travaux_ext_fin
            )}`}
          />
        ) : null}
      </dl>
      <p className="mt-3 text-xs text-charcoal-500">Source : Météo-France (normales 1991-2020).</p>
    </section>
  )
}

function GeorisquesSection({ commune }: { commune: CommuneData }) {
  if (!hasGeorisquesData(commune)) return null
  return (
    <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-charcoal-900">
        <AlertTriangle className="h-6 w-6" /> Risques majeurs (Géorisques)
      </h2>
      <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {commune.risque_inondation ? <Risk label="Inondation" status="exposée" /> : null}
        {commune.risque_argile ? (
          <Risk label="Argile (RGA)" status={`risque ${commune.risque_argile}`} />
        ) : null}
        {commune.zone_sismique ? (
          <Risk label="Sismicité" status={`zone ${commune.zone_sismique}/5`} />
        ) : null}
        {commune.risque_radon ? (
          <Risk label="Radon" status={`niveau ${commune.risque_radon}/3`} />
        ) : null}
        {commune.nb_catnat ? (
          <Risk
            label="Arrêtés CatNat (historique)"
            status={`${commune.nb_catnat} reconnaissance(s)`}
          />
        ) : null}
      </ul>
      <p className="mt-3 text-xs text-charcoal-500">
        Source : Géorisques (BRGM / Ministère Transition écologique).
      </p>
    </section>
  )
}

function PropertyMarketSection({ commune }: { commune: CommuneData }) {
  const hasMarket =
    commune.prix_m2_moyen ||
    commune.prix_m2_maison ||
    commune.prix_m2_appartement ||
    commune.nb_transactions_annuelles
  if (!hasMarket) return null
  return (
    <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-charcoal-900">
        <TrendingUp className="h-6 w-6" /> Marché immobilier (DVF)
      </h2>
      <dl className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {commune.prix_m2_moyen ? (
          <Stat label="Prix m² moyen" value={formatEuro(commune.prix_m2_moyen)} />
        ) : null}
        {commune.prix_m2_maison ? (
          <Stat label="m² maison" value={formatEuro(commune.prix_m2_maison)} />
        ) : null}
        {commune.prix_m2_appartement ? (
          <Stat label="m² appartement" value={formatEuro(commune.prix_m2_appartement)} />
        ) : null}
        {commune.nb_transactions_annuelles ? (
          <Stat label="Transactions/an" value={formatNumber(commune.nb_transactions_annuelles)} />
        ) : null}
      </dl>
      <p className="mt-3 text-xs text-charcoal-500">
        Source : DVF — Demandes de Valeurs Foncières (data.gouv.fr).
      </p>
    </section>
  )
}

function ArtisansSection({ commune }: { commune: CommuneData }) {
  const hasArtisans =
    commune.nb_artisans_btp ||
    commune.nb_artisans_rge ||
    commune.nb_dpe_total ||
    commune.pct_passoires_dpe ||
    commune.nb_maprimerenov_annuel
  if (!hasArtisans) return null
  return (
    <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-charcoal-900">
        <Building2 className="h-6 w-6" /> Parc artisans & rénovation énergétique
      </h2>
      <dl className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {commune.nb_artisans_btp ? (
          <Stat label="Artisans BTP (SIRENE)" value={formatNumber(commune.nb_artisans_btp)} />
        ) : null}
        {commune.nb_artisans_rge ? (
          <Stat label="Artisans RGE" value={formatNumber(commune.nb_artisans_rge)} />
        ) : null}
        {commune.nb_dpe_total ? (
          <Stat label="DPE réalisés" value={formatNumber(commune.nb_dpe_total)} />
        ) : null}
        {commune.pct_passoires_dpe ? (
          <Stat label="Passoires énergétiques" value={`${commune.pct_passoires_dpe} %`} />
        ) : null}
        {commune.nb_maprimerenov_annuel ? (
          <Stat label="MaPrimeRénov’/an" value={formatNumber(commune.nb_maprimerenov_annuel)} />
        ) : null}
      </dl>
      <p className="mt-3 text-xs text-charcoal-500">
        Sources : SIRENE (INSEE), ADEME (RGE, DPE), ANAH (MaPrimeRénov&apos;).
      </p>
    </section>
  )
}

function ServicesCallToActionSection({ commune }: { commune: CommuneData }) {
  // Maps commune → ville statique la plus proche (chef-lieu de département) pour
  // pointer les CTAs vers /services/[s]/[v] qui existent. Fallback : pas de CTA.
  const fallbackVilleSlug = guessNearestStaticVille(commune)
  if (!fallbackVilleSlug) return null
  const fallbackVille = getVilleBySlug(fallbackVilleSlug)
  if (!fallbackVille) return null
  return (
    <section className="mb-8 rounded-xl bg-warm-cream-100 p-6">
      <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-charcoal-900">
        <Leaf className="h-6 w-6" /> Trouver un artisan près de {commune.name}
      </h2>
      <p className="mb-4 text-charcoal-700">
        Les artisans RGE certifiés référencés sur la plateforme interviennent depuis{' '}
        <strong>{fallbackVille.name}</strong> et les communes alentour. Sélectionnez le métier qui
        vous intéresse :
      </p>
      <ul className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {TIER_A_SERVICES.map((svc) => {
          const meta = services.find((s) => s.slug === svc)
          if (!meta) return null
          return (
            <li key={svc}>
              <Link
                href={`/services/${svc}/${fallbackVilleSlug}`}
                className="block rounded-lg bg-white px-3 py-2 text-sm font-medium text-coral-700 hover:bg-coral-50"
              >
                {meta.name}
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/**
 * Sprint 2 maillage interne (35K URLs /communes/[c]).
 * Pages communes = spokes profonds avec faible PageRank entrant. Cette
 * section route vers : département parent, région parent, villes du même
 * département (chef-lieu + 4 plus peuplées), aides nationales, catalogues
 * /services et /artisans-rge. Anchor text varié pour éviter sur-optimisation.
 */
function RelatedHubsCommuneSection({ commune }: { commune: CommuneData }) {
  const deptCode = commune.departement_code
  const dept = deptCode ? getDepartementByCode(deptCode) : undefined
  const regionSlug = commune.region_name ? getRegionSlugByName(commune.region_name) : undefined
  const nearbyVilles = deptCode
    ? getVillesByDepartement(deptCode)
        .filter((v) => v.slug !== commune.slug)
        .slice(0, 10)
    : []

  const links: { href: string; label: string }[] = []

  if (dept) {
    links.push({
      href: `/departements/${dept.slug}`,
      label: `Artisans du département ${dept.name}`,
    })
    // 3 services × département (jus PageRank vers /departements/[d]/[s])
    const TIER_DEPT_SERVICES = ['plombier', 'electricien', 'chauffagiste'] as const
    for (const svc of TIER_DEPT_SERVICES) {
      const meta = services.find((s) => s.slug === svc)
      if (!meta) continue
      links.push({
        href: `/departements/${dept.slug}/${svc}`,
        label: `${meta.name} ${dept.name}`,
      })
    }
  }

  if (regionSlug && commune.region_name) {
    links.push({
      href: `/regions/${regionSlug}`,
      label: `Région ${commune.region_name}`,
    })
  }

  for (const v of nearbyVilles) {
    links.push({ href: `/villes/${v.slug}`, label: `Artisans à ${v.name}` })
  }

  // Chef-lieu services × ville (top 5 services × première ville voisine)
  // Renforce PageRank vers /services/[s]/[v] qui est lui-même un hub fort.
  if (nearbyVilles.length > 0) {
    const chefLieu = nearbyVilles[0]
    // Pivot full RGE 2026-05-03 : serrurier retiré, remplacé par pompe-a-chaleur
    // (gravity hub RGE) pour booster le maillage vers les pages stratégiques.
    const TIER_HUB_SERVICES = [
      'plombier',
      'electricien',
      'chauffagiste',
      'pompe-a-chaleur',
      'couvreur',
    ] as const
    for (const svc of TIER_HUB_SERVICES) {
      const meta = services.find((s) => s.slug === svc)
      if (!meta) continue
      links.push({
        href: `/services/${svc}/${chefLieu.slug}`,
        label: `${meta.name} à ${chefLieu.name}`,
      })
    }

    if (commune.nb_artisans_rge && commune.nb_artisans_rge > 0) {
      links.push({
        href: `/artisans-rge/${chefLieu.slug}`,
        label: `Artisans RGE proches de ${commune.name}`,
      })
    }
  }

  // Aides territoriales + nationales (cluster YMYL)
  if (dept) {
    links.push({
      href: `/aides/${dept.slug}/maprimerenov`,
      label: `MaPrimeRénov' ${dept.name}`,
    })
  }
  links.push({ href: '/aides', label: 'Aides à la rénovation 2026' })
  links.push({ href: '/cee', label: 'Catalogue des primes CEE' })
  links.push({ href: '/rge', label: 'Annuaire RGE national' })
  links.push({ href: '/services', label: 'Tous les corps de métier' })
  links.push({ href: '/communes', label: 'Toutes les communes' })
  links.push({ href: '/villes', label: 'Toutes les villes' })

  if (links.length === 0) return null

  return (
    <section
      aria-labelledby="commune-hubs-heading"
      className="mb-8 rounded-xl bg-white p-6 shadow-sm"
    >
      <h2
        id="commune-hubs-heading"
        className="mb-4 flex items-center gap-2 text-xl font-semibold text-charcoal-900"
      >
        <Building2 className="h-5 w-5" /> À découvrir aussi
      </h2>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link
              href={l.href}
              className="block rounded-lg border border-sand-200 bg-warm-cream-50 px-3 py-2 text-sm text-charcoal-700 hover:border-coral-300 hover:bg-coral-50 hover:text-coral-700 transition"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function SourcesSection() {
  return (
    <section className="mb-8 text-xs text-charcoal-500">
      <p>
        Données ouvertes (CC-BY) : INSEE (recensement, SIRENE), Météo-France (normales 1991-2020),
        ADEME (RGE, DPE), ANAH (MaPrimeRénov&apos;), DVF (data.gouv.fr), Géorisques (BRGM). Dernière
        mise à jour : voir Schema.org Dataset ci-dessus.
      </p>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-charcoal-500">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-charcoal-900">{value}</dd>
    </div>
  )
}

function Risk({ label, status }: { label: string; status: string }) {
  return (
    <li className="flex items-start justify-between rounded-lg bg-warm-cream-50 px-3 py-2">
      <span className="text-sm font-medium text-charcoal-800">{label}</span>
      <span className="text-sm text-coral-700">{status}</span>
    </li>
  )
}

function buildPlaceSchema(commune: CommuneData, slug: string) {
  const url = `${SITE_URL}/communes/${slug}`
  return {
    '@context': 'https://schema.org',
    '@type': 'City',
    '@id': `${url}#place`,
    name: commune.name,
    url,
    identifier: commune.code_insee,
    ...(commune.description ? { description: commune.description } : {}),
    ...(commune.population ? { population: commune.population } : {}),
    ...(commune.code_postal
      ? {
          address: {
            '@type': 'PostalAddress',
            addressLocality: commune.name,
            postalCode: commune.code_postal,
            addressRegion: commune.departement_name ?? undefined,
            addressCountry: 'FR',
          },
        }
      : {}),
    ...(commune.latitude && commune.longitude
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: commune.latitude,
            longitude: commune.longitude,
          },
        }
      : {}),
    ...(commune.departement_name
      ? {
          containedInPlace: [
            {
              '@type': 'AdministrativeArea',
              name: commune.departement_name,
              identifier: commune.departement_code,
            },
            ...(commune.region_name
              ? [{ '@type': 'AdministrativeArea' as const, name: commune.region_name }]
              : []),
          ],
        }
      : {}),
  }
}

function buildDatasetSchema(commune: CommuneData, slug: string) {
  const url = `${SITE_URL}/communes/${slug}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': `${url}#dataset`,
    name: `Données locales — ${commune.name} (${commune.code_insee})`,
    description: `Données démographiques, climat, risques, marché immobilier et parc artisans pour la commune de ${commune.name}.`,
    url,
    license: 'https://creativecommons.org/licenses/by/4.0/',
    creator: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    isAccessibleForFree: true,
    keywords: [
      commune.name,
      commune.departement_name,
      commune.region_name,
      'INSEE',
      'ADEME',
      'Géorisques',
      'DVF',
      'rénovation énergétique',
      'artisans BTP',
    ].filter(Boolean),
    ...(commune.enriched_at ? { dateModified: commune.enriched_at } : {}),
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'text/html',
      contentUrl: url,
    },
  }
}

function guessNearestStaticVille(commune: CommuneData): string | null {
  // Even if commune has its own slug = ville statique, le redirect canonical
  // s'est déjà déclenché. Donc ici on est sur une commune long-tail. On
  // pointe les CTAs vers le chef-lieu de département (toujours dans /villes).
  const dept = commune.departement_code
  if (!dept) return null
  return getDepartementCapitalSlug(dept)
}

function getDepartementCapitalSlug(deptCode: string): string | null {
  // Best-effort : trouve la ville statique la plus peuplée de ce département.
  // Scan O(2 287) — acceptable au runtime ISR (cached 24h).
  const candidates = villesData.filter((v) => v.departementCode === deptCode)
  if (candidates.length === 0) return null
  const parsePop = (p: string) => parseInt(p.replace(/\s/g, ''), 10) || 0
  candidates.sort((a, b) => parsePop(b.population) - parsePop(a.population))
  return candidates[0]?.slug ?? null
}
