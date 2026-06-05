import type { Metadata } from 'next'
import Link from 'next/link'
import { Warehouse, ArrowRight, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'veranda-prix-pose-m2'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Thomas Bernard'
const AUTHOR_SLUG = 'thomas-bernard'

export const revalidate = 86400

const TITLE = 'Véranda : prix m², pose, urbanisme 2026'
const DESCRIPTION =
  'Véranda 2026 : 1 200-3 000 € TTC/m² posée alu, 20 m² = 24 000-60 000 €, permis construire >20 m², RT2012, taxe aménagement.'

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
  'Prix 2026 TTC/m² posée : alu entrée de gamme 1 200-1 700 €, alu RT2012 2 000-2 500 €, bois 2 200-2 800 €, acier/fer 2 500-3 000 €.',
  'Urbanisme : DP si 5-20 m² emprise, permis construire si >20 m² OU hauteur >4 m OU porte à plus de 40 m² surface habitable totale.',
  'RT2012 applicable si surface chauffée ajoutée >50 m² ou extension >30 % habitation existante. Isolation thermique + étude thermique obligatoire.',
  'Taxe aménagement due : ~900-1 200 €/m² × 3-5 % commune + 1-2,5 % département. Véranda 20 m² = 900-1 800 € taxe.',
  'Garanties décennale (art. 1792) + biennale équipements + fabricant profils alu 10-25 ans. Qualibat 3751 véranda recommandé.',
]

const faqs = [
  {
    question: 'Quel prix pour une véranda au m² en 2026 ?',
    answer:
      'Prix 2026 TTC/m² posée (hors terrasse + raccordement) : (1) VÉRANDA ALU ENTRÉE DE GAMME non chauffée, vitrage simple 4/16/4 argon : 1 200-1 700 €/m² — extension non habitable, stockage/jardin d’hiver ; (2) VÉRANDA ALU RT2012 chauffée, rupture pont thermique, double vitrage 4/16/4 argon Low-E, Uw <1,6 : 2 000-2 500 €/m² ; (3) VÉRANDA BOIS (chêne, red cedar, iroko) : 2 200-2 800 €/m² — esthétique traditionnelle + inertie thermique + entretien saturateur bi-annuel ; (4) VÉRANDA ACIER/FER design victorien : 2 500-3 000 €/m² — patrimoine, haut de gamme ; (5) VÉRANDA PVC : 900-1 400 €/m² — déconseillée (esthétique médiocre, peu durable, jaunit 10-15 ans). Véranda 20 m² alu RT2012 : 40 000-50 000 €. Répartition coût typique : structure + toiture 45-55 %, vitrages 15-20 %, pose + maçonnerie 15-20 %, étanchéité + finitions 10-15 %. Frais cachés fréquents : dalle béton + fondations 80-150 €/m², raccordement électricité + chauffage 800-2 000 €, store intérieur 80-200 €/m², étude thermique RT2012 500-1 200 €.',
  },
  {
    question: 'Faut-il un permis de construire pour une véranda ?',
    answer:
      'Selon emprise au sol + hauteur + surface totale (art. R421-14 à R421-17 Code urba.) : (1) VÉRANDA <5 m² ET hauteur ≤12 m : AUCUNE formalité ; (2) VÉRANDA 5-20 m² emprise au sol, hauteur ≤12 m : DÉCLARATION PRÉALABLE DE TRAVAUX (DP) — instruction 1 mois ; (3) VÉRANDA >20 m² OU hauteur >12 m : PERMIS DE CONSTRUIRE obligatoire — instruction 2-3 mois ; (4) Si véranda porte surface habitable totale du logement à >150 m² après extension : RECOURS OBLIGATOIRE À UN ARCHITECTE (art. L431-3 CCH) ; (5) Zone ABF 500 m monument historique : avis conforme ABF obligatoire, peut imposer matériau + couleur + dimensions ; (6) Lotissement : respecter cahier des charges (souvent limite véranda, matériau imposé, alignement) ; (7) Copropriété : autorisation AG (modification parties communes potentielles) ; (8) PLU local : hauteur maxi, distance limite séparative 3 m minimum, emprise au sol limité. Non-respect = amende 6 000 €/m² (art. L480-4) + démolition. Demande en ligne service-public.fr ou mairie.',
  },
  {
    question: 'Quelles aides et fiscalité pour une véranda en 2026 ?',
    answer:
      '(1) MaPrimeRénov’ et CEE : PAS ÉLIGIBLES (véranda considérée agrandissement, pas amélioration énergétique isolée) sauf si intégrée dans bouquet rénovation globale maison ; (2) TVA 10 % art. 279-0 bis CGI résidence principale >2 ans (hors construction neuve TVA 20 %) ; (3) Éco-PTZ : inclus dans bouquet 3+ travaux si couplé isolation + chauffage ; (4) TAXE D’AMÉNAGEMENT : due pour véranda >5 m² — valeur forfaitaire 2026 ~945 €/m² × taux commune (1-5 %) + taux département (1-2,5 %). Véranda 20 m² × 945 € × 5 % commune + 2 % département = 20×945×7 % = 1 323 € ; (5) TAXE FONCIÈRE : augmentation car surface habitable augmente, déclaration au CADASTRE via formulaire H1 dans 90 jours après achèvement (art. 1406 CGI) ; (6) TAXE HABITATION (résidence secondaire) : idem augmentation ; (7) Exonération taxe aménagement : extensions <5 m² dispensées automatiquement. Budget fiscal total véranda 20 m² RT2012 : 1 300-1 800 € taxe aménagement + +50-150 €/an taxe foncière (selon commune).',
  },
  {
    question: 'RT2012 ou RT existant : quelle réglementation pour ma véranda ?',
    answer:
      'Applicabilité réglementation thermique selon cas (décret 2010-1269 + arrêté 26 octobre 2010) : (1) VÉRANDA CHAUFFÉE (raccordée chauffage central ou chauffage dédié >8°C maintenu) : soumise à RT2012 (si maison individuelle >50 m² nouvelle surface) ou RT existant (<50 m² extension) — ÉTUDE THERMIQUE obligatoire, attestation Bbio à joindre DP/PC ; (2) VÉRANDA NON CHAUFFÉE (jardin d’hiver, température libre) : AUCUNE obligation thermique — solution économique (+500-1 500 € vs RT2012), inhabitée hiver ; (3) Extension >30 % surface existante OU >50 m² chauffée : RT2012 complète (Uw <1,6 W/m²K vitrages, étanchéité <0,6 m³/h·m², système chauffage performant) ; (4) Extension <30 % et <50 m² : RT existant plus légère (Uw <2,0 W/m²K vitrages) ; (5) Véranda considérée bâtiment par simulation dynamique Thbce — bilan énergie élément par élément. Conséquences non-respect : sanctions pénales art. L111-13 CCH + retrait permis/DP + mise en conformité forcée + assurance refuse couverture si vice construction. Étude thermique 500-1 200 € par bureau certifié Effinergie.',
  },
  {
    question: 'Comment optimiser confort été d’une véranda ?',
    answer:
      'Véranda = risque serre +35-45°C en été si mal conçue. Solutions : (1) ORIENTATION : sud ou ouest = surchauffe extrême ; privilégier est ou nord pour maison froide ; (2) VITRAGE LOW-E OU CONTRÔLE SOLAIRE : facteur solaire Sw <0,3 (vitrage teinté ou pyrolytique) — ×10 protection vs standard 0,6 ; (3) STORES EXTÉRIEURS motorisés : -50 à -70 % chaleur avant vitrage (store banne ou screen), vs stores intérieurs -15 à -25 % seulement ; (4) TOITURE ISOLÉE opaque partielle (30-50 % surface) ou toiture végétalisée : -10 à -15°C ambiance ; (5) VENTILATION TRAVERSANTE : ouvrants opposés pour courant d’air naturel, ventilateurs plafond 80-200 W — remplace clim pour 80 % cas ; (6) BRISE-SOLEIL ORIENTABLE (lames alu sur toiture) : -40 % chaleur + lumière tamisée ; (7) CLIMATISATION : dernier recours, pompe à chaleur air/air réversible 3 000-6 000 € + CEE 100-300 €. Coût confort été bien conçu : +3 000-8 000 € vs véranda standard mais économie clim + usage toute saison. Inertie thermique sol (carrelage pierre 2 cm) : tampon thermique supplémentaire.',
  },
]

