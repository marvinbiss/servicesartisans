import type { Metadata } from 'next'
import Link from 'next/link'
import { Award, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'qualipac-signification-obtenir'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Jean-Pierre Duval'

export const revalidate = 86400

const TITLE = 'QualiPAC : signification et obtention'
const DESCRIPTION =
  'QualiPAC : signification, conditions, audit Qualit’EnR, durée 4 ans, prix 800-1 400 €, obligatoire pour MaPrimeRénov’ pompe à chaleur.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: getAlternates(`/guides/${SLUG}`),
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'article',
    siteName: SITE_NAME,
    publishedTime: PUBLISHED,
    modifiedTime: MODIFIED,
    authors: [`${SITE_URL}/equipe/jean-pierre-duval`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'QualiPAC = qualification RGE pour installation de pompes à chaleur. Délivrée par Qualit’EnR.',
  'Obligatoire pour que le client touche MaPrimeRénov’ et Coup de pouce CEE sur pompe à chaleur.',
  'Durée 4 ans, renouvelable. Coût : 800-1 400 € HT + formation 350-800 € + audit chantier 500-900 €.',
  'Conditions : entreprise active >2 ans, référent technique formé, 2 chantiers de référence vérifiés.',
  'Sous-ensembles : CET (chauffe-eau thermo), PAC air-eau, PAC eau-eau, PAC géothermique.',
]

const faqs = [
  {
    question: 'Que signifie QualiPAC ?',
    answer:
      "QualiPAC = qualification professionnelle délivrée par l'organisme Qualit'EnR (reconnue RGE par l'État), attestant que l'artisan est compétent pour installer des pompes à chaleur selon les normes techniques et réglementaires. Reconnaissance obligatoire pour ouvrir droit aux aides : MaPrimeRénov' PAC (4 000-11 000 €), Coup de pouce CEE chauffage (4-5 500 €), TVA 5,5 % pose. Sans QualiPAC, l'installateur peut poser une PAC mais le client perd toutes les aides.",
  },
  {
    question: 'Quelles sont les conditions pour obtenir QualiPAC ?',
    answer:
      "5 conditions : (1) entreprise active depuis >2 ans (SIRET actif), (2) assurance RC pro + décennale en cours, (3) référent technique formé (formation 3-5 jours, 350-800 €, via organisme agréé), (4) 2 chantiers de référence audités par Qualit'EnR (visite terrain, vérification facture, interview client), (5) moyens matériels adaptés (outillage frigoriste, fluide, système récupération F-Gas). Durée obtention : 4-8 mois entre formation et délivrance.",
  },
  {
    question: 'Combien coûte la qualification QualiPAC ?',
    answer:
      "Coûts 2026 pour entreprise 1-5 salariés : formation référent technique 350-800 €, audit chantier Qualit'EnR 500-900 €, droits d'inscription/suivi 800-1 400 € HT (valable 4 ans), renouvellement tous les 4 ans. Total démarche initiale : 1 650-3 100 € HT. Investissement largement rentabilisé dès les 2-3 premiers chantiers PAC réalisés (marge 2 000-4 000 € par installation).",
  },
  {
    question: 'Comment vérifier qu’un artisan a bien QualiPAC ?',
    answer:
      "Site officiel : qualit-enr.org. Moteur de recherche par département ou par SIRET. Afficher la fiche entreprise : n° qualification, sous-ensembles, validité. À vérifier systématiquement AVANT signature devis PAC. Le logo QualiPAC doit apparaître sur devis et facture (arrêté 24 décembre 2021). Si l'entreprise revendique sans être dans la base : fraude, ne pas signer. Les obligés CEE (EDF, Engie) vérifient systématiquement la qualification avant de verser les primes.",
  },
  {
    question: 'Quels sont les sous-ensembles QualiPAC ?',
    answer:
      "Qualit'EnR propose 4 niveaux : (1) Module A — CET (chauffe-eau thermodynamique), (2) Module B — PAC air-eau (la plus fréquente), (3) Module C — PAC eau-eau sur nappe phréatique, (4) Module D — PAC géothermique avec captage horizontal/vertical. Un artisan peut cumuler les modules. Vérifier sur devis que le module pertinent pour votre projet (souvent B pour air-eau) est bien certifié. Un Module A ne couvre pas une PAC air-eau même si les travaux paraissent proches.",
  },
]

const sources = [
  { label: 'Qualit’EnR — QualiPAC', url: 'https://www.qualit-enr.org/qualifications/qualipac' },
  { label: 'Arrêté 24 décembre 2021 — Logo RGE', url: 'https://www.legifrance.gouv.fr' },
  { label: 'France Rénov’ — Trouver un pro RGE', url: 'https://france-renov.gouv.fr' },
  { label: 'Anah — MaPrimeRénov’ conditions RGE', url: 'https://www.anah.gouv.fr' },
]

const relatedGuides = [
  {
    label: 'Installation pompe à chaleur : étapes',
    href: '/guides/installation-pompe-chaleur-etapes',
  },
  { label: 'Labels et qualifications artisans', href: '/guides/labels-qualifications-artisans' },
  { label: 'Comment choisir un artisan RGE', href: '/guides/comment-choisir-artisan-rge' },
  { label: 'MaPrimeRénov’ 2026 critères RGE', href: '/guides/maprimerenov-2026-criteres-rge' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Qualifications RGE',
    keywords: [
      'QualiPAC signification',
      'obtenir QualiPAC',
      'qualification pompe à chaleur',
      'Qualit EnR',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'QualiPAC', url: `/guides/${SLUG}` },
  ])
  const faqSchema = getFAQSchema(faqs)
  const schemas = [articleSchema, breadcrumbSchema, faqSchema].filter(
    (s): s is Record<string, unknown> => s !== null
  )
  return (
    <>
      <JsonLd data={schemas} />
      <div className="bg-sand-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Breadcrumb
            items={[{ label: 'Guides', href: '/guides' }, { label: 'QualiPAC' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Award className="w-3.5 h-3.5" aria-hidden />
              Qualifications RGE · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              QualiPAC : signification et obtention
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              QualiPAC est la qualification RGE incontournable pour l’installation de pompes à
              chaleur en France. Voici sa signification, les conditions d’obtention pour artisans,
              et comment vérifier qu’un installateur est bien qualifié avant de signer un devis.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Les 4 modules QualiPAC</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Module</th>
                    <th className="p-3 border-b border-sand-200">Équipement</th>
                    <th className="p-3 border-b border-sand-200">% installations</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['A', 'Chauffe-eau thermo (CET)', '15 %'],
                    ['B', 'PAC air-eau', '75 %'],
                    ['C', 'PAC eau-eau', '5 %'],
                    ['D', 'PAC géothermique', '5 %'],
                  ].map(([m, e, p]) => (
                    <tr key={m} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{m}</td>
                      <td className="p-3">{e}</td>
                      <td className="p-3">{p}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Toujours vérifier sur qualit-enr.org.</strong> 20 % des devis PAC 2025
                étaient signés avec des entreprises usurpant le logo QualiPAC sans qualification
                active. Sans vérif : perte MaPrimeRénov’ 4-11 k€. 30 secondes de recherche
                suffisent.
              </p>
            </div>
          </article>
          <FlagshipFaq items={faqs} />
          <FlagshipSources sources={sources} />
          <section className="my-10">
            <h2 className="font-heading text-xl font-semibold text-sand-900 mb-4">À lire aussi</h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {relatedGuides.map((g) => (
                <li key={g.href}>
                  <Link
                    href={g.href}
                    className="flex items-center justify-between gap-2 bg-white border border-sand-200 rounded-lg p-4 hover:border-primary-400 hover:shadow-sm transition-all text-sand-800"
                  >
                    <span className="text-sm font-medium">{g.label}</span>
                    <ArrowRight className="w-4 h-4 text-sand-400 shrink-0" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <FlagshipAuthorCard
            authorName={AUTHOR_NAME}
            datePublished={PUBLISHED}
            dateModified={MODIFIED}
          />
          <div className="flex items-center justify-between text-sm text-sand-600 border-t border-sand-200 pt-4">
            <Link href="/guides" className="inline-flex items-center gap-1 hover:text-primary-700">
              ← Tous les guides
            </Link>
            <Link
              href="/services/pompe-a-chaleur"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un pro QualiPAC <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
