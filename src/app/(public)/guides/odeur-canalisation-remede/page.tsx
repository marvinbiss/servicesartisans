import type { Metadata } from 'next'
import Link from 'next/link'
import { Droplets, Wrench, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema, getHowToSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'odeur-canalisation-remede'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Jean-Pierre Duval'

export const revalidate = 86400

const TITLE = 'Odeur de canalisation : 4 causes et les vrais remèdes en 2026'
const DESCRIPTION =
  'Odeur d’égout dans la maison : 4 causes typiques (siphon sec, évent bouché, graisse, canalisation cassée) et remèdes par cause. Diagnostic, DIY, quand appeler un plombier.'

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
    authors: [`${SITE_URL}/equipe/jean-pierre-duval`],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
}

const tldr = [
  '4 causes typiques : siphon asséché, ventilation primaire bouchée, bouchon graisseux, canalisation fissurée.',
  'Le siphon est la 1ʳᵉ cause (70 % des cas) — versez 1 L d’eau dans chaque point d’eau peu utilisé avant tout dépannage.',
  'Les produits chimiques du commerce (déboucheurs acides) attaquent les joints et fragilisent les PVC à long terme.',
  'Méthode DIY sûre : bicarbonate + vinaigre blanc + eau très chaude. Efficace sur graisse et odeur, doux pour canalisations.',
  'Odeur persistante après ces remèdes = appel plombier (évent, bouchon profond, fissure, mérule, rats).',
]

const howToSteps = [
  {
    name: 'Remplir les siphons peu utilisés',
    text: "Le siphon est le coude en U qui retient en permanence un peu d'eau. Cette garde d'eau bloque la remontée des odeurs d'égout. Après quelques semaines sans usage (évier de buanderie, lavabo de salle d'eau rare, douche d'appoint), l'eau s'évapore et l'odeur remonte. Versez 1 litre d'eau dans chaque bonde peu utilisée. Odeur disparue sous 30 min = problème résolu.",
  },
  {
    name: 'Nettoyer bonde et siphon accessibles',
    text: "Démontez la bonde (souvent à la main pour lavabo, parfois avec clé). Retirez cheveux, résidus, dépôts. Dévissez le siphon à main nue en mettant un seau en-dessous, videz-le, nettoyez à l'eau chaude savonneuse. Remontez avec joint torique en bon état. Tester : eau courante, pas de fuite au joint.",
  },
  {
    name: 'Dégraisser avec bicarbonate + vinaigre',
    text: "Versez 1/2 tasse de bicarbonate de soude dans la bonde, suivi de 1/2 tasse de vinaigre blanc. Réaction mousseuse. Laissez agir 30 minutes. Rincez à l'eau bouillante (attention aux canalisations en PVC : eau à 60-70 °C max, pas 100 °C, sinon déformation). Efficace sur dépôts graisseux de cuisine, résidus savon + cheveux de salle de bain.",
  },
  {
    name: 'Vérifier la ventilation primaire',
    text: "L'évacuation d'eaux usées a besoin d'une entrée d'air en toiture (évent primaire) pour éviter le désamorçage des siphons. Quand vous tirez la chasse et entendez un bruit de succion (« glouglou ») ou que les siphons voisins se vident, l'évent est probablement bouché (feuilles, mousse, nid d'oiseau). Solution : inspection toiture (nacelle ou échelle, selon hauteur) pour dégager l'embout d'évent. 80-200 € en intervention plombier-couvreur.",
  },
  {
    name: 'Dégager un bouchon graisseux ou profond',
    text: "Pour une canalisation cuisine partiellement obstruée : furet manuel (10-30 €) ou pompe de déblocage (20-40 €), après avoir ôté l'eau stagnante. Pour un bouchon persistant ou à distance : plombier (80-150 € intervention + tarif à l'heure). Les déboucheurs chimiques (déboucheurs acides ou caustiques) sont à éviter : ils corrodent joints et tuyaux PVC, particulièrement sur installations anciennes.",
  },
  {
    name: 'Diagnostic plombier si odeur persistante',
    text: "Si après siphon + dégraissage + évent, l'odeur revient sous 48-72 h, appelez un plombier. Causes à explorer : fissure sur canalisation enterrée (test fumée coloré ou caméra d'inspection 150-400 €), raccord fuyard masqué dans un mur, animal mort dans conduit, entrée de rat ou mérule dans évacuation. Interventions plus lourdes mais nécessaires.",
  },
]

