/**
 * /renovation-energetique/travaux/vmc/installation — guide installation VMC (cash cow).
 *
 * @kw-primary    installation vmc
 * @kw-volume     1800
 * @kw-kd         0
 * @kw-cpc        2.10
 * @intent        commercial
 * @cluster       reno-energetique-vmc-installation
 * @ahrefs-source bloc1
 * @snapshot      2026-05-06 (Ahrefs Bloc 1 v3 — pivot up sur head canonical)
 * @backlog-item  Sprint1-20-80-vmc-installation-cash-cow
 *
 * Re-cible 2026-05-06 : pivot passe de "vmc installation" (1 200 vol) à "installation
 * vmc" (1 800 vol KD 0) — ordre des mots préféré Google + déjà aligné avec H1/TITLE.
 *
 * Famille cumulée ~5 020 vol/mois (KD 0-1, intent COMMERCIAL — fort potentiel devis) :
 * - "installation vmc"      → 1 800 vol, KD 0 ⭐⭐⭐⭐ PIVOT (effy.fr #1)
 * - "vmc installation"      → 1 200 vol, KD 0 (variant)
 * - "installation vmc prix" → 880 vol, KD 0
 * - "pose vmc"              → 720 vol, KD 0
 * - "remplacement vmc"      → 480 vol, KD 1
 * - "vmc installation prix" → 350 vol, KD 0
 * - "installer une vmc"     → 320 vol, KD 0
 * - "qui installe une vmc"  → 250 vol, KD 1
 *
 * Easy win : OUI MEGA — KD 0 sur tous KW. Page how-to + check-list devis.
 * Atout SA : guide étapes + tarifs + checklist devis + RGE Qualibat 8721 +
 * CTA devis exclusifs (intent commercial = conversion lead 5-10 % vs info 0.5 %).
 *
 * Anti-cannibalisation :
 *   - /vmc (hub head term "vmc" 48K) = panorama types (intent info)
 *   - /vmc/simple-flux, /hygroreglable, /vmc-double-flux = focus type (intent achat)
 *   - /vmc/entretien = post-installation récurrent (intent légal)
 *   - Cette page = CTA devis + processus pose (intent COMMERCIAL = devis)
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Award, Calculator, CheckCircle2 } from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema, getHowToSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import SimulateurAideBox from '@/components/conversion/SimulateurAideBox'
import PrixComparatif from '@/components/conversion/PrixComparatif'
import FinalCtaSection from '@/components/conversion/FinalCtaSection'
import LocalProviderShowcase from '@/components/seo/LocalProviderShowcase'
import { getProvidersByService } from '@/lib/supabase'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/vmc/installation'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'marc-lefebvre'
const AUTHOR_NAME = 'Marc Lefebvre'

const TITLE = 'Installation VMC 2026 : étapes, prix, checklist devis'
const DESCRIPTION =
  'Installation VMC 2026 : étapes pose 1-3 jours, prix 500-9 000 € selon type, checklist devis artisan RGE, mise en service débits. Guide complet.'

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
  'Installation VMC simple flux : 1-2 jours. Double flux : 2-4 jours. Décentralisée pièce par pièce : 1 jour.',
  'Prix posé clé en main : 500-1 200 € (auto), 900-2 500 € (hygro), 4 000-6 500 € (DF), 6 000-9 000 € (DF thermo).',
  'Étapes : étude faisabilité → devis RGE → CEE/MPR avant signature → pose → mise en service avec mesure débits.',
  'Artisan RGE Qualibat 8721 obligatoire pour CEE et TVA 5,5 %.',
  'Mise en service NF DTU 68.3 : mesure débits aux bouches, équilibrage, formation utilisateur.',
  'Garantie installateur 2 ans (légale) + garantie matériel constructeur 2-5 ans.',
]

const ETAPES_DETAILLEES = [
  {
    step: 'Étude de faisabilité',
    duree: '30 min - 1h sur place',
    detail:
      'L’artisan vérifie : emplacement caisson (combles, vide technique, placard ventilé), passage gaines isolées (Ø 80-160 mm), accès toiture pour rejet, débit nécessaire (T1 à T6+, arrêté 24/03/1982), position bouches (cuisine, SDB, WC). Pour double flux : surface utile pour échangeur et pré-filtres.',
  },
  {
    step: 'Devis détaillé',
    duree: 'Sous 7 jours',
    detail:
      'Devis exigé en 2-3 exemplaires comparatifs. Doit contenir : marque, modèle, débit max (m³/h), rendement échangeur (DF), longueur gaines (m), nombre bouches, mise en service avec mesure débits, garantie pose 2 ans + garantie matériel. Mention RGE Qualibat 8721 valide à la date du devis.',
  },
  {
    step: 'Acceptation CEE / dépôt MPR',
    duree: '7-15 jours',
    detail:
      'CEE : choisir un énergéticien (TotalEnergies, EDF, Engie, Sonergia) AVANT signature devis. MPR (double flux uniquement) : déposer dossier sur france-renov.gouv.fr AVANT signature. Acceptation = engagement primes.',
  },
  {
    step: 'Signature devis + acompte',
    duree: 'J+0',
    detail:
      'Acompte 20-30 % à la signature. Délai légal de rétractation 14 jours. Planification chantier 4-8 semaines après signature (selon disponibilité artisan).',
  },
  {
    step: 'Préparation chantier',
    duree: 'J-2 à J-1',
    detail:
      'Vider combles, déplacer mobilier sous trajectoire gaines, libérer accès tableau électrique. L’artisan apporte aspirateur, bâches de protection, échelle.',
  },
  {
    step: 'Pose caisson + gaines',
    duree: 'Jour 1 (4-8h)',
    detail:
      'Fixation caisson VMC (en combles ou local technique), passage gaines isolées (Ø 80-160 mm) entre caisson et bouches/sortie toiture. Pour double flux : 4 réseaux (insufflation séjour/chambres + extraction cuisine/SDB/WC).',
  },
  {
    step: 'Pose bouches + entrées d’air',
    duree: 'Jour 1-2 (1-3h)',
    detail:
      'Bouches d’extraction (cuisine, SDB, WC), bouches d’insufflation (séjour, chambres pour DF), entrées d’air haute fenêtre (hygro B uniquement). Calfeutrement étanche autour des bouches.',
  },
  {
    step: 'Raccordement électrique',
    duree: 'Jour 1-2 (1-2h)',
    detail:
      'Câblage 230 V depuis tableau électrique vers caisson. Disjoncteur dédié 2 A. Pour DF thermodynamique : prévoir alimentation triphasée si > 3 000 W.',
  },
  {
    step: 'Mise en service avec mesure débits',
    duree: 'Jour final (1-2h)',
    detail:
      'Mesure débits aux bouches avec anémomètre (NF DTU 68.3). Équilibrage si nécessaire. Vérification niveau sonore (&lt; 30 dB(A) dans chambres, &lt; 35 dB(A) pièces de vie). Test mode boost (cuisson, douche). Procès-verbal de mise en service remis.',
  },
  {
    step: 'Formation utilisateur',
    duree: '15-30 min',
    detail:
      'Programmation horaires (mode économie nuit), changement filtres tous les 6 mois (DF), entretien bouches annuel (vinaigre + brosse). Notice d’utilisation + procès-verbal débits + facture acquittée remis.',
  },
  {
    step: 'Versement aides',
    duree: '4-8 semaines',
    detail:
      'CEE versé après envoi facture acquittée + photo équipement avec sticker RGE visible. MPR (DF) : virement après acceptation dossier final. Solde devis (70-80 %) à régler à l’artisan après mise en service réussie.',
  },
]

const CHECKLIST_DEVIS = [
  'Mention RGE Qualibat 8721 valide à la date du devis (vérifiable sur france-renov.gouv.fr)',
  'Marque + modèle précis (vérifier conformité fiche standardisée CEE BAR-TH-127)',
  'Type VMC clairement indiqué (auto, hygro A, hygro B, DF standard, DF thermodynamique)',
  'Débit max réglementaire en m³/h (selon T1-T6+ arrêté 24/03/1982)',
  'Rendement échangeur thermique en % (DF uniquement, &gt; 70 %)',
  'Longueur des gaines isolées en mètres + diamètre (Ø 80-160 mm)',
  'Nombre et type de bouches (extraction + insufflation pour DF)',
  'Nombre et type d’entrées d’air haute fenêtre (hygro B + DF)',
  'Mise en service avec mesure débits (anémomètre) — obligatoire',
  'Garantie pose 2 ans (légale) + garantie matériel 2-5 ans',
  'Total HT, TVA 5,5 % détaillée, total TTC',
  'Délai prévisionnel de réalisation (chantier + mise en service)',
  'Modalités de paiement (acompte, intermédiaire, solde)',
  'Engagement primes CEE / MPR avant signature',
]

const faqs = [
  {
    question: 'Combien de temps dure l’installation d’une VMC ?',
    answer:
      '<strong>Simple flux</strong> : 1-2 jours pour une maison 100 m² (caisson + gaines + bouches + raccordement). <strong>Double flux</strong> : 2-4 jours (4 réseaux de gaines à passer + équilibrage). <strong>Décentralisée</strong> (pièce par pièce) : 1 jour (modules muraux, pas de gaines centrales). En neuf : divisez par 1,5 (intégration plus simple). Pour rénovation copropriété complexe : 3-5 jours.',
  },
  {
    question: 'Quel est le prix d’installation d’une VMC en 2026 ?',
    answer:
      'Prix posé clé en main 2026 (maison 100 m², rénovation) : <strong>autoréglable</strong> 500-1 200 €, <strong>autoréglable basse conso</strong> 700-1 800 €, <strong>hygro A</strong> 900-2 200 €, <strong>hygro B</strong> 1 100-2 500 €, <strong>DF standard</strong> 4 000-6 500 €, <strong>DF haute performance</strong> 5 000-7 500 €, <strong>DF thermodynamique</strong> 6 000-9 000 €, <strong>DF décentralisée</strong> 300-600 €/pièce. Matériel 50-65 %, pose 35-50 %.',
  },
  {
    question: 'Quel artisan pour installer une VMC ?',
    answer:
      'Plusieurs corps de métier interviennent : <strong>chauffagiste</strong> (le plus courant pour double flux), <strong>installateur thermique</strong>, <strong>ventiliste</strong> (spécialiste), <strong>électricien</strong> (pour simple flux). Mention <strong>RGE Qualibat 8721</strong> (ventilation mécanique) ou QualiPAC mention VMC obligatoire pour CEE et TVA 5,5 %. Sans RGE : pas de prime, TVA 20 %, surcoût 200-1 000 €. Notre annuaire RGE est mis à jour mensuellement via l’API officielle ADEME.',
  },
  {
    question: 'Quelles aides obtenir pour l’installation d’une VMC ?',
    answer:
      '<strong>CEE Coup de pouce</strong> : 50-300 € (simple flux), 500-1 200 € (DF). <strong>MaPrimeRénov’</strong> : 0 € (simple flux seule, sauf Parcours Accompagné), 1 500-2 500 € (DF selon profil Bleu/Jaune/Violet). <strong>TVA 5,5 %</strong> automatique avec RGE. <strong>Éco-PTZ</strong> éligible si bouquet de travaux. <strong>MPR Copro</strong> pour copropriétés avec gain &gt; 35 %. Cumul typique DF : MPR 2 500 € + CEE 800 € = 3 300 € sur 5 500 €, reste à charge 2 200 €.',
  },
  {
    question: 'Que doit contenir le devis d’installation VMC ?',
    answer:
      'Checklist devis détaillée : (1) mention RGE Qualibat 8721 valide, (2) marque + modèle précis, (3) type VMC (auto/hygro A/hygro B/DF), (4) débit max m³/h, (5) rendement échangeur (DF), (6) longueur gaines + diamètre, (7) nombre bouches, (8) entrées d’air haute fenêtre (hygro B/DF), (9) mise en service avec mesure débits anémomètre, (10) garantie pose 2 ans + matériel 2-5 ans, (11) total HT/TVA 5,5 %/TTC, (12) délai chantier, (13) modalités paiement, (14) engagement CEE/MPR avant signature.',
  },
  {
    question: 'Faut-il une autorisation pour installer une VMC en copropriété ?',
    answer:
      'Oui dans plusieurs cas. <strong>VMC collective existante</strong> : modification interdite (réseau commun), entretien à la charge du syndic. <strong>VMC individuelle dans appartement</strong> : accord syndic obligatoire si perçage façade pour rejet d’air (déclaration préalable mairie possible si modification aspect extérieur). <strong>VMC double flux décentralisée</strong> : assemblée générale à voter (modules muraux visibles façade). Délai vote AG : 6-12 mois. Conseil : demander à l’artisan un dossier prêt à présenter.',
  },
  {
    question: 'Faut-il déposer une déclaration préalable de travaux ?',
    answer:
      'Selon la commune : déclaration préalable mairie si <strong>perçage façade pour grille de rejet d’air visible</strong> (modification aspect extérieur). Délai instruction 1 mois. Délai recours tiers 2 mois. Si rejet en toiture (chapeau + sortie discrète) : pas de déclaration. En copropriété : accord syndic préalable obligatoire (cf. question précédente). Pour les bâtiments classés monuments historiques : autorisation Architecte des Bâtiments de France (ABF), délai 4 mois.',
  },
  {
    question: 'Comment se passe la mise en service d’une VMC ?',
    answer:
      'Étapes obligatoires NF DTU 68.3 : (1) <strong>mesure débits</strong> aux bouches avec anémomètre (vérification conformité arrêté 24/03/1982), (2) <strong>équilibrage</strong> si écart entre bouches, (3) <strong>vérification niveau sonore</strong> (&lt; 30 dB(A) chambres, &lt; 35 dB(A) pièces de vie), (4) <strong>test mode boost</strong> (cuisson, douche), (5) <strong>procès-verbal</strong> de mise en service signé. Sans mise en service formelle : pas de garantie, pas de versement CEE/MPR, risque de débit insuffisant et moisissures.',
  },
]

const sources = [
  { label: 'France Rénov’ — Installer une VMC', url: 'https://france-renov.gouv.fr' },
  { label: 'ADEME — Guide ventilation', url: 'https://www.ademe.fr' },
  { label: 'Arrêté 24 mars 1982 — Aération logements', url: 'https://www.legifrance.gouv.fr' },
  { label: 'NF DTU 68.3 — Mise en œuvre VMC', url: 'https://www.afnor.org' },
  { label: 'Qualibat 8721 — Mention ventilation', url: 'https://www.qualibat.com' },
  { label: 'Service-public.fr — Déclaration travaux', url: 'https://www.service-public.fr' },
]

const relatedPages = [
  {
    label: 'Hub VMC',
    href: '/renovation-energetique/travaux/vmc',
    description: 'Comparatif 4 familles VMC',
  },
  {
    label: 'VMC simple flux',
    href: '/renovation-energetique/travaux/vmc/simple-flux',
    description: 'Auto vs hygro, conditions CEE',
  },
  {
    label: 'VMC hygroréglable',
    href: '/renovation-energetique/travaux/vmc/hygroreglable',
    description: 'Type A vs B, débits réglementaires',
  },
  {
    label: 'VMC double flux',
    href: '/renovation-energetique/travaux/vmc-double-flux',
    description: 'Récup chaleur 70-90 %, MPR 2 500 €',
  },
  {
    label: 'CEE — Certificats économie d’énergie',
    href: '/renovation-energetique/aides/cee-certificats-economie-energie',
    description: 'Coup de pouce VMC + cumul travaux',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'Calcul personnalisé instantané',
  },
]

export default async function Page() {
  const providers = await getProvidersByService('ventilation', 6)
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: PAGE_PATH,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Installation VMC',
    keywords: [
      'vmc installation',
      'installation vmc prix',
      'pose vmc',
      'remplacement vmc',
      'installer une vmc',
      'vmc neuf prix',
      'vmc installation 2026',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'VMC', url: '/renovation-energetique/travaux/vmc' },
    { name: 'Installation', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const howToSchema = getHowToSchema(
    ETAPES_DETAILLEES.map((e) => ({ name: e.step, text: e.detail })),
    {
      name: 'Installer une VMC en 2026',
      description:
        'Étapes complètes pour installer une VMC simple flux ou double flux par un artisan RGE.',
      totalTime: 'P1D',
    }
  )
  const schemas = [articleSchema, breadcrumbSchema, faqSchema, howToSchema].filter(
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
              { label: 'VMC', href: '/renovation-energetique/travaux/vmc' },
              { label: 'Installation' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Award className="w-3.5 h-3.5" aria-hidden />
              Installation VMC 2026 — Guide complet
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Installation VMC 2026 : étapes, prix, checklist
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              <strong>Installation VMC</strong> en rénovation : 1-2 jours (simple flux) à 2-4 jours
              (double flux). Prix posé 500 € à 9 000 € selon type. Mention{' '}
              <strong>RGE Qualibat 8721</strong> obligatoire pour CEE et TVA 5,5 %. Mise en service
              NF DTU 68.3 avec mesure débits aux bouches. Découvrez les{' '}
              <strong>11 étapes détaillées</strong>, la <strong>checklist devis</strong> et les{' '}
              <strong>aides 2026</strong>.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="etapes">Les 11 étapes d’installation détaillées</h2>
            <ol className="list-none p-0 my-6">
              {ETAPES_DETAILLEES.map((e, i) => (
                <li
                  key={e.step}
                  className="not-prose bg-white border border-sand-200 rounded-xl p-4 mb-3 flex gap-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-700 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    {i + 1}
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                        {e.step}
                      </h3>
                      <span className="text-xs text-sand-500 italic whitespace-nowrap">
                        {e.duree}
                      </span>
                    </div>
                    <p className="text-sm text-sand-700 m-0 mt-1">{e.detail}</p>
                  </div>
                </li>
              ))}
            </ol>

            <h2 id="checklist">Checklist devis : 14 points à vérifier</h2>
            <p>
              Avant de signer un devis VMC, vérifiez que <strong>chaque point ci-dessous</strong>{' '}
              figure clairement. Tout devis incomplet est un signal d’alerte.
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 my-6">
              <ul className="list-none p-0 m-0 space-y-2">
                {CHECKLIST_DEVIS.map((c, i) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-sand-700">
                    <CheckCircle2
                      className="w-4 h-4 text-primary-700 mt-0.5 flex-shrink-0"
                      aria-hidden
                    />
                    <span>
                      <strong>{i + 1}.</strong> {c}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <h2 id="cta">Trouvez un artisan RGE Qualibat 8721 près de chez vous</h2>
            <div className="not-prose bg-primary-50 border border-primary-200 rounded-xl p-6 my-6">
              <p className="text-sand-900 m-0 mb-3">
                <Calculator className="inline w-5 h-5 text-primary-700 mr-1" aria-hidden />
                <strong>Devis installation VMC en 30 secondes</strong> — comparez 2-3 artisans RGE
                Qualibat 8721 pour bénéficier des aides.
              </p>
              <Link
                href="/devis"
                className="inline-flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white font-semibold px-5 py-3 rounded-lg transition"
              >
                Demander mes devis VMC <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
          </article>

          <PrixComparatif
            title="Prix installation VMC par type (posé clé en main, RGE Qualibat 8721)"
            caption="Maison 100 m² en rénovation. TVA 5,5 % incluse. Sources : ADEME 2026, AFPAC, retours terrain devis RGE."
            rows={[
              {
                brand: 'VMC simple flux auto',
                priceRange: '500 - 1 200 €',
                notes: 'Entrée de gamme, rénovation basique',
                rating: 3.5,
              },
              {
                brand: 'VMC hygroréglable B',
                priceRange: '1 100 - 2 500 €',
                notes: 'Standard rénovation maison, économie 5-10 %',
                rating: 4.0,
                highlight: true,
              },
              {
                brand: 'VMC double flux standard',
                priceRange: '4 000 - 6 500 €',
                notes: 'Récup chaleur 70-90 %, MPR Bleu 2 500 €',
                rating: 4.5,
              },
              {
                brand: 'VMC double flux thermodynamique',
                priceRange: '6 000 - 9 000 €',
                notes: 'PAC intégrée + rafraîchissement été',
                rating: 4.3,
              },
            ]}
            withSchema
          />

          <SimulateurAideBox
            serviceKey="vmc"
            estimatedSaving={3700}
            subtitle="MaPrimeRénov' Bleu 2 500 € + CEE Coup de pouce 500-1 200 € — éligibilité conditionnée à un artisan RGE Qualibat 8721"
          />

          <LocalProviderShowcase
            providers={providers}
            serviceName="Installateur VMC RGE"
            cityName="France"
          />

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

      <FinalCtaSection
        heading="Demandez vos devis pose VMC"
        description="Recevez 3 devis d'artisans qualifiés en moins de 24h. Gratuit, sans engagement."
        primaryCta={{
          label: 'Demander mes devis',
          href: '/simulateur-aides-renovation?service=vmc',
          intent: 'final-devis-installation',
        }}
        secondaryCta={{
          label: 'Voir les artisans RGE',
          href: '/rge/labels/qualibat',
        }}
        accent="blue"
        trustLine="Artisans qualifiés • Source : Registre RGE ADEME • RGPD"
      />
    </>
  )
}
