import type { Metadata } from 'next'
import Link from 'next/link'
import { FileCheck, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'diagnostics-vente-obligatoires'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Claire Dubois'

export const revalidate = 86400

const TITLE = 'Diagnostics vente obligatoires 2026 : DDT'
const DESCRIPTION =
  'Diagnostics obligatoires vente 2026 : DPE, amiante, plomb, termites, gaz, électricité, ERP, Carrez, assainissement, mérule. Validités, prix, sanctions.'

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
  'Dossier de Diagnostic Technique (DDT) = obligatoire à la signature du compromis de vente. Art. L271-4 CCH.',
  '10 diagnostics selon bien : DPE, amiante, plomb, termites, gaz, électricité, ERP, loi Carrez, assainissement non collectif, mérule.',
  'Validités variables : DPE 10 ans, amiante/plomb illimitée si négatif, termites 6 mois, gaz/électricité 3 ans, ERP 6 mois.',
  'Budget pack complet 2026 : 500-900 € pour un appartement 50 m², 700-1 200 € pour maison 100 m², 1 000-1 800 € pour plus grand.',
  'Sanctions absence / fraude : annulation vente, baisse prix, dommages-intérêts acheteur, amende 37 500 € + 2 ans prison (fraude DPE).',
]

const faqs = [
  {
    question: 'Quels sont les 10 diagnostics obligatoires à la vente ?',
    answer:
      "Selon l'année construction et la localisation : (1) DPE — tous biens, (2) amiante — permis construire avant 1er juillet 1997, (3) plomb (CREP) — avant 1er janvier 1949, (4) termites — arrêté préfectoral (~60 départements), (5) gaz — installation >15 ans, (6) électricité — installation >15 ans, (7) ERP État des Risques et Pollutions — zones PPR/PPRi/SEVESO, (8) loi Carrez — copropriété uniquement, (9) assainissement non collectif — maison hors égout, (10) mérule — zones à risque arrêté préfectoral. Certificat de mesurage loi Boutin pour location seule. Tout diagnostiqueur doit être certifié COFRAC (art. L271-6 CCH) avec assurance RC pro.",
  },
  {
    question: 'Quelles durées de validité par diagnostic ?',
    answer:
      'Tableau officiel : (1) DPE : 10 ans (exceptions DPE avant 1er juillet 2021 → 31 décembre 2022 et DPE 2018-2021 → 31 décembre 2024) ; (2) Amiante : illimitée si négatif, 3 ans si positif ; (3) Plomb (CREP) : illimitée si concentration <1 mg/cm², 1 an vente / 6 ans location si >1 mg/cm² ; (4) Termites : 6 mois ; (5) Gaz : 3 ans ; (6) Électricité : 3 ans ; (7) ERP : 6 mois — à refaire si nouvel arrêté préfectoral ; (8) Loi Carrez : illimitée (sauf modification surface) ; (9) Assainissement : 3 ans ; (10) Mérule : illimitée si négatif, 6 mois si positif. Total annuel moyen refresh : 100-300 € pour biens fréquemment remis en location.',
  },
  {
    question: 'Combien coûte le pack diagnostics complet en 2026 ?',
    answer:
      'Prix indicatifs (libres, mais tarifs observés marché) : (1) appartement 50 m² (DPE + Carrez + gaz/élec + ERP + amiante si <1997) : 500-900 € TTC ; (2) maison individuelle 100 m² complet (DPE + amiante + plomb + gaz/élec + ERP + termites + mérule + assainissement NC) : 700-1 200 € TTC ; (3) grande maison 150 m² + terrain : 1 000-1 800 € TTC. Économie via pack complet vs unitaire : 20-35 %. Attention diagnostiqueurs low-cost (<400 € pour maison complète) : risque DPE erroné, litige vente. Privilégier certifié COFRAC avec RC Pro affichée.',
  },
  {
    question: 'Quelles sanctions en cas de diagnostic manquant ou erroné ?',
    answer:
      "Responsabilité croisée vendeur + diagnostiqueur : (1) Vendeur absence diagnostic : acquéreur peut saisir tribunal judiciaire, demander annulation vente ou baisse prix (10-20 %) ; (2) Vendeur fraude (DPE favorable délibérément faux) : art. L271-2 CCH — amende 37 500 € + 2 ans prison + restitution plus-value vente ; (3) Diagnostiqueur erreur : RC pro obligatoire, indemnisation acheteur jusqu'à préjudice réel (souvent 5-30 k€) ; (4) Amiante / plomb omis : réparation obligatoire à charge vendeur + dommages-intérêts santé publique si enfants. Depuis 2022, durcissement contrôles DGCCRF sur DPE frauduleux — 450 diagnostiqueurs sanctionnés 2024.",
  },
  {
    question: 'Que change le DPE nouveau (réforme 2021 / modifications 2024) ?',
    answer:
      "Depuis le 1er juillet 2021 : nouveau DPE OPPOSABLE juridiquement (avant : simple information) + méthode de calcul unifiée (méthode 3CL) + prise en compte éclairage et auxiliaires + étiquettes de A à G recalculées (plus sévères). Modifications 2024 : intégration éclairage LED + climatisation dans calcul, révision coefficient facteur d'émissions CO2 électricité (0,065 kg CO2/kWh au lieu de 0,079). Conséquence : environ 25 % des logements ont basculé d'une classe à une autre. Si DPE avant 2021, refaire OBLIGATOIREMENT avant vente/location. Coût nouveau DPE : 100-250 € selon surface. Depuis 2024 : intégration du nouveau barème MaPrimeRénov' qui exige des seuils DPE minimum selon travaux aidés.",
  },
]

