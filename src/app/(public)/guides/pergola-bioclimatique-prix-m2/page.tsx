import type { Metadata } from 'next'
import Link from 'next/link'
import { Umbrella, ArrowRight, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'pergola-bioclimatique-prix-m2'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Thomas Bernard'
const AUTHOR_SLUG = 'thomas-bernard'

export const revalidate = 86400

const TITLE = 'Pergola bioclimatique : prix au m², pose 2026'
const DESCRIPTION =
  'Pergola bioclimatique 2026 : prix 350-900 € TTC/m² alu motorisée lames orientables, pergola adossée 20 m² = 7 000-18 000 €, DP mairie obligatoire, Qualibat 3751 recommandé, garantie décennale.'

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
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
  'Prix 2026 TTC/m² posée : pergola bois adossée 200-400 €, pergola alu toile 250-500 €, pergola BIOCLIMATIQUE alu lames orientables 350-900 €.',
  'Pergola 20 m² : bois 4 000-8 000 €, alu classique 5 000-10 000 €, bioclimatique 7 000-18 000 €, îlot autoporté +20-30 %.',
  'Urbanisme : aucune si pergola amovible non fixée ; DP si fixée au sol/mur >5 m² emprise ; PC si >20 m² OU fermée.',
  'Bioclimatique = lames orientables motorisées 0-135° via télécommande/météo, auto-fermeture pluie, auto-ombrage soleil.',
  'Garanties : décennale 10 ans sur structure (art. 1792) + biennale 2 ans moteurs + fabricant profils 5-15 ans (Biossun, Gibus, Renson).',
]

const faqs = [
  {
    question: 'Quel prix pour une pergola bioclimatique en 2026 ?',
    answer:
      'Prix 2026 TTC/m² posée (hors dalle béton) : (1) PERGOLA BIOCLIMATIQUE ALU ENTRÉE DE GAMME lames fixes 3/6/9° + moteur simple : 350-500 €/m² — première gamme Chinoise/Turque, 3-5 ans garantie ; (2) PERGOLA BIOCLIMATIQUE ALU MILIEU DE GAMME Gibus, Biossun lames motorisées orientables 0-135° + télécommande : 500-700 €/m² — standard qualité européenne ; (3) PERGOLA BIOCLIMATIQUE HAUT DE GAMME Renson, Corradi, Markilux lames aluminium extrudé + éclairage LED + chauffage infrarouge + domotique : 700-900 €/m² — 10-15 ans garantie ; (4) Îlot AUTOPORTÉ (4 poteaux) : +20-30 % vs adossée ; (5) Stores latéraux screen ajoutés : +150-350 €/m² latéral ; (6) Vitrage latéraux coulissants : +400-800 €/m² latéral. Pergola bioclimatique 20 m² adossée milieu gamme = 10 000-14 000 €. Répartition coût typique (pergola 20 m² 12 000 €) : structure + lames 40-45 %, moteur + domotique 15-20 %, pose + fixation 15-20 %, dalle béton 10-15 %, raccordement élec 5-10 %. Frais cachés : dalle béton 80-150 €/m², branchement élec 300-800 €, éclairage LED +80-200 €/m², chauffage infrarouge +150-400 €/m².',
  },
  {
    question: 'Pergola bioclimatique ou pergola toile : que choisir ?',
    answer:
      'Comparatif 2 technologies : (1) PERGOLA TOILE RÉTRACTABLE (store banne fixe sous toiture) — 250-500 €/m², toile acrylique ou micro-perforée PVC, usage 5-10 ans, protection soleil + pluie (toile type Soltis 4002 imperméable), MAIS toile se salit + déchire + remplacement 300-600 €/m² tous 8-12 ans, confort thermique sous toile = effet serre si soleil puissant (50°C+) ; (2) PERGOLA BIOCLIMATIQUE lames alu orientables : 350-900 €/m², lames aluminium 18-28 cm × 2-4 m rotation 0-135°, confort thermique supérieur (ventilation contrôlée), auto-fermeture pluie + soleil, éclairage LED intégrable, durée vie 20-30 ans, MAIS investissement initial ×1,5-2 vs toile, nécessite moteur + domotique (point faible, SAV), motorisation batterie secours panne élec. Règle : usage estival ponctuel + budget serré = toile ; usage toute saison + confort premium + valorisation patrimoine = bioclimatique. Bioclimatique amortie 8-12 ans via économie store remplacement + éviction climatiseur.',
  },
  {
    question: 'Quelle autorisation urbanisme pour une pergola ?',
    answer:
      'Selon fixation + emprise + ouverture (art. R421-1 à R421-17 Code urba.) : (1) PERGOLA AMOVIBLE POSÉE AU SOL SANS FIXATION (parasol déporté, pergola démontable pieds bâchés) : AUCUNE formalité, mais attention vent (fixation lestée impérative) ; (2) PERGOLA FIXÉE (ancrage dalle/mur) <5 m² : AUCUNE formalité ; (3) PERGOLA FIXÉE 5-20 m² emprise : DÉCLARATION PRÉALABLE DE TRAVAUX (DP) — Cerfa 13703, 1 mois instruction ; (4) PERGOLA FIXÉE >20 m² OU FERMÉE (vitrage latéraux permanents = véranda) : PERMIS DE CONSTRUIRE — 2-3 mois instruction ; (5) Zone ABF 500 m monument historique ou site classé : DP/PC + avis conforme ABF, peut imposer dimensions, couleurs, matériaux ; (6) Copropriété (terrasse privative) : autorisation AG si modifie aspect extérieur immeuble (art. 25 loi 10 juillet 1965) ; (7) PLU spécifique : hauteur max (3-3,5 m souvent), distance limite 3 m, emprise au sol limitée. Non-respect = amende 6 000 €/m² (art. L480-4 Code urba.) + retrait pergola. Conseil : consulter service urbanisme mairie AVANT achat, certains PLU interdisent pergolas fixées.',
  },
  {
    question: 'Quelles fonctions d’une pergola bioclimatique ?',
    answer:
      'Automatisation + confort modulable : (1) LAMES ORIENTABLES 0-135° : fermées = protection pluie imperméable (évacuation eau par chenaux latéraux), ouvertes 30-45° = ombrage partiel + ventilation naturelle, ouvertes 90° = ciel ouvert pour astronomie/soleil direct ; (2) CAPTEUR PLUIE automatique : ferme lames détection 5 gouttes/min, évite dégât terrasse/intérieur ; (3) CAPTEUR VENT anémomètre : ouvre lames verticalement >50 km/h pour laisser passer rafales (évite décollement) ; (4) CAPTEUR LUMIÈRE : oriente lames selon course soleil pour maintenir ombre sans bloquer ciel ; (5) ÉCLAIRAGE LED périphérique ou intégré lames : 12-40 W/m², ambiance + sécurité, dimmable ; (6) CHAUFFAGE INFRAROUGE radiants plafond 1,5-3 kW : usage prolongé mi-saison (-5°C à +15°C) ; (7) DOMOTIQUE : intégration Somfy Tahoma, Apple HomeKit, Google Home, Alexa ; (8) HAUT-PARLEURS Bluetooth intégrés : +300-800 €. Options premium : moustiquaire latérale motorisée 250-500 €/m² latéral, stores vitrage verticaux, rideau bioclimatique façade.',
  },
  {
    question: 'Quelles garanties et entretien pour une pergola ?',
    answer:
      'Garanties légales (pose par artisan RGE Qualibat 3751) : (1) Parfait achèvement 1 an (art. 1792-6 Code civil) ; (2) Biennale 2 ans (art. 1792-3) : moteurs, capteurs, télécommande, LED ; (3) Décennale 10 ans (art. 1792) : structure alu, ancrages, chenaux évacuation eau ; (4) Fabricant profils alu : 5-15 ans Biossun, 10 ans Gibus, 15 ans Corradi haut de gamme, 2-5 ans marques asiatiques bas de gamme. Entretien : (a) Nettoyage lames + joints 2x/an (eau savonneuse + éponge non abrasive, spray silicone joints) ; (b) Vérif graissage axes lames annuel (graisse silicone neutre, pas lithium corrosive alu) ; (c) Vérif évacuation chenaux eau 1x/an (feuilles mortes, mousse) ; (d) Contrôle moteur + capteurs annuel (80-150 € contrat pro) ; (e) Changement batterie capteurs sans fil tous 2-3 ans (pile AA lithium ou panneau solaire). Pannes fréquentes : détérioration joint silicone (étanchéité dégradée après 5-8 ans), corrosion axes si bord mer (traitement A4 recommandé côtier), oxydation connectique (gel silicone annuel). Conserver facture + certificat Qualibat 3751 pour activation garanties décennale + fabricant.',
  },
]

