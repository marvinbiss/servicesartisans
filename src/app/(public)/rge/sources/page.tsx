import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ShieldCheck,
  Database,
  RefreshCw,
  ExternalLink,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'

export const revalidate = 86400

const path = '/rge/sources'

export const metadata: Metadata = {
  title: 'Sources et m\u00e9thodologie RGE — annuaire ServicesArtisans',
  description:
    "Comment nous construisons l'annuaire RGE : sources officielles ADEME, Qualit'EnR, Qualifelec, Qualibat, fr\u00e9quence de mise \u00e0 jour et process de v\u00e9rification des qualifications.",
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1 as const,
    'max-image-preview': 'large' as const,
    'max-video-preview': -1 as const,
  },
  openGraph: {
    title: 'Sources et m\u00e9thodologie RGE',
    description:
      'Sources officielles, fr\u00e9quence de mise \u00e0 jour et process de v\u00e9rification des qualifications RGE affich\u00e9es sur ServicesArtisans.',
    type: 'article',
    locale: 'fr_FR',
    url: `${SITE_URL}${path}`,
  },
  alternates: getAlternates(path),
}

const OFFICIAL_SOURCES = [
  {
    name: 'ADEME — Open Data Annuaire RGE',
    url: 'https://data.ademe.fr/datasets/liste-des-entreprises-rge-2',
    role: 'Source ma\u00eetresse',
    description:
      "Base officielle publi\u00e9e par l'ADEME sous licence Etalab 2.0. Contient toutes les entreprises titulaires d'une qualification RGE active (SIRET, raison sociale, adresse, organisme, num\u00e9ro de certificat, date de validit\u00e9, domaines de travaux).",
    frequency: 'Sync hebdomadaire automatis\u00e9e (dimanche nuit)',
    license: 'Licence Ouverte Etalab 2.0',
  },
  {
    name: "Qualit'EnR",
    url: 'https://www.qualit-enr.org/annuaire/',
    role: 'Organisme certificateur',
    description:
      "Association loi 1901 accr\u00e9dit\u00e9e COFRAC. D\u00e9livre QualiPAC, QualiSol, QualiBois, QualiPV et Chauffage+. Son annuaire public sert \u00e0 v\u00e9rifier en temps r\u00e9el qu'une qualification est active, suspendue ou retir\u00e9e.",
    frequency: 'V\u00e9rification ponctuelle cas par cas',
    license: 'Site officiel (consultation)',
  },
  {
    name: 'Qualifelec',
    url: 'https://www.qualifelec.fr/annuaire/',
    role: 'Organisme certificateur',
    description:
      "Organisme historique (1955) de qualification des entreprises d'\u00e9lectricit\u00e9. D\u00e9livre les mentions RGE PV (photovolta\u00efque), SER (\u00e9nergies renouvelables) et IRVE (bornes de recharge).",
    frequency: 'V\u00e9rification ponctuelle cas par cas',
    license: 'Site officiel (consultation)',
  },
  {
    name: 'Qualibat',
    url: 'https://www.qualibat.com/rechercher-entreprise/',
    role: 'Organisme certificateur',
    description:
      'Premier organisme de qualification du b\u00e2timent en France. D\u00e9livre les qualifications RGE \u00e9quivalentes (5911, 7131, 7141, 8621, etc.) reconnues par MaPrimeR\u00e9nov\u2019 et les obligés CEE.',
    frequency: 'V\u00e9rification ponctuelle cas par cas',
    license: 'Site officiel (consultation)',
  },
  {
    name: 'France R\u00e9nov\u2019',
    url: 'https://france-renov.gouv.fr/annuaire-rge',
    role: 'Source officielle d\u2019\u00c9tat',
    description:
      "Annuaire officiel unifi\u00e9 publi\u00e9 par le Minist\u00e8re de la Transition \u00c9cologique. Consolide les donn\u00e9es Qualit'EnR, Qualifelec, Qualibat et C\u00e9quami. C'est la r\u00e9f\u00e9rence op\u00e9rationnelle pour les dossiers MaPrimeR\u00e9nov\u2019.",
    frequency: 'Mise \u00e0 jour quotidienne',
    license: 'Site officiel (consultation)',
  },
  {
    name: 'DGEC — Arr\u00eat\u00e9 du 22 d\u00e9cembre 2014 modifi\u00e9',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000029999204',
    role: 'Texte de r\u00e9f\u00e9rence r\u00e9glementaire',
    description:
      'Arr\u00eat\u00e9 fondateur du catalogue CEE r\u00e9sidentiel (op\u00e9rations BAR-*). D\u00e9finit les conditions techniques, les forfaits kWh cumac et les qualifications RGE exigibles pour chaque fiche.',
    frequency: 'Consolidation L\u00e9gifrance continue',
    license: 'Domaine public',
  },
]

