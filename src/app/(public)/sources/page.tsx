import { Metadata } from 'next'
import Link from 'next/link'
import {
  Database,
  ExternalLink,
  ShieldCheck,
  Building2,
  Flame,
  FileSearch,
  Home,
  CloudSun,
  AlertTriangle,
  BarChart3,
  ArrowRight,
} from 'lucide-react'
import { Breadcrumb } from '@/components/seo/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { SITE_URL, getAlternates } from '@/lib/seo/config'

export const revalidate = 3600

const path = '/sources'

export const metadata: Metadata = {
  title: 'Sources de données officielles | ServicesArtisans',
  description:
    'Sources de données officielles de ServicesArtisans : INSEE, ADEME, SIRENE, DVF Etalab, Open-Meteo, Géorisques, SDES. Transparence, fiabilité.',
  alternates: getAlternates(path),
  openGraph: {
    title: 'Sources de données officielles | ServicesArtisans',
    description:
      'Découvrez les sources officielles qui alimentent ServicesArtisans : données publiques, vérifiées et mises à jour régulièrement.',
    url: `${SITE_URL}${path}`,
    type: 'website',
    locale: 'fr_FR',
  },
}

const SOURCES = [
  {
    name: 'INSEE',
    icon: Building2,
    url: 'https://www.insee.fr/fr/information/2410988',
    description:
      "L'Institut national de la statistique et des études économiques publie les données démographiques, économiques et sociales de la France. Ses bases sont la référence pour toute analyse territoriale.",
    usage:
      'Données démographiques par commune (population, densité), revenus médians des ménages, parc de logements (ancienneté, type, surface), données économiques locales.',
    license: 'Licence Ouverte Etalab 2.0',
  },
  {
    name: 'ADEME',
    icon: Flame,
    url: 'https://data.ademe.fr/',
    description:
      "L'Agence de la transition écologique publie en open data la base RGE (artisans qualifiés pour la rénovation énergétique), les diagnostics de performance énergétique (DPE) et les données relatives à MaPrimeRénov'.",
    usage:
      "Base RGE pour identifier les artisans certifiés, données DPE pour les statistiques énergétiques par commune, montants et conditions MaPrimeRénov' pour les guides d'aides.",
    license: 'Licence Ouverte Etalab 2.0',
  },
  {
    name: 'API SIRENE / data.gouv.fr',
    icon: FileSearch,
    url: 'https://www.data.gouv.fr/fr/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret/',
    description:
      "Le répertoire SIRENE de l'INSEE, accessible via l'API SIRENE et data.gouv.fr, recense l'ensemble des entreprises et établissements français avec leur numéro SIRET, adresse, code NAF et statut.",
    usage:
      "Vérification de l'existence et de l'activité des artisans référencés (SIRET valide, code APE cohérent avec le métier déclaré, adresse de l'établissement).",
    license: 'Licence Ouverte Etalab 2.0',
  },
  {
    name: 'DVF Etalab',
    icon: Home,
    url: 'https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres/',
    description:
      "La base « Demandes de valeurs foncières » recense l'ensemble des transactions immobilières publiées par la DGFiP. Elle permet de connaître les prix de vente réels, commune par commune.",
    usage:
      'Prix immobiliers au m² par commune et par type de bien, évolution des prix sur plusieurs années, contextualisation du marché local pour les travaux de rénovation.',
    license: 'Licence Ouverte Etalab 2.0',
  },
  {
    name: 'Open-Meteo',
    icon: CloudSun,
    url: 'https://open-meteo.com/',
    description:
      "Open-Meteo fournit des données météorologiques historiques et prévisionnelles en accès libre, avec une granularité communale. L'API couvre les températures, précipitations, gel, ensoleillement et vent.",
    usage:
      'Données climatiques par commune pour contextualiser les travaux saisonniers (gel pour la plomberie, canicule pour la climatisation, précipitations pour la toiture), calendrier des travaux.',
    license: 'CC BY 4.0',
  },
  {
    name: 'Géorisques (BRGM)',
    icon: AlertTriangle,
    url: 'https://www.georisques.gouv.fr/',
    description:
      "Géorisques, opéré par le BRGM pour le compte du Ministère de la Transition écologique, centralise les données sur les risques naturels et technologiques à l'échelle communale.",
    usage:
      "Risques naturels par commune (retrait-gonflement des argiles, sismicité, radon, inondation, arrêtés de catastrophe naturelle) pour les recommandations de travaux préventifs et l'information des propriétaires.",
    license: 'Licence Ouverte Etalab 2.0',
  },
  {
    name: 'SDES (Ministère de la Transition écologique)',
    icon: BarChart3,
    url: 'https://www.statistiques.developpement-durable.gouv.fr/',
    description:
      "Le Service des données et études statistiques publie les chiffres officiels sur l'énergie, le logement, la rénovation et les émissions de CO₂ en France.",
    usage:
      "Statistiques nationales et régionales sur la consommation d'énergie des bâtiments, taux de rénovation, mix énergétique, pour alimenter nos guides et baromètres.",
    license: 'Licence Ouverte Etalab 2.0',
  },
]

