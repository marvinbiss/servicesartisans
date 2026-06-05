/**
 * Page : /renovation-energetique/aides/maprimerenov-2026/parcours-accompagne
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-03, country=fr) :
 * - "mon accompagnateur renov"             → 236 vol, KD 14, CPC $1,40 ⭐ EASY WIN
 * - "parcours accompagne maprimerenov"     → 0 direct (longue traîne forte intent)
 * - "renovation d ampleur"                 → longue traîne
 * - "maprimerenov parcours accompagne"     → longue traîne
 * - Famille cumulée pivot : ~400 vol/mois (intent transactionnel élevé)
 *
 * Source : audit Ahrefs API live (cf docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md)
 * Easy win : OUI sur "mon accompagnateur renov" (KD 14, vol 236, CPC élevé $1,40)
 *            Intent professionnel/transactionnel — conversion mise en relation forte
 * Cluster pillar : Rénovation Énergétique → Aides → MaPrimeRénov’ 2026 → Parcours accompagné
 *
 * Anti-cannibalisation :
 *   - Page parente /maprimerenov-2026/ = barèmes + 2 parcours overview
 *   - Cette page = focus Parcours accompagné (audit obligatoire, MAR, gain ≥ 2 classes DPE)
 *   - Sub /montants/ = grille forfaits | Sub /eligibilite/ = checklist conditions
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Award,
  Calculator,
  CheckCircle2,
  Coins,
  ShieldCheck,
  TrendingUp,
  Users,
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

const PAGE_PATH = '/renovation-energetique/aides/maprimerenov-2026/parcours-accompagne'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-04'
const AUTHOR_SLUG = 'claire-dubois'
const AUTHOR_NAME = 'Claire Dubois'

const TITLE = 'MaPrimeRénov Parcours accompagné 2026'
const DESCRIPTION =
  'Parcours accompagné MPR 2026 : jusquà 70 000 € (90 000 € avec bonus), gain ≥ 2 classes DPE, audit obligatoire, Mon Accompagnateur Rénov.'

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
  'Parcours accompagné = rénovation d’ampleur visant gain ≥ 2 classes DPE.',
  'Plafond travaux 70 000 € (90 000 € si sortie passoire + bonus BBC).',
  'Mon Accompagnateur Rénov’ obligatoire : audit + plan + suivi travaux.',
  'Aide jusqu’à 90 % du devis pour ménages très modestes (Bleu) avec bonus passoire.',
  'Audit énergétique préalable obligatoire (500-1 200 € — pris en charge à 100 % pour Bleu).',
  'Cumul possible avec CEE Coup de pouce Rénovation d’ampleur + éco-PTZ.',
]

const ETAPES_PARCOURS = [
  {
    step: 'Premier contact France Rénov’',
    detail:
      'Conseiller France Rénov’ neutre et gratuit (0 808 800 700). Première analyse de votre situation, vérification éligibilité Parcours accompagné, info sur les aides locales cumulables.',
    duree: '1-2 semaines',
  },
  {
    step: 'Choix Mon Accompagnateur Rénov’',
    detail:
      'Liste agréée Anah sur france-renov.gouv.fr (filtre par code postal). Contrat avec votre MAR signé. Coût 200-2 000 € (souvent intégré dans MPR à 100 % pour les Bleu).',
    duree: '2-4 semaines',
  },
  {
    step: 'Audit énergétique',
    detail:
      'Réalisé par un auditeur agréé (souvent le MAR lui-même). Identifie les postes prioritaires, propose 2 scénarios chiffrés (gain 2 classes vs gain 3+ classes), définit l’ordre des travaux.',
    duree: '4-6 semaines',
  },
  {
    step: 'Devis artisans RGE',
    detail:
      'Le MAR vous aide à choisir les artisans (3 devis comparés minimum), vérifie la conformité technique, négocie les prix et les CEE Coup de pouce.',
    duree: '4-8 semaines',
  },
  {
    step: 'Dépôt MaPrimeRénov’ + éco-PTZ',
    detail:
      'Le MAR monte le dossier MPR (devis + audit + scenarios) sur france-renov.gouv.fr. Notification 4-6 semaines. Demande éco-PTZ en parallèle auprès d’une banque agréée.',
    duree: '6-10 semaines',
  },
  {
    step: 'Travaux groupés',
    detail:
      'Coordination des artisans par le MAR. Phasage logique : isolation puis chauffage. Visites de chantier régulières. Réception finale par le MAR avec relevés de performance.',
    duree: '3-9 mois',
  },
  {
    step: 'Nouveau DPE et versement aides',
    detail:
      'Nouveau DPE post-travaux atteste du gain énergétique. Versement MPR sous 4-8 semaines. Les bonus passoire et BBC sont libérés à cette étape.',
    duree: '6-10 semaines',
  },
]

const PROFILS = [
  {
    profil: 'Maison 1985, 110 m², classe G — Bleu (couple modeste)',
    devis: '52 000 € HT',
    travaux: 'ITE + isolation toiture + PAC air-eau + VMC double flux',
    mpr: '38 000 € (80 % + bonus passoire 10 %)',
    cee: '4 500 €',
    ecoptz: '9 500 € (sur 20 ans à 0 %)',
    reste: '0 € à charge immédiate',
    saut: 'G → C (3 classes)',
  },
  {
    profil: 'Maison 1970, 95 m², classe F — Jaune (famille modeste)',
    devis: '42 000 € HT',
    travaux: 'ITI + isolation combles + PAC air-eau',
    mpr: '25 200 € (60 % + bonus passoire 10 %)',
    cee: '3 800 €',
    ecoptz: '13 000 €',
    reste: '0 € à charge immédiate',
    saut: 'F → D (2 classes)',
  },
  {
    profil: 'Maison 2000, 130 m², classe D — Violet (intermédiaire)',
    devis: '38 000 € HT',
    travaux: 'Isolation toiture + PAC géothermique + VMC double flux',
    mpr: '17 100 € (45 %)',
    cee: '5 000 €',
    ecoptz: '15 900 €',
    reste: '0 € à charge immédiate',
    saut: 'D → B (2 classes, bonus BBC débloqué)',
  },
]

const ROLE_MAR = [
  {
    titre: 'Avant travaux',
    items: [
      'Évaluation des besoins et conseil neutre sur la stratégie',
      'Audit énergétique avec scénarios chiffrés',
      'Aide à la sélection d’artisans RGE compétents',
      'Vérification technique des devis (performance, prix marché)',
      'Montage du dossier MPR + recherche d’aides locales cumulables',
    ],
  },
  {
    titre: 'Pendant travaux',
    items: [
      'Coordination du planning des artisans',
      'Visites de chantier régulières (minimum 2)',
      'Vérification de la conformité technique en cours de chantier',
      'Médiation en cas de litige avec un artisan',
      'Suivi du calendrier et des paiements',
    ],
  },
  {
    titre: 'Après travaux',
    items: [
      'Réception finale avec relevés de performance',
      'Nouveau DPE pour libérer les bonus (passoire, BBC)',
      'Constitution du dossier de versement MPR',
      'Conseil sur les usages (chauffage, ventilation) pour optimiser les économies',
    ],
  },
]

const faqs = [
  {
    question: 'Qu’est-ce que MaPrimeRénov’ Parcours accompagné en 2026 ?',
    answer:
      'Le Parcours accompagné est le dispositif MaPrimeRénov’ dédié aux rénovations d’ampleur visant un gain ≥ 2 classes DPE (par exemple G → E ou F → D). Il finance jusqu’à 70 000 € de travaux (90 000 € si sortie passoire avec bonus BBC), couvrant jusqu’à 90 % du devis pour les ménages très modestes (Bleu). L’accompagnement par un Mon Accompagnateur Rénov’ et un audit énergétique préalable sont obligatoires.',
  },
  {
    question: 'Qu’est-ce que Mon Accompagnateur Rénov’ (MAR) ?',
    answer:
      'Mon Accompagnateur Rénov’ est un professionnel agréé par l’État pour accompagner les ménages dans leur projet de rénovation d’ampleur. Il est neutre (pas vendeur de matériaux ni installateur), réalise ou supervise l’audit énergétique, aide à choisir les artisans RGE, monte le dossier MPR, coordonne le chantier et certifie la performance finale. Coût 200-2 000 € (intégré dans MPR à 100 % pour les Bleu).',
  },
  {
    question: 'Le MAR est-il obligatoire pour tous les projets de rénovation ?',
    answer:
      'Non. Mon Accompagnateur Rénov’ est obligatoire uniquement pour le Parcours accompagné MaPrimeRénov’ (rénovation d’ampleur, gain ≥ 2 classes DPE, montant MPR > 5 000 €). Pour le Parcours par geste (1 ou 2 travaux ciblés), aucun MAR n’est requis. Les rénovations légères (changement chauffage seul, isolation un poste) restent en parcours classique.',
  },
  {
    question: 'Combien coûte Mon Accompagnateur Rénov’ ?',
    answer:
      '200 à 2 000 € HT selon la complexité du projet et le nombre d’interventions. MaPrimeRénov’ rembourse cette prestation à 100 % pour les ménages très modestes (Bleu), 80 % pour les modestes (Jaune), 50 % pour les intermédiaires (Violet), 30 % pour les supérieurs (Rose). Le coût net pour un Bleu est donc de 0 €. Devis détaillé et signé en début d’accompagnement.',
  },
  {
    question: 'Quel est le plafond MaPrimeRénov’ Parcours accompagné en 2026 ?',
    answer:
      'Le plafond travaux pris en compte est 70 000 €, porté à 90 000 € si le projet déclenche le bonus sortie passoire ET le bonus BBC. Le pourcentage de prise en charge dépend de la catégorie de revenus : 80 % Bleu (90 % avec bonus), 60 % Jaune (70 % avec bonus), 45 % Violet (55 %), 30 % Rose (40 %). Plafond absolu : 80 100 € de prime pour Bleu sortie passoire BBC.',
  },
  {
    question: 'Quelle différence avec l’ancien Habiter Mieux Sérénité ?',
    answer:
      'Habiter Mieux Sérénité a fusionné dans MaPrimeRénov’ Parcours accompagné en 2024. Principaux changements : (1) plafonds plus élevés (70 000 € vs 50 000 €), (2) Mon Accompagnateur Rénov’ obligatoire (avant : facultatif), (3) audit énergétique systématique (avant : recommandé), (4) bonus sortie passoire et BBC plus généreux, (5) ouverture aux Violet et Rose (avant : Bleu et Jaune uniquement).',
  },
  {
    question: 'Combien de temps dure un projet Parcours accompagné ?',
    answer:
      'En moyenne 9 à 18 mois entre le premier contact France Rénov’ et le versement final de la prime. Phase administrative (audit + dossier MPR + devis) : 3-5 mois. Phase travaux : 3-9 mois selon ampleur. Versement aides après facture : 2-4 mois. Une avance jusqu’à 70 % de la prime est versée aux Bleu avant travaux, ce qui réduit l’avance de trésorerie nécessaire.',
  },
  {
    question: 'Comment trouver un Mon Accompagnateur Rénov’ près de chez moi ?',
    answer:
      'Annuaire officiel sur france-renov.gouv.fr (filtre par code postal). Plus de 1 500 MAR agréés en France en 2026 : entreprises (Soliha, espaces conseil habitat), bureaux d’études, architectes, agences locales de l’énergie. Délai pour obtenir un rendez-vous : 2-6 semaines selon la zone. Conseil : prendre 2-3 contacts pour comparer les approches et les coûts.',
  },
]

const sources = [
  {
    label: 'France Rénov’ — Parcours accompagné',
    url: 'https://france-renov.gouv.fr/aides/maprimerenov-parcours-accompagne',
  },
  {
    label: 'Anah — MaPrimeRénov’ Sérénité (devenu Parcours accompagné)',
    url: 'https://www.anah.gouv.fr',
  },
  {
    label: 'France Rénov’ — Annuaire MAR',
    url: 'https://france-renov.gouv.fr/annuaire-accompagnateur-renov',
  },
  {
    label: 'Service-Public.fr — MPR Parcours accompagné',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F35083',
  },
  { label: 'Légifrance — Décret 2023-444 MAR', url: 'https://www.legifrance.gouv.fr' },
]

const relatedPages = [
  {
    label: 'MaPrimeRénov’ 2026 (hub)',
    href: '/renovation-energetique/aides/maprimerenov-2026',
    description: 'Barèmes revenus + parcours + démarche',
  },
  {
    label: 'MaPrimeRénov’ : montants par travaux',
    href: '/renovation-energetique/aides/maprimerenov-2026/montants',
    description: 'Grille forfaits 2026 PAC, isolation…',
  },
  {
    label: 'MaPrimeRénov’ : éligibilité',
    href: '/renovation-energetique/aides/maprimerenov-2026/eligibilite',
    description: 'Conditions logement, revenus, travaux',
  },
  {
    label: 'Passoire thermique : sortir de la classe F/G',
    href: '/renovation-energetique/passoires-thermiques',
    description: 'Calendrier loi + aides cumulables',
  },
  {
    label: 'Audit énergétique : prix et obligations',
    href: '/renovation-energetique/diagnostic/audit-energetique',
    description: 'Audit obligatoire vente F/G + Parcours',
  },
  {
    label: 'Trouver un artisan RGE',
    href: '/rge/renovation-energetique',
    description: 'Annuaire vérifié quotidiennement',
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
    section: 'Parcours accompagné MaPrimeRénov’',
    keywords: [
      'mon accompagnateur renov',
      'maprimerenov parcours accompagne',
      'renovation d ampleur',
      'maprimerenov serenite',
      'audit energetique maprimerenov',
      'mar accompagnateur renov',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Aides', url: '/renovation-energetique/aides' },
    { name: 'MaPrimeRénov’ 2026', url: '/renovation-energetique/aides/maprimerenov-2026' },
    { name: 'Parcours accompagné', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'MaPrimeRénov’ Parcours accompagné 2026',
    description:
      'Dispositif MaPrimeRénov’ dédié aux rénovations énergétiques d’ampleur (gain ≥ 2 classes DPE). Plafond 70 000 € (90 000 € si sortie passoire). Mon Accompagnateur Rénov’ obligatoire. Aide jusqu’à 90 % du devis pour ménages très modestes.',
    url: PAGE_URL,
    serviceType: 'Subvention publique rénovation d’ampleur',
    audience: 'Propriétaires occupants et bailleurs souhaitant rénover globalement',
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
              {
                label: 'MaPrimeRénov’ 2026',
                href: '/renovation-energetique/aides/maprimerenov-2026',
              },
              { label: 'Parcours accompagné' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Award className="w-3.5 h-3.5" aria-hidden />
              Mon Accompagnateur Rénov’
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              MaPrimeRénov’ Parcours accompagné 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Le <strong>Parcours accompagné</strong> est le dispositif MaPrimeRénov’ pour les
              rénovations d’ampleur visant un gain énergétique de 2 classes DPE minimum. Il finance
              jusqu’à <strong>70 000 € de travaux</strong> (90 000 € avec bonus passoire et BBC),
              couvrant <strong>jusqu’à 90 %</strong> du devis pour les très modestes.
              L’accompagnement par un <strong>Mon Accompagnateur Rénov’</strong> agréé est
              obligatoire de A à Z.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="conditions">3 conditions pour le Parcours accompagné</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Gain ≥ 2 classes DPE</strong> attesté par audit énergétique préalable et
                nouveau DPE post-travaux.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Travaux groupés</strong> combinant au minimum 2 postes (souvent isolation +
                chauffage + ventilation).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Mon Accompagnateur Rénov’</strong> obligatoire (audit + plan + suivi travaux
                + dossier MPR + DPE final).
              </li>
            </ul>

            <h2 id="etapes">Démarche en 7 étapes</h2>
            <div className="not-prose my-6">
              <ol className="space-y-3 list-none m-0 p-0">
                {ETAPES_PARCOURS.map((s, i) => (
                  <li
                    key={s.step}
                    className="bg-white border border-sand-200 rounded-xl p-4 flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-700 text-white grid place-items-center shrink-0 font-bold">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between gap-2 flex-wrap">
                        <p className="font-semibold text-sand-900 m-0">{s.step}</p>
                        <span className="text-xs text-primary-700 font-semibold whitespace-nowrap">
                          {s.duree}
                        </span>
                      </div>
                      <p className="text-sm text-sand-700 mt-1 mb-0">{s.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <h2 id="role-mar">Le rôle de Mon Accompagnateur Rénov’</h2>
            <div className="not-prose grid gap-4 my-6">
              {ROLE_MAR.map((r) => (
                <div key={r.titre} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-700 grid place-items-center shrink-0">
                      <Users className="w-5 h-5" aria-hidden />
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-sand-900 m-0">
                      {r.titre}
                    </h3>
                  </div>
                  <ul className="text-sm text-sand-700 space-y-1.5 list-disc list-inside m-0">
                    {r.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <h2 id="profils">3 profils de projets chiffrés</h2>
            <div className="not-prose grid gap-3 my-6">
              {PROFILS.map((p) => (
                <div key={p.profil} className="bg-white border border-sand-200 rounded-xl p-5">
                  <p className="font-semibold text-sand-900 m-0 mb-1">{p.profil}</p>
                  <p className="text-sm text-sand-600 italic m-0 mb-3">Travaux : {p.travaux}</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                    <span className="text-sand-600">Devis HT</span>
                    <span className="text-sand-900 font-medium text-right">{p.devis}</span>
                    <span className="text-sand-600">MPR Parcours accompagné</span>
                    <span className="text-primary-700 font-medium text-right">- {p.mpr}</span>
                    <span className="text-sand-600">CEE Coup de pouce</span>
                    <span className="text-primary-700 font-medium text-right">- {p.cee}</span>
                    <span className="text-sand-600">Éco-PTZ (0 %)</span>
                    <span className="text-sand-700 text-right">{p.ecoptz}</span>
                    <span className="text-sand-900 font-bold pt-2 border-t border-sand-200">
                      Reste à charge immédiat
                    </span>
                    <span className="text-sand-900 font-bold pt-2 border-t border-sand-200 text-right">
                      {p.reste}
                    </span>
                    <span className="text-sand-600 italic mt-1">Saut DPE</span>
                    <span className="text-primary-700 font-semibold text-right mt-1">{p.saut}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Estimer votre Parcours accompagné
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Calcul instantané : MPR + CEE + éco-PTZ. Mise en relation gratuite avec un Mon
                    Accompagnateur Rénov’ agréé près de chez vous.
                  </p>
                  <Link
                    href="/simulateur-aides-renovation"
                    className="inline-flex items-center gap-1.5 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                  >
                    Lancer le simulateur <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>

            <h2 id="bonus">Bonus 2026 (cumulables)</h2>
            <ul>
              <li>
                <TrendingUp className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Bonus sortie passoire</strong> : +10 % du % de prise en charge si le projet
                fait sortir de F ou G.
              </li>
              <li>
                <TrendingUp className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Bonus BBC</strong> : +500 à +1 500 € si atteinte classe A ou B post-travaux.
              </li>
              <li>
                <TrendingUp className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>CEE Coup de pouce Rénovation d’ampleur</strong> : 3 000 à 5 000 €
                additionnels selon gain énergétique.
              </li>
            </ul>

            <div className="not-prose flex items-start gap-3 border border-amber-200 bg-amber-50 rounded-lg p-4 my-6">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">Attention démarchage</p>
                <p className="m-0">
                  Mon Accompagnateur Rénov’ ne fait JAMAIS de démarchage téléphonique. Tout MAR qui
                  vous appelle sans démarche de votre part est suspect. Annuaire officiel sur{' '}
                  <a
                    href="https://france-renov.gouv.fr/annuaire-accompagnateur-renov"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    france-renov.gouv.fr
                  </a>
                  . Méfiance également envers les sites en .com qui imitent le site officiel.
                </p>
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
              href="/renovation-energetique/aides/maprimerenov-2026"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← MaPrimeRénov’ 2026
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