const UPDATE_CADENCE = [
  {
    what: 'Sync ADEME',
    when: 'Hebdomadaire (dimanche 02h00)',
    how: 'Cron Vercel → ingestion CSV officiel → diff sur SIRET + num\u00e9ro de certificat → upsert providers',
  },
  {
    what: 'D\u00e9tection des qualifications expir\u00e9es',
    when: 'Quotidienne',
    how: 'Job nocturne qui passe en statut inactif toute qualification dont la date de validit\u00e9 est d\u00e9pass\u00e9e',
  },
  {
    what: 'Signalement par un utilisateur',
    when: 'Traitement sous 48h ouvr\u00e9es',
    how: "Formulaire de signalement + v\u00e9rification manuelle sur france-renov.gouv.fr et l'organisme concern\u00e9",
  },
  {
    what: 'R\u00e9vision \u00e9ditoriale des guides',
    when: 'Trimestrielle ou \u00e0 chaque \u00e9volution r\u00e9glementaire',
    how: 'Relecture crois\u00e9e des montants MaPrimeR\u00e9nov\u2019 et des bonifi\u00e9s CEE apr\u00e8s publication au JO',
  },
]

const VERIFICATION_STEPS = [
  "Identifier le SIRET de l'entreprise sur son devis (14 chiffres, distinct du SIREN 9 chiffres).",
  'Consulter france-renov.gouv.fr/annuaire-rge et saisir le SIRET (jamais le nom commercial, trop impr\u00e9cis).',
  'V\u00e9rifier que la qualification correspond exactement aux travaux \u00e0 r\u00e9aliser (exemple : QualiBois Eau pour une chaudi\u00e8re biomasse, pas QualiBois Air).',
  "Contr\u00f4ler la date de validit\u00e9 : elle doit \u00eatre post\u00e9rieure \u00e0 la date de signature du devis. Une qualification expir\u00e9e apr\u00e8s signature reste valable, mais l'inverse est un refus CEE syst\u00e9matique.",
  "Demander l'attestation nominative dat\u00e9e \u00e9mise par l'organisme certificateur (Qualit'EnR, Qualifelec, Qualibat). Un logo sur un site web n'a aucune valeur probante.",
]

