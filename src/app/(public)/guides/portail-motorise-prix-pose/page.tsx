import type { Metadata } from 'next'
import Link from 'next/link'
import { DoorOpen, ArrowRight, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'portail-motorise-prix-pose'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Marc Lefebvre'
const AUTHOR_SLUG = 'marc-lefebvre'

export const revalidate = 86400

const TITLE = 'Portail motorisé : prix, pose NF 2026'
const DESCRIPTION =
  'Portail motorisé 2026 : 1 500-6 500 € posé battant/coulissant alu ou PVC, norme NF EN 13241, déclaration préalable mairie, biennale + décennale.'

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
  'Prix 2026 TTC posé : battant 2 vantaux 1 500-3 500 €, coulissant 2 500-4 500 €, alu haut de gamme 4 000-6 500 €.',
  'Norme NF EN 13241 obligatoire (sécurité motorisation) : détection obstacle, arrêt automatique, éclairage.',
  'Déclaration préalable de travaux mairie obligatoire (art. R421-12 Code urba.) + respect PLU (hauteur, couleur, matériau).',
  'Installation requiert menuisier poseur + électricien habilitation BR (230 V). Garanties : biennale 2 ans + décennale 10 ans.',
  'Entretien annuel : graissage charnières/rails, vérif cellules, test batterie secours. Coût 80-150 €/an contrat pro.',
]

const faqs = [
  {
    question: 'Quel prix pour poser un portail motorisé en 2026 ?',
    answer:
      'Prix 2026 TTC fourniture + pose + motorisation : (1) Portail battant 2 vantaux PVC 3 m : 1 500-2 500 € — entrée de gamme ; (2) Portail battant 2 vantaux alu 3 m : 2 500-3 500 € — bon rapport qualité-prix ; (3) Portail coulissant PVC 4 m : 2 500-3 500 € ; (4) Portail coulissant alu 4 m : 3 500-4 500 € ; (5) Portail alu laqué design (ajouré, décor) 3-4 m : 4 000-6 500 € — haut de gamme durable ; (6) Portail fer forgé : 3 500-8 000 € — patrimoine, entretien élevé ; (7) Portail bois exotique : 3 000-5 500 € — esthétique naturelle + entretien saturateur annuel. Répartition coût typique (portail battant alu 3 000 €) : vantaux 900-1 400 €, motorisation 400-800 €, pose + fixation 600-900 €, alimentation électrique + automatisme 200-500 €. Frais cachés : portillon piéton +400-700 €, interphone/visiophone +300-800 €, éclairage ambiance +150-400 €, travaux maçonnerie piliers +800-2 500 € si création.',
  },
  {
    question: 'Portail battant ou coulissant : lequel choisir ?',
    answer:
      'Comparatif 2 technologies : (1) BATTANT 2 VANTAUX — moins cher (-20-30 %), pose sur piliers maçonnés, installation simple, MAIS requiert débattement intérieur 1,5 m × largeur vantail (ex : 3 m × 1,5 m = 4,5 m² perdus dans cour), gêne piéton + voiture stationnée devant, pas adapté terrain en pente vers intérieur ; (2) COULISSANT — +20-30 % de coût (rail + moteur plus robuste), requiert espace latéral (longueur portail × 1,1 = 4,4 m pour 4 m portail), pas de débattement intérieur = cour dégagée, idéal si terrain en pente ou petite cour, plus discret ; (3) BATTANT 1 VANTAIL (rare) : pour ouverture étroite <2 m ; (4) AUTOPORTÉ : coulissant sans rail au sol, pas de rail piège roues/feuilles mortes, mais +15-25 % vs coulissant classique + place encore plus importante. Règle : terrain profond + cour dégagée = coulissant ; terrain plat + piliers existants + budget serré = battant ; intérieur en pente ou petit espace = coulissant impératif.',
  },
  {
    question: 'Faut-il une déclaration de travaux pour un portail ?',
    answer:
      'OUI systématiquement dans 90 % des cas (art. R421-12 Code urba.) : (1) Remplacement portail dans ouverture existante sans modification aspect (même dimensions, même matériau, même couleur) : AUCUNE formalité ; (2) Création nouvelle ouverture OU modification dimensions OU changement matériau/couleur vs existant : DÉCLARATION PRÉALABLE DE TRAVAUX (DP) obligatoire ; (3) Zone ABF 500 m monument historique : DP + avis conforme ABF obligatoire, instruction 2 mois ; (4) Lotissement avec cahier charges : respecter harmonisation (souvent couleurs imposées, type imposé) ; (5) PLU spécifique urbain : hauteur max portail (1,80-2 m souvent), matériau imposé (alu uniquement, ou bois interdit en alignement voie publique) ; (6) Sécurité visibilité voie publique : recul obligatoire (3-6 m recul carrefours, 0,80 m hauteur haie côté rue selon PLU). Dossier Cerfa 13703 + plan masse + coupe + photos + DP couleurs + descriptif technique. Non-respect = amende 6 000 € (art. L480-4 Code urba.).',
  },
  {
    question: 'Quelles normes de sécurité pour un portail motorisé ?',
    answer:
      'Obligations strictes NF EN 13241-1 (portails fermetures industrielles et piétonnes) : (1) DÉTECTION OBSTACLE : système arrête + inverse sens dès détection résistance anormale (souvent 150 N max, norme NF EN 12453) — protège enfants/animaux/véhicules ; (2) CELLULES PHOTOÉLECTRIQUES : minimum 1 paire infrarouge 20-80 cm du sol, bloque fermeture si faisceau coupé ; (3) ÉCLAIRAGE CLIGNOTANT : signale mouvement avant démarrage, allumage 2 secondes avant ouverture/fermeture ; (4) ARRÊT MANUEL ACCESSIBLE : interrupteur intérieur + clé de déverrouillage mécanique en cas panne ; (5) BATTERIE SECOURS : fonctionnement portail 24h coupure élec (obligation assurance fréquente) ; (6) MARQUAGE CE + PLAQUE SIGNALÉTIQUE apposée sur moteur (puissance, n° série, date fabrication) ; (7) ATTESTATION DE MISE EN SERVICE remise par installateur à conserver + carnet entretien. Non-conformité = responsabilité pénale installateur + propriétaire si accident + assurance habitation refuse sinistre. Réviser tous 2 ans (art. R4324-22 Code travail pour usage pro) ou 1x/an pour domestique recommandé.',
  },
  {
    question: 'Quelles garanties et entretien pour un portail motorisé ?',
    answer:
      'Garanties légales (pose par artisan pro) : (1) Parfait achèvement 1 an (art. 1792-6 Code civil) — désordres apparents à la réception ; (2) Biennale 2 ans (art. 1792-3) — éléments d’équipement dissociables = MOTEUR, télécommande, cellules, récepteur. Moteurs Somfy, Came, Nice : 5-7 ans fabricant souvent ; (3) Décennale 10 ans (art. 1792) — éléments indissociables (fixations maçonnerie, pilier, rail sol) ; (4) Garantie fabricant vantaux alu : 10-15 ans selon marque (Franciaflex, Horizal, KSM). (5) Entretien annuel : graissage charnières battant ou rail coulissant (graisse cuivrée 8-12 €), vérification serrage boulons, nettoyage cellules infrarouge (coton alcoolisé), test fin de course + obstacle, batterie secours (remplacement 5-7 ans 40-80 €), coût contrat entretien pro 80-150 €/an ; (6) Panne fréquente : détérioration télécommande (pile), corrosion cellules (joint silicone), désajustement fin de course après hiver. Conserver facture + certificat mise en service pour activer garanties.',
  },
]

