import type { Metadata } from 'next'
import Link from 'next/link'
import { FileSearch, ArrowRight, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'expertise-batiment-prix-quand-faire-appel'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Sophie Martin'
const AUTHOR_SLUG = 'sophie-martin'

export const revalidate = 86400

const TITLE = 'Expertise bâtiment 2026 : prix et recours'
const DESCRIPTION =
  'Expert bâtiment 2026 : prix 400-2 500 € HT, avant achat 500-900 €, malfaçon 600-1 500 €, judiciaire 2 000-5 000 €, CNEAF ou CIBTP certifié.'

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
  'Prix 2026 HT : expertise pré-achat maison 500-900 €, expertise malfaçon 600-1 500 €, expertise judiciaire 2 000-5 000 €, contre-expertise assurance 400-1 000 €.',
  'Quand faire appel : avant achat immobilier, litige chantier, désordres post-réception, fissures suspectes, sinistre, contre-expertise assurance.',
  'Types experts : expert construction CNEAF, expert judiciaire cour appel, expert amiable CIBTP, expert assurance mandaté compagnie.',
  'Rapport écrit remis 2-6 semaines : constat état + causes + responsabilités + chiffrage reprises + recommandations.',
  'Expertise amiable non opposable judiciairement sans contradictoire. Expertise judiciaire seule vaut preuve tribunal (art. 232 CPC).',
]

