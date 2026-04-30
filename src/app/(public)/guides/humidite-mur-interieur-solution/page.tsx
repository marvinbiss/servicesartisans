import type { Metadata } from 'next'
import Link from 'next/link'
import { Droplets, Home, AlertTriangle, ArrowRight, CheckCircle2, Wrench } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema, getHowToSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'humidite-mur-interieur-solution'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Thomas Bernard'

export const revalidate = 86400

const TITLE = 'Humidité mur intérieur : solutions 2026'
const DESCRIPTION =
  'Humidité mur intérieur : 4 causes (condensation, infiltration, remontées capillaires, fuite), diagnostic visuel, traitements et prix 2026.'

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
    authors: [`${SITE_URL}/equipe/thomas-bernard`],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
}

const tldr = [
  '4 causes principales : condensation (manque ventilation), infiltration (façade, toiture), remontées capillaires (sol humide), fuite (canalisation).',
  'Commencez toujours par le diagnostic avant le traitement : peinture hydrofuge ou traitement mural sans diagnostic = échec garanti.',
  'Condensation → VMC. Infiltration → ravalement/étanchéité. Remontées → injection résine. Fuite → plombier en urgence.',
  'Budget : 150 € (humidimètre pro + visite) à 15 000 € (drainage périphérique + ravalement).',
  'Attendre aggrave toujours : moisissure, décollement plâtre, pourriture des pieds de cloison, odeurs, risques sanitaires (asthme, allergies).',
]

const howToSteps = [
  {
    name: 'Observer la localisation et la forme de l’humidité',
    text: "La localisation donne la cause. Auréoles en haut de mur ou au plafond → infiltration toiture. Taches en bas de mur (jusqu'à ~1,50 m) → remontées capillaires. Condensation froide (fenêtres, angles extérieurs, derrière meubles) → manque de ventilation. Tache irrégulière sur un mur chauffé par derrière (salle de bain, cuisine) → fuite canalisation.",
  },
  {
    name: 'Mesurer le taux d’humidité',
    text: 'Un humidimètre à pointes (30-80 €) ou à contact (150-300 €) mesure en surface et à 1-2 cm de profondeur. Normal : 5-15 %. Alerte : 20-30 %. Critique : >35 %. Plusieurs points en heure différente (matin / soir) permettent de détecter la condensation (taux variable) vs infiltration (taux stable élevé).',
  },
  {
    name: 'Diagnostiquer la cause par exclusion',
    text: "Peut-on identifier une source visible (fuite, défaut de toiture, terrasse non étanche) ? Oui → traitez la source. Non ? Le mur touché est-il un mur extérieur bas ? Oui → probablement remontées capillaires, confirmer avec prélèvement (test de carbure calcium chez un professionnel). Le mur est-il intérieur et froid ? Condensation probable. Le mur est-il proche d'une canalisation ? Fuite à éliminer en priorité.",
  },
  {
    name: 'Confier le diagnostic à un professionnel pour les cas complexes',
    text: "Un diagnostic humidité professionnel (150-400 €) établit le taux d'humidité pondéral (précis), identifie la source et chiffre le traitement. C'est obligatoire avant toute injection résine ou drainage périphérique, qui sont des investissements lourds (3 000-15 000 €).",
  },
  {
    name: 'Choisir le traitement adapté',
    text: "Condensation → VMC simple ou double flux (800-5 000 €) + isolation des parois froides. Infiltration → reprise étanchéité toiture/terrasse/façade + enduit hydrofuge (variable, 1 500-20 000 €). Remontées capillaires → injection résine hydrofuge à la base du mur (40-80 €/ml). Fuite → plombier d'urgence + reprise enduit après séchage (2-4 semaines).",
  },
  {
    name: 'Laisser sécher avant finitions',
    text: "Après traitement de la cause, un mur contaminé met 2 à 6 mois à sécher selon épaisseur et matériaux. Un placo 13 mm : 2-4 semaines. Mur en pierre 60 cm : 4-6 mois. Ne posez jamais une peinture hydrofuge sur mur encore humide : l'eau repoussée vers l'intérieur ressortira ailleurs.",
  },
]

