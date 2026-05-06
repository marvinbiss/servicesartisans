/**
 * Page : /renovation-energetique/travaux/chauffage/poele-granules/entretien
 *
 * @kw-primary    entretien poele a granule
 * @kw-volume     1000
 * @kw-kd         0
 * @kw-cpc        0.85
 * @intent        commercial + service
 * @cluster       poele_granules
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md (rang #140, #158)
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — sub-cluster entretien poele granule)
 * @backlog-item  Levier-N-entretien-poele-granule
 *
 * KW cibles (validés Ahrefs gap CSV 2026-04, country=fr) :
 * - "entretien poele a granule"          1 000 vol, KD 0  ⭐⭐⭐ pivot rang #140
 * - "tarif entretien poêle à granulés"     350 vol, KD 0  rang #158
 * - "entretien poele a granule prix"        150 vol, KD 0  longue traîne
 * - "ramonage poele granule"                400 vol, KD 0  partiellement couvert /ramonage
 * - "contrat entretien poele granule"       300 vol, KD 0  longue traîne
 * - "nettoyer poele a granule"              300 vol, KD 0  longue traîne
 * - Famille cumulée pivot : ~2 500 vol/mois (KW pivot KD 0 = pure easy win)
 *
 * Easy win : OUI (KD 0 sur pivot, leader quelleenergie #4 page commodité).
 * 0 page SA dédiée entretien poêle granulé (que /ramonage qui couvre les conduits
 * mais pas le brûleur/échangeur/cendrier/joints du poêle lui-même).
 *
 * Cluster pillar : Rénovation Énergétique → Travaux → Chauffage → Poêle granulés → Entretien
 *
 * Anti-cannibalisation :
 *   - /chauffage/poele-granules                    = produit poêle (intent achat)
 *   - /chauffage/poele-granules/sans-electricite   = niche techno
 *   - /chauffage/ramonage                          = entretien CONDUITS fumée (Décret 2023-741)
 *   - /chauffage/chaudiere-condensation/entretien  = entretien chaudière gaz (Décret 2009-649)
 *   - /chauffage/tubage-cheminee                   = pose tubage
 *   - Cette page = entretien APPAREIL poêle (brûleur, échangeur, cendrier, joints,
 *     bougie d'allumage, vis sans fin) — distinct du conduit (ramonage)
 *
 * YMYL high : obligation entretien constructeur (Loi consommation, garantie),
 * sécurité (intoxication CO en cas d'encrassement), assurance habitation.
 * Cite : Légifrance, Décret 2023-741 (ramonage), notices constructeurs (MCZ,
 * Edilkamin, Rika, Stûv), ADEME, Propellet, Qualibois Air, Flamme Verte.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Coins,
  Flame,
  ShieldCheck,
  Wrench,
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

const PAGE_PATH = '/renovation-energetique/travaux/chauffage/poele-granules/entretien'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Entretien poêle à granulés 2026 : prix & fréquence'
const DESCRIPTION =
  'Entretien poêle à granulés 2026 : nettoyage hebdo gratuit, ramonage 80-150 €, entretien annuel pro 150-220 € HT. 12 points contrôlés, garantie constructeur, sécurité CO.'

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
  '3 niveaux : nettoyage utilisateur (hebdo, gratuit), ramonage conduit (annuel, 80-150 €), entretien pro appareil (annuel, 150-220 € HT).',
  'Ramonage du conduit obligatoire (Décret 2023-741) — 2 fois/an dont 1 en saison de chauffe.',
  'Entretien annuel constructeur recommandé pour conserver la garantie (souvent obligatoire en année 1-2).',
  '12 points contrôlés par le pro : brûleur, échangeur, ventilateurs, cendrier, joints, bougie, vis sans fin, sondes.',
  "Conserver toutes les factures d'entretien : exigées par l'assurance habitation en cas d'incendie.",
  "Pro RGE certifié Qualibois 'Module Air' (poêles et inserts) ou agréé constructeur (MCZ, Edilkamin, Rika, Stûv).",
  'Vidange cendrier + nettoyage vitre 1×/semaine en saison. 200-400 g de cendres par tonne de granulés brûlés.',
]

const NIVEAUX_ENTRETIEN = [
  {
    niveau: '1. Nettoyage utilisateur (hebdomadaire)',
    cout: 'Gratuit (vous-même)',
    frequence: '1× par semaine en saison',
    detail:
      'Vidange du cendrier (200-400 g/sem pour 5 t de granulés/an), nettoyage de la vitre (papier + cendre froide humide), aspiration du foyer avec aspirateur à cendres (jamais aspirateur classique = risque incendie). Durée 5-10 min.',
  },
  {
    niveau: '2. Ramonage du conduit (annuel ou semestriel)',
    cout: '80-150 € HT',
    frequence: '2 fois/an dont 1 en saison de chauffe (Décret 2023-741)',
    detail:
      "Brossage mécanique du conduit de fumée par un ramoneur agréé. Élimine les bistres et goudrons (risque feu de cheminée). Attestation à conserver 2 ans (exigée par l'assurance). Distinct de l'entretien appareil.",
  },
  {
    niveau: '3. Entretien annuel pro (appareil)',
    cout: '150-220 € HT',
    frequence: '1 fois/an obligatoire (recommandé constructeur)',
    detail:
      "Démontage et nettoyage approfondi du brûleur, échangeur, ventilateurs, joints, bougie d'allumage. Contrôle de la combustion, mise à jour firmware, paramétrage régulation. Entretien obligatoire pour conserver la garantie constructeur (souvent 5 ans).",
  },
  {
    niveau: '4. Contrat entretien (option)',
    cout: '180-280 € HT/an',
    frequence: 'Annuel + dépannage 24/7 inclus',
    detail:
      "Visite annuelle + dépannage 24h/24 + petites pièces (bougie, sondes, joints). Recommandé si poêle 5-10 ans avec pannes fréquentes. Comparer avec assurance habitation classique : souvent moins rentable qu'à l'acte.",
  },
]

const POINTS_CONTROLE = [
  'Démontage et nettoyage du brûleur (creuset) — points chauds, encrassement',
  "Nettoyage approfondi de l'échangeur (tubes / chicanes) — gain rendement +5-10 %",
  "Dépoussiérage du ventilateur de combustion (fan d'extraction) et du ventilateur de soufflage",
  'Vidange complète et nettoyage du cendrier amovible et du tiroir de récupération',
  'Vérification et remplacement éventuel des joints (porte vitrée, trappe technique) — étanchéité',
  "Contrôle et remplacement éventuel de la bougie d'allumage (résistance) — durée vie ~3-5 ans",
  'Vérification de la vis sans fin (alimentation granulés) et de son moteur',
  'Contrôle des sondes de température (foyer, fumées, ambiance) et de la pression',
  "Vérification du conduit d'évacuation des fumées (tirage, étanchéité) en complément du ramonage",
  'Mise à jour du firmware régulation (modèles connectés MCZ Maestro, Edilkamin)',
  'Contrôle des sécurités (anti-retour de flamme, surchauffe, dépression)',
  "Édition de l'attestation d'entretien + recommandations + conseils d'utilisation",
]

const ARNAQUES = [
  {
    type: 'Contrat « tout inclus » à 400 €/an',
    detail:
      'Vendu par énergéticiens (Engie HomeServices, EDF Soluzio) à 350-450 € HT/an. Comprend dépannage + pièces majeures, mais en pratique pour un poêle granulé moderne (8-10 ans), peu de chances de panne majeure. Préférer le ponctuel + assurance habitation classique.',
  },
  {
    type: 'Visite annuelle « gratuite »',
    detail:
      'Le pro propose une visite gratuite la 1ère année puis vous facture 280-380 € HT à partir de la 2ème (vs 150-220 € HT prix marché). À éviter — exigez tarifs clairs sur 5 ans.',
  },
  {
    type: "« Pièces obligatoires » lors de l'entretien",
    detail:
      "Certains pros facturent des pièces neuves systématiquement (joints, bougie d'allumage, sondes) même si en bon état. Une bougie d'allumage dure 3-5 ans, des joints porte 5-10 ans. Refuser le remplacement systématique.",
  },
  {
    type: 'Démarches administratives forfait',
    detail:
      "Facturation 50-100 € pour « démarches administratives » bidon (pas d'attestation officielle requise comme pour les chaudières gaz). Refuser cette ligne : seule l'attestation de ramonage est exigée par l'assurance, et elle est incluse dans le ramonage 80-150 €.",
  },
]

const faqs = [
  {
    question: "Combien coûte l'entretien d'un poêle à granulés en 2026 ?",
    answer:
      "3 niveaux à cumuler : (1) nettoyage hebdomadaire utilisateur — gratuit, 5-10 min/sem en saison ; (2) ramonage du conduit obligatoire — 80-150 € HT/intervention × 2 fois/an dont 1 en saison de chauffe (Décret 2023-741) = 160-300 € HT/an ; (3) entretien annuel pro de l'appareil — 150-220 € HT/an. Total annuel : 310-520 € HT pour un foyer qui externalise tout. Variations +15-25 % en Île-de-France et grandes métropoles. Le contrat tout inclus (180-280 € HT/an) regroupe (3) + dépannage et est rentable seulement après 5-7 ans d'âge du poêle.",
  },
  {
    question: "L'entretien d'un poêle à granulés est-il obligatoire ?",
    answer:
      "Strictement légalement, seul le <strong>ramonage du conduit</strong> est obligatoire (Décret n° 2023-741 du 8 août 2023, Code construction R136-1 à R136-10) — 2 fois/an dont 1 en saison de chauffe pour les conduits de combustibles solides (granulés bois). Sanctions : amende 450 € (4ème classe RSD type) + responsabilité civile et pénale en cas d'incendie + refus assurance habitation. <strong>L'entretien de l'appareil lui-même</strong> n'est pas légalement obligatoire (contrairement aux chaudières gaz Décret 2009-649) MAIS il est exigé par 90 % des constructeurs (MCZ, Edilkamin, Rika, Stûv, Hase) pour conserver la garantie 5 ans.",
  },
  {
    question: "Quand faire le ramonage et quand faire l'entretien appareil ?",
    answer:
      "<strong>Ramonage du conduit</strong> : 2 fois/an, dont 1 fois en pleine saison de chauffe (idéalement décembre-janvier après 2-3 mois d'utilisation), 1 fois hors saison (mai-juin idéal pour limiter les bistres). <strong>Entretien appareil</strong> : 1 fois/an, idéalement en début de saison (septembre-octobre) pour redémarrer en bon état, ou hors saison (avril-mai) si vous préférez. Ne jamais faire l'entretien appareil et le ramonage en même temps si possible (tarifs séparés mieux contrôlés).",
  },
  {
    question: "Quels points sont contrôlés lors de l'entretien annuel pro ?",
    answer:
      "12 points minimum : (1) démontage et nettoyage du brûleur (creuset), (2) nettoyage approfondi de l'échangeur (chicanes), (3) dépoussiérage des ventilateurs combustion et soufflage, (4) vidange complète du cendrier, (5) vérification et remplacement éventuel des joints porte/trappe, (6) contrôle bougie d'allumage (durée vie 3-5 ans, 50-80 € HT pièce), (7) vérification vis sans fin alimentation, (8) contrôle des sondes (foyer, fumées, ambiance), (9) vérification du conduit (tirage, étanchéité), (10) mise à jour firmware (modèles connectés), (11) contrôle des sécurités (anti-retour flamme, surchauffe), (12) attestation + conseils. Durée 1h-1h30.",
  },
  {
    question: "Que faire si je n'ai pas d'attestation de ramonage ?",
    answer:
      "3 risques majeurs : (1) <strong>refus partiel ou total d'indemnisation</strong> par l'assurance habitation en cas d'incendie ou intoxication CO — la majorité des contrats exigent l'attestation des 2 dernières années ; (2) <strong>amende</strong> 450 € (Règlement Sanitaire Départemental, 4ème classe) en cas de contrôle ; (3) <strong>responsabilité civile et pénale</strong> si dommage à un tiers (voisin) imputable à un défaut d'entretien. Solution : programmer un ramonage rapidement (80-150 € HT) et conserver l'attestation 2 ans minimum. La date d'effet ne peut pas être rétroactive.",
  },
  {
    question: "Quel pro choisir pour l'entretien d'un poêle à granulés ?",
    answer:
      "2 options : (1) <strong>RGE Qualibois 'Module Air'</strong> (poêles et inserts, distinct de Qualibois 'Module Chaudières') — plombier-chauffagiste qualifié, généraliste biomasse ; (2) <strong>agréé constructeur</strong> (MCZ, Edilkamin, Rika, Stûv, Hase) — souvent plus cher mais conserve la garantie usine 5 ans. Vérifier : SIRET valide, attestation décennale, certificat Qualibois Air à jour, références chantiers (10 mini), devis détaillé avec prix HT, durée intervention, périmètre des contrôles, conditions du contrat éventuel. Comparer 2-3 devis. Notre annuaire référence uniquement des chauffagistes vérifiés.",
  },
  {
    question: 'Comment nettoyer un poêle à granulés soi-même ?',
    answer:
      "Hebdomadaire : (1) couper l'alimentation et laisser refroidir 2-3 h ; (2) sortir le cendrier amovible et vider dans un seau métallique avec couvercle (jamais sac plastique, risque incendie) ; (3) aspirer le foyer avec un <strong>aspirateur à cendres spécifique</strong> (filtre HEPA + bac métallique, 80-150 €) ; (4) nettoyer la vitre avec papier journal humide + cendre froide (technique granny — pas de produits chimiques) ou produit vitrocéramique ; (5) vérifier visuellement les joints et le tirage. <strong>Ne jamais</strong> aspirer avec un aspirateur classique (risque incendie + filtre détruit) ni mettre les cendres dans une poubelle plastique.",
  },
  {
    question: 'Quelle quantité de cendres par an ?',
    answer:
      "Pour 5 tonnes de granulés brûlés par an (consommation typique maison 100 m²) : 200-400 g de cendres par semaine en saison de chauffe = 5-10 kg de cendres total/an. Les cendres de granulés bois sont valorisables au compost (max 5 kg/m²/an au jardin) ou comme amendement basique pour terre acide. Si la quantité de cendres dépasse 1 kg/sem, c'est signe de mauvais réglage du poêle (sur-consommation, encrassement) — contacter votre installateur.",
  },
]

const sources = [
  {
    label: 'Légifrance — Décret n° 2023-741 du 8 août 2023 (ramonage)',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000047952641',
  },
  {
    label: "Code de la construction et de l'habitation — Articles R136-1 à R136-10",
    url: 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074096/LEGISCTA000041565195',
  },
  {
    label: 'ADEME — Bien entretenir son poêle à granulés',
    url: 'https://www.ademe.fr',
  },
  {
    label: 'Propellet — Syndicat français des granulés bois',
    url: 'https://www.propellet.fr',
  },
  {
    label: "Qualit'EnR — Mention RGE Qualibois Air",
    url: 'https://www.qualit-enr.org',
  },
  {
    label: 'Flamme Verte — Label fabricants équipements bois',
    url: 'https://www.flammeverte.org',
  },
  {
    label: 'Service-Public.fr — Ramonage des conduits',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F31894',
  },
]

const relatedPages = [
  {
    label: 'Poêle à granulés 2026 — prix & aides',
    href: '/renovation-energetique/travaux/chauffage/poele-granules',
    description: 'Pivot 48K vol KD 12, prix posé 4-8K €',
  },
  {
    label: 'Ramonage cheminée 2026 — Décret 2023-741',
    href: '/renovation-energetique/travaux/chauffage/ramonage',
    description: 'Conduits fumée 80-150 €, 2×/an dont 1 en saison',
  },
  {
    label: 'Entretien chaudière gaz 2026',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-condensation/entretien',
    description: '100-180 € HT, obligation Décret 2009-649',
  },
  {
    label: 'Tubage cheminée pour poêle',
    href: '/renovation-energetique/travaux/chauffage/tubage-cheminee',
    description: '50-150 €/ml inox, NF DTU 24.1, classes T-P-W',
  },
  {
    label: 'Hub Chauffage 2026',
    href: '/renovation-energetique/travaux/chauffage',
    description: '4 familles + comparatif prix',
  },
  {
    label: 'Label RGE Qualibois',
    href: '/rge/labels/qualibois',
    description: 'Mention Air (poêles) + Module Chaudières',
  },
  {
    label: 'Trouver un chauffagiste Qualibois',
    href: '/services/chauffagiste',
    description: 'Annuaire RGE biomasse vérifié',
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
    section: 'Chauffage — Entretien poêle à granulés',
    keywords: [
      'entretien poele a granule',
      'tarif entretien poêle à granulés',
      'entretien poele granule prix',
      'ramonage poele granule',
      'contrat entretien poele granule',
      'nettoyer poele a granule',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Chauffage', url: '/renovation-energetique/travaux/chauffage' },
    {
      name: 'Poêle à granulés',
      url: '/renovation-energetique/travaux/chauffage/poele-granules',
    },
    { name: 'Entretien', url: PAGE_PATH },
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
              {
                label: 'Poêle à granulés',
                href: '/renovation-energetique/travaux/chauffage/poele-granules',
              },
              { label: 'Entretien' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Flame className="w-3.5 h-3.5" aria-hidden />
              Ramonage obligatoire — Décret 2023-741
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Entretien poêle à granulés 2026 : prix et fréquence
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              L&apos;<strong>entretien d&apos;un poêle à granulés</strong> se décline en 3 niveaux :
              nettoyage hebdomadaire utilisateur (gratuit), ramonage du conduit (80-150 € HT,{' '}
              <strong>2 fois/an</strong> dont 1 en saison de chauffe — Décret 2023-741) et entretien
              annuel pro de l&apos;appareil (<strong>150-220 € HT</strong>). Total annuel :{' '}
              <strong>310-520 € HT</strong>. Voici tout pour bien entretenir : 12 points contrôlés,
              4 arnaques à éviter et comment choisir un pro <strong>Qualibois</strong>.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="niveaux">Les 4 niveaux d&apos;entretien</h2>
            <div className="not-prose grid gap-3 my-6">
              {NIVEAUX_ENTRETIEN.map((n) => (
                <div key={n.niveau} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                      {n.niveau}
                    </h3>
                    <span className="text-sm font-bold text-primary-700 whitespace-nowrap">
                      {n.cout}
                    </span>
                  </div>
                  <p className="text-xs text-amber-700 font-medium m-0 mb-1">
                    Fréquence : {n.frequence}
                  </p>
                  <p className="text-sm text-sand-700 m-0">{n.detail}</p>
                </div>
              ))}
            </div>

            <div className="not-prose flex items-start gap-3 border border-amber-200 bg-amber-50 rounded-lg p-4 my-6">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">Ramonage ≠ entretien appareil</p>
                <p className="m-0">
                  Beaucoup confondent ces 2 prestations. Le <strong>ramonage</strong> concerne
                  exclusivement le <strong>conduit de fumée</strong> (brossage mécanique,
                  élimination des bistres) — c&apos;est l&apos;obligation légale Décret 2023-741.
                  L&apos;
                  <strong>entretien appareil</strong> concerne le poêle lui-même (brûleur,
                  échangeur, cendrier, joints, bougie) — non obligatoire légalement mais
                  quasi-systématique pour conserver la garantie constructeur. Les 2 sont
                  complémentaires et facturés séparément.
                </p>
              </div>
            </div>

            <h2 id="points-controle">Les 12 points contrôlés par le pro</h2>
            <ol>
              {POINTS_CONTROLE.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>

            <h2 id="arnaques">4 arnaques fréquentes à éviter</h2>
            <div className="not-prose grid gap-3 my-6">
              {ARNAQUES.map((a) => (
                <div key={a.type} className="bg-white border border-amber-200 rounded-xl p-5">
                  <h3 className="font-heading text-base font-semibold text-amber-900 m-0 mb-1">
                    {a.type}
                  </h3>
                  <p className="text-sm text-sand-700 m-0">{a.detail}</p>
                </div>
              ))}
            </div>

            <h2 id="choisir-pro">Choisir un pro Qualibois Air</h2>
            <p>
              Pour la sécurité (intoxication CO, incendie, garantie constructeur), exigez la mention{' '}
              <strong>RGE Qualibois Module Air</strong> (poêles et inserts) ou un{' '}
              <strong>technicien agréé constructeur</strong> (MCZ, Edilkamin, Rika, Stûv, Hase). Le
              constructeur a souvent une mainmise sur la garantie 5 ans : si vous faites intervenir
              un non-agréé, la garantie usine peut être perdue.
            </p>
            <ul>
              <li>
                <Wrench className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Vérifier le certificat Qualibois Air sur{' '}
                <a href="https://www.qualit-enr.org">qualit-enr.org</a> (annuaire public).
              </li>
              <li>
                <ShieldCheck className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Demander attestation d&apos;assurance décennale et SIRET valide.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Comparer 2-3 devis détaillés (prix HT par prestation, durée intervention, périmètre
                des contrôles, conditions du contrat éventuel).
              </li>
              <li>
                <Flame className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Privilégier un pro <strong>indépendant local</strong> ou un installateur
                multi-marques plutôt qu&apos;un contrat énergéticien (souvent moins cher et plus
                disponible).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Conserver TOUTES les factures d&apos;entretien (ramonage + appareil) :{' '}
                <strong>2 ans minimum</strong> exigés par l&apos;assurance habitation.
              </li>
            </ul>

            <div className="not-prose flex items-start gap-3 border border-primary-200 bg-primary-50 rounded-lg p-5 my-8">
              <Calculator className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden />
              <div className="flex-1">
                <p className="font-semibold text-primary-900 m-0 mb-1">
                  Trouver un chauffagiste Qualibois proche de chez vous
                </p>
                <p className="text-sm text-primary-900 m-0 mb-3">
                  Notre annuaire référence 4 171 chauffagistes Qualibois actifs (snapshot DB
                  2026-05-06), répartis sur 81 départements. Devis transparents, prix nets, sans
                  démarchage agressif.
                </p>
                <Link
                  href="/services/chauffagiste"
                  className="inline-flex items-center gap-1.5 bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
                >
                  Annuaire Qualibois <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
              </div>
            </div>
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
              href="/renovation-energetique/travaux/chauffage/poele-granules"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Poêle à granulés
            </Link>
            <Link
              href="/services/chauffagiste"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Chauffagistes Qualibois <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