export default function RgeSourcesPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Artisans RGE', url: '/rge' },
    { name: 'Sources et m\u00e9thodologie', url: path },
  ])

  const techArticleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Sources et m\u00e9thodologie RGE — ServicesArtisans',
    url: `${SITE_URL}${path}`,
    inLanguage: 'fr-FR',
    author: { '@type': 'Organization', name: 'ServicesArtisans' },
    publisher: { '@type': 'Organization', name: 'ServicesArtisans' },
    dateModified: '2026-04-09',
    description:
      "M\u00e9thodologie de construction de l'annuaire RGE de ServicesArtisans : sources officielles ADEME, Qualit'EnR, Qualifelec, Qualibat, France R\u00e9nov\u2019, fr\u00e9quence de mise \u00e0 jour et process de v\u00e9rification.",
    about: OFFICIAL_SOURCES.map((s) => ({ '@type': 'Thing', name: s.name, url: s.url })),
  }

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={techArticleSchema} />

      <Breadcrumb
        items={[{ label: 'Artisans RGE', href: '/rge' }, { label: 'Sources et m\u00e9thodologie' }]}
      />

      <section className="bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-emerald-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-5">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span className="text-sm font-medium text-emerald-100">
              Transparence éditoriale E-E-A-T
            </span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Sources et méthodologie RGE
          </h1>
          <p className="text-lg text-emerald-50/90 max-w-3xl leading-relaxed">
            D’où proviennent les données RGE affichées sur ServicesArtisans, à quelle fréquence
            elles sont mises à jour et comment vérifier vous-même la qualification d’un artisan
            auprès des organismes officiels.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center gap-2 mb-6">
          <Database className="w-5 h-5 text-emerald-700" aria-hidden="true" />
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900">
            Sources officielles mobilisées
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {OFFICIAL_SOURCES.map((src) => (
            <article
              key={src.name}
              className="p-6 bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-400 transition"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-700">
                  {src.role}
                </span>
              </div>
              <h3 className="font-heading font-bold text-lg text-charcoal-900 leading-snug">
                {src.name}
              </h3>
              <p className="text-sm text-charcoal-600 mt-2 leading-relaxed">{src.description}</p>
              <dl className="mt-4 text-xs text-charcoal-900 space-y-1">
                <div>
                  <dt className="inline font-semibold text-charcoal-700">Mise à jour&nbsp;: </dt>
                  <dd className="inline">{src.frequency}</dd>
                </div>
                <div>
                  <dt className="inline font-semibold text-charcoal-700">Licence&nbsp;: </dt>
                  <dd className="inline">{src.license}</dd>
                </div>
              </dl>
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-900 transition"
              >
                Consulter la source
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-sand-50 border-y border-charcoal-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-2 mb-6">
            <RefreshCw className="w-5 h-5 text-emerald-700" aria-hidden="true" />
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900">
              Cadence de mise à jour
            </h2>
          </div>
          <div className="overflow-hidden rounded-2xl border border-charcoal-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-sand-200 text-charcoal-700">
                <tr>
                  <th className="text-left p-4 font-semibold">Opération</th>
                  <th className="text-left p-4 font-semibold">Fréquence</th>
                  <th className="text-left p-4 font-semibold">Mécanisme</th>
                </tr>
              </thead>
              <tbody>
                {UPDATE_CADENCE.map((row) => (
                  <tr key={row.what} className="border-t border-charcoal-100">
                    <td className="p-4 font-semibold text-charcoal-900 align-top">{row.what}</td>
                    <td className="p-4 text-charcoal-700 align-top">{row.when}</td>
                    <td className="p-4 text-charcoal-600 align-top">{row.how}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center gap-2 mb-6">
          <FileCheck2 className="w-5 h-5 text-emerald-700" aria-hidden="true" />
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900">
            Vérifier vous-même une qualification RGE
          </h2>
        </div>
        <p className="text-charcoal-600 max-w-3xl mb-6 leading-relaxed">
          Avant de signer un devis, vérifiez la qualification de l’artisan auprès des organismes
          officiels. C’est la seule garantie d’éligibilité aux primes CEE et à MaPrimeRénov’.
        </p>
        <ol className="space-y-3 list-decimal pl-6 marker:text-emerald-600 marker:font-bold">
          {VERIFICATION_STEPS.map((step, i) => (
            <li key={i} className="text-charcoal-700 leading-relaxed">
              {step}
            </li>
          ))}
        </ol>
        <div className="mt-8 p-5 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
          <AlertTriangle
            className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div>
            <h3 className="font-semibold text-amber-900 mb-1">
              Signalement d’une donnée incorrecte
            </h3>
            <p className="text-sm text-amber-900/90 leading-relaxed">
              Si vous constatez qu’une qualification affichée sur ServicesArtisans ne correspond
              plus à la réalité (expiration, suspension, retrait), contactez-nous. Nous vérifions
              chaque signalement sous 48&nbsp;heures ouvrées et mettons à jour la fiche concernée.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold mb-3">
            Explorer l’annuaire RGE
          </h2>
          <p className="text-emerald-100 max-w-2xl mx-auto mb-6 leading-relaxed">
            Consultez les artisans RGE qualifiés par métier et par ville, ou approfondissez votre
            connaissance des qualifications officielles.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/rge"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50 transition"
            >
              Annuaire artisans RGE
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/rge/qualifications"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-300/50 bg-emerald-800/40 text-white font-semibold hover:bg-emerald-800/60 transition"
            >
              Guides qualifications RGE
            </Link>
            <Link
              href="/cee"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-300/50 bg-emerald-800/40 text-white font-semibold hover:bg-emerald-800/60 transition"
            >
              Primes CEE 2026
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
