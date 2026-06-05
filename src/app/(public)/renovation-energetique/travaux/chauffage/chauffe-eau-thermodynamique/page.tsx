/**
 * Page : /renovation-energetique/travaux/chauffage/chauffe-eau-thermodynamique
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-03, country=fr) :
 * - "chauffe eau thermodynamique"      → 28 512 vol, KD 3, CPC $0,15, clicks 31 347 ⭐⭐⭐⭐ MEGA JACKPOT
 * - "chauffe-eau thermodynamique"      → variant orthographique
 * - "cet thermodynamique"              → longue traîne
 * - "ballon thermodynamique"           → longue traîne
 * - "prix chauffe eau thermodynamique" → longue traîne KD bas
 * - Famille cumulée pivot : ~32 000 vol/mois (KD 3 = mega easy win)
 *
 * Source : audit Ahrefs API live (cf docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md)
 * Easy win : OUI MEGA (KD 3 sur KW pivot 28 512 vol — top du top de Vague B)
 *            Concurrence Atlantic, Thermor, Ariston (sites constructeurs) + Engie/EDF
 *            Atout SA : focus prix marché + aides MPR/CEE + retour expérience installation
 * Cluster pillar : Rénovation Énergétique → Travaux → Chauffage → CET
 *
 * Anti-cannibalisation :
 *   - Hub /chauffage = panorama 4 solutions
 *   - Cette page = focus CET (intent transactionnel pur)
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Award,
  Calculator,
  CheckCircle2,
  Coins,
  Droplets,
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

const PAGE_PATH = '/renovation-energetique/travaux/chauffage/chauffe-eau-thermodynamique'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-04'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Chauffe-eau thermo 2026 : COP, MPR, ROI'
const DESCRIPTION =
  'Chauffe-eau thermodynamique 2026 : prix posé 2 500-4 500 €, COP 3-3,5, MPR jusquà 1 200 €. Ballon 200-300 L, ROI 4-6 ans.'

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
  'Chauffe-eau thermodynamique (CET) = ballon ECS chauffé par PAC sur air ambiant ou extrait.',
  'COP saisonnier 3-3,5 : produit 3 kWh ECS pour 1 kWh élec consommé.',
  'Prix posé 2026 : 2 500-4 500 € (200-300 L).',
  'Économie 60-75 % vs ballon électrique direct (300-500 €/an pour famille de 4).',
  'MaPrimeRénov’ Bleu : 1 200 €. CEE : 100-300 € selon dossier.',
  'ROI 4-6 ans. Installation par chauffagiste certifié RGE QualiPAC.',
]

const TYPES_CET = [
  {
    type: 'CET sur air ambiant',
    icon: Droplets,
    prix: '2 500-3 800 € posé',
    detail:
      'Pompe à chaleur intégrée puise calories dans l’air du local (cave, garage 20 m³+). Le plus courant. Volume local 20 m³ minimum (pour ne pas geler).',
    cop: '3,0-3,5',
  },
  {
    type: 'CET sur air extrait (VMC)',
    icon: TrendingUp,
    prix: '3 000-4 200 € posé',
    detail:
      'Couplé à la VMC : récupère les calories de l’air extrait des pièces humides. Compatible logements neufs ou rénovés avec VMC simple flux hygro.',
    cop: '3,3-3,8',
  },
  {
    type: 'CET sur air extérieur (split)',
    icon: ShieldCheck,
    prix: '3 500-4 500 € posé',
    detail:
      'Unité extérieure (comme PAC air-eau) + ballon intérieur. Performant en zones tempérées, baisse en très grand froid.',
    cop: '2,8-3,2',
  },
]

const PRIX_PAR_VOLUME = [
  { volume: '150 L (1-2 personnes)', prix: '2 200-3 200 €', detail: 'T2/T3, couple sans enfant' },
  {
    volume: '200 L (2-3 personnes)',
    prix: '2 500-3 800 €',
    detail: 'T3/T4, couple + 1 enfant. Le plus courant.',
  },
  {
    volume: '250 L (3-4 personnes)',
    prix: '2 800-4 200 €',
    detail: 'T4/T5, famille 3-4 personnes',
  },
  {
    volume: '300 L (4-5 personnes)',
    prix: '3 200-4 500 €',
    detail: 'Maison familiale 4-5 personnes',
  },
]

const COMPARATIF_VS_AUTRES = [
  {
    critere: 'Prix posé moyen (200 L)',
    cet: '3 200 €',
    ballon_elec: '600-900 €',
    solaire: '4 500-7 000 €',
  },
  {
    critere: 'COP / Rendement',
    cet: 'COP 3,0-3,5',
    ballon_elec: 'Rendement ~95 %',
    solaire: 'Couverture 50-70 % besoins',
  },
  {
    critere: 'Conso annuelle (4 personnes)',
    cet: '500-800 kWh',
    ballon_elec: '2 500-3 500 kWh',
    solaire: '600-1 200 kWh appoint',
  },
  {
    critere: 'Coût annuel ECS (élec 0,22 €/kWh)',
    cet: '110-180 €',
    ballon_elec: '550-770 €',
    solaire: '130-260 € appoint',
  },
  { critere: 'MaPrimeRénov’ Bleu', cet: '1 200 €', ballon_elec: '0 €', solaire: '4 000 €' },
  { critere: 'CEE', cet: '100-300 €', ballon_elec: '0 €', solaire: '500-1 000 €' },
  { critere: 'Durée de vie', cet: '15-20 ans', ballon_elec: '8-15 ans', solaire: '25+ ans' },
  { critere: 'ROI vs ballon élec', cet: '4-6 ans', ballon_elec: 'N/A', solaire: '8-12 ans' },
]

const ETAPES_INSTALL = [
  {
    step: 'Évaluation logement',
    detail:
      'Vérifier volume local 20 m³+ (CET sur air ambiant) ou existence VMC (CET sur air extrait). Pas de cave/garage = privilégier modèle split (unité extérieure).',
  },
  {
    step: 'Choix du volume',
    detail:
      'Règle : 50 L par personne adulte + 25 L par enfant. Foyer 4 personnes = 200-250 L. Surdimensionner légèrement pour anticiper invités/croissance famille.',
  },
  {
    step: 'Devis chauffagiste RGE QualiPAC',
    detail:
      'Mention RGE QualiPAC obligatoire pour MPR/CEE/TVA 5,5 %. Devis détaillé : marque, modèle, COP, volume, raccordements eau + élec.',
  },
  {
    step: 'Dépôt MPR + CEE avant signature',
    detail:
      'Demande MaPrimeRénov’ via france-renov.gouv.fr AVANT signature devis (sinon refus). Acceptation offre CEE en parallèle.',
  },
  {
    step: 'Installation (0,5-1 jour)',
    detail:
      'Dépose ancien ballon + pose nouveau CET + raccordements. Test de mise en service. Programme antilegionellose (montée 60°C hebdomadaire).',
  },
  {
    step: 'Versement aides (4-8 semaines)',
    detail:
      'MPR versée après facture acquittée + photo équipement. CEE selon mode (déduction devis ou chèque énergéticien).',
  },
]

const faqs = [
  {
    question: 'Combien coûte un chauffe-eau thermodynamique en 2026 ?',
    answer:
      'Prix posé clé en main 2026 : 2 200-3 200 € pour un 150 L (1-2 personnes), 2 500-3 800 € pour un 200 L (2-3 personnes), 2 800-4 200 € pour un 250 L (3-4 personnes), 3 200-4 500 € pour un 300 L (4-5 personnes). Le matériel représente 60-70 % du devis (1 500-3 000 € pour une bonne marque type Atlantic Calypso, Thermor Aeromax, Ariston Lydos). Installation et raccordements : 30-40 %.',
  },
  {
    question: 'Quelles aides en 2026 pour un chauffe-eau thermodynamique ?',
    answer:
      'MaPrimeRénov’ Bleu : 1 200 €. Jaune : 800 €. Violet : 400 €. Rose : 0 €. CEE : 100-300 € selon offre énergéticien. TVA 5,5 % automatique avec QualiPAC. Cumul typique pour un Bleu : MPR 1 200 € + CEE 200 € = 1 400 € sur un devis 3 200 €, reste à charge 1 800 €. Économie facture ECS 400-600 €/an = ROI 3-4 ans après aides.',
  },
  {
    question: 'COP réel d’un chauffe-eau thermodynamique en hiver ?',
    answer:
      'COP nominal en laboratoire : 3,5-4. COP saisonnier réel (toute l’année) : 2,8-3,5 selon installation. CET sur air ambiant cave non chauffée : 2,8-3,2 (l’air se refroidit en hiver, baisse perfo). CET sur air extrait VMC : 3,3-3,8 (air constant 19-21°C). CET sur air extérieur split : 2,5-3 (chute en froid extrême). Choisir un modèle avec SCOP ≥ 3,3 selon norme EN 16147.',
  },
  {
    question: 'Combien d’économies vs un ballon électrique ?',
    answer:
      'Famille de 4 personnes consomme 2 500-3 500 kWh/an d’ECS avec un ballon électrique direct, soit 550-770 € au tarif EDF Bleu 2026 (~0,22 €/kWh). Avec un CET (COP 3) : 800-1 200 kWh/an consommés, soit 175-265 €/an. Économie nette : 350-500 €/an, soit 60-75 % de réduction. Sur 15 ans de durée de vie : 5 250-7 500 € d’économies cumulées (à comparer aux 2 500 € de surcoût initial vs ballon élec).',
  },
  {
    question: 'Faut-il une cave ou un garage pour un CET ?',
    answer:
      'Pas obligatoire mais recommandé. Conditions techniques : (1) CET sur air ambiant nécessite un local 20 m³ minimum non chauffé (cave, garage, buanderie ventilée), (2) CET sur air extrait nécessite une VMC existante (raccord par gaine), (3) CET split (unité extérieure) = solution si pas de cave/garage. Évitez l’installation dans une pièce de vie chauffée (refroidissement parasite, bruit 35-45 dB).',
  },
  {
    question: 'Quelle marque de chauffe-eau thermodynamique choisir ?',
    answer:
      'Marques fiables 2026 : Atlantic (Calypso, Egeo) — leader français, fiabilité long terme. Thermor (Aéromax) — très bonne réputation SAV. Ariston (Lydos Hybrid, Nuos Plus) — bon rapport qualité/prix. De Dietrich (Kaliko) — haut de gamme. Vaillant (aroSTOR) — efficacité supérieure. Stiebel Eltron (WWK) — pionnier allemand. Éviter les marques inconnues (durée vie 5-8 ans seulement). Garantie cuve 5-7 ans, compresseur 2-5 ans.',
  },
  {
    question: 'Quel artisan installer un chauffe-eau thermodynamique ?',
    answer:
      'Plombier-chauffagiste avec mention RGE <strong>QualiPAC</strong> (obligatoire pour MPR/CEE/TVA 5,5 %). Vérifier la validité dans notre annuaire QualiPAC vérifié quotidiennement. Le devis doit indiquer : marque, modèle, volume, COP, type (air ambiant/extrait/split), raccordements eau + élec, dépose ancien ballon, mise en service avec test programme antilegionellose. 2-3 devis comparés recommandés.',
  },
  {
    question: 'Combien de temps pour installer un CET ?',
    answer:
      '0,5 à 1 journée d’installation typique. Étapes : (1) dépose et évacuation ancien ballon (1-2h), (2) raccordement eau froide + eau chaude + groupe sécurité (1-2h), (3) raccordement électrique 16A dédié (30 min), (4) mise en eau + tests (30 min), (5) programmation + explication utilisation (30 min). Si conduit gaine VMC à créer (CET sur air extrait) : prévoir 1 journée supplémentaire.',
  },
]

const sources = [
  { label: 'France Rénov’ — CET', url: 'https://france-renov.gouv.fr' },
  { label: 'Anah — MPR chauffe-eau thermodynamique', url: 'https://www.anah.gouv.fr' },
  { label: 'ADEME — Eau chaude sanitaire', url: 'https://www.ademe.fr' },
  { label: 'AFPAC — Chauffe-eau PAC', url: 'https://www.afpac.org' },
  { label: 'Norme EN 16147 — Performance CET', url: 'https://www.afnor.org' },
]

const relatedPages = [
  {
    label: 'Ballon thermodynamique 2026 — focus produit',
    href: '/renovation-energetique/travaux/ballon-thermodynamique',
    description: 'Capacités 150-300L, classes A à A+++, 6 marques',
  },
  {
    label: 'Hub Chauffage 2026',
    href: '/renovation-energetique/travaux/chauffage',
    description: 'PAC, granulés, condensation, CET',
  },
  {
    label: 'Hub pompe à chaleur',
    href: '/renovation-energetique/travaux/pompe-a-chaleur',
    description: 'Air-eau pour chauffage central + ECS',
  },
  {
    label: 'Solaire thermique combiné',
    href: '/renovation-energetique/travaux/chauffage',
    description: 'Alternative ECS + chauffage',
  },
  {
    label: 'Label QualiPAC',
    href: '/rge/labels/qualipac',
    description: 'Mention RGE installation CET',
  },
  {
    label: 'CEE Coup de pouce',
    href: '/renovation-energetique/aides/prime-coup-de-pouce',
    description: 'Bonification 100-300 € sur CET',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'MPR + CEE + éco-PTZ',
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
    section: 'Chauffe-eau thermodynamique',
    keywords: [
      'chauffe eau thermodynamique',
      'chauffe-eau thermodynamique',
      'cet thermodynamique',
      'ballon thermodynamique',
      'prix chauffe eau thermodynamique',
      'cet maprimerenov',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Chauffage', url: '/renovation-energetique/travaux/chauffage' },
    { name: 'Chauffe-eau thermodynamique', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'Chauffe-eau thermodynamique : MaPrimeRénov’ 2026',
    description:
      'Chauffe-eau thermodynamique éligible MaPrimeRénov’ jusqu’à 1 200 € (Bleu) + CEE Coup de pouce. Installation par artisan QualiPAC RGE obligatoire.',
    url: PAGE_URL,
    serviceType: 'Subvention publique ECS PAC',
    audience: 'Propriétaires occupants et bailleurs',
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
              { label: 'Travaux', href: '/renovation-energetique/travaux' },
              { label: 'Chauffage', href: '/renovation-energetique/travaux/chauffage' },
              { label: 'Chauffe-eau thermodynamique' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Award className="w-3.5 h-3.5" aria-hidden />
              Économie 60-75 % vs ballon élec
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Chauffe-eau thermodynamique 2026 : prix et aides
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Le <strong>chauffe-eau thermodynamique (CET)</strong> chauffe l’eau sanitaire grâce à
              une pompe à chaleur intégrée. Avec un <strong>COP saisonnier 3 à 3,5</strong>, il
              divise la facture ECS par 3 ou 4 par rapport à un ballon électrique direct (économie
              350-500 €/an pour une famille de 4). Prix posé 2026 : <strong>2 500 à 4 500 €</strong>
              , MaPrimeRénov’ <strong>jusqu’à 1 200 €</strong> + CEE. ROI typique : 4-6 ans.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="types">Les 3 types de chauffe-eau thermodynamique</h2>
            <div className="not-prose grid gap-3 my-6">
              {TYPES_CET.map((t) => {
                const Icon = t.icon
                return (
                  <div key={t.type} className="bg-white border border-sand-200 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-700 grid place-items-center shrink-0">
                        <Icon className="w-5 h-5" aria-hidden />
                      </div>
                      <h3 className="font-heading text-base font-semibold text-sand-900 m-0 flex-1">
                        {t.type}
                      </h3>
                      <span className="text-sm font-bold text-primary-700 whitespace-nowrap">
                        {t.prix}
                      </span>
                    </div>
                    <p className="text-xs text-sand-500 m-0 mb-2">COP saisonnier : {t.cop}</p>
                    <p className="text-sm text-sand-700 m-0">{t.detail}</p>
                  </div>
                )
              })}
            </div>

            <h2 id="prix-volumes">Prix posé selon volume du ballon</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Volume</th>
                    <th className="p-3 border-b border-sand-200">Prix posé 2026</th>
                    <th className="p-3 border-b border-sand-200">Adapté pour</th>
                  </tr>
                </thead>
                <tbody>
                  {PRIX_PAR_VOLUME.map((p) => (
                    <tr key={p.volume} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{p.volume}</td>
                      <td className="p-3 text-primary-700 font-semibold">{p.prix}</td>
                      <td className="p-3 text-sand-600 text-xs">{p.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 id="comparatif">CET vs ballon électrique vs solaire</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Critère</th>
                    <th className="p-3 border-b border-sand-200">CET</th>
                    <th className="p-3 border-b border-sand-200">Ballon électrique</th>
                    <th className="p-3 border-b border-sand-200">Solaire ECS</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARATIF_VS_AUTRES.map((c) => (
                    <tr key={c.critere} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{c.critere}</td>
                      <td className="p-3 text-primary-700 font-semibold">{c.cet}</td>
                      <td className="p-3 text-amber-700">{c.ballon_elec}</td>
                      <td className="p-3">{c.solaire}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 id="exemple">Exemple chiffré famille de 4 personnes</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 my-6">
              <p className="font-semibold text-sand-900 m-0 mb-3">
                CET 250 L (devis 3 500 €) — couple modeste (Jaune)
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                <span className="text-sand-600">Devis HT</span>
                <span className="text-sand-900 font-medium text-right">3 500 €</span>
                <span className="text-sand-600">MaPrimeRénov’ Jaune</span>
                <span className="text-primary-700 font-medium text-right">- 800 €</span>
                <span className="text-sand-600">CEE</span>
                <span className="text-primary-700 font-medium text-right">- 200 €</span>
                <span className="text-sand-600">TVA 5,5 % (vs 20 %) ≈</span>
                <span className="text-primary-700 font-medium text-right">- 200 €</span>
                <span className="text-sand-900 font-bold pt-2 border-t border-sand-200">
                  Reste à charge
                </span>
                <span className="text-sand-900 font-bold pt-2 border-t border-sand-200 text-right">
                  2 300 €
                </span>
                <span className="text-primary-700 font-semibold mt-1">Économie ECS annuelle</span>
                <span className="text-primary-700 font-semibold text-right mt-1">~450 €/an</span>
              </div>
              <p className="text-xs text-sand-500 italic mt-3 mb-0">
                ROI : 5,1 ans. Sur 15 ans (durée de vie typique) : 6 750 € d’économies cumulées vs
                ballon électrique direct, soit 4 450 € de gain net après amortissement.
              </p>
            </div>

            <h2 id="installation">Démarche en 6 étapes</h2>
            <div className="not-prose my-6">
              <ol className="space-y-3 list-none m-0 p-0">
                {ETAPES_INSTALL.map((s, i) => (
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

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Estimer votre chauffe-eau thermodynamique
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Calcul instantané MPR + CEE + TVA 5,5 % selon revenus, foyer et volume ECS. Mise
                    en relation artisan QualiPAC vérifié.
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

            <h2 id="entretien">Entretien et durée de vie</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Anode magnésium</strong> à vérifier tous les 2 ans (changer si usée : 30-60
                €).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Détartrage cuve</strong> tous les 5-7 ans selon dureté de l’eau (80-150 €).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Programme antilegionellose</strong> automatique (montée 60°C hebdomadaire) —
                vérifier activation à l’installation.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Durée de vie</strong> : 15-20 ans pour la cuve, 12-15 ans pour le
                compresseur.
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
              href="/renovation-energetique/travaux/chauffage"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Chauffage
            </Link>
            <Link
              href="/rge/labels/qualipac"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              QualiPAC <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
