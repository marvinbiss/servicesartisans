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

const SLUG = 'mon-accompagnateur-renov-obligatoire'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'

export const revalidate = 86400

const TITLE = 'Mon Accompagnateur Rénov’ : coût 2026'
const DESCRIPTION =
  'Mon Accompagnateur Rénov’ obligatoire pour MaPrimeRénov’ parcours accompagné >5 000 €. Rôle, agrément Anah, coût 600-2 000 €, choisir un MAR, check-list.'

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
  'Obligatoire depuis 1er janvier 2024 pour MaPrimeRénov’ Parcours Accompagné (rénovation globale >5 000 € avec gain ≥2 classes DPE).',
  'Mission : accompagnement admin + technique complet — audit, priorisation, choix artisans RGE, suivi chantier, réception.',
  'Coût : 600-2 000 € TTC selon taille projet. MaPrimeRénov’ finance 100 % jusqu’à 2 000 € (revenus modestes), 400 € (autres).',
  'Agrément Anah strict : 5 000 MAR en 2026. Liste officielle sur france-renov.gouv.fr > Trouver un pro.',
  'Distinct de l’auditeur énergétique : MAR coordonne TOUT, auditeur fait seulement l’étude initiale.',
]

const faqs = [
  {
    question: 'Quand Mon Accompagnateur Rénov’ est-il obligatoire ?',
    answer:
      "Depuis 1er janvier 2024 (décret 2022-1690), obligatoire pour bénéficier de MaPrimeRénov' Parcours Accompagné, soit : (1) Projet de rénovation globale avec gain minimum de 2 classes au DPE (ex : G → E, F → D, E → C) ; (2) Montant travaux ≥5 000 € TTC ; (3) Objectif sortie passoire thermique (classes F ou G exclusivement avec aides majorées) ou rénovation performante. NON obligatoire pour MaPrimeRénov' Parcours par Geste (travaux isolés : PAC seule, isolation combles seule, remplacement fenêtres seules). La frontière : un seul geste = pas de MAR, 2+ gestes avec gain DPE = MAR obligatoire. Sans MAR : dossier refusé par l'Anah, aides non versées.",
  },
  {
    question: 'Quel est le rôle exact d’un Mon Accompagnateur Rénov’ ?',
    answer:
      "6 missions définies par l'Anah (cahier des charges MAR 2024) : (1) Audit énergétique initial (ou recours à auditeur agréé) — état des lieux + scénarios travaux ; (2) Aide à la décision — priorisation travaux, budget global, plan de financement (aides MPR + CEE + éco-PTZ + prêts) ; (3) Accompagnement choix artisans — vérification RGE, exigences techniques, analyse devis, négociation ; (4) Montage dossier MaPrimeRénov' — assemblage pièces, dépôt maprimerenov.gouv.fr, suivi instruction ; (5) Suivi chantier — 2-4 visites terrain, vérif conformité devis, intercession si retard/dérive ; (6) Réception — présence au PV, levée réserves, validation aides. Durée moyenne accompagnement : 6-14 mois.",
  },
  {
    question: 'Combien coûte un MAR et comment est-il financé ?',
    answer:
      "Tarifs 2026 : (1) Projet <15 000 € travaux : 600-1 200 € TTC ; (2) Projet 15-50 000 € : 1 200-1 800 € TTC ; (3) Projet >50 000 € : 1 500-2 500 € TTC. Financement via MaPrimeRénov' : 100 % jusqu'à plafond selon revenus — 2 000 € ménages très modestes (bleu), 1 200 € modestes (jaune), 400 € intermédiaires (violet), 0 € supérieurs (rose). Soit reste à charge net : 0 € pour 60 % des ménages bénéficiaires. Attention : le tarif MAR est libre, comparer 2-3 devis. Éviter MAR >2 000 € sans justification de complexité exceptionnelle (monument historique, copropriété complexe).",
  },
  {
    question: 'Comment choisir un Mon Accompagnateur Rénov’ ?',
    answer:
      "Critères vérifiables : (1) Agrément Anah en cours — vérifier sur france-renov.gouv.fr, rubrique « Trouver un Mon Accompagnateur Rénov' » — sans agrément = refus dossier MPR ; (2) Statut : plusieurs profils possibles — architectes + BET thermiques (plus techniques), ADIL (gratuit partiellement, réseaux publics), associations (SOLIHA, Habitat Humanisme, CITEMETRIE), opérateurs privés (Hello Watt, CoachRénov' partenaires fournisseurs énergie) ; (3) Indépendance : préférer MAR non lié à un fournisseur énergie ou un artisan (conflit d'intérêt si commission) ; (4) Expérience : demander 2-3 références projets similaires achevés ; (5) Périmètre : accompagnement local (<50 km) pour visites terrain fréquentes. Lire le contrat : responsabilité civile pro obligatoire, garantie de résultat non.",
  },
  {
    question: 'Quelles différences MAR vs audit énergétique ?',
    answer:
      "Confusion fréquente mais rôles distincts. AUDIT ÉNERGÉTIQUE : étude technique ponctuelle (6-12 h visite + livrable 25-40 pages), chiffre 2 scénarios travaux, réalisée par auditeur RGE Études (architecte, BET thermique, CEREMA). Coût 800-2 500 € TTC. Obligatoire vente passoire F/G depuis 2023. UN COUP UNIQUE. MAR : accompagnement durée longue (6-14 mois), coordonne TOUT (choix artisans, dossier aides, suivi chantier, réception). Coût 600-2 500 € TTC. Obligatoire MaPrimeRénov' Parcours Accompagné. PROCESSUS CONTINU. Certains MAR intègrent l'audit dans leur prestation (pratique recommandée pour éviter doublon 1 500 €). Vérifier dans le devis MAR si audit inclus.",
  },
]

