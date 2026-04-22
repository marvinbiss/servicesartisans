import type { Metadata } from 'next'
import Link from 'next/link'
import { Flame, ArrowRight, ShieldCheck, AlertTriangle, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema, getHowToSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'chaudiere-ne-chauffe-plus'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Jean-Pierre Duval'

export const revalidate = 86400

const TITLE = 'Chaudière en panne : diagnostic et dépannage'
const DESCRIPTION =
  'Chaudière en panne : diagnostic gaz / fioul / électrique, codes erreur fréquents, prix dépannage chauffagiste, contrat d’entretien obligatoire. Guide 2026.'

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
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Avant d’appeler : vérifier pression circuit (1-2 bar), alimentation électrique, thermostat, arrivée gaz/fioul.',
  'Codes erreur affichés = cause précise (ex: E01/E02 pression faible, E10 bougie allumage, E168 surchauffe).',
  'Coût dépannage 2026 : 80-160 € diagnostic, 150-450 € réparation standard, 800-2500 € pièces lourdes (échangeur).',
  'Contrat d’entretien annuel obligatoire (décret 2009-649) : 110-200 €/an, déplacement panne inclus.',
  'Chaudière >15 ans et panne coûteuse : arbitrer entre réparation et remplacement (MaPrimeRénov’ pompe à chaleur 4000-11000 €).',
]

const howToSteps = [
  {
    name: 'Vérifier la pression du circuit',
    text: "Regardez le manomètre (cadran rond avec aiguille, en face avant ou dans la trappe inférieure). Pression normale : 1 à 2 bar à froid. Si <1 bar : ajoutez de l'eau par la vanne de remplissage jusqu'à 1,5 bar, puis refermez. Si >2,5 bar : purgez un radiateur pour faire baisser. Une pression anormale provoque souvent l'arrêt de sécurité.",
  },
  {
    name: 'Vérifier l’alimentation et le thermostat',
    text: "Chaudière électrique ou automatisme : vérifiez disjoncteur, prise, pile du thermostat d'ambiance (pile faible = thermostat inactif = chaudière ne démarre pas). Pour thermostat sans fil : remplacer les piles AAA/LR6 coûte 2 € et résout 15 % des pannes déclarées.",
  },
  {
    name: 'Vérifier l’arrivée gaz ou fioul',
    text: "Chaudière gaz : le robinet d'arrivée gaz (bouton jaune près de la chaudière) doit être en position ouverte (parallèle au tube). Vérifiez aussi qu'aucune coupure réseau n'est en cours (GRDF 0 800 47 33 33). Chaudière fioul : niveau de la cuve (souvent la cause quand on a oublié de commander). Un reste <10 % peut bloquer la pompe.",
  },
  {
    name: 'Lire le code erreur',
    text: "La plupart des chaudières modernes (Atlantic, Saunier Duval, Viessmann, De Dietrich, Chaffoteaux) affichent un code E01, E10, E133, etc. sur l'écran LCD ou via une LED clignotante. Consultez la notice (trappe chaudière ou site du fabricant) pour identifier la cause exacte avant d'appeler. Certains codes = simple reset, d'autres = pièce défectueuse.",
  },
  {
    name: 'Appeler le chauffagiste (entretien ou dépannage)',
    text: "Si vous avez un contrat d'entretien, appelez directement votre entreprise de maintenance (souvent dépannage inclus 24/7). Sinon : chauffagiste agréé PGN/PGP pour le gaz, fioul certifié pour le fioul, RGE QualiPAC pour pompe à chaleur. Prix horaire 2026 : 60-90 € HT + déplacement 40-80 €.",
  },
]

