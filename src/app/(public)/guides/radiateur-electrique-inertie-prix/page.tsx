/**
 * /guides/radiateur-electrique-inertie-prix — Hub radiateur électrique inertie
 *
 * @kw-primary    radiateur électrique basse consommation
 * @kw-volume     1300
 * @kw-kd         0
 * @kw-cpc        16
 * @kw-secondary  radiateur inertie prix, radiateur électrique économique
 * @cluster       6 (chauffage électrique / régulation)
 * @intent        commercial (prix + économie)
 * @ahrefs-source docs/audit-ahrefs-2026-05-03/keyword_opportunities_2026-05.csv:12
 * @snapshot      2026-05-13 (chantier #12 KW commerciaux vague 2)
 *
 * Optimisation 2026-05-13 :
 *   Title élargi pour capter aussi "radiateur électrique basse consommation".
 *   Sonergia rang 5 = striking distance.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { Thermometer, ArrowRight, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'radiateur-electrique-inertie-prix'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Marc Lefebvre'
const AUTHOR_SLUG = 'marc-lefebvre'

export const revalidate = 86400

// Title élargi pour capter "radiateur électrique basse consommation" (1 300 vol,
// KD 0) en plus de "radiateur inertie prix". Sonergia rang 5 = striking distance.
const TITLE = 'Radiateur électrique basse consommation 2026 : inertie, prix, pose'
const DESCRIPTION =
  'Radiateur électrique basse consommation 2026 : inertie fluide 350-700 €, fonte/céramique 600-1 400 € posé. Économie 15-25 % vs convecteur. Pilotage Wi-Fi + CEE 200-400 €.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: getAlternates(`/guides/${SLUG}`),
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
  'Prix 2026 TTC posé par radiateur : convecteur bas de gamme 150-300 €, inertie fluide 350-700 €, inertie fonte/céramique 600-1 400 €.',
  'Puissance : 100 W/m² maison RT2005, 80 W/m² RT2012, 60 W/m² BBC — salon 25 m² RT2012 = 2 000 W (radiateur 1 500 W + appoint).',
  'Inertie sèche (fonte, céramique, pierre) : stockage chaleur massif, diffusion longue, confort maximal. Plus cher mais +15-25 % économies vs convecteur.',
  'Pilotage connecté Wifi/Zigbee (NF ELEC 60335) : MaPrime CEE 200-400 € (pilotage classe A) + économies 15-25 %.',
  'Installation ÉLECTRICIEN habilitation BR (230 V) obligatoire NF C 15-100. Pas d’aide MaPrimeRénov (électrique exclu bouquet).',
]

const faqs = [
  {
    question: 'Quel prix pour un radiateur électrique installé en 2026 ?',
    answer:
      'Prix 2026 TTC fourniture + pose par radiateur (puissance 1 500 W standard) : (1) CONVECTEUR BAS DE GAMME "grille-pain" : 150-300 € — DÉCONSEILLÉ, effet peau sèche, variations température, consommation +30-50 % vs inertie ; (2) PANNEAU RAYONNANT : 250-450 € — mieux que convecteur mais ambiance localisée ; (3) INERTIE FLUIDE (huile minérale, eau glycolée) : 350-700 € — bon compromis, chauffe moyenne, confort correct ; (4) INERTIE SÈCHE FONTE : 600-1 000 € — masse 15-35 kg, stockage + diffusion lente, confort proche chauffage central ; (5) INERTIE SÈCHE CÉRAMIQUE STÉATITE (Acova, Atlantic, Sauter Madison) : 700-1 200 € — haut de gamme, inertie maximale, design premium ; (6) INERTIE PIERRE VOLCANIQUE OU GRANIT : 900-1 400 € — très haut de gamme, noria 30-80 kg pierre ; (7) RADIATEUR À CHALEUR DOUCE CONNECTÉ (programmation avancée + détection ouverture fenêtre + sonde Wifi) : +150-300 € surcoût base inertie. Répartition coût typique (inertie fonte 800 € posé) : radiateur 600-650 €, pose + branchement 120-180 €, accessoires 30-50 €. Frais cachés : création circuit dédié 200 €/radiateur si gros travaux élec, rehausse tableau disjoncteur 300-500 €, délestage 150-250 €.',
  },
  {
    question: 'Quel type de radiateur inertie choisir ?',
    answer:
      'Comparatif technologies inertie 2026 : (1) INERTIE FLUIDE CALOPORTEUR (huile minérale basse viscosité, eau glycolée) : corps chauffe liquide traversant ailettes alu, chauffe rapide 15-25 min, inertie modérée 30-60 min, prix 350-700 € accessible, MAIS risque fuite fluide long terme (5 % cas après 10 ans), remplacement complet radiateur ; (2) INERTIE SÈCHE FONTE : bloc fonte 15-35 kg autour résistance, chauffe 25-40 min mais inertie 1-3h, durée vie 25-40 ans (pas de fluide qui peut fuir), 600-1 000 €, poids +15 kg nécessitant fixation renforcée ; (3) INERTIE SÈCHE CÉRAMIQUE (stéatite, brique réfractaire, marbre) : 20-40 kg pierre stockage maximum, chauffe 30-45 min, inertie 2-4h, prestige design, 700-1 200 €. Confort comparable chauffage central type radiateur fonte classique ; (4) INERTIE DOUBLE CORPS (fluide + façade rayonnante) : compromis chauffe rapide (façade) + inertie (fluide), 500-900 €, bon compromis pièces usage variable ; (5) Règle 2026 : pièce usage principal (salon, chambre principale, bureau) = inertie sèche fonte/céramique (confort + économies) ; chambre amis, couloir, salle de bain = fluide ou rayonnant (usage ponctuel).',
  },
  {
    question: 'Quelle puissance choisir pour un radiateur électrique ?',
    answer:
      'Dimensionnement précis selon surface + isolation + hauteur (norme RT2012) : (1) FORMULE STANDARD : puissance (W) = surface (m²) × hauteur (m) × coeff isolation + perte vitrage ; (2) COEFFICIENTS ISOLATION 2026 : (a) MAISON RT2005 ou antérieure = 100-130 W/m² ; (b) MAISON RT2012 = 60-80 W/m² ; (c) MAISON BBC / RT2020 = 40-60 W/m² ; (d) PASSOIRE ÉNERGÉTIQUE CLASSE F/G = 130-180 W/m² ; (3) EXEMPLES : (a) salon 25 m² RT2012 hauteur 2,50 m : 25 × 2,50 × 80 = 5 000 W mais diviser en 2 radiateurs (3 000 W + 2 000 W) pour confort ; (b) chambre 12 m² RT2012 : 12 × 2,50 × 80 = 2 400 W mais souvent 1 500 W suffit (usage ponctuel, température plus basse) ; (c) salle de bain 6 m² : 6 × 2,50 × 100 = 1 500 W (température plus élevée nécessaire) ; (4) CORRECTIONS : +10 % si plafond >2,70 m, +20 % pièce nord, +10-15 % si grandes baies vitrées, -10 % si chauffage adjacent (mur intérieur partagé) ; (5) SOUS-DIMENSIONNEMENT = consommation +30-50 % (chauffe en continu) + inconfort. SUR-DIMENSIONNEMENT = cycles courts + usure compresseur + consommation +10-15 %. Règle conservative : calcul puis +10 %.',
  },
  {
    question: 'Quelles aides pour remplacer ses radiateurs en 2026 ?',
    answer:
      'Aides 2026 LIMITÉES (électrique pas prioritaire rénovation énergétique) : (1) MaPrimeRénov : radiateur électrique SEUL EXCLU (décret 2022-1649 réserve au chauffage à haute performance énergétique type PAC, chaudière biomasse). Seule EXCEPTION = parcours accompagné si remplacement chauffage dans bouquet travaux (isolation + VMC) ; (2) CEE COUP DE POUCE PILOTAGE CHAUFFAGE : 200-400 € si thermostat connecté programmable couplé à radiateurs classe A (NF Electricité Performance 3 étoiles) — par fournisseur énergie, tous ménages ; (3) TVA 10 % art. 279-0 bis CGI résidence principale >2 ans (pas 5,5 % sauf si classe A performance + rénovation globale) ; (4) ÉCO-PTZ : INCLUS si bouquet rénovation globale 3+ travaux (pas seul) ; (5) CRÉDIT D’IMPÔT AUTONOMIE seniors/PMR art. 200 quater A : 25 % plafonné 5 000 € sur 5 ans — équipements aide adaptation ; (6) AIDES LOCALES : certaines régions prime rénovation petite (300-800 €). Total économie ménage standard remplacement 6 radiateurs inertie 4 000 € : 400 CEE + TVA avantage 240 € = 640 € = reste à charge 3 360 €. Comparaison : remplacer chauffage GLOBAL par PAC air/eau = 8 000-12 000 € aides (MPR + CEE + TVA 5,5 %) sur 14 000 € = reste à charge 4 000 €. Donc si isolation correcte + budget = PAC >> radiateurs électriques.',
  },
  {
    question: 'Qui peut installer des radiateurs électriques ?',
    answer:
      'Obligations techniques NF C 15-100 (édition juillet 2016 modifiée 2019) : (1) ÉLECTRICIEN HABILITATION BR indispensable (art. R4544-9 Code travail) pour tout travail 230 V — l’autoconstructeur peut installer un radiateur SUR PRISE EXISTANTE mais création circuit neuf = PRO obligatoire ; (2) CIRCUIT DÉDIÉ : radiateur >3 000 W = circuit dédié 32 A (pas partage autres appareils). Circuits 20 A 2,5 mm² carré couvre 4 500 W total (3 radiateurs 1 500 W OK) ; (3) PROTECTION : disjoncteur 20 A dédié + différentiel 30 mA type AC minimum (type F recommandé 2026 pour meilleur détection défaut) ; (4) FIL PILOTE (7e fil) : obligatoire nouvelle installation depuis 2002 — permet pilotage centralisé thermostat + délestage automatique + programme ; (5) INSTALLATION : hauteur 10-15 cm sol + 15 cm plafond, pas derrière meuble (ventilation), pas face rideau long (feu) ; (6) ATTESTATION CONSUEL obligatoire neuf ou rénovation lourde — sinon Enedis refuse raccordement ; (7) AUTOCONSTRUCTION LÉGALE : branchement sur prise existante (mais prise souvent sous-dimensionnée pour radiateur puissant) — câblage neuf réservé pro. Assurance habitation exige facture pro + Consuel pour sinistre ; (8) GARANTIES : biennale 2 ans sur radiateur (art. 1792-3) + fabricant Atlantic/Thermor/Sauter/Noirot 2-10 ans. Conserver facture + schéma électrique.',
  },
]

const sources = [
  {
    label: 'NF C 15-100 — Installation BT',
    url: 'https://www.afnor.org',
  },
  { label: 'NF EN 60335-2-30 — Radiateurs', url: 'https://www.afnor.org' },
  { label: 'NF Electricité Performance', url: 'https://www.certita.fr' },
  { label: 'Qualifelec — Certification élec', url: 'https://www.qualifelec.fr' },
  { label: 'ADEME — Chauffage électrique', url: 'https://www.ademe.fr' },
]

const relatedGuides = [
  { label: 'Normes électriques NF C 15-100', href: '/guides/normes-electriques' },
  { label: 'Prix électricien heure 2026', href: '/guides/prix-electricien-heure-2026' },
  {
    label: 'Climatisation réversible prix pose',
    href: '/guides/climatisation-reversible-prix-pose',
  },
  { label: 'Domotique installation smart home', href: '/guides/domotique-installation-smart-home' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Chauffage',
    keywords: [
      'radiateur électrique prix',
      'radiateur inertie fonte céramique',
      'puissance radiateur',
      'installation radiateur NF C 15-100',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Radiateur inertie', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Radiateur inertie' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Thermometer className="w-3.5 h-3.5" aria-hidden />
              Chauffage · Guide vérifié
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Radiateur électrique basse consommation 2026 : inertie, prix et pose
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Un radiateur inertie coûte 350-1 400 € TTC posé selon la technologie (fluide, fonte,
              céramique). Voici les prix 2026, le dimensionnement puissance, les aides CEE et la
              norme NF C 15-100.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Prix radiateurs électriques 2026 posés</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Type</th>
                    <th className="p-3 border-b border-sand-200">Prix TTC posé</th>
                    <th className="p-3 border-b border-sand-200">Confort</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Convecteur (à éviter)', '150-300 €', 'Basique + consommation'],
                    ['Panneau rayonnant', '250-450 €', 'Moyen, ponctuel'],
                    ['Inertie fluide', '350-700 €', 'Correct'],
                    ['Inertie fonte', '600-1 000 €', 'Très bon'],
                    ['Inertie céramique stéatite', '700-1 200 €', 'Excellent haut de gamme'],
                    ['Inertie pierre volcanique', '900-1 400 €', 'Premium prestige'],
                  ].map(([t, p, c]) => (
                    <tr key={t} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{t}</td>
                      <td className="p-3 font-semibold">{p}</td>
                      <td className="p-3">{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
          <FlagshipFaq items={faqs} />
          <FlagshipSources sources={sources} />
          <section className="my-10">
            <h2 className="font-heading text-xl font-semibold text-sand-900 mb-4">À lire aussi</h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {relatedGuides.map((g) => (
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
          <div className="flex items-center justify-between text-sm text-sand-600 border-t border-sand-200 pt-4">
            <Link href="/guides" className="inline-flex items-center gap-1 hover:text-primary-700">
              ← Tous les guides
            </Link>
            <Link
              href="/services/electricien"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un électricien <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
