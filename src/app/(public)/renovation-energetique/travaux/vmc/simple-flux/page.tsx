/**
 * /renovation-energetique/travaux/vmc/simple-flux — sub-page VMC simple flux.
 *
 * @kw-primary    vmc simple flux
 * @kw-volume     15000
 * @kw-kd         2
 * @kw-cpc        2.80
 * @intent        commercial
 * @cluster       reno-energetique-vmc-simple-flux
 * @ahrefs-source bloc1
 * @snapshot      2026-05-06 (audit Sprint1-20-80 — recheck)
 * @backlog-item  Sprint1-20-80-vmc-simple-flux-audit
 *
 * Audit 2026-05-06 : page existante validée Bloc 1, KW pivot toujours top
 * priorité (15K vol KD 2). Header enrichi @intent + cluster slug + audit Sprint1.
 *
 * Famille cumulée ~18 000 vol/mois :
 * - "vmc simple flux"               → 15 000 vol, KD 2 ⭐⭐⭐⭐⭐ PIVOT (effy.fr #2)
 * - "vmc simple flux prix"          →  1 200 vol, KD 0
 * - "vmc simple flux hygroréglable" →    880 vol, KD 1 (overlap /hygroreglable/)
 * - "vmc simple flux autoreglable"  →    480 vol, KD 0
 * - "vmc simple flux maison"        →    320 vol, KD 0
 *
 * Easy win : OUI MEGA — Effy seul top 5, France-Renov pas dédiée.
 * Atout SA : comparatif neutre + simulateur + RGE Qualibat 8721 + DevisCTA inline.
 *
 * Anti-cannibalisation :
 *   - Hub /vmc = panorama 4 types (head term "vmc" 48K)
 *   - Cette page = focus simple flux (autoréglable + hygro vue d'ensemble)
 *   - /vmc/hygroreglable = focus deep type A vs B
 *   - /vmc/hygroreglable/type-b = focus deep type B
 *   - /vmc-double-flux (top-level) = autre famille
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Award, Calculator, Wind } from 'lucide-react'

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
import SimulateurAideBox from '@/components/conversion/SimulateurAideBox'
import LocalProviderShowcase from '@/components/seo/LocalProviderShowcase'
import { getProvidersByService } from '@/lib/supabase'
import PrixComparatif from '@/components/conversion/PrixComparatif'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/vmc/simple-flux'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'marc-lefebvre'
const AUTHOR_NAME = 'Marc Lefebvre'

const TITLE = 'VMC simple flux 2026 : prix, autoréglable vs hygro'
const DESCRIPTION =
  'VMC simple flux 2026 : prix posé 500-2 500 €, comparatif autoréglable vs hygroréglable, CEE 100-300 €, économie chauffage 5-12 %. Guide artisan RGE.'

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
  'VMC simple flux = extracteur d’air vicié dans pièces humides, air neuf entre par défaut d’étanchéité.',
  'Prix posé 2026 : 500-1 200 € (autoréglable), 900-2 500 € (hygroréglable).',
  '4 sous-types : autoréglable, autoréglable basse conso (moteur EC), hygroréglable A, hygroréglable B.',
  'CEE Coup de pouce : 100-300 €. Pas de MaPrimeRénov’ seule (uniquement en Parcours Accompagné).',
  'Économie chauffage : 5-12 % vs ancienne VMC autoréglable. Conso élec 20-50 kWh/an.',
  'RGE Qualibat 8721 obligatoire pour CEE et TVA 5,5 %.',
]

const SOUS_TYPES = [
  {
    type: 'Autoréglable standard',
    prix: '500-1 200 € posé',
    debit: 'Constant 24h/24',
    conso: '30-50 kWh/an',
    detail:
      'Débit fixe quelles que soient l’humidité ou la fréquentation. Standard ancien, encore vendu pour budget serré. Aucune éco énergétique.',
    hygro: false,
  },
  {
    type: 'Autoréglable basse conso (moteur EC)',
    prix: '700-1 800 € posé',
    debit: 'Constant + moteur EC',
    conso: '8-15 kWh/an',
    detail:
      'Mêmes débits qu’une autoréglable mais moteur EC haute efficacité (vs AC standard). Conso élec divisée par 4. CEE 50-200 €.',
    hygro: false,
  },
  {
    type: 'Hygroréglable type A',
    prix: '900-2 200 € posé',
    debit: 'Bouches modulent (humidité)',
    conso: '20-35 kWh/an',
    detail:
      'Bouches d’extraction modulables selon humidité (sondes hygrométriques). Économie 5-8 % sur le chauffage. Standard rénovation classique.',
    hygro: true,
  },
  {
    type: 'Hygroréglable type B',
    prix: '1 100-2 500 € posé',
    debit: 'Bouches + entrées d’air modulent',
    conso: '25-45 kWh/an',
    detail:
      'Type A + entrées d’air haute fenêtre modulables (sondes). Économie 8-12 %. Top performance simple flux. RECOMMANDÉ rénovation.',
    hygro: true,
  },
]

const COMPARATIF_AUTO_HYGRO = [
  { critere: 'Prix posé maison 100 m²', auto: '500-1 200 €', hygro: '900-2 500 €' },
  { critere: 'Économie chauffage', auto: '0 % (référence)', hygro: '5-12 %' },
  {
    critere: 'Confort acoustique',
    auto: 'Moyen (débit fixe = bouches sifflent)',
    hygro: 'Bon (débit minimal en absence)',
  },
  { critere: 'Filtration humidité', auto: 'Moyenne', hygro: 'Excellente (gère pics SDB/cuisine)' },
  { critere: 'Conso élec ventilateur', auto: '30-50 kWh/an', hygro: '20-45 kWh/an' },
  { critere: 'CEE Coup de pouce', auto: '50-200 €', hygro: '100-300 €' },
  { critere: 'Durée de vie', auto: '10-15 ans', hygro: '15-20 ans' },
  {
    critere: 'Recommandé pour',
    auto: 'Petit budget, locatif court terme',
    hygro: 'Rénovation, propriétaire occupant',
  },
]

const ETAPES_INSTALL = [
  {
    step: 'Étude de faisabilité',
    detail:
      'Vérifier emplacement caisson (combles, vide technique, placard ventilé), passage des gaines isolées (Ø 80-160 mm) et bouches d’extraction (cuisine, SDB, WC). Pour hygro B : entrées d’air haute fenêtre dans pièces de vie (séjour, chambres).',
  },
  {
    step: 'Devis artisan RGE Qualibat 8721',
    detail:
      'Mention RGE obligatoire pour CEE + TVA 5,5 %. Exiger devis détaillé : marque, modèle, débits réglementaires (cf. arrêté 24/03/1982), longueur gaines, nombre bouches, mise en service.',
  },
  {
    step: 'Acceptation offre CEE avant signature',
    detail:
      'Choisir un énergéticien (TotalEnergies, EDF, Engie, etc.) AVANT signature devis. Acceptation = engagement primes 100-300 €.',
  },
  {
    step: 'Installation (1-2 jours)',
    detail:
      'Pose caisson + gaines isolées + bouches + raccordement électrique. Mise en service avec mesure des débits aux bouches (NF DTU 68.3).',
  },
  {
    step: 'Versement CEE (4-8 semaines)',
    detail:
      'CEE versé après facture acquittée + photo équipement (sticker mention RGE visible) + contrôle terrain aléatoire 5 % des dossiers.',
  },
]

const faqs = [
  {
    question: 'Combien coûte une VMC simple flux en 2026 ?',
    answer:
      'Prix posé clé en main 2026 (maison 100 m², rénovation) : <strong>autoréglable</strong> 500-1 200 €, <strong>autoréglable basse conso (moteur EC)</strong> 700-1 800 €, <strong>hygroréglable type A</strong> 900-2 200 €, <strong>hygroréglable type B</strong> 1 100-2 500 €. Le matériel représente 50-65 %, la pose (caisson + gaines + bouches) 35-50 %. En neuf, divisez par 1,5-2.',
  },
  {
    question: 'Quelle différence entre VMC simple flux autoréglable et hygroréglable ?',
    answer:
      'Autoréglable = débit fixe 24h/24, quelles que soient les conditions. Hygroréglable = débit modulé selon l’humidité (sondes hygrométriques sur les bouches). Type A : seules les bouches modulent. Type B : bouches + entrées d’air haute fenêtre. Économie chauffage : 0 % (auto), 5-8 % (hygro A), 8-12 % (hygro B). Confort acoustique meilleur en hygro (débit minimal en absence). Coût supplémentaire 400-1 300 € amorti en 4-7 ans sur la facture chauffage.',
  },
  {
    question: 'Quelles aides pour une VMC simple flux ?',
    answer:
      'Pas de <strong>MaPrimeRénov’</strong> seule (réservée double flux). Eligible MPR uniquement en <strong>Parcours Accompagné</strong> (rénovation globale gain énergétique &gt; 35 %). <strong>CEE Coup de pouce</strong> : 50-200 € (auto basse conso), 100-300 € (hygro). <strong>TVA 5,5 %</strong> automatique avec artisan RGE Qualibat 8721. <strong>Éco-PTZ</strong> éligible si bouquet de travaux. Pour copropriétés : MPR Copro + CEE bonifié.',
  },
  {
    question: 'Quelle marque de VMC simple flux choisir en 2026 ?',
    answer:
      '<strong>Aldes</strong> (leader marché, EasyHOME série), <strong>Atlantic</strong> (HygroCosy, Optimocosy), <strong>Unelvent</strong> (Ozeo, Ideo), <strong>Helios</strong> (KWL Mini). Vérifier : NF EN 13141 (norme produit), niveau sonore &lt; 30 dB(A) à 1 m, conformité arrêté 24/03/1982 (débits min/max), garantie 2-5 ans. Pour CEE : marquage CE + fiche technique correspondant à la fiche standardisée BAR-TH-127.',
  },
  {
    question: 'Faut-il remplacer une vieille VMC autoréglable par de l’hygroréglable ?',
    answer:
      'Oui dès que possible si la VMC a &gt; 10 ans. Bénéfices : économie chauffage 5-12 %, confort acoustique amélioré, gestion humidité (anti-moisissures), conso élec divisée par 2 (si moteur EC). ROI 4-7 ans sur facture chauffage 1 200 €/an. Si VMC en panne : opportunité immédiate, l’écart de prix vs réparation autoréglable est minime (200-500 €). Bonus copropriété : remplacement VMC collective = vote AG + MPR Copro possible.',
  },
  {
    question: 'VMC simple flux ou double flux : laquelle pour ma maison ?',
    answer:
      'Règle simple : <strong>simple flux hygro B</strong> si logement non isolé ou isolation partielle, <strong>double flux</strong> si logement bien isolé (combles + murs + fenêtres). Pourquoi : double flux récupère la chaleur sortante via échangeur. Si logement étanche, gain 15-25 % sur le chauffage. Si logement passoire, fuites d’air parasites court-circuitent l’échangeur, ROI 12-15 ans. Avant double flux : faire l’isolation. Sinon = gâchis financier 4 000-6 500 €.',
  },
  {
    question: 'Faut-il un artisan RGE pour une VMC simple flux ?',
    answer:
      'Oui pour bénéficier des aides. Mention RGE <strong>Qualibat 8721</strong> (ventilation mécanique) obligatoire pour CEE et TVA 5,5 %. Sans RGE : pas de CEE, TVA 20 % au lieu de 5,5 %, surcoût 200-500 €. La mention RGE doit être valide à la date du devis (vérification ADEME). Notre annuaire liste les artisans RGE certifiés Qualibat 8721 par département via l’API officielle.',
  },
  {
    question: 'Combien de temps pour installer une VMC simple flux ?',
    answer:
      'Installation 1-2 jours pour une maison 100 m². Étapes : (1) pose du caisson (2-3h), (2) passage des gaines isolées (3-5h), (3) pose bouches d’extraction et entrées d’air (1-2h), (4) raccordement électrique (1h), (5) mise en service avec mesure débits (1h). Pour rénovation copropriété ou logement complexe : 2-3 jours. Aucune coupure d’eau, électricité limitée à 30 min.',
  },
]

const sources = [
  { label: 'France Rénov’ — Ventilation', url: 'https://france-renov.gouv.fr' },
  { label: 'ADEME — Guide ventilation', url: 'https://www.ademe.fr' },
  { label: 'Arrêté 24 mars 1982 — Aération logements', url: 'https://www.legifrance.gouv.fr' },
  { label: 'NF DTU 68.3 — Mise en œuvre VMC', url: 'https://www.afnor.org' },
  { label: 'Fiche standardisée CEE BAR-TH-127', url: 'https://atee.fr' },
  { label: 'Qualibat 8721 — Mention ventilation', url: 'https://www.qualibat.com' },
]

const relatedPages = [
  {
    label: 'Hub VMC',
    href: '/renovation-energetique/travaux/vmc',
    description: 'Comparatif 4 familles VMC',
  },
  {
    label: 'VMC hygroréglable',
    href: '/renovation-energetique/travaux/vmc/hygroreglable',
    description: 'Type A vs B en détail',
  },
  {
    label: 'VMC double flux',
    href: '/renovation-energetique/travaux/vmc-double-flux',
    description: 'Récup chaleur 70-90 %, MPR 2 500 €',
  },
  {
    label: 'CEE — Certificats économie d’énergie',
    href: '/renovation-energetique/aides/cee-certificats-economie-energie',
    description: 'Coup de pouce VMC + tous travaux',
  },
  {
    label: 'Artisans RGE Qualibat 8721',
    href: '/services/installateur-vmc',
    description: 'Annuaire vérifié API ADEME',
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
    section: 'VMC simple flux',
    keywords: [
      'vmc simple flux',
      'vmc simple flux prix',
      'vmc simple flux hygroreglable',
      'vmc simple flux autoreglable',
      'vmc simple flux maison',
      'vmc simple flux 2026',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'VMC', url: '/renovation-energetique/travaux/vmc' },
    { name: 'Simple flux', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'VMC simple flux : CEE Coup de pouce 2026',
    description:
      'VMC simple flux éligible CEE Coup de pouce 100-300 € + TVA 5,5 %. Installation par artisan RGE Qualibat 8721 obligatoire pour les aides.',
    url: PAGE_URL,
    serviceType: 'Subvention publique ventilation',
    audience: 'Propriétaires occupants, bailleurs, copropriétés',
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
              { label: 'VMC', href: '/renovation-energetique/travaux/vmc' },
              { label: 'Simple flux' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Award className="w-3.5 h-3.5" aria-hidden />
              VMC simple flux 2026 — CEE 100-300 €
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              VMC simple flux 2026 : prix, autoréglable vs hygro
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              La <strong>VMC simple flux</strong> extrait l’air vicié des pièces humides (cuisine,
              SDB, WC) ; l’air neuf entre par défaut d’étanchéité. Quatre sous-types : autoréglable
              (500-1 200 €), autoréglable basse conso (700-1 800 €),{' '}
              <strong>hygroréglable A</strong> (900-2 200 €), <strong>hygroréglable B</strong> (1
              100-2 500 €). Hygroréglable B = choix #1 en rénovation : économie chauffage{' '}
              <strong>8-12 %</strong> + CEE Coup de pouce 100-300 € + TVA 5,5 %.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="fonctionnement">Comment fonctionne une VMC simple flux</h2>
            <p>
              <Wind className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
              Un caisson moteur (en combles ou local technique) aspire l’air vicié via des bouches
              d’extraction installées dans les <strong>pièces humides</strong> (cuisine, salle de
              bain, WC, buanderie). L’air est rejeté à l’extérieur par une sortie en toiture ou en
              façade. L’air neuf entre <strong>passivement</strong> par les défauts d’étanchéité du
              logement (entrées d’air haute fenêtre, joints porte d’entrée). Pas de récupération de
              chaleur, contrairement à la VMC double flux.
            </p>

            <h2 id="sous-types">Les 4 sous-types de VMC simple flux</h2>
            <div className="not-prose grid gap-3 my-6">
              {SOUS_TYPES.map((t) => (
                <div
                  key={t.type}
                  className={`bg-white border rounded-xl p-5 ${
                    t.hygro ? 'border-primary-300' : 'border-sand-200'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                      {t.type}
                      {t.hygro && (
                        <span className="ml-2 text-xs bg-primary-100 text-primary-800 px-2 py-0.5 rounded">
                          Hygro
                        </span>
                      )}
                    </h3>
                    <span className="text-sm font-bold text-primary-700 whitespace-nowrap">
                      {t.prix}
                    </span>
                  </div>
                  <p className="text-xs text-sand-500 m-0 mb-2">
                    Débit : {t.debit} · Conso élec : {t.conso}
                  </p>
                  <p className="text-sm text-sand-700 m-0">{t.detail}</p>
                </div>
              ))}
            </div>

            <h2 id="comparatif">Autoréglable vs hygroréglable : tableau de décision</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Critère</th>
                    <th className="p-3 border-b border-sand-200">Autoréglable</th>
                    <th className="p-3 border-b border-sand-200">Hygroréglable</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARATIF_AUTO_HYGRO.map((c) => (
                    <tr key={c.critere} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{c.critere}</td>
                      <td className="p-3 text-amber-700">{c.auto}</td>
                      <td className="p-3 text-primary-700 font-semibold">{c.hygro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 id="install">Étapes d’installation</h2>
            <ol className="list-none p-0 my-6">
              {ETAPES_INSTALL.map((e, i) => (
                <li
                  key={e.step}
                  className="not-prose bg-white border border-sand-200 rounded-xl p-4 mb-3 flex gap-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-700 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-semibold text-sand-900 m-0 mb-1">
                      {e.step}
                    </h3>
                    <p className="text-sm text-sand-700 m-0">{e.detail}</p>
                  </div>
                </li>
              ))}
            </ol>

            <h2 id="aides">Aides 2026 pour la VMC simple flux</h2>
            <p>
              <strong>CEE Coup de pouce</strong> : 100-300 € (hygro), 50-200 € (auto basse conso).
              Mention <strong>RGE Qualibat 8721</strong> obligatoire. <strong>TVA 5,5 %</strong>{' '}
              automatique. Pas de MaPrimeRénov’ seule (sauf Parcours Accompagné). Astuce : cumuler
              avec isolation des combles ou changement chaudière pour bénéficier d’un{' '}
              <strong>bonus CEE bouquet</strong> (+ 30-50 % sur la prime).
            </p>

            <h2 id="cta">Trouvez un artisan RGE Qualibat 8721</h2>
            <div className="not-prose bg-primary-50 border border-primary-200 rounded-xl p-6 my-6">
              <p className="text-sand-900 m-0 mb-3">
                <Calculator className="inline w-5 h-5 text-primary-700 mr-1" aria-hidden />
                <strong>Devis VMC simple flux en 30 secondes</strong> — artisans certifiés RGE pour
                CEE + TVA 5,5 %.
              </p>
              <Link
                href="/devis"
                className="inline-flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white font-semibold px-5 py-3 rounded-lg transition"
              >
                Demander mon devis VMC <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
          </article>

          <PrixComparatif
            title="Prix VMC simple flux : autoréglable vs hygroréglable (posé clé en main 2026)"
            caption="Maison 100 m² en rénovation, RGE Qualibat 8721, TVA 5,5 % incluse. Sources : ADEME 2026, AFPAC, retours terrain devis."
            rows={[
              {
                brand: 'VMC simple flux autoréglable',
                priceRange: '500 - 1 200 €',
                notes: 'Débit fixe, entrée de gamme construction neuve',
                rating: 3.5,
              },
              {
                brand: 'VMC simple flux auto basse conso (EC)',
                priceRange: '700 - 1 800 €',
                notes: 'Moteurs EC -50 % conso élec, ROI 6-8 ans',
                rating: 4.0,
              },
              {
                brand: 'VMC simple flux hygroréglable A',
                priceRange: '900 - 2 200 €',
                notes: 'Bouches modulent humidité, économie 5-8 %',
                rating: 4.1,
              },
              {
                brand: 'VMC simple flux hygroréglable B',
                priceRange: '1 100 - 2 500 €',
                notes: "Bouches + entrées d'air modulent, économie 8-12 %",
                rating: 4.4,
                highlight: true,
              },
            ]}
            withSchema
          />

          <SimulateurAideBox
            serviceKey="vmc-simple-flux"
            estimatedSaving={300}
            subtitle="CEE Coup de pouce 100-300 € + TVA 5,5 % — éligibilité conditionnée à un artisan RGE Qualibat 8721"
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
    </>
  )
}