const faqs = [
  {
    question: 'Comment différencier condensation et infiltration ?',
    answer:
      "La condensation apparaît sur les surfaces froides (fenêtres, angles extérieurs, derrière meubles collés au mur), varie selon l'heure (matin après la nuit, après douche), touche les pièces humides (salle de bain, cuisine, buanderie). L'infiltration crée une tache stable, souvent avec auréole et couleur terne ; elle ne disparaît pas quand on ventile, au contraire elle s'étend. Test simple : collez une feuille d'aluminium 48 h sur la zone. Si la surface côté mur est mouillée : infiltration. Si la surface côté pièce est mouillée : condensation.",
  },
  {
    question: 'Les peintures hydrofuges suffisent-elles ?',
    answer:
      "Non. Une peinture hydrofuge bloque localement l'humidité mais ne traite pas la cause. L'eau remonte alors plus haut ou sort sur le mur adjacent. Sur un mur en condensation, elle crée un « effet sac plastique » qui aggrave la moisissure en épaisseur. Elle n'a d'intérêt qu'en finition, APRÈS traitement de la cause et séchage complet.",
  },
  {
    question: 'Combien de temps faut-il pour sécher un mur humide ?',
    answer:
      "Cela dépend de l'épaisseur, du matériau et de l'ambiance. Placoplâtre 13 mm : 2-4 semaines. Plâtre sur brique : 1-2 mois. Mur en parpaing enduit : 2-4 mois. Mur en pierre massive (60 cm) : 4-6 mois voire plus. Accélérez avec : déshumidificateur (1-2 litres/jour, 150-500 €), ventilation forcée, chauffage doux continu. Ne posez aucune finition avant un taux mesuré <15 %.",
  },
  {
    question: 'L’assurance habitation couvre-t-elle l’humidité ?',
    answer:
      "Seulement dans certains cas. (1) Dégât des eaux accidentel (fuite, rupture canalisation, infiltration suite événement climatique) : oui, sous franchise. (2) Défaut d'entretien (toiture mal entretenue depuis des années, façade fissurée non reprise) : non, exclu par toutes les polices. (3) Remontées capillaires : exclu en général. (4) Condensation par défaut de ventilation : exclu. Déclarez sous 5 jours pour tout dégât couvert, en décrivant précisément la cause.",
  },
  {
    question: 'Quel professionnel appeler pour l’humidité ?',
    answer:
      "Par ordre. (1) Entreprise spécialisée diagnostic humidité (audit pluri-causes). (2) Plombier pour une suspicion de fuite. (3) Couvreur ou façadier pour infiltrations extérieures. (4) Entreprise d'étanchéité pour toiture-terrasse. (5) Entreprise spécialisée traitement remontées capillaires pour injection résine. Un artisan seul est rarement compétent sur les 4 causes ; commencer par un diagnostic évite de faire intervenir le mauvais corps de métier.",
  },
  {
    question: 'Quels risques sanitaires liés à un mur humide ?',
    answer:
      "L'humidité favorise moisissures, acariens et bactéries. Risques documentés (étude ANSES 2016) : aggravation de l'asthme, rhinites allergiques, infections respiratoires, particulièrement chez enfants, personnes âgées, immunodéprimés. Agir sous 3 mois maximum après apparition. Un mur moisi noir (stachybotrys chartarum) produit des mycotoxines : port d'un masque FFP3 obligatoire pendant traitement, éviction des pièces concernées si bébé ou asthmatique.",
  },
  {
    question: 'Le traitement par injection résine est-il durable ?',
    answer:
      "Oui s'il est bien exécuté. Une injection de résine hydrofuge crée une barrière chimique continue à la base du mur, théoriquement permanente (30-50 ans). La garantie décennale de l'entreprise couvre les défauts d'exécution. Attention : la résine traite les remontées capillaires par le sol, pas les infiltrations latérales (il faudrait alors compléter avec un drainage périphérique extérieur, +5 000-15 000 €).",
  },
  {
    question: 'Peut-on vivre dans un logement humide en attendant les travaux ?',
    answer:
      "Oui à court terme (quelques semaines), avec précautions. (1) Ventilez 10-15 minutes matin et soir, même en hiver. (2) Déshumidifiez la pièce touchée (objectif <60 % HR). (3) Éloignez les meubles et literie du mur humide. (4) Évitez de dormir dans la pièce concernée si moisissure noire visible. Au-delà de 3 mois, l'impact sanitaire devient significatif : priorité absolue au traitement.",
  },
]