const faqs = [
  {
    question: 'Pourquoi une odeur d’égout apparaît dans ma maison ?',
    answer:
      "Quatre causes expliquent 95 % des cas. (1) Siphon asséché dans un point d'eau peu utilisé (70 %). (2) Ventilation primaire d'évacuation bouchée en toiture (10 %). (3) Bouchon graisseux dans une canalisation cuisine (10 %). (4) Fissure sur canalisation enterrée, raccord fuyard, mérule ou rat dans conduit (5 %). Le diagnostic suit l'ordre de fréquence : commencez toujours par la cause la plus probable.",
  },
  {
    question: 'Les déboucheurs chimiques sont-ils efficaces ?',
    answer:
      "Oui à court terme, mais au prix d'effets secondaires. Les déboucheurs caustiques (soude) et acides (sulfurique dilué) dissolvent cheveux et graisses en 15-30 minutes. Mais ils : corrodent les joints caoutchouc, peuvent fragiliser les PVC anciens, libèrent des vapeurs irritantes, sont dangereux à mélanger (ne jamais combiner caustique et acide : réaction explosive). Pour une utilisation occasionnelle, respectez la notice. Pour un problème récurrent, traitez la cause (plombier + éventuellement remplacement tronçon).",
  },
  {
    question: 'L’odeur revient après dégraissage : pourquoi ?',
    answer:
      "Plusieurs hypothèses. (1) Le bouchon était plus profond qu'atteint par le dégraissage de surface : essayez un furet plus long, sinon plombier. (2) La cause n'est pas un bouchon mais un défaut d'évent : le dégraissage traite un symptôme, pas la vraie cause. (3) Une fissure ou un raccord fuyard laisse passer des vapeurs : un plombier avec caméra d'inspection est nécessaire. Le point commun : dégraissage = entretien, pas réparation durable.",
  },
  {
    question: 'Comment savoir si un évent est bouché ?',
    answer:
      "Signes typiques. (1) Bruit de succion (« glouglou ») quand vous tirez la chasse ou videz une baignoire. (2) Siphons qui se vident tout seuls en cascade (un siphon voisin perd son eau quand vous videz un autre). (3) Odeurs remontant par plusieurs points d'eau simultanément, même ceux régulièrement utilisés. (4) Évacuation lente généralisée sans bouchon identifié. Un plombier confirme en quelques minutes par test fumigène ou mesure de dépression.",
  },
  {
    question: 'Odeur dans salle de bain inutilisée : que faire ?',
    answer:
      "Typique du siphon asséché. Versez 500 ml d'eau dans chaque bonde (lavabo, douche, baignoire). Dans 70 % des cas, l'odeur disparaît en 30-60 minutes. Pour éviter la récidive lors d'absences prolongées : mettre un film plastique ou un bouchon sur la bonde (réduit l'évaporation) ou verser une cuillère d'huile minérale qui flotte et ralentit l'évaporation (tenir 3-6 semaines).",
  },
  {
    question: 'Peut-on vivre avec une odeur d’égout à court terme ?',
    answer:
      "L'odeur elle-même n'est pas toxique à faible concentration. Mais elle indique une entrée d'air vicié (gaz : méthane, H2S à concentration très faible, bactéries aérosolisées). Une exposition prolongée (semaines) peut provoquer céphalées, fatigue, nausées. Pour personnes asthmatiques ou immunodéprimées, le traitement est prioritaire. Si l'odeur est forte et stable : faire intervenir un plombier sous 48-72 h.",
  },
  {
    question: 'Le plombier peut-il utiliser une caméra d’inspection ?',
    answer:
      "Oui. La caméra endoscopique d'inspection (type Wöhler, Rothenberger) permet de visualiser l'intérieur des canalisations jusqu'à 30-50 m. Tarif : 150-400 € pour une intervention d'1-2 heures, selon la longueur et la complexité du réseau. Permet d'identifier avec certitude un bouchon, une fissure, une infiltration, un animal. Utile pour chantier lourd (remplacement canalisation enterrée à 5 000-20 000 €) : la caméra évite de creuser au hasard.",
  },
  {
    question: 'Les WC sentent l’égout : est-ce la même chose ?',
    answer:
      "Causes similaires mais avec une spécificité : les WC ont un siphon intégré de plus grande capacité (la cuvette elle-même). L'assèchement est rare. Causes fréquentes côté WC : joint de pipe défectueux (anneau cire ou caoutchouc à la base), évent bouché, bouchon dans la colonne d'évacuation des eaux usées (plus épaisse que pour lavabo/douche). Pour un WC malodorant sans bouchon visible : resserrage ou remplacement du joint de pipe (30-80 €), sinon plombier.",
  },
]

