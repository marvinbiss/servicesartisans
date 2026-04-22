import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, ExternalLink, ShieldCheck, ArrowRight } from 'lucide-react'

import CeeCTA from '@/components/cee/CeeCTA'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { SITE_URL, getAlternates, getOgDefaults } from '@/lib/seo/config'
import {
  getBreadcrumbSchema,
  getFAQSchema,
  getFinancialProductSchema,
  getGovernmentServiceSchema,
} from '@/lib/seo/jsonld'
import { getCeeOperationByCode, getCeeOperations, CEE_DOMAINE_LABELS } from '@/lib/cee/catalogue'
import { getCeeTopCitiesByOperation } from '@/lib/cee/listings'
import {
  RGE_ALLOWED_SERVICES,
  RGE_QUALIFICATION_LABELS,
  type RgeAllowedService,
} from '@/lib/rge/service-city-listings'
import { hasCeeOperationGuide, CEE_CATALOG_UPDATED_AT } from '@/lib/cee/operation-guides-content'
import { services as servicesCatalog } from '@/lib/data/france-light'
import LastUpdated from '@/components/seo/LastUpdated'
import { ArticleMeta } from '@/components/ArticleMeta'

// Map slug → display name (e.g. "chauffagiste" → "Chauffagiste", "pompe-a-chaleur"
// → "Pompe à chaleur"). Utilise le catalogue des services si présent, fallback
// sur le label qualif pour les services spécialisés absents du catalogue grand
// public (renovation-energetique, etc.).
const SERVICE_DISPLAY_NAME: Record<string, string> = {
  ...Object.fromEntries(servicesCatalog.map((s) => [s.slug, s.name])),
  'pompe-a-chaleur': 'Pompe à chaleur',
  'panneaux-solaires': 'Panneaux solaires',
  'isolation-thermique': 'Isolation thermique',
  'renovation-energetique': 'Rénovation énergétique',
  zingueur: 'Zingueur',
  facadier: 'Façadier',
  platrier: 'Plâtrier',
  ramoneur: 'Ramoneur',
}

export const revalidate = 86400
export const dynamicParams = true

const VALID_OP = /^[A-Z]{2,3}-[A-Z]{2}-\d{3}$/i

export async function generateStaticParams(): Promise<Array<{ operation: string }>> {
  const operations = await getCeeOperations().catch(() => [])
  if (operations.length > 0) return operations.map((op) => ({ operation: op.code.toLowerCase() }))
  // Fallback au seed 383 si DB indisponible au build. Fiches abrogées
  // retirées : BAR-TH-106 (01/01/2024 → BAR-TH-171), BAR-TH-160 (01/08/2025),
  // BAR-TH-164 (→ BAR-TH-174). Ajouts : BAR-TH-172, 174, 175, 177.
  return [
    'BAR-EN-101',
    'BAR-EN-102',
    'BAR-EN-103',
    'BAR-EN-104',
    'BAR-EN-108',
    'BAR-TH-112',
    'BAR-TH-113',
    'BAR-TH-125',
    'BAR-TH-127',
    'BAR-TH-129',
    'BAR-TH-143',
    'BAR-TH-148',
    'BAR-TH-159',
    'BAR-TH-161',
    'BAR-TH-171',
    'BAR-TH-172',
    'BAR-TH-173',
    'BAR-TH-174',
    'BAR-TH-175',
    'BAR-TH-177',
    'BAR-SE-104',
  ].map((operation) => ({ operation: operation.toLowerCase() }))
}

