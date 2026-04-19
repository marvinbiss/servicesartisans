import type { Metadata } from 'next'
import Link from 'next/link'
import { Fan, ArrowRight, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'ventilation-double-flux-prix'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Jean-Pierre Duval'
const AUTHOR_SLUG = 'jean-pierre-duval'

export const revalidate = 86400

const TITLE = 'VMC double flux : prix, pose, aides 2026'
const DESCRIPTION =
  'VMC double flux 2026 : prix 4 500-12 000 € TTC posée maison 100-150 m², rendement 85-95 %, MaPrimeRénov 1 500-4 000 €, CEE 800-2 000 €, installation RGE Qualibat 5411 obligatoire pour aides.'

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
  'VMC double flux = récupère chaleur air extrait pour préchauffer air neuf. Rendement 85-95 % (vs simple flux 0 %).',
  'Prix 2026 TTC posée : 4 500-7 000 € maison 100 m² RT2012, 7 000-12 000 € réno lourde 150 m², +2 000-4 000 € si gaines encastrables.',
  'Aides : MaPrimeRénov 1 500-4 000 € (selon ressources), CEE 800-2 000 €, TVA 5,5 % RP >2 ans, éco-PTZ jusqu’à 15 000 €.',
  'Installation RGE Qualibat 5411 (ventilation) obligatoire pour aides. DTU 68.3 (novembre 2013) à respecter : débits, étanchéité réseau.',
  'Entretien 2-3 ans : changement filtres (30-60 €/an) + nettoyage échangeur. Non-entretien = perte rendement 30-50 % + mousse.',
]

const faqs = [
  {
    question: 'Quel prix pour installer une VMC double flux en 2026 ?',
    answer:
      'Prix 2026 TTC posée fourniture + pose gaines + bouches : (1) Maison neuve 100 m² RT2012 (gaines intégrées dans cloisons) : 4 500-6 000 € — pose optimale ; (2) Maison neuve 150 m² : 6 000-7 500 € ; (3) RÉNOVATION 100 m² (gaines apparentes ou combles) : 6 000-8 500 € — compromis esthétique ; (4) RÉNOVATION LOURDE 100 m² avec faux-plafonds + encastrement gaines : 8 000-11 000 € ; (5) Rénovation 150 m² encastrée : 9 000-12 000 € + ; (6) VMC double flux THERMODYNAMIQUE (couplée PAC air/air) : 10 000-16 000 € — rare en résidentiel. Répartition coût typique (maison 100 m² rénovation 7 500 €) : caisson échangeur 1 500-2 500 €, gaines isolées 1 200-1 800 €, bouches (6-8) 200-400 €, pose + mise service 3 500-4 500 €, régulation + sondes 400-800 €. Frais cachés : percement murs porteurs 200-500 €, insufflation combles 300-600 €, raccordement élec dédié 150-300 €.',
  },
  {
    question: 'VMC simple flux ou double flux : que choisir ?',
    answer:
      'Comparatif ventilation résidentielle : (1) SIMPLE FLUX HYGRO B (entrée d’air auto-réglable + extraction pièces humides) : prix 800-1 800 € installé, rendement thermique 0 %, obligatoire logements neufs depuis RT2012, adaptée maisons moyennement isolées ; (2) DOUBLE FLUX autoréglable : 4 500-8 000 €, rendement 70-85 %, idéal maisons BBC ou rénovation énergétique ; (3) DOUBLE FLUX HYGROVARIABLE : 5 500-10 000 €, rendement 85-95 % + modulation selon humidité ; (4) DOUBLE FLUX THERMODYNAMIQUE : 10 000-16 000 €, production ECS + ventilation + récupération chaleur intégrée. Règle : maison RT2012 neuve/réno thermique ambitieuse (BBC ou Rénov globale) = double flux rentable (économie 10-20 % chauffage), amortissement 8-15 ans. Maison mal isolée + faible performance énergétique = simple flux suffisant (investir l’argent en isolation avant). Double flux sans étanchéité à l’air bonne = gaspillage.',
  },
  {
    question: 'Quelles aides MaPrimeRénov et CEE pour la VMC double flux ?',
    answer:
      'Aides 2026 cumulables : (1) MaPrimeRénov’ (art. décret 2022-1649) : Bleu 4 000 €, Jaune 3 000 €, Violet 2 500 €, Rose 1 500 € — VMC double flux uniquement dans parcours accompagné ou geste simple (selon barème annuel) ; (2) CEE Coup de pouce ventilation : 800-2 000 € selon ressources + fournisseur énergie ; (3) TVA 5,5 % art. 278-0 bis A CGI si résidence principale >2 ans ; (4) Éco-PTZ : inclus dans bouquet rénovation énergétique jusqu’à 30 000 € ; (5) Aides locales : région Hauts-de-France 500-1 500 €, IDF 500-1 000 €. Total ménage bleu VMC 7 500 € : 4 000 MPR + 2 000 CEE + TVA avantage 300 € = 6 300 € aides = reste à charge 1 200 €. Conditions : (a) RGE Qualibat 5411 ventilation installateur ; (b) équipement label QB (normes NF) ; (c) rendement certifié ≥85 % ; (d) DTU 68.3 respecté ; (e) attestation fin travaux + factures détaillées pour dossier MPR.',
  },
  {
    question: 'Quel entretien pour une VMC double flux ?',
    answer:
      'Entretien CRUCIAL pour maintenir performance : (1) CHANGEMENT FILTRES tous 3-6 mois — filtres G4/F7 coût 30-60 €/an, usager peut faire (clips accessible) ; (2) NETTOYAGE GRILLES D’EXTRACTION + INSUFFLATION tous 6 mois — aspirateur + eau savonneuse ; (3) NETTOYAGE ÉCHANGEUR THERMIQUE (plaques) tous 2 ans — retirer + rincer eau tiède + savon ; (4) VÉRIF CONDENSAT (évacuation eau) 1 fois/an — vérifier écoulement siphon, anti-refoulement ; (5) CONTRÔLE PROFESSIONNEL tous 3 ans — 120-200 € (débits mesurés anémomètre, étanchéité, électronique) ; (6) Nettoyage GAINES tous 10 ans — 600-1 200 € entreprise spécialisée. Non-entretien = (a) filtres colmatés → surconsommation moteur ×2 + air vicié ; (b) échangeur encrassé → rendement chute -30 à -50 % ; (c) condensat bouché → fuite plafond + moisissures ; (d) perte garantie constructeur (attestation à jour exigée). Contrat entretien : 200-400 €/an tout compris recommandé.',
  },
  {
    question: 'Quels avantages énergétiques et IAQ d’une VMC double flux ?',
    answer:
      'Bénéfices documentés : (1) ÉCONOMIES CHAUFFAGE : 10-20 % selon isolation maison (BBC = 10-15 %, RT2012 = 15-20 %, RT2020 = 20-25 %). Récupération 85-95 % chaleur air vicié sortant pour préchauffer air neuf entrant (ex : -10°C extérieur → 16°C soufflé si air intérieur 20°C, rendement 86 %) ; (2) QUALITÉ AIR INTÉRIEUR (IAQ) : filtration F7 arrête 80 % pollens + poussières fines >1 µm, bénéfique allergiques/asthmatiques. COV, formaldéhydes évacués efficacement ; (3) CONFORT ACOUSTIQUE : entrées d’air naturelles supprimées (fenêtres fermées l’hiver + bruit extérieur atténué) ; (4) CONFORT HYGROMÉTRIQUE : humidité 40-60 % maintenue, prévient condensation + moisissures ; (5) Certification BBC Effinergie / Passivhaus requiert double flux rendement ≥85 % ; (6) REVENTE MAISON : argument plus-value +3 à 5 % vs simple flux en 2026 (tendance marché). Pièges : étanchéité à l’air mauvaise annule bénéfice (n50 >3 h⁻¹ = simple flux plus économique).',
  },
]

