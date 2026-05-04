/**
 * Page : /renovation-energetique/aides/eco-ptz-pret-zero
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-03, country=fr) :
 * - "eco ptz"                          → 5 289 vol, KD 49, CPC $0,60, clicks 5 630 ⭐⭐
 * - "eco pret a taux zero"             → 295 vol, KD 47, CPC $0,60
 * - "pret a taux zero renovation"      → 30 vol, KD 47, CPC $0,30
 * - "ptz renovation energetique"       → longue traîne
 * - Famille cumulée pivot : ~6 000 vol/mois
 *
 * Source : audit Ahrefs API live (cf docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md)
 * Easy win : MOYEN (KD 47-49, vol cumulé 6K, intent transactionnel)
 *            Concurrence banques (Crédit Agricole, BPCE) + service-public.fr
 *            Atout SA : focus rénovation énergétique uniquement (pas confondu avec PTZ accession)
 * Cluster pillar : Rénovation Énergétique → Aides → Éco-PTZ
 *
 * Anti-cannibalisation :
 *   - Hub /aides/ = panorama 4 dispositifs
 *   - Cette page = HUB éco-PTZ complet (mécanisme, plafonds, cumul, banques agréées)
 *   - Distinct du PTZ accession (achat) — éco-PTZ = travaux uniquement
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  Clock,
  Coins,
  Landmark,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import {
  getBreadcrumbSchema,
  getFAQSchema,
  getFinancialProductSchema,
  getGovernmentServiceSchema,
} from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/aides/eco-ptz-pret-zero'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-04'
const AUTHOR_SLUG = 'claire-dubois'
const AUTHOR_NAME = 'Claire Dubois'

const TITLE = 'Éco-PTZ 2026 : prêt taux zéro 50K€'
const DESCRIPTION =
  'Éco-prêt à taux zéro 2026 : jusquà 50 000 € sans intérêts, 15-20 ans. Conditions déligibilité, banques partenaires et cumul avec MaPrimeRénov.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: getAlternates(PAGE_PATH),
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'article',
    siteName: SITE_NAME,
    publishedTime: PUBLISHED,
    modifiedTime: MODIFIED,
    authors: [`${SITE_URL}/equipe/${AUTHOR_SLUG}`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Éco-PTZ = prêt à taux zéro pour rénovation énergétique du logement (différent du PTZ accession).',
  'Plafond 2026 : 50 000 € pour rénovation d’ampleur, 30 000 € pour 3 actions, 25 000 € pour 2 actions, 15 000 € pour 1 action.',
  'Durée jusqu’à 20 ans (15 ans pour 1 action). Aucune condition de ressources.',
  'Logement > 2 ans, résidence principale ou louée. Travaux par artisan RGE obligatoire.',
  'Cumulable avec MaPrimeRénov’, CEE Coup de pouce, TVA 5,5 %, aides locales.',
  'Distribué par 90 % des banques agréées en France (BNP, Crédit Agricole, Caisse d’Épargne, Banque Populaire…).',
]

const PLAFONDS = [
  {
    type: '1 action seule (par geste)',
    plafond: '15 000 €',
    duree: '15 ans',
    detail: 'Isolation 1 paroi, 1 équipement chauffage/ECS EnR, fenêtres si maison < 1948',
  },
  {
    type: '2 actions',
    plafond: '25 000 €',
    duree: '20 ans',
    detail: 'Combinaison de 2 travaux éligibles distincts (ex. PAC + isolation combles)',
  },
  {
    type: '3 actions ou plus',
    plafond: '30 000 €',
    duree: '20 ans',
    detail: '3 travaux distincts ou plus (ex. PAC + isolation combles + VMC)',
  },
  {
    type: 'Rénovation d’ampleur (gain ≥ 35 %)',
    plafond: '50 000 €',
    duree: '20 ans',
    detail: 'Programme global avec audit énergétique attestant le gain (Parcours accompagné MPR)',
  },
  {
    type: 'Assainissement non collectif',
    plafond: '10 000 €',
    duree: '15 ans',
    detail: 'Remplacement d’un dispositif d’ANC ne consommant pas d’énergie',
  },
]

const TRAVAUX_ELIGIBLES = [
  'Isolation thermique de la toiture',
  'Isolation thermique des murs (ITE ou ITI)',
  'Isolation thermique des planchers bas',
  'Isolation des fenêtres et portes-fenêtres (uniquement si maison construite avant 1948)',
  'Installation/remplacement chauffage à énergie renouvelable (PAC, biomasse, solaire combiné)',
  'Installation/remplacement chauffe-eau à énergie renouvelable (CET, ECSI)',
  'Installation/remplacement VMC double flux',
  'Audit énergétique (cumul possible avec un autre éco-PTZ)',
]

const ETAPES = [
  {
    step: 'Devis artisans RGE',
    detail:
      'Obtenir 1 à 3 devis détaillés d’artisans portant la mention RGE (mention valide à la date du devis). Chaque devis doit indiquer les performances techniques (R, COP, ETAS).',
  },
  {
    step: 'Formulaire éco-PTZ "emprunteur"',
    detail:
      'Remplir le formulaire type "emprunteur" (Cerfa 16273*02). Décrit le projet, les travaux, le coût total, le revenu fiscal de référence (info, pas un critère).',
  },
  {
    step: 'Formulaire "entreprise" par chaque artisan',
    detail:
      'Chaque artisan doit remplir et signer son formulaire "entreprise" attestant des travaux éligibles et de sa mention RGE. Pièce indispensable refusée à l’oral.',
  },
  {
    step: 'Demande à une banque agréée',
    detail:
      'Déposer le dossier complet (formulaires + devis + audit si rénovation d’ampleur) à une banque agréée. 90 % des banques de réseau françaises proposent l’éco-PTZ.',
  },
  {
    step: 'Décision banque',
    detail:
      'Étude habituelle de solvabilité (taux d’endettement, garanties). Le taux est 0 % mais les conditions d’octroi restent celles d’un prêt classique. Délai 4-8 semaines.',
  },
  {
    step: 'Travaux + facture',
    detail:
      'Travaux à réaliser sous 3 ans après émission du prêt. Versement des fonds soit en 1 fois (sur facture acquittée), soit en plusieurs fois (sur factures intermédiaires).',
  },
  {
    step: 'Remboursement à 0 %',
    detail:
      'Mensualités sans intérêts ni frais de dossier (banques agréées prennent en charge). Possibilité de remboursement anticipé sans pénalité.',
  },
]

const faqs = [
  {
    question: 'Qu’est-ce que l’éco-PTZ exactement ?',
    answer:
      'L’éco-PTZ (éco-prêt à taux zéro) est un prêt sans intérêts ni frais de dossier, distribué par les banques françaises agréées, destiné à financer les travaux de rénovation énergétique du logement. Créé en 2009, il finance jusqu’à 50 000 € sur 20 ans pour les rénovations d’ampleur. À ne pas confondre avec le PTZ Accession qui finance l’achat d’un logement neuf.',
  },
  {
    question: 'Qui peut bénéficier de l’éco-PTZ ?',
    answer:
      'Tout propriétaire (occupant ou bailleur) d’un logement de plus de 2 ans, utilisé en résidence principale ou loué. Aucune condition de ressources. Sociétés civiles immobilières (SCI familiales) éligibles. Copropriétés via éco-PTZ Copropriétés (jusqu’à 30 000 € par logement). Le prêt est accordé sous conditions habituelles de solvabilité par la banque.',
  },
  {
    question: 'Quel est le plafond éco-PTZ en 2026 ?',
    answer:
      '50 000 € pour rénovation d’ampleur (gain énergétique ≥ 35 %, attesté par audit), 30 000 € pour 3 actions ou plus, 25 000 € pour 2 actions, 15 000 € pour 1 action seule. La durée maximale est 20 ans pour les rénovations d’ampleur et 15 ans pour 1 action seule. Possibilité de cumul d’un éco-PTZ "audit énergétique" (10 000 €) avec un autre éco-PTZ travaux.',
  },
  {
    question: 'Éco-PTZ est-il cumulable avec MaPrimeRénov’ et CEE ?',
    answer:
      'Oui, totalement. L’éco-PTZ vient en complément des subventions (MPR, CEE) pour financer le reste à charge à 0 %. Schéma typique : MPR + CEE déduits du devis = reste à charge → financé par éco-PTZ → 0 € à charge immédiate, remboursement étalé 15-20 ans à 0 %. Pour le Parcours accompagné MPR, le Mon Accompagnateur Rénov’ aide à monter le dossier éco-PTZ.',
  },
  {
    question: 'Quelles banques distribuent l’éco-PTZ en 2026 ?',
    answer:
      'Plus de 90 % des banques de réseau françaises sont agréées : BNP Paribas, Crédit Agricole, Caisse d’Épargne, Banque Populaire, LCL, Société Générale, La Banque Postale, Crédit Mutuel, CIC, Banque Populaire, BRED. La liste à jour est disponible sur economie.gouv.fr. Les banques en ligne (Boursorama, Hello Bank) ne distribuent généralement PAS l’éco-PTZ.',
  },
  {
    question: 'Quelle différence entre éco-PTZ et PTZ accession ?',
    answer:
      'Le PTZ accession finance l’ACHAT d’un logement neuf ou ancien avec travaux pour primo-accédants (sous conditions de revenus et de zone). L’éco-PTZ finance les TRAVAUX de rénovation énergétique d’un logement déjà possédé (sans condition de revenus). Les deux dispositifs peuvent se cumuler (PTZ pour acheter + éco-PTZ pour rénover). Plafonds, durées et conditions très différents.',
  },
  {
    question: 'Combien de temps pour obtenir l’éco-PTZ ?',
    answer:
      '4 à 8 semaines en moyenne entre le dépôt du dossier complet et le déblocage des fonds. Phase 1 : étude solvabilité par la banque (2-4 semaines). Phase 2 : édition de l’offre de prêt avec délai légal de réflexion 11 jours. Phase 3 : signature et déblocage. Conseil : déposer le dossier en parallèle de la demande MPR pour aligner les calendriers.',
  },
  {
    question: 'Peut-on rembourser l’éco-PTZ par anticipation ?',
    answer:
      'Oui, sans pénalité (article L. 312-21 Code de la Consommation). Le remboursement anticipé partiel ou total est possible à tout moment, sans frais ni indemnités. Cas typique : une rentrée d’argent (héritage, vente, prime) permet de solder le prêt. Démarche : courrier RAR à la banque indiquant le montant et la date souhaitée. Délai de prise en compte : 30 jours.',
  },
]

const sources = [
  {
    label: 'Service-Public.fr — Éco-PTZ 2026',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F19905',
  },
  {
    label: 'Économie.gouv.fr — Liste banques agréées',
    url: 'https://www.economie.gouv.fr/cedef/eco-pret-taux-zero',
  },
  { label: 'France Rénov’ — Éco-PTZ', url: 'https://france-renov.gouv.fr/aides/eco-ptz' },
  {
    label: 'Légifrance — Article 244 quater U du CGI',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000045803032',
  },
  {
    label: 'ANIL — Éco-PTZ guide pratique',
    url: 'https://www.anil.org/aides-locales-travaux/eco-ptz/',
  },
]

const relatedPages = [
  {
    label: 'Hub aides rénovation énergétique 2026',
    href: '/renovation-energetique/aides',
    description: '4 dispositifs nationaux + cumul',
  },
  {
    label: 'MaPrimeRénov’ 2026',
    href: '/renovation-energetique/aides/maprimerenov-2026',
    description: 'Subvention principale Anah cumulable',
  },
  {
    label: 'CEE Coup de pouce',
    href: '/renovation-energetique/aides/cee-certificats-economie-energie',
    description: 'Prime énergie cumulable',
  },
  {
    label: 'Prime Coup de Pouce',
    href: '/renovation-energetique/aides/prime-coup-de-pouce',
    description: 'Bonification CEE PAC + biomasse',
  },
  {
    label: 'Parcours accompagné MPR',
    href: '/renovation-energetique/aides/maprimerenov-2026/parcours-accompagne',
    description: 'Couvrir le reste à charge avec éco-PTZ',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'Calcul personnalisé instantané',
  },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: PAGE_PATH,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Éco-PTZ',
    keywords: [
      'eco ptz',
      'eco pret a taux zero',
      'pret a taux zero renovation',
      'ptz renovation energetique',
      'eco ptz 2026',
      'banques eco ptz',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Aides', url: '/renovation-energetique/aides' },
    { name: 'Éco-PTZ', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'Éco-prêt à taux zéro (éco-PTZ) 2026',
    description:
      'Prêt sans intérêts ni frais de dossier distribué par les banques agréées françaises pour financer la rénovation énergétique des logements de plus de 2 ans. Plafond 50 000 € sur 20 ans pour rénovation d’ampleur. Aucune condition de ressources.',
    url: PAGE_URL,
    serviceType: 'Prêt aidé public-privé',
    audience: 'Propriétaires occupants, bailleurs, copropriétés',
  })
  const finProductSchema = getFinancialProductSchema({
    name: 'Éco-prêt à taux zéro (éco-PTZ) 2026',
    description:
      'Prêt à taux zéro pour la rénovation énergétique. Sans intérêts, sans frais de dossier, durée jusqu’à 20 ans, plafond 50 000 € pour rénovation d’ampleur.',
    url: PAGE_URL,
    category: 'Government-Backed Loan',
    amount: '15 000 € à 50 000 €',
    annualPercentageRate: 0,
    interestRate: 0,
    feesAndCommissionsSpecification:
      'Aucun frais de dossier ni intérêts. Remboursement anticipé sans pénalité.',
  })
  const schemas = [articleSchema, breadcrumbSchema, faqSchema, govSchema, finProductSchema].filter(
    (s): s is Record<string, unknown> => s !== null
  )

  return (
    <>
      <JsonLd data={schemas} />
      <div className="bg-sand-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { label: 'Rénovation énergétique', href: '/renovation-energetique' },
              { label: 'Aides', href: '/renovation-energetique/aides' },
              { label: 'Éco-PTZ' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Landmark className="w-3.5 h-3.5" aria-hidden />
              Sans intérêts — Banques agréées
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Éco-PTZ 2026 : prêt à taux zéro pour rénovation énergétique
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              L’<strong>éco-PTZ</strong> est un prêt à taux zéro distribué par 90 % des banques
              françaises pour financer la rénovation énergétique de votre logement. En 2026, il
              atteint <strong>50 000 €</strong> sur <strong>20 ans</strong> pour les rénovations
              d’ampleur, sans intérêts, sans frais de dossier et sans condition de ressources. À ne
              pas confondre avec le PTZ accession.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="plafonds">Plafonds 2026 selon le type de projet</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Type de projet</th>
                    <th className="p-3 border-b border-sand-200">Plafond</th>
                    <th className="p-3 border-b border-sand-200">Durée max</th>
                    <th className="p-3 border-b border-sand-200">Détail</th>
                  </tr>
                </thead>
                <tbody>
                  {PLAFONDS.map((p) => (
                    <tr key={p.type} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{p.type}</td>
                      <td className="p-3 text-primary-700 font-semibold">{p.plafond}</td>
                      <td className="p-3">{p.duree}</td>
                      <td className="p-3 text-sand-600 text-xs">{p.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 id="travaux">Travaux éligibles éco-PTZ 2026</h2>
            <ul>
              {TRAVAUX_ELIGIBLES.map((t) => (
                <li key={t}>
                  <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
            <p className="text-xs text-sand-500">
              Source : article 244 quater U du Code Général des Impôts. Travaux exclus : ravalement
              esthétique, climatisation seule (sans PAC réversible), menuiseries hors maison &lt;
              1948.
            </p>

            <h2 id="conditions">Conditions logement et emprunteur</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Logement <strong>achevé depuis plus de 2 ans</strong> à la date de demande.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Logement utilisé en <strong>résidence principale</strong> (du propriétaire ou du
                locataire).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Aucune condition de ressources</strong> (le revenu n’influence pas l’octroi,
                mais la solvabilité est étudiée par la banque).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Travaux réalisés par <strong>artisan RGE</strong> exclusivement (pas
                d’auto-réalisation).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Travaux à <strong>terminer sous 3 ans</strong> après émission du prêt.
              </li>
            </ul>

            <h2 id="etapes">Démarche en 7 étapes</h2>
            <div className="not-prose my-6">
              <ol className="space-y-3 list-none m-0 p-0">
                {ETAPES.map((s, i) => (
                  <li
                    key={s.step}
                    className="bg-white border border-sand-200 rounded-xl p-4 flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-700 text-white grid place-items-center shrink-0 font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-sand-900 m-0">{s.step}</p>
                      <p className="text-sm text-sand-700 mt-1 mb-0">{s.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <h2 id="cumul">Stratégie de cumul optimale</h2>
            <p>
              L’éco-PTZ est l’aide qui finance le <strong>reste à charge à 0 %</strong> après
              déduction des subventions :
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 my-6">
              <p className="text-sm text-sand-900 m-0 mb-3 font-semibold">
                Exemple : rénovation d’ampleur 60 000 € HT — ménage modeste (Jaune)
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                <span className="text-sand-600">Devis HT</span>
                <span className="text-sand-900 font-medium text-right">60 000 €</span>
                <span className="text-sand-600">MaPrimeRénov’ Parcours accompagné (60 %)</span>
                <span className="text-primary-700 font-medium text-right">- 36 000 €</span>
                <span className="text-sand-600">CEE Coup de pouce</span>
                <span className="text-primary-700 font-medium text-right">- 4 500 €</span>
                <span className="text-sand-900 font-bold pt-2 border-t border-sand-200">
                  Reste à charge
                </span>
                <span className="text-sand-900 font-bold pt-2 border-t border-sand-200 text-right">
                  19 500 €
                </span>
                <span className="text-primary-700 font-semibold mt-1">
                  Financé par éco-PTZ (20 ans à 0 %)
                </span>
                <span className="text-primary-700 font-semibold text-right mt-1">~81 €/mois</span>
              </div>
              <p className="text-xs text-sand-500 italic mt-3 mb-0">
                Reste à charge immédiat = 0 €. Mensualité 81 €/mois sur 20 ans à 0 %, à comparer
                avec l’économie chauffage 90-150 €/mois après PAC + isolation.
              </p>
            </div>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Estimer votre éco-PTZ + autres aides
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Calcul instantané MPR + CEE + éco-PTZ. Mensualité 0 % calculée selon plafond et
                    durée (15 ou 20 ans) selon votre projet.
                  </p>
                  <Link
                    href="/simulateur-aides-renovation"
                    className="inline-flex items-center gap-1.5 bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
                  >
                    Lancer le simulateur <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>

            <h2 id="banques">Banques agréées 2026</h2>
            <p>
              Plus de 90 % des banques de réseau françaises sont agréées éco-PTZ. Liste à jour sur{' '}
              <a
                href="https://www.economie.gouv.fr/cedef/eco-pret-taux-zero"
                target="_blank"
                rel="noopener noreferrer"
              >
                economie.gouv.fr
              </a>
              .
            </p>
            <ul>
              <li>BNP Paribas</li>
              <li>Crédit Agricole (Caisses Régionales)</li>
              <li>Caisse d’Épargne (Caisses Régionales)</li>
              <li>Banque Populaire (Caisses Régionales)</li>
              <li>LCL</li>
              <li>Société Générale</li>
              <li>La Banque Postale</li>
              <li>Crédit Mutuel + CIC</li>
              <li>BRED</li>
              <li>HSBC France (sous conditions)</li>
            </ul>
            <p className="text-xs text-sand-500">
              Banques en ligne (Boursorama, Hello Bank, Fortuneo) : ne distribuent généralement PAS
              l’éco-PTZ. Recourir à la banque traditionnelle d’adossement.
            </p>

            <div className="not-prose flex items-start gap-3 border border-amber-200 bg-amber-50 rounded-lg p-4 my-6">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">Attention solvabilité</p>
                <p className="m-0">
                  Le taux 0 % ne garantit pas l’octroi : la banque étudie votre solvabilité comme un
                  prêt classique (taux d’endettement &lt; 35 %, revenus stables). En cas de refus,
                  options : (1) garant solidaire, (2) montage avec un courtier en travaux (frais 1-2
                  %), (3) découpage du projet en plusieurs éco-PTZ étalés sur plusieurs années (un
                  éco-PTZ "audit" puis un éco-PTZ "travaux").
                </p>
              </div>
            </div>

            <h2 id="durees">Durées et conditions de remboursement</h2>
            <ul>
              <li>
                <Clock className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Durée standard</strong> : 15 ans pour 1 action, 20 ans pour 2+ actions et
                rénovation d’ampleur.
              </li>
              <li>
                <TrendingUp className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Mensualités</strong> : pas d’intérêts, pas d’assurance imposée, mensualités
                constantes.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Remboursement anticipé</strong> : autorisé sans pénalité (article L. 312-21
                Code Conso).
              </li>
            </ul>
          </article>

          <FlagshipFaq items={faqs} />
          <FlagshipSources sources={sources} />

          <section className="my-10">
            <h2 className="font-heading text-xl font-semibold text-sand-900 mb-4">
              Pour aller plus loin
            </h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {relatedPages.map((g) => (
                <li key={g.href}>
                  <Link
                    href={g.href}
                    className="flex items-start justify-between gap-2 bg-white border border-sand-200 rounded-lg p-4 hover:border-primary-400 hover:shadow-sm transition-all"
                  >
                    <div>
                      <p className="text-sm font-semibold text-sand-900 m-0">{g.label}</p>
                      <p className="text-xs text-sand-600 mt-1 mb-0">{g.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-sand-400 shrink-0 mt-1" aria-hidden />
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

          <div className="flex items-center justify-between text-sm text-sand-600 border-t border-sand-200 pt-4 mt-6">
            <Link
              href="/renovation-energetique/aides"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Aides
            </Link>
            <Link
              href="/rge/renovation-energetique"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Artisans RGE <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
