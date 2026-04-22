import type { Metadata } from 'next'
import Link from 'next/link'
import { Wrench, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'plombier-tarif-horaire-2026'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Jean-Pierre Duval'

export const revalidate = 86400

const TITLE = 'Plombier tarif horaire 2026'
const DESCRIPTION =
  'Plombier tarif horaire 2026 : 50-80 €/h journée, 90-180 €/h nuit/urgence. Forfaits dépannage, prix par tâche, arnaques à éviter, critères honnêtes.'

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
  'Tarif horaire plombier 2026 : 50-80 €/h HT en journée (8h-18h semaine), 90-180 €/h en urgence nuit/week-end/jours fériés.',
  'Déplacement : 30-60 € TTC forfaitaire en zone locale, 60-120 € au-delà. Devis gratuit imposé par art. L111-1 Code consommation.',
  'Forfaits courants : débouchage WC 80-150 €, fuite robinet 80-180 €, chasse d’eau 90-180 €, chauffe-eau 200-450 € (hors pièces).',
  'Tarifs élevés : Paris et IDF +20-40 % vs moyenne nationale. Marseille/Lyon/Lille +10-20 %. Province rurale : -10-20 %.',
  'Signaux d’arnaque : déplacement gratuit alléchant, devis oral, paiement comptant exigé, prix >300 € pour débouchage simple.',
]

const faqs = [
  {
    question: 'Quel est le tarif horaire moyen d’un plombier en 2026 ?',
    answer:
      'Observatoire CAPEB / enquêtes UFC 2025-2026 : (1) Plombier indépendant en journée : 50-75 €/h HT soit 60-90 €/h TTC ; (2) Entreprise de plomberie 2-10 salariés : 70-100 €/h HT soit 84-120 €/h TTC ; (3) Chauffagiste spécialisé (chaudière, PAC) : 65-95 €/h HT ; (4) Plombier urgentiste 24/7 : tarif de base 70-120 €/h TTC + majoration 50-100 % en nuit (22h-7h), week-end, jour férié. Paris/IDF majoration +20-40 %, grandes métropoles +10-20 %. Devis obligatoire dès 150 € (art. R111-3 Code consommation) : toujours demander par écrit avant intervention.',
  },
  {
    question: 'Quels sont les prix forfaitaires par tâche ?',
    answer:
      "Forfaits moyens TTC (TVA 10 %, hors pièces détachées) : (1) Débouchage évier simple : 80-150 € ; (2) Débouchage WC : 100-180 € ; (3) Débouchage canalisation avec furet : 180-350 € ; (4) Remplacement robinet standard : 80-180 € (forfait 1h + fourniture) ; (5) Remplacement mécanisme chasse d'eau : 90-180 € ; (6) Détartrage chauffe-eau : 150-300 € ; (7) Remplacement chauffe-eau 150L standard : 450-900 € (pose) + 250-600 € (appareil) ; (8) Raccordement machine à laver : 90-180 €. Pour devis réno complète : compter 120-180 €/m² salle de bain. Pièces détachées ajoutées : toujours fournir factures fournisseur sur demande.",
  },
  {
    question: 'Quelles majorations pour urgence nuit ou week-end ?',
    answer:
      "Majorations réglementaires (convention collective plomberie IDCC 1563) : (1) Nuit (22h-7h) : +50 à +100 % tarif base ; (2) Samedi après-midi : +25 à +50 % ; (3) Dimanche et jours fériés : +100 % (double tarif) ; (4) Déplacement urgent : +30-50 € forfaitaire additionnel ; (5) Si intervention dépasse 2h, tarif horaire standard reprend au-delà (pas cumul). Exemple Paris dimanche 3h du matin : 80 €/h base + 100 % = 160 €/h + déplacement 60 € = minimum 220 € pour 1 heure d'intervention. Coût moyen intervention urgence nuit : 250-450 € TTC pour débouchage ou fuite, 350-700 € pour chauffe-eau HS.",
  },
  {
    question: 'Comment détecter une arnaque de plombier ?',
    answer:
      "8 signaux d'arnaque caractéristiques (DGCCRF 2024) : (1) Intervention après appel publicité agressive internet (Google Ads avec 0800) ; (2) Pas de SIRET ni RC Pro sur devis / véhicule ; (3) Prix annoncé oralement avant de venir = mensonge — arrivée majorée ; (4) Refus de devis écrit signé avant travaux ; (5) Pression temporelle (« risque inondation immédiat ») pour vous faire signer sans réflexion ; (6) Facture vague sans détail horaire ou pièces ; (7) Paiement comptant exigé (espèces, virement immédiat) ; (8) Prix final 3-5× le devis initial (+ travaux improvisés). Défense : (a) toujours appeler 2-3 plombiers locaux reconnus, (b) refuser l'intervention si pas de devis écrit, (c) si arnaque : signal.conso.gouv.fr + refus paiement + dépôt de plainte.",
  },
  {
    question: 'Quand le tarif plombier est-il couvert par l’assurance ?',
    answer:
      "Prise en charge variable selon contrat MRH (multirisque habitation) : (1) Dégât des eaux : assurance prend en charge la remise en état MAIS PAS la recherche de fuite (sauf garantie spécifique) ; (2) Garantie « recherche fuite » : en option dans contrats premium, plafond 2 500-10 000 €, franchise 150 € ; (3) Assistance habitation 24/7 : incluse dans 60 % des contrats — plombier dépêché sans avance de frais, plafond 500-1 500 € ; (4) Garantie décennale de l'installation si < 10 ans : artisan initial obligé d'intervenir gratuitement. Vérifier police avant d'engager intervention non urgente. En cas de dégât des eaux : appeler d'abord l'assurance pour obtenir accord de prise en charge.",
  },
]

