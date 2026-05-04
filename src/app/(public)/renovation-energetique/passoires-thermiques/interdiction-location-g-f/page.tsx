/**
 * Page : /renovation-energetique/passoires-thermiques/interdiction-location-g-f
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-04, country=fr) :
 * - "dpe interdiction location"               → 350 vol, KD 3, CPC $1 ⭐⭐⭐⭐ EASY WIN
 * - "interdiction location dpe f"             → 300 vol, KD 0, CPC $1 ⭐⭐⭐⭐⭐ JACKPOT
 * - "passoire thermique location"             → 250 vol, KD 6, CPC $1 ⭐⭐⭐
 * - "interdiction location dpe g"             → 150 vol, KD 1, CPC $1 ⭐⭐⭐⭐
 * - "interdiction location passoire thermique" → 100 vol, KD 0, CPC $3 ⭐⭐⭐⭐
 * - Famille cumulée pivot : ~1 150 vol/mois (KD moyen 2 — easy win majeur)
 *
 * Source : audit Ahrefs API live (cf docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md)
 * Easy win : OUI MAJEUR (KD 0-6 sur cluster transactionnel propriétaires bailleurs)
 * Cluster pillar : Rénovation Énergétique → Passoires thermiques → Interdiction location G/F
 *
 * Anti-cannibalisation :
 *   - Hub /passoires-thermiques/ = définition + lois + calendrier panorama
 *   - Cette page = focus DEEP DIVE interdiction G (2025) + F (2028) — obligations bailleur
 *   - Sub /calendrier-2025-2028-2034/ = focus chronologie pure 3 dates
 *   - /diagnostic/dpe/ = focus diagnostic (lien fort)
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Gavel,
  Home,
  ShieldAlert,
  TrendingDown,
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

const PAGE_PATH = '/renovation-energetique/passoires-thermiques/interdiction-location-g-f'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-04'
const AUTHOR_SLUG = 'claire-dubois'
const AUTHOR_NAME = 'Claire Dubois'

const TITLE = 'Interdiction location DPE G et F 2026'
const DESCRIPTION =
  'Location DPE G interdite depuis 2025, F en 2028 (loi Climat). Obligations bailleurs, sanctions, recours locataires, dérogations 2026.'

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
  'Location DPE G interdite depuis le 1er janvier 2025 (résidence principale, nouveaux baux et renouvellements).',
  'Location DPE F interdite à partir du 1er janvier 2028. Location DPE E à partir de 2034.',
  'Bail en cours non rompu : le bailleur reste libre de continuer la location existante avec un G ou F (ce sont les renouvellements et nouveaux baux qui sont visés).',
  'Dérogations 2026 : copropriétés bloquées (refus AG documenté), bâtis classés/protégés, contraintes techniques majeures (avis architecte).',
  'Sanctions : pas d’amende administrative, mais le locataire peut exiger des travaux sous astreinte ou faire baisser le loyer judiciairement.',
  'Aides 2026 : MaPrimeRénov’ Parcours accompagné jusqu’à 70 000 € + bonus passoire 10 % + CEE Coup de pouce + éco-PTZ 50 000 €.',
]

const APPLICATION = [
  {
    cas: 'Nouveau bail signé en 2026',
    g: 'INTERDIT — bail réputé non opposable, loyer non recouvrable judiciairement',
    f: 'Encore autorisé jusqu’au 31 décembre 2027',
  },
  {
    cas: 'Renouvellement de bail en 2026',
    g: 'INTERDIT — le bailleur ne peut pas reconduire un bail si DPE G',
    f: 'Encore autorisé en 2026 et 2027',
  },
  {
    cas: 'Bail en cours signé avant 2025',
    g: 'AUTORISÉ — la loi ne rompt pas les baux en cours, mais le locataire peut exiger travaux',
    f: 'AUTORISÉ jusqu’au renouvellement après 2028',
  },
  {
    cas: 'Location saisonnière (meublé tourisme)',
    g: 'NON CONCERNÉ — la loi vise la résidence principale',
    f: 'NON CONCERNÉ — la loi vise la résidence principale',
  },
  {
    cas: 'Location meublée à l’année (résidence principale)',
    g: 'INTERDIT (mêmes règles que vide depuis 2025)',
    f: 'Encore autorisé jusqu’au 31 décembre 2027',
  },
]

const OBLIGATIONS_BAILLEUR = [
  {
    icon: Gavel,
    titre: 'Annexer un DPE valide au bail',
    detail:
      'DPE de moins de 10 ans (réformé 1er juillet 2021) obligatoirement annexé. Sans DPE, le locataire peut faire annuler le bail ou exiger une remise du dossier complet.',
  },
  {
    icon: Home,
    titre: 'Mentionner la note DPE dans l’annonce',
    detail:
      'Note A-G + étiquette GES obligatoires dans toute annonce immobilière (papier, web, vitrine). Mention "logement consommant beaucoup d’énergie" pour F/G, depuis le 1er janvier 2022.',
  },
  {
    icon: ShieldAlert,
    titre: 'Gel des loyers passoires',
    detail:
      'Depuis le 24 août 2022 : loyer NON révisable annuellement et NON augmentable au renouvellement pour tout logement F ou G (même règle dans toutes les zones, tendues ou non).',
  },
  {
    icon: AlertTriangle,
    titre: 'Travaux sur demande du locataire',
    detail:
      'Le locataire peut saisir le juge des contentieux pour faire ordonner les travaux d’économie d’énergie nécessaires (sous astreinte). Refus du bailleur = condamnation possible.',
  },
]

const SANCTIONS = [
  {
    sanction: 'Travaux sous astreinte',
    detail:
      'Le tribunal peut condamner le bailleur à effectuer les travaux nécessaires sous astreinte (50-500 € par jour de retard). Source : article 20-1 loi 1989, jurisprudence en construction.',
  },
  {
    sanction: 'Baisse de loyer judiciaire',
    detail:
      'Le locataire peut demander la réduction du loyer en raison de la non-conformité énergétique. Le juge fixe le pourcentage selon la gravité (10-30 % observés en jurisprudence).',
  },
  {
    sanction: 'Bail non opposable',
    detail:
      'Pour un nouveau bail signé en violation de la loi (DPE G en 2026), le bailleur ne peut pas se prévaloir du bail en justice (impayés non recouvrables, expulsion impossible).',
  },
  {
    sanction: 'Annulation pour vice du consentement',
    detail:
      'Si le DPE indiqué était incorrect (sous-estimation), le locataire peut demander l’annulation pour vice du consentement (article 1130 Code civil) + dommages-intérêts.',
  },
]

const DEROGATIONS = [
  {
    cas: 'Copropriété bloquée',
    detail:
      'Si l’assemblée générale a refusé les travaux nécessaires (procès-verbal à l’appui), le bailleur peut continuer la location même au-delà des seuils. Solutions : 2/3 des copropriétaires en faveur des travaux suffisent depuis 2024.',
  },
  {
    cas: 'Bâti classé ou protégé',
    detail:
      'Logements situés dans un secteur sauvegardé, abords de monuments historiques, sites patrimoniaux remarquables : dérogation possible si avis défavorable de l’ABF (architecte des bâtiments de France) sur les travaux nécessaires.',
  },
  {
    cas: 'Contraintes techniques majeures',
    detail:
      'Si l’audit énergétique conclut à l’impossibilité technique d’atteindre la classe E (par exemple : isolation murs impossible sans destruction structure porteuse), un avis d’architecte ou bureau d’études thermique permet une dérogation.',
  },
  {
    cas: 'Coût travaux disproportionné',
    detail:
      'Si le coût estimé des travaux dépasse 50 % de la valeur vénale du bien, jurisprudence émergente accepte la dérogation (à confirmer par recours administratif). Cas marginal.',
  },
]

const faqs = [
  {
    question: 'Mon bail signé en 2023 avec un DPE G : suis-je obligé de partir en 2026 ?',
    answer:
      'Non. La loi Climat et Résilience (2021) ne rompt pas les baux en cours. Vous restez locataire dans les conditions du bail initial jusqu’à son terme. Mais à la date de renouvellement (3 ans pour un meublé, 6 ans pour une location vide), le bailleur ne pourra pas vous proposer le renouvellement si le logement reste classé G : il devra soit faire les travaux nécessaires, soit ne pas renouveler. Vous pouvez aussi exiger des travaux pendant le bail en cours, et saisir le tribunal en cas de refus.',
  },
  {
    question: 'Un propriétaire peut-il vraiment être sanctionné en 2026 pour louer un G ?',
    answer:
      'Pas d’amende administrative directe (la loi n’en prévoit pas). Mais le locataire peut : (1) exiger des travaux sous astreinte (50-500 €/j de retard), (2) demander une baisse de loyer judiciaire (10-30 % observés), (3) faire annuler le bail si signé après 2025 — donc impayés non recouvrables. Les bailleurs récidivistes peuvent aussi être inscrits dans les fichiers des "bailleurs indésirables" gérés par certaines associations de locataires.',
  },
  {
    question: 'Comment savoir si mon logement est G ou F ?',
    answer:
      'Le DPE indique la classe A à G en première page. Si pas de DPE récent (post-2021), il est obligatoire d’en faire faire un avant toute location ou vente (100-250 € TTC). Diagnostiqueur certifié à choisir via l’annuaire officiel diagnostiqueurs.application.developpement-durable.gouv.fr. Validité 10 ans depuis 1er juillet 2021. Méthode 3CL-2021 unifiée — opposable juridiquement.',
  },
  {
    question: 'Les meublés touristiques (Airbnb) sont-ils concernés par l’interdiction ?',
    answer:
      'NON. La loi Climat et Résilience vise uniquement la résidence principale (bail vide ou meublé, ≥ 8 mois consécutifs). Les locations saisonnières (meublé de tourisme, location courte durée type Airbnb) ne sont pas concernées par les seuils 2025/2028/2034. Néanmoins, plusieurs villes (Paris, Lyon, Bordeaux) imposent désormais une note DPE minimale dans leur règlement local pour autoriser un changement d’usage en meublé tourisme.',
  },
  {
    question: 'Combien coûte sortir un logement G/F de la classe passoire ?',
    answer:
      'Selon l’audit énergétique : 25 000 à 70 000 € pour passer d’un G ou F à un D ou E (gain ≥ 2 classes DPE, prérequis MPR Parcours accompagné). Aides 2026 cumulables : MaPrimeRénov’ Parcours accompagné jusqu’à 70 000 € (90 000 € avec bonus passoire 10 % + bonus BBC), CEE Coup de pouce, TVA 5,5 %, éco-PTZ jusqu’à 50 000 € sans intérêts. Reste à charge typique 10-30 % pour les ménages très modestes en passant par Mon Accompagnateur Rénov’.',
  },
  {
    question: 'Qui contrôle l’interdiction location G en 2026 ?',
    answer:
      'Aucun contrôle administratif systématique (pas d’inspection automatique). Le contrôle se fait par : (1) le locataire qui constate l’infraction et saisit le juge, (2) la justice civile (tribunal des contentieux de la protection), (3) certaines préfectures qui ont mis en place des observatoires des passoires (Île-de-France, Hauts-de-France). Les annonces immobilières sont scannées par les associations type CLCV qui signalent les annonces non conformes (mention obligatoire "logement énergivore").',
  },
  {
    question: 'Peut-on vendre une passoire en 2026 sans rénover ?',
    answer:
      'Oui, la vente reste autorisée pour tout DPE (A à G). Obligations : (1) audit énergétique en plus du DPE pour les maisons individuelles classées F, G ou E (étendu au E le 1er janvier 2025), (2) mention claire dans l’annonce de la note DPE et GES + label "logement énergivore" pour F/G. Décote moyenne observée : -5 à -15 % pour un F, -10 à -20 % pour un G (étude Notaires de France 2024). Délai de vente rallongé +30-60 jours.',
  },
  {
    question: 'Quelles dérogations pour les copropriétés en 2026 ?',
    answer:
      'Si l’assemblée générale a refusé les travaux nécessaires (procès-verbal AG à l’appui), le bailleur peut continuer la location en justifiant l’impossibilité matérielle d’agir seul. Important : depuis 2024, les majorités sont assouplies — 2/3 des copropriétaires (au lieu de l’unanimité) suffisent pour autoriser les travaux d’isolation thermique des parties communes. Des financements collectifs MaPrimeRénov’ Copropriété existent (jusqu’à 25 % du devis collectif + bonus 3 000 €/lot pour sortir de F/G).',
  },
]

const sources = [
  {
    label: 'Loi Climat et Résilience n° 2021-1104',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000043956924',
  },
  {
    label: 'Service-Public.fr — DPE interdiction location',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F33856',
  },
  { label: 'France Rénov’ — Aides bailleurs', url: 'https://france-renov.gouv.fr' },
  { label: 'ANIL — Décryptage interdiction location', url: 'https://www.anil.org' },
  { label: 'Décret n° 2022-780 audit obligatoire', url: 'https://www.legifrance.gouv.fr' },
  {
    label: 'Annuaire diagnostiqueurs certifiés',
    url: 'https://diagnostiqueurs.application.developpement-durable.gouv.fr',
  },
]

const relatedPages = [
  {
    label: 'Hub Passoires thermiques',
    href: '/renovation-energetique/passoires-thermiques',
    description: 'Définition, loi et calendrier complet',
  },
  {
    label: 'Calendrier 2025-2028-2034',
    href: '/renovation-energetique/passoires-thermiques/calendrier-2025-2028-2034',
    description: 'Échéances détaillées par classe DPE',
  },
  {
    label: 'DPE 2026',
    href: '/renovation-energetique/diagnostic/dpe',
    description: 'Note A-G, prix, validité, opposabilité',
  },
  {
    label: 'Audit énergétique',
    href: '/renovation-energetique/diagnostic/audit-energetique',
    description: 'Obligatoire vente F/G/E et MPR',
  },
  {
    label: 'MaPrimeRénov’ Parcours accompagné',
    href: '/renovation-energetique/aides/maprimerenov-2026/parcours-accompagne',
    description: 'Jusqu’à 90 000 € pour sortir d’une passoire',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'MPR + CEE + éco-PTZ cumulés',
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
    section: 'Passoires thermiques',
    keywords: [
      'dpe interdiction location',
      'interdiction location dpe f',
      'interdiction location dpe g',
      'passoire thermique location',
      'interdiction location passoire thermique',
      'loi climat resilience location',
      'bailleur passoire thermique',
      'gel loyer passoire',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Passoires thermiques', url: '/renovation-energetique/passoires-thermiques' },
    { name: 'Interdiction location G/F', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'Interdiction de location DPE G et F (loi Climat 2021)',
    description:
      'Réglementation française issue de la loi Climat et Résilience 2021 interdisant progressivement la location des logements classés G (depuis 2025), F (depuis 2028) et E (depuis 2034) en résidence principale. Obligations bailleurs, sanctions, dérogations.',
    url: PAGE_URL,
    serviceType: 'Réglementation logement',
    audience: 'Propriétaires bailleurs, locataires, copropriétés',
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
              {
                label: 'Passoires thermiques',
                href: '/renovation-energetique/passoires-thermiques',
              },
              { label: 'Interdiction location G/F' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <ShieldAlert className="w-3.5 h-3.5" aria-hidden />
              Loi Climat et Résilience 2021 — En vigueur
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Interdiction location DPE G et F : ce qui s’applique en 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              La <strong>loi Climat et Résilience 2021</strong> interdit progressivement la location
              des passoires thermiques en résidence principale :{' '}
              <strong>G depuis le 1er janvier 2025</strong>, <strong>F au 1er janvier 2028</strong>,
              E au 1er janvier 2034. En 2026, voici ce qui s’applique aux bailleurs : nouveaux baux,
              renouvellements, sanctions, dérogations, et les{' '}
              <Link href="/renovation-energetique/aides/maprimerenov-2026">aides 2026</Link> pour
              sortir du statut passoire jusqu’à 90 000 €.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="application-2026">Ce qui s’applique en 2026 selon votre situation</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Cas</th>
                    <th className="p-3 border-b border-sand-200">DPE G</th>
                    <th className="p-3 border-b border-sand-200">DPE F</th>
                  </tr>
                </thead>
                <tbody>
                  {APPLICATION.map((a) => (
                    <tr key={a.cas} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{a.cas}</td>
                      <td className="p-3 text-xs">{a.g}</td>
                      <td className="p-3 text-xs">{a.f}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-sand-500">
              Source : loi n° 2021-1104 du 22 août 2021 (art. 160) + décret n° 2022-461 du 31 mars
              2022. Application stricte aux résidences principales (locations vides ou meublées ≥ 8
              mois). Locations saisonnières et meublés de tourisme : exclus du dispositif.
            </p>

            <h2 id="obligations-bailleur">4 obligations bailleur en 2026</h2>
            <div className="not-prose grid gap-3 my-6">
              {OBLIGATIONS_BAILLEUR.map((o) => {
                const Icon = o.icon
                return (
                  <div
                    key={o.titre}
                    className="bg-white border border-sand-200 rounded-xl p-4 flex items-start gap-3"
                  >
                    <Icon className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden />
                    <div>
                      <p className="font-semibold text-sand-900 m-0 mb-1">{o.titre}</p>
                      <p className="text-sm text-sand-700 m-0">{o.detail}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <h2 id="sanctions">4 sanctions encourues si vous louez quand même</h2>
            <p>
              <ShieldAlert className="inline w-4 h-4 text-red-700 mr-1" aria-hidden />
              La loi Climat ne prévoit <strong>pas d’amende administrative</strong> directe pour
              location en violation des seuils. Mais les recours civils et la jurisprudence en
              construction prévoient plusieurs sanctions cumulables :
            </p>
            <ol>
              {SANCTIONS.map((s) => (
                <li key={s.sanction}>
                  <strong>{s.sanction}.</strong> {s.detail}
                </li>
              ))}
            </ol>

            <h2 id="derogations">Dérogations 2026 : 4 cas reconnus</h2>
            <div className="not-prose grid gap-3 my-6">
              {DEROGATIONS.map((d) => (
                <div key={d.cas} className="bg-white border border-sand-200 rounded-xl p-4">
                  <p className="font-semibold text-sand-900 m-0 mb-1">→ {d.cas}</p>
                  <p className="text-sm text-sand-700 m-0">{d.detail}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-sand-500">
              Toute dérogation suppose un dossier solide (audit énergétique, PV AG, avis ABF, devis
              chiffrés). À défaut, présomption de violation au profit du locataire en cas de litige.
            </p>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Bailleur d’une passoire ? Estimer aides + reste à charge
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Calcul instantané MPR + CEE + éco-PTZ pour sortir de la classe F/G. Mise en
                    relation avec un Mon Accompagnateur Rénov’ (obligatoire au-dessus de 5 000 € de
                    travaux) et un artisan RGE local.
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

            <h2 id="recours-locataire">Recours locataire 2026 : 5 leviers</h2>
            <p>Si vous êtes locataire d’un logement classé G ou F en 2026 :</p>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Mise en demeure du bailleur</strong> par lettre recommandée AR exigeant les
                travaux nécessaires (référence : article 20-1 loi 1989).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Saisine de la commission départementale de conciliation</strong> (gratuite,
                préfecture).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Action en justice</strong> devant le juge des contentieux de la protection
                (tribunal judiciaire) : demande de travaux sous astreinte ou baisse de loyer.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Annulation du bail</strong> pour les baux signés après 2025 (DPE G) ou 2028
                (DPE F).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Aide juridictionnelle</strong> possible (accès gratuit à un avocat selon
                ressources).
              </li>
            </ul>

            <div className="not-prose flex items-start gap-3 border border-amber-200 bg-amber-50 rounded-lg p-4 my-6">
              <TrendingDown className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">Vendre une passoire au lieu de rénover ?</p>
                <p className="m-0">
                  La vente reste autorisée en 2026 pour les logements G et F. Mais : décote moyenne
                  -5 à -15 % pour un F, -10 à -20 % pour un G (Notaires 2024) + audit énergétique
                  obligatoire (500-1 200 €) + délai de vente +30-60 j. Pour un bien estimé 250 000
                  €, la décote dépasse souvent les 25 000-50 000 € évités par rénovation aidée.
                </p>
              </div>
            </div>

            <h2 id="aides-2026">Aides 2026 pour sortir d’une passoire G ou F</h2>
            <p>
              4 aides cumulables disponibles en 2026 pour les bailleurs et propriétaires occupants :
            </p>
            <ul>
              <li>
                <strong>MaPrimeRénov’ Parcours accompagné</strong> jusqu’à 70 000 € (90 000 € avec
                bonus passoire 10 % + bonus BBC). Voir{' '}
                <Link href="/renovation-energetique/aides/maprimerenov-2026/parcours-accompagne">
                  notre guide Parcours accompagné
                </Link>
                .
              </li>
              <li>
                <strong>CEE Coup de pouce chauffage et isolation</strong>. Voir{' '}
                <Link href="/renovation-energetique/aides/prime-coup-de-pouce">
                  notre guide Coup de pouce
                </Link>
                .
              </li>
              <li>
                <strong>TVA réduite 5,5 %</strong> sur tous les travaux d’économie d’énergie
                (matériaux + main-d’œuvre).
              </li>
              <li>
                <strong>Éco-PTZ</strong> jusqu’à 50 000 € sans intérêts (15 ans). Voir{' '}
                <Link href="/renovation-energetique/aides/eco-ptz-pret-zero">
                  notre guide éco-PTZ
                </Link>
                .
              </li>
            </ul>
            <p>
              Reste à charge typique pour un bailleur sortant un G : 25-40 % du devis (vs 10-30 %
              pour un propriétaire occupant très modeste). À comparer impérativement à la décote de
              revente (souvent supérieure au reste à charge).
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
              href="/renovation-energetique/passoires-thermiques"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Passoires thermiques
            </Link>
            <Link
              href="/renovation-energetique/passoires-thermiques/calendrier-2025-2028-2034"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Calendrier 2025-2028-2034 <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
