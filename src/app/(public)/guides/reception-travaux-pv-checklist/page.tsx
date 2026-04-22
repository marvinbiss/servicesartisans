import type { Metadata } from 'next'
import Link from 'next/link'
import { FileCheck, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema, getHowToSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'reception-travaux-pv-checklist'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Sophie Martin'

export const revalidate = 86400

const TITLE = 'Réception travaux : PV, checklist 2026'
const DESCRIPTION =
  'Réception travaux : PV obligatoire, réserves précises, checklist 30 points. Déclenche GPA 1 an, biennale 2 ans, décennale 10 ans. Modèle PV inclus.'

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
  'PV de réception = acte juridique qui déclenche les garanties légales (GPA 1 an, biennale 2 ans, décennale 10 ans).',
  'Sans PV signé : pas de point de départ, pas de garanties activables — LA pièce la plus importante du dossier.',
  'Réserves : lister chaque désordre visible dans le PV (précis : localisation, nature, mesure). L’entreprise doit les lever sous 1 an.',
  'Refus de signer si désordres graves : réception partielle, sous réserve, ou refus total possible + recours au juge.',
  'Document recommandé : modèle AFNOR P03-001 ou ANIL. Signature en 2 exemplaires, un par partie.',
]

const howToSteps = [
  {
    name: 'Préparer la visite de réception',
    text: 'Convoquer l’artisan par LRAR + relire devis + préparer checklist 30 points + appareil photo + mètre.',
  },
  {
    name: 'Vérifier chaque poste du devis',
    text: 'Parcourir ligne par ligne le devis : chaque prestation a-t-elle été livrée conformément ? Quantités, qualités, marques, finitions.',
  },
  {
    name: 'Tester les équipements',
    text: 'Mise en route PAC/chaudière, test VMC, ouverture fermeture fenêtres, test électrique, pression réseau eau, évacuations.',
  },
  {
    name: 'Photographier les désordres',
    text: 'Photo datée haute résolution chaque défaut. Mesure précise (cm, mm). Conservation 10 ans (décennale).',
  },
  {
    name: 'Rédiger le PV de réception',
    text: 'Formulaire AFNOR P03-001 ou ANIL : identités, date, ouvrage, éventuelles réserves détaillées par pièce. Ne jamais signer sans relire.',
  },
  {
    name: 'Réception avec réserves (si besoin)',
    text: 'Mentionner chaque réserve : localisation + nature + délai de reprise 30-90 j. L’entreprise doit lever sous 1 an (GPA).',
  },
  {
    name: 'Signer et archiver',
    text: '2 exemplaires signés datés. Conserver 10 ans minimum (durée décennale). Joindre au dossier travaux (devis, factures, plans).',
  },
]

const faqs = [
  {
    question: 'Pourquoi le PV de réception est-il juridiquement essentiel ?',
    answer:
      "Le procès-verbal de réception est l'acte juridique par lequel le maître d'ouvrage (vous) déclare accepter l'ouvrage, avec ou sans réserves. Il déclenche simultanément : (1) Garantie de parfait achèvement (GPA) 1 an — art. 1792-6 Code civil, couvre TOUS les désordres signalés ou apparus dans l'année ; (2) Garantie biennale 2 ans — art. 1792-3, équipements dissociables (chauffage, VMC, carrelage, luminaires) ; (3) Garantie décennale 10 ans — art. 1792, solidité ouvrage et impropre destination. SANS PV : ces délais ne courent pas, les garanties sont inactivables. C'est pourquoi un PV est OBLIGATOIRE avant paiement du solde final. Sans PV : en cas de litige, nécessité de recours judiciaire pour reconnaissance de réception tacite (6-18 mois supplémentaires).",
  },
  {
    question: 'Quelles mentions obligatoires dans un PV de réception ?',
    answer:
      "Mentions structurant la validité juridique : (1) Date de la réception (point de départ des garanties) ; (2) Identité complète des 2 parties (maître d'ouvrage + entreprise — SIRET) ; (3) Désignation précise de l'ouvrage (adresse + nature travaux + n° devis/contrat) ; (4) État : réception sans réserves / avec réserves / refus ; (5) Liste exhaustive des réserves avec localisation + nature + délai de reprise (typique 30-90 j) ; (6) Date de levée des réserves (laissée vide à ce stade) ; (7) Signatures originales (électroniques acceptées si DocuSign/Yousign qualifiés). Modèles recommandés : AFNOR NF P03-001 (téléchargeable norme) ou formulaire ANIL (gratuit) ou modèle Service-public.fr. En cas de copropriété : syndic visibilité en plus.",
  },
  {
    question: 'Puis-je refuser de signer le PV si désordres graves ?',
    answer:
      "Oui, 3 options. (1) Réception avec réserves — vous signez mais listez les désordres visibles, l'entreprise a 1 an pour les lever (GPA) ; (2) Réception partielle — vous acceptez les parties conformes, refusez les parties non achevées ou gravement défectueuses. À privilégier si désordres localisés (ex : salle de bain OK mais cuisine inachevée) ; (3) Refus total de réception — si ouvrage globalement non conforme rendant l'usage impossible. L'entreprise peut saisir tribunal pour « réception forcée » (6-12 mois délai). Conseil : préférer la réception avec réserves en étant EXHAUSTIF sur la liste — elle oblige l'entreprise à corriger, alors qu'un refus total peut se retourner contre vous si le juge estime le refus abusif.",
  },
  {
    question: 'Que faire si l’entreprise refuse de se présenter à la réception ?',
    answer:
      "Procédure de réception judiciaire (art. 1792-6 al. 1 Code civil). (1) Envoyer LRAR à l'entreprise proposant 3 dates de réception sous 15 j ; (2) Si absence, constat d'absence par huissier (120-200 €) à la date proposée ; (3) Procéder à la réception tacite unilatérale, signée par vous + témoin ou huissier, avec PV détaillé ; (4) Notifier le PV à l'entreprise par LRAR (preuve de la réception « rendue » à elle). Cette réception tacite a valeur juridique depuis jurisprudence Cass. civ. 3e 2017 (n° 16-10.299) : le point de départ des garanties court. Alternatives : (a) procédure amiable médiation CMAP, (b) action au juge des référés (500-1 000 €) pour homologation réception.",
  },
  {
    question: 'Comment lever les réserves après la réception ?',
    answer:
      "Procédure en 4 étapes : (1) L'entreprise effectue les reprises dans le délai fixé au PV (typiquement 30-90 j) ; (2) À l'issue, nouvelle visite contradictoire : vous vérifiez conformité des reprises, un PV de levée de réserves est signé ; (3) Si levée complète : les garanties continuent normalement (GPA jusqu'à 1 an de la réception initiale) ; (4) Si reprise insuffisante : mentionner nouvelles réserves en PV de levée, relancer procédure, ou saisir tribunal si mauvaise foi. Si l'entreprise ne vient pas pour la levée : LRAR mise en demeure sous 15 j, puis levée tacite par constat huissier à la date prévue + facture de la reprise effectuée par tiers (remboursement à demander ensuite). Conserver TOUS les PV et preuves 10 ans.",
  },
]