const sources = [
  {
    label: 'NF EN 13241 — Portails motorisés',
    url: 'https://www.afnor.org',
  },
  { label: 'Art. R421-12 Code urba. — DP', url: 'https://www.legifrance.gouv.fr' },
  { label: 'NF EN 12453 — Sécurité usage', url: 'https://www.afnor.org' },
  { label: 'NF C 15-100 — Installation BT', url: 'https://www.afnor.org' },
  { label: 'Art. 1792 Code civil — Décennale', url: 'https://www.legifrance.gouv.fr' },
]

const relatedGuides = [
  { label: 'Clôture jardin réglementation', href: '/guides/cloture-jardin-reglementation' },
  { label: 'Déclaration préalable travaux', href: '/guides/declaration-prealable-travaux' },
  { label: 'Domotique installation smart home', href: '/guides/domotique-installation-smart-home' },
  { label: 'Volet roulant motorisé prix', href: '/guides/volet-roulant-motorise-prix' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Menuiserie',
    keywords: [
      'portail motorisé prix',
      'portail coulissant battant',
      'NF EN 13241',
      'pose portail',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Portail motorisé', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Portail motorisé' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <DoorOpen className="w-3.5 h-3.5" aria-hidden />
              Menuiserie · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Portail motorisé : prix et pose 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Un portail motorisé coûte 1 500-6 500 € TTC posé selon le type (battant/coulissant) et
              le matériau. Voici les prix 2026, les normes NF EN 13241, la déclaration préalable et
              l’entretien.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Prix portails motorisés posés 2026</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Configuration</th>
                    <th className="p-3 border-b border-sand-200">Prix posé TTC</th>
                    <th className="p-3 border-b border-sand-200">Usage recommandé</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Battant 2 vantaux PVC 3 m', '1 500-2 500 €', 'Budget serré'],
                    ['Battant 2 vantaux alu 3 m', '2 500-3 500 €', 'Qualité-prix'],
                    ['Coulissant PVC 4 m', '2 500-3 500 €', 'Petit espace intérieur'],
                    ['Coulissant alu 4 m', '3 500-4 500 €', 'Pérennité + esthétique'],
                    ['Alu design 3-4 m', '4 000-6 500 €', 'Haut de gamme'],
                    ['Fer forgé', '3 500-8 000 €', 'Patrimoine'],
                  ].map(([c, p, u]) => (
                    <tr key={c} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{c}</td>
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
