import type { Metadata } from 'next'
import Link from 'next/link'
import { Users, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'maprimerenov-parcours-accompagne'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'

export const revalidate = 86400

const TITLE = 'MaPrimeRénov’ parcours accompagné 2026'
const DESCRIPTION =
  'MaPrimeRénov’ parcours accompagné 2026 : obligation Mon Accompagnateur Rénov’, audit énergétique, gain ≥2 classes DPE, montants par profil jusqu’à 63 000 €.'

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
    authors: [`${SITE_URL}/equipe/claire-dubois`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Parcours accompagné 2026 = rénovation d’ampleur avec gain DPE ≥2 classes + accompagnement obligatoire Mon Accompagnateur Rénov’ (MAR).',
  'Aide jusqu’à 63 000 € (Bleu, gain 4 classes) sur travaux plafonnés à 70 000 € HT.',
  'Taux d’aide par profil : Bleu 80 %, Jaune 60 %, Violet 45 %, Rose 30 %.',
  'Audit énergétique obligatoire (500-1 200 €, en partie remboursé dans l’aide).',
  'Bonifications : +10 % si sortie de passoire (F/G → D min), +10 % si passoire → BBC (gain 4 classes).',
]

const faqs = [
  {
    question: 'Qu’est-ce que le parcours accompagné ?',
    answer:
      "Dispositif central MaPrimeRénov' 2024-2026 : aide à la rénovation énergétique d'ampleur (gain minimum 2 classes DPE) avec accompagnement obligatoire d'un professionnel agréé Mon Accompagnateur Rénov' (MAR). Le MAR audit votre logement, propose scénarios travaux, supervise artisans RGE, dépose dossier aides. Objectif : éviter les travaux mal calibrés et garantir la performance réelle post-travaux. Accessible à tous propriétaires occupants et bailleurs.",
  },
  {
    question: 'Combien coûte Mon Accompagnateur Rénov’ ?',
    answer:
      "Tarifs 2026 : audit énergétique + accompagnement complet = 1 500-3 500 € HT selon complexité. Une partie est prise en charge dans MaPrimeRénov' (jusqu'à 2 000 € pour les Bleu, 1 200 € pour les Jaune, 800 € pour les Violet, 400 € pour les Rose). Le MAR doit être agréé par France Rénov' et peut appartenir à différents statuts : ALEC, CAUE, architectes, bureaux d'études, entreprises certifiées. Liste complète sur france-renov.gouv.fr.",
  },
  {
    question: 'Quels sont les montants par profil et gain DPE ?',
    answer:
      "Taux d'aide selon profil ET gain de classes DPE. Profil Bleu : gain 2 classes = 40 % (plafond 40 k€), 3 classes = 55 % (52,5 k€), 4 classes = 80 % (63 k€). Profil Jaune : 35 %/45 %/60 % selon gain. Profil Violet : 25 %/35 %/45 %. Profil Rose : 10 %/20 %/30 %. Bonifications cumulables : sortie passoire +10 %, atteinte BBC +10 %. Plafond travaux : 70 000 € HT (40 k€ si gain seulement 2 classes). Règle : plus le saut DPE est important, plus l'aide est forte.",
  },
  {
    question: 'Peut-on cumuler avec CEE et éco-PTZ ?',
    answer:
      "Oui, cumul officiel : MaPrimeRénov' parcours accompagné + Coup de pouce CEE (4-5 500 €) + éco-PTZ jusqu'à 50 000 € + TVA 5,5 %. Pour un projet 60 000 € TTC profil Jaune gain 3 classes : MPR = 36 000 €, CEE = 5 000 €, TVA intégrée, éco-PTZ 19 000 € remboursable 15 ans (~105 €/mois). Reste à charge effectif 0 € hors remboursement mensuel. La rénovation globale peut être intégralement financée sans apport.",
  },
  {
    question: 'Puis-je basculer d’un parcours geste à un parcours accompagné ?',
    answer:
      "Oui, à condition de ne pas avoir déjà encaissé la prime du geste. Demander au MAR d'évaluer la faisabilité d'un parcours global plus avantageux. Il faut alors retirer le dossier geste en cours et déposer un nouveau dossier accompagné. Intérêt : passer d'une aide 3 000 € (geste isolé) à 35 000 € (globale) pour à peine plus de travaux. Attention : les travaux déjà réalisés et facturés peuvent ne pas entrer dans l'assiette.",
  },
  {
    question: 'Quel calendrier pour un parcours accompagné ?',
    answer:
      'Durée totale 9-18 mois : (1) prise contact MAR, signature mandat 2-4 semaines, (2) audit énergétique + scénarios 4-8 semaines, (3) validation scénario et sélection artisans 4-8 semaines, (4) dépôt dossier MPR + attente accord 6-10 semaines, (5) signature devis et démarrage travaux 2-4 mois, (6) fin travaux + nouveau DPE 2-4 mois, (7) versement aide 6-10 semaines. Démarrer en 2026 pour rénover un F avant fin 2027 (interdiction 2028) = dernière fenêtre.',
  },
]

const sources = [
  { label: 'France Rénov’ — Parcours accompagné', url: 'https://france-renov.gouv.fr' },
  { label: 'Anah — MaPrimeRénov’ parcours accompagné', url: 'https://www.anah.gouv.fr' },
  { label: 'Décret 2023-797 — Parcours accompagné', url: 'https://www.legifrance.gouv.fr' },
  {
    label: 'Agrément MAR — Annuaire MARs',
    url: 'https://france-renov.gouv.fr/trouver-un-accompagnateur',
  },
]

const relatedGuides = [
  { label: 'MaPrimeRénov’ 2026 critères RGE', href: '/guides/maprimerenov-2026-criteres-rge' },
  {
    label: 'Plafonds MaPrimeRénov’ revenus 2026',
    href: '/guides/plafond-maprimerenov-revenus-2026',
  },
  { label: 'DPE mauvais que faire', href: '/guides/dpe-mauvais-que-faire' },
  { label: 'Éco-PTZ 2026', href: '/guides/eco-pret-taux-zero-2026' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Rénovation énergétique',
    keywords: [
      'parcours accompagné MaPrimeRénov',
      'Mon Accompagnateur Rénov',
      'MAR',
      'rénovation d’ampleur',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'MaPrimeRénov’ parcours accompagné', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Parcours accompagné' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Users className="w-3.5 h-3.5" aria-hidden />
              Rénovation énergétique · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              MaPrimeRénov’ parcours accompagné : aide jusqu’à 63 000 €
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Depuis 2024, la rénovation d’ampleur ouvre le plus haut niveau d’aide de
              MaPrimeRénov’. Obligation : accompagnement par un professionnel agréé (MAR), gain d’au
              moins 2 classes DPE. Voici le barème 2026, les conditions et le calendrier réel.
            </p>
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Barème taux d’aide 2026</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Profil</th>
                    <th className="p-3 border-b border-sand-200">Gain 2 classes</th>
                    <th className="p-3 border-b border-sand-200">Gain 3 classes</th>
                    <th className="p-3 border-b border-sand-200">Gain 4 classes</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Bleu', '40 % (40 k€)', '55 % (52,5 k€)', '80 % (63 k€)'],
                    ['Jaune', '35 % (35 k€)', '45 % (40,5 k€)', '60 % (52,5 k€)'],
                    ['Violet', '25 % (25 k€)', '35 % (31,5 k€)', '45 % (40,5 k€)'],
                    ['Rose', '10 %', '20 %', '30 %'],
                  ].map(([p, g2, g3, g4]) => (
                    <tr key={p} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{p}</td>
                      <td className="p-3">{g2}</td>
                      <td className="p-3">{g3}</td>
                      <td className="p-3 font-semibold">{g4}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>Rôle détaillé du MAR</h2>
            <ul>
              <li>
                <strong>Audit énergétique</strong> normalisé avec scénarios chiffrés et gains DPE
                attendus.
              </li>
              <li>
                <strong>Accompagnement technique</strong> : choix travaux, lecture devis, éviter
                pièges.
              </li>
              <li>
                <strong>Accompagnement financier</strong> : dépôt aides, simulation reste à charge.
              </li>
              <li>
                <strong>Accompagnement social</strong> (pour les Bleu/Jaune) : points de vigilance.
              </li>
              <li>
                <strong>Réception chantier</strong> : contrôle conformité, nouveau DPE post-travaux.
              </li>
            </ul>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Vérifiez l’agrément MAR.</strong> Seuls les MAR agréés France Rénov’ ouvrent
                droit à l’aide. Liste officielle sur france-renov.gouv.fr/trouver-un-accompagnateur.
                Refuser tout démarcheur qui s’annonce « mandataire Anah » sans justifier de son
                numéro d’agrément — arnaque fréquente.
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
              href="/simulateur-aides-renovation"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Simuler mes aides <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