const faqs = [
  {
    question: 'Quel est le coût d’un dépannage chaudière ?',
    answer:
      "Dépannage standard 2026 : déplacement + diagnostic 80-160 € TTC, intervention horaire 60-95 € HT. Réparation courante (carte électronique, sonde, aquastat, thermostat, vanne 3 voies) : 150-450 € TTC. Pièces lourdes : échangeur 800-1500 €, brûleur 600-1200 €, corps de chauffe 1500-2500 €. Au-delà de 40 % du prix d'une chaudière neuve (soit ~1500 € pour une chaudière gaz), le remplacement devient plus rentable — surtout avec MaPrimeRénov' pompe à chaleur.",
  },
  {
    question: 'Le contrat d’entretien est-il obligatoire ?',
    answer:
      "Oui pour toutes les chaudières gaz, fioul, biomasse de puissance 4 à 400 kW — décret n°2009-649 du 9 juin 2009. Entretien annuel obligatoire, réalisé par professionnel, délivrance d'une attestation à conserver 2 ans. Coût 2026 : 110-200 €/an (gaz), 180-280 €/an (fioul), 150-220 €/an (bois). La plupart des contrats incluent un dépannage 24/7 en cas de panne (plus économique que payer à l'acte).",
  },
  {
    question: 'Propriétaire ou locataire : qui paie l’entretien et les réparations ?',
    answer:
      "Entretien annuel = locataire (Décret 87-712). Réparations : menu entretien (remplacement joint, ajustement) = locataire, grosse réparation (remplacement carte, corps de chauffe, échangeur) = propriétaire. Remplacement complet d'une chaudière vétuste = propriétaire. Si la panne est due à la négligence du locataire (pas d'entretien annuel réalisé), certaines charges peuvent basculer. En pratique : contrat d'entretien au nom du locataire (légalement obligatoire), grosses pannes facturées au propriétaire sur justificatif.",
  },
  {
    question: 'Que signifient les codes erreur E01 / E10 / E168 ?',
    answer:
      "Codes universels fréquents (varie selon marque) : E01 ou LF = manque pression circuit (ajouter eau). E02 = défaut sonde. E10 = défaut allumage (bougie encrassée, robinet gaz fermé). E110 = surchauffe (défaut circulation, vase d'expansion). E133 = flamme non détectée (électrode, gaz). E168 = défaut carte électronique. Un code qui revient après reset = appel chauffagiste. Un code unique après reset + redémarrage = souvent OK.",
  },
  {
    question: 'Faut-il remplacer ma vieille chaudière plutôt que la réparer ?',
    answer:
      "Arbitrage : calculez coût réparation ÷ prix chaudière neuve. Si >40 %, remplacement préférable. Autres critères : âge >15 ans, consommation >20 % vs voisins équivalents, pannes récurrentes (>2/an), bruit anormal. Aides 2026 : MaPrimeRénov' pompe à chaleur 4 000-11 000 €, Coup de pouce CEE chauffage 4 000-5 500 €, TVA 5,5 %, éco-PTZ pour le solde. Une pompe à chaleur air-eau réduit la facture de 50-70 % vs chaudière fioul et de 30-50 % vs chaudière gaz.",
  },
  {
    question: 'Ma chaudière gaz fait du bruit : est-ce grave ?',
    answer:
      "Bruits fréquents et leurs causes : (1) sifflement = pression trop haute, purger. (2) claquement = coup de bélier (dilatation tuyaux), rien à faire. (3) grondement continu = embouage circuit, besoin de désembouage (250-600 €). (4) bruit d'ébullition = détartrage échangeur (150-300 €). (5) bruit de soufflerie anormal = ventilateur à remplacer (200-450 €). Tout bruit nouveau ou qui s'aggrave justifie une visite — une chaudière qui gronde peut signaler une surchauffe dangereuse.",
  },
]

const sources = [
  {
    label: 'Décret n° 2009-649 du 9 juin 2009 — Entretien chaudières',
    url: 'https://www.legifrance.gouv.fr',
  },
  { label: 'Ministère Transition écologique — Chauffage', url: 'https://www.ecologie.gouv.fr' },
  { label: 'ADEME — Entretenir sa chaudière', url: 'https://agirpourlatransition.ademe.fr' },
  { label: 'GRDF — Urgence sécurité gaz 0 800 47 33 33', url: 'https://www.grdf.fr' },
]

