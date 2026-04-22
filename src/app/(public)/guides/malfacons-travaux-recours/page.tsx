import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldAlert, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema, getHowToSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'malfacons-travaux-recours'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Sophie Martin'

export const revalidate = 86400

const TITLE = 'Malfaçons travaux : recours 2026'
const DESCRIPTION =
  'Malfaçons travaux : procédure amiable (LRAR, mise en demeure), expertise amiable vs judiciaire, référé, décennale. Délais prescription, jurisprudence 2026.'

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
    authors: [`${SITE_URL}/equipe/sophie-martin`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Définition : malfaçon = défaut d’exécution rendant l’ouvrage impropre à sa destination ou présentant un désordre esthétique / fonctionnel grave.',
  'Étape 1 amiable : lettre recommandée AR détaillée + photos, délai 30 j pour réparation. 70 % des cas se résolvent à cette étape.',
  'Étape 2 expertise : constat huissier (120-200 €) + expertise amiable (500-2 000 €) ou judiciaire (référé, 600-1 500 €).',
  'Prescription : GPA 1 an / biennale 2 ans / décennale 10 ans (art. 1792) + prescription générale contractuelle 5 ans.',
  'Recours possibles : rétention 5 % retenue de garantie, médiation consommation (gratuit), saisie tribunal (jusqu’à 10 000 € sans avocat).',
]

const howToSteps = [
  {
    name: 'Documenter immédiatement',
    text: 'Photos haute résolution, vidéos, mesures. Conservez devis, factures, SMS, mails. Toute preuve écrite compte.',
  },
  {
    name: 'Envoyer LRAR à l’artisan',
    text: 'Lettre recommandée AR détaillant chaque malfaçon + photos + article de loi applicable + délai 30 j pour réparer.',
  },
  {
    name: 'Mise en demeure si pas de réponse',
    text: 'Si silence à 30 j : mise en demeure formelle LRAR avec mention « à défaut, saisie du tribunal » + délai 15 j.',
  },
  {
    name: 'Constat huissier',
    text: 'Commissaire de justice (huissier) pour constat des désordres : 120-200 €. Preuve opposable au tribunal.',
  },
  {
    name: 'Expertise contradictoire',
    text: 'Expertise amiable : vous mandatez un expert (500-2 000 €), l’artisan est invité. Ou référé judiciaire pour expertise judiciaire (600-1 500 € consignation).',
  },
  {
    name: 'Médiation consommation',
    text: 'Saisie du médiateur de la consommation (gratuit, obligatoire avant tribunal pour contrats < 5 ans). Avis sous 90 j.',
  },
  {
    name: 'Saisir le tribunal',
    text: 'Tribunal de proximité si <10 000 € (sans avocat), tribunal judiciaire au-delà (avec avocat obligatoire >10 000 €). Prescription 5 ans.',
  },
]

const faqs = [
  {
    question: 'Qu’est-ce qu’une malfaçon au sens juridique ?',
    answer:
      "Selon la jurisprudence constante (Cass. civ. 3e, 2018 et suivants) : défaut d'exécution ou vice apparent qui (1) rend l'ouvrage impropre à sa destination (ex : toit qui fuit, chauffage qui ne fonctionne pas), (2) présente un désordre esthétique grave (carrelage mal posé visiblement, peinture bâclée), ou (3) compromet la solidité ou la pérennité (fissures structurelles, ancrages défectueux). Distinction clé : malfaçon apparente (visible à la réception → GPA 1 an) vs vice caché (apparu après, possible décennale). La simple insatisfaction esthétique n'est PAS une malfaçon juridique sans critère objectif.",
  },
  {
    question: 'Combien coûte une expertise amiable vs judiciaire ?',
    answer:
      "Expertise amiable (unilatérale ou contradictoire) : 500-2 000 € TTC selon complexité. Missions courantes : 800-1 200 €. Payée par la partie qui demande, souvent récupérée si gain au tribunal. Expertise judiciaire (ordonnée par juge en référé) : consignation initiale 600-1 500 € à la régie + coûts additionnels (déplacements, sondages) souvent 2 000-5 000 € au total. Le juge répartit les frais selon la faute établie. Pour litige <5 000 € : privilégier l'amiable. Pour >10 000 € avec enjeu technique fort : l'expertise judiciaire a valeur de preuve opposable à tous.",
  },
  {
    question: 'Puis-je retenir le paiement en cas de malfaçon ?',
    answer:
      "Juridiquement : art. 1219 du Code civil permet l'exception d'inexécution — suspendre votre paiement tant que l'artisan ne remplit pas ses obligations. MAIS : conditions strictes. (1) Proportionnalité : retenir proportionnellement au défaut (ex : 10 % retenue si 10 % des travaux sont défectueux, pas 100 %) ; (2) notifier par LRAR avant de retenir, sinon risque poursuite pour défaut de paiement ; (3) privilégier la retenue de garantie 5 % contractuelle si prévue au devis ; (4) consigner à la Caisse des Dépôts la somme retenue protège les 2 parties. Suspendre entièrement sans notification = risque de procédure inverse et frais.",
  },
  {
    question: 'L’artisan refuse d’intervenir : que faire ?',
    answer:
      "Stratégie en 4 niveaux : (1) Médiation de la consommation — gratuite, obligatoire avant tribunal depuis 2016, médiateur CMAP/ANM, délai 90 j, acceptation 60 % ; (2) Signalement DGCCRF via signal.conso.gouv.fr si pratique commerciale trompeuse ou manque professionnel caractérisé ; (3) Substitution — faire intervenir un autre professionnel pour réparer, conserver les factures, et demander ensuite remboursement par voie judiciaire (art. 1222 Code civil — exécution aux frais du débiteur, autorisation juge préalable recommandée) ; (4) Tribunal — judiciaire de proximité <10 k€ sans avocat, tribunal judiciaire >10 k€. Pensez aussi à l'assurance de protection juridique qui prend souvent en charge les frais (franchise 100-300 €).",
  },
  {
    question: 'Quels délais de prescription pour agir ?',
    answer:
      "Tableau juridique : (1) Garantie de parfait achèvement (GPA) : 1 an à compter de la réception, désordres signalés réservés au PV ou apparus dans l'année — art. 1792-6 ; (2) Garantie biennale (bon fonctionnement) : 2 ans, équipements dissociables (chaudière, VMC, carrelage, luminaires) — art. 1792-3 ; (3) Garantie décennale : 10 ans, solidité ouvrage ou impropre destination — art. 1792 ; (4) Prescription contractuelle générale : 5 ans à compter du jour où le désordre est connu — art. 2224. Les délais sont cumulables. À 3 ans après travaux : biennale fermée mais décennale ouverte pour désordre structurel + 5 ans contractuel pour autres manquements.",
  },
]