const sources = [
  {
    label: 'ANSES — Effets sur la santé des moisissures dans l’habitat (2016)',
    url: 'https://www.anses.fr',
  },
  {
    label: 'CSTB — Guide diagnostic humidité bâtiments',
    url: 'https://www.cstb.fr',
  },
  {
    label: 'ADEME — Ventilation et qualité de l’air intérieur',
    url: 'https://librairie.ademe.fr',
  },
  {
    label: 'Service-public.fr — Dégât des eaux',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F3107',
  },
]

const relatedGuides = [
  {
    label: 'Moisissure mur chambre : traitement',
    href: '/guides/moisissure-mur-chambre-traitement',
  },
  { label: 'Rénovation de toiture : travaux et prix', href: '/guides/renovation-toiture' },
  {
    label: 'Isolation thermique : guide complet',
    href: '/guides/isolation-thermique',
  },
  { label: 'Comment demander un devis de travaux', href: '/guides/comment-faire-devis-travaux' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Problèmes d’habitat',
    keywords: [
      'humidité mur intérieur',
      'condensation mur',
      'infiltration mur',
      'remontées capillaires',
      'traitement humidité',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Humidité mur intérieur', url: `/guides/${SLUG}` },
  ])
  const faqSchema = getFAQSchema(faqs)
  const howToSchema = getHowToSchema(howToSteps, {
    name: 'Diagnostiquer et traiter une humidité sur mur intérieur',
    description:
      'Méthode pour identifier la cause d’une tache d’humidité et choisir le bon traitement.',
    totalTime: 'PT45M',
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Humidité mur intérieur' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Droplets className="w-3.5 h-3.5" aria-hidden />
              Problèmes d’habitat · Guide vérifié
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Humidité sur un mur intérieur : trouver la cause et la bonne solution
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Une tache sombre qui s’étend, des cloques sur la peinture, une odeur de moisi à
              l’entrée de la pièce — quatre causes très différentes peuvent être à l’origine d’un
              mur humide, et quatre traitements totalement différents y répondent. Le diagnostic
              précède toujours le traitement&nbsp;: passer directement à la peinture hydrofuge ne
              fait qu’aggraver le problème.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Les 4 causes possibles et leur signature</h2>
            <h3>1. Condensation (la plus fréquente en logement chauffé)</h3>
            <p>
              Due à la rencontre d’air humide (douche, cuisine, respiration) avec une paroi froide
              (mur extérieur mal isolé, fenêtre simple vitrage, angle non chauffé). Signature&nbsp;:
              taches apparaissant en hiver, derrière meubles collés aux murs, sur parties hautes des
              vitrages, disparaissant partiellement en aérant. Principal responsable&nbsp;: absence
              ou défaut de VMC.
            </p>
            <h3>2. Infiltration (toiture, terrasse, façade, fenêtre)</h3>
            <p>
              Eau de pluie qui entre par un défaut d’étanchéité. Signature&nbsp;: tache stable,
              auréolée, qui s’étend après chaque pluie battante. Localisation en haut de mur
              (toiture), sur mur en contact avec une terrasse, sur contour de fenêtre ou
              porte-fenêtre. Fréquent dans les logements anciens après tempête ou gel.
            </p>
            <h3>3. Remontées capillaires (sol humide remontant par porosité)</h3>
            <p>
              Eau du sol qui remonte par capillarité dans les murs enterrés ou en rez-de-chaussée
              sans coupure de capillarité. Signature&nbsp;: tache en pied de mur (jusqu’à 1,50 m),
              s’étendant horizontalement, dépôts de salpêtre blanc poudreux. Fréquent dans maisons
              anciennes sans vide sanitaire ni drainage.
            </p>
            <h3>4. Fuite de canalisation</h3>
            <p>
              Défaut d’étanchéité d’une canalisation encastrée. Signature&nbsp;: tache qui apparaît
              soudainement, proche de salle de bain, cuisine, buanderie. Aggravation rapide. Urgence
              absolue&nbsp;: fermer l’arrivée d’eau générale si la fuite s’accélère, appeler un
              plombier.
            </p>

            <h2>La méthode de diagnostic en 6 étapes</h2>
            <ol>
              {howToSteps.map((s, i) => (
                <li key={i}>
                  <strong>{s.name}.</strong> {s.text}
                </li>
              ))}
            </ol>

            <h2>Les solutions par cause et leur coût</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Cause</th>
                    <th className="p-3 border-b border-sand-200">Solution</th>
                    <th className="p-3 border-b border-sand-200">Budget indicatif</th>
                    <th className="p-3 border-b border-sand-200">Pro à contacter</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  <tr className="border-b border-sand-100">
                    <td className="p-3 font-semibold">Condensation</td>
                    <td className="p-3">VMC simple flux / double flux + isolation paroi froide</td>
                    <td className="p-3">800 à 5 000 €</td>
                    <td className="p-3">Chauffagiste / électricien / isolation RGE</td>
                  </tr>
                  <tr className="border-b border-sand-100">
                    <td className="p-3 font-semibold">Infiltration toiture</td>
                    <td className="p-3">Reprise étanchéité, tuiles, faîtage, gouttières</td>
                    <td className="p-3">500 à 8 000 €</td>
                    <td className="p-3">Couvreur</td>
                  </tr>
                  <tr className="border-b border-sand-100">
                    <td className="p-3 font-semibold">Infiltration façade</td>
                    <td className="p-3">Ravalement + enduit hydrofuge + reprise fissures</td>
                    <td className="p-3">3 000 à 20 000 €</td>
                    <td className="p-3">Façadier / maçon</td>
                  </tr>
                  <tr className="border-b border-sand-100">
                    <td className="p-3 font-semibold">Remontées capillaires</td>
                    <td className="p-3">Injection de résine hydrofuge à la base du mur</td>
                    <td className="p-3">40 à 80 €/ml (ou 3 000-10 000 € pour maison)</td>
                    <td className="p-3">Entreprise spécialisée humidité</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Fuite canalisation</td>
                    <td className="p-3">Réparation fuite + reprise enduit + peinture</td>
                    <td className="p-3">300 à 3 000 €</td>
                    <td className="p-3">Plombier + peintre</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Méfiance devant le démarchage.</strong> Les « diagnostics d’humidité
                gratuits » proposés par téléphone ou en porte-à-porte débouchent souvent sur des
                offres surévaluées (5 à 10× le prix normal) pour des traitements inadaptés. Exigez
                toujours un diagnostic écrit, 3 devis et des références vérifiables.
              </p>
            </div>

            <h2>Check-list avant de démarrer les travaux</h2>
            <ul className="not-prose space-y-2">
              {[
                'Diagnostic écrit identifiant clairement la cause',
                'Taux d’humidité mesuré avant intervention',
                '3 devis d’entreprises spécialisées',
                'Décennale couvrant l’activité traitement humidité',
                'Références récentes vérifiables (3 minimum)',
                'Garantie de résultat (engagement sur taux d’humidité post-travaux)',
                'Planning de séchage défini avant pose de finitions',
              ].map((c) => (
                <li key={c} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" aria-hidden />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
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

          <div className="bg-primary-700 text-white rounded-xl p-6 md:p-8 text-center my-10">
            <Wrench className="w-10 h-10 mx-auto mb-3 opacity-90" aria-hidden />
            <h2 className="font-heading text-2xl font-bold mb-2">
              Besoin d’un diagnostic humidité ?
            </h2>
            <p className="text-primary-100 mb-5 max-w-xl mx-auto">
              Trouvez une entreprise spécialisée humidité près de chez vous, vérifiée et assurée.
              Devis diagnostic à partir de 150 €.
            </p>
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors"
            >
              <Home className="w-4 h-4" aria-hidden /> Demander un devis humidité
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
