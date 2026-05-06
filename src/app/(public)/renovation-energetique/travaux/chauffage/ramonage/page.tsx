/**
 * Page : /renovation-energetique/travaux/chauffage/ramonage
 *
 * @kw-primary    ramonage cheminée
 * @kw-volume     2400
 * @kw-kd         2
 * @kw-cpc        0.75
 * @cluster       5
 * @ahrefs-source docs/ahrefs-audit-2026-04/normalized/ahrefs-content-gap.csv
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — cluster ramonage / fumisterie)
 * @backlog-item  Levier-I-ramonage-cheminee
 *
 * KW cibles (validés Ahrefs gap CSV 2026-04, country=fr) :
 * - "ramoneur"                4 900 vol, KD 0 ⭐⭐⭐
 * - "ramonage"                4 200 vol, KD 11
 * - "ramonage autour de moi"  3 600 vol, KD 0 ⭐⭐⭐
 * - "ramonage cheminée"       2 400 vol, KD 2 ⭐⭐⭐ pivot
 * - "ramoneur autour de moi"  1 800 vol, KD 0
 * - "prix ramonage cheminée"  1 200 vol, KD 0
 * - "ramonage cheminée prix"    600 vol, KD 0
 * - "ramonage chaudiere gaz"    450 vol, KD 0
 * - "tarif ramonage poêle à granulés" 400 vol, KD 0
 * - "tarif ramonage cheminée"   350 vol, KD 0
 * - Famille cumulée pivot : ~19 900 vol/mois (Pages Jaunes #3-5, Travaux #5-13)
 *
 * Source : docs/ahrefs-audit-2026-04/normalized/ahrefs-content-gap.csv
 * Easy win : MAJEUR (KD 0-2, 0 acteur RGE-first sur SERP, 0 page existante côté SA)
 * Cluster pillar : Rénovation Énergétique → Travaux → Chauffage → Ramonage
 *
 * Anti-cannibalisation :
 *   - /travaux/chauffage                     = hub chauffage (intent achat)
 *   - /travaux/chauffage/poele-granules      = produit poêle (intent install)
 *   - /travaux/chauffage/chaudiere-bois      = produit chaudière bois (intent install)
 *   - /travaux/chauffage/chaudiere-condensation = produit chaudière gaz (intent install)
 *   - /travaux/pompe-a-chaleur/entretien     = entretien PAC (autre énergie)
 *   - /travaux/vmc/entretien                 = entretien VMC
 *   - Cette page = entretien obligatoire conduits de fumée (intent service récurrent)
 *
 * YMYL high : obligation légale (Décret 2023-741 du 8 août 2023, Code construction
 * et habitation R136-1 à R136-10), responsabilité civile/pénale (incendie, intoxication CO),
 * assurance habitation (clause attestation ramonage). Pas d'aide MPR/CEE pour le ramonage.
 *
 * Cite : Décret 2023-741, Code construction R136-1 à R136-10, RSD type (Règlement sanitaire
 * départemental) art. 7, service-public.fr, ADEME, INRS R408 (travail en hauteur),
 * arrêté préfectoral local (sanctions).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Flame,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calculator,
  Calendar,
  HardHat,
  FileCheck,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/chauffage/ramonage'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Prix ramonage cheminée 2026 : 50-150 € + obligation'
const DESCRIPTION =
  'Ramonage cheminée 2026 : 50-90 € pour cheminée/insert, 70-120 € poêle granulés, 90-150 € chaudière bois. Obligation annuelle (Décret 2023-741), certificat exigé.'

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
  'Prix moyen 2026 : cheminée ouverte ou insert 50-90 €, poêle à granulés 70-120 €, chaudière à bois 90-150 €, conduit gaz 80-120 €. TVA 10 % en logement > 2 ans avec artisan.',
  'Obligation légale annuelle depuis le Décret 2023-741 du 8 août 2023 : un ramonage mécanique par an pour tout conduit de fumée (combustibles solides, liquides ou gaz).',
  'Le ramonage doit être réalisé par un professionnel qualifié, avec hérisson mécanique, et donne lieu à un certificat de ramonage daté à conserver 12 mois.',
  'Sanction en cas d’absence : amende 3ᵉ classe = 450 € (RSD type art. 7). Cas d’incendie ou d’intoxication CO : nullité possible de la garantie habitation, responsabilité civile et pénale.',
  'Méthode pro : ramonage mécanique strict (pas de bûches chimiques), inspection visuelle complète, vérification tirage et étanchéité, remise certificat conforme.',
  'Aucune aide MaPrimeRénov’ ni CEE (entretien, pas une rénovation énergétique). TVA 10 % automatique avec un artisan en logement de plus de 2 ans.',
]

const PRIX_RAMONAGE = [
  {
    type: 'Cheminée ouverte ou insert (bois)',
    prix: '50 - 90 €',
    duree: '30-45 min',
    note: 'Ramonage mécanique simple par hérisson. Inclut nettoyage du foyer, vérification tirage, certificat. Prestation la plus standard.',
  },
  {
    type: 'Poêle à bois ou poêle à granulés',
    prix: '70 - 120 €',
    duree: '45-60 min',
    note: 'Démontage des éléments, nettoyage corps de chauffe + échangeur, vérification joints. Granulés : nécessite technicien certifié constructeur (Stûv, MCZ, Edilkamin…).',
  },
  {
    type: 'Chaudière à bois ou bois-bûches',
    prix: '90 - 150 €',
    duree: '1-1,5 h',
    note: 'Ramonage conduit + nettoyage chaudière (turbulateurs, échangeur). Souvent associé à l’entretien annuel obligatoire (Arrêté 15/09/2009 modifié).',
  },
  {
    type: 'Conduit chaudière gaz ou fioul',
    prix: '80 - 120 €',
    duree: '30-60 min',
    note: 'Ramonage conduit de fumée chaudière. Souvent inclus dans le contrat d’entretien chaudière. Exigé par certains assureurs même pour le gaz.',
  },
  {
    type: 'Forfait 2ᵉ conduit ou détartrage mécanique',
    prix: '+30 - 50 €',
    duree: '+15-30 min',
    note: '2ᵉ conduit dans la même visite (-20 % vs prestation seule). Détartrage par tube descendant ou outils mécaniques rotatifs : +30-50 €.',
  },
]

const FACTEURS_PRIX = [
  {
    title: 'Type de combustible',
    impact: '×1 à ×2',
    desc: 'Bois > granulés > gaz > fioul (par ordre décroissant de salissement). Bois bûches : encrassement rapide → durée de visite plus longue.',
  },
  {
    title: 'Hauteur et accessibilité du conduit',
    impact: '+15 à +40 %',
    desc: 'Conduit > 6 m, tubage en angle, conduit extérieur ou en façade : majoration 15-40 %. Conduit ancien non tubé : devis spécifique avec inspection vidéo.',
  },
  {
    title: 'État du conduit',
    impact: '×1,3 à ×2',
    desc: 'Bistre dur, créosote, oxydation : nécessite débistrage chimique (à part) ou outils mécaniques rotatifs. Devis sur diagnostic après inspection vidéo (+50-100 €).',
  },
  {
    title: 'Région et saison',
    impact: '±10-20 %',
    desc: 'Saison : haute saison ramonage = septembre à janvier (+10-15 %). Été creux = -10-15 %. Régions montagne ou rurales : tarifs plus stables, déplacements plus longs.',
  },
  {
    title: 'Forfait annuel ou contrat',
    impact: '-15 à -25 %',
    desc: 'Contrat annuel (1 visite + certificat) : 60-130 €/an selon installation, soit 15-25 % de moins qu’une intervention ponctuelle. Souvent reconductible tacitement.',
  },
]

const OBLIGATIONS_LEGALES = [
  {
    title: 'Décret 2023-741 du 8 août 2023 — obligation annuelle',
    desc: 'Tout conduit de fumée raccordé à un appareil de chauffage ou d’eau chaude (combustibles solides, liquides ou gaz) doit être ramoné mécaniquement au moins une fois par an. Texte unifié à l’échelle nationale.',
  },
  {
    title: 'Code construction et habitation art. R136-1 à R136-10',
    desc: 'Définit les obligations du propriétaire (en occupation directe ou bailleur) en matière de ramonage : conduits, fréquence, qualification du professionnel, certificat à conserver 12 mois.',
  },
  {
    title: 'Règlement sanitaire départemental (RSD) type art. 7',
    desc: 'Donne le pouvoir au maire d’adresser une amende de 3ᵉ classe (450 €) au propriétaire ou à l’occupant en cas d’absence d’attestation de ramonage à jour.',
  },
  {
    title: 'Charges bailleur / locataire (Décret 87-712 + Loi 89-462 art. 7)',
    desc: 'Ramonage = entretien courant à la charge du locataire pendant la durée du bail. Contrôle initial à l’entrée et fin de bail = à la charge du bailleur.',
  },
]

const QUI_CHOISIR = [
  {
    title: 'Ramoneur certifié ou Qualibat 5921 (fumisterie)',
    must: 'Recommandé',
    desc: 'Préférer un professionnel disposant de la qualification Qualibat 5921 (fumisterie) ou d’un certificat de capacité ramonage. Vérifier RC pro et numéro SIRET avant intervention.',
  },
  {
    title: 'Ramonage mécanique strict (hérisson)',
    must: 'Obligatoire',
    desc: 'Le ramonage doit être MÉCANIQUE (hérisson rotatif ou descente) — les bûches dites « ramoneur chimique » ne remplacent PAS un ramonage légal. Sans hérisson, pas de certificat valide.',
  },
  {
    title: 'Certificat de ramonage daté et signé',
    must: 'Obligatoire',
    desc: 'À la fin de la prestation, le pro DOIT remettre un certificat de ramonage daté, signé, mentionnant l’adresse, le conduit, le type de combustible, et les éventuelles anomalies. À conserver 12 mois.',
  },
  {
    title: 'Inspection visuelle ou caméra du conduit',
    must: 'Recommandé',
    desc: 'Pour conduits > 30 ans, conduits non tubés ou suspicion de bistre dur : exiger une inspection vidéo (+50-100 €). Permet de détecter fissures, dépôts, conduit endommagé.',
  },
  {
    title: 'Assurance RC pro travail en hauteur',
    must: 'Obligatoire',
    desc: 'Le ramonage en toiture = travail en hauteur (Code travail R4323-58, INRS R408/R430). Sans assurance RC pro à jour mentionnant « ramonage », votre RC habitation peut se retourner contre vous en cas d’accident.',
  },
]

const faqs = [
  {
    question: 'Combien coûte un ramonage de cheminée en 2026 ?',
    answer:
      'Selon le type d’installation : cheminée ouverte ou insert 50-90 €, poêle à bois ou poêle à granulés 70-120 €, chaudière à bois 90-150 €, conduit chaudière gaz 80-120 €. Forfait 2ᵉ conduit dans la même visite : +30-50 €. Contrat annuel reconductible : 15-25 % moins cher qu’une intervention ponctuelle. TVA 10 % en logement > 2 ans avec un artisan.',
  },
  {
    question: 'Le ramonage est-il vraiment obligatoire en 2026 ?',
    answer:
      'OUI. Depuis le Décret 2023-741 du 8 août 2023, un ramonage mécanique annuel est obligatoire pour tout conduit de fumée raccordé à un appareil de chauffage ou d’eau chaude — quel que soit le combustible (bois, granulés, fioul, gaz). Le texte unifie au niveau national des obligations qui étaient auparavant variables par RSD départemental. Le propriétaire occupant ou le bailleur est responsable du respect de cette obligation.',
  },
  {
    question: 'Que risque-t-on en cas d’absence de ramonage ?',
    answer:
      'Trois risques principaux : (1) amende administrative de 3ᵉ classe 450 € (RSD type art. 7), (2) refus partiel ou total de prise en charge par l’assurance habitation en cas de feu de cheminée ou intoxication CO, (3) responsabilité civile et pénale en cas de dommages aux tiers (voisins, copropriété). Conserver le certificat de ramonage à jour est donc impératif, pour soi et pour son assureur.',
  },
  {
    question: 'Peut-on faire son ramonage soi-même ?',
    answer:
      'Techniquement oui, mais cela ne vaut PAS un ramonage légal : seul un ramonage réalisé par un professionnel qualifié donne lieu à un certificat de ramonage opposable à l’assurance et à l’administration. De plus, le travail en hauteur (Code travail R4323-58, INRS R408/R430) impose harnais antichute et formation. Une auto-intervention ne dispense pas du ramonage pro annuel obligatoire.',
  },
  {
    question: 'Les bûches « ramoneur chimique » remplacent-elles un ramonage ?',
    answer:
      'NON. Les bûches dites « ramoneur chimique » sont des produits qui décollent partiellement le bistre, mais elles ne remplacent EN AUCUN CAS un ramonage mécanique légal. Aucun certificat de ramonage ne peut être délivré sur la base d’une bûche chimique. Elles peuvent être utilisées en complément entre deux ramonages annuels, mais jamais à la place.',
  },
  {
    question: 'Quelle est la meilleure période pour faire ramoner ?',
    answer:
      'Idéalement à la fin de la saison de chauffe (printemps : avril-juin) ou avant le redémarrage (fin d’été : août-septembre). Avantage : tarifs plus bas (-10 à -15 % en saison creuse) et disponibilité des pros plus large. À éviter : décembre-janvier (haute saison, +10-15 %, délais 4-6 semaines). Pour les chaudières bois et poêles granulés, planifier l’entretien annuel constructeur en même temps.',
  },
  {
    question: 'Le ramonage est-il à la charge du locataire ou du bailleur ?',
    answer:
      'Décret 87-712 + Loi 89-462 art. 7 : le ramonage annuel pendant la durée du bail = entretien courant à la charge du LOCATAIRE. Le bailleur reste responsable du contrôle initial à l’entrée dans les lieux (conduit en bon état, certificat de ramonage récent) et de la réparation des conduits endommagés (gros entretien). En copropriété, les conduits collectifs sont à la charge du syndic.',
  },
  {
    question: 'Y a-t-il une aide MaPrimeRénov’ ou CEE pour le ramonage ?',
    answer:
      'NON. Le ramonage est un acte d’entretien courant, pas une rénovation énergétique. Il n’est éligible à AUCUNE aide publique : ni MaPrimeRénov’, ni CEE, ni éco-PTZ. Seule la TVA 10 % s’applique en logement de plus de 2 ans avec un artisan. À noter : si vous remplacez votre installation (poêle, chaudière) avec une solution éligible, le ramonage initial peut être inclus dans le devis global de pose.',
  },
]

const sources = [
  {
    label: 'Légifrance — Décret 2023-741 du 8 août 2023 (ramonage)',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000047943089',
  },
  {
    label: 'Légifrance — Code construction et habitation art. R136-1 à R136-10',
    url: 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074096/LEGISCTA000045748867/',
  },
  {
    label: 'service-public.fr — Ramonage des conduits',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F31896',
  },
  {
    label: 'Légifrance — Décret 87-712 (charges récupérables locataire)',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000874984/',
  },
  {
    label: 'INRS — Travail en hauteur, recommandations R408 / R430',
    url: 'https://www.inrs.fr/risques/chutes-hauteur',
  },
  {
    label: 'Qualibat — référentiel 5921 fumisterie',
    url: 'https://www.qualibat.com',
  },
  { label: 'ADEME — Entretien des installations bois énergie', url: 'https://librairie.ademe.fr' },
]

const relatedPages = [
  {
    label: 'Hub Chauffage rénovation',
    href: '/renovation-energetique/travaux/chauffage',
  },
  {
    label: 'Poêle à granulés (prix + aides)',
    href: '/renovation-energetique/travaux/chauffage/poele-granules',
  },
  {
    label: 'Chaudière à bois',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-bois',
  },
  {
    label: 'Chaudière condensation gaz',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-condensation',
  },
  {
    label: 'Entretien pompe à chaleur',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/entretien',
  },
  {
    label: 'Entretien VMC',
    href: '/renovation-energetique/travaux/vmc/entretien',
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
    section: 'Travaux — Chauffage — Ramonage',
    keywords: [
      'ramonage cheminée',
      'prix ramonage cheminée',
      'ramoneur',
      'ramonage poêle granulés',
      'ramonage obligatoire',
      'certificat de ramonage',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Chauffage', url: '/renovation-energetique/travaux/chauffage' },
    { name: 'Ramonage', url: PAGE_PATH },
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
              { label: 'Rénovation énergétique', href: '/renovation-energetique' },
              { label: 'Travaux', href: '/renovation-energetique/travaux' },
              { label: 'Chauffage', href: '/renovation-energetique/travaux/chauffage' },
              { label: 'Ramonage' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Flame className="w-3.5 h-3.5" aria-hidden />
              Chauffage &middot; Ramonage / fumisterie
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Prix ramonage cheminée 2026 : 50-150 € + obligation annuelle
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              En 2026, un ramonage coûte <strong>50-90 €</strong> pour une cheminée ou un insert,{' '}
              <strong>70-120 €</strong> pour un poêle à granulés et <strong>90-150 €</strong> pour
              une chaudière à bois. Le ramonage mécanique <strong>annuel</strong> est obligatoire
              depuis le <strong>Décret 2023-741 du 8 août 2023</strong> pour tout conduit de fumée.
              Sans certificat à jour : amende 450 € et nullité possible de la garantie habitation.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Prix ramonage 2026 selon votre installation</h2>
            <p>
              Les tarifs ci-dessous sont les fourchettes constatées en 2026 (TTC, hors déplacement
              supplémentaire et hors options) :
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Installation</th>
                    <th className="p-3 border-b border-sand-200">Prix TTC</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Durée</th>
                    <th className="p-3 border-b border-sand-200 hidden lg:table-cell">Note</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {PRIX_RAMONAGE.map((row) => (
                    <tr key={row.type} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold whitespace-nowrap">{row.type}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.prix}
                      </td>
                      <td className="p-3 hidden md:table-cell whitespace-nowrap">{row.duree}</td>
                      <td className="p-3 text-sand-600 hidden lg:table-cell">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Tarifs nationaux 2026, hors options (débistrage, inspection vidéo, conduit
                non-conforme). TVA 10 % en logement &gt; 2 ans avec artisan.
              </p>
            </div>

            <h2>5 facteurs qui font varier le prix</h2>
            <div className="not-prose grid gap-3 my-6">
              {FACTEURS_PRIX.map((factor) => (
                <div
                  key={factor.title}
                  className="bg-white border border-sand-200 rounded-lg p-4 flex items-start gap-3"
                >
                  <Calculator className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-sand-900 m-0">{factor.title}</p>
                      <span className="text-xs font-semibold text-primary-800 bg-primary-50 px-2 py-0.5 rounded">
                        {factor.impact}
                      </span>
                    </div>
                    <p className="text-sm text-sand-700 m-0 mt-1">{factor.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2>Vos obligations légales 2026</h2>
            <p>
              Le ramonage est encadré par 4 textes nationaux qu’un propriétaire ou un bailleur doit
              absolument connaître :
            </p>
            <div className="not-prose grid gap-3 my-6">
              {OBLIGATIONS_LEGALES.map((item) => (
                <div
                  key={item.title}
                  className="bg-white border border-amber-200 rounded-lg p-4 flex items-start gap-3"
                >
                  <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
                  <div className="flex-1">
                    <p className="font-semibold text-sand-900 m-0">{item.title}</p>
                    <p className="text-sm text-sand-700 m-0 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="not-prose border-2 border-red-300 bg-red-50 rounded-lg p-5 my-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-700 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-semibold text-red-900 m-0">
                    Sans certificat de ramonage : amende 450 € + nullité possible de l’assurance
                  </p>
                  <p className="text-sm text-red-900 mt-2 mb-0">
                    En cas de feu de cheminée ou d’intoxication au monoxyde de carbone (CO), votre
                    assureur habitation peut <strong>refuser de prendre en charge</strong> les
                    dommages si vous ne pouvez pas produire de certificat de ramonage daté de moins
                    de 12 mois. À cela s’ajoute une amende administrative de 3ᵉ classe (450 €)
                    prévue par le Règlement sanitaire départemental type, art. 7.
                  </p>
                </div>
              </div>
            </div>

            <h2>5 critères pour choisir un pro</h2>
            <div className="not-prose grid gap-3 my-6">
              {QUI_CHOISIR.map((item) => (
                <div
                  key={item.title}
                  className="bg-white border border-sand-200 rounded-lg p-4 flex items-start gap-3"
                >
                  <HardHat className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-sand-900 m-0">{item.title}</p>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          item.must === 'Obligatoire'
                            ? 'text-red-800 bg-red-50'
                            : 'text-amber-800 bg-amber-50'
                        }`}
                      >
                        {item.must}
                      </span>
                    </div>
                    <p className="text-sm text-sand-700 m-0 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <FileCheck className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Demandez 3 devis ramonage en 2 minutes
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    3 ramoneurs vérifiés vous répondent sous 48 h. Devis détaillés ramonage seul ou
                    contrat annuel + entretien chaudière / poêle, certificat conforme inclus.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/devis"
                      className="inline-flex items-center gap-1.5 bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
                    >
                      Demander 3 devis <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                    <Link
                      href="/rge/renovation-energetique"
                      className="inline-flex items-center gap-1.5 bg-white text-primary-700 border border-primary-200 px-4 py-2 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                    >
                      Annuaire artisans <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <h2>Quand programmer son ramonage ?</h2>
            <ul>
              <li>
                <Calendar className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />{' '}
                <strong>Printemps (avril-juin)</strong> : juste après la saison de chauffe, tarifs
                en saison creuse (-10 à -15 %), disponibilité maximale.
              </li>
              <li>
                <Calendar className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />{' '}
                <strong>Fin d’été (août-septembre)</strong> : avant le redémarrage de
                l’installation, idéal pour combiner avec entretien chaudière / poêle.
              </li>
              <li>
                <Calendar className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />{' '}
                <strong>À éviter</strong> : décembre-janvier (haute saison, +10-15 %, délais souvent
                4-6 semaines).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden /> Pour
                un usage intensif (bois bûches, chaudière bois en résidence principale) : certains
                pros recommandent un 2ᵉ ramonage en cours de saison.
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

          <div className="flex items-center justify-between text-sm text-sand-600 border-t border-sand-200 pt-4 mt-6">
            <Link
              href="/renovation-energetique/travaux/chauffage"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Chauffage
            </Link>
            <Link
              href="/renovation-energetique/travaux"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Hub Travaux <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
