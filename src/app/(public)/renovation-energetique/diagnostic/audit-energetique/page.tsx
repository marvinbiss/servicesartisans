/**
 * Page : /renovation-energetique/diagnostic/audit-energetique
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-03, country=fr) :
 * - "audit energetique"             → 1 831 vol, KD 38, CPC $0,90, clicks 2 475 ⭐
 * - "audit energetique maison"      → 840 vol, KD 33, CPC $0,70
 * - "audit thermique"               → 108 vol, KD 0, CPC $1,10
 * - "audit energetique prix"        → 100 vol, KD 0, CPC $0,60
 * - "audit energetique obligation"  → 100 vol, KD 25
 * - "audit energetique reglementaire" → 90 vol, KD 19
 * - "audit energetique obligatoire" → 80 vol, KD 22, CPC $0,45 (longue traîne H2)
 * - Famille cumulée pivot : ~3 200 vol/mois
 *
 * Source : audit Ahrefs API live (cf docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md
 *          recalibré 2026-05-03 — l'audit du 19/04 estimait 5K vol KD 20 sur "obligatoire", vrai = 80)
 * Easy win : PARTIEL (KW pivot KD 38 = plus dur, mais variants KD 0-25 + vol cumulé 3 200)
 * Cluster pillar : Rénovation Énergétique → Diagnostic
 *
 * Anti-cannibalisation :
 *   - Source guide /guides/audit-energetique-prix-aides (223 lignes, focus prix + aides)
 *   - Cette page = HUB principal (définition + obligations + scénarios + différence DPE,
 *     KW pivot 'audit energetique' générique — guide source = 'audit energetique prix aides')
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Calculator,
  Scale,
  Layers,
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

const PAGE_PATH = '/renovation-energetique/diagnostic/audit-energetique'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-03'
const MODIFIED = '2026-05-03'
const AUTHOR_SLUG = 'claire-dubois'
const AUTHOR_NAME = 'Claire Dubois'

const TITLE = 'Audit énergétique 2026 : prix & loi'
const DESCRIPTION =
  'Audit énergétique 2026 : 500-1 500 € maison, obligatoire vente F/G/E + Parcours accompagné MPR. Aide MPR Audit jusquà 500 €.'

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
  'L’audit énergétique évalue la performance d’un logement et chiffre 2 scénarios de rénovation pour atteindre la classe B et C.',
  'Prix moyen 2026 : 500 à 1 200 € TTC selon surface (maison) — réalisé par un auditeur agréé France Rénov’.',
  'Obligatoire à la vente depuis 2023 pour les maisons individuelles classées F ou G ; étendu aux E depuis le 1er janvier 2025.',
  'Différent du DPE : l’audit propose un plan d’actions chiffré (DPE = simple constat sans préconisations).',
  'Aides : 500 € MaPrimeRénov’ (très modestes), 300 € (intermédiaires) ; obligatoire pour MaPrimeRénov’ Parcours accompagné.',
]

const AUDIT_VS_DPE = [
  {
    critere: 'Objectif',
    dpe: 'Constat de performance énergétique (lettre A à G)',
    audit: 'Plan d’actions chiffré pour rénover',
  },
  {
    critere: 'Durée intervention',
    dpe: '1-2 heures sur place',
    audit: '4-6 heures sur place + traitement',
  },
  {
    critere: 'Document remis',
    dpe: '6-10 pages standardisées',
    audit: '30-50 pages incluant scénarios',
  },
  {
    critere: 'Scénarios proposés',
    dpe: 'Aucun',
    audit: '2 scénarios chiffrés (1 saut de classe, gain ≥ 2 classes)',
  },
  {
    critere: 'Estimation devis travaux',
    dpe: 'Aucune',
    audit: 'Fourchettes par poste (toiture, murs, chauffage, ventilation)',
  },
  {
    critere: 'Validité',
    dpe: '10 ans',
    audit: '5 ans (1 an pour le logiciel ANAH)',
  },
  {
    critere: 'Prix moyen 2026',
    dpe: '100-250 € TTC',
    audit: '500-1 200 € TTC',
  },
]

const SURFACES_PRICES = [
  { surface: 'Studio / T1 (< 50 m²)', price: '500 - 700 €' },
  { surface: 'Maison 80-120 m²', price: '600 - 900 €' },
  { surface: 'Maison 120-180 m²', price: '800 - 1 100 €' },
  { surface: 'Maison > 180 m² ou complexe', price: '1 000 - 1 500 €' },
]

const CONTENU = [
  'État détaillé du logement (enveloppe, chauffage, ECS, ventilation, refroidissement)',
  'Calcul de la consommation conventionnelle annuelle (kWh/m²/an + kg CO2/m²/an)',
  'Étiquette énergétique actuelle (classe DPE)',
  'Scénario 1 : « 1 saut de classe » (ex. F → E) — chiffré poste par poste',
  'Scénario 2 : « rénovation performante » (gain ≥ 2 classes, ex. F → C) — chiffré',
  'Aides publiques mobilisables sur chaque scénario (MaPrimeRénov’, CEE, éco-PTZ)',
  'Estimation économies annuelles sur la facture chauffage + ECS',
  'Recommandations sur l’ordre des travaux (priorités, interactions)',
]

const faqs = [
  {
    question: 'Qu’est-ce qu’un audit énergétique ?',
    answer:
      'L’audit énergétique est une évaluation détaillée de la performance d’un logement, réalisée par un auditeur agréé France Rénov’. Il analyse l’enveloppe (toiture, murs, fenêtres, sols), le chauffage, l’eau chaude sanitaire et la ventilation. Contrairement au DPE qui se contente d’afficher une classe (A à G), l’audit propose 2 scénarios chiffrés de rénovation pour atteindre les classes B et C, avec estimation des aides publiques mobilisables et économies annuelles.',
  },
  {
    question: 'Combien coûte un audit énergétique en 2026 ?',
    answer:
      'Entre 500 et 1 200 € TTC selon la surface et la complexité du logement. Pour une maison individuelle 100 m², comptez 600-900 € TTC. Pour une maison > 180 m² ou avec architecture complexe, jusqu’à 1 500 € TTC. Aides MaPrimeRénov’ disponibles : 500 € très modestes, 400 € modestes, 300 € intermédiaires. Obligatoire d’office pour bénéficier du Parcours accompagné MaPrimeRénov’.',
  },
  {
    question: 'L’audit énergétique est-il obligatoire en 2026 ?',
    answer:
      'Oui pour la vente d’une maison individuelle en monopropriété classée F ou G depuis le 1er janvier 2023. Étendu aux maisons classées E depuis le 1er janvier 2025. Sera étendu aux D à partir du 1er janvier 2034. L’audit doit être annexé au DPE et présenté à l’acheteur dès la première visite. Pas obligatoire pour les appartements en copropriété (un audit collectif distinct existe pour les immeubles).',
  },
  {
    question: 'Quelle est la différence entre un audit énergétique et un DPE ?',
    answer:
      'Le DPE (200-400 € TTC, durée 1-2h, 6-10 pages) est un simple constat de performance avec une lettre A à G. L’audit énergétique (500-1 200 € TTC, durée 4-6h sur place, 30-50 pages) propose en plus 2 scénarios chiffrés de rénovation avec aides mobilisables et économies prévisionnelles. L’audit est plus approfondi, obligatoire à la vente pour les passoires, et indispensable pour bénéficier du Parcours accompagné MaPrimeRénov’.',
  },
  {
    question: 'Qui peut réaliser un audit énergétique ?',
    answer:
      'Un auditeur agréé inscrit sur l’annuaire France Rénov’ : architectes inscrits à l’Ordre, bureaux d’études thermiques certifiés OPQIBI 1905 ou 1911, diagnostiqueurs immobiliers certifiés audit énergétique, entreprises RGE certifiées « Mention RGE Etudes » + « Audit énergétique ». Vérification gratuite sur france-renov.gouv.fr/annuaire-rge avec filtre « Audit énergétique ».',
  },
  {
    question: 'Combien de temps est valable un audit énergétique ?',
    answer:
      '5 ans pour les audits réalisés selon le cahier des charges officiel (arrêté du 4 mai 2022). Les audits utilisant le logiciel ANAH (parcours d’accompagnement) sont valables 1 an et doivent être renouvelés à chaque demande d’aide. À la vente, un audit > 5 ans n’est pas opposable et doit être refait.',
  },
  {
    question: 'L’audit énergétique remplace-t-il le DPE ?',
    answer:
      'Non. Le DPE reste obligatoire à la vente et à la location pour tout logement (depuis 2007, recalculé tous les 10 ans). L’audit énergétique vient s’ajouter au DPE pour les passoires en vente : les deux documents sont complémentaires et obligatoires. Un audit sans DPE valide n’est pas opposable juridiquement à la vente.',
  },
  {
    question: 'Comment choisir entre les 2 scénarios proposés par l’audit ?',
    answer:
      'Le scénario « 1 saut de classe » est moins coûteux (15 000-30 000 €) mais ne permet pas d’accéder au Parcours accompagné MaPrimeRénov’. Le scénario « rénovation performante » (gain ≥ 2 classes) est plus cher (35 000-70 000 €) mais débloque jusqu’à 70 000 € d’aides MaPrimeRénov’ + CEE + éco-PTZ jusqu’à 50 000 €. Le ROI réel est souvent supérieur sur le scénario performant car le bouquet d’aides + l’économie annuelle sur les factures + la valorisation du bien à la revente compensent l’investissement supérieur.',
  },
]

const sources = [
  {
    label: 'France Rénov’ — Audit énergétique',
    url: 'https://france-renov.gouv.fr/aides/maprimerenov/audit-energetique',
  },
  {
    label: 'Légifrance — Arrêté 4 mai 2022 audit énergétique',
    url: 'https://www.legifrance.gouv.fr',
  },
  { label: 'ADEME — Guide audit énergétique 2026', url: 'https://agir.ademe.fr' },
  {
    label: 'Service-Public.fr — Audit obligatoire vente',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F35671',
  },
  { label: 'OPQIBI — Annuaire bureaux d’études certifiés', url: 'https://www.opqibi.com' },
]

const relatedPages = [
  {
    label: 'Audit énergétique : prix, aides détaillées',
    href: '/guides/audit-energetique-prix-aides',
    description: 'Grille de prix par surface + aides MaPrimeRénov’ + processus complet',
  },
  {
    label: 'Passoire thermique : définition, loi, calendrier',
    href: '/renovation-energetique/passoires-thermiques',
    description: 'Cadre légal F/G/E, conséquences, aides pour sortir',
  },
  {
    label: 'DPE mauvais (E/F/G) : que faire ?',
    href: '/guides/dpe-mauvais-que-faire',
    description: 'Stratégie de remontée par poste, leviers prioritaires',
  },
  {
    label: 'MaPrimeRénov’ Parcours accompagné',
    href: '/guides/maprimerenov-parcours-accompagne',
    description: 'Aide jusqu’à 70 000 €, audit + Mon Accompagnateur Rénov’ obligatoires',
  },
  {
    label: 'Pompe à chaleur : prix et aides 2026',
    href: '/renovation-energetique/travaux/pompe-a-chaleur',
    description: 'Solution chauffage centrale fréquemment recommandée par audit',
  },
  {
    label: 'Trouver un artisan RGE pour rénover',
    href: '/rge/renovation-energetique',
    description: 'Annuaire vérifié pour mettre en œuvre les scénarios audit',
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
    section: 'Diagnostic — Audit énergétique',
    keywords: [
      'audit énergétique',
      'audit énergétique prix',
      'audit énergétique obligatoire',
      'audit thermique',
      'audit énergétique vente',
      'audit énergétique maison',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Diagnostic', url: '/diagnostic' },
    { name: 'Audit énergétique', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'Audit énergétique réglementaire (France)',
    description:
      'Audit énergétique obligatoire à la vente d’une maison individuelle classée F ou G depuis 2023 et E depuis 2025. Encadré par l’arrêté du 4 mai 2022.',
    url: PAGE_URL,
    serviceType: 'Diagnostic énergétique réglementaire',
    audience: 'Propriétaires vendeurs et propriétaires souhaitant rénover',
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
              { label: 'Diagnostic', href: '/diagnostic' },
              { label: 'Audit énergétique' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <ClipboardCheck className="w-3.5 h-3.5" aria-hidden />
              Diagnostic &middot; Audit
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Audit énergétique en 2026 : prix, obligation, contenu
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              L’<strong>audit énergétique</strong> est une évaluation détaillée du logement par un
              auditeur agréé France Rénov’. Il coûte entre <strong>500 et 1 200 € TTC</strong> selon
              la surface et propose 2 scénarios chiffrés de rénovation. Obligatoire à la vente pour
              les passoires F et G depuis 2023 (étendu aux E en 2025), il est aussi indispensable
              pour bénéficier du Parcours accompagné MaPrimeRénov’ (jusqu’à 70 000 € d’aides).
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Définition et objectifs</h2>
            <p>
              L’audit énergétique évalue la performance énergétique d’un logement et propose un
              <strong> plan d’actions chiffré</strong> pour la rénover. Contrairement au DPE qui
              donne une simple lettre (A à G), l’audit identifie les postes de déperdition, calcule
              la consommation conventionnelle et propose 2 scénarios de travaux avec chiffrage,
              aides mobilisables et estimation des économies annuelles.
            </p>

            <h2 id="audit-energetique-obligatoire">L’audit énergétique obligatoire à la vente</h2>
            <div className="not-prose bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-4 my-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
                <div className="text-sm text-amber-900">
                  <p className="font-semibold m-0">
                    Calendrier de l’audit énergétique réglementaire à la vente
                  </p>
                  <ul className="m-0 mt-2 space-y-1 list-disc list-inside">
                    <li>
                      <strong>Depuis le 1er avril 2023</strong> : maisons individuelles classées F
                      ou G en monopropriété
                    </li>
                    <li>
                      <strong>Depuis le 1er janvier 2025</strong> : extension aux maisons classées E
                    </li>
                    <li>
                      <strong>1er janvier 2034</strong> : extension aux maisons classées D
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <p>
              Pour ces logements, l’audit doit être annexé au DPE et présenté dès la première visite
              à l’acheteur potentiel. Sans audit valide (≤ 5 ans), la vente peut être annulée par
              l’acheteur ou faire l’objet d’une renégociation à la baisse. L’audit n’est pas
              obligatoire pour les appartements en copropriété (un audit collectif séparé existe
              pour les immeubles).
            </p>

            <h2 id="audit-vs-dpe">Audit énergétique vs DPE : 7 différences</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Critère</th>
                    <th className="p-3 border-b border-sand-200">DPE</th>
                    <th className="p-3 border-b border-sand-200">Audit énergétique</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {AUDIT_VS_DPE.map((row) => (
                    <tr key={row.critere} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold">{row.critere}</td>
                      <td className="p-3 text-sand-700">{row.dpe}</td>
                      <td className="p-3 text-primary-800 font-medium">{row.audit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 id="prix">Prix d’un audit énergétique 2026</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Surface</th>
                    <th className="p-3 border-b border-sand-200">Prix TTC moyen</th>
                  </tr>
                </thead>
                <tbody>
                  {SURFACES_PRICES.map((row) => (
                    <tr key={row.surface} className="border-b border-sand-100 last:border-0">
                      <td className="p-3">{row.surface}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Aides MaPrimeRénov’ audit : 500 € très modestes, 400 € modestes, 300 €
                intermédiaires. Reste à charge effectif souvent inférieur à 200 €.
              </p>
            </div>

            <h2 id="contenu">Que contient un audit énergétique</h2>
            <p>L’audit conforme au cahier des charges officiel (arrêté du 4 mai 2022) inclut :</p>
            <ul>
              {CONTENU.map((item) => (
                <li key={item}>
                  <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>

            <h2 id="auditeurs">Qui peut réaliser un audit énergétique</h2>
            <p>Quatre profils sont habilités, tous inscrits sur l’annuaire France Rénov’ :</p>
            <ul>
              <li>
                <Layers className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Architectes</strong> inscrits à l’Ordre des architectes
              </li>
              <li>
                <Layers className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Bureaux d’études thermiques</strong> certifiés OPQIBI 1905 ou 1911
              </li>
              <li>
                <Layers className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Diagnostiqueurs immobiliers</strong> certifiés « audit énergétique »
              </li>
              <li>
                <Layers className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Entreprises RGE</strong> qualifiées « Mention RGE Études » + « Audit
                énergétique »
              </li>
            </ul>

            <h2 id="scenarios">Choisir entre les 2 scénarios proposés</h2>
            <div className="not-prose grid gap-4 my-6 md:grid-cols-2">
              <div className="bg-white border border-sand-200 rounded-xl p-5">
                <p className="font-heading text-lg font-semibold text-sand-900 m-0 mb-2">
                  Scénario « 1 saut de classe »
                </p>
                <p className="text-sm text-sand-700 m-0 mb-3">
                  Travaux ciblés pour gagner 1 classe DPE (ex. F → E).
                </p>
                <ul className="text-sm text-sand-700 list-disc list-inside m-0 space-y-1">
                  <li>Coût typique : 15 000 - 30 000 €</li>
                  <li>Aides : MaPrimeRénov’ par geste + CEE</li>
                  <li>
                    Reste à charge : 60-80 % du projet pour les ménages intermédiaires/supérieurs
                  </li>
                </ul>
              </div>
              <div className="bg-primary-50 border-2 border-primary-300 rounded-xl p-5">
                <div className="flex items-baseline justify-between gap-2 mb-2">
                  <p className="font-heading text-lg font-semibold text-sand-900 m-0">
                    Scénario « rénovation performante »
                  </p>
                  <span className="text-xs font-bold text-primary-700 bg-white px-2 py-0.5 rounded">
                    Recommandé
                  </span>
                </div>
                <p className="text-sm text-sand-700 m-0 mb-3">
                  Travaux groupés pour gagner ≥ 2 classes (ex. F → C).
                </p>
                <ul className="text-sm text-sand-700 list-disc list-inside m-0 space-y-1">
                  <li>Coût typique : 35 000 - 70 000 €</li>
                  <li>Aides : MaPrimeRénov’ Parcours accompagné jusqu’à 70 000 €</li>
                  <li>
                    Reste à charge : 10-30 % pour ménages très modestes (cumul aides + éco-PTZ)
                  </li>
                </ul>
              </div>
            </div>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <Scale className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">Audit ANAH spécifique</p>
                <p className="m-0">
                  Pour le Parcours accompagné MaPrimeRénov’, l’audit doit être réalisé avec le
                  logiciel ANAH (validité 1 an seulement). Distinct de l’audit réglementaire vente
                  (validité 5 ans). Les deux peuvent être réalisés simultanément.
                </p>
              </div>
            </div>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Estimer les aides après audit
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Calculateur officiel basé sur les barèmes 2026 MaPrimeRénov’ + Parcours
                    accompagné + CEE + éco-PTZ. Résultat instantané.
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

            <h2>Trouver un auditeur agréé</h2>
            <p>
              L’annuaire officiel est disponible sur france-renov.gouv.fr/annuaire-rge avec le
              filtre <strong>« Audit énergétique »</strong>. Vérifiez systématiquement la
              certification (OPQIBI 1905 ou 1911 pour les bureaux d’études) et la validité du
              certificat à la date de signature du devis. Demandez 2-3 devis avant de signer (écart
              15-25 % typique).
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
              href="/renovation-energetique"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Rénovation énergétique
            </Link>
            <Link
              href="/rge/renovation-energetique"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Auditeurs RGE certifiés <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