const sources = [
  {
    label: 'Art. 1792 Code civil — Décennale',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000038814715',
  },
  {
    label: 'Art. 1219 Code civil — Exception inexécution',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000032041407',
  },
  { label: 'Service-public.fr — Recours malfaçons', url: 'https://www.service-public.fr' },
  { label: 'AQC — Qualité construction', url: 'https://www.qualiteconstruction.com' },
  {
    label: 'Médiation de la consommation',
    url: 'https://www.economie.gouv.fr/mediation-conso',
  },
]

const relatedGuides = [
  { label: 'Garantie parfait achèvement', href: '/guides/garantie-parfait-achevement' },
  { label: 'Garantie décennale', href: '/guides/garantie-decennale' },
  { label: 'Refuser un devis signé', href: '/guides/refuser-devis-artisan-signe' },
  { label: 'Éviter les arnaques artisan', href: '/guides/eviter-arnaques-artisan' },
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
      'malfaçons travaux',
      'recours malfaçons',
      'expertise amiable judiciaire',
      'LRAR artisan',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Malfaçons travaux', url: `/guides/${SLUG}` },
  ])
  const faqSchema = getFAQSchema(faqs)
  const howToSchema = getHowToSchema(howToSteps, {
    name: 'Comment obtenir réparation en cas de malfaçons',
    description:
      'Procédure en 7 étapes pour faire reconnaître et réparer des malfaçons, de la LRAR jusqu’au tribunal.',
    totalTime: 'P90D',
  })
  const schemas = [articleSchema, breadcrumbSchema, faqSchema, howToSchema].filter(
    (s): s is Record<string, unknown> => s !== null
  )
  return (
    <>
      <JsonLd data={schemas} />
      <div className="bg-sand-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Breadcrumb
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Malfaçons travaux' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <ShieldAlert className="w-3.5 h-3.5" aria-hidden />
              Réglementation · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Malfaçons travaux : recours efficaces 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Face à des malfaçons, la stratégie juridique compte plus que la colère. Voici la
              procédure testée : LRAR, expertise, médiation, tribunal. Avec les bonnes preuves et
              les bons délais, 85 % des litiges trouvent une issue favorable en moins de 18 mois.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Arbres de décision malfaçon selon délai</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Délai après réception</th>
                    <th className="p-3 border-b border-sand-200">Garantie activable</th>
                    <th className="p-3 border-b border-sand-200">Action recommandée</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['0-12 mois', 'GPA (1792-6)', 'LRAR + mise en demeure 30 j'],
                    ['12-24 mois', 'Biennale (1792-3)', 'LRAR + expertise amiable'],
                    ['2-10 ans', 'Décennale (1792)', 'DO + LRAR + référé'],
                    ['5-10 ans non-structurel', 'Contractuelle 5 ans', 'LRAR + tribunal'],
                  ].map(([d, g, a]) => (
                    <tr key={d} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{d}</td>
                      <td className="p-3 font-semibold">{g}</td>
                      <td className="p-3">{a}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Ne jamais suspendre le chantier sans LRAR.</strong> Suspension unilatérale =
                risque retournement juridique contre vous (mise en demeure par artisan, intérêts
                moratoires). TOUJOURS notifier d’abord par écrit, conserver preuves.
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
              Autres recours <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