const sources = [
  {
    label: 'Art. 1792-6 Code civil — GPA',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006442971',
  },
  {
    label: 'NF P03-001 — Modèle PV',
    url: 'https://www.boutique.afnor.org',
  },
  { label: 'ANIL — PV de réception modèle', url: 'https://www.anil.org' },
  { label: 'Service-public.fr — Réception travaux', url: 'https://www.service-public.fr' },
]

const relatedGuides = [
  { label: 'Garantie parfait achèvement', href: '/guides/garantie-parfait-achevement' },
  { label: 'Garantie décennale', href: '/guides/garantie-decennale' },
  { label: 'Malfaçons travaux recours', href: '/guides/malfacons-travaux-recours' },
  { label: 'Retenue de garantie 5 %', href: '/guides/retenue-garantie-5-pourcent' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Réglementation',
    keywords: [
      'réception travaux PV',
      'PV réception modèle',
      'réserves réception travaux',
      'checklist réception chantier',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Réception travaux', url: `/guides/${SLUG}` },
  ])
  const faqSchema = getFAQSchema(faqs)
  const howToSchema = getHowToSchema(howToSteps, {
    name: 'Comment réceptionner des travaux en 7 étapes',
    description:
      'Procédure sécurisée pour signer un PV de réception et activer toutes les garanties légales.',
    totalTime: 'PT3H',
  })
  const schemas = [articleSchema, breadcrumbSchema, faqSchema, howToSchema].filter(
    (s): s is Record<string, unknown> => s !== null
  )
  return (
    <>
      <JsonLd data={schemas} />
      <div className="bg-sand-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Breadcrumb
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Réception travaux' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <FileCheck className="w-3.5 h-3.5" aria-hidden />
              Réglementation · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Réception travaux : PV et checklist 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Le PV de réception déclenche toutes les garanties légales. Voici la checklist en 30
              points, le déroulé précis de la réception et la procédure en cas de désordres pour ne
              jamais perdre vos droits 1 an, 2 ans, 10 ans.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Garanties déclenchées par le PV</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Garantie</th>
                    <th className="p-3 border-b border-sand-200">Durée</th>
                    <th className="p-3 border-b border-sand-200">Couverture</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Parfait achèvement', '1 an', 'TOUS désordres signalés'],
                    ['Biennale (1792-3)', '2 ans', 'Équipements dissociables'],
                    ['Décennale (1792)', '10 ans', 'Solidité + impropre destination'],
                    ['Contractuelle', '5 ans', 'Manquements généraux'],
                  ].map(([g, d, c]) => (
                    <tr key={g} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{g}</td>
                      <td className="p-3 font-semibold">{d}</td>
                      <td className="p-3">{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Ne signez JAMAIS le PV sans visite contradictoire.</strong> Un PV signé sans
                visite terrain = renoncement total aux garanties. Toujours visiter chaque pièce +
                tester chaque équipement + lister les moindres défauts. 3h de visite = 10 ans de
                droits activables.
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
            <Link href="/guides" className="inline-flex items-center gap-1 hover:text-primary-700">
              Autres guides <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
