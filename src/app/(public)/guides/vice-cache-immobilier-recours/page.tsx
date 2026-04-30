import type { Metadata } from 'next'
import Link from 'next/link'
import { Gavel, ArrowRight, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'vice-cache-immobilier-recours'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Sophie Martin'
const AUTHOR_SLUG = 'sophie-martin'

export const revalidate = 86400

const TITLE = 'Vice caché immobilier : recours 2026'
const DESCRIPTION =
  'Vice caché immobilier 2026 : art. 1641, 4 conditions (antérieur, grave, caché, inconnu), délai 2 ans découverte, action rédhibitoire ou estimatoire.'

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
  'Vice caché = défaut art. 1641 Code civil qui rend le bien impropre à sa destination ou diminue considérablement sa valeur.',
  '4 conditions cumulatives : (1) antérieur à la vente, (2) caché (non détectable examen normal), (3) inconnu acheteur, (4) grave.',
  'Délai d’action : 2 ans à compter de la DÉCOUVERTE du vice (art. 1648), pas de la vente. Prescription globale 5 ans art. 2224.',
  '2 options de recours : (a) ACTION RÉDHIBITOIRE = annulation vente + remboursement prix ; (b) ACTION ESTIMATOIRE = conservation bien + diminution prix.',
  'Clause "vendu en l’état" non exonératoire si vendeur PRO ou de mauvaise foi (dol). Protège uniquement vendeur particulier de bonne foi.',
]

const faqs = [
  {
    question: 'Qu’est-ce qu’un vice caché immobilier ?',
    answer:
      'Définition art. 1641 Code civil : « défauts cachés de la chose vendue qui la rendent impropre à l’usage auquel on la destine, ou qui diminuent tellement cet usage, que l’acheteur ne l’aurait pas acquise, ou n’en aurait donné qu’un moindre prix ». EXEMPLES fréquents : (1) FISSURES STRUCTURELLES cachées (sol enduit masquant tassement différentiel ou fondations défaillantes) ; (2) HUMIDITÉ/MÉROSE cachée (plancher pourri sous carrelage récent, murs traités superficiellement) ; (3) TERMITES OU INSECTES XYLOPHAGES masqués (traitement superficiel charpente) ; (4) TOITURE hors d’usage rafistolée (infiltrations après 1ère pluie) ; (5) INSTALLATION ÉLECTRIQUE dangereuse dissimulée (tableau refait cosmétiquement, câblage pourri en amont) ; (6) AMIANTE ou PLOMB non déclarés ; (7) RUPTURE D’UN CONTRAT DE CONCESSION (eau, gaz, électricité) non mentionné ; (8) INONDATION zone cachée dans acte, rapport agent immobilier omis ; (9) SOL POLLUÉ (ancien site industriel) ; (10) SERVITUDES CACHÉES (canalisations, passage). NON-VICES : dégradations visibles à l’examen normal, vétusté normale (peintures à refaire, toiture >30 ans standard), défauts acceptés dans prix de vente bas.',
  },
  {
    question: 'Quelles conditions pour invoquer un vice caché ?',
    answer:
      '4 conditions CUMULATIVES pour succès juridique (jurisprudence Cass. civ. 3ème) : (1) VICE ANTÉRIEUR à la vente — le défaut doit exister au jour signature acte authentique (pas survenu après). Prouvé par expertise judiciaire : datation fissures, analyse couches peinture, datation charpente termites ; (2) VICE CACHÉ — pas détectable par un acheteur "moyennement attentif" lors des visites normales. Défauts apparents (taches humidité, lézardes visibles, canalisations fuyantes) NON couverts car l’acheteur aurait dû voir. Masquage volontaire (peinture fraîche couvrant fissures) renforce preuve ; (3) VICE INCONNU DE L’ACHETEUR au moment de la vente — présomption ignorance acheteur. Si diagnostics obligatoires mentionnent le vice OU si acte de vente le mentionne, acheteur réputé informé ; (4) VICE GRAVE — rend bien impropre à sa destination OU diminue significativement sa valeur/usage. Petits défauts normaux (peinture à refaire, vétusté chaudière 15 ans) non couverts. CHARGE DE LA PREUVE : sur l’acheteur (art. 1353 Code civil). Expertise bâtiment 500-2 500 € indispensable avant procédure.',
  },
  {
    question: 'Quel délai pour agir en vice caché ?',
    answer:
      'Délais cruciaux (art. 1648 Code civil) : (1) DÉLAI D’ACTION : 2 ANS à compter de la DÉCOUVERTE du vice — pas de la vente. Exemple : vente 2024, découverte fissures structurelles 2026 = action possible jusqu’en 2028 ; (2) PRESCRIPTION GLOBALE 5 ans art. 2224 Code civil : au-delà de 5 ans après constatation vice, impossible même si dans le délai 2 ans ; (3) ACTION RAPIDE CONSEILLÉE : (a) conserver preuves photographiques + témoignages + expertises ; (b) mise en demeure recommandée + courrier recommandé AR vendeur sous 30-90 jours découverte ; (c) assignation judiciaire tribunal judiciaire si pas accord amiable ; (4) INTERRUPTION DÉLAI : reconnaissance du vice par vendeur (lettre, mail) OU demande d’expertise judiciaire devant juge ; (5) SUSPENSION : négociation amiable prouvée peut suspendre mais ATTENTION à ne pas laisser écouler 2 ans ; (6) CAS RARE DE "CONTINUITÉ" : vice permanent s’aggravant (humidité rampante) peut repartir délai à zéro à chaque aggravation constatée. CONSEIL : saisir avocat spécialisé immobilier immédiatement après découverte + expertise amiable contradictoire avant assignation. Ne jamais laisser écouler 24 mois.',
  },
  {
    question: 'Quels recours et indemnités en cas de vice caché ?',
    answer:
      '2 actions au choix de l’acheteur (art. 1644 Code civil) : (1) ACTION RÉDHIBITOIRE = ANNULATION DE LA VENTE. Acheteur rend le bien au vendeur, vendeur rembourse INTÉGRALEMENT le prix + frais (notaire, agence, déménagement, travaux faits de bonne foi). Adaptée si vice irréparable ou extrêmement grave (inhabitable, démolition) ; (2) ACTION ESTIMATOIRE = RÉDUCTION DU PRIX. Acheteur garde le bien, obtient remboursement partiel correspondant au coût des travaux de remise en état + préjudice moral/économique. Adaptée si vice réparable ou acheteur veut conserver bien (marché tendu) ; (3) INDEMNITÉS COMPLÉMENTAIRES si VENDEUR DE MAUVAISE FOI (dol, dissimulation intentionnelle, expertise établit connaissance vice) : art. 1645 Code civil prévoit dommages-intérêts SUPPLÉMENTAIRES couvrant TOUS préjudices (relogement temporaire, perte de jouissance, préjudice moral, frais d’expertise) — doublement la facture potentielle ; (4) VENDEUR PROFESSIONNEL (promoteur, marchand de biens) est présumé DE MAUVAISE FOI (art. 1646-1 Code civil) = automatiquement dommages-intérêts possibles ; (5) AGENT IMMOBILIER MIS EN CAUSE : obligation de conseil et information art. 1240 Code civil (Cass. com. 2016-1025). Demande devant juge : 10 000-100 000 € selon préjudice.',
  },
  {
    question: 'La clause "vendu en l’état" protège-t-elle le vendeur ?',
    answer:
      'Portée de la clause exonératoire (art. 1643 Code civil) : (1) PRINCIPE : clause "vendu en l’état", "sans garantie de vices cachés", "acheteur prend le bien tel quel" est VALABLE et exonère le vendeur de la garantie art. 1641 ; (2) EXCEPTIONS MAJEURES (neutralisent la clause) : (a) VENDEUR DE MAUVAISE FOI — dissimulation volontaire vice connu = DOL au sens art. 1137 Code civil, clause inopposable, dommages-intérêts doublés ; (b) VENDEUR PROFESSIONNEL (promoteur, marchand biens, agent immobilier achetant pour revendre) est RÉPUTÉ CONNAÎTRE tous vices — clause "en l’état" TOTALEMENT INOPÉRANTE art. 1645 Code civil (Cass. civ. 1ère 2019-556) ; (c) VICE GRAVEMENT DANGEREUX (sécurité habitation, toxicité) : clause ne peut exonérer atteinte sécurité personnes ; (3) CAS TYPIQUE : vendeur particulier de bonne foi (vrai ancien propriétaire, pas spécialiste immobilier) bénéficie de la clause sauf si preuve contradictoire ; (4) PRATIQUE NOTARIALE : clauses doivent être rédigées EXPLICITEMENT dans acte authentique (pas compromis seul). Simple mention "sans garantie de vices cachés" dans compromis ≠ exonération si non reprise dans acte définitif ; (5) CONSEIL ACHETEUR : ne pas accepter clauses d’exonération larges si bien ancien + risque de défauts multiples. Demander diagnostic approfondi pré-achat (500-1 500 € expert bâtiment, rentable).',
  },
]

