import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, ArrowRight, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'fissures-maison-inquietantes'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Thomas Bernard'

export const revalidate = 86400

const TITLE = 'Fissures maison : diagnostic expert 2026'
const DESCRIPTION =
  'Fissures maison : microfissure, horizontale, verticale, en escalier. Diagnostic structurel, assurance catastrophe naturelle, coût expertise et travaux.'

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
    authors: [`${SITE_URL}/equipe/thomas-bernard`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  '3 niveaux de gravité : microfissures <0,2 mm (esthétique), fissures 0,2-2 mm (surveillance), lézardes >2 mm (urgence).',
  'Causes fréquentes : sécheresse/retrait-gonflement argileux (RGA), tassement différentiel, défaut de structure, infiltration.',
  'Fissure en escalier sur mur = signe d’affaissement sol. Fissure horizontale = pression extérieure. Vertical = tassement.',
  'Expertise structurelle : 300-800 € ; micropieux en cas de RGA : 8 000-25 000 € maison.',
  'Assurance catastrophe naturelle (arrêté ministériel) couvre les fissures RGA si commune reconnue CatNat.',
]

const faqs = [
  {
    question: 'Quand s’inquiéter d’une fissure ?',
    answer:
      "Signes d'alerte : ouverture >2 mm, fissures en escalier sur mur porteur, fissures traversantes (visibles des 2 côtés), évolution rapide (>0,2 mm/mois), apparition après sécheresse ou gros orage, fissures accompagnées de portes qui frottent ou de sols non horizontaux. Dans ces cas : expertise structurelle urgente (300-800 €). Microfissures <0,2 mm sur enduit : esthétique, surveiller évolution avec jauge (tell-tale, ~15 €).",
  },
  {
    question: 'Qu’est-ce que le retrait-gonflement des argiles (RGA) ?',
    answer:
      "Phénomène géotechnique : les sols argileux gonflent à l'humidité et se rétractent à la sécheresse, créant des mouvements différentiels sous les fondations. 48 % du territoire français est concerné. Signes : fissures saisonnières (apparaissent après canicule, disparaissent partiellement à l'automne), en escalier sur murs, préférentiellement coté Sud/Ouest. Carte de risque sur georisques.gouv.fr. Solutions : micropieux (8-25 k€), reprise en sous-œuvre (15-50 k€).",
  },
  {
    question: 'L’assurance couvre-t-elle les fissures ?',
    answer:
      "Dégât des eaux classique : non (fissures = structure, pas dégât des eaux). Catastrophe naturelle : oui si arrêté CatNat publié au JO pour votre commune suite à sécheresse ou autre événement. Délai déclaration : 10 jours après publication. L'assureur mandate un expert qui établit le lien de causalité. Franchise CatNat : 380 € minimum (1 520 € pour RGA si sans PPR). Taux d'acceptation CatNat : 60-80 % selon ampleur reconnue.",
  },
  {
    question: 'Combien coûte une expertise de fissures ?',
    answer:
      "Expertise visuelle simple par maçon : gratuit à 150 €. Expertise structurelle par BE béton : 300-800 € HT (diagnostic qualitatif). Expertise géotechnique G5 (après sinistre) : 1 500-4 000 € (sondages carottés, analyse laboratoire). Expertise contradictoire judiciaire : 2 500-6 500 €. En cas de CatNat : expertise payée par l'assureur. Toujours exiger un rapport écrit avec photos, mesures, préconisations.",
  },
  {
    question: 'Micropieux ou reprise en sous-œuvre ?',
    answer:
      "Micropieux (8-25 k€) : forages profonds 10-15 m jusqu'à la couche stable, puis liaison à la fondation existante. Adapté au RGA et tassement différentiel. Durée chantier 3-6 semaines. Reprise en sous-œuvre (15-50 k€) : creusement complet sous fondation existante par passes alternées, coulage béton neuf. Plus lourd, pour bâtiments anciens. Étude géotechnique G2 (1 500-3 500 €) définit la solution.",
  },
]

const sources = [
  { label: 'Géorisques — Carte risque RGA', url: 'https://www.georisques.gouv.fr' },
  { label: 'Service-public.fr — CatNat', url: 'https://www.service-public.fr' },
  { label: 'Agence Qualité Construction — Fissures', url: 'https://qualiteconstruction.com' },
  { label: 'NF DTU 13.1-13.3 — Fondations', url: 'https://www.cstb.fr' },
]

const relatedGuides = [
  { label: 'Humidité mur intérieur solution', href: '/guides/humidite-mur-interieur-solution' },
  { label: 'Moisissure mur chambre traitement', href: '/guides/moisissure-mur-chambre-traitement' },
  { label: 'Assurance dommage ouvrage', href: '/guides/assurance-dommage-ouvrage' },
  { label: 'Ouverture mur porteur prix', href: '/guides/ouverture-mur-porteur-prix' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Problèmes maison',
    keywords: [
      'fissures maison inquiétantes',
      'fissure mur',
      'RGA retrait argile',
      'expertise fissure',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Fissures maison inquiétantes', url: `/guides/${SLUG}` },
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
              { label: 'Fissures maison inquiétantes' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden />
              Problèmes maison · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Fissures maison inquiétantes : le guide du diagnostic
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Toutes les fissures ne sont pas graves, mais certaines annoncent des désordres
              structurels sérieux. Apprenez à distinguer microfissure bénigne et lézarde dangereuse,
              à identifier l’origine, et à activer les bons recours (assurance CatNat, expert,
              travaux).
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>3 niveaux de gravité</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Largeur</th>
                    <th className="p-3 border-b border-sand-200">Nom</th>
                    <th className="p-3 border-b border-sand-200">Gravité</th>
                    <th className="p-3 border-b border-sand-200">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['< 0,2 mm', 'Microfissure', 'Esthétique', 'Surveillance annuelle'],
                    ['0,2-2 mm', 'Fissure', 'À surveiller', 'Pose jauge tell-tale'],
                    ['> 2 mm', 'Lézarde', 'Urgence', 'Expertise structurelle'],
                    ['Traversante', 'Fracture', 'Critique', 'Évacuation possible'],
                  ].map(([l, n, g, a]) => (
                    <tr key={n} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{l}</td>
                      <td className="p-3">{n}</td>
                      <td className="p-3">{g}</td>
                      <td className="p-3">{a}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h2>Formes de fissures et causes</h2>
            <ul>
              <li>
                <strong>Verticale droite</strong> : tassement différentiel (côté fondation
                affaissée).
              </li>
              <li>
                <strong>En escalier</strong> (suit les joints de parpaings) : mouvement sol, typique
                RGA.
              </li>
              <li>
                <strong>Horizontale mi-hauteur</strong> : poussée extérieure (terrasse, mur de
                soutènement).
              </li>
              <li>
                <strong>À 45°</strong> : cisaillement dû à un tassement localisé.
              </li>
              <li>
                <strong>Autour des ouvertures</strong> (fenêtres, portes) : linteau insuffisant ou
                tassement.
              </li>
            </ul>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Fissure qui évolue.</strong> Posez une jauge tell-tale (15 €, type &laquo;
                Avongard &raquo;) sur la fissure. Relevez mensuellement. &gt;0,2 mm d’évolution en 3
                mois = expertise obligatoire. Photographiez avec règle graduée et date visible.
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
              href="/services/macon"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un maçon <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
