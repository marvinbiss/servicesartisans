import type { Metadata } from 'next'
import Link from 'next/link'
import { Key, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'serrurier-arnaques-tarifs-honnetes'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Sophie Martin'

export const revalidate = 86400

const TITLE = 'Serrurier arnaques : vrais tarifs 2026'
const DESCRIPTION =
  'Serrurier arnaques : 60-120 € ouverture sans casse, 250-600 € serrure HS. Détecter Google Ads frauduleux, refuser devis abusif, recours DGCCRF, prévention.'

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
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
    authors: [`${SITE_URL}/equipe/sophie-martin`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Tarifs honnêtes 2026 : 60-120 € ouverture porte claquée sans casse, 150-250 € porte fermée à clé, 250-600 € serrure HS à remplacer.',
  'Urgence nuit/week-end : majoration +50-100 % légitime, PAS +300-500 % (arnaque). Déplacement 30-60 € TTC.',
  'Google Ads frauduleux : 60 % des annonces « serrurier 24/7 » à Paris sont opérées par des réseaux d’arnaqueurs (DGCCRF 2024).',
  'Signaux alerte : interlocuteur vague, pas de SIRET ni d’adresse, forfait minimum >150 €, exigence paiement comptant.',
  'Recours après arnaque : 14 jours rétractation si démarchage, refus paiement carte (contestation bancaire 30 j), signal.conso.gouv.fr, police.',
]

const faqs = [
  {
    question: 'Quels sont les prix honnêtes d’un serrurier en 2026 ?',
    answer:
      'Grille de référence (enquête CAPEB 2025 + UFC-Que Choisir 2024) : (1) Ouverture porte claquée sans casse (60-80 % des interventions) : 60-120 € TTC en journée ; (2) Ouverture porte fermée à clé (crochetage, technique avancée) : 150-250 € TTC ; (3) Remplacement cylindre/serrure standard : 200-350 € fourniture + pose ; (4) Remplacement serrure 3 points : 400-800 € ; (5) Serrure sécurité A2P**/*** : 600-1 200 € ; (6) Blindage porte complet : 1 500-3 500 €. Majoration urgence nuit/weekend : +50-100 % max — au-delà = arnaque. Déplacement 30-60 € forfaitaire. Devis écrit OBLIGATOIRE dès 150 € (art. R111-3 Code consommation).',
  },
  {
    question: 'Comment reconnaître une arnaque serrurier ?',
    answer:
      "9 signaux d'alerte convergents : (1) Google Ads en position 1-3 sur « serrurier [ville] 24/7 » — 60 % sont frauduleux (rapport DGCCRF 2024) ; (2) Numéro 0800 ou international, pas de numéro local ; (3) Le standard ne donne ni nom, ni SIRET, ni adresse d'entreprise ; (4) Tarif annoncé bas (49 € ouverture) mais facture finale 450-900 € avec « frais surprise » ; (5) Pas d'identification véhicule (plombier sans marquage entreprise) ; (6) Refuse de montrer carte professionnelle, CNI ou devis écrit ; (7) Pression immédiate : « il faut agir maintenant » ; (8) Exigence paiement comptant espèces / carte sans facture détaillée ; (9) Technique de vente agressive pour vous faire remplacer serrure alors qu'ouverture suffisait. Si 2+ signaux : refuser et appeler numéro local alternatif.",
  },
  {
    question: 'Comment réagir si je suis victime d’une arnaque ?',
    answer:
      'Protocole en 4 étapes urgentes : (1) Payez PAR CARTE BANCAIRE uniquement (jamais espèces ni chèque) — vous pourrez contester sous 30 j via votre banque (art. L133-18 Code monétaire) ; (2) Exigez facture détaillée avec SIRET, RC Pro, TVA, signature, qui servira de preuve ; (3) Appelez immédiatement votre banque pour opposition/contestation opération frauduleuse — taux de remboursement 60-80 % si arnaque caractérisée ; (4) Déposez plainte au commissariat OU pré-plainte en ligne (pre-plainte-en-ligne.gouv.fr) + signalement signal.conso.gouv.fr DGCCRF. Si rétractation possible (démarchage à domicile 14 j) : envoyer LRAR de rétractation sous 14 j (art. L221-18). Assurance protection juridique (dans MRH) : prend en charge 500-2 000 € frais avocat.',
  },
  {
    question: 'Comment trouver un serrurier fiable en urgence ?',
    answer:
      "3 canaux de confiance : (1) Annuaire de la fédération nationale : unionartisanale.org / CAPEB — entreprises vérifiées SIRET + RC Pro + formation ; (2) Recommandations locales via voisins, gardien d'immeuble, syndic, commerçants du quartier — ces professionnels connaissent généralement un serrurier fiable ; (3) Sites avec avis vérifiés : ServicesArtisans, Stars of Service, AlloVoisins — filtrer sur 4+ étoiles avec >10 avis récents. Éviter Google Maps sans vérification (tableaux Stars + avis peuvent être fake). Pour URGENCE vraie (ex : 22h porte claquée) : conserver un n° serrurier fiable dans contacts téléphone AVANT besoin. Assurance habitation avec assistance juridique 24/7 : envoie serrurier partenaire sans avance de frais (0-300 € selon plafond contrat).",
  },
  {
    question: 'Puis-je refuser de payer si je suis arnaqué ?',
    answer:
      "Oui si fraude caractérisée, mais procédure à respecter : (1) NE PAS payer en espèces — si espèces données, très difficile de récupérer ; (2) Si payé par carte : contestation bancaire sous 13 mois max (art. L133-18) avec preuves (constat photo facture, devis oral vs facture finale, absence SIRET, etc.) — remboursement usuel sous 10 j si fraude avérée ; (3) Si payé par chèque non encaissé : opposition immédiate auprès banque (art. L131-35) pour « utilisation frauduleuse » ; (4) Refus sur place si intervention non souhaitée : la facture peut être contestée devant tribunal judiciaire — mais risque mise en demeure intermédiaire. Preuve essentielle : enregistrement audio (légal si vous êtes partie) des conversations pré-facturation. DGCCRF peut bloquer l'exécution forcée.",
  },
]

const sources = [
  {
    label: 'Art. R111-3 Code consommation — Devis',
    url: 'https://www.legifrance.gouv.fr',
  },
  {
    label: 'Art. L221-18 — Rétractation démarchage',
    url: 'https://www.legifrance.gouv.fr',
  },
  { label: 'DGCCRF — Arnaques serrurerie', url: 'https://www.economie.gouv.fr/dgccrf' },
  { label: 'UFC-Que Choisir — Tarifs serrurier', url: 'https://www.quechoisir.org' },
  { label: 'signal.conso.gouv.fr', url: 'https://signal.conso.gouv.fr' },
]

const relatedGuides = [
  { label: 'Porte claquée : prix serrurier', href: '/guides/porte-claquee-serrurier-prix' },
  { label: 'Éviter les arnaques artisan', href: '/guides/eviter-arnaques-artisan' },
  { label: 'Malfaçons travaux recours', href: '/guides/malfacons-travaux-recours' },
  { label: 'Vérifier le SIRET d’un artisan', href: '/guides/verifier-siret-artisan' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Urgences',
    keywords: [
      'serrurier arnaques',
      'serrurier tarifs honnêtes 2026',
      'arnaque serrurerie Paris',
      'serrurier urgence prix',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Serrurier arnaques', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Serrurier arnaques' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Key className="w-3.5 h-3.5" aria-hidden />
              Urgences · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Serrurier : tarifs honnêtes 2026 & arnaques
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              La serrurerie d’urgence est le secteur avec le plus haut taux d’arnaques en France (60
              % des Google Ads parisiens selon la DGCCRF). Voici les tarifs honnêtes 2026, les 9
              signaux d’alerte et la procédure pour obtenir remboursement après escroquerie.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Tarifs honnêtes serrurier 2026</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Intervention</th>
                    <th className="p-3 border-b border-sand-200">Tarif TTC journée</th>
                    <th className="p-3 border-b border-sand-200">Urgence nuit</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Ouverture porte claquée', '60-120 €', '120-250 €'],
                    ['Ouverture porte fermée à clé', '150-250 €', '250-450 €'],
                    ['Remplacement cylindre standard', '200-350 €', '350-600 €'],
                    ['Remplacement serrure 3 points', '400-800 €', '600-1 200 €'],
                    ['Serrure sécurité A2P**/***', '600-1 200 €', '900-1 800 €'],
                    ['Blindage porte complet', '1 500-3 500 €', 'Pas en urgence'],
                  ].map(([i, j, n]) => (
                    <tr key={i} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{i}</td>
                      <td className="p-3 font-semibold">{j}</td>
                      <td className="p-3">{n}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Payez TOUJOURS par carte bancaire.</strong> Contestation possible sous 30 j
                si arnaque. Espèces = argent perdu définitivement. 90 % des remboursements
                post-arnaque serrurerie passent par la contestation carte (banque).
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
              href="/services/serrurier"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un serrurier <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
