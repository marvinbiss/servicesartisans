/**
 * Page : /renovation-energetique/travaux/menuiseries
 *
 * Page finale 40/40 audit STRATEGIE-RENOVATION-ENERGETIQUE.md (livrée 2026-05-04).
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-04, country=fr) :
 * - "menuiserie exterieure"      → 200 vol, KD 0, CPC $1,30 ⭐⭐⭐ EASY WIN
 * - "porte fenetre prix"         → 200 vol, KD 2, CPC $0,80 ⭐⭐⭐
 * - "remplacement menuiserie"    → 150 vol, CPC $2,00 ⭐⭐⭐
 * - "menuiserie alu prix"        → 100 vol
 * - "porte entree prix"          → 80 vol, KD 2, CPC $0,70
 * - "menuiserie pvc prix"        → 70 vol, KD 5, CPC $0,60
 * - "menuiserie bois prix"       → 20 vol, KD 0, CPC $0,80
 * - Famille cumulée pivot : ~820 vol/mois (KD moyen 1-2)
 *
 * Source : audit Ahrefs API live (cf docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md)
 * Easy win : OUI (KD 0-5 sur cluster transactionnel rénovation menuiseries)
 * Cluster pillar : Rénovation Énergétique → Travaux → Menuiseries extérieures
 *
 * Anti-cannibalisation :
 *   - /travaux/fenetres-double-vitrage/ = focus fenêtres vitrage uniquement (4 636 vol KD 1)
 *   - Cette page = HUB menuiseries (fenêtres + portes-fenêtres + portes entrée + matériaux PVC/alu/bois)
 *   - /diagnostic/dpe/ = lien fort (menuiseries = 10-15 % déperditions thermiques)
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  Calculator,
  CheckCircle2,
  DoorOpen,
  Layers,
  Ruler,
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
import { getBreadcrumbSchema, getFAQSchema, getGovernmentServiceSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/menuiseries'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-04'
const AUTHOR_SLUG = 'marc-lefebvre'
const AUTHOR_NAME = 'Marc Lefebvre'

const TITLE = 'Menuiseries 2026 : prix PVC, alu, bois'
const DESCRIPTION =
  'Menuiseries extérieures 2026 : prix par matériau (PVC 350-700 €/u, alu 600-1 200 €, bois 800-1 800 €). Aides MPR + CEE. Comparatif fenêtres.'

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
  'Menuiseries = fenêtres + portes-fenêtres + portes d’entrée. 10-15 % des déperditions thermiques d’une maison non isolée.',
  'PVC : 350-700 €/unité posée. Le matériau le plus posé en France (60 % du marché). Bon rapport qualité-prix.',
  'Aluminium : 600-1 200 €/unité. Design moderne, fines, durables, mais isolation thermique inférieure au PVC.',
  'Bois : 800-1 800 €/unité. Isolation thermique excellente, esthétique chaleureuse, entretien régulier.',
  'Aides 2026 : MaPrimeRénov’ jusqu’à 100 €/équipement (très modeste) + CEE Coup de pouce + TVA 5,5 %.',
  'ROI : 12-20 ans en remplacement seul, 5-10 ans dans le cadre d’une rénovation globale.',
]

const MATERIAUX = [
  {
    materiau: 'PVC',
    prix: '350-700 €/u',
    isolation: 'Excellente (Uw 1.0-1.4 W/m².K)',
    durabilite: '25-40 ans',
    avantages: 'Prix bas, sans entretien, étanche, recyclable',
    inconvenients: 'Esthétique standardisée, moins fin que l’alu, jaunit légèrement après 15 ans',
  },
  {
    materiau: 'Aluminium',
    prix: '600-1 200 €/u',
    isolation: 'Bonne avec rupture pont thermique (Uw 1.2-1.6)',
    durabilite: '40-60 ans',
    avantages: 'Esthétique moderne, profilés fins (max lumière), sans entretien',
    inconvenients:
      'Prix élevé, isolation thermique inférieure au PVC, conductivité thermique forte',
  },
  {
    materiau: 'Bois',
    prix: '800-1 800 €/u',
    isolation: 'Excellente naturelle (Uw 1.0-1.4)',
    durabilite: '40-80 ans (avec entretien)',
    avantages: 'Esthétique chaleureuse, isolation thermique et acoustique top, biosourcé',
    inconvenients: 'Entretien tous les 5-10 ans (lasure), prix élevé, sensible humidité si négligé',
  },
  {
    materiau: 'Mixte bois/alu',
    prix: '1 200-2 500 €/u',
    isolation: 'Excellente (Uw 0.9-1.2)',
    durabilite: '50-70 ans',
    avantages: 'Bois intérieur (chaleureux) + alu extérieur (sans entretien), top performance',
    inconvenients: 'Prix très élevé, principalement haut de gamme',
  },
]

const TYPES = [
  {
    icon: Layers,
    type: 'Fenêtre standard 1 vantail',
    detail:
      'Dim. 60-100 cm × 100-130 cm. Prix posé : 350-700 € (PVC), 600-1 100 € (alu), 800-1 500 € (bois).',
  },
  {
    icon: Layers,
    type: 'Fenêtre 2 vantaux',
    detail:
      'Dim. 100-160 cm × 100-130 cm. Prix posé : 500-900 € (PVC), 800-1 400 € (alu), 1 100-1 800 € (bois).',
  },
  {
    icon: DoorOpen,
    type: 'Porte-fenêtre 2 vantaux',
    detail:
      'Dim. 140-200 cm × 200-220 cm. Prix posé : 800-1 500 € (PVC), 1 200-2 200 € (alu), 1 600-2 800 € (bois).',
  },
  {
    icon: DoorOpen,
    type: 'Baie coulissante 2 vantaux',
    detail:
      'Dim. 180-250 cm × 200-220 cm. Prix posé : 1 200-2 500 € (PVC), 1 800-3 500 € (alu), 2 500-4 500 € (bois/mixte).',
  },
  {
    icon: DoorOpen,
    type: 'Porte d’entrée standard',
    detail:
      'Dim. 90 cm × 215 cm. Prix posé : 800-1 800 € (PVC), 1 500-3 500 € (alu), 1 800-5 000 € (bois).',
  },
  {
    icon: Ruler,
    type: 'Volet roulant intégré',
    detail:
      'Supplément 250-450 € par fenêtre (manuel) ou 400-700 € (motorisé). Optimise étanchéité air et déphasage été.',
  },
]

const AIDES = [
  {
    aide: 'MaPrimeRénov’ — Geste menuiserie',
    montant: '40 € (rose) à 100 € (bleu très modeste) / équipement',
    detail:
      'Plafond travaux 1 000 €/équipement. Uniquement pour remplacement de simple vitrage par fenêtre Uw ≤ 1.3 W/m².K. RGE Qualibat 3641 ou QB Menuiseries obligatoire.',
  },
  {
    aide: 'CEE Coup de pouce isolation',
    montant: '15-25 € / équipement',
    detail:
      'Versé directement par le fournisseur d’énergie partenaire. Uniquement pour passoires F/G ou très modestes. Cumul avec MPR.',
  },
  {
    aide: 'TVA réduite 5,5 %',
    montant: 'Économie 14,5 % sur fourniture + pose',
    detail:
      'Pour tout logement de plus de 2 ans. Le matériau doit atteindre Uw ≤ 1.3 (fenêtre) ou Ud ≤ 1.7 (porte).',
  },
  {
    aide: 'Éco-PTZ',
    montant: 'Jusqu’à 7 000 € (geste seul) ou 50 000 € (bouquet)',
    detail: 'Prêt à taux zéro sans condition de revenus. Remboursable sur 15-20 ans.',
  },
  {
    aide: 'Aides régionales et locales',
    montant: '50-300 € selon dispositif',
    detail:
      'Hauts-de-France, Île-de-France, Auvergne-Rhône-Alpes, Bretagne. À vérifier sur france-renov.gouv.fr.',
  },
]

const faqs = [
  {
    question: 'Quel est le prix moyen d’une fenêtre PVC posée en 2026 ?',
    answer:
      'Pour une fenêtre PVC standard 1 vantail (80×120 cm) double vitrage 4/16/4 argon Uw 1.3, comptez 450-650 € pose comprise en 2026. Une fenêtre 2 vantaux (140×130 cm) revient à 600-900 €. Marques principales : Schüco, Veka, Rehau, Atlantem, K•LINE, France Fermetures. Le PVC reste le matériau le plus posé (60 % du marché) grâce à son rapport prix/performance imbattable.',
  },
  {
    question: 'Faut-il choisir le PVC, l’alu ou le bois pour des fenêtres en 2026 ?',
    answer:
      'PVC : meilleur rapport qualité-prix, sans entretien, isolation thermique excellente. Alu : design moderne, profilés fins (max lumière), durable mais isolation moindre (Uw 1.4-1.6 vs 1.0-1.4 PVC). Bois : top isolation thermique et acoustique, esthétique chaleureuse, entretien tous 5-10 ans. Mixte bois/alu : luxe haut de gamme. Pour MaPrimeRénov’, l’essentiel : Uw ≤ 1.3 W/m².K (fenêtre) avec double ou triple vitrage.',
  },
  {
    question: 'Quelles aides pour remplacer ses fenêtres en 2026 ?',
    answer:
      'MaPrimeRénov’ Geste : 40 €/u (rose) à 100 €/u (bleu très modeste), plafond 1 000 €/équipement. CEE Coup de pouce isolation : 15-25 €/u (modestes/très modestes). TVA réduite 5,5 % sur matériel + pose. Éco-PTZ jusqu’à 7 000 € (geste seul). Cumul typique : ménage modeste 5 fenêtres = MPR 350 € + CEE 100 € + TVA = ~700 € d’économie sur 3 500 € de devis.',
  },
  {
    question: 'Combien de temps pour amortir le remplacement de menuiseries ?',
    answer:
      'En remplacement de simple vitrage par fenêtres Uw 1.3, économie chauffage 10-20 % par an soit 150-400 €/an pour une maison 100 m². ROI : 12-20 ans en remplacement seul, 5-10 ans dans le cadre d’une rénovation globale (combinée à isolation + chauffage + VMC). C’est rarement le geste prioritaire pour le ROI seul mais souvent pertinent pour le confort, l’étanchéité air et la valorisation immobilière.',
  },
  {
    question: 'Quelle différence entre double et triple vitrage en 2026 ?',
    answer:
      'Double vitrage 4/16/4 argon : Uw 1.3 W/m².K, prix de référence. Triple vitrage 4/12/4/12/4 : Uw 0.6-0.8, isolation 40 % supérieure mais surcoût 25-40 % et 30 % plus lourd (renforcement bâti requis). Recommandation : double vitrage 4/16/4 argon suffit pour 95 % des projets en France métropolitaine. Triple vitrage justifié uniquement en : zone H1 froid extrême (Massif Central, Alpes), maison passive RT 2012/RE 2020, façade nord exposée vent fort.',
  },
  {
    question: 'Quels sont les délais 2026 pour faire poser des menuiseries ?',
    answer:
      'Délai moyen 2026 : 6-10 semaines entre signature devis et pose (4-6 sem fabrication sur-mesure + 1-2 sem livraison + 1-2 sem pose). En haute saison (mars-juin et septembre-novembre), délais 10-14 semaines en zones tendues (Île-de-France, métropoles). Anticiper si projet rénovation globale. La pose proprement dite : 1-2 jours pour 5-8 fenêtres standard, 1 jour pour 1 porte d’entrée.',
  },
  {
    question: 'Comment vérifier la qualité d’une menuiserie avant achat ?',
    answer:
      'Critères clés : (1) certification Acotherm pour les performances thermiques (label A à E), (2) classement AEV (étanchéité air-eau-vent), (3) marquage CE obligatoire, (4) coefficient Uw ≤ 1.3 W/m².K (vitrage + cadre combinés), (5) facteur solaire Sw ≥ 0.45 (pour gain thermique solaire), (6) marquage NF Fenêtres pour la durabilité. Demander la fiche technique + AVIS Technique CSTB pour les modèles sur-mesure.',
  },
  {
    question: 'Faut-il déposer une déclaration de travaux pour changer ses fenêtres ?',
    answer:
      'Pour la majorité des cas : NON, pas de déclaration requise (remplacement à l’identique sans modification de l’aspect extérieur). Déclaration préalable de travaux (DP) OBLIGATOIRE si : changement de couleur, modification dimensions, création nouvelle ouverture, façade en secteur sauvegardé ou abords monument historique. Délai d’instruction DP : 1 mois (2 mois en secteur protégé). Joindre photos avant + plan + descriptif technique.',
  },
]

const sources = [
  { label: 'France Rénov’ — Aides menuiseries', url: 'https://france-renov.gouv.fr' },
  {
    label: 'Service-Public.fr — MaPrimeRénov’ menuiseries',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F35083',
  },
  { label: 'ADEME — Guide menuiseries', url: 'https://www.ademe.fr' },
  { label: 'CSTB — Avis Techniques menuiseries', url: 'https://www.cstb.fr' },
  { label: 'UFME — Union des Fabricants de Menuiseries', url: 'https://www.ufme.fr' },
  { label: 'Annuaire RGE Qualibat 3641', url: 'https://france-renov.gouv.fr/annuaire-rge' },
]

const relatedPages = [
  {
    label: 'Hub Travaux rénovation',
    href: '/renovation-energetique/travaux',
    description: '4 clusters travaux + ordre logique',
  },
  {
    label: 'Fenêtres double vitrage',
    href: '/renovation-energetique/travaux/fenetres-double-vitrage',
    description: 'Focus vitrage 4/16/4 argon (4 636 vol)',
  },
  {
    label: 'Fenêtre de toit Velux : prix, pose, aides',
    href: '/renovation-energetique/travaux/menuiseries/fenetre-de-toit',
    description: 'Velux 600-2 500 € posée + DTU 40.29 + BAR-EN-104',
  },
  {
    label: 'VMC double flux',
    href: '/renovation-energetique/travaux/vmc-double-flux',
    description: 'Couplage menuiseries étanches + VMC',
  },
  {
    label: 'Hub Aides 2026',
    href: '/renovation-energetique/aides',
    description: 'MPR + CEE + éco-PTZ panorama',
  },
  {
    label: 'DPE 2026',
    href: '/renovation-energetique/diagnostic/dpe',
    description: 'Note A-G, prix, validité',
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
    section: 'Menuiseries extérieures',
    keywords: [
      'menuiserie exterieure',
      'porte fenetre prix',
      'remplacement menuiserie',
      'menuiserie alu prix',
      'menuiserie pvc prix',
      'menuiserie bois prix',
      'porte entree prix',
      'fenetre 2026',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Menuiseries extérieures', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'Menuiseries extérieures — Aides et réglementation 2026',
    description:
      'Hub des menuiseries extérieures (fenêtres, portes-fenêtres, baies coulissantes, portes d’entrée) pour la rénovation énergétique en France. Comparatif matériaux PVC/aluminium/bois, aides MaPrimeRénov’ et CEE, exigences techniques 2026.',
    url: PAGE_URL,
    serviceType: 'Travaux rénovation énergétique',
    audience: 'Propriétaires occupants, propriétaires bailleurs, copropriétés',
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
              { label: 'Menuiseries extérieures' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Wrench className="w-3.5 h-3.5" aria-hidden />
              Hub menuiseries — PVC, alu, bois, mixte
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Menuiseries extérieures 2026 : prix PVC, alu, bois et aides
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Les <strong>menuiseries extérieures</strong> (fenêtres, portes-fenêtres, baies, portes
              d’entrée) représentent <strong>10-15 % des déperditions thermiques</strong> d’une
              maison non isolée. En 2026, le remplacement par du double vitrage Uw ≤ 1.3 W/m².K
              ouvre droit à <strong>MaPrimeRénov’</strong> + CEE + TVA 5,5 %. Voici les prix réels
              par matériau, les aides cumulables et le guide d’achat complet.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="materiaux">Comparatif matériaux : PVC vs alu vs bois</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Matériau</th>
                    <th className="p-3 border-b border-sand-200">Prix posé</th>
                    <th className="p-3 border-b border-sand-200">Isolation thermique</th>
                    <th className="p-3 border-b border-sand-200">Durabilité</th>
                  </tr>
                </thead>
                <tbody>
                  {MATERIAUX.map((m) => (
                    <tr key={m.materiau} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-bold text-sand-900">{m.materiau}</td>
                      <td className="p-3 text-primary-700 font-semibold text-xs">{m.prix}</td>
                      <td className="p-3 text-xs">{m.isolation}</td>
                      <td className="p-3 text-xs">{m.durabilite}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-sand-500">
              Prix par fenêtre 1 vantail standard 80×120 cm avec double vitrage 4/16/4 argon Uw 1.3.
              Source : barèmes UFME 2026 + relevés terrain ServicesArtisans Q1 2026.
            </p>

            <h3>Détails par matériau</h3>
            <ul>
              {MATERIAUX.map((m) => (
                <li key={m.materiau}>
                  <strong>{m.materiau}</strong>. Avantages : {m.avantages}. Inconvénients :{' '}
                  {m.inconvenients}.
                </li>
              ))}
            </ul>

            <h2 id="types">Prix par type de menuiserie 2026</h2>
            <div className="not-prose grid gap-3 my-6">
              {TYPES.map((t) => {
                const Icon = t.icon
                return (
                  <div
                    key={t.type}
                    className="bg-white border border-sand-200 rounded-xl p-4 flex items-start gap-3"
                  >
                    <Icon className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden />
                    <div>
                      <p className="font-semibold text-sand-900 m-0 mb-1">{t.type}</p>
                      <p className="text-sm text-sand-700 m-0">{t.detail}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <h2 id="aides">Aides 2026 cumulables</h2>
            <div className="not-prose grid gap-3 my-6">
              {AIDES.map((a) => (
                <div key={a.aide} className="bg-white border border-sand-200 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="font-semibold text-sand-900 m-0">{a.aide}</p>
                    <span className="text-xs font-semibold bg-primary-50 text-primary-800 px-2 py-0.5 rounded-full shrink-0">
                      {a.montant}
                    </span>
                  </div>
                  <p className="text-sm text-sand-700 m-0">{a.detail}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-sand-500">
              Cumul typique 2026 (5 fenêtres, ménage modeste) : MPR 350 € + CEE 100 € + TVA réduite
              350 € = ~800 € d’économie sur 3 500 € de devis brut.
            </p>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Estimer vos aides menuiseries en 30 secondes
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Calcul instantané MPR + CEE + éco-PTZ pour le remplacement de vos menuiseries.
                    Mise en relation avec un artisan RGE Qualibat 3641 ou QB Menuiseries local.
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

            <h2 id="performance">Performance énergétique : Uw, Sw, AEV</h2>
            <p>3 indicateurs clés à vérifier avant achat :</p>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Uw (transmission thermique)</strong> : ≤ 1.3 W/m².K obligatoire pour MPR.
                Plus c’est bas, plus c’est isolant. Standards 2026 : double vitrage Uw 1.3, triple
                vitrage Uw 0.6-0.8.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Sw (facteur solaire)</strong> : ≥ 0.45 recommandé pour bénéficier des
                apports solaires gratuits l’hiver.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>AEV (étanchéité air-eau-vent)</strong> : minimum A3 (zones non exposées) ou
                A4 (zones venteuses, littoral). Détermine la performance contre les infiltrations.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Acotherm</strong> : label de classement performance (A à E). Privilégier A
                ou B.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>NF Fenêtres</strong> : marque de qualité française attestant de la
                durabilité 25-40 ans (PVC) ou 40-80 ans (bois/alu).
              </li>
            </ul>

            <h2 id="pose">Pose : déposes totale ou en rénovation ?</h2>
            <p>2 méthodes de pose en 2026 selon état du dormant existant :</p>
            <ol>
              <li>
                <strong>Pose en rénovation (sur dormant conservé)</strong>. Plus rapide (1
                fenêtre/h), moins chère (~200 €/u de pose), pas de reprises maçonnerie. Mais réduit
                de 4-7 cm la surface vitrée. Idéal si dormant ancien en bon état.
              </li>
              <li>
                <strong>Dépose totale (cadre + dormant)</strong>. Plus longue (3-4 h/u), plus chère
                (~350 €/u de pose), nécessite reprises crépi/peinture intérieure. Mais conserve la
                pleine surface vitrée et permet de re-isoler les tableaux. Idéal rénovation lourde.
              </li>
            </ol>

            <div className="not-prose flex items-start gap-3 border border-amber-200 bg-amber-50 rounded-lg p-4 my-6">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">Démarchage menuiseries = piège fréquent</p>
                <p className="m-0">
                  Démarchage téléphonique illégal depuis juillet 2020. Les "fenêtres à 1 €" ou
                  "promotions" agressives cachent souvent une majoration 30-50 % du devis. Toujours
                  exiger 3 devis d’artisans RGE Qualibat 3641 locaux. Refuser tout devis sans visite
                  physique et tout commercial à domicile non sollicité.
                </p>
              </div>
            </div>

            <h2 id="choisir">Comment choisir son artisan menuisier en 2026</h2>
            <p>
              L’artisan doit être certifié RGE Qualibat 3641 (Menuiseries extérieures) ou QB
              Menuiseries (norme NF EN ISO 17065) pour ouvrir droit aux aides MPR/CEE. Vérifications
              à faire :
            </p>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Validité de la certification RGE sur france-renov.gouv.fr (date d’expiration,
                périmètre géographique).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Attestation d’assurance décennale en cours de validité.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Visite technique obligatoire avant devis (jamais de devis par téléphone). Mesures au
                mm près sur place.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />3 devis
                comparés minimum (écart fréquent 30-50 % à puissance équivalente).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Sur le devis : marque + modèle + Uw + Sw + classement AEV + label Acotherm + type de
                pose + traitement étanchéité air + durée garantie matériau (10-15 ans).
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
              href="/renovation-energetique/travaux"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Travaux
            </Link>
            <Link
              href="/renovation-energetique/travaux/fenetres-double-vitrage"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Fenêtres double vitrage <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