const sources = [
  {
    label: 'Art. R421-14 à R421-17 Code urba.',
    url: 'https://www.legifrance.gouv.fr',
  },
  { label: 'RT2012 — Arrêté 26 oct. 2010', url: 'https://www.legifrance.gouv.fr' },
  { label: 'Art. 1406 CGI — Déclaration cadastre', url: 'https://www.legifrance.gouv.fr' },
  { label: 'Qualibat 3751 — Véranda', url: 'https://www.qualibat.com' },
  { label: 'ADEME — Confort été', url: 'https://www.ademe.fr' },
]

const relatedGuides = [
  { label: 'Extension maison', href: '/guides/extension-maison' },
  { label: 'Permis construire', href: '/guides/permis-construire' },
  { label: 'Taxe aménagement calcul 2026', href: '/guides/taxe-amenagement-calcul-2026' },
  { label: 'Surélévation toiture prix', href: '/guides/surelevation-toiture-prix' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Extension',
    keywords: [
      'véranda prix m2',
      'véranda alu prix',
      'permis construire véranda',
      'RT2012 véranda',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Véranda', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Véranda' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Warehouse className="w-3.5 h-3.5" aria-hidden />
              Extension · Guide vérifié
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Véranda : prix au m² et pose 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Une véranda coûte 1 200-3 000 € TTC/m² posée selon le matériau (alu, bois, acier) et
              la performance thermique. Voici les prix 2026, l’urbanisme, la RT2012 et la fiscalité.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Prix vérandas 2026 posées au m²</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Type véranda</th>
                    <th className="p-3 border-b border-sand-200">Prix TTC/m²</th>
                    <th className="p-3 border-b border-sand-200">Usage</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Alu entrée de gamme', '1 200-1 700 €', 'Jardin d’hiver non chauffé'],
                    ['Alu RT2012 chauffée', '2 000-2 500 €', 'Pièce à vivre toute année'],
                    ['Bois (chêne, iroko)', '2 200-2 800 €', 'Esthétique traditionnelle'],
                    ['Acier style victorien', '2 500-3 000 €', 'Patrimoine haut de gamme'],
                    ['PVC (déconseillé)', '900-1 400 €', 'Petit budget seulement'],
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
              Trouver un pro véranda <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
