import type { Metadata } from 'next'
import Link from 'next/link'
import { Wind, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'remplacement-fenetres-aides-2026'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'

export const revalidate = 86400

const TITLE = 'Remplacement fenêtres : toutes les aides 2026 (MPR, CEE, TVA)'
const DESCRIPTION =
  'Remplacement fenêtres 2026 : MaPrimeRénov’ (40-100 €/fenêtre), CEE, TVA 5,5 %, éco-PTZ. Uw et Sw requis, contraintes ABF, artisans RGE.'

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
    authors: [`${SITE_URL}/equipe/claire-dubois`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'MaPrimeRénov’ 2026 fenêtres : 40 €/fenêtre Rose → 100 €/fenêtre Bleu (uniquement en remplacement simple vitrage, parcours accompagné).',
  'Coup de pouce CEE fenêtres : ~5 €/fenêtre (faible, peu mobilisé).',
  'TVA 5,5 % sur fourniture+pose par artisan RGE (économie ~14,5 % vs 20 %).',
  'Performance exigée : Uw ≤1,3 W/m²·K et Sw ≥0,3 (critères techniques arrêté 2026).',
  'Éco-PTZ : jusqu’à 15 000 € pour action fenêtres, cumulable.',
]

const faqs = [
  {
    question: 'Quelles sont les aides 2026 pour remplacer mes fenêtres ?',
    answer:
      "MaPrimeRénov' parcours accompagné uniquement (2025-2026) : 40-100 €/fenêtre selon profil (Rose 40, Violet 60, Jaune 80, Bleu 100). Limite : 40 fenêtres max par logement. Seulement sur remplacement simple vitrage. Coup de pouce CEE via un obligé : 5-15 €/fenêtre (faible). TVA 5,5 % sur l'ensemble fourniture + pose. Éco-PTZ pour le solde. Total aides moyennes : 500-2 500 € pour 8 fenêtres rénovation.",
  },
  {
    question: 'Quelle performance Uw pour toucher MaPrimeRénov’ ?',
    answer:
      'Uw ≤1,3 W/m²·K obligatoire + Sw ≥0,3 (facteur solaire pour le solaire passif). Valeurs typiques : PVC double vitrage Uw=1,2-1,4 (limite), PVC triple vitrage Uw=0,8-1,0 (large conformité), aluminium double vitrage avec rupteur Uw=1,3-1,5 (à vérifier), bois double vitrage Uw=1,1-1,3 (conforme). Certification Acotherm ou CSTB obligatoire sur devis.',
  },
  {
    question: 'Peut-on remplacer les fenêtres en copropriété ?',
    answer:
      "Oui mais contraintes : fenêtres = parties communes à jouissance privative dans la plupart des copros. Le règlement copro définit couleur, matériau, aspect. Changement d'aspect (blanc → gris, PVC → alu) = vote AG. Maintien identique = accord tacite du syndic mais notification recommandée. En secteur ABF : consultation obligatoire sur simple remplacement. Les aides MaPrimeRénov' individuelles restent accessibles aux propriétaires occupants.",
  },
  {
    question: 'Combien coûte le remplacement d’une fenêtre posée ?',
    answer:
      'Prix 2026 fenêtre posée TTC (dépose + pose + finitions) : PVC blanc double vitrage = 450-900 €. PVC triple vitrage = 700-1 300 €. Aluminium double vitrage = 800-1 600 €. Bois double vitrage = 900-1 800 €. Bois-alu = 1 400-2 500 €. Grandes baies coulissantes = 1 500-4 500 €. Majoration +20-40 % en copro (accès, protection, évacuation gravats).',
  },
  {
    question: 'Faut-il l’accord de l’ABF en secteur protégé ?',
    answer:
      "Oui, dans les 500 m autour d'un monument historique, dans un Site Patrimonial Remarquable (SPR, ex-secteur sauvegardé) ou dans une ZPPAUP/AVAP, l'avis de l'Architecte des Bâtiments de France est obligatoire pour tout changement d'aspect des menuiseries (matériau, couleur, dessin des croisillons, proportions). Délai 2-4 mois. L'ABF peut imposer bois ou aluminium selon l'ancienne menuiserie, ou conserver meneaux d'origine. Prévoir 15-30 % de surcoût.",
  },
  {
    question: 'Remplacer en rénovation ou en dépose totale ?',
    answer:
      "Rénovation (fenêtre posée sur dormant existant) : plus rapide, moins chère (-15-25 %), moins de finitions. Mais perte 4-8 cm de clair de jour, donc luminosité. Dépose totale : démontage complet dormant + cadre neuf à mes dimensions d'origine. Pas de perte de lumière, meilleure performance (rupture pont thermique au pourtour). Nécessaire si dormant ancien dégradé ou pour obtenir garantie décennale. Plus coûteux et plus long (finitions).",
  },
]

const sources = [
  { label: 'France Rénov’ — Fenêtres', url: 'https://france-renov.gouv.fr' },
  {
    label: 'Arrêté 14 janvier 2020 — Critères techniques MPR',
    url: 'https://www.legifrance.gouv.fr',
  },
  { label: 'CSTB Acotherm — Certification Uw', url: 'https://evaluation.cstb.fr' },
  { label: 'Anah — MaPrimeRénov’ fenêtres', url: 'https://www.anah.gouv.fr' },
]

const relatedGuides = [
  {
    label: 'Prix changement fenêtres double vitrage',
    href: '/guides/prix-changement-fenetres-double-vitrage',
  },
  { label: 'Éco-PTZ 2026', href: '/guides/eco-pret-taux-zero-2026' },
  { label: 'Aides rénovation 2026', href: '/guides/aides-renovation-2026' },
  { label: 'Rénovation fenêtres', href: '/guides/renovation-fenetres' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Travaux spécialisés',
    keywords: [
      'remplacement fenêtres aides 2026',
      'MaPrimeRénov fenêtres',
      'CEE fenêtres',
      'Uw Sw',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Remplacement fenêtres — aides 2026', url: `/guides/${SLUG}` },
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
            items={[
              { label: 'Guides', href: '/guides' },
              { label: 'Remplacement fenêtres — aides 2026' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Wind className="w-3.5 h-3.5" aria-hidden />
              Travaux spécialisés · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Remplacement fenêtres : toutes les aides 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Les fenêtres représentent 10-15 % des déperditions d’une maison mal isolée. En 2026,
              les aides au remplacement ont été recentrées sur le simple vitrage et le parcours
              accompagné. Voici le détail des dispositifs, montants et critères techniques à
              respecter.
            </p>
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Barème MaPrimeRénov’ 2026 — fenêtres</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Profil</th>
                    <th className="p-3 border-b border-sand-200">€/fenêtre</th>
                    <th className="p-3 border-b border-sand-200">Plafond 8 fenêtres</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Bleu (très modestes)', '100 €', '800 €'],
                    ['Jaune (modestes)', '80 €', '640 €'],
                    ['Violet (intermédiaires)', '60 €', '480 €'],
                    ['Rose (supérieurs)', '40 €', '320 €'],
                  ].map(([p, f, t]) => (
                    <tr key={p} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{p}</td>
                      <td className="p-3 font-semibold">{f}</td>
                      <td className="p-3">{t}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>Conditions cumulatives pour MaPrimeRénov’</h2>
            <ul>
              <li>Logement résidence principale, achevé &gt;15 ans.</li>
              <li>Remplacement de fenêtres en simple vitrage (non éligible sur DV existant).</li>
              <li>Uw ≤1,3 W/m²·K et Sw ≥0,3 (certificat Acotherm).</li>
              <li>Pose par artisan RGE (certification &laquo; Menuiseries extérieures &raquo;).</li>
              <li>Parcours MaPrimeRénov’ accompagné (obligatoire 2025-2026).</li>
            </ul>

            <h2>Stratégie de financement optimale</h2>
            <p>Exemple 8 fenêtres PVC DV à 650 € TTC posées = 5 200 € total.</p>
            <ul>
              <li>MaPrimeRénov’ Jaune : 8 × 80 = 640 €</li>
              <li>Coup de pouce CEE : 8 × 10 = 80 €</li>
              <li>TVA 5,5 % : intégrée au prix</li>
              <li>Éco-PTZ pour le solde : 4 480 € sur 10 ans = 37 €/mois sans intérêts</li>
              <li>Apport personnel : 0 €</li>
            </ul>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Le parcours accompagné est désormais obligatoire.</strong>
                Pour toucher MaPrimeRénov’ fenêtres en 2026, les travaux doivent s’inscrire dans un
                projet de rénovation d’ampleur avec un « Mon Accompagnateur Rénov’ » (audit
                énergétique + gain ≥2 classes DPE). Un simple remplacement de fenêtres n’est plus
                éligible à MPR.
              </p>
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
              Trouver un menuisier <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