const sources = [
  {
    label: 'Décret 2022-1690 — Obligation MAR',
    url: 'https://www.legifrance.gouv.fr',
  },
  {
    label: 'Anah — Cahier charges MAR',
    url: 'https://www.anah.gouv.fr',
  },
  { label: 'France-Rénov’ — Trouver un MAR', url: 'https://france-renov.gouv.fr' },
  { label: 'maprimerenov.gouv.fr — Parcours accompagné', url: 'https://www.maprimerenov.gouv.fr' },
]

const relatedGuides = [
  { label: 'MaPrimeRénov’ parcours accompagné', href: '/guides/maprimerenov-parcours-accompagne' },
  { label: 'Audit énergétique prix aides', href: '/guides/audit-energetique-prix-aides' },
  { label: 'MaPrimeRénov’ 2026 critères RGE', href: '/guides/maprimerenov-2026-criteres-rge' },
  { label: 'Passoire thermique rénovation', href: '/guides/passoire-thermique-renovation' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Aides financières',
    keywords: [
      'Mon Accompagnateur Rénov',
      'MAR obligatoire MaPrimeRénov',
      'coût MAR 2026',
      'agrément MAR Anah',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Mon Accompagnateur Rénov’', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Mon Accompagnateur Rénov’' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Users className="w-3.5 h-3.5" aria-hidden />
              Aides financières · Guide vérifié
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Mon Accompagnateur Rénov’ : guide complet
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Mon Accompagnateur Rénov’ (MAR) est obligatoire depuis 2024 pour toute rénovation
              globale avec MaPrimeRénov’. Voici son rôle, son coût (600-2 500 € TTC financés jusqu’à
              100 % par l’Anah) et comment choisir un MAR agréé.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Prise en charge MAR par MaPrimeRénov’</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Profil revenus</th>
                    <th className="p-3 border-b border-sand-200">Plafond prise en charge</th>
                    <th className="p-3 border-b border-sand-200">Reste à charge typique</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Très modestes (bleu)', '2 000 €', '0 €'],
                    ['Modestes (jaune)', '1 200 €', '0-600 €'],
                    ['Intermédiaires (violet)', '400 €', '800-1 600 €'],
                    ['Supérieurs (rose)', '0 €', '1 200-2 500 €'],
                  ].map(([p, pl, r]) => (
                    <tr key={p} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{p}</td>
                      <td className="p-3 font-semibold">{pl}</td>
                      <td className="p-3">{r}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Vérifier agrément Anah AVANT signature.</strong> Un « conseiller rénovation
                » sans agrément MAR ne donne PAS droit aux aides MPR Parcours Accompagné. Vérif
                france-renov.gouv.fr obligatoire. Sinon : dossier refusé, aides perdues.
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
            <Link href="/rge" className="inline-flex items-center gap-1 hover:text-primary-700">
              Artisans RGE <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
