/**
 * Page : /renovation-energetique/diagnostic/dpe/validite
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-06, country=fr) :
 * - "validite dpe"                      → 1 600 vol, KD 39, CPC $1,00 ⭐⭐⭐⭐ PIVOT
 * - "duree validite dpe"                → 500 vol, KD 38, CPC $1,00 ⭐⭐⭐
 * - "duree de validite dpe"             → 100 vol, KD 35, CPC $0,70
 * - "dpe combien de temps"              → 50 vol, KD 2, CPC $0,40 ⭐⭐⭐ EASY long-tail
 * - "duree de validite du dpe"          → 40 vol, KD 36
 * - "renouvellement dpe"                → 30 vol, KD 29
 * - "dpe combien de temps valable"      → 20 vol
 * - "validite diagnostic energetique"   → 10 vol, KD 0
 * - "dpe duree de validite"             → 10 vol
 * - Famille cumulée : ~2 360 vol/mois (KD moyen ~30-40)
 *
 * Source : audit Ahrefs Bloc 1 deep audit 2026-05-04 + revalidation API live 2026-05-06
 * @kw-primary "validite dpe"
 * @kw-volume 1600
 * @kw-kd 39
 * @kw-cpc 1.00
 * @cluster reno-energetique-diagnostic-dpe
 * @ahrefs-source api-live
 * @snapshot 2026-05-06
 * @backlog-item B7 (récap audits 2026-05-06 — Bloc 1 Ahrefs cluster DPE)
 *
 * Anti-cannibalisation :
 *   - Hub /diagnostic/dpe/ = panorama DPE (note A-G, prix, méthode, opposabilité, mention validité 10 ans en surface)
 *   - Cette page = focus DEEP sur la validité : durée 10 ans, calendrier invalidations DPE 2007-2021,
 *     renouvellement après travaux, correction 2024 maisons < 1948, vérification numéro ADEME,
 *     contestation, cas copropriété, comment savoir si mon DPE est encore valable.
 *   - /diagnostic/dpe/location/ = focus calendrier interdiction location G/F/E (distinct)
 *   - /diagnostic/audit-energetique/ = focus audit (validité 5 ans vs 10 ans DPE, distinct)
 *
 * E-E-A-T YMYL : sources officielles obligatoires
 *   - Code construction et habitation art. L271-4 + R126-15 (validité 10 ans)
 *   - Arrêté 31 mars 2021 (méthode 3CL-2021, démarrage validité 10 ans)
 *   - Arrêté 31 mars 2024 (correction maisons construites avant 1948)
 *   - Loi Climat et Résilience n° 2021-1104 du 22 août 2021
 *   - Décret 2020-1610 (DPE opposable depuis 1er juillet 2021)
 *   - Observatoire DPE-Audit ADEME (vérification numéro)
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  Calculator,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  FileSearch,
  RefreshCw,
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

const PAGE_PATH = '/renovation-energetique/diagnostic/dpe/validite'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'sophie-martin'
const AUTHOR_NAME = 'Sophie Martin'

const TITLE = 'Validité DPE 2026 : durée 10 ans, renouvellement, vérification'
const DESCRIPTION =
  'Validité DPE 2026 : 10 ans depuis le 1er juillet 2021. DPE 2013-2020 invalides depuis 2025. Comment vérifier, renouveler, contester.'

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
  'Validité DPE = 10 ans à compter de la date de signature, depuis le 1er juillet 2021 (article R126-15 CCH).',
  'DPE réalisés AVANT le 1er juillet 2021 : caducs depuis le 1er janvier 2025 (à refaire pour vente/location).',
  'DPE entre 2013-2017 : invalides depuis le 1er janvier 2023. Entre 2018 et 30/06/2021 : invalides depuis le 1er janvier 2025.',
  'Pour vérifier la validité : numéro ADEME 13 chiffres + observatoire-dpe-audit.ademe.fr.',
  'Renouvellement non obligatoire avant 10 ans, mais conseillé après travaux significatifs (isolation, chauffage).',
  'Maisons construites avant 1948 : DPE émis avant 1er juillet 2024 invalides — correction arrêté 31 mars 2024.',
]

const HISTORIQUE_VALIDITE = [
  {
    periode: 'DPE émis 2007 → 31 octobre 2012',
    statut: 'Invalides depuis le 1er janvier 2018',
    detail:
      'Méthode "facture" obsolète. Aucune valeur juridique aujourd’hui. À refaire dès qu’un DPE est requis (vente/location).',
    color: 'bg-red-50 border-red-200',
  },
  {
    periode: 'DPE émis 1er novembre 2012 → 31 décembre 2017',
    statut: 'Invalides depuis le 1er janvier 2023',
    detail:
      'Méthode 3CL ancienne version (dite "3CL-2012"). Trop d’écarts réels constatés. Caducs en 2023 (loi Climat).',
    color: 'bg-red-50 border-red-200',
  },
  {
    periode: 'DPE émis 1er janvier 2018 → 30 juin 2021',
    statut: 'Invalides depuis le 1er janvier 2025',
    detail:
      'Méthode 3CL-2012 maintenue jusqu’à la réforme. Délai de tolérance prolongé jusqu’au 31 décembre 2024 par décret 2020-1610.',
    color: 'bg-amber-50 border-amber-200',
  },
  {
    periode: 'DPE émis depuis le 1er juillet 2021',
    statut: 'Valides 10 ans à compter de la signature',
    detail:
      'Méthode unique 3CL-2021 (arrêté 31 mars 2021), opposable juridiquement. Stable. Validité confirmée par article R126-15 CCH.',
    color: 'bg-green-50 border-green-200',
  },
  {
    periode: 'DPE maisons < 1948 émis avant 1er juillet 2024',
    statut: 'Invalides depuis 1er juillet 2024 (correction arrêté 31 mars 2024)',
    detail:
      'Bug initial 3CL-2021 : sur-classement systématique des maisons d’avant 1948 en F/G. L’arrêté du 31 mars 2024 a corrigé la méthode et invalidé les DPE concernés. À refaire si vous êtes dans ce cas.',
    color: 'bg-red-50 border-red-200',
  },
]

const VERIFIER_VALIDITE = [
  {
    step: 'Récupérer le numéro ADEME',
    detail:
      'Tout DPE conforme depuis 2013 porte un numéro ADEME 13 chiffres en première page (format 2306E1234567S par exemple). Sans ce numéro = DPE non conforme.',
  },
  {
    step: 'Vérifier sur l’observatoire ADEME',
    detail:
      'Saisir le numéro sur observatoire-dpe-audit.ademe.fr/recherche-dpe-audit. Le système renvoie : date de signature, méthode (3CL-2021 ou ancienne), classe, statut (actif / périmé / annulé).',
  },
  {
    step: 'Calculer la date d’expiration',
    detail:
      'Date de signature + 10 ans. Exemple : DPE signé le 12/03/2022 → valable jusqu’au 12/03/2032. Pour les DPE pré-juillet 2021 : invalides depuis le 1er janvier 2025 quel que soit l’âge.',
  },
  {
    step: 'Cas particulier maison < 1948',
    detail:
      'Si la maison est antérieure à 1948 ET que le DPE a été signé avant le 1er juillet 2024 : caduc. À refaire avec la méthode 3CL-2021 corrigée par l’arrêté du 31 mars 2024.',
  },
]

const CAS_RENOUVELLEMENT = [
  {
    cas: 'Vente immobilière',
    obligation:
      'DPE en cours de validité obligatoire (annexé au compromis). Si DPE périmé ou pré-juillet 2021 : à refaire avant la mise en vente.',
  },
  {
    cas: 'Location (nouveau bail ou renouvellement)',
    obligation:
      'DPE valide obligatoire. Reconduction tacite ne déclenche PAS l’obligation, mais tout nouveau bail oui (loi Alur 2014).',
  },
  {
    cas: 'Travaux significatifs (isolation, chauffage, fenêtres)',
    obligation:
      'NON obligatoire mais fortement recommandé : nouveau DPE peut faire passer de F/G à D/E et améliorer la valeur du bien (jusqu’à 15-20 %).',
  },
  {
    cas: 'MaPrimeRénov’ Parcours accompagné',
    obligation:
      'Audit énergétique obligatoire AVANT travaux (validité 5 ans). DPE recommandé APRÈS travaux pour mesurer le gain réel.',
  },
  {
    cas: 'Copropriété (parties communes)',
    obligation:
      'DPE collectif obligatoire selon taille : > 200 lots construites avant 2013 depuis 2024, > 50 lots en 2025, toutes en 2028. Validité 10 ans, à renouveler à échéance.',
  },
  {
    cas: 'Construction neuve',
    obligation:
      'DPE obligatoire à la livraison. Validité 10 ans. Si réception après le 1er juillet 2021, méthode 3CL-2021 par défaut.',
  },
]

const faqs = [
  {
    question: 'Quelle est la durée de validité d’un DPE en 2026 ?',
    answer:
      'La validité d’un DPE est de 10 ans à compter de sa date de signature, conformément à l’article R126-15 du Code de la construction et de l’habitation. Cette règle s’applique à tous les DPE réalisés depuis le 1er juillet 2021 (méthode 3CL-2021). Les DPE antérieurs sont caducs depuis le 1er janvier 2025 quelle que soit leur date de signature initiale.',
  },
  {
    question: 'Mon DPE date de 2019, est-il encore valable ?',
    answer:
      'NON. Tous les DPE émis entre le 1er janvier 2018 et le 30 juin 2021 sont devenus caducs le 1er janvier 2025 (décret 2020-1610). Si vous comptez vendre ou louer, vous devez faire réaliser un nouveau DPE avec la méthode 3CL-2021. Coût 100-280 € TTC selon surface (cf. notre guide prix DPE 2026).',
  },
  {
    question: 'Comment vérifier qu’un DPE est encore valide en 2026 ?',
    answer:
      '3 vérifications : (1) date de signature postérieure au 1er juillet 2021, (2) date de signature + 10 ans non dépassée, (3) numéro ADEME 13 chiffres présent en première page → recherche sur observatoire-dpe-audit.ademe.fr. Cas particulier : si la maison a été construite avant 1948 et le DPE émis avant le 1er juillet 2024, il est invalide (correction arrêté 31 mars 2024).',
  },
  {
    question: 'Faut-il refaire un DPE après des travaux d’isolation ?',
    answer:
      'Pas obligatoire si le DPE actuel est encore valide, mais fortement recommandé : un DPE post-travaux peut faire passer le logement de F/G à D/E, ce qui (1) augmente la valeur immobilière de 10-20 %, (2) débloque les louages F/G interdits 2028/2034, (3) sécurise l’opposabilité (l’ancien DPE pourrait sous-estimer les performances réelles et exposer à des recours).',
  },
  {
    question: 'Que se passe-t-il si je vends avec un DPE périmé ?',
    answer:
      'La transaction est juridiquement viciée : (1) le notaire peut refuser de finaliser l’acte, (2) l’acquéreur peut demander l’annulation de la vente ou des dommages-intérêts (DPE est opposable depuis 2021), (3) sanction administrative jusqu’à 3 000 € pour le vendeur. Solution : réaliser un nouveau DPE valide avant signature du compromis (délai 1-3 semaines).',
  },
  {
    question: 'Mon DPE est-il prolongé automatiquement après les 10 ans ?',
    answer:
      'NON. Aucune prolongation automatique. Le DPE devient caduc à la date anniversaire des 10 ans. Pour rester en règle (notamment si bailleur) : programmer un nouveau DPE 2-3 mois avant la date d’échéance. La méthode 3CL-2021 étant stable, un nouveau DPE doit donner des résultats cohérents avec l’ancien (sauf travaux entre-temps).',
  },
  {
    question: 'Comment contester la durée de validité ou la classe d’un DPE ?',
    answer:
      'Depuis le 1er juillet 2021, le DPE est opposable juridiquement. Recours possible si erreur du diagnostiqueur ou non-respect de la méthode 3CL-2021 : (1) demande de rectification au diagnostiqueur (lettre RAR sous 30 jours), (2) saisine du médiateur de la consommation, (3) recours au tribunal civil (délai prescription 5 ans). Sanctions : annulation du DPE, dommages-intérêts (jusqu’à plusieurs milliers d’euros si décote vente prouvée), retrait de certification du diagnostiqueur.',
  },
  {
    question: 'Le DPE collectif d’une copropriété a-t-il la même validité ?',
    answer:
      'Oui, validité 10 ans pour les DPE collectifs (parties communes). Calendrier d’obligation par taille de copropriété : > 200 lots construites avant 2013 depuis le 1er janvier 2024, > 50 lots en 2025, toutes les copropriétés à terme 2028. Le DPE collectif ne remplace pas les DPE individuels par lot, mais peut servir de base au plan pluriannuel de travaux (PPT) obligatoire.',
  },
]

const sources = [
  {
    label: 'Légifrance — Article R126-15 CCH (validité 10 ans)',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043806963',
  },
  {
    label: 'Légifrance — Décret 2020-1610 (DPE opposable + caducité)',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000042705352',
  },
  {
    label: 'Légifrance — Arrêté du 31 mars 2021 (méthode 3CL-2021)',
    url: 'https://www.legifrance.gouv.fr/loda/id/LEGIARTI000043305777',
  },
  {
    label: 'Légifrance — Arrêté du 31 mars 2024 (correction maisons < 1948)',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000049346832',
  },
  {
    label: 'Service-Public.fr — DPE et validité',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F16096',
  },
  {
    label: 'Observatoire DPE-Audit ADEME (vérification numéro)',
    url: 'https://observatoire-dpe-audit.ademe.fr',
  },
  {
    label: 'Annuaire diagnostiqueurs certifiés COFRAC',
    url: 'https://diagnostiqueurs.application.developpement-durable.gouv.fr',
  },
]

const relatedPages = [
  {
    label: 'DPE 2026 : note A-G, prix, méthode',
    href: '/renovation-energetique/diagnostic/dpe',
    description: 'Hub DPE complet (classes, prix, opposabilité)',
  },
  {
    label: 'DPE location : obligations bailleur 2026',
    href: '/renovation-energetique/diagnostic/dpe/location',
    description: 'Calendrier interdiction G 2025 / F 2028 / E 2034',
  },
  {
    label: 'Audit énergétique 2026',
    href: '/renovation-energetique/diagnostic/audit-energetique',
    description: 'Validité 5 ans (vs 10 ans DPE), obligatoire vente F/G/E',
  },
  {
    label: 'Prix DPE 2026',
    href: '/blog/prix-dpe-2026',
    description: '100-280 € maison, 90-180 € appartement',
  },
  {
    label: 'Passoire thermique F/G',
    href: '/renovation-energetique/passoires-thermiques',
    description: 'Calendrier interdiction location 2025-2034',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'MPR + CEE + éco-PTZ post-DPE',
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
    section: 'DPE — Validité',
    keywords: [
      'validite dpe',
      'duree validite dpe',
      'duree de validite dpe',
      'dpe combien de temps',
      'renouvellement dpe',
      'dpe perime',
      'dpe 10 ans',
      'methode 3cl-2021',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Diagnostic', url: '/renovation-energetique/diagnostic' },
    { name: 'DPE', url: '/renovation-energetique/diagnostic/dpe' },
    { name: 'Validité', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'Validité du Diagnostic de Performance Énergétique (DPE)',
    description:
      'Règles de validité légale du DPE en France : durée 10 ans depuis 1er juillet 2021 (article R126-15 CCH), caducité progressive des DPE pré-réforme 3CL-2021, correction 2024 pour maisons construites avant 1948, et procédures de vérification via l’Observatoire DPE-Audit de l’ADEME.',
    url: PAGE_URL,
    serviceType: 'Cadre réglementaire diagnostic immobilier',
    audience: 'Propriétaires vendeurs, bailleurs, copropriétaires, diagnostiqueurs',
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
              { label: 'Diagnostic', href: '/renovation-energetique/diagnostic' },
              { label: 'DPE', href: '/renovation-energetique/diagnostic/dpe' },
              { label: 'Validité' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Clock className="w-3.5 h-3.5" aria-hidden />
              Article R126-15 CCH — Validité 10 ans
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Validité DPE en 2026 : durée, renouvellement, vérification
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Un <strong>DPE est valable 10 ans</strong> à compter de sa date de signature, depuis
              la réforme du 1er juillet 2021 (méthode 3CL-2021). Mais{' '}
              <strong>tous les DPE antérieurs au 1er juillet 2021 sont caducs depuis</strong> le 1er
              janvier 2025 : si vous vendez ou louez, un nouveau DPE est obligatoire. Voici comment
              vérifier la validité d’un DPE et quand le renouveler.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="duree">Durée de validité du DPE : 10 ans</h2>
            <p>
              <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
              Conformément à l’
              <strong>article R126-15 du Code de la construction et de l’habitation (CCH)</strong>,
              la validité d’un DPE est de <strong>10 ans</strong> à compter de sa date de signature,
              sous réserve qu’il ait été réalisé avec la méthode officielle en vigueur (3CL-2021
              depuis le 1er juillet 2021).
            </p>
            <p>
              Concrètement, un DPE signé le <strong>12 mars 2022</strong> est valable jusqu’au{' '}
              <strong>12 mars 2032</strong>. Aucun renouvellement automatique : il devient caduc à
              la date anniversaire des 10 ans, indépendamment des évolutions réglementaires
              ultérieures (sauf cas exceptionnels comme la correction des maisons d’avant 1948 par
              l’arrêté du 31 mars 2024).
            </p>

            <h2 id="historique">Calendrier d’invalidation des anciens DPE</h2>
            <p>
              La réforme du 1er juillet 2021 (décret 2020-1610) a fait évoluer la méthode et rendu
              le DPE opposable juridiquement. Pour assurer la cohérence des notes en vigueur, les
              DPE pré-réforme ont été progressivement déclarés caducs :
            </p>
            <div className="not-prose grid gap-3 my-6">
              {HISTORIQUE_VALIDITE.map((h) => (
                <div key={h.periode} className={`border rounded-xl p-4 ${h.color}`}>
                  <div className="flex items-start gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-sand-700 shrink-0 mt-0.5" aria-hidden />
                    <p className="font-semibold text-sand-900 m-0">{h.periode}</p>
                  </div>
                  <p className="text-sm font-medium text-sand-900 m-0 mb-1">Statut : {h.statut}</p>
                  <p className="text-sm text-sand-700 m-0">{h.detail}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-sand-500">
              Source : décret 2020-1610 (caducité progressive), arrêté 31 mars 2021 (méthode
              3CL-2021), arrêté 31 mars 2024 (correction maisons d’avant 1948).
            </p>

            <h2 id="verifier">Comment vérifier qu’un DPE est valide en 2026</h2>
            <div className="not-prose my-6">
              <ol className="space-y-3 list-none m-0 p-0">
                {VERIFIER_VALIDITE.map((s, i) => (
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

            <div className="not-prose flex items-start gap-3 border border-amber-200 bg-amber-50 rounded-lg p-4 my-6">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">
                  Vendre avec un DPE périmé = transaction viciée
                </p>
                <p className="m-0">
                  Le notaire peut refuser de signer, l’acheteur peut demander l’annulation ou des
                  dommages-intérêts (DPE opposable depuis 2021). Sanction administrative possible
                  jusqu’à <strong>3 000 €</strong>. À refaire avant le compromis (délai 1-3
                  semaines, coût 100-280 €).
                </p>
              </div>
            </div>

            <h2 id="renouvellement">Quand faut-il renouveler un DPE</h2>
            <p>
              <RefreshCw className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
              Le renouvellement n’est <strong>pas systématiquement obligatoire</strong>, mais
              certains événements le rendent nécessaire ou fortement recommandé :
            </p>
            <div className="not-prose grid gap-3 my-6">
              {CAS_RENOUVELLEMENT.map((c) => (
                <div key={c.cas} className="bg-white border border-sand-200 rounded-xl p-4">
                  <p className="font-semibold text-sand-900 m-0 mb-1">→ {c.cas}</p>
                  <p className="text-sm text-sand-700 m-0">{c.obligation}</p>
                </div>
              ))}
            </div>

            <h2 id="apres-travaux">DPE après travaux : refaire ou pas ?</h2>
            <p>
              <FileSearch className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
              Aucune obligation légale après travaux si le DPE actuel est encore valide. En
              pratique, refaire un DPE post-travaux est fortement recommandé dans 3 cas :
            </p>
            <ul>
              <li>
                <strong>Vous voulez vendre ou louer</strong> : un meilleur classement (de F à D par
                exemple) augmente la valeur immobilière de 10-20 % et débloque les locations
                interdites 2028 (F) ou 2034 (E).
              </li>
              <li>
                <strong>Vous avez bénéficié de MaPrimeRénov’ Parcours accompagné</strong> : le DPE
                post-travaux atteste du gain ≥ 2 classes exigé par le dispositif.
              </li>
              <li>
                <strong>Vous avez fait des travaux importants</strong> (isolation toiture/murs,
                changement de chauffage, fenêtres complet) : l’ancien DPE peut sous-estimer les
                performances réelles et vous exposer à un recours d’opposabilité.
              </li>
            </ul>
            <p>
              À l’inverse, si vous restez occupant et que le DPE est encore valide, aucun
              renouvellement n’est utile : la note est figée pour la durée résiduelle des 10 ans.
            </p>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    DPE F ou G ? Estimer un parcours rénovation 2026
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Calcul instantané MaPrimeRénov’ + CEE + éco-PTZ pour passer en classe E minimum
                    avant les interdictions 2028/2034. Mise en relation avec un Mon Accompagnateur
                    Rénov’ si Parcours accompagné.
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

            <h2 id="cas-1948">Cas particulier : maisons construites avant 1948</h2>
            <p>
              La méthode 3CL-2021 souffrait d’un biais bien documenté : les maisons construites
              avant 1948 (pierres, pisé, colombages, etc.) étaient systématiquement sur-classées en
              F/G du fait d’une mauvaise prise en compte de l’inertie thermique des murs anciens.
            </p>
            <p>
              L’<strong>arrêté du 31 mars 2024</strong> (publié au JO le 4 avril 2024) a corrigé la
              méthode. Conséquence directe :{' '}
              <strong>
                tous les DPE de maisons d’avant 1948 réalisés avant le 1er juillet 2024 sont
                invalides
              </strong>
              . Si vous êtes dans ce cas et que votre logement est classé F ou G : faire refaire le
              DPE en priorité — un reclassement E voire D est très probable, ce qui vous sort du
              calendrier d’interdiction location.
            </p>

            <h2 id="copropriete">Validité du DPE collectif (copropriété)</h2>
            <p>
              Les DPE collectifs (parties communes) suivent les mêmes règles : validité 10 ans,
              méthode 3CL-2021. Calendrier d’obligation par taille :
            </p>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Copropriétés <strong>&gt; 200 lots</strong> construites avant 2013 :{' '}
                <strong>obligatoire depuis le 1er janvier 2024</strong>.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Copropriétés <strong>51 à 200 lots</strong> : obligatoire depuis le{' '}
                <strong>1er janvier 2025</strong>.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Copropriétés <strong>≥ 50 lots</strong> : obligatoire à terme{' '}
                <strong>1er janvier 2028</strong>.
              </li>
            </ul>
            <p>
              Le DPE collectif ne dispense pas du DPE individuel par lot pour vente/location, mais
              sert souvent de base au plan pluriannuel de travaux (PPT) que les copropriétés
              concernées doivent voter en AG.
            </p>

            <h2 id="opposabilite">DPE opposable : conséquences sur la validité</h2>
            <p>
              Depuis le 1er juillet 2021, le DPE est <strong>opposable juridiquement</strong>. Cela
              ne change pas la durée de validité (10 ans), mais ouvre un droit de recours en cas
              d’erreur :
            </p>
            <ul>
              <li>
                <strong>Délai de prescription</strong> : 5 ans à compter de la découverte de
                l’erreur (article 2224 du Code civil).
              </li>
              <li>
                <strong>Recours étape 1</strong> : demande de rectification au diagnostiqueur
                (lettre RAR sous 30 jours).
              </li>
              <li>
                <strong>Recours étape 2</strong> : médiation par le médiateur de la consommation ou
                la chambre départementale.
              </li>
              <li>
                <strong>Recours étape 3</strong> : tribunal civil. Sanctions possibles : annulation
                du DPE, dommages-intérêts (jusqu’à plusieurs milliers d’euros si décote vente
                prouvée), retrait de certification du diagnostiqueur.
              </li>
            </ul>
            <p>
              Conséquence pratique : choisissez un diagnostiqueur certifié COFRAC, expérimenté et
              correctement assuré (RC pro obligatoire). Le DPE le moins cher n’est pas toujours le
              plus solide juridiquement.
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
              href="/renovation-energetique/diagnostic/dpe"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub DPE
            </Link>
            <Link
              href="/renovation-energetique/diagnostic/dpe/location"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              DPE location <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
