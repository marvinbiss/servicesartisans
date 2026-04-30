import type { Metadata } from 'next'
import Link from 'next/link'
import { Code2, Database, Key, Zap, Scale, FileJson, Mail, Github } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { SITE_URL, SITE_NAME, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'

/**
 * Hub développeurs — Sprint 0.4 (data.gouv.fr backbone).
 *
 * Page brouillon non câblée à un Swagger UI réel. Le YAML OpenAPI 3.1 vit
 * dans `docs/api/openapi-rge.yaml`. Activation Phase 1 :
 *   1. Servir le YAML statique via `/api/v1/openapi.yaml`
 *   2. Câbler swagger-ui-react ou rapidoc à `/developpeurs/console`
 *   3. Activer rate-limit Upstash sur `/api/v1/*`
 *   4. Repo public `marvinbiss/servicesartisans-api-examples` créé 2026-04-29
 */

export const revalidate = 86400

const canonicalUrl = `${SITE_URL}/developpeurs`

const ENDPOINTS: Array<{
  method: 'GET' | 'POST'
  path: string
  description: string
  auth: 'anonymous' | 'api-key'
}> = [
  {
    method: 'GET',
    path: '/api/v1/rge/lookup?siret={siret}',
    description: 'Récupère une fiche RGE par SIRET (14 chiffres)',
    auth: 'anonymous',
  },
  {
    method: 'GET',
    path: '/api/v1/rge/search?q={query}&service={service}&ville={ville}',
    description: 'Recherche paginée dans les artisans RGE',
    auth: 'anonymous',
  },
  {
    method: 'GET',
    path: '/api/v1/rge/dataset/latest',
    description: 'Redirige vers le dernier export CSV/JSON/Parquet',
    auth: 'anonymous',
  },
]

const RATE_LIMITS: Array<{ tier: string; quota: string; price: string }> = [
  { tier: 'Anonyme', quota: '1 000 req/jour', price: 'Gratuit' },
  { tier: 'API key', quota: '10 000 req/jour', price: '10 €/mois — usage commercial' },
  { tier: 'Enterprise', quota: 'Illimité (fair-use)', price: 'Sur devis — SLA 99,9 %' },
]

export async function generateMetadata(): Promise<Metadata> {
  const title = `API & Données ouvertes — ${SITE_NAME}`
  const description =
    'Hub développeurs : API publique RGE, dataset CC-BY 4.0, OpenAPI 3.1, exemples de code. Annuaire des artisans certifiés RGE de France, mis à jour mensuellement.'

  return {
    title,
    description,
    alternates: getAlternates('/developpeurs'),
    openGraph: {
      ...getOgDefaults(),
      title,
      description,
      type: 'website',
      url: canonicalUrl,
    },
  }
}

export default function DevelopersHubPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Développeurs', url: '/developpeurs' },
  ])

  const webApiSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebAPI',
    name: 'ServicesArtisans RGE API',
    description:
      "API publique permettant d'interroger l'annuaire des artisans certifiés RGE de France, sourcé data.gouv.fr / ADEME.",
    url: canonicalUrl,
    documentation: `${SITE_URL}/datasets/rge`,
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    license: 'https://creativecommons.org/licenses/by/4.0/',
    isAccessibleForFree: true,
    audience: {
      '@type': 'Audience',
      audienceType: 'Developers, data journalists, researchers',
    },
  }

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'API Données ouvertes RGE',
    serviceType: 'Open data API',
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: { '@type': 'Country', name: 'France' },
    offers: RATE_LIMITS.map((tier) => ({
      '@type': 'Offer',
      name: tier.tier,
      description: `${tier.quota} — ${tier.price}`,
    })),
  }

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={webApiSchema} />
      <JsonLd data={serviceSchema} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumb
          items={[{ label: 'Accueil', href: '/' }, { label: 'Développeurs' }]}
          className="mb-6"
        />

        <header className="mb-12">
          <h1
            data-speakable="true"
            className="text-3xl md:text-4xl font-bold text-charcoal-900 font-jakarta"
          >
            API &amp; Données ouvertes ServicesArtisans
          </h1>
          <p className="mt-4 text-lg text-charcoal-600 max-w-3xl">
            Construisez avec les données officielles des artisans certifiés RGE de France. Dataset
            complet sous licence Creative Commons, API REST documentée OpenAPI 3.1, mises à jour
            mensuelles automatiques.
          </p>
        </header>

        <section className="mb-12 grid gap-6 md:grid-cols-3">
          <Link
            href="/open-data"
            className="group rounded-2xl border border-sand-300 bg-sand-50 p-6 hover:border-clay-400 hover:bg-clay-50 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
          >
            <Database className="w-8 h-8 text-clay-500 mb-3" aria-hidden="true" />
            <h2 className="font-semibold text-charcoal-900 mb-1">Hub Open Data</h2>
            <p className="text-sm text-charcoal-600">
              Catalogue DCAT-AP : RGE + agrégats locaux. Licence Etalab 2.0.
            </p>
          </Link>

          <Link
            href="/datasets/rge"
            className="group rounded-2xl border border-sand-300 bg-sand-50 p-6 hover:border-clay-400 hover:bg-clay-50 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
          >
            <Database className="w-8 h-8 text-clay-500 mb-3" aria-hidden="true" />
            <h2 className="font-semibold text-charcoal-900 mb-1">Dataset RGE</h2>
            <p className="text-sm text-charcoal-600">
              CSV, JSON, Parquet. ~49 000 fiches. CC-BY 4.0. Mensuel.
            </p>
          </Link>

          <a
            href="/api/v1/openapi.yaml"
            className="group rounded-2xl border border-sand-300 bg-sand-50 p-6 hover:border-clay-400 hover:bg-clay-50 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
          >
            <FileJson className="w-8 h-8 text-clay-500 mb-3" aria-hidden="true" />
            <h2 className="font-semibold text-charcoal-900 mb-1">Spec OpenAPI 3.1</h2>
            <p className="text-sm text-charcoal-600">
              Schéma machine-readable. Génération clients. SDKs.
            </p>
          </a>

          <a
            href="https://github.com/marvinbiss/servicesartisans-api-examples"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-sand-300 bg-sand-50 p-6 hover:border-clay-400 hover:bg-clay-50 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
          >
            <Github className="w-8 h-8 text-clay-500 mb-3" aria-hidden="true" />
            <h2 className="font-semibold text-charcoal-900 mb-1">Exemples GitHub</h2>
            <p className="text-sm text-charcoal-600">
              Snippets Python, TypeScript, R, curl pour intégrer l&apos;API RGE.
            </p>
          </a>
        </section>

        <section aria-labelledby="endpoints" className="mb-12">
          <h2 id="endpoints" className="text-2xl font-bold text-charcoal-900 font-jakarta mb-4">
            Endpoints disponibles
          </h2>
          <div className="overflow-x-auto rounded-xl border border-sand-300">
            <table className="w-full text-sm">
              <caption className="sr-only">
                Endpoints de l'API RGE — méthode HTTP, chemin, description et niveau
                d'authentification requis
              </caption>
              <thead className="bg-sand-100 text-left">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Méthode
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Endpoint
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Description
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Auth
                  </th>
                </tr>
              </thead>
              <tbody>
                {ENDPOINTS.map((ep) => (
                  <tr key={ep.path} className="border-t border-sand-200">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-mono text-emerald-800">
                        {ep.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-charcoal-800">{ep.path}</td>
                    <td className="px-4 py-3 text-charcoal-600">{ep.description}</td>
                    <td className="px-4 py-3 text-xs text-charcoal-500">
                      {ep.auth === 'anonymous' ? 'Anonyme' : 'API key'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="auth" className="mb-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-sand-300 p-6">
            <Key className="w-8 h-8 text-clay-500 mb-3" aria-hidden="true" />
            <h2 id="auth" className="text-xl font-bold text-charcoal-900 font-jakarta mb-2">
              Authentification
            </h2>
            <p className="text-sm text-charcoal-600 mb-3">
              Accès anonyme par défaut. Pour 10 000 requêtes/jour ou usage commercial, demandez une
              clé API par email.
            </p>
            <pre className="rounded-md bg-charcoal-950 p-3 text-xs text-emerald-300 overflow-x-auto">
              {`curl -H "X-API-Key: sa_xxxxx" \\
  ${SITE_URL}/api/v1/rge/lookup?siret=12345678901234`}
            </pre>
          </div>

          <div className="rounded-2xl border border-sand-300 p-6">
            <Zap className="w-8 h-8 text-clay-500 mb-3" aria-hidden="true" />
            <h2 className="text-xl font-bold text-charcoal-900 font-jakarta mb-2">Rate limits</h2>
            <ul className="space-y-2 text-sm">
              {RATE_LIMITS.map((tier) => (
                <li
                  key={tier.tier}
                  className="flex items-baseline justify-between border-b border-sand-200 pb-2 last:border-0"
                >
                  <span className="font-semibold text-charcoal-900">{tier.tier}</span>
                  <span className="text-charcoal-600">{tier.quota}</span>
                  <span className="text-xs text-charcoal-500">{tier.price}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          aria-labelledby="license"
          className="mb-12 rounded-2xl border border-emerald-200 bg-emerald-50 p-6"
        >
          <Scale className="w-8 h-8 text-emerald-700 mb-3" aria-hidden="true" />
          <h2 id="license" className="text-xl font-bold text-charcoal-900 font-jakarta mb-2">
            Licence Creative Commons CC-BY 4.0
          </h2>
          <p className="text-sm text-charcoal-700 mb-3">
            Le dataset est mis à disposition sous licence{' '}
            <a
              href="https://creativecommons.org/licenses/by/4.0/deed.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-emerald-700"
            >
              Creative Commons Attribution 4.0
            </a>
            . Vous pouvez le copier, le modifier et le redistribuer librement, y compris à des fins
            commerciales, à condition de citer la source.
          </p>
          <p className="text-xs text-charcoal-600 font-mono bg-white rounded p-3 border border-emerald-200">
            Source : ServicesArtisans (servicesartisans.fr/datasets/rge), CC-BY 4.0, données ADEME /
            France Rénov&apos;
          </p>
        </section>

        <section
          aria-labelledby="contact"
          className="mb-12 rounded-2xl bg-charcoal-950 p-8 text-center text-white"
        >
          <Mail className="w-10 h-10 mx-auto mb-4 text-clay-400" aria-hidden="true" />
          <h2 id="contact" className="text-2xl font-bold mb-2 font-jakarta">
            Demande d&apos;API key ou support
          </h2>
          <p className="text-charcoal-300 mb-6 max-w-xl mx-auto">
            Newsletter tech mensuelle, alertes nouveautés API, support intégration.
          </p>
          <a
            href="mailto:api@servicesartisans.fr?subject=Demande%20API%20key%20RGE"
            className="inline-flex items-center gap-2 bg-clay-500 hover:bg-clay-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all"
          >
            <Code2 className="w-5 h-5" aria-hidden="true" />
            api@servicesartisans.fr
          </a>
        </section>
      </div>
    </div>
  )
}
