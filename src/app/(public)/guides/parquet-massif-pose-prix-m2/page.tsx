import type { Metadata } from 'next'
import Link from 'next/link'
import { Layers, ArrowRight, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'parquet-massif-pose-prix-m2'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Thomas Bernard'
const AUTHOR_SLUG = 'thomas-bernard'

export const revalidate = 86400

const TITLE = 'Parquet massif : prix au m², pose 2026'
const DESCRIPTION =
  'Parquet massif 2026 : 60-180 €/m² posé chêne/hêtre, contrecollé 45-130 €, stratifié 25-60 €, pose clouée/collée/flottante, DTU 51.1, TVA 10 %.'

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
  'Prix 2026 TTC/m² posé : stratifié 25-60 €, contrecollé chêne 45-130 €, massif chêne 80-150 €, massif exotique 120-180 €.',
  'Pose clouée (massif >21 mm) / collée (massif 14-21 mm et contrecollé) / flottante (contrecollé et stratifié sur sous-couche).',
  'DTU 51.1 (parquets massifs) et DTU 51.2 (parquets contrecollés) : taux humidité support <3 %, hygrométrie 40-60 %, joint dilatation.',
  'TVA 10 % résidence principale >2 ans. Pas d’aide directe — intégrable dans bouquet rénovation globale.',
  'Durée vie : massif 100+ ans (5-10 ponçages possibles), contrecollé 30-60 ans (1-3 ponçages), stratifié 15-25 ans (remplacement).',
]

const faqs = [
  {
    question: 'Quel prix au m² pour poser du parquet en 2026 ?',
    answer:
      'Prix 2026 TTC/m² fourniture + pose (hors support + plinthes) : (1) STRATIFIÉ AC4 6-8 mm pose flottante : 25-45 €/m² — passage fréquent résidentiel ; (2) STRATIFIÉ AC5 10-12 mm : 35-60 €/m² — robuste animaux/enfants ; (3) CONTRECOLLÉ chêne 14 mm couche d’usure 2,5 mm : 45-80 €/m² ; (4) CONTRECOLLÉ chêne 16 mm couche d’usure 4 mm : 70-130 €/m² ; (5) MASSIF chêne rabotté brut 14-20 mm : 80-130 €/m² ; (6) MASSIF chêne huilé/vitrifié 20-23 mm : 100-150 €/m² ; (7) MASSIF EXOTIQUE (ipé, wengé, merbau) 14-22 mm : 120-180 €/m². Répartition coût typique (massif chêne 120 € TTC/m²) : matière 60-80 €, plinthes/quarts ronds 5-10 €, sous-couche/colle 8-15 €, pose 30-50 € (clouée +10-15 € vs collée), ponçage + finition (massif brut) 25-40 €. Frais cachés : ragréage support 15-30 €/m², dépose ancien revêtement 8-20 €/m², jeu tour de porte 3-8 €/m².',
  },
  {
    question: 'Parquet massif, contrecollé ou stratifié : que choisir ?',
    answer:
      'Comparatif 3 familles 2026 : (1) MASSIF — bois pur unique essence, durée vie 100+ ans, 5-10 ponçages possibles (usure 0,3-0,5 mm/ponçage sur couche 20 mm), patine unique, valorisation patrimoine +5-10 % vs contrecollé, MAIS prix élevé 80-180 €/m², incompatible PLANCHER CHAUFFANT (dilatation), mouvements hygrométriques importants ; (2) CONTRECOLLÉ (3 couches : parement bois noble 2,5-4 mm + contreplaqué + latté) — esthétique identique massif, couche d’usure 1-3 ponçages possibles, durée 30-60 ans, compatible plancher chauffant basse température, dilatation maîtrisée, 45-130 €/m² ; (3) STRATIFIÉ — panneau HDF + décor imprimé + surcouche résine, non-bois (imitation), prix imbattable 25-60 €/m², anti-rayures AC4/5, résistant animaux/enfants, MAIS remplacement complet si usure (pas de ponçage), chaleur au toucher médiocre, résonance sonore ; (4) VINYLE CLIC ou LVT : alternative récente, étanche salle de bain, 35-70 €/m². Recommandation : budget + chambre/passage fort = stratifié AC5 ; qualité-prix + plancher chauffant = contrecollé 14 mm ; patrimoine + séjour valorisé = massif chêne.',
  },
  {
    question: 'Pose clouée, collée ou flottante : laquelle choisir ?',
    answer:
      '3 méthodes avec contraintes techniques : (1) POSE CLOUÉE (traditionnelle) — uniquement MASSIF ≥21 mm, clouage ou vissage sur lambourdes bois (entraxe 45 cm max), permet dilatation libre, idéal rénovation sol ancien + nette amélioration acoustique (vide d’air absorbe), MAIS surépaisseur 5-8 cm + plus cher (+10-15 €/m² vs collée), incompatible plancher chauffant ; (2) POSE COLLÉE (méthode la plus courante massif + contrecollé moderne) — sur chape béton plane (ragréage souvent nécessaire), colle MS polymère ou polyuréthane (8-15 €/m²), fixité maximale, compatible plancher chauffant (contrecollé 14 mm), surépaisseur faible 14-22 mm, résistance choc optimale ; (3) POSE FLOTTANTE — stratifié, contrecollé, vinyle clic sur sous-couche isolante 2-5 mm (film polyéthylène + mousse), lames clipsées entre elles sans fixation au sol, dépose facile, coût réduit, MAIS résonance sonore ++ (surtout stratifié), incompatible massif épais, joint dilatation périphérique 8-10 mm obligatoire DTU 51.11 ; (4) Humidité support critique : dalle béton <3 % (protimètre), ancien revêtement bien nettoyé, surface plane ±3 mm/2 m (règle 2 m).',
  },
  {
    question: 'Le parquet est-il compatible avec plancher chauffant ?',
    answer:
      'Oui SOUS CONDITIONS strictes : (1) TYPE DE PARQUET — CONTRECOLLÉ OBLIGATOIRE 10-14 mm (contrainte dilatation), massif INCOMPATIBLE (sauf rares massifs spécifiques comme chêne tranché 10-14 mm certifié) ; (2) ESSENCE — chêne, acacia, robinier adaptés ; exotiques (bambou, wengé) peu adaptés (instabilité dimensionnelle) ; (3) POSE — COLLÉE IMPÉRATIVE avec colle PU souple (pas flottante qui amplifie résonance chaleur), conducteur thermique optimal ; (4) TEMPÉRATURE DE SURFACE : 28°C maximum au sol (DTU 65.14), bois exige mise en chauffe progressive 1-2 semaines avant pose + 48h après pose ; (5) RÉSISTANCE THERMIQUE parquet doit être <0,15 m²K/W (<10 mm bois) ; (6) DILATATION 8-10 mm périphérique + joints tous 40 m² ou toutes 8 m longueur ; (7) FINITION : vernis polyuréthane ou huile dure (pas cire, craquelle chaleur) ; (8) HYGROMÉTRIE maintenue 40-60 % (humidificateur conseillé hiver chauffage puissant). Non-respect = fentes, tuilage, décollement, garantie fabricant annulée + décennale compromise.',
  },
  {
    question: 'Quel entretien pour un parquet sur 10 ans ?',
    answer:
      'Programme entretien par type : (1) STRATIFIÉ — aspirateur + serpillière essorée (jamais eau stagnante), produits pH neutre spécifiques stratifié, rayures impossibles à réparer (remplacement lame) ; (2) CONTRECOLLÉ VITRIFIÉ — même entretien courant stratifié + vernis renouvelé tous 8-12 ans (ponçage léger + 2 couches vitrificateur polyuréthane 25-40 €/m²), 1-3 ponçages possibles sur durée vie ; (3) CONTRECOLLÉ HUILÉ — dépoussiérage + balai humide, huile d’entretien 1-2 fois/an (produit spécifique 10-15 €/L pour 30-40 m²), saturateur tous 5-10 ans (60-120 €/m² rénovation complète) ; (4) MASSIF VITRIFIÉ — ponçage + vitrification tous 10-20 ans (70-120 €/m² pose pro) permet 5-10 cycles sur 100+ ans durée vie ; (5) MASSIF HUILÉ — huile d’entretien 1-2x/an, nourrissage profond tous 3-5 ans, grand ponçage optionnel 20-30 ans ; (6) PIÈGES : éviter détergents forts (alcali, chlore), eau stagnante, objets pointus sans feutres (chaises), animaux griffes non coupées (40 % rayures). Réparations localisées : mastic à bois teinté 5-15 €, ponçage ciblé coût main d’œuvre 60-100 €/h artisan.',
  },
]

