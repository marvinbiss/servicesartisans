/**
 * /chauffage/poele-granules/sans-electricite — sub-page niche cluster Poêle.
 *
 * @kw-primary    poele a granules sans electricite
 * @kw-volume     90
 * @kw-kd         0
 * @kw-cpc        null
 * @cluster       4
 * @ahrefs-source live keywords-explorer/overview snapshot 2026-05-06 country=fr
 * @backlog-item  P3-poele-granules-cluster
 *
 * Easy win : KD 0 = position 1 atteignable rapidement avec contenu pertinent.
 * Intent : utilisateur cherche un poêle 100 % autonome (coupures réseau,
 * habitat isolé, refuge, ou inquiétude facture élec). Différenciation vs la
 * page mère qui couvre les 3 grandes familles techniques (étanche / canalisable
 * / hydraulique) — ici angle "sans alimentation électrique".
 *
 * Vérité technique critique YMYL :
 *   - 99 % des poêles à granulés vendus en France ont besoin d'électricité
 *     (vis sans fin, ventilateur, allumage, électronique, sonde air).
 *   - Une catégorie spécifique « poêle à granulé gravitaire » existe :
 *     alimentation par gravité, allumage manuel, pas de ventilateur.
 *     Marques : Wodtke (Ivo.tec), MCZ (modèles Loop), Edilkamin (Acquatondo
 *     gravitaire), Stuv. Rares en France, prix 3 500-7 000 €.
 *   - Une autre catégorie « poêle hybride bûche/granulé » fonctionne en mode
 *     bûche pendant une coupure (mais granulés requièrent élec).
 *   - Onduleur / batterie 12V (autonomie 2-4 h) = solution de repli pour
 *     poêle granulé classique en cas de coupure brève.
 *
 * NE PAS confondre avec poêle à BÛCHES (totalement passif, pas d'élec).
 * La page assume cette distinction proprement.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BatteryCharging, Calculator } from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/chauffage/poele-granules/sans-electricite'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Poêle à granulés sans électricité 2026 : modèles & solutions'
const DESCRIPTION =
  'Poêle à granulés sans électricité : poêles gravitaires (Wodtke, MCZ Loop), hybrides bûche/granulé, onduleur 12V. Prix, principes techniques et alternatives.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: getAlternates(PAGE_PATH),
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
  '99 % des poêles à granulés du commerce nécessitent de l’électricité (vis sans fin, ventilateur, allumage électronique).',
  'Vraie autonomie possible avec : (1) poêle gravitaire à granulés (rare), (2) poêle hybride bûche/granulé (mode bûche passif), (3) poêle à bûches pur (totalement passif).',
  'Poêle gravitaire : alimentation par gravité, allumage manuel, sans ventilateur. Marques niche : Wodtke Ivo.tec, MCZ série Loop, Edilkamin Acquatondo, Stuv. Prix 3 500-7 000 €.',
  'Solution de repli pour poêle granulé classique : onduleur + batterie 12 V (50-300 €) — autonomie 2-4 h en cas de coupure brève.',
  'Aides MaPrimeRénov’ + CEE + TVA 5,5 % identiques au poêle granulé standard si label Flamme Verte 7+ et RGE Qualibois.',
  'Choix recommandé pour usage "vrai sans élec" : poêle à bûches (pas de granulé). Voir notre comparatif chaudière à bois pour gros besoins.',
]

const SOLUTIONS = [
  {
    titre: 'Poêle à granulés gravitaire',
    indication: 'Coupures réseau fréquentes, habitat isolé, intention « low-tech »',
    fonctionnement:
      'Alimentation pellets par gravité depuis un réservoir haut. Allumage manuel (allume-feu naturel). Combustion à tirage naturel — pas de ventilateur électrique. Régulation manuelle (volet d’air primaire).',
    prix: '3 500-7 000 € posé',
    limites:
      'Rendement 75-82 % (vs 85-92 % poêles classiques). Programmation auto impossible. Surveillance manuelle. Marques rares en France.',
  },
  {
    titre: 'Poêle hybride bûche + granulé',
    indication: 'Sécurité « j’ai toujours un repli si élec coupée »',
    fonctionnement:
      'Foyer accepte bûches OU granulés. En mode granulé, fonctionne comme un poêle classique (élec requise). En mode bûche, fonctionne sans aucune électricité (tirage naturel).',
    prix: '4 500-8 500 € posé',
    limites:
      'Capacité bûche limitée (3-4 h autonomie chargement). Compromis sur les performances vs un poêle dédié.',
  },
  {
    titre: 'Onduleur + batterie 12 V (poêle classique)',
    indication: 'Coupures brèves (< 4 h), envie de garder un poêle granulé standard',
    fonctionnement:
      'Onduleur 300-600 W + batterie LiFePO4 50-100 Ah branchés sur le poêle. Bascule auto en cas de coupure réseau. Le poêle continue à fonctionner sur batterie pendant 2-4 h.',
    prix: '+ 200-600 € (matériel) + pose ~150 €',
    limites:
      'Solution dépannage, pas autonomie longue durée. Batterie à entretenir tous les 8-10 ans. Onduleur sinusoïdal pur recommandé (carte électronique du poêle).',
  },
  {
    titre: 'Poêle à bûches (sans granulé)',
    indication: 'Vraie indépendance totale',
    fonctionnement:
      'Combustible bûche, tirage naturel, allumage manuel, ZÉRO électronique. Solution la plus simple, la plus durable, la plus rurale.',
    prix: '1 500-5 000 € posé',
    limites:
      'Discipline de chargement manuel toutes les 2-4 h. Pas d’autonomie nuit (sauf gros foyer pierre ollaire). Combustible volumineux à stocker.',
  },
]

const faqs = [
  {
    question: 'Existe-t-il vraiment un poêle à granulés sans électricité ?',
    answer:
      'Oui mais c’est <strong>une niche</strong>. La grande majorité des poêles à granulés vendus en France utilisent l’électricité pour : la <strong>vis sans fin</strong> qui dose les pellets vers le brûleur, le <strong>ventilateur</strong> de tirage, l’<strong>allumage électronique</strong> (résistance), la <strong>sonde de température</strong>, et la <strong>carte électronique</strong>. Une catégorie spécifique de <strong>poêles gravitaires</strong> existe — alimentation par gravité depuis un réservoir haut, allumage manuel, tirage naturel sans ventilateur. Marques niches : Wodtke (gamme Ivo.tec), MCZ (série Loop), Edilkamin Acquatondo gravitaire, Stuv. Rares en France, prix 3 500-7 000 € posé. Si l’objectif est <strong>vraie autonomie</strong>, le poêle à <strong>bûches</strong> reste la solution la plus simple (totalement passif).',
  },
  {
    question: 'Que faire en cas de coupure d’électricité avec un poêle à granulés classique ?',
    answer:
      'Un poêle à granulés classique <strong>s’arrête</strong> en cas de coupure de courant — la combustion se termine proprement (sécurité par programmation), le ventilateur s’éteint, et la pièce refroidit progressivement (inertie de la fonte ou pierre ollaire). Solutions de repli : (1) <strong>Onduleur sinusoïdal pur</strong> (300-600 W) + <strong>batterie LiFePO4 50-100 Ah</strong> = 2-4 h d’autonomie pour 200-600 € de matériel. Bascule automatique en cas de coupure. (2) <strong>Groupe électrogène</strong> (essence ou inverter) si coupures fréquentes longues — 600-1 500 €. (3) <strong>Maintenance préventive</strong> : éviter les pannes électroniques en faisant l’entretien annuel obligatoire (180-280 €). Vérifier la <strong>compatibilité onduleur</strong> dans la notice constructeur (certains poêles n’acceptent pas le « pseudo-sinus »).',
  },
  {
    question: 'Le poêle gravitaire à granulés est-il éligible MaPrimeRénov’ et CEE ?',
    answer:
      'Oui, à condition qu’il porte le <strong>label Flamme Verte 7+</strong> (rendement ≥ 87 %, émissions plafonnées) et soit installé par un artisan <strong>RGE Qualibois Module Air</strong>. Aides identiques aux poêles granulés classiques : <strong>MaPrimeRénov’</strong> Bleu 2 500 €, Jaune 2 000 €, Violet 1 500 €. <strong>CEE Coup de pouce</strong> 1 000-2 000 € si remplacement chaudière fioul/gaz/charbon. <strong>TVA 5,5 %</strong>. <strong>Éco-PTZ</strong> jusqu’à 30 000 €. Cumul typique Bleu : ~4 000 € sur un devis 5 500 € → reste à charge 1 500 €. Les <strong>poêles gravitaires</strong> ont parfois un rendement légèrement inférieur (75-82 % vs 85-92 %) — vérifier sur le devis qu’il atteint le seuil Flamme Verte 7+.',
  },
  {
    question: 'Quel est le rendement d’un poêle gravitaire vs classique ?',
    answer:
      '<strong>Poêle granulé gravitaire</strong> : rendement ETAS 75-82 % (combustion à tirage naturel, dosage manuel moins fin). <strong>Poêle granulé classique</strong> : rendement ETAS 85-92 % (régulation électronique fine + ventilateur d’air comburant). <strong>Poêle hybride bûche/granulé</strong> : 78-85 % en mode granulé, 70-80 % en mode bûche. <strong>Poêle à bûches</strong> : 70-85 % (selon âge et qualité). Le rendement n’est pas le seul critère : un poêle gravitaire 78 % qui chauffe pendant une coupure 24 h vaut mieux qu’un poêle classique 92 % éteint. Choisir selon le profil d’usage : usage permanent confort = classique. Usage hivernal en zone à coupures fréquentes = gravitaire ou hybride.',
  },
  {
    question: 'Onduleur ou groupe électrogène pour mon poêle granulés ?',
    answer:
      '<strong>Onduleur + batterie LiFePO4</strong> : silencieux, allumage instantané automatique, autonomie 2-4 h, coût 200-600 €, durée de vie 8-10 ans. <strong>Idéal coupures brèves fréquentes</strong> (orages, vents). <strong>Groupe électrogène inverter</strong> : autonomie illimitée tant qu’il y a du carburant, mais bruit + maintenance + démarrage manuel. Coût 600-1 500 €. <strong>Idéal coupures longues</strong> (> 4 h) en zone rurale isolée. <strong>Important</strong> : utiliser un onduleur <strong>sinusoïdal pur</strong> (« pure sine wave », pas « modified sine wave ») — la carte électronique du poêle peut être endommagée par un signal carré. Vérifier la puissance d’appel au démarrage (300-500 W typique poêle granulé).',
  },
  {
    question: 'Quel poêle pour un refuge ou habitat isolé sans réseau ?',
    answer:
      'Pour un refuge ou un habitat <strong>totalement hors réseau</strong>, le choix le plus pertinent est généralement le <strong>poêle à bûches</strong> (pas le poêle à granulés). Raisons : (1) combustible local disponible (forêt, voisinage), (2) zéro dépendance électrique, (3) durabilité 25-40 ans, (4) prix posé 1 500-5 000 €. Si vraiment vous voulez du granulé pour le confort de combustible (sacs propres faciles à transporter), prendre un <strong>poêle gravitaire</strong> + couplage <strong>panneaux solaires PV + batterie</strong> pour l’éclairage et autres usages. Voir aussi notre page <a href="/renovation-energetique/travaux/solaire">solaire photovoltaïque</a> pour l’autonomie réseau complète.',
  },
]

const sources = [
  { label: 'France Rénov’ — Poêle à granulés', url: 'https://france-renov.gouv.fr' },
  { label: 'Flamme Verte — Label officiel', url: 'https://www.flammeverte.org' },
  { label: 'ADEME — Chauffage bois', url: 'https://www.ademe.fr' },
  {
    label: 'Qualit’EnR — Mention Qualibois',
    url: 'https://www.qualit-enr.org/qualifications/qualibois/',
  },
  { label: 'Anah — MaPrimeRénov’ poêles', url: 'https://www.anah.gouv.fr' },
]

const relatedPages = [
  {
    label: 'Poêle à granulé — guide général',
    href: '/renovation-energetique/travaux/chauffage/poele-granules',
    description: 'Étanche / canalisable / hydraulique, prix, aides',
  },
  {
    label: 'Chaudière à bois (biomasse)',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-bois',
    description: 'Chauffage central + ECS via bois (granulés, bûches, mixte)',
  },
  {
    label: 'Solaire photovoltaïque',
    href: '/renovation-energetique/travaux/solaire',
    description: 'Autonomie électrique pour habitat isolé',
  },
  {
    label: 'Hub Chauffage 2026',
    href: '/renovation-energetique/travaux/chauffage',
    description: 'PAC, chaudière, poêle, CET comparés',
  },
  {
    label: 'Label RGE Qualibois',
    href: '/rge/labels/qualibois',
    description: 'Mention requise pour aides poêle granulé',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'Estimation MPR + CEE personnalisée',
  },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: PAGE_PATH,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Poêle à granulés sans électricité',
    keywords: [
      'poele a granules sans electricite',
      'poele a granule sans electricite',
      'poele granule gravitaire',
      'poele hybride buche granule',
      'onduleur poele granules',
      'poele autonome',
      'qualibois',
      'flamme verte',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Chauffage', url: '/renovation-energetique/travaux/chauffage' },
    {
      name: 'Poêle à granulés',
      url: '/renovation-energetique/travaux/chauffage/poele-granules',
    },
    { name: 'Sans électricité', url: PAGE_PATH },
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
              { label: 'Rénovation énergétique', href: '/renovation-energetique' },
              { label: 'Travaux', href: '/renovation-energetique/travaux' },
              { label: 'Chauffage', href: '/renovation-energetique/travaux/chauffage' },
              {
                label: 'Poêle à granulés',
                href: '/renovation-energetique/travaux/chauffage/poele-granules',
              },
              { label: 'Sans électricité' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <BatteryCharging className="w-3.5 h-3.5" aria-hidden />
              Poêle granulé — autonomie réseau
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Poêle à granulés sans électricité : modèles & alternatives
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              <strong>99 % des poêles à granulés</strong> vendus en France ont besoin d’électricité
              (vis sans fin, ventilateur, allumage électronique, carte de régulation). Pour une
              vraie <strong>autonomie réseau</strong>, quatre solutions existent : le{' '}
              <strong>poêle gravitaire</strong> (alimentation pellets par gravité, allumage manuel),
              le <strong>poêle hybride bûche/granulé</strong> (repli en mode bûche), un{' '}
              <strong>onduleur 12 V + batterie</strong> sur poêle classique, ou simplement un{' '}
              <strong>poêle à bûches</strong> (totalement passif). Chaque option a ses limites.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="solutions">4 solutions pour un poêle granulé sans électricité</h2>
            <div className="not-prose grid gap-3 my-6">
              {SOLUTIONS.map((s) => (
                <div key={s.titre} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                      {s.titre}
                    </h3>
                    <span className="text-sm font-bold text-primary-700 whitespace-nowrap">
                      {s.prix}
                    </span>
                  </div>
                  <p className="text-xs text-primary-600 font-medium m-0 mb-1">{s.indication}</p>
                  <p className="text-sm text-sand-700 m-0 mb-2">
                    <strong>Comment ça marche :</strong> {s.fonctionnement}
                  </p>
                  <p className="text-xs text-sand-500 m-0 italic">Limites : {s.limites}</p>
                </div>
              ))}
            </div>

            <h2 id="reco">Quel choix selon votre profil ?</h2>
            <ul>
              <li>
                <strong>Coupures réseau brèves (orages)</strong> → poêle granulé classique +{' '}
                <strong>onduleur sinusoïdal pur 300-600 W + batterie LiFePO4</strong>. Coût total
                +200-600 €. Préserve le confort granulé classique 95 % du temps.
              </li>
              <li>
                <strong>Habitat rural avec coupures fréquentes longues</strong> →{' '}
                <strong>poêle hybride bûche/granulé</strong> ou <strong>poêle gravitaire</strong>.
                Acceptez le compromis rendement (80 %) pour la résilience.
              </li>
              <li>
                <strong>Refuge ou habitat hors réseau total</strong> →{' '}
                <strong>poêle à bûches</strong> (pas de granulé). Combustible local + zéro
                dépendance + 25-40 ans de durée de vie. Le granulé n’a pas vraiment d’intérêt en
                off-grid pur.
              </li>
              <li>
                <strong>Inquiétude facture élec uniquement</strong> → poêle classique standard.
                Conso élec d’un poêle granulé = ~80-150 kWh/an = 20-40 €/an. Marginal vs économies
                chauffage 600-1 000 €/an.
              </li>
            </ul>

            <h2 id="cta">Trouvez un artisan RGE Qualibois</h2>
            <div className="not-prose bg-primary-50 border border-primary-200 rounded-xl p-6 my-6">
              <p className="text-sand-900 m-0 mb-3">
                <Calculator className="inline w-5 h-5 text-primary-700 mr-1" aria-hidden />
                <strong>Devis poêle granulé</strong> — artisans Qualibois Module Air ou Eau pour
                bénéficier de MaPrimeRénov’ + CEE + TVA 5,5 %.
              </p>
              <Link
                href="/devis"
                className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-5 py-3 rounded-lg transition"
              >
                Demander mon devis poêle granulé <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
          </article>

          <FlagshipFaq items={faqs} />

          <section className="my-10">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
              Pour aller plus loin
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {relatedPages.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="block bg-white border border-sand-200 hover:border-primary-300 rounded-xl p-4 transition"
                >
                  <p className="font-semibold text-sand-900 m-0 mb-1 inline-flex items-center gap-1">
                    {p.label} <ArrowRight className="w-3.5 h-3.5 text-primary-700" aria-hidden />
                  </p>
                  <p className="text-sm text-sand-600 m-0">{p.description}</p>
                </Link>
              ))}
            </div>
          </section>

          <FlagshipSources sources={sources} />
          <FlagshipAuthorCard
            authorSlug={AUTHOR_SLUG}
            authorName={AUTHOR_NAME}
            datePublished={PUBLISHED}
            dateModified={MODIFIED}
          />
        </div>
      </div>
    </>
  )
}