const faqs = [
  {
    question: 'Quand faire appel à un expert bâtiment ?',
    answer:
      '10 situations types : (1) AVANT ACHAT IMMOBILIER maison/copropriété — détecter vices apparents/cachés, estimer coût travaux, négocier prix (économise souvent 10-30 000 € prix d’achat). 500-900 € HT pour 2-3h visite ; (2) FISSURES SUSPECTES apparues (mur, dalle, façade) — distinguer tassement différentiel dangereux / retrait enduit inoffensif. Expertise décennale 400-800 € ; (3) MALFAÇONS CHANTIER pendant/après — défauts apparents, non-conformité DTU, devis non respecté. 600-1 500 € HT ; (4) DÉGÂT DES EAUX non couvert assurance — recherche fuite origine + responsabilité voisin/copro ; (5) DÉSORDRES APRÈS RÉCEPTION TRAVAUX — actionner décennale ou biennale (art. 1792) ; (6) CONTRE-EXPERTISE assurance après sinistre (sinistre incendie, tempête, fissures sécheresse) — contester rapport expert assurance 400-1 000 € ; (7) SUCCESSION ou DIVORCE — valorisation objective immobilier ; (8) LITIGE VOISINAGE (mitoyenneté, limite propriété, nuisances construction) ; (9) INSALUBRITÉ / PÉRIL IMMINENT (humidité, plomb, amiante) — mesures santé publique ; (10) RÉNOVATION LOURDE — diagnostic préalable structure + méthode travaux. Dans tous les cas : expert INDÉPENDANT (pas constructeur/architecte du projet).',
  },
  {
    question: 'Quel est le prix d’une expertise bâtiment en 2026 ?',
    answer:
      'Prix 2026 HT selon mission : (1) EXPERTISE PRÉ-ACHAT maison standard 100 m² 2h visite + rapport 5-10 pages : 500-900 € ; (2) EXPERTISE PRÉ-ACHAT grande maison >200 m² ou immeuble : 900-1 600 € ; (3) EXPERTISE MALFAÇON 1 litige précis (fissures, isolation, étanchéité) 1 mission : 600-1 500 € ; (4) EXPERTISE COMPLÈTE DÉSORDRES CHANTIER multi-lots : 1 200-3 000 € ; (5) EXPERTISE AMIABLE CONTRADICTOIRE (avec artisan + assureurs) : 1 500-4 000 € (temps + déplacements x2-3) ; (6) EXPERTISE JUDICIAIRE sur ordonnance tribunal (art. 232 CPC) : 2 000-5 000 € — provision consignée + honoraires fixés par juge ; (7) CONTRE-EXPERTISE ASSURANCE après rapport expert compagnie : 400-1 000 € (1-2h + rapport) ; (8) EXPERTISE CATASTROPHE NATURELLE (sécheresse fissures) : 500-1 200 € ; (9) MISE À JOUR ou COMPLÉMENT D’EXPERTISE : 30-50 % mission initiale. Tarifs horaires expert : 120-250 € HT/h selon qualification (ingénieur, architecte DPLG, ex-BTP avec 15+ ans expérience). Frais déplacement : 0,50-0,80 €/km selon barème 2026. Honoraires PROPORTIONNELS au préjudice possibles 2-10 %.',
  },
  {
    question: 'Quelle est la différence entre expertise amiable et judiciaire ?',
    answer:
      'Distinction cruciale pour recours : (1) EXPERTISE AMIABLE : sollicitée par une partie (propriétaire, artisan, assureur) auprès d’un expert libéral. AVANTAGES : rapide (2-6 semaines), moins chère, souple. INCONVÉNIENTS : non-opposable à la partie adverse sans ACCORD (contradictoire), peut être écartée par tribunal, n’engage que la partie qui l’a commandée ; (2) EXPERTISE AMIABLE CONTRADICTOIRE : toutes les parties sont convoquées, débattent du constat sur place, signent un procès-verbal. VALEUR PROBATOIRE RENFORCÉE devant tribunal ; (3) EXPERTISE JUDICIAIRE : désignée par juge du tribunal (ordonnance art. 232 à 284 CPC). Expert INSCRIT sur liste cour d’appel (expertise cour), indépendant et impartial par serment. PROCÉDURE CONTRADICTOIRE obligatoire (toutes parties convoquées). RAPPORT OPPOSABLE À TOUS + VALEUR PROBATOIRE FORTE. Délai 6-18 mois, coût 2 000-15 000 € (provision consignée puis répartition finale) ; (4) CONSEIL : commencer par expertise amiable pour évaluer dossier + tentative conciliation. Si échec, saisir juge pour expertise judiciaire — permet d’imposer contradictoire + rapport probant. Coût expertise judiciaire MIS À LA CHARGE du perdant en fin procès (art. 696 CPC).',
  },
  {
    question: 'Comment choisir un expert en bâtiment fiable ?',
    answer:
      'Critères de sélection : (1) CERTIFICATION / QUALIFICATION — vérifier inscription CNEAF (Compagnie Nationale Experts Architectes France), CIBTP (Centre Ingénierie Bâtiment Travaux Publics), CESI (ex-professionnels construction), ou expert près cour d’appel pour missions judiciaires. Site du TGI/cour d’appel liste officielle ; (2) EXPÉRIENCE PROFESSIONNELLE ANTÉRIEURE — ingénieur BTP, architecte DPLG, ex-artisan 15+ ans, ex-bureau études structures. Éviter "experts" reconversion express sans parcours technique ; (3) SPÉCIALITÉ CORRESPONDANTE au dossier : structure (fissures, maçonnerie), couverture (fuites), électricité/plomberie, VRD voirie, humidité, acoustique. Expert généraliste ≠ spécialiste ; (4) ASSURANCE RC PROFESSIONNELLE expert art. L141-4 CCH obligatoire — vérifier attestation annuelle ; (5) DEVIS DÉTAILLÉ avant mission — étapes, temps passé, livrables, coûts annexes (déplacements, laboratoire si analyses amiante/plomb) ; (6) RÉPUTATION : avis Google, références clients antérieurs, publications/jurisprudence ; (7) INDÉPENDANCE : pas de lien avec artisan/agent immobilier/vendeur (conflit intérêts) ; (8) LANGAGE CLAIR — rapport pédagogique lisible pour tribunal + assureur, pas jargon technique stérile. Expert proche CGA/CNEAF : tarif horaire 120-180 € (standard), 200-300 € grands experts reconnus.',
  },
  {
    question: 'Que contient un rapport d’expertise bâtiment ?',
    answer:
      'Structure standard rapport expertise (10-50 pages + annexes photos) : (1) PAGE DE GARDE : identité expert + qualification + adresse bien + date visite + parties présentes + objet mission ; (2) RAPPEL DU CONTEXTE : description maison/ouvrage + historique (année construction, travaux antérieurs, désordres constatés par le client) + mission précise sollicitée ; (3) CONSTATS VISUELS + MESURES EFFECTUÉES : description méthodique pièce par pièce + photos commentées (30-100 clichés) + mesures (humidité, fissures, tension électrique, hygrométrie, cartographie) + analyses laboratoire si amiante/plomb/termites ; (4) ANALYSE DES CAUSES TECHNIQUES : recherche mécanismes pathologiques (tassement différentiel, infiltrations, migration capillaire, corrosion), références DTU normes violées, règles art ; (5) RESPONSABILITÉS IDENTIFIÉES : décennale constructeur, biennale équipements, parfait achèvement, maître d’ouvrage (défaut entretien), tiers (voisin, copro) ; (6) CHIFFRAGE DES REPRISES : coûts détaillés par lot + quantités + prix 2026 + délai travaux ; (7) RECOMMANDATIONS + CALENDRIER : ordre priorité, préconisations méthode travaux + prestataires recommandés (RGE, Qualibat) ; (8) CONCLUSION + AVIS TECHNIQUE ; (9) ANNEXES : photos numérotées, plans cotés, schémas, documents consultés (DTU, devis, factures). Rapport DOIT être daté, signé, paginé, envoyé recommandé A/R pour valeur probatoire.',
  },
]

