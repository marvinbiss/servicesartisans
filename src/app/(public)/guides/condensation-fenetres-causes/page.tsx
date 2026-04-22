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

const SLUG = 'condensation-fenetres-causes'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Sophie Martin'

export const revalidate = 86400

const TITLE = 'Condensation fenêtres : 5 causes et solutions'
const DESCRIPTION =
  'Condensation sur fenêtres intérieur : causes (humidité, VMC, pont thermique, SV, joint), solutions (aération, VMC, DV, déshumidificateur).'

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
    authors: [`${SITE_URL}/equipe/sophie-martin`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Condensation = humidité de l’air (>55 %) qui condense sur une surface froide (verre <15 °C).',
  '5 causes : humidité excessive, VMC défaillante, pont thermique, simple vitrage, joints usés.',
  'Solution immédiate : aérer 10 min matin+soir, cuisinière hotte, salle de bain fenêtre ouverte post-douche.',
  'Investissement durable : VMC hygro B (600-1 500 € posée) + double vitrage si SV (400-800 €/fenêtre).',
  'Risque si non traité : moisissures sur menuiseries bois, allergies, DPE dégradé.',
]

const faqs = [
  {
    question: 'Pourquoi y a-t-il de la condensation sur mes fenêtres ?',
    answer:
      "Physique : l'air chaud peut contenir plus de vapeur d'eau que l'air froid. Quand l'air ambiant (20 °C, 60 % HR) touche la surface froide d'une vitre (10-14 °C), il refroidit et libère l'eau excédentaire sous forme de condensation. Causes aggravantes : occupation dense (plusieurs personnes), cuisine/douche sans VMC ou hotte, séchage linge intérieur, aquarium, plantes nombreuses, humidificateur. Une maison moderne génère 10-20 L d'eau/jour à évacuer.",
  },
  {
    question: 'Quelle VMC installer pour résoudre la condensation ?',
    answer:
      "VMC hygroréglable type B (la plus adaptée rénovation) : bouches de soufflage et d'extraction avec capteur d'humidité, débit s'adapte automatiquement. 600-1 500 € posée. VMC double-flux thermodynamique : 3 500-6 500 € mais récupère chaleur extraite, éligible MaPrimeRénov'. Ventilation simple flux auto (extraction seule) : 300-600 € entrée de gamme, moins performante. Vérifier dimensionnement débit : 30-45 m³/h par pièce principale, 45-60 pour cuisine/SDB.",
  },
  {
    question: 'Mes fenêtres sont en double vitrage, pourquoi j’ai de la condensation ?',
    answer:
      "Causes possibles : (1) air ambiant trop humide (VMC insuffisante, mauvaise aération), (2) vitrage 4-16-4 standard (Uw=1,4) insuffisant si pont thermique au cadre, passer à 4-12-4 avec argon (Uw=1,2), (3) joint périmétrique vieilli (remplacer, 50-150 €), (4) intercalaire aluminium froid (remplacer par warm edge), (5) problème temporaire (douche, cuisson). Si condensation ENTRE les 2 vitres : joint d'étanchéité pete, remplacement vitrage obligatoire (200-500 €/fenêtre).",
  },
  {
    question: 'Faut-il acheter un déshumidificateur ?',
    answer:
      "Déshumidificateur électrique (150-400 € appareil, 0,3-0,5 kWh/jour) = palliatif temporaire, 100 €/an de conso. Efficace sur 20-30 m² en mode intensif. Règle : c'est une béquille, pas une solution. Vrai problème = ventilation insuffisante ou isolation déficiente. Préférer investir dans VMC hygro B correctement dimensionnée. Exception : caves humides permanentes ou chambres de nourrisson en attente de travaux.",
  },
  {
    question: 'La condensation peut-elle créer des moisissures ?',
    answer:
      'Oui, fréquent en 2-6 semaines si humidité >70 % prolongée. Zones à risque : angle mur-plafond (pont thermique), derrière meubles contre mur froid, joint silicone SDB/cuisine, menuiseries bois. Moisissures = champignons (Cladosporium, Aspergillus) associés à allergies, asthme, gêne respiratoire chez enfants. Traitement : javel diluée 1/10 sur petite surface, remplacement placoplâtre si >1 m², traitement fongicide mur + cause (VMC, isolation).',
  },
]

const sources = [
  {
    label: 'ADEME — Guide ventilation résidentielle',
    url: 'https://agirpourlatransition.ademe.fr',
  },
  { label: 'Arrêté 24 mars 1982 — Aération logements', url: 'https://www.legifrance.gouv.fr' },
  { label: 'NF DTU 68.3 — Installations VMC', url: 'https://www.cstb.fr' },
  { label: 'CSTB — Condensation habitation', url: 'https://www.cstb.fr' },
]

const relatedGuides = [
  { label: 'Humidité mur intérieur solution', href: '/guides/humidite-mur-interieur-solution' },
  { label: 'Moisissure mur chambre traitement', href: '/guides/moisissure-mur-chambre-traitement' },
  { label: 'Remplacement fenêtres aides 2026', href: '/guides/remplacement-fenetres-aides-2026' },
  {
    label: 'Prix changement fenêtres double vitrage',
    href: '/guides/prix-changement-fenetres-double-vitrage',
  },
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
      'condensation fenêtres',
      'condensation vitre',
      'VMC condensation',
      'humidité fenêtre',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Condensation fenêtres', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Condensation fenêtres' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Wind className="w-3.5 h-3.5" aria-hidden />
              Problèmes maison · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Condensation fenêtres : 5 causes et solutions
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Gouttes d’eau sur vos vitres chaque matin ? La condensation signale un déséquilibre
              entre l’humidité intérieure et la température des surfaces. Voici les 5 causes les
              plus fréquentes et les solutions hiérarchisées du geste simple à la rénovation
              durable.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Les 5 causes classiques</h2>
            <ol>
              <li>
                <strong>Humidité intérieure excessive</strong> (&gt;60 % HR) : cuisine, douche,
                séchage linge, plantes.
              </li>
              <li>
                <strong>VMC défaillante</strong> : bouches encrassées, moteur HS, débit insuffisant.
              </li>
              <li>
                <strong>Pont thermique de fenêtre</strong> : cadre alu sans rupture, raccord mal
                isolé.
              </li>
              <li>
                <strong>Simple vitrage</strong> ou DV ancien : verre froid en hiver, condensation
                inévitable.
              </li>
              <li>
                <strong>Joints dégradés</strong> : air froid qui entre, refroidit le verre.
              </li>
            </ol>
            <h2>Plan d’action progressif</h2>
            <ul>
              <li>Gratuit : aérer 10 min matin+soir, fenêtre SDB pendant douche.</li>
              <li>Faible coût (50-150 €) : nettoyer bouches VMC, remplacer joints fenêtres.</li>
              <li>Moyen (200-500 €) : hygromètre électronique pour mesurer, déshumidificateur.</li>
              <li>Investissement (600-1 500 €) : VMC hygro B neuve.</li>
              <li>Rénovation (&gt;5 000 €) : remplacement fenêtres SV→DV argon warm edge.</li>
            </ul>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Jamais calfeutrer les entrées d’air fenêtre.</strong> Ces grilles sont
                obligatoires (arrêté 24/03/1982) et indispensables à la VMC. Les boucher crée des
                dépressions et aggrave la condensation ailleurs. Remplacer si bruyantes.
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