const sources = [
  {
    label: 'DTU 60.1 — Plomberie sanitaire (ventilation primaire)',
    url: 'https://boutique.afnor.org',
    note: 'Règles de l’art ventilation évacuation',
  },
  {
    label: 'INRS — Risques liés aux gaz d’égout (H2S)',
    url: 'https://www.inrs.fr',
  },
  {
    label: 'Service-public.fr — Assainissement individuel',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F32573',
  },
  {
    label: 'Qualigaz — Installations sanitaires',
    url: 'https://www.qualigaz.com',
  },
]

const relatedGuides = [
  {
    label: 'Humidité mur intérieur : causes et solutions',
    href: '/guides/humidite-mur-interieur-solution',
  },
  {
    label: 'Moisissure mur chambre : traitement',
    href: '/guides/moisissure-mur-chambre-traitement',
  },
  { label: 'Comment demander un devis de travaux', href: '/guides/comment-faire-devis-travaux' },
  { label: 'Comparer 3 devis d’artisans', href: '/guides/comparer-3-devis-artisans' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Plomberie & Sanitaire',
    keywords: [
      'odeur canalisation',
      'odeur égout maison',
      'siphon sec',
      'ventilation primaire',
      'déboucher canalisation',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Odeur de canalisation', url: `/guides/${SLUG}` },
  ])
  const faqSchema = getFAQSchema(faqs)
  const howToSchema = getHowToSchema(howToSteps, {
    name: 'Traiter une odeur de canalisation en 6 étapes',
    description:
      'Protocole pour identifier la cause d’une odeur d’égout et la traiter sans endommager les installations.',
    totalTime: 'PT1H',
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Odeur de canalisation' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Droplets className="w-3.5 h-3.5" aria-hidden />
              Plomberie &amp; Sanitaire · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Odeur de canalisation : les 4 causes et les vrais remèdes
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Une odeur d’égout dans la maison n’est presque jamais grave, mais elle révèle toujours
              un défaut précis qu’il faut traiter pour qu’elle ne revienne pas. Avant d’acheter un
              déboucheur chimique, quatre vérifications prennent 15&nbsp;minutes et résolvent
              7&nbsp;cas sur 10. Pour les 3 restants, voici quand appeler un plombier et ce qu’il
              cherchera.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Les 4 causes d’odeur par ordre de fréquence</h2>
            <h3>1. Siphon asséché (70 % des cas)</h3>
            <p>
              Le siphon est le coude en U qui retient en permanence un peu d’eau. Cette « garde
              d’eau » bloque physiquement la remontée des odeurs d’égout. En l’absence d’usage
              (évier de buanderie, lavabo de chambre d’amis, douche d’appoint, bonde de sol de
              cave), l’eau s’évapore en 2-6 semaines. L’odeur remonte alors librement dans la pièce.
            </p>
            <h3>2. Ventilation primaire bouchée (10 %)</h3>
            <p>
              Toute installation d’évacuation d’eaux usées est complétée par un évent primaire — un
              tuyau vertical qui remonte en toiture et permet l’entrée d’air pour équilibrer les
              pressions. Si cet évent est bouché (feuilles, mousse, nid d’oiseau, glace en hiver),
              l’écoulement d’eau crée une dépression qui vide les siphons voisins, puis laisse
              remonter les odeurs.
            </p>
            <h3>3. Bouchon graisseux accumulé (10 %)</h3>
            <p>
              Typique des évacuations de cuisine : graisses, huiles, restes alimentaires se
              solidifient sur les parois, réduisent le diamètre, retiennent l’eau stagnante qui se
              décompose. Odeur souvent localisée (un seul point d’eau), qui s’aggrave avec l’eau
              chaude.
            </p>
            <h3>4. Défaut structurel (5 %)</h3>
            <p>
              Canalisation fissurée (racines d’arbre, affaissement de terrain, gel), joint de pipe
              WC défectueux, mérule ou rat dans un conduit non utilisé, infiltration d’eaux usées
              dans le sous-sol. Ces cas nécessitent un plombier avec caméra d’inspection et
              potentiellement des travaux lourds (1 500 à 20 000 € selon la situation).
            </p>

            <h2>Protocole en 6 étapes</h2>
            <ol>
              {howToSteps.map((s, i) => (
                <li key={i}>
                  <strong>{s.name}.</strong> {s.text}
                </li>
              ))}
            </ol>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Sécurité.</strong> Ne mélangez jamais deux produits chimiques de débouchage.
                Caustiques (soude) et acides (déboucheurs tartre-graisse) réagissent violemment et
                libèrent des vapeurs dangereuses. Port de gants et lunettes obligatoire pour toute
                intervention avec produits chimiques ; ventilation pendant et après.
              </p>
            </div>

            <h2>Remèdes DIY doux et efficaces</h2>
            <ul>
              <li>
                <strong>Bicarbonate + vinaigre blanc.</strong> 1/2 tasse bicarbonate, 1/2 tasse
                vinaigre blanc, 30 minutes de pose, rinçage à l’eau chaude (60-70 °C). Efficace sur
                graisse et odeurs, respecte joints et PVC.
              </li>
              <li>
                <strong>Eau très chaude simple.</strong> 1 à 2 litres d’eau à 70 °C versés dans la
                bonde. Fait fondre graisses légères, sans produit.
              </li>
              <li>
                <strong>Cristaux de soude.</strong> 100 g dissous dans 1 L d’eau bouillante, versés
                dans la bonde. Plus efficace que bicarbonate, plus doux que la soude caustique pure.
              </li>
              <li>
                <strong>Gros sel + eau bouillante.</strong> Utile en entretien préventif mensuel :
                200 g de gros sel, laisser 10 min, rincer à l’eau bouillante.
              </li>
            </ul>

            <h2>Quand appeler un plombier sans hésiter</h2>
            <ul className="not-prose space-y-2">
              {[
                'Odeur qui revient sous 48 h après siphon rempli et dégraissage',
                'Bruits de succion (« glouglou ») systématiques à la chasse d’eau',
                'Odeur sur plusieurs points d’eau simultanément dans plusieurs pièces',
                'Eau stagnante visible dans cave/sous-sol',
                'Écoulement lent persistant malgré 2 dégraissages DIY',
                'Anomalie au pied de WC (trace d’humidité au joint de pipe)',
              ].map((c) => (
                <li key={c} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" aria-hidden />
                  <span>{c}</span>
                </li>
              ))}
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Wrench className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Trouver un plombier vérifié
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Devis plombier à partir de 80 € l’intervention. Pour diagnostic caméra, comptez
                    150-400 €. Comparez 3 devis avant choix — sauf en urgence véritable (dégât des
                    eaux, refoulement).
                  </p>
                  <Link
                    href="/services/plombier"
                    className="inline-flex items-center gap-1.5 text-primary-700 font-semibold hover:underline"
                  >
                    Annuaire des plombiers <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>

            <h2>Tarifs plombier 2026</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Intervention</th>
                    <th className="p-3 border-b border-sand-200">Fourchette TTC</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-sand-100">
                    <td className="p-3">Débouchage simple lavabo / douche</td>
                    <td className="p-3">80 à 200 €</td>
                  </tr>
                  <tr className="border-b border-sand-100">
                    <td className="p-3">Débouchage cuisine (bouchon graisseux)</td>
                    <td className="p-3">150 à 300 €</td>
                  </tr>
                  <tr className="border-b border-sand-100">
                    <td className="p-3">Dégagement évent toiture</td>
                    <td className="p-3">150 à 400 €</td>
                  </tr>
                  <tr className="border-b border-sand-100">
                    <td className="p-3">Caméra d’inspection endoscopique</td>
                    <td className="p-3">150 à 400 €</td>
                  </tr>
                  <tr className="border-b border-sand-100">
                    <td className="p-3">Hydrocurage haute pression</td>
                    <td className="p-3">200 à 600 €</td>
                  </tr>
                  <tr>
                    <td className="p-3">Remplacement tronçon canalisation enterrée</td>
                    <td className="p-3">1 500 à 20 000 €</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Tarifs hors urgence (nuit, dimanche, férié : +50 à 100 %). Majoration kilométrique
                possible en zone rurale.
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
              href="/services/plombier"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un plombier <Wrench className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
