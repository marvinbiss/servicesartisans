import type { Metadata } from 'next'
import Link from 'next/link'
import { PaintBucket, ArrowRight, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'ravalement-facade-obligation-10-ans'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Sophie Martin'
const AUTHOR_SLUG = 'sophie-martin'

export const revalidate = 86400

const TITLE = 'Ravalement façade : obligation 10 ans'
const DESCRIPTION =
  'Ravalement façade : obligation décennale art. L132-3 CCH dans 4 400 communes, arrêté mairie délai 6-12 mois, amende 3 750 € + travaux d’office.'

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
  'Obligation décennale art. L132-3 CCH : applicable dans 4 400 communes listées par arrêté préfectoral (Paris, Lyon, Marseille, Bordeaux, etc.).',
  'Propriétaire doit maintenir façade en bon état permanent. Arrêté mairie peut sommer travaux sous 6-12 mois.',
  'Non-respect = amende 3 750 € (art. L152-11 CCH) + travaux exécutés d’office aux frais du propriétaire.',
  'Prix 2026 TTC/m² : nettoyage + peinture 30-60 €, ITE + enduit 140-240 €, pierre ravalée 80-150 €.',
  'Aides possibles si ITE couplé : MaPrimeRénov 15-75 €/m², CEE 10-25 €/m², éco-PTZ jusqu’à 30 000 €, TVA 5,5 %.',
]

const faqs = [
  {
    question: 'Quelles communes imposent le ravalement obligatoire tous les 10 ans ?',
    answer:
      '4 400 communes concernées (art. L132-1 à L132-5 CCH). Liste établie par arrêté préfectoral, consultable en mairie ou préfecture. Généralement : (1) Grandes villes (Paris, Lyon, Marseille, Toulouse, Nice, Nantes, Strasbourg, Bordeaux, Lille) ; (2) Communes >2 000 habitants en zones denses ; (3) Secteurs patrimoniaux (ZPPAUP, sites classés, centres historiques) ; (4) Communes touristiques à forte activité ; (5) Communes avec PLU spécifique imposant entretien façade. Hors communes listées, obligation n’existe pas légalement MAIS copropriété peut prévoir travaux dans règlement + maire peut imposer ravalement au titre de sécurité (façade dangereuse, risque chute éléments) sur tout territoire art. L511-1 CCH. Vérifier statut commune : service urbanisme mairie.',
  },
  {
    question: 'Quelle est la procédure administrative du ravalement obligatoire ?',
    answer:
      'Procédure art. L132-3 à R132-1 CCH : (1) Maire envoie courrier recommandé propriétaire sommant travaux ; (2) Propriétaire a 6 MOIS (minimum légal) pour déposer déclaration préalable + dossier Cerfa 13703 avec plan façade + échantillons couleurs + descriptif technique ; (3) Instruction DP : 1 mois (2 mois si ABF) ; (4) Exécution travaux dans délai fixé par arrêté (6-12 mois généralement après DP acceptée) ; (5) Si propriétaire n’agit pas : mise en demeure 2e courrier recommandé + 3 mois supplémentaires ; (6) Procédure contentieuse : arrêté prescrivant travaux d’office aux frais du propriétaire — maire fait exécuter, facture envoyée, recouvrement via trésor public comme impôt ; (7) Amende 3 750 € (art. L152-11 CCH) cumulable avec coût travaux d’office. Recours possibles : tribunal administratif dans 2 mois suivant arrêté.',
  },
  {
    question: 'Quel est le prix d’un ravalement de façade en 2026 ?',
    answer:
      'Prix 2026 TTC/m² selon technique + état : (1) Nettoyage haute pression + traitement anti-mousse : 15-30 €/m² — maintenance simple ; (2) Nettoyage + peinture acrylique ou siloxane : 30-60 €/m² — rafraîchissement esthétique ; (3) Hydrogommage + peinture minérale : 50-80 €/m² — façades pierre ou enduit ancien ; (4) Peeling enduit dégradé + réfection + peinture : 60-100 €/m² ; (5) Enduit monocouche neuf (grattage + primaire + 2 passes) : 80-120 €/m² ; (6) Ravalement complet pierre de taille (dégraissage + rejointoiement + hydrofugation) : 80-150 €/m² ; (7) ITE (isolation thermique extérieure) + enduit finition : 140-240 €/m² — éligible MaPrimeRénov + CEE. Coûts annexes : échafaudage 15-25 €/m²/mois, permis copro 500-1 500 €, enlèvement déchets 200-800 €. Maison 100 m² façade 120 m² repeinte : 3 600-7 200 € ; en ITE : 16 800-28 800 €.',
  },
  {
    question: 'Quelles aides financières pour un ravalement-isolation en 2026 ?',
    answer:
      'Ravalement seul : PAS d’aide (sauf TVA 10 % résidence principale >2 ans). Couplé ITE = aides cumulables : (1) MaPrimeRénov Sérénité : 15-75 €/m² selon ressources (bleu très modestes 75 €/m², jaune 60 €/m², violet 40 €/m², rose 15 €/m²), plafond 100 m² ; (2) CEE Coup de pouce isolation murs : 10-25 €/m² pour tous ménages ; (3) TVA 5,5 % art. 278-0 bis A CGI (au lieu 10 %) résidence principale >2 ans ; (4) Éco-PTZ : jusqu’à 30 000 € bouquet 3+ travaux ; (5) Aides locales régionales : Occitanie 800-2 000 €, IDF 500-1 500 € ; (6) Copropriétés : MaPrimeRénov Copro 25 % plafonné 25 000 €/logement + CEE collective. Total ménage bleu ITE 120 m² maison : 9 000 MPR + 3 000 CEE + TVA avantage 1 500 € = ~13 500 € sur 20 000 € = reste à charge 6 500 €. Contrainte : ENTREPRISE RGE Qualibat 7131 ou 7135 obligatoire.',
  },
  {
    question: 'Qui paie le ravalement en copropriété ?',
    answer:
      'Ravalement = travaux affectant parties communes (façade = partie commune art. 3 loi 10 juillet 1965) : (1) Décision vote AG copropriété — majorité absolue (art. 25 loi 1965) pour ravalement simple, majorité des voix exprimées (art. 24) pour entretien courant, double majorité (art. 26) pour ITE avec amélioration thermique ; (2) Répartition charges au TANTIÈME de copropriété (parts de l’immeuble selon titres) ; (3) Copropriétaire qui refuse peut être contraint par judiciaire si AG validée ; (4) Avance frais via provision sur travaux, fonds travaux obligatoire (art. 14-2 loi ALUR) ; (5) Cas commerce en RDC : certaines clauses règlement peuvent mettre entretien partie commerciale à charge commerçant (vérifier règlement copro) ; (6) Maire peut saisir syndic directement + faire exécuter travaux si AG n’aboutit pas — dépenses recouvrées sur chaque copropriétaire art. L132-5 CCH. Action conciliation recommandée avant judiciaire.',
  },
]