const sources = [
  {
    label: 'Art. L271-4 CCH — DDT',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044278378',
  },
  { label: 'ADEME — DPE', url: 'https://www.ademe.fr/particuliers-eco-citoyens/dpe' },
  { label: 'Service-public.fr — Diagnostics vente', url: 'https://www.service-public.fr' },
  {
    label: 'COFRAC — Certification diagnostiqueurs',
    url: 'https://www.cofrac.fr',
  },
]

const relatedGuides = [
  { label: 'Diagnostics immobiliers', href: '/guides/diagnostics-immobiliers' },
  { label: 'DPE mauvais : que faire', href: '/guides/dpe-mauvais-que-faire' },
  { label: 'Classe F interdite location 2028', href: '/guides/classe-energie-f-interdite-2028' },
  { label: 'Passoire thermique rénovation', href: '/guides/passoire-thermique-renovation' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Réglementation',
    keywords: [
      'diagnostics vente obligatoires',
      'DDT immobilier',
      'DPE amiante plomb termites',
      'diagnostiqueur COFRAC',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Diagnostics vente', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Diagnostics vente' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <FileCheck className="w-3.5 h-3.5" aria-hidden />
              Réglementation · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Diagnostics vente obligatoires 2026 : DDT complet
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Le Dossier de Diagnostic Technique (DDT) rassemble tous les diagnostics que le vendeur
              doit remettre à l’acquéreur dès le compromis. Voici les 10 diagnostics possibles,
              leurs validités, prix et sanctions en cas d’omission ou de fraude.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Durée de validité par diagnostic</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Diagnostic</th>
                    <th className="p-3 border-b border-sand-200">Validité</th>
                    <th className="p-3 border-b border-sand-200">Condition</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['DPE', '10 ans', 'Tous biens'],
                    ['Amiante', 'Illimitée si négatif', 'Permis <1er juil 1997'],
                    ['Plomb (CREP)', 'Illimitée (<1 mg/cm²)', 'Permis <1er janv 1949'],
                    ['Termites', '6 mois', 'Arrêté préfectoral'],
                    ['Gaz', '3 ans', 'Installation >15 ans'],
                    ['Électricité', '3 ans', 'Installation >15 ans'],
                    ['ERP', '6 mois', 'Tous biens'],
                    ['Loi Carrez', 'Illimitée', 'Copropriété'],
                    ['Assainissement NC', '3 ans', 'Hors égout collectif'],
                    ['Mérule', 'Illimitée si négatif', 'Zone arrêté préfectoral'],
                  ].map(([d, v, c]) => (
                    <tr key={d} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{d}</td>
                      <td className="p-3 font-semibold">{v}</td>
                      <td className="p-3">{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>DPE frauduleux = pénal.</strong> Loi Climat 2021 : faux DPE volontaire =
                amende 37 500 € + 2 ans prison + annulation vente. Exiger diagnostiqueur COFRAC avec
                n° + RC Pro affichés. Coût honnête 100-250 € par DPE, méfiance &lt;80 €.
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
            <Link href="/guides" className="inline-flex items-center gap-1 hover:text-primary-700">
              Autres guides <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