export default function SourcesPage() {
  const breadcrumbItems = [{ label: 'Sources de données' }]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: SITE_URL },
    { name: 'Sources de données', url: `${SITE_URL}${path}` },
  ])

  return (
    <>
      <JsonLd data={breadcrumbSchema} />

      <div className="bg-sand-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Breadcrumb items={breadcrumbItems} className="mb-6" />

          <header className="mb-12">
            <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-full px-4 py-1.5 mb-5">
              <ShieldCheck className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">Transparence E-E-A-T</span>
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal-900 mb-4">
              Sources de données officielles
            </h1>
            <p className="text-charcoal-600 text-lg max-w-3xl leading-relaxed">
              ServicesArtisans s&apos;appuie exclusivement sur des sources publiques et officielles
              pour garantir la fiabilité des informations affichées. Voici la liste complète des
              bases de données que nous utilisons, avec leur usage précis et le lien vers la source
              originale.
            </p>
          </header>

          <div className="space-y-6">
            {SOURCES.map((source) => {
              const Icon = source.icon
              return (
                <article
                  key={source.name}
                  className="bg-white rounded-xl border border-sand-200 p-6 hover:border-primary-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-heading text-xl font-semibold text-charcoal-900 mb-2">
                        {source.name}
                      </h2>
                      <p className="text-charcoal-600 leading-relaxed mb-3">{source.description}</p>
                      <div className="bg-sand-50 rounded-lg p-4 mb-3">
                        <p className="text-sm font-semibold text-charcoal-700 mb-1">
                          Ce que nous utilisons :
                        </p>
                        <p className="text-sm text-charcoal-600 leading-relaxed">{source.usage}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="text-charcoal-500">
                          Licence :{' '}
                          <span className="font-medium text-charcoal-700">{source.license}</span>
                        </span>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="inline-flex items-center gap-1 font-semibold text-primary-600 hover:text-primary-800 transition-colors"
                        >
                          Consulter la source
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          <section className="mt-12 bg-white rounded-xl border border-sand-200 p-8">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-primary-600" />
              <h2 className="font-heading text-xl font-semibold text-charcoal-900">
                Notre engagement de transparence
              </h2>
            </div>
            <p className="text-charcoal-600 leading-relaxed mb-6">
              Toutes les données affichées sur ServicesArtisans proviennent de sources publiques et
              vérifiables. Nous ne fabriquons aucune donnée. Lorsqu&apos;une information n&apos;est
              pas disponible pour une commune, nous l&apos;indiquons clairement plutôt que
              d&apos;afficher une estimation non sourcée.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/methodologie"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
              >
                Notre méthodologie
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/equipe"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-sand-300 text-charcoal-700 font-semibold hover:bg-sand-100 transition-colors"
              >
                Notre équipe
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