const sources = [
  {
    label: 'Art. L132-1 à L132-5 CCH — Ravalement',
    url: 'https://www.legifrance.gouv.fr',
  },
  { label: 'Art. L152-11 CCH — Sanctions', url: 'https://www.legifrance.gouv.fr' },
  { label: 'ADEME — ITE aides', url: 'https://www.ademe.fr' },
  { label: 'Qualibat 7131 / 7135 — ITE', url: 'https://www.qualibat.com' },
  { label: 'Service-public — Ravalement', url: 'https://www.service-public.fr' },
]

const relatedGuides = [
  { label: 'Prix ravalement façade maison', href: '/guides/prix-ravalement-facade-maison' },
  {
    label: 'Isolation extérieure vs intérieure',
    href: '/guides/isolation-exterieure-vs-interieure',
  },
  { label: 'Travaux copropriété', href: '/guides/travaux-copropriete' },
  { label: 'MaPrimeRénov copropriété', href: '/guides/maprimerenov-copropriete' },
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
      'ravalement façade obligation',
      'ravalement 10 ans',
      'amende ravalement',
      'prix ravalement m2',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Ravalement obligation', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Ravalement obligation' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <PaintBucket className="w-3.5 h-3.5" aria-hidden />
              Réglementation · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Ravalement façade : obligation 10 ans en 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Dans 4 400 communes, le ravalement est obligatoire tous les 10 ans (art. L132-3 CCH).
              Non-respect = amende 3 750 € + travaux d’office. Voici la procédure, les prix 2026,
              les communes concernées et les aides.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Prix ravalement façade 2026 au m²</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Technique</th>
                    <th className="p-3 border-b border-sand-200">Prix TTC/m²</th>
                    <th className="p-3 border-b border-sand-200">Quand l’utiliser</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Nettoyage + anti-mousse', '15-30 €', 'Maintenance simple'],
                    ['Nettoyage + peinture', '30-60 €', 'Rafraîchissement'],
                    ['Enduit monocouche neuf', '80-120 €', 'Façade dégradée'],
                    ['Pierre ravalée + jointoiement', '80-150 €', 'Pierre de taille'],
                    ['ITE + enduit finition', '140-240 €', 'Isolation + esthétique'],
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
              href="/services/facadier"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un façadier <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