const sources = [
  {
    label: 'Art. R421-1 à R421-17 Code urba.',
    url: 'https://www.legifrance.gouv.fr',
  },
  { label: 'Art. 1792 Code civil — Décennale', url: 'https://www.legifrance.gouv.fr' },
  { label: 'Qualibat 3751 — Véranda pergola', url: 'https://www.qualibat.com' },
  { label: 'ADEME — Confort été', url: 'https://www.ademe.fr' },
  { label: 'SYPROS — Pergolas professionnels', url: 'https://www.sypros.fr' },
]

const relatedGuides = [
  { label: 'Véranda prix pose m²', href: '/guides/veranda-prix-pose-m2' },
  { label: 'Terrasse bois composite prix m²', href: '/guides/terrasse-bois-composite-prix-m2' },
  { label: 'Déclaration préalable travaux', href: '/guides/declaration-prealable-travaux' },
  { label: 'Taxe aménagement calcul 2026', href: '/guides/taxe-amenagement-calcul-2026' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Extérieur',
    keywords: [
      'pergola bioclimatique prix',
      'pergola alu lames orientables',
      'DP pergola',
      'pergola Biossun Gibus Renson',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Pergola bioclimatique', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Pergola bioclimatique' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Umbrella className="w-3.5 h-3.5" aria-hidden />
              Extérieur · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Pergola bioclimatique : prix au m² 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Une pergola bioclimatique coûte 350-900 € TTC/m² posée en alu lames orientables. Voici
              les prix 2026, l’urbanisme, les fonctions automatisées et les garanties décennales.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Prix pergolas 2026 posées au m²</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Type pergola</th>
                    <th className="p-3 border-b border-sand-200">Prix TTC/m²</th>
                    <th className="p-3 border-b border-sand-200">Usage</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Bois adossée simple', '200-400 €', 'Budget écologique'],
                    ['Alu + toile rétractable', '250-500 €', 'Usage estival'],
                    ['Bioclimatique alu entrée', '350-500 €', 'Lames fixes ou moteur simple'],
                    ['Bioclimatique milieu gamme', '500-700 €', 'Motorisée + télécommande'],
                    ['Bioclimatique haut de gamme', '700-900 €', 'LED + domotique + chauffage'],
                  ].map(([t, p, u]) => (
                    <tr key={t} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{t}</td>
                      <td className="p-3 font-semibold">{p}</td>
                      <td className="p-3">{u}</td>
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
              href="/services/menuisier"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un poseur pergola <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
