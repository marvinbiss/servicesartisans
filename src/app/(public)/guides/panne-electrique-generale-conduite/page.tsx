import type { Metadata } from 'next'
import Link from 'next/link'
import { Zap, ArrowRight, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema, getHowToSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'panne-electrique-generale-conduite'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Marc Lefebvre'

export const revalidate = 86400

const TITLE = 'Panne électrique : diagnostic & fix 2026'
const DESCRIPTION =
  'Panne électrique générale : distinguer Enedis ou problème interne, vérifier disjoncteur, différentiel, appeler le bon contact. Guide 2026.'

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
    authors: [`${SITE_URL}/equipe/marc-lefebvre`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Étape 1 : vérifier si les voisins ont aussi la panne — oui = panne réseau Enedis, non = problème interne.',
  'Étape 2 : regarder le disjoncteur de branchement (plombé) et les différentiels au tableau.',
  'Étape 3 : si un différentiel a sauté, déconnecter les circuits un par un pour isoler la cause.',
  'Étape 4 : panne Enedis → appeler 09 72 67 50 + votre numéro département (24/7, gratuit).',
  'Étape 5 : panne interne → appeler un électricien certifié. Coût dépannage : 80-180 € heure.',
]

const howToSteps = [
  {
    name: 'Vérifier si la panne est générale',
    text: "Regardez par la fenêtre : lampadaires éteints, voisins dans le noir ? C'est une coupure réseau Enedis. Allumez uniquement votre téléphone, vérifiez l'appli Enedis 'Ma coupure d'électricité'. Si l'appli annonce une coupure prévue ou en cours, patientez (durée souvent affichée).",
  },
  {
    name: 'Vérifier le disjoncteur de branchement',
    text: "Le disjoncteur de branchement (plombé, propriété d'Enedis, en général à l'entrée logement) peut avoir sauté. Si la manette est en bas ou au milieu : remontez-la fermement en haut. S'il redéclenche immédiatement : surcharge ou court-circuit global, appeler un électricien.",
  },
  {
    name: 'Inspecter les différentiels et disjoncteurs divisionnaires',
    text: "Au tableau électrique, regardez les interrupteurs différentiels (30 mA, obligatoires NF C 15-100) : s'ils sont en position basse, un circuit fuit. Remontez-les un par un. S'ils redéclenchent, le problème est sur un circuit précis. Débranchez les appareils suspects avant de ré-enclencher.",
  },
  {
    name: 'Isoler le circuit défaillant',
    text: "Coupez TOUS les disjoncteurs divisionnaires. Remontez le différentiel. Puis ré-enclenchez un par un chaque divisionnaire jusqu'à identifier celui qui fait sauter. Sur ce circuit, débranchez tous les appareils un par un pour isoler l'équipement en cause (souvent lave-vaisselle, sèche-linge, chauffe-eau, vieille lampe halogène).",
  },
  {
    name: 'Contacter Enedis ou un électricien',
    text: "Panne réseau = Enedis Dépannage 09 72 67 50 XX (XX = numéro département, ex: 75 pour Paris). Ligne 24/7 gratuite. Panne interne = électricien local avec certification Qualifelec ou IRVE. Tarifs horaires 60-90 € HT + déplacement 40-80 €. Éviter les 'dépanneurs 24h' non identifiés (arnaques fréquentes).",
  },
]

const faqs = [
  {
    question: 'Comment savoir si la panne vient d’Enedis ou de chez moi ?',
    answer:
      "Testez simplement : regardez si les lampadaires de rue sont allumés. Si oui et que vos voisins ont l'électricité, c'est un problème interne. Si lampadaires et voisins dans le noir : panne réseau Enedis. Vérifiez aussi l'application gratuite 'Enedis - Coupures d'électricité' (iOS/Android) qui affiche les coupures en cours avec durée estimée et raison (maintenance, incident).",
  },
  {
    question: 'Que faire si le disjoncteur principal saute immédiatement ?',
    answer:
      'Cela indique un court-circuit franc ou une surcharge massive. Ne forcez pas. Coupez tous les disjoncteurs divisionnaires. Remontez le principal. Remontez les divisionnaires un par un. Si le principal re-saute à chaque fois : problème en amont (câble principal détérioré, disjoncteur HS, sur-puissance installée). Appelez Enedis si disjoncteur plombé, sinon électricien pour le tableau.',
  },
  {
    question: 'Quel est le tarif d’un électricien en urgence ?',
    answer:
      'Tarif horaire 2026 : 60-90 € HT en journée (72-108 € TTC), +50 % la nuit, +30-50 % le week-end. Déplacement urgence : 40-100 € selon zone. Intervention type (diagnostic + petite réparation) : 150-280 € TTC. Remplacement différentiel : 150-250 €. Remplacement tableau complet : 800-2500 €. Exigez un devis écrit AVANT intervention, même en urgence (loi Hamon).',
  },
  {
    question: 'Le différentiel saute tout le temps : est-ce grave ?',
    answer:
      "Un différentiel qui saute souvent = fuite de courant dans l'installation ou un équipement. C'est un signal de protection à ne pas ignorer. Causes fréquentes : sonde chauffe-eau qui fuit vers la terre, pompe à chaleur, vieux sèche-linge, congélateur dont la résistance prend l'eau. Faire diagnostiquer par un électricien avec pince ampèremétrique et mégohmmètre — coût 100-180 €. Ne jamais remplacer un différentiel 30 mA par un modèle plus élevé pour 'qu'il ne saute plus' : c'est dangereux et non conforme.",
  },
  {
    question: 'Qui paie la réparation : propriétaire ou locataire ?',
    answer:
      'Décret 87-712 : locataire = menues réparations (interrupteurs, ampoules, fusibles), propriétaire = installation électrique, tableau, câbles. En pratique : remplacement ampoule fusible = locataire ; changement différentiel, disjoncteur, mise aux normes NF C 15-100 = propriétaire. Si panne = vétusté, propriétaire. Si panne = faute du locataire (appareil modifié, surcharge volontaire) = locataire.',
  },
  {
    question: 'Comment éviter les arnaques en cas de panne électrique ?',
    answer:
      "Règles : (1) refuser le premier dépanneur trouvé via flyer ou 'pub Google mobile' — vérifier SIRET, adresse réelle et avis Google, (2) exiger devis écrit avant intervention, (3) pas d'argent liquide, (4) vérifier assurance décennale + attestation de conformité Consuel pour gros travaux, (5) idéalement certification Qualifelec (électrique général) ou IRVE (bornes). Un vrai pro consent toujours à fournir ces documents.",
  },
]

const sources = [
  { label: 'Enedis — Contact dépannage', url: 'https://www.enedis.fr/contact/depannage' },
  {
    label: 'Norme NF C 15-100 — Installation électrique basse tension',
    url: 'https://www.afnor.org',
  },
  { label: 'Consuel — Attestation de conformité', url: 'https://www.consuel.com' },
  { label: 'Qualifelec — Qualification électricien', url: 'https://www.qualifelec.fr' },
]

const relatedGuides = [
  { label: 'Prix électricien à l’heure 2026', href: '/guides/prix-electricien-heure-2026' },
  { label: 'Comment choisir un artisan RGE', href: '/guides/comment-choisir-artisan-rge' },
  { label: 'Labels et qualifications artisans', href: '/guides/labels-qualifications-artisans' },
  { label: 'Vérifier le SIRET d’un artisan', href: '/guides/verifier-siret-artisan' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Urgences & Dépannage',
    keywords: [
      'panne électrique générale',
      'panne Enedis',
      'disjoncteur saute',
      'différentiel qui saute',
      'électricien urgence',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Panne électrique générale', url: `/guides/${SLUG}` },
  ])
  const faqSchema = getFAQSchema(faqs)
  const howToSchema = getHowToSchema(howToSteps, {
    name: 'Diagnostiquer une panne électrique générale',
    description:
      'Les étapes pour identifier l’origine d’une panne électrique et contacter le bon interlocuteur.',
    totalTime: 'PT30M',
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Panne électrique générale' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Zap className="w-3.5 h-3.5" aria-hidden />
              Urgences &amp; Dépannage · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Panne électrique générale : la conduite à tenir
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Tout l’appartement est dans le noir ? Avant de paniquer — ou d’appeler un dépanneur
              d’urgence douteux — 90 % des pannes se diagnostiquent en 10 minutes avec une méthode
              simple. Voici la procédure professionnelle pour identifier l’origine et activer le bon
              contact.
            </p>
          </header>

          <TldrBlock bullets={tldr} />

          <div className="not-prose border border-rose-200 bg-rose-50 rounded-lg p-4 my-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" aria-hidden />
            <div className="text-sm text-rose-900">
              <p className="font-semibold m-0 mb-1">Enedis dépannage 24/7</p>
              <p className="m-0">
                <strong>09 72 67 50 XX</strong> (XX = numéro département, ex: 75 Paris, 69 Rhône).
                Gratuit ou appel local. Ligne prioritaire en cas de coupure dangereuse (étincelle,
                fumée).
              </p>
            </div>
          </div>

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Panne réseau Enedis vs panne interne</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Signe</th>
                    <th className="p-3 border-b border-sand-200">Panne Enedis</th>
                    <th className="p-3 border-b border-sand-200">Panne interne</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Voisins concernés', 'Oui', 'Non'],
                    ['Lampadaires rue', 'Éteints', 'Allumés'],
                    ['Disjoncteur branchement', 'Haut (en place)', 'Souvent sauté'],
                    ['App Enedis', 'Affiche coupure', 'Rien à signaler'],
                    ['Action', 'Patienter / Enedis', 'Tableau électrique'],
                  ].map(([s, e, i]) => (
                    <tr key={s} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{s}</td>
                      <td className="p-3">{e}</td>
                      <td className="p-3">{i}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>Méthode d’isolement progressif</h2>
            <p>
              Si le différentiel saute à chaque réenclenchement, isolez le circuit défaillant en
              procédant comme suit :
            </p>
            <ol>
              <li>Coupez TOUS les disjoncteurs divisionnaires (les plus petits au tableau).</li>
              <li>Remontez le différentiel concerné.</li>
              <li>Ré-enclenchez un divisionnaire, attendez 10 secondes.</li>
              <li>S’il tient, passez au suivant. S’il fait sauter : circuit identifié.</li>
              <li>Sur le circuit fautif, débranchez tout. Rebranchez un par un.</li>
              <li>L’équipement qui fait sauter = à réparer ou remplacer.</li>
            </ol>

            <h2>Équipements qui provoquent 80 % des pannes différentielles</h2>
            <ul>
              <li>
                <strong>Chauffe-eau</strong> (résistance percée qui fuit vers la terre)
              </li>
              <li>
                <strong>Lave-linge et sèche-linge</strong> (pompe, résistance)
              </li>
              <li>
                <strong>Pompe à chaleur</strong> (condenseur, vanne 4 voies)
              </li>
              <li>
                <strong>Plaque induction</strong> (bobine grillée)
              </li>
              <li>
                <strong>Vieilles lampes halogènes</strong> et guirlandes extérieures
              </li>
              <li>
                <strong>Prise de terre encrassée</strong> (humidité dans cave)
              </li>
            </ul>

            <div className="not-prose border border-amber-200 bg-amber-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 m-0">
                <strong>Attention aux faux dépanneurs.</strong> En 2026, les arnaques en électricité
                urgence restent massives : numéros en 09 / 08 qui redirigent vers 500 € de frais
                injustifiés, techniciens sans SIRET ni carte pro. Toujours vérifier SIRET
                (sirene.fr) + avis Google + certification Qualifelec avant intervention.
              </p>
            </div>

            <h2>Coûts d’intervention électricien 2026</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Intervention</th>
                    <th className="p-3 border-b border-sand-200">Prix TTC</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Déplacement + diagnostic panne', '80-180 €'],
                    ['Remplacement disjoncteur divisionnaire', '70-140 €'],
                    ['Remplacement différentiel 30 mA', '150-280 €'],
                    ['Remplacement disjoncteur de branchement', 'Enedis (gratuit si plombé)'],
                    ['Rénovation tableau complet (5 rangées)', '1 200-2 800 €'],
                    ['Mise aux normes NF C 15-100 appartement 50 m²', '2 500-5 500 €'],
                    ['Attestation Consuel (contrôle installation)', '180-250 €'],
                  ].map(([i, p]) => (
                    <tr key={i} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{i}</td>
                      <td className="p-3 font-semibold">{p}</td>
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
              href="/services/electricien"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un électricien <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