const sources = [
  {
    label: 'Art. R111-3 Code consommation — Devis',
    url: 'https://www.legifrance.gouv.fr',
  },
  { label: 'CAPEB — Observatoire prix', url: 'https://www.capeb.fr' },
  { label: 'UFC-Que Choisir — Prix plomberie', url: 'https://www.quechoisir.org' },
  {
    label: 'Convention collective plomberie IDCC 1563',
    url: 'https://www.legifrance.gouv.fr',
  },
]

const relatedGuides = [
  { label: 'Fuite d’eau : que faire', href: '/guides/fuite-eau-que-faire' },
  { label: 'Odeur de canalisation', href: '/guides/odeur-canalisation-remede' },
  { label: 'DTU plomberie normes', href: '/guides/dtu-plomberie-normes' },
  { label: 'Prix électricien heure 2026', href: '/guides/prix-electricien-heure-2026' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Prix & tarifs',
    keywords: [
      'plombier tarif horaire',
      'prix plombier heure 2026',
      'tarif plombier urgence nuit',
      'forfait plombier débouchage',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Plombier tarif horaire', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Plombier tarif horaire' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Wrench className="w-3.5 h-3.5" aria-hidden />
              Prix & tarifs · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Plombier tarif horaire 2026 : prix vrais
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Les tarifs plomberie 2026 varient du simple au triple selon zone, urgence et
              prestation. Voici la grille horaire honnête, les forfaits dépannage, les majorations
              urgence et les 8 signaux d’arnaque pour ne pas se faire pigeonner.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Grille horaire plombier selon contexte</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Moment</th>
                    <th className="p-3 border-b border-sand-200">Tarif horaire TTC</th>
                    <th className="p-3 border-b border-sand-200">Majoration</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Journée semaine (8h-18h)', '60-90 €/h', 'Base'],
                    ['Samedi matin', '75-110 €/h', '+25 %'],
                    ['Samedi après-midi', '90-140 €/h', '+50 %'],
                    ['Nuit (22h-7h)', '120-180 €/h', '+100 %'],
                    ['Dimanche / jour férié', '150-220 €/h', '+100-150 %'],
                  ].map(([m, t, maj]) => (
                    <tr key={m} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{m}</td>
                      <td className="p-3 font-semibold">{t}</td>
                      <td className="p-3">{maj}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Devis obligatoire dès 150 € TTC (art. R111-3).</strong> Refuser une
                intervention sans devis signé. Même en urgence : photo SMS du devis suffit. 90 % des
                arnaques plombier démarrent par absence de devis écrit.
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
              href="/services/plombier"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un plombier <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
