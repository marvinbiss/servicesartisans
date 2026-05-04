/**
 * Page : /renovation-energetique/aides/cee-certificats-economie-energie
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-03, country=fr) :
 * - "cee"                              → 20 831 vol, KD 54, CPC $1,20 ⭐⭐
 * - "certificat economie energie"      → 1 000 vol, KD 47, CPC $1,10
 * - "prime energie"                    → ~3 000 vol, KD 50 (variant)
 * - "coup de pouce chauffage"          → 1 061 vol, KD 33, CPC $1,80 ⭐ (dans page coup-de-pouce dédiée)
 * - Famille cumulée pivot : ~25 000 vol/mois (gros KD mais volume massif)
 *
 * Source : audit Ahrefs API live (cf docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md)
 * Easy win : NON (KD 47-54) mais incontournable cluster aides : ~25K vol cumulé.
 *            Stratégie = E-E-A-T fort (Ministère + ADEME) + ancre vers /prime-coup-de-pouce/ et autres aides
 * Cluster pillar : Rénovation Énergétique → Aides → CEE
 *
 * Anti-cannibalisation :
 *   - Hub /aides/ = panorama 4 dispositifs
 *   - Cette page = HUB CEE complet (mécanisme, montants standard, Coup de pouce mention courte)
 *   - Sub /prime-coup-de-pouce/ = focus Coup de pouce chauffage et isolation (KW 1 061 vol)
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  Coins,
  Sparkles,
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
import { getBreadcrumbSchema, getFAQSchema, getGovernmentServiceSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/aides/cee-certificats-economie-energie'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-04'
const AUTHOR_SLUG = 'claire-dubois'
const AUTHOR_NAME = 'Claire Dubois'

const TITLE = 'CEE 2026 : Certificats Économie Énergie'
const DESCRIPTION =
  'Certificats Économie Énergie 2026 : barèmes par opération, primes Coup de pouce, rôle du mandataire, fonctionnement complet expliqué.'

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
  'CEE = dispositif obligeant les fournisseurs d’énergie (Total, EDF, Engie…) à financer des travaux d’économie d’énergie.',
  '5e période en cours : 2022-2025, prolongée 2026 — 3 100 TWh cumac à atteindre.',
  'Prime versée par l’artisan (déduite du devis) ou par l’énergéticien (chèque, virement).',
  'Coup de pouce chauffage : 2 500-5 000 € pour PAC, biomasse en remplacement chaudière fioul/gaz.',
  'Coup de pouce isolation : 10-20 €/m² pour combles, planchers, ITE.',
  'Cumulable MaPrimeRénov’, éco-PTZ, TVA 5,5 % — pas de plafond ressources (mais bonification ménages modestes).',
]

const FONCTIONNEMENT = [
  {
    step: 'Obligation Pouvoirs Publics',
    detail:
      'Les "obligés" (fournisseurs d’énergie : EDF, Total, Engie, etc.) ont une obligation de réaliser un volume d’économies d’énergie chez leurs clients. Mesuré en kWh cumac (kWh cumulés actualisés sur la durée de vie des équipements).',
  },
  {
    step: 'Devis artisan RGE',
    detail:
      'Vous demandez un devis à un artisan RGE pour des travaux éligibles (PAC, isolation, biomasse…). L’artisan ou l’énergéticien partenaire vous propose une prime CEE.',
  },
  {
    step: 'Acceptation prime AVANT signature',
    detail:
      'Vous acceptez l’offre CEE avant la signature du devis. La règle est stricte : pas d’acceptation rétroactive (sauf cas de fraude). Le rôle actif et incitatif (RAI) de l’obligé doit précéder le devis.',
  },
  {
    step: 'Travaux',
    detail:
      'Travaux réalisés par l’artisan RGE selon les fiches techniques CEE (BAR-TH-104 PAC, BAR-EN-101 combles, etc.).',
  },
  {
    step: 'Versement prime',
    detail:
      'La prime est versée 2 à 6 semaines après la facture, soit déduite directement du devis (prime à la facture), soit par chèque/virement (prime via énergéticien).',
  },
  {
    step: 'Émission certificat',
    detail:
      'L’obligé reçoit le CEE correspondant et le revend ou l’utilise pour atteindre son obligation. Vous, vous avez votre prime.',
  },
]

const COUP_POUCE = [
  {
    travail: 'PAC air-eau (remplace chaudière fioul/gaz/charbon)',
    standard: '2 500 €',
    bonifie: '4 000 € (modeste)',
    code: 'BAR-TH-159',
  },
  {
    travail: 'PAC géothermique (remplace chaudière fioul/gaz/charbon)',
    standard: '5 000 €',
    bonifie: '7 000 € (modeste)',
    code: 'BAR-TH-159',
  },
  {
    travail: 'Chaudière biomasse granulés',
    standard: '4 000 €',
    bonifie: '5 000 € (modeste)',
    code: 'BAR-TH-113',
  },
  {
    travail: 'Isolation combles perdus',
    standard: '10 €/m²',
    bonifie: '20 €/m² (modeste)',
    code: 'BAR-EN-101',
  },
  {
    travail: 'Isolation plancher bas',
    standard: '20 €/m²',
    bonifie: '30 €/m² (modeste)',
    code: 'BAR-EN-103',
  },
  {
    travail: 'Isolation murs ITE',
    standard: '15 €/m²',
    bonifie: '25 €/m² (modeste)',
    code: 'BAR-EN-102',
  },
]

const faqs = [
  {
    question: 'Qu’est-ce qu’un Certificat d’Économie d’Énergie (CEE) ?',
    answer:
      'Le CEE est un dispositif réglementaire français créé en 2006 qui oblige les fournisseurs d’énergie (les "obligés" : EDF, Total, Engie, ENI…) à financer des travaux d’économie d’énergie chez les particuliers, les entreprises et les collectivités. Chaque obligé doit atteindre un volume d’économies en kWh cumac (kWh cumulés actualisés). En contrepartie, ils versent des primes (Coup de pouce, prime classique) aux ménages qui font les travaux.',
  },
  {
    question: 'Comment toucher la prime CEE ?',
    answer:
      'Trois étapes : (1) Choisir un artisan RGE pour vos travaux. (2) Accepter une offre CEE AVANT la signature du devis (rôle actif et incitatif obligatoire). L’offre peut venir de l’artisan partenaire d’un obligé, ou directement d’un énergéticien (TotalEnergies, EDF Solution Énergie, etc.). (3) Réaliser les travaux et envoyer la facture. Versement sous 2-6 semaines, soit en déduction du devis, soit par chèque ou virement.',
  },
  {
    question: 'Quels travaux ouvrent droit aux CEE ?',
    answer:
      'Plus de 200 fiches d’opérations standardisées en 2026. Principaux travaux résidentiels : isolation (combles BAR-EN-101, planchers BAR-EN-103, ITE BAR-EN-102, ITI BAR-EN-104), chauffage (PAC air-eau BAR-TH-104 ou BAR-TH-159, chaudière biomasse BAR-TH-113, raccordement réseau de chaleur BAR-TH-127), équipements (régulation BAR-TH-118, VMC double flux BAR-TH-127, programmateur BAR-TH-118).',
  },
  {
    question: 'Quelle est la différence entre CEE classique et Coup de pouce ?',
    answer:
      'CEE classique = prime calculée selon le kWh cumac généré, généralement 30-200 € par geste. Coup de pouce = bonification dédiée à des travaux prioritaires (remplacement chaudière fioul/gaz par PAC ou biomasse, isolation grande échelle), montants forfaitaires plus élevés (2 500-5 000 €). Le Coup de pouce est plus rentable mais plafonné à des travaux spécifiques.',
  },
  {
    question: 'CEE est-il cumulable avec MaPrimeRénov’ ?',
    answer:
      'Oui, totalement. La prime CEE se déduit du devis avant calcul de MaPrimeRénov’ (le devis HT diminué de la prime CEE = base de calcul MPR par geste). Le cumul est même encouragé. À noter : pour le Parcours accompagné MPR, la prime CEE Coup de pouce Rénovation d’ampleur est intégrée dans le plan de financement par le Mon Accompagnateur Rénov’.',
  },
  {
    question: 'Y a-t-il un plafond de ressources pour les CEE ?',
    answer:
      'Non pour les CEE classique et le Coup de pouce standard. Tous les ménages sont éligibles. En revanche, les ménages modestes et très modestes (selon plafonds Anah) bénéficient d’une bonification du Coup de pouce (montants doublés ou augmentés de 50 %). Justification : avis d’imposition à fournir à l’artisan ou à l’énergéticien.',
  },
  {
    question: 'Combien coûte vraiment la PAC après MPR + CEE ?',
    answer:
      'Exemple PAC air-eau (devis 14 000 € HT) ménage modeste (Jaune) en remplacement d’une chaudière gaz : MPR 4 000 € + CEE Coup de pouce 4 000 € = 8 000 € d’aides. Reste à charge 6 000 € (avec TVA 5,5 % au lieu de 20 %). Si éco-PTZ ajouté : 0 € à charge immédiate, remboursement sur 20 ans à 0 %. Économie chauffage : 800-1 200 €/an, retour sur investissement 5-7 ans.',
  },
  {
    question: 'Peut-on refuser une offre CEE déjà acceptée ?',
    answer:
      'Avant signature du devis : oui, vous restez libre de comparer les offres. Vous pouvez accepter plusieurs offres en parallèle pour différents énergéticiens et choisir la meilleure. Après signature du devis : non, l’offre CEE est liée au devis. Conseil : demander 2-3 devis ET 2-3 offres CEE pour optimiser. Délai légal de rétractation 14 jours pour les contrats signés à distance ou hors établissement.',
  },
]

const sources = [
  {
    label: 'Ministère Transition Écologique — CEE',
    url: 'https://www.ecologie.gouv.fr/certificats-deconomies-denergie',
  },
  {
    label: 'France Rénov’ — Prime CEE',
    url: 'https://france-renov.gouv.fr/aides/cee-certificats-economies-denergie',
  },
  {
    label: 'ADEME — Fiches CEE résidentiel',
    url: 'https://www.economie.gouv.fr/dgec/cee-fiches-operations-standardisees',
  },
  {
    label: 'Service-Public.fr — Prime énergie CEE',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F35643',
  },
  {
    label: 'Légifrance — Code Énergie articles L221-1 à L221-12',
    url: 'https://www.legifrance.gouv.fr',
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
    description: 'Subvention principale Anah',
  },
  {
    label: 'Prime Coup de Pouce',
    href: '/renovation-energetique/aides/prime-coup-de-pouce',
    description: 'Focus Coup de pouce PAC + biomasse',
  },
  {
    label: 'Éco-PTZ : prêt 0 %',
    href: '/renovation-energetique/aides/eco-ptz-pret-zero',
    description: 'Cumulable avec CEE et MPR',
  },
  {
    label: 'Pompe à chaleur prix + aides 2026',
    href: '/renovation-energetique/travaux/pompe-a-chaleur',
    description: 'Comparatif PAC + financement',
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
    section: 'CEE — Certificats d’Économie d’Énergie',
    keywords: [
      'cee',
      'certificat economie energie',
      'prime energie',
      'cee 2026',
      'prime cee',
      'cee chauffage',
      'cee isolation',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Aides', url: '/renovation-energetique/aides' },
    { name: 'CEE', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'Certificats d’Économie d’Énergie (CEE) 2026',
    description:
      'Dispositif français de financement de la rénovation énergétique par les fournisseurs d’énergie obligés (EDF, Total, Engie, ENI…). 5e période 2022-2025 prolongée. Prime versée à l’artisan ou directement au ménage.',
    url: PAGE_URL,
    serviceType: 'Aide financière privée régulée par l’État',
    audience: 'Particuliers, copropriétés, entreprises, collectivités',
  })
  const schemas = [articleSchema, breadcrumbSchema, faqSchema, govSchema].filter(
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
              { label: 'CEE' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5" aria-hidden />
              Dispositif Ministère Transition Écologique
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              CEE 2026 : Certificats d’Économie d’Énergie
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Les <strong>Certificats d’Économie d’Énergie (CEE)</strong> obligent les fournisseurs
              d’énergie (EDF, Total, Engie…) à financer la rénovation énergétique des particuliers.
              En 2026, la 5<sup>e</sup> période est prolongée avec un objectif de{' '}
              <strong>3 100 TWh cumac</strong>. La prime, versée par l’artisan ou l’énergéticien,
              atteint <strong>2 500 à 5 000 €</strong> pour une PAC en remplacement de chaudière
              fioul/gaz, et est <strong>cumulable</strong> avec MaPrimeRénov’, éco-PTZ et TVA 5,5 %.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="fonctionnement">Comment ça marche : 6 étapes</h2>
            <div className="not-prose my-6">
              <ol className="space-y-3 list-none m-0 p-0">
                {FONCTIONNEMENT.map((s, i) => (
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

            <h2 id="coup-de-pouce">Coup de pouce 2026 : montants détaillés</h2>
            <p>
              Le <strong>Coup de pouce</strong> est la version bonifiée des CEE pour les travaux
              prioritaires. Montants standard et bonifiés (modeste/très modeste selon plafonds
              Anah).
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Travaux</th>
                    <th className="p-3 border-b border-sand-200">Standard</th>
                    <th className="p-3 border-b border-sand-200">Bonifié (modeste)</th>
                    <th className="p-3 border-b border-sand-200">Code fiche</th>
                  </tr>
                </thead>
                <tbody>
                  {COUP_POUCE.map((cp) => (
                    <tr key={cp.travail} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{cp.travail}</td>
                      <td className="p-3">{cp.standard}</td>
                      <td className="p-3 text-primary-700 font-semibold">{cp.bonifie}</td>
                      <td className="p-3 text-xs text-sand-500 font-mono">{cp.code}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 id="cumul">Cumul avec les autres aides</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>MaPrimeRénov’</strong> : la prime CEE se déduit du devis HT, le reste
                devient base de calcul MPR par geste.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Éco-PTZ</strong> : finance le reste à charge à 0 % sur 20 ans (jusqu’à 50
                000 €).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>TVA 5,5 %</strong> : automatique avec artisan RGE.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Aides locales</strong> : région, département, agglo, commune.
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Estimer votre prime CEE
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Calcul instantané CEE classique + Coup de pouce selon vos travaux et revenus.
                    Cumul automatique MPR + éco-PTZ + TVA 5,5 %.
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

            <h2 id="qui-verse">Qui verse la prime CEE ?</h2>
            <p>Trois canaux possibles :</p>
            <ul>
              <li>
                <TrendingUp className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Artisan RGE partenaire d’un obligé</strong> : prime déduite directement du
                devis (le plus courant).
              </li>
              <li>
                <TrendingUp className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Énergéticien direct</strong> : TotalEnergies, EDF Solution Énergie, Engie
                "Mes Économies d’Énergie", Quelle Énergie. Prime par chèque ou virement après
                travaux.
              </li>
              <li>
                <TrendingUp className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Mandataire CEE</strong> : intermédiaire indépendant qui collecte le dossier
                et négocie avec plusieurs obligés. Délégué CEE inscrit auprès de la DGEC.
              </li>
            </ul>

            <div className="not-prose flex items-start gap-3 border border-amber-200 bg-amber-50 rounded-lg p-4 my-6">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">Anti-arnaque CEE</p>
                <p className="m-0">
                  Démarchage téléphonique <strong>interdit</strong> depuis juillet 2020 pour la
                  rénovation énergétique. Méfiez-vous des offres "isolation à 1 €" : elles exigent
                  la signature avant audit thermique, utilisent des matériaux non conformes
                  (isolation soufflée 12 cm au lieu de 30+ cm), et conduisent souvent à des litiges.
                  Préférez un devis concurrentiel + Coup de pouce isolation classique.
                </p>
              </div>
            </div>

            <h2 id="periode">Calendrier réglementaire 2026-2030</h2>
            <p>
              La{' '}
              <strong>
                5<sup>e</sup> période CEE
              </strong>{' '}
              couvrait initialement 2022-2025 avec un objectif de 2 500 TWh cumac. Elle a été
              prolongée et amplifiée à <strong>3 100 TWh cumac</strong> jusqu’à fin 2026. La{' '}
              <strong>
                6<sup>e</sup> période
              </strong>{' '}
              (2027-2030) est en cours de définition par le Ministère de la Transition Écologique
              avec un objectif probable de 4 500 à 5 000 TWh cumac, soit une augmentation de 45-60
              %.
            </p>
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