const relatedGuides = [
  { label: 'Coup de pouce chauffage 2026', href: '/guides/coup-de-pouce-chauffage-2026' },
  { label: 'Prime pompe à chaleur locataire', href: '/guides/prime-pompe-chaleur-locataire' },
  { label: 'Prix installation chaudière gaz', href: '/guides/prix-installation-chaudiere-gaz' },
  {
    label: 'Prix pompe à chaleur air-eau installée',
    href: '/guides/prix-pompe-chaleur-air-eau-installee',
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
    section: 'Urgences & Dépannage',
    keywords: [
      'chaudière en panne',
      'chaudière ne chauffe plus',
      'dépannage chaudière',
      'code erreur chaudière',
      'contrat entretien chaudière',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Chaudière ne chauffe plus', url: `/guides/${SLUG}` },
  ])
  const faqSchema = getFAQSchema(faqs)
  const howToSchema = getHowToSchema(howToSteps, {
    name: 'Diagnostiquer une chaudière qui ne chauffe plus',
    description:
      'Étapes pour identifier pourquoi la chaudière ne fonctionne plus avant d’appeler un chauffagiste.',
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Chaudière ne chauffe plus' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Flame className="w-3.5 h-3.5" aria-hidden />
              Urgences &amp; Dépannage · Guide vérifié
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4">
              Chaudière ne chauffe plus : diagnostic et dépannage 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Radiateurs froids, eau chaude absente, chaudière en erreur ? Avant d’appeler un
              chauffagiste, 40 % des pannes se résolvent en 10 minutes : pression circuit, pile
              thermostat, arrivée gaz. Voici la méthode pro pour diagnostiquer, lire les codes
              erreur, et arbitrer entre réparation et remplacement en 2026.
            </p>
          </header>

          <TldrBlock bullets={tldr} />

          <div className="not-prose border border-rose-200 bg-rose-50 rounded-lg p-4 my-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" aria-hidden />
            <div className="text-sm text-rose-900">
              <p className="font-semibold m-0 mb-1">Odeur de gaz ou fumée noire ?</p>
              <p className="m-0">
                Coupez immédiatement l’arrivée gaz (vanne jaune), n’actionnez aucun interrupteur,
                aérez et appelez <strong>GRDF 0 800 47 33 33</strong> (24/7, gratuit). Ne rentrez
                pas tant que le technicien n’a pas validé la sécurité.
              </p>
            </div>
          </div>

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Vérifications avant d’appeler</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Vérifier</th>
                    <th className="p-3 border-b border-sand-200">Signe OK</th>
                    <th className="p-3 border-b border-sand-200">Action si KO</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Pression circuit', '1 à 2 bar à froid', 'Ajouter eau par vanne remplissage'],
                    ['Alimentation électrique', 'LED allumée', 'Vérifier disjoncteur'],
                    ['Pile thermostat', 'Écran lumineux', 'Remplacer pile AAA/LR6'],
                    ['Arrivée gaz', 'Vanne parallèle au tube', 'Ouvrir vanne jaune'],
                    ['Cuve fioul', 'Niveau >10 %', 'Commander livraison'],
                    ['Code erreur écran', 'Pas de code', 'Consulter notice fabricant'],
                  ].map(([v, o, k]) => (
                    <tr key={v} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{v}</td>
                      <td className="p-3">{o}</td>
                      <td className="p-3">{k}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>Codes erreur fréquents par marque</h2>
            <ul>
              <li>
                <strong>Saunier Duval</strong> : F28 allumage, F22 pression basse, F62 électrovanne
                gaz.
              </li>
              <li>
                <strong>Atlantic / Chaffoteaux</strong> : E01 surchauffe, E02 sonde, E10 pression,
                E15 flamme.
              </li>
              <li>
                <strong>Viessmann</strong> : F2 surchauffe, F4 flamme, F5 ventilateur, FC aquastat.
              </li>
              <li>
                <strong>De Dietrich</strong> : H01 allumage, H23 pression, H37 flamme instable.
              </li>
              <li>
                <strong>Frisquet</strong> : F01 eau chaude, F11 pression, F15 carte électronique.
              </li>
            </ul>
            <p>
              Note : les codes varient selon modèle. Toujours consulter la notice ou le site
              fabricant. Un reset (bouton dédié) peut suffire pour les codes transitoires. Codes
              récurrents = appeler chauffagiste.
            </p>

            <h2>Réparer ou remplacer ? L’arbitrage 2026</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Critère</th>
                    <th className="p-3 border-b border-sand-200">Réparer</th>
                    <th className="p-3 border-b border-sand-200">Remplacer</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Âge chaudière', '<12 ans', '>15 ans'],
                    ['Coût réparation', '<30 % prix neuf', '>40 % prix neuf'],
                    ['Fréquence pannes', '1 tous les 3-4 ans', '>1/an'],
                    ['Consommation', 'Normale', '>20 % au-dessus'],
                    ['Combustible', 'Gaz condensation', 'Fioul / charbon'],
                    ['Aides 2026', 'Pas d’aide', 'MPR 4-11k€ + CEE 4-5,5k€'],
                  ].map(([c, r, rp]) => (
                    <tr key={c} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{c}</td>
                      <td className="p-3">{r}</td>
                      <td className="p-3">{rp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="not-prose border border-emerald-200 bg-emerald-50 rounded-lg p-4 my-6 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-emerald-900">
                <p className="font-semibold m-0 mb-1">Chaudière fioul &gt; 15 ans ?</p>
                <p className="m-0">
                  C’est le cas idéal pour basculer vers une pompe à chaleur air-eau. Exemple :
                  remplacement fioul 15 ans par PAC air-eau 14 000 € TTC → aides cumulées 8 000-10
                  000 €, reste à charge 4 000-6 000 €, économie annuelle ~1 200 €/an. Amortissement
                  ~4 ans.
                </p>
              </div>
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
              href="/services/chauffagiste"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un chauffagiste <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