const sources = [
  {
    label: 'DTU 68.3 — Ventilation mécanique',
    url: 'https://www.cstb.fr',
  },
  { label: 'Art. 278-0 bis A CGI — TVA 5,5 %', url: 'https://www.legifrance.gouv.fr' },
  { label: 'MaPrimeRénov — Barème', url: 'https://france-renov.gouv.fr' },
  { label: 'Qualibat 5411 — Ventilation', url: 'https://www.qualibat.com' },
  { label: 'ADEME — Guide ventilation', url: 'https://www.ademe.fr' },
]

const relatedGuides = [
  { label: 'VMC obligatoire maison neuve', href: '/guides/vmc-obligatoire-maison-neuve' },
  { label: 'Condensation fenêtres causes', href: '/guides/condensation-fenetres-causes' },
  { label: 'Humidité mur intérieur solution', href: '/guides/humidite-mur-interieur-solution' },
  { label: 'MaPrimeRénov 2026 critères RGE', href: '/guides/maprimerenov-2026-criteres-rge' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Ventilation',
    keywords: ['VMC double flux prix', 'ventilation double flux', 'MaPrimeRénov VMC', 'DTU 68.3'],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'VMC double flux', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'VMC double flux' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Fan className="w-3.5 h-3.5" aria-hidden />
              Ventilation · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              VMC double flux : prix et aides 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Une VMC double flux coûte 4 500-12 000 € TTC posée selon la maison et ouvre droit à
              MaPrimeRénov’ jusqu’à 4 000 € + CEE 800-2 000 €. Voici les prix 2026, les rendements,
              l’entretien et les aides.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>MaPrimeRénov’ VMC double flux 2026</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Profil ressources</th>
                    <th className="p-3 border-b border-sand-200">MaPrimeRénov’</th>
                    <th className="p-3 border-b border-sand-200">CEE possible</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Bleu (très modestes)', '4 000 €', '2 000 €'],
                    ['Jaune (modestes)', '3 000 €', '1 500 €'],
                    ['Violet (intermédiaires)', '2 500 €', '1 200 €'],
                    ['Rose (supérieurs)', '1 500 €', '800 €'],
                  ].map(([p, m, c]) => (
                    <tr key={p} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{p}</td>
                      <td className="p-3 font-semibold">{m}</td>
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
              href="/services/chauffagiste"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un installateur RGE <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