const sources = [
  {
    label: 'Art. 1641-1649 Code civil — Vices cachés',
    url: 'https://www.legifrance.gouv.fr',
  },
  { label: 'Art. 1648 Code civil — Délai 2 ans', url: 'https://www.legifrance.gouv.fr' },
  { label: 'Art. 2224 Code civil — Prescription', url: 'https://www.legifrance.gouv.fr' },
  { label: 'Service-public — Vice caché', url: 'https://www.service-public.fr' },
  { label: 'ANIL — Litiges immobiliers', url: 'https://www.anil.org' },
]

const relatedGuides = [
  {
    label: 'Expertise bâtiment quand faire appel',
    href: '/guides/expertise-batiment-prix-quand-faire-appel',
  },
  { label: 'Diagnostics vente obligatoires', href: '/guides/diagnostics-vente-obligatoires' },
  { label: 'Fissures maison inquiétantes', href: '/guides/fissures-maison-inquietantes' },
  { label: 'Garantie décennale', href: '/guides/garantie-decennale' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Litige',
    keywords: [
      'vice caché immobilier',
      'recours vice caché',
      'art. 1641 Code civil',
      'action rédhibitoire estimatoire',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Vice caché immobilier', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Vice caché immobilier' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Gavel className="w-3.5 h-3.5" aria-hidden />
              Litige · Guide vérifié
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Vice caché immobilier : recours et délai 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Après achat, vous découvrez un vice caché ? Article 1641 du Code civil : 4 conditions
              cumulatives, délai 2 ans dès la découverte, recours rédhibitoire ou estimatoire. Voici
              la procédure 2026.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>4 conditions cumulatives du vice caché</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Condition</th>
                    <th className="p-3 border-b border-sand-200">Définition</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Antérieur', 'Existait au jour signature acte authentique'],
                    ['Caché', 'Non détectable à un examen normal par acheteur'],
                    ['Inconnu', 'Acheteur ignorait le vice au moment vente'],
                    ['Grave', 'Rend bien impropre ou réduit fortement valeur'],
                  ].map(([c, d]) => (
                    <tr key={c} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{c}</td>
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
            <Link href="/contact" className="inline-flex items-center gap-1 hover:text-primary-700">
              Être accompagné <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
