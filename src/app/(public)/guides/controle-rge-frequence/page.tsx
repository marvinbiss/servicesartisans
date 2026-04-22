import type { Metadata } from 'next'
import Link from 'next/link'
import { ClipboardCheck, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'controle-rge-frequence'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Jean-Pierre Duval'

export const revalidate = 86400

const TITLE = 'Contrôle RGE 2026 : fréquence et déroulé'
const DESCRIPTION =
  'Contrôle RGE : audit initial + 1-3 chantiers par cycle de 4 ans + contrôles inopinés. Déroulé visite, points vérifiés, résultats, sanctions possibles.'

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
    authors: [`${SITE_URL}/equipe/jean-pierre-duval`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Fréquence : audit initial + 1 chantier contrôlé la 1re année + 1 à 3 chantiers sur la durée de qualification (4 ans) + contrôles inopinés possibles.',
  'Durée visite : 2-4 h sur site + 1-2 h analyse documentaire. Coût supporté par l’organisme qualificateur (Qualit’EnR, Qualibat).',
  'Points vérifiés : conformité DTU, dimensionnement, facture, devis, PV de réception, déclaration DQE, témoignage client.',
  'Résultats : conforme (70-75 %), non-conforme mineur à corriger (15-20 %), non-conforme majeur entraînant suspension (5-10 %).',
  'Préparation : fiches techniques produits installés, attestation conformité Consuel/QualiGaz, photos chantier avant/pendant/après.',
]

const faqs = [
  {
    question: 'Quelle est la fréquence exacte des contrôles RGE ?',
    answer:
      "Arrêté du 1er décembre 2015 modifié : (1) contrôle initial d'audit lors de la demande de qualification (1 chantier déjà réalisé), (2) contrôle de la première année après obtention (1 chantier récent), (3) pour cycle de 4 ans : 1 à 3 contrôles chantier supplémentaires selon le nombre d'opérations déclarées (1 si <20 chantiers/an, 2 si 20-50, 3 si >50), (4) contrôles inopinés possibles si signalements clients ou obligés CEE. Soit en moyenne 3-5 contrôles par cycle de 4 ans. Budget prévisionnel par contrôle : 500-1 200 € HT (supporté par l'organisme via cotisations).",
  },
  {
    question: 'Comment se déroule concrètement une visite d’audit ?',
    answer:
      "Protocole Qualit'EnR type : (1) prise de rendez-vous sur chantier terminé 1 à 6 mois auparavant, présence du client obligatoire, (2) accueil 15 min — présentation mission, (3) visite technique 2-4 h — vérif dimensionnement, conformité DTU, qualité exécution, fonctionnement équipement (test performance PAC COP, VMC débit), (4) analyse documentaire 1-2 h — devis, facture, attestation conformité, PV réception, fiches techniques, (5) interview client 15-30 min — satisfaction, incidents, relation pro, (6) rapport transmis à la commission de qualification sous 30 j. Présence du référent technique de l'entreprise recommandée.",
  },
  {
    question: 'Quels sont les points vérifiés sur le chantier ?',
    answer:
      "Checklist de 40-60 points selon le corps de métier. Exemples PAC air-eau : (1) dimensionnement Pn vs déperdition calculée, (2) position unité extérieure (dégagement, support antivibratoire), (3) longueur liaisons frigorifiques, (4) raccordement hydraulique + vase expansion dimensionné, (5) régulation loi d'eau paramétrée, (6) pose Consuel, (7) mesure COP en conditions réelles, (8) explication mise en main au client. Critères d'éviction immédiate : risque sécuritaire (gaz non étanche, électrique non conforme), rendement catastrophique (<60 % du Pn annoncé), fraude documentaire.",
  },
  {
    question: 'Que se passe-t-il en cas de non-conformité constatée ?',
    answer:
      '3 niveaux de gravité : (1) non-conformité mineure (finition, documentation manquante) → avertissement + corrections dans 30-90 j + recontrôle léger 150-400 €, (2) non-conformité majeure (DTU partiel, dimensionnement inadapté) → suspension 2-6 mois + formation de remise à niveau 500-1 500 € + recontrôle complet 800-1 500 €, (3) non-conformité grave (risque sécurité, fraude, défaut majeur rendement) → retrait qualification + obligation de reprendre le chantier client à ses frais + signalement DGCCRF si suspicion fraude. Statistiques : 70-75 % des contrôles sont conformes, 15-20 % non-conformes mineurs, 5-10 % majeurs.',
  },
  {
    question: 'Peut-on contester un contrôle RGE défavorable ?',
    answer:
      "Oui, procédure contradictoire obligatoire. (1) Le rapport d'audit est transmis à l'entreprise qui dispose de 15-30 j pour apporter des observations écrites, (2) la commission de qualification statue en intégrant les observations, (3) en cas de décision négative, recours gracieux 2 mois auprès du comité de qualification, (4) recours hiérarchique 30 j auprès de la commission nationale, (5) recours contentieux tribunal judiciaire (8-18 mois délai). Assistance avocat recommandée dès le recours gracieux (800-2 500 € HT). Taux de réforme favorable : environ 25-30 % en appel avec arguments techniques solides.",
  },
]

const sources = [
  {
    label: 'Arrêté 1er décembre 2015 — Contrôles RGE',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000031536915',
  },
  {
    label: 'Qualit’EnR — Plan de contrôle',
    url: 'https://www.qualit-enr.org/qualifications/plan-controle',
  },
  { label: 'Qualibat — Méthodologie audit', url: 'https://www.qualibat.com' },
  { label: 'ADEME — Statistiques contrôles', url: 'https://www.ademe.fr' },
]

const relatedGuides = [
  { label: 'Perte RGE : conséquences', href: '/guides/perte-rge-consequences' },
  { label: 'QualiPAC signification', href: '/guides/qualipac-signification-obtenir' },
  { label: 'Comment choisir un artisan RGE', href: '/guides/comment-choisir-artisan-rge' },
  { label: 'Labels et qualifications artisans', href: '/guides/labels-qualifications-artisans' },
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
      'contrôle RGE fréquence',
      'audit chantier RGE',
      'visite qualification RGE',
      'non-conformité RGE',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Contrôle RGE', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Contrôle RGE' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <ClipboardCheck className="w-3.5 h-3.5" aria-hidden />
              Qualifications RGE · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Contrôle RGE : fréquence, déroulé, checklist
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Les contrôles RGE concernent toutes les entreprises qualifiées. Voici la fréquence
              réglementaire, le déroulé précis d’une visite d’audit, les points vérifiés et comment
              se préparer pour éviter toute non-conformité.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Calendrier type des contrôles RGE (cycle 4 ans)</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Moment</th>
                    <th className="p-3 border-b border-sand-200">Type</th>
                    <th className="p-3 border-b border-sand-200">Durée visite</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Dépôt dossier', 'Audit initial (1 chantier passé)', '3-4 h'],
                    ['Année 1', 'Contrôle de suivi obligatoire', '2-3 h'],
                    ['Années 2-3', '1-3 chantiers selon volume', '2-4 h'],
                    ['N’importe quand', 'Contrôle inopiné (signalement)', '3-5 h'],
                    ['Année 4', 'Audit de renouvellement', '3-4 h'],
                  ].map(([m, t, d]) => (
                    <tr key={m} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{m}</td>
                      <td className="p-3">{t}</td>
                      <td className="p-3">{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Conservez toutes les pièces chantier 10 ans.</strong> Devis signé, facture,
                attestation Consuel/QualiGaz, fiches techniques produits, photos
                avant/pendant/après, PV réception. Impossible de contester un audit sans dossier
                chantier complet.
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
              Espace RGE <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