interface PageProps {
  params: Promise<{ operation: string }>
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen - 1).replace(/\s+\S*$/, '') + '…'
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { operation: rawOp } = await params
  const opCode = rawOp.toUpperCase()
  if (!VALID_OP.test(opCode)) notFound()

  const operation = await getCeeOperationByCode(opCode)
  const opName = operation?.nom ?? `Prime CEE ${opCode}`
  const path = `/cee/${opCode.toLowerCase()}`

  const title = truncate(`Prime CEE ${opName} (${opCode}) — artisans RGE`, 60)
  const description = truncate(
    `${opName} : conditions, qualifications RGE requises, villes couvertes. Prime CEE mobilisable avec MaPrimeRénov’ et TVA 5,5 %.`,
    158
  )

  return {
    title,
    description,
    robots: operation
      ? {
          index: true,
          follow: true,
          'max-snippet': -1 as const,
          'max-image-preview': 'large' as const,
          'max-video-preview': -1 as const,
        }
      : { index: false, follow: true },
    openGraph: {
      ...getOgDefaults(),
      title,
      description,
      type: 'article',
      locale: 'fr_FR',
      url: `${SITE_URL}${path}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: getAlternates(path),
  }
}

export default async function CeeOperationHubPage({ params }: PageProps) {
  const { operation: rawOp } = await params
  const opCode = rawOp.toUpperCase()
  if (!VALID_OP.test(opCode)) notFound()

  const operation = await getCeeOperationByCode(opCode)
  const urlCode = opCode.toLowerCase()
  const path = `/cee/${urlCode}`

  if (!operation) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-charcoal-900 font-jakarta mb-4">
            Prime CEE {opCode}
          </h1>
          <ArticleMeta
            author="ServicesArtisans"
            datePublished="2026-01-15"
            className="justify-center mt-4"
          />
          <p className="text-charcoal-700">
            Cette opération n’est pas actuellement disponible dans notre catalogue.{' '}
            <Link href="/cee" className="text-emerald-700 underline">
              Voir toutes les primes CEE
            </Link>
            .
          </p>
        </div>
      </main>
    )
  }

  const [topCities, allOps] = await Promise.all([
    getCeeTopCitiesByOperation(opCode),
    getCeeOperations(),
  ])

  const sameDomain = allOps
    .filter((op) => op.domaine === operation.domaine && op.code !== operation.code)
    .slice(0, 6)

  const rgeServices: RgeAllowedService[] = (operation.services_slugs ?? []).filter(
    (slug): slug is RgeAllowedService => (RGE_ALLOWED_SERVICES as readonly string[]).includes(slug)
  )

  const hasGuide = hasCeeOperationGuide(opCode)

  const domaineInfo = CEE_DOMAINE_LABELS[operation.domaine]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Primes CEE', url: '/cee' },
    { name: operation.nom, url: path },
  ])

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    image: `${SITE_URL}/opengraph-image`,
    headline: `Prime CEE ${operation.nom} (${operation.code})`,
    description: `Prime CEE ${operation.nom} : conditions, qualifications RGE, villes couvertes.`,
    url: `${SITE_URL}${path}`,
    mainEntityOfPage: `${SITE_URL}${path}`,
    datePublished: '2026-01-15',
    dateModified: new Date().toISOString().slice(0, 10),
    author: { '@type': 'Organization', name: 'ServicesArtisans', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'ServicesArtisans', url: SITE_URL },
  }

  const officialSources: string[] = [
    'https://www.ecologie.gouv.fr/politiques-publiques/certificats-deconomies-denergie',
    'https://france-renov.gouv.fr/aides/cee',
  ]
  if (operation.url_fiche_officielle) officialSources.unshift(operation.url_fiche_officielle)

  const governmentServiceSchema = getGovernmentServiceSchema({
    name: `Prime CEE ${operation.code} — ${operation.nom}`,
    description: `Opération standardisée ${operation.code} du catalogue DGEC. Aide financière obligatoire versée par les vendeurs d'énergie (loi POPE 2005, période P6 2026-2030) pour les travaux ${operation.nom.toLowerCase()}.`,
    url: `${SITE_URL}${path}`,
    serviceType: 'Aide financière à la rénovation énergétique',
    audience: operation.precarite_eligible
      ? 'Propriétaires et locataires, bonification pour ménages en précarité énergétique'
      : 'Propriétaires et locataires de logements résidentiels',
    temporalCoverage: '2026-01-01/2030-12-31',
    sameAs: officialSources,
  })

  const financialProductSchema = getFinancialProductSchema({
    name: `Prime CEE ${operation.code}`,
    description:
      `Montant de prime ${operation.nom} variable selon la zone climatique, la surface ou la puissance installée, le profil de revenus (classique ou précarité) et le cours du MWh cumac. ${operation.classique_eligible ? 'Tous ménages éligibles.' : ''}${operation.precarite_eligible ? ' Bonification précarité disponible.' : ''}${operation.coup_de_pouce ? ' Coup de pouce actif.' : ''}`.trim(),
    url: `${SITE_URL}${path}`,
    category: 'Government Grant',
    feesAndCommissionsSpecification:
      "Prime versée par l'obligé ou le délégataire. Pas de frais à la charge du bénéficiaire. Cumulable avec MaPrimeRénov', TVA 5,5 % et éco-PTZ.",
  })

  // FAQ dynamique par opération CEE — rich snippet FAQ en SERP sur requêtes
  // type "prime CEE [operation] 2026". Questions générées depuis les metadata
  // catalogue DGEC : éligibilité (classique/précarité), qualification RGE,
  // cumul aides, coup de pouce, versement.
  const faqItems = [
    {
      question: `Qui peut bénéficier de la prime CEE ${operation.nom} (${operation.code}) ?`,
      answer:
        `Tous les propriétaires et locataires de logements résidentiels en France sont éligibles à la prime CEE ${operation.code}, sans condition de revenu de base. ${operation.precarite_eligible ? "Les ménages en situation de précarité énergétique (selon grille Anah) bénéficient d'une bonification pouvant doubler le montant." : ''} Les travaux doivent être réalisés par un artisan RGE certifié pour la qualification exigée par l'opération.`.trim(),
    },
    {
      question: `Quelle qualification RGE pour la prime CEE ${operation.code} ?`,
      answer: `L'artisan doit détenir une qualification RGE active à la date de signature du devis. Selon la nature des travaux ${operation.nom.toLowerCase()}, les certifications attendues sont Qualibat, QualiPAC, QualiBois ou Qualit'EnR selon le geste. Vérification possible sur france-renov.gouv.fr avec le SIREN de l'artisan. Une qualification expirée entre le devis et le chantier rend l'aide non-éligible.`,
    },
    {
      question: `Peut-on cumuler la prime CEE ${operation.code} avec MaPrimeRénov' ?`,
      answer:
        "Oui, la prime CEE se cumule avec MaPrimeRénov' (Anah), la TVA 5,5 % et l'éco-PTZ, dans la limite de 100 % du coût TTC des travaux. Le cumul est rarement plafonnant sauf pour les ménages très modestes sur des opérations fortement bonifiées. Chaque aide a ses propres conditions : MPR nécessite un dépôt de dossier AVANT signature du devis, la CEE accepte un dépôt jusqu'à 6 mois après la fin des travaux.",
    },
    {
      question: `Quel est le montant de la prime CEE ${operation.nom} en 2026 ?`,
      answer:
        `Le montant dépend de 3 variables : la zone climatique (H1/H2/H3), le volume d'énergie économisée (kWh cumac) et le cours du marché CEE (P6 ~7,5 € / MWh cumac en 2026). ${operation.coup_de_pouce ? "Cette opération bénéficie d'un 'Coup de pouce' avec bonification supplémentaire." : ''} Utilisez le simulateur ServicesArtisans pour obtenir une estimation personnalisée en fonction de votre logement.`.trim(),
    },
    {
      question: `Comment toucher la prime CEE ${operation.code} ?`,
      answer:
        "1) Choisir l'obligé ou le délégataire AVANT signature du devis (EDF, Engie, TotalEnergies, Sonergia, etc.). 2) Faire signer la convention de mandat. 3) Artisan RGE réalise les travaux. 4) Déposer la facture dans les 6 mois. 5) Versement par virement en 2 à 8 semaines. Choix possible entre prime en euros, chèque bancaire ou bon d'achat selon l'obligé.",
    },
  ]
  const faqSchema = getFAQSchema(faqItems)

  const jsonLdItems: Record<string, unknown>[] = [
    breadcrumbSchema,
    articleSchema,
    governmentServiceSchema as Record<string, unknown>,
    financialProductSchema as Record<string, unknown>,
  ]
  if (faqSchema) jsonLdItems.push(faqSchema as Record<string, unknown>)

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={jsonLdItems} />

      <Breadcrumb items={[{ label: 'Primes CEE', href: '/cee' }, { label: operation.nom }]} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-charcoal-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-5">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span className="text-sm font-medium text-emerald-100">
              Fiche officielle DGEC {operation.code}
            </span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Prime CEE : {operation.nom}
          </h1>
          <p className="text-lg text-emerald-50/90 max-w-3xl leading-relaxed">
            Domaine{' '}
            <strong className="text-white">{domaineInfo?.label || operation.domaine}</strong>
            {operation.sous_domaine ? ` — ${operation.sous_domaine.replace(/_/g, ' ')}` : ''}.
            Opération standardisée résidentielle éligible aux Certificats d’Économies d’Énergie,
            sous conditions de qualification RGE de l’entreprise.
          </p>
          {/* Freshness signal — révision éditoriale des barèmes. TODO : brancher
              sur cee_operations.updated_at dès la persistance DGEC automatisée. */}
          <LastUpdated
            label="Barèmes CEE vérifiés le"
            date={CEE_CATALOG_UPDATED_AT}
            className="mt-5 text-emerald-100/90"
          />
        </div>
      </section>

      {/* Explication complète */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-6">
          Comprendre l’opération {operation.code}
        </h2>
        <div className="prose prose-emerald max-w-none text-charcoal-700 leading-relaxed space-y-4">
          <p>
            La fiche d’opération standardisée <strong>{operation.code}</strong> encadre les travaux
            de <strong>{operation.nom.toLowerCase()}</strong> dans le secteur résidentiel. Publiée
            par la Direction Générale de l’Énergie et du Climat (DGEC) dans le cadre du dispositif
            des Certificats d’Économies d’Énergie, elle fixe les exigences techniques minimales à
            respecter pour qu’un chantier soit valorisé en prime CEE.
          </p>
          <p>
            La prime est versée par un obligé ou délégataire (Effy, Sonergia, TotalEnergies, EDF,
            Engie, etc.) qui achète en retour des certificats auprès du Pôle National des
            Certificats d’Économies d’Énergie (PNCEE). Le cours de la prime évolue chaque semaine
            selon l’offre et la demande, c’est pourquoi nous recommandons toujours de comparer au
            moins trois devis d’artisans RGE avant de signer.
          </p>
        </div>

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 text-sm mt-8 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6">
          <div>
            <dt className="font-semibold text-charcoal-900">Code officiel</dt>
            <dd className="text-charcoal-700">{operation.code}</dd>
          </div>
          <div>
            <dt className="font-semibold text-charcoal-900">Secteur</dt>
            <dd className="text-charcoal-700">Résidentiel</dd>
          </div>
          <div>
            <dt className="font-semibold text-charcoal-900">Domaine</dt>
            <dd className="text-charcoal-700">{domaineInfo?.label || operation.domaine}</dd>
          </div>
          {operation.unite_mesure && (
            <div>
              <dt className="font-semibold text-charcoal-900">Unité de mesure</dt>
              <dd className="text-charcoal-700">{operation.unite_mesure}</dd>
            </div>
          )}
          <div>
            <dt className="font-semibold text-charcoal-900">Qualifications RGE requises</dt>
            <dd className="text-charcoal-700">
              {operation.rge_qualifications_requises.join(', ') || 'Qualibat RGE'}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-charcoal-900">Éligibilité</dt>
            <dd className="text-charcoal-700">
              {operation.classique_eligible && 'Tous ménages'}
              {operation.classique_eligible && operation.precarite_eligible && ' + '}
              {operation.precarite_eligible && 'Bonifié précarité énergétique'}
            </dd>
          </div>
          {operation.coup_de_pouce && (
            <div className="md:col-span-2">
              <dt className="font-semibold text-emerald-800">Coup de pouce actif</dt>
              <dd className="text-emerald-700">
                {operation.coup_de_pouce_charte || 'Bonification obligé'}
              </dd>
            </div>
          )}
        </dl>

        {hasGuide && (
          <div className="mt-8 rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-white p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">
                Guide détaillé
              </div>
              <div className="font-bold text-charcoal-900 text-lg">
                Tout savoir sur la prime CEE {operation.code}
              </div>
              <div className="text-sm text-charcoal-600 mt-1">
                Conditions techniques, montants 2026, cumul MaPrimeRénov’ et pièges à éviter.
              </div>
            </div>
            <Link
              href={`/cee/${urlCode}/guide`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition whitespace-nowrap"
            >
              Lire le guide
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        )}

        {operation.url_fiche_officielle && (
          <p className="mt-6">
            <a
              href={operation.url_fiche_officielle}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-emerald-700 font-semibold hover:text-emerald-900"
            >
              Consulter la fiche officielle DGEC
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
          </p>
        )}
      </section>

      {/* CTA inline après description */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-8">
        <CeeCTA variant="inline" operationCode={operation.code} serviceSlug={rgeServices[0]} />
      </div>

      {/* Métiers RGE qualifiés */}
      {rgeServices.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-4">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-3">
            Métiers RGE qualifiés pour cette opération
          </h2>
          <p className="text-charcoal-600 max-w-3xl mb-6 leading-relaxed">
            Seuls les artisans titulaires d’une qualification RGE active peuvent déclencher la prime
            CEE {operation.code}. Voici les métiers concernés&nbsp;:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rgeServices.map((slug) => {
              const meta = RGE_QUALIFICATION_LABELS[slug]
              // Anchor text : "Artisans RGE [Service]" — nom propre du
              // catalogue, pluriel naturel, accents préservés. Beaucoup plus
              // propre que `slug.replace(/-/g, ' ')` (ex: "pompe a chaleur"
              // perdait l'accent) et que `meta.specifics` truncated (coupait
              // mi-phrase sur 5 métiers sur 14).
              const displayName =
                SERVICE_DISPLAY_NAME[slug] ??
                slug
                  .split('-')
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(' ')
              return (
                <Link
                  key={slug}
                  href={`/rge/${slug}`}
                  className="group flex items-start gap-3 p-4 bg-white rounded-xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-sm transition"
                >
                  <ShieldCheck
                    className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-charcoal-900 group-hover:text-emerald-700 transition">
                      Artisans RGE {displayName.toLowerCase()}
                    </div>
                    {meta && (
                      <div className="text-xs text-charcoal-900 mt-0.5">
                        {meta.label} — {meta.organisme}
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Top villes */}
      {topCities.length > 0 && (
        <section className="bg-sand-50 border-y border-charcoal-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-3">
              Où trouver un artisan RGE qualifié
            </h2>
            <p className="text-charcoal-600 max-w-3xl mb-8 leading-relaxed">
              Classement des villes françaises où notre annuaire recense le plus d’artisans RGE
              qualifiés pour l’opération {operation.code}.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {topCities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/cee/${urlCode}/${city.slug}`}
                  className="group flex items-center justify-between p-4 bg-white rounded-xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-sm transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" aria-hidden="true" />
                    <span className="font-semibold text-charcoal-900 group-hover:text-emerald-700 transition truncate">
                      {city.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-charcoal-900 tabular-nums ml-2">
                    {city.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Opérations du même domaine */}
      {sameDomain.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-6">
            Autres primes CEE — {domaineInfo?.label.toLowerCase() || operation.domaine}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sameDomain.map((op) => (
              <Link
                key={op.code}
                href={`/cee/${op.code.toLowerCase()}`}
                className="group block p-5 bg-white rounded-xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-md transition"
              >
                <div className="text-xs font-semibold text-emerald-700">{op.code}</div>
                <div className="font-bold text-charcoal-900 text-lg mt-1 group-hover:text-emerald-700 transition">
                  {op.nom}
                </div>
                <div className="text-sm font-semibold text-emerald-700 mt-3 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Découvrir <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTAs */}
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold mb-3">
            Obtenez votre prime CEE {operation.code}
          </h2>
          <p className="text-emerald-100 max-w-2xl mx-auto mb-6 leading-relaxed">
            Demandez un devis gratuit auprès d’un artisan RGE qualifié et sécurisez votre prime CEE
            dès la signature.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50 transition"
            >
              Demander un devis gratuit
            </Link>
            <Link
              href="/cee"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
            >
              Toutes les primes CEE
            </Link>
          </div>
        </div>
      </section>
      {/* Sticky bottom mobile */}
      <CeeCTA variant="sticky-bottom" operationCode={operation.code} serviceSlug={rgeServices[0]} />
    </main>
  )
}