const sources = [
  {
    label: 'Art. 232 à 284 CPC — Expertise judiciaire',
    url: 'https://www.legifrance.gouv.fr',
  },
  { label: 'CNEAF — Compagnie experts architectes', url: 'https://www.cneaf.fr' },
  { label: 'CIBTP — Ingénierie bâtiment', url: 'https://www.cibtp.fr' },
  { label: 'Art. 1792 Code civil — Décennale', url: 'https://www.legifrance.gouv.fr' },
  { label: 'Service-public — Expertise bâtiment', url: 'https://www.service-public.fr' },
]

const relatedGuides = [
  { label: 'Malfaçons travaux recours', href: '/guides/malfacons-travaux-recours' },
  { label: 'Garantie décennale', href: '/guides/garantie-decennale' },
  { label: 'Fissures maison inquiétantes', href: '/guides/fissures-maison-inquietantes' },
  { label: 'Réception travaux PV checklist', href: '/guides/reception-travaux-pv-checklist' },
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
      'expertise bâtiment prix',
      'expert construction CNEAF',
      'expertise judiciaire',
      'contre-expertise assurance',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Expertise bâtiment', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Expertise bâtiment' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <FileSearch className="w-3.5 h-3.5" aria-hidden />
              Litige · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Expertise bâtiment : prix et quand faire appel 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Une expertise bâtiment coûte 400-5 000 € HT selon la mission (pré-achat, malfaçon,
              judiciaire). Voici les prix 2026, les cas d’usage, la différence amiable/judiciaire et
              comment choisir un expert fiable.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Prix expertises bâtiment 2026</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Type expertise</th>
                    <th className="p-3 border-b border-sand-200">Prix HT</th>
                    <th className="p-3 border-b border-sand-200">Situation</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Pré-achat maison 100 m²', '500-900 €', 'Avant signature compromis'],
                    ['Pré-achat grande maison', '900-1 600 €', 'Immeuble ou >200 m²'],
                    ['Malfaçon 1 litige', '600-1 500 €', 'Désordre précis chantier'],
                    ['Amiable contradictoire', '1 500-4 000 €', 'Avec artisan + assureurs'],
                    ['Judiciaire (art. 232 CPC)', '2 000-5 000 €', 'Ordonnance tribunal'],
                    ['Contre-expertise assurance', '400-1 000 €', 'Contester rapport assureur'],
                  ].map(([t, p, s]) => (
                    <tr key={t} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{t}</td>
                      <td className="p-3 font-semibold">{p}</td>
                      <td className="p-3">{s}</td>
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
