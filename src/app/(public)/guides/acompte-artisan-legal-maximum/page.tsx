import type { Metadata } from 'next'
import Link from 'next/link'
import { Euro, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'acompte-artisan-legal-maximum'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'

export const revalidate = 86400

const TITLE = 'Acompte artisan : plafond légal, règles, risques 2026'
const DESCRIPTION =
  'Acompte artisan : pas de plafond légal mais usages professionnels 30-40 %. Arrhes vs acompte, garanties, récupération, modèle clause devis, prescription.'

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
    authors: [`${SITE_URL}/equipe/claire-dubois`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Pas de plafond légal dédié aux acomptes en droit français. Pratique acceptée : 20-40 % à la signature, usages confédérations CAPEB / FFB.',
  'Art. 1590 Code civil distingue arrhes (permettent rétractation avec pénalité) vs acompte (engagement ferme, restitution si non-exécution).',
  'Plus de 50 % d’acompte = signal d’alerte majeur (trésorerie insuffisante, risque faillite) sauf matériel sur-mesure justifié.',
  'Obligation : devis daté/signé avant tout versement. Chèque bancaire nominatif recommandé (traçabilité). Refuser virement anonyme / espèces.',
  'Prescription récupération acompte : 5 ans (art. 2224) en l’absence d’exécution + 2 ans pour vice du consentement.',
]

const faqs = [
  {
    question: 'Quel est le pourcentage d’acompte acceptable ?',
    answer:
      "Usages professionnels (CAPEB, FFB, Confédération de l'Artisanat) : (1) Travaux standards <10 000 € : 25-30 % à la signature ; (2) Travaux 10-30 000 € : 20-30 % + échelonnement selon avancement ; (3) Travaux >30 000 € : 15-25 % + 3-4 paiements échelonnés ; (4) Matériel sur mesure (cuisine, menuiseries, verrière) : jusqu'à 40-50 % justifié par commande usine. Au-delà de 50 % : demandez justification écrite détaillée (fournisseur non négociable, matériel prépayé) + attestation bancaire solvabilité. Une entreprise saine n'exige jamais >50 % sans raison documentée.",
  },
  {
    question: 'Arrhes ou acompte : quelle différence juridique ?',
    answer:
      "Distinction cruciale — art. 1590 Code civil : (1) Arrhes = versement avec faculté de rétractation réciproque. Si client se rétracte : perte des arrhes. Si artisan se rétracte : restitution arrhes + somme égale. Mention explicite devis « arrhes » obligatoire ; (2) Acompte = engagement ferme définitif. Aucune rétractation possible (hors 14 j démarchage à domicile). Artisan ne livre pas : restitution acompte + dommages-intérêts possibles. En doute : la jurisprudence qualifie d'acompte par défaut. Pour sécuriser votre flexibilité : exiger mention « arrhes » par écrit. Pour sécuriser la livraison : garder le terme « acompte ».",
  },
  {
    question: 'Comment récupérer un acompte si l’artisan n’exécute pas ?',
    answer:
      "Procédure en 4 étapes : (1) Lettre recommandée AR à l'artisan lui demandant exécution ou remboursement sous 30 j + rappel art. 1219 Code civil + intérêts au taux légal (6,82 % en 2024) ; (2) Si refus, mise en demeure LRAR + délai 15 j + annonce saisie tribunal ; (3) Saisie tribunal judiciaire de proximité si <10 000 € (formulaire cerfa 16042, sans avocat) ; (4) Si liquidation judiciaire de l'entreprise : déclaration de créance au mandataire sous 2 mois à partir de la publication au BODACC. Taux de récupération moyen : 85-95 % si entreprise solvable, 20-40 % si liquidation. Assurance protection juridique (MRH) couvre souvent frais avocat.",
  },
  {
    question: 'Quelles précautions avant de verser un acompte ?',
    answer:
      "Checklist sécurisation : (1) Devis daté, signé des 2 parties, mention manuscrite « bon pour accord », SIRET, RC Pro, décennale ; (2) Vérifier SIRET actif sur annuaire-entreprises.data.gouv.fr (5 min) ; (3) Vérifier activité depuis >2 ans (stabilité financière minimale) ; (4) Vérifier attestation décennale en cours (année en cours), nominative, métier concerné ; (5) Payer par chèque bancaire nominatif (traçabilité) — refuser espèces > 1 000 € ou virement vers compte non nominatif ; (6) Obtenir facture d'acompte datée avec mention « acompte sur travaux » + numérotation (TVA déductible si pro) ; (7) Conserver preuves 10 ans (durée décennale).",
  },
  {
    question: 'L’artisan refuse de fournir une facture d’acompte : que faire ?',
    answer:
      "C'est une infraction caractérisée. Art. 289 CGI + art. L441-9 Code de commerce : facture obligatoire pour toute prestation de services à un particulier dès 25 € (à la demande du client) ou systématique dès 1 500 €. Refus = amende 75 000 € pour l'artisan. Démarches : (1) LRAR formelle exigeant la facture sous 8 j avec mention de ces textes ; (2) Si refus persistant, signalement DGCCRF via signal.conso.gouv.fr + à l'URSSAF (suspicion travail dissimulé) ; (3) Demande immédiate de remboursement acompte si refus : rupture du contrat pour faute = restitution + dommages-intérêts. Un artisan sérieux délivre systématiquement facture d'acompte dans les 48 h.",
  },
]

const sources = [
  {
    label: 'Art. 1590 Code civil — Arrhes',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006441636',
  },
  {
    label: 'Art. 2224 Code civil — Prescription 5 ans',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000019017139',
  },
  {
    label: 'Art. 289 CGI — Facturation obligatoire',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044989926',
  },
  { label: 'CAPEB — Usages acompte', url: 'https://www.capeb.fr' },
  { label: 'Service-public.fr — Acompte arrhes', url: 'https://www.service-public.fr' },
]

const relatedGuides = [
  { label: 'Malfaçons travaux : recours', href: '/guides/malfacons-travaux-recours' },
  { label: 'Garantie parfait achèvement', href: '/guides/garantie-parfait-achevement' },
  { label: 'Refuser un devis signé', href: '/guides/refuser-devis-artisan-signe' },
  { label: 'Éviter les arnaques artisan', href: '/guides/eviter-arnaques-artisan' },
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
      'acompte artisan',
      'acompte légal maximum',
      'arrhes acompte différence',
      'récupérer acompte',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Acompte artisan', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Acompte artisan' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Euro className="w-3.5 h-3.5" aria-hidden />
              Réglementation · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Acompte artisan : plafond, règles, sécurité
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Aucun texte ne fixe de plafond légal, mais les usages professionnels et la
              jurisprudence sont clairs. Voici les pourcentages acceptables, la différence arrhes vs
              acompte et comment récupérer votre argent en cas de défaillance de l’artisan.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Pourcentages d’acompte acceptables selon montant</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Montant travaux</th>
                    <th className="p-3 border-b border-sand-200">Acompte accepté</th>
                    <th className="p-3 border-b border-sand-200">Max tolérable</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['< 5 000 €', '30 %', '40 %'],
                    ['5 000 - 15 000 €', '25-30 %', '40 %'],
                    ['15 000 - 30 000 €', '20-25 %', '35 %'],
                    ['> 30 000 €', '15-25 %', '30 %'],
                    ['Matériel sur-mesure', '30-40 %', '50 % (justifié)'],
                  ].map(([m, a, max]) => (
                    <tr key={m} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{m}</td>
                      <td className="p-3 font-semibold">{a}</td>
                      <td className="p-3">{max}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Acompte &gt; 50 % = alerte rouge.</strong> Sauf matériel sur-mesure avec
                facture fournisseur à l’appui, une demande &gt;50 % révèle souvent une trésorerie
                fragile. 70 % des escroqueries travaux commencent par un acompte surélevé.
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
