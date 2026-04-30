import type { Metadata } from 'next'
import Link from 'next/link'
import { Scale, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'retenue-garantie-5-pourcent'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'

export const revalidate = 86400

const TITLE = 'Retenue de garantie 5 % : règles 2026'
const DESCRIPTION =
  'Retenue de garantie 5 % : loi 16 juillet 1971, clause type devis, consignation Caisse des Dépôts, libération 1 an après réception, caution bancaire alternative.'

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
  'Loi du 16 juillet 1971 : retenue 5 % MAX sur chaque paiement, pendant toute la durée des travaux + 1 an après réception (GPA).',
  'Application : uniquement sur marchés privés écrits + clause expresse dans devis. Pas de retenue automatique sans mention.',
  'Consignation obligatoire à la Caisse des Dépôts et Consignations (CDC) — pas de rétention dans les comptes du maître d’ouvrage.',
  'Alternative : caution bancaire 5 % du marché fournie par l’entreprise remplace la retenue. Coût pour artisan : 0,5-1,5 % du marché.',
  'Libération automatique 1 an après réception SI aucune réserve n’est non levée. Sinon : retenue prolongée jusqu’à levée complète.',
]

const faqs = [
  {
    question: 'Qu’est-ce que la retenue de garantie 5 % ?',
    answer:
      "Mécanisme de la loi n° 71-584 du 16 juillet 1971 (codifiée art. 1799-1 Code civil) : le maître d'ouvrage peut retenir jusqu'à 5 % du montant de chaque paiement intermédiaire pour garantir la bonne exécution des travaux et la levée des réserves signalées dans le PV de réception. Cette retenue est CONSIGNÉE à la Caisse des Dépôts et Consignations (pas conservée par le client) et libérée automatiquement 1 an après la réception des travaux si aucune réserve n'est en suspens. Alternative : l'entreprise peut fournir une caution bancaire de 5 % en remplacement. Objectif : protéger le client sans priver l'entreprise de sa trésorerie définitivement.",
  },
  {
    question: 'La retenue de 5 % est-elle automatique ?',
    answer:
      "NON. Contrairement à une idée reçue, la retenue de garantie n'est PAS automatique. Elle doit être : (1) prévue par une clause expresse dans le contrat/devis signé avant travaux ; (2) appliquée strictement dans la limite de 5 % par paiement ; (3) consignée à la CDC (pas conservée chez soi). Si le devis ne mentionne pas cette retenue, l'entreprise peut refuser qu'elle soit appliquée — la facture doit être payée intégralement. C'est donc une NÉGOCIATION avant signature : insérer la clause pour se protéger (typique travaux >30 000 €), ou accepter sans si relation de confiance + projet simple.",
  },
  {
    question: 'Comment consigner la retenue à la CDC ?',
    answer:
      "Procédure de consignation : (1) Télécharger formulaire de consignation sur caissedesdepots.fr (formulaire dédié retenue garantie 5 %) ; (2) Remplir avec : identités des 2 parties, montant, numéro contrat, adresse chantier ; (3) Virement SEPA à la CDC avec référence du dossier ; (4) Conserver justificatif de consignation 10 ans ; (5) Informer l'entreprise par LRAR avec copie justificatif. Coût : GRATUIT (la CDC ne prélève pas de frais de gestion). Rémunération : intérêts CDC versés au maître d'ouvrage à la libération. Libération automatique 1 an après réception avec justificatif levée des réserves OU absence de contestation.",
  },
  {
    question: 'Caution bancaire vs retenue : quelle différence ?',
    answer:
      "Alternatives équivalentes juridiquement : (1) Retenue de garantie 5 % : le client retient 5 % et consigne à la CDC. Avantages : sécurité maximale pour le client, libération automatique si pas de réserves. Inconvénients : complexité administrative, privation trésorerie pour entreprise ; (2) Caution bancaire 5 % du marché : l'entreprise obtient de sa banque une caution bancaire à hauteur de 5 % qui garantit au client l'exécution. Avantages : plus simple, l'entreprise garde sa trésorerie. Inconvénients : coût pour l'entreprise (0,5-1,5 % du marché facturé au client + commission bancaire 50-200 €), solidité dépend de la banque émettrice. Pour >50 k€ : caution bancaire plus fréquente en pratique.",
  },
  {
    question: 'Quand et comment libérer la retenue ?',
    answer:
      "Libération automatique au 365e jour à compter de la réception des travaux (signée PV). Procédure : (1) Si réception sans réserves : pas d'action nécessaire, la CDC libère les fonds au 1er anniversaire automatiquement, crédit sur compte entreprise ; (2) Si réception avec réserves : libération CONDITIONNÉE à la levée de toutes les réserves. L'entreprise doit apporter la preuve de la levée (attestations, photos, constat) et le client doit signer mainlevée ; (3) Si litige en cours : retenue prolongée jusqu'à décision judiciaire. Attention : certains clients oublient de signer la mainlevée, bloquant inutilement les fonds. Envoyer LRAR récapitulative à la CDC à échéance du 1 an + demande active de libération.",
  },
]

const sources = [
  {
    label: 'Loi 71-584 du 16 juillet 1971 — Retenue',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000874235',
  },
  {
    label: 'Art. 1799-1 Code civil',
    url: 'https://www.legifrance.gouv.fr',
  },
  { label: 'Caisse des Dépôts — Consignation', url: 'https://www.caissedesdepots.fr' },
  { label: 'Service-public.fr — Retenue garantie', url: 'https://www.service-public.fr' },
]

const relatedGuides = [
  { label: 'Acompte artisan : plafond', href: '/guides/acompte-artisan-legal-maximum' },
  { label: 'Garantie parfait achèvement', href: '/guides/garantie-parfait-achevement' },
  { label: 'Malfaçons travaux : recours', href: '/guides/malfacons-travaux-recours' },
  {
    label: 'Chantier abandonné : recours',
    href: '/guides/chantier-abandonne-artisan-recours',
  },
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
      'retenue de garantie 5',
      'loi 1971 retenue garantie',
      'consignation CDC retenue',
      'caution bancaire 5 % travaux',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Retenue garantie 5 %', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Retenue garantie 5 %' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Scale className="w-3.5 h-3.5" aria-hidden />
              Réglementation · Guide vérifié
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Retenue de garantie 5 % : tout comprendre
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              La retenue de garantie 5 % protège le client pendant 1 an après réception des travaux.
              Voici le cadre légal de la loi du 16 juillet 1971, les obligations de consignation à
              la CDC et l’alternative caution bancaire pour les marchés &gt;30 000 €.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Retenue 5 % vs caution bancaire</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Critère</th>
                    <th className="p-3 border-b border-sand-200">Retenue 5 %</th>
                    <th className="p-3 border-b border-sand-200">Caution bancaire</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Complexité admin', 'Moyenne (CDC)', 'Faible'],
                    ['Trésorerie artisan', 'Privée de 5 %', 'Maintenue'],
                    ['Coût artisan', '0 €', '0,5-1,5 % + 50-200 €'],
                    ['Sécurité client', '★★★★★', '★★★★ (si banque solide)'],
                    ['Durée', '1 an (GPA)', '1 an (GPA)'],
                  ].map(([c, r, cau]) => (
                    <tr key={c} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{c}</td>
                      <td className="p-3">{r}</td>
                      <td className="p-3">{cau}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Retenue non consignée = faute.</strong> Conserver 5 % sur compte personnel
                sans déposer à la CDC = violation loi 1971. L’entreprise peut exiger immédiatement
                le paiement + intérêts moratoires. Obligation : consigner CDC sous 15 j.
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