const sources = [
  {
    label: 'DTU 51.1 — Parquet massif',
    url: 'https://www.cstb.fr',
  },
  { label: 'DTU 51.2 — Parquet contrecollé', url: 'https://www.cstb.fr' },
  { label: 'DTU 65.14 — Plancher chauffant', url: 'https://www.cstb.fr' },
  { label: 'Art. 279-0 bis CGI — TVA 10 %', url: 'https://www.legifrance.gouv.fr' },
  { label: 'FSC France — Bois durable', url: 'https://fr.fsc.org' },
]

const relatedGuides = [
  { label: 'Prix carrelage pose m²', href: '/guides/prix-carrelage-pose-m2' },
  { label: 'Prix rénovation maison 100m²', href: '/guides/prix-renovation-maison-100m2' },
  { label: 'Garantie décennale', href: '/guides/garantie-decennale' },
  { label: 'Rénovation salle de bain', href: '/guides/renovation-salle-de-bain' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Revêtement',
    keywords: [
      'parquet massif prix m2',
      'parquet contrecollé pose',
      'DTU 51.1 parquet',
      'parquet plancher chauffant',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Parquet massif', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Parquet massif' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Layers className="w-3.5 h-3.5" aria-hidden />
              Revêtement · Guide vérifié
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Parquet massif : prix au m² 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Un parquet coûte 25-180 € TTC/m² posé selon la nature (stratifié, contrecollé, massif)
              et la pose (clouée, collée, flottante). Voici les prix 2026, les DTU, la compatibilité
              plancher chauffant et l’entretien.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Prix parquets posés 2026 au m²</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Type</th>
                    <th className="p-3 border-b border-sand-200">Prix TTC/m²</th>
                    <th className="p-3 border-b border-sand-200">Durée vie</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Stratifié AC4 6-8 mm', '25-45 €', '15-20 ans'],
                    ['Stratifié AC5 10-12 mm', '35-60 €', '20-25 ans'],
                    ['Contrecollé chêne 14 mm', '45-80 €', '30-50 ans'],
                    ['Contrecollé chêne 16 mm', '70-130 €', '40-60 ans'],
                    ['Massif chêne brut', '80-130 €', '100+ ans'],
                    ['Massif chêne vitrifié', '100-150 €', '100+ ans'],
                    ['Massif exotique', '120-180 €', '100+ ans'],
                  ].map(([t, p, d]) => (
                    <tr key={t} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{t}</td>
                      <td className="p-3 font-semibold">{p}</td>
                      <td className="p-3">{d}</td>
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
              Trouver un menuisier poseur <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
