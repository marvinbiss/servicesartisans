/**
 * /renovation-energetique/aides/prime-energie — Levier B.
 *
 * @kw-primary    prime cee
 * @kw-volume     8500
 * @kw-kd         8
 * @kw-cpc        1.15
 * @cluster       8
 * @ahrefs-source local snapshot 2026-05-04 (docs/audit-ahrefs-2026-05-03)
 *
 * Cluster « prime CEE / prime énergie / prime EDF / prime cumac »
 * cumulé ~22 K vol/mo — gap massif côté V1 SA. Effy rank #23-27 sur les
 * pivots = striking distance, attaquable.
 *
 * KW cibles snapshot 2026-05-04 :
 * - "prime cee"          → 8 500 vol (Effy rank #23)
 * - "prime edf"          → 7 500 vol (Effy rank #27)
 * - "prime cee edf"      → 6 300 vol (Effy rank #23)
 * - "prime energie"      → 1 800 vol (Effy rank #24)
 * - "prime energie 2025" → 5 600 vol (généralisable 2026)
 * - Cluster cumulé ~22 K vol/mo. Pivot stratégique.
 *
 * Anti-cannibalisation :
 *   - /aides/cee-certificats-economie-energie : page formelle CEE (terme
 *     officiel — Certificats d'Économie d'Énergie). Cette page = pivot
 *     côté utilisateur ("prime CEE" / "prime énergie" / "prime EDF").
 *     Synonymie complète mais le grand public utilise "prime", pas "CEE".
 *   - /aides/maprimerenov-2026 : aide d'État Anah, distincte des CEE.
 *   - /aides/prime-coup-de-pouce : majoration ménages modestes des CEE
 *     (sub-mécanisme), distinct.
 *
 * Différentiation pédagogique :
 *   - "Prime CEE" = nom marketing donné par les "obligés" (EDF, Engie,
 *     TotalEnergies, Auchan, etc.) à la prime versée au consommateur en
 *     contrepartie de la cession des Certificats d'Économie d'Énergie.
 *   - "Prime énergie" = synonyme courant (marque générique).
 *   - "Prime EDF" / "Prime Engie" / "Prime Total" = même mécanisme,
 *     versée par l'obligé concerné.
 *   - Cumulable avec MaPrimeRénov' depuis 2021.
 *
 * Source officielle : ecologie.gouv.fr/dispositif-cee-certificats-economies-energie
 * + arrêté du 1/12/2024 fixant les opérations standardisées (BAR-EN-101 à
 * BAR-EN-110, BAR-TH-104 à BAR-TH-167, BAR-TH-101 etc.).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Calculator, Wallet, AlertTriangle } from 'lucide-react'

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

const PAGE_PATH = '/renovation-energetique/aides/prime-energie'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'sophie-martin'
const AUTHOR_NAME = 'Sophie Martin'

const TITLE = 'Prime CEE / Prime énergie 2026 : montants, comment l’obtenir'
const DESCRIPTION =
  'Prime CEE = prime énergie 2026 : EDF, Engie, TotalEnergies, Auchan… Tous les obligés versent la même prime. Cumul MaPrimeRénov’. Comparer les offres avant signature devis.'

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
  '<strong>Prime CEE = Prime énergie</strong> : c’est la <strong>même prime</strong>, sous différents noms commerciaux. Mécanisme légal : Certificats d’Économie d’Énergie (loi POPE 2005).',
  'Versée par les <strong>« obligés »</strong> : EDF, Engie, TotalEnergies, Auchan, Carrefour, Leclerc, BP, Esso, etc. — tous obligés par la loi de financer la transition énergétique.',
  '<strong>Cumulable</strong> avec MaPrimeRénov’ depuis 2021. Cumul typique sur isolation = 50-70 % du devis pour ménages très modestes.',
  'À <strong>signer AVANT le devis</strong> : la prime n’est versée que si la « valorisation CEE » figure sur le devis avant signature.',
  'Comparer les offres : EDF, Engie, TotalEnergies, Sonergia, Cdiscount Énergie etc. — montants varient ±30 %. Prime fixée par opération (BAR-EN-101, BAR-TH-104…).',
  '<strong>Coup de pouce</strong> = majoration des CEE pour ménages modestes (jusqu’à ×3 vs prime standard). Dispositifs spécifiques : Coup de pouce Chauffage, Isolation, Thermostat.',
  'Versement : <strong>après travaux</strong>, sur présentation des factures. Délai 4-12 semaines selon obligé.',
]

const OBLIGES = [
  {
    nom: 'EDF',
    marque: 'Prime Énergie EDF',
    note: 'Plus connu, prime moyenne. Ergonomique mais montant pas toujours le plus haut.',
  },
  {
    nom: 'Engie',
    marque: 'Prime Énergie Engie',
    note: 'Ancien GDF. Prime souvent compétitive sur PAC et chaudières.',
  },
  {
    nom: 'TotalEnergies',
    marque: 'Prime Énergie TotalEnergies',
    note: 'Filiale Total. Bons montants sur isolation. Promos régulières.',
  },
  {
    nom: 'Sonergia',
    marque: 'Sonergia',
    note: 'Spécialiste indépendant. DR 49. Excellents montants sur certaines opérations.',
  },
  {
    nom: 'Auchan',
    marque: 'Prime Énergie Auchan',
    note: 'Versée en chèque cadeaux Auchan (à valoriser selon vos besoins).',
  },
  {
    nom: 'Carrefour / Leclerc',
    marque: 'Prime Énergie GMS',
    note: 'Distribué via leur enseigne. Modalité chèque ou virement.',
  },
  {
    nom: 'Cdiscount Énergie',
    marque: 'Cdiscount Énergie',
    note: 'Acteur en ligne. Parcours digital simple. Montants compétitifs.',
  },
]

const FORFAITS = [
  {
    operation: 'BAR-TH-104 — Pompe à chaleur air/eau',
    forfait: 'H1 ~85 000 / H2 ~70 000 / H3 ~50 000 kWhc',
    primeIndic: '~3 000-4 500 € (selon obligé, ~5 c€/kWhc)',
  },
  {
    operation: 'BAR-EN-101 — Isolation toiture / combles',
    forfait: 'H1 ~3 800 / H2 ~3 100 / H3 ~2 100 kWhc/m²',
    primeIndic: '~10-15 €/m² (8-15 €/m² typique)',
  },
  {
    operation: 'BAR-EN-103 — Isolation plancher bas',
    forfait: 'H1 1 600 / H2 1 300 / H3 900 kWhc/m²',
    primeIndic: '~3-8 €/m²',
  },
  {
    operation: 'BAR-EN-102 — Isolation murs (ITE)',
    forfait: 'H1 ~3 600 / H2 ~3 000 / H3 ~2 100 kWhc/m²',
    primeIndic: '~10-18 €/m² (jusqu’à 25 €/m² avec Coup de pouce)',
  },
  {
    operation: 'BAR-TH-113 — Chaudière biomasse',
    forfait: 'H1 ~110 000 / H2 ~90 000 / H3 ~65 000 kWhc',
    primeIndic: '~4 000-6 000 € (selon obligé)',
  },
  {
    operation: 'BAR-TH-127 / 125 — VMC',
    forfait: 'H1 ~17 000-21 000 kWhc',
    primeIndic: '~700-1 200 €',
  },
]

const PROFILS = [
  {
    cas: 'Vous avez un projet isolation / PAC à 10 000 €',
    recommandation: 'Comparer 3 obligés avant devis',
    justification:
      'Différence de prime entre obligés peut atteindre 30 % (ex. 2 800 € vs 4 200 € sur même opération). Sites de comparaison : <a href="https://primesenergie.fr" rel="noopener noreferrer" target="_blank">primesenergie.fr</a>, <a href="https://comparateur-cee.fr" rel="noopener noreferrer" target="_blank">comparateur-cee.fr</a> (non affiliés). Ne signez pas avec le 1er obligé venu.',
  },
  {
    cas: 'Ménage modeste / très modeste (revenus Bleu / Jaune)',
    recommandation: 'Coup de pouce CEE majoré + MaPrimeRénov’',
    justification:
      'Coup de pouce Chauffage ou Isolation peut tripler la prime CEE standard. Cumul avec MPR par geste. Reste à charge typique 10-30 % du devis sur isolation toiture / changement chaudière.',
  },
  {
    cas: 'Vous avez signé le devis sans valoriser CEE',
    recommandation: 'Primes perdues — pas de récupération possible',
    justification:
      'La valorisation CEE doit figurer SUR le devis AVANT signature (mention « Bénéficiaire engageant et obligé délégataire »). Si vous signez sans valorisation : prime perdue, l’obligé ne peut pas valoriser une opération signée hors de son réseau.',
  },
  {
    cas: 'Votre artisan vous propose une « offre tout compris » sans détailler la prime',
    recommandation: 'Vigilance — demander le détail',
    justification:
      'Certains artisans absorbent la prime CEE dans leur marge sans le dire. Demander explicitement : (1) montant brut du devis, (2) prime CEE détaillée, (3) reste à charge. La prime appartient au consommateur, pas à l’artisan. DGCCRF a sanctionné ces pratiques.',
  },
  {
    cas: 'Logement < 2 ans ou < 1 an avec installation neuve',
    recommandation: 'Pas éligible CEE généralement',
    justification:
      'Le dispositif CEE cible la <strong>rénovation</strong> de l’existant. Logement neuf (RT 2012 / RE 2020) : équipements installés à neuf en option > déjà conformes, pas d’éligibilité CEE. Exception : remplacement d’un équipement obsolète par un plus performant.',
  },
]

const faqs = [
  {
    question: 'Prime CEE et prime énergie : c’est la même chose ?',
    answer:
      'Oui, <strong>exactement la même prime</strong>, sous différents noms commerciaux. Le mécanisme légal s’appelle <strong>Certificats d’Économie d’Énergie (CEE)</strong> — instauré par la loi POPE de 2005 (Programmation des Orientations de la Politique Énergétique). Les fournisseurs d’énergie (« <strong>obligés</strong> » : EDF, Engie, TotalEnergies, BP, Esso, Auchan, Carrefour, etc.) sont obligés par la loi de financer la transition énergétique. Pour atteindre leurs quotas, ils versent une prime aux particuliers qui réalisent des travaux d’économie d’énergie. Ils l’appellent commercialement « <strong>Prime Énergie</strong> », « <strong>Prime CEE</strong> », « <strong>Prime EDF</strong> », « <strong>Prime Engie</strong> »… mais c’est légalement la même prime.',
  },
  {
    question: 'Combien vaut une prime CEE en 2026 ?',
    answer:
      'Le montant dépend de l’<strong>opération</strong> et de la <strong>zone climatique</strong> (H1 Nord/Est froid, H2 tempéré, H3 Méditerranée). Forfaits indicatifs en kWhc (kilowattheure cumac, unité officielle CEE) : <strong>BAR-TH-104 PAC air/eau</strong> ~50 000-85 000 kWhc → ~3 000-4 500 €. <strong>BAR-EN-101 isolation toiture</strong> ~2 100-3 800 kWhc/m² → ~10-15 €/m². <strong>BAR-EN-103 plancher bas</strong> 900-1 600 kWhc/m² → ~3-8 €/m². <strong>BAR-TH-113 chaudière biomasse</strong> ~65 000-110 000 kWhc → ~4 000-6 000 €. Prix kWhc varie selon obligé et tension du marché (typiquement 4-8 c€/kWhc).',
  },
  {
    question: 'Faut-il signer avec EDF, Engie ou Total ? Lequel paie le plus ?',
    answer:
      '<strong>Aucun « toujours le meilleur ».</strong> Les montants varient selon : (1) <strong>tension du marché CEE</strong> (les prix kWhc fluctuent), (2) <strong>opération concernée</strong> (un obligé peut être plus généreux sur PAC, un autre sur isolation), (3) <strong>période</strong> (chaque obligé a des quotas trimestriels à atteindre). Notre recommandation : <strong>comparer 3 obligés</strong> avant signature du devis. Sites non-affiliés : primesenergie.fr, comparateur-cee.fr. Différence typique 20-30 %, soit plusieurs centaines € sur grosse opération.',
  },
  {
    question: 'Comment cumuler MaPrimeRénov’ et prime CEE ?',
    answer:
      '<strong>Cumul autorisé depuis 2021</strong>. Modalité : (1) signer un seul devis chez un artisan RGE avec <strong>les 2 lignes</strong> bien distinctes — MPR demandée à l’Anah, CEE valorisée auprès de l’obligé. (2) Mention sur devis : « Le bénéficiaire engageant la valorisation CEE auprès de [nom obligé] ». (3) Demander MPR <strong>en premier</strong> sur france-renov.gouv.fr, puis valoriser le CEE après travaux. Cumul typique isolation toiture 100 m² ménage très modeste : MPR 25 €/m² + CEE 12 €/m² = <strong>3 700 € d’aides cumulées</strong> sur 100 m².',
  },
  {
    question: 'Qu’est-ce que le Coup de pouce CEE ?',
    answer:
      'Le <strong>Coup de pouce CEE</strong> est une <strong>majoration</strong> de la prime CEE standard, ciblée sur les ménages modestes / très modestes. Modalités : (1) <strong>Coup de pouce Chauffage</strong> : majoration sur PAC, chaudière biomasse, raccordement réseau de chaleur (jusqu’à ×3 vs CEE standard). (2) <strong>Coup de pouce Isolation</strong> : majoration sur isolation toiture, plancher bas, murs (jusqu’à ×3). (3) <strong>Coup de pouce Thermostat</strong> : majoration sur installation thermostat connecté programmable. Conditions revenus : barèmes Anah Bleu / Jaune. Voir page dédiée <Link href="/renovation-energetique/aides/prime-coup-de-pouce">Prime Coup de pouce</Link>.',
  },
  {
    question: 'Quand est versée la prime CEE ?',
    answer:
      '<strong>Après travaux</strong>, sur présentation des justificatifs : (1) <strong>devis signé</strong> avec mention valorisation CEE, (2) <strong>facture</strong> finale détaillée, (3) <strong>attestation sur l’honneur</strong> remplie et signée, (4) éventuel certificat de l’artisan RGE. Délai de versement : <strong>4 à 12 semaines</strong> après réception du dossier complet par l’obligé. Si délai dépassé sans nouvelle, relance par mail / téléphone. En cas de litige : médiateur de l’énergie (<a href="https://www.energie-mediateur.fr" rel="noopener noreferrer" target="_blank">energie-mediateur.fr</a>) ou DGCCRF.',
  },
  {
    question: 'Mon artisan dit que la prime est « déjà déduite » du devis : c’est OK ?',
    answer:
      '<strong>Vigilance maximale.</strong> Cas légitime : si le devis indique « <strong>Total HT</strong> », « <strong>Prime CEE déduite</strong> », « <strong>Reste à charge</strong> », tout est transparent et OK. Cas frauduleux : le devis dit juste « offre tout compris X €» sans détailler la prime. Souvent l’artisan absorbe la prime dans sa marge (DGCCRF a sanctionné). <strong>La prime appartient au consommateur</strong>, pas à l’artisan. Demander toujours : (1) montant brut HT du devis, (2) prime CEE détaillée par opération, (3) reste à charge final. Si refus de détailler = signal d’alarme.',
  },
  {
    question: 'Quels travaux sont éligibles aux primes CEE ?',
    answer:
      'Les <strong>opérations standardisées</strong> du catalogue DGEC (mises à jour par arrêté). Principales : <strong>BAR-EN-101</strong> isolation toiture/combles, <strong>BAR-EN-102</strong> isolation murs ITE, <strong>BAR-EN-103</strong> isolation plancher bas, <strong>BAR-EN-104</strong> isolation murs ITI, <strong>BAR-TH-104</strong> PAC air/eau, <strong>BAR-TH-113</strong> chaudière biomasse, <strong>BAR-TH-127</strong> VMC simple flux hygroréglable, <strong>BAR-TH-125</strong> VMC double flux haute performance, <strong>BAR-TH-101</strong> chauffe-eau solaire, etc. <strong>RGE obligatoire</strong> pour la totalité. Liste exhaustive : <a href="https://www.ecologie.gouv.fr/dispositif-cee-certificats-economies-energie" rel="noopener noreferrer" target="_blank">ecologie.gouv.fr</a>.',
  },
]

const sources = [
  {
    label: 'Ministère Écologie — Dispositif CEE',
    url: 'https://www.ecologie.gouv.fr/dispositif-cee-certificats-economies-energie',
  },
  {
    label: 'France Rénov’ — Aides à la rénovation',
    url: 'https://france-renov.gouv.fr/aides',
  },
  { label: 'ADEME — Guide CEE pour particuliers', url: 'https://www.ademe.fr' },
  {
    label: 'Service-Public.fr — CEE et primes',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F35640',
  },
  {
    label: 'Médiateur de l’énergie — Litiges CEE',
    url: 'https://www.energie-mediateur.fr',
  },
  {
    label: 'DGCCRF — Pratiques commerciales CEE',
    url: 'https://www.economie.gouv.fr/dgccrf',
  },
]

const relatedPages = [
  {
    label: 'CEE — Certificats d’économie d’énergie',
    href: '/renovation-energetique/aides/cee-certificats-economie-energie',
    description: 'Page formelle CEE — fonctionnement légal',
  },
  {
    label: 'MaPrimeRénov’ 2026',
    href: '/renovation-energetique/aides/maprimerenov-2026',
    description: 'Aide d’État Anah cumulable avec CEE',
  },
  {
    label: 'Coup de pouce isolation / chauffage',
    href: '/renovation-energetique/aides/prime-coup-de-pouce',
    description: 'Majoration CEE ménages modestes',
  },
  {
    label: 'Éco-PTZ',
    href: '/renovation-energetique/aides/eco-ptz-pret-zero',
    description: 'Prêt sans intérêt — financement reste à charge',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'Estimation MPR + CEE personnalisée',
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
    section: 'Prime CEE / Prime énergie',
    keywords: [
      'prime cee',
      'prime energie',
      'prime edf',
      'prime cee edf',
      'prime engie',
      'prime totalenergies',
      'cumac',
      'kwhc',
      'obligé cee',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Aides', url: '/renovation-energetique/aides' },
    { name: 'Prime énergie', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'Prime CEE / Prime Énergie 2026 (Certificats d’Économie d’Énergie)',
    description:
      'Prime CEE = prime énergie versée par les obligés (EDF, Engie, TotalEnergies, etc.) en contrepartie de la cession des Certificats d’Économie d’Énergie. Mécanisme légal : loi POPE 2005. Cumul autorisé avec MaPrimeRénov’. Forfaits par opération standardisée (BAR-EN-101 à BAR-EN-110, BAR-TH-101 à BAR-TH-167). RGE obligatoire pour la quasi-totalité des opérations.',
    url: PAGE_URL,
    serviceType: 'Subvention privée valorisation CEE',
    audience: 'Propriétaires occupants, bailleurs, copropriétés',
    sameAs: [
      'https://www.ecologie.gouv.fr/dispositif-cee-certificats-economies-energie',
      'https://france-renov.gouv.fr',
      'https://www.legifrance.gouv.fr',
      'https://www.energie-mediateur.fr',
    ],
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
              { label: 'Prime énergie' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Wallet className="w-3.5 h-3.5" aria-hidden />
              Prime CEE 2026 — Loi POPE 2005
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Prime CEE / Prime énergie 2026 : montants, comment l’obtenir
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              <strong>Prime CEE = Prime Énergie</strong> : c’est la <strong>même prime</strong>,
              sous différents noms commerciaux. Versée par les <strong>« obligés »</strong> (EDF,
              Engie, TotalEnergies, Auchan, Carrefour, Cdiscount Énergie…) en contrepartie de la
              cession des <strong>Certificats d’Économie d’Énergie</strong> (loi POPE 2005).{' '}
              <strong>Cumulable</strong> avec MaPrimeRénov’ depuis 2021. Comparer les offres avant
              signature devis : différence 20-30 % entre obligés.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="obliges">Les principaux obligés et leurs marques</h2>
            <p>
              Les <strong>obligés</strong> sont les <strong>fournisseurs d’énergie</strong> (élec,
              gaz, fioul, GPL, carburants…) <strong>obligés par la loi</strong> de financer la
              transition énergétique. Pour atteindre leurs quotas, ils versent une prime aux
              particuliers qui réalisent des travaux d’économie d’énergie. Voici les principaux :
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Obligé</th>
                    <th className="p-3 border-b border-sand-200">Marque commerciale</th>
                    <th className="p-3 border-b border-sand-200">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {OBLIGES.map((o) => (
                    <tr key={o.nom} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{o.nom}</td>
                      <td className="p-3 text-primary-700 font-semibold">{o.marque}</td>
                      <td className="p-3 text-sand-600 text-xs">{o.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 id="forfaits">Forfaits CEE 2026 par opération principale</h2>
            <p>
              Le forfait est exprimé en <strong>kWhc</strong> (kilowattheure cumac, unité officielle
              CEE). Le montant en € dépend du <strong>prix kWhc négocié</strong> avec l’obligé
              (typiquement 4-8 c€/kWhc en 2026). Forfaits indicatifs maison individuelle :
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Opération</th>
                    <th className="p-3 border-b border-sand-200">Forfait kWhc</th>
                    <th className="p-3 border-b border-sand-200">Prime indicative</th>
                  </tr>
                </thead>
                <tbody>
                  {FORFAITS.map((f) => (
                    <tr key={f.operation} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{f.operation}</td>
                      <td className="p-3 text-sand-600 text-xs">{f.forfait}</td>
                      <td className="p-3 text-primary-700 font-semibold">{f.primeIndic}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 italic px-3 pb-2">
                Forfaits indicatifs 2026 selon arrêtés DGEC. Vérifier opération exacte sur{' '}
                <a
                  href="https://www.ecologie.gouv.fr/dispositif-cee-certificats-economies-energie"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  ecologie.gouv.fr
                </a>
                . Prime en € varie selon obligé et tension marché.
              </p>
            </div>

            <h2 id="profil">Cas typiques et recommandations</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Cas</th>
                    <th className="p-3 border-b border-sand-200">Recommandation</th>
                    <th className="p-3 border-b border-sand-200">Pourquoi</th>
                  </tr>
                </thead>
                <tbody>
                  {PROFILS.map((r) => (
                    <tr key={r.cas} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{r.cas}</td>
                      <td className="p-3 text-primary-700 font-semibold">{r.recommandation}</td>
                      <td
                        className="p-3 text-sand-600 text-xs"
                        dangerouslySetInnerHTML={{ __html: r.justification }}
                      />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="not-prose border-2 border-amber-300 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">
                  Signer la prime AVANT le devis — sinon prime perdue
                </p>
                <p className="m-0">
                  La valorisation CEE doit figurer <strong>sur le devis avant signature</strong>{' '}
                  (mention « Bénéficiaire engageant et obligé délégataire »). Si vous signez sans
                  cette mention, l’obligé ne peut plus valoriser l’opération a posteriori. La prime
                  est définitivement perdue.
                </p>
              </div>
            </div>

            <h2 id="cta">Devis avec prime CEE optimisée</h2>
            <div className="not-prose bg-primary-50 border border-primary-200 rounded-xl p-6 my-6">
              <p className="text-sand-900 m-0 mb-3">
                <Calculator className="inline w-5 h-5 text-primary-700 mr-1" aria-hidden />
                <strong>Devis avec prime CEE en 30 secondes</strong> — artisans RGE de notre réseau,
                prime valorisée AVANT signature.
              </p>
              <Link
                href="/devis"
                className="inline-flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white font-semibold px-5 py-3 rounded-lg transition"
              >
                Demander mon devis avec prime CEE <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
          </article>

          <FlagshipFaq items={faqs} />

          <section className="my-10">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
              Pour aller plus loin
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {relatedPages.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="block bg-white border border-sand-200 hover:border-primary-300 rounded-xl p-4 transition"
                >
                  <p className="font-semibold text-sand-900 m-0 mb-1 inline-flex items-center gap-1">
                    {p.label} <ArrowRight className="w-3.5 h-3.5 text-primary-700" aria-hidden />
                  </p>
                  <p className="text-sm text-sand-600 m-0">{p.description}</p>
                </Link>
              ))}
            </div>
          </section>

          <FlagshipSources sources={sources} />
          <FlagshipAuthorCard
            authorSlug={AUTHOR_SLUG}
            authorName={AUTHOR_NAME}
            datePublished={PUBLISHED}
            dateModified={MODIFIED}
          />
        </div>
      </div>
    </>
  )
}
