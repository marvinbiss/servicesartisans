import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'assurance-habitation-travaux'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Sophie Martin'

export const revalidate = 86400

const TITLE = 'Assurance habitation et travaux 2026'
const DESCRIPTION =
  'Assurance habitation et travaux : déclaration préalable, augmentation temporaire de prime, couverture pendant chantier, dommages-ouvrage, RC travaux.'

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
    authors: [`${SITE_URL}/equipe/sophie-martin`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Déclaration travaux à l’assureur obligatoire si modification structurelle ou augmentation valeur >10 %.',
  'MRH classique couvre les conséquences accidentelles (incendie, dégât des eaux, bris) pendant travaux.',
  'Ne couvre PAS : malfaçons, sinistres dus aux travaux eux-mêmes, vol matériaux chantier.',
  '2 assurances spécifiques : Dommages-Ouvrage (0,8-3 % coût travaux, préfinance réparation) + garantie décennale entreprise.',
  'Travaux importants (>10 k€ ou modification structure) : signaler par LRAR à l’assureur 15 jours avant.',
]

const faqs = [
  {
    question: 'Dois-je prévenir mon assureur avant des travaux ?',
    answer:
      'Oui dans 4 cas : (1) modification structurelle (abattre un mur porteur, surélévation), (2) création de surface >10 % (extension), (3) augmentation significative de la valeur assurée (cuisine équipée haut de gamme, domotique, piscine), (4) changement de destination des pièces (garage → chambre). Déclaration par lettre recommandée 15 jours avant début travaux, avec plan, devis, entreprise, calendrier. Risque si oubli : nullité garantie en cas de sinistre.',
  },
  {
    question: 'Mon assurance couvre-t-elle pendant les travaux ?',
    answer:
      "MRH classique couvre les mêmes garanties (incendie, dégât des eaux, catastrophes naturelles, vol si pénétration effraction) PENDANT les travaux, sauf clause d'exclusion spécifique. Ce qu'elle NE couvre PAS : (1) malfaçons et vices cachés des travaux (garantie décennale entreprise), (2) dégâts causés par les artisans eux-mêmes (leur RC pro), (3) vol de matériaux sur chantier non livrés (assurance chantier à souscrire si valeur >5 k€). Lire clauses 'travaux' de son contrat.",
  },
  {
    question: 'Quelle est la différence entre Dommages-Ouvrage et décennale ?',
    answer:
      "Garantie décennale : obligatoire pour l'ENTREPRISE (art. 1792 Code civil), couvre 10 ans les défauts compromettant la solidité ou l'usage de l'ouvrage. Assurance Dommages-Ouvrage (DO) : obligatoire pour le MAÎTRE D'OUVRAGE (art. L242-1 Code assurances), pré-finance les réparations décennales sans attendre les expertises. Coût DO : 0,8-3 % du coût travaux. Sans DO, un sinistre peut prendre 2-5 ans à régler en justice. Obligatoire si revente du bien dans les 10 ans.",
  },
  {
    question: 'Mes meubles sont-ils assurés pendant les travaux ?',
    answer:
      "Oui, si vous n'avez pas vidé le logement. MRH couvre mobilier contre incendie, dégât des eaux, tempête, catastrophes naturelles. Pour vol : nécessite signe d'effraction (serrure forcée). Recommandation : (1) photographier/inventorier les biens de valeur avant travaux, (2) ranger bijoux et documents au coffre/banque, (3) si logement vide, garantie 'inoccupation' parfois limitée à 90 jours, au-delà négocier ou souscrire avenant temporaire (+10-30 €/mois).",
  },
  {
    question: 'Combien coûte une assurance Dommages-Ouvrage ?',
    answer:
      "Tarif 2026 : 0,8-3 % du montant total des travaux (médian 1,5 %). Pour 50 000 € travaux : 400-1 500 €, médian 750 €. Facteurs : expérience maître d'oeuvre, type d'ouvrage (neuf vs rénovation), garanties supplémentaires (GPA, biennale). Souscrire AVANT démarrage travaux obligatoirement. Comparateur recommandé : MMA, AXA, SMA BTP, GAN, Le Figaro Assurance. Garantie valable 10 ans à compter de la réception des travaux. Revente obligatoire: la fournir à l'acheteur.",
  },
]

const sources = [
  { label: 'Code des assurances — Art. L242-1', url: 'https://www.legifrance.gouv.fr' },
  { label: 'Service-public.fr — Dommages-Ouvrage', url: 'https://www.service-public.fr' },
  { label: 'ANIL — Assurance travaux', url: 'https://www.anil.org' },
  { label: 'FFA — Fédération Française Assurances', url: 'https://www.franceassureurs.fr' },
]

const relatedGuides = [
  { label: 'Assurance dommage ouvrage', href: '/guides/assurance-dommage-ouvrage' },
  { label: 'Garantie décennale', href: '/guides/garantie-decennale' },
  { label: 'Garantie parfait achèvement 1 an', href: '/guides/garantie-parfait-achevement' },
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
    section: 'Réglementation',
    keywords: [
      'assurance habitation travaux',
      'déclaration travaux assureur',
      'dommages-ouvrage',
      'MRH travaux',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Assurance habitation travaux', url: `/guides/${SLUG}` },
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
            items={[
              { label: 'Guides', href: '/guides' },
              { label: 'Assurance habitation travaux' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
              Réglementation · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Assurance habitation et travaux : couverture réelle
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Quelle couverture de votre MRH pendant les travaux ? Faut-il souscrire une
              Dommages-Ouvrage ? Voici les 4 cas où prévenir l’assureur, les couvertures qui
              s’appliquent, et les assurances complémentaires indispensables.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Les 3 niveaux d’assurance</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Assurance</th>
                    <th className="p-3 border-b border-sand-200">Souscripteur</th>
                    <th className="p-3 border-b border-sand-200">Obligatoire</th>
                    <th className="p-3 border-b border-sand-200">Couverture</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [
                      'MRH (multirisque)',
                      'Propriétaire/locataire',
                      'Oui (locataire)',
                      'Accidents classiques',
                    ],
                    [
                      'Dommages-Ouvrage',
                      'Maître d’ouvrage',
                      'Oui (si gros travaux)',
                      'Préfinance décennale',
                    ],
                    ['Décennale', 'Entreprise', 'Oui (entreprise)', 'Malfaçons structure 10 ans'],
                    ['RC Travaux', 'Maître d’ouvrage', 'Non mais conseillé', 'Dommages aux tiers'],
                  ].map(([a, s, o, c]) => (
                    <tr key={a} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{a}</td>
                      <td className="p-3">{s}</td>
                      <td className="p-3">{o}</td>
                      <td className="p-3">{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Dommages-Ouvrage obligatoire pour gros travaux.</strong> Art. L242-1 Code
                assurances : obligatoire pour maison neuve et gros travaux rénovation. Absence =
                amende 45 000 €. En pratique jamais sanctionné mais problème lourd à la revente dans
                les 10 ans : acheteur refuse ou négocie forte décote.
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
              href="/services/architecte"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un architecte <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
