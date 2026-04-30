import type { Metadata } from 'next'
import Link from 'next/link'
import { Bell, ArrowRight, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'interphone-visiophone-installation-prix'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Marc Lefebvre'
const AUTHOR_SLUG = 'marc-lefebvre'

export const revalidate = 86400

const TITLE = 'Interphone et visiophone : prix 2026'
const DESCRIPTION =
  'Prix interphone / visiophone 2026 : 200-1 500 € TTC posé (filaire, radio, IP). Copropriété 350-900 €/logement, pose NF C 15-100, garantie biennale.'

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
  'Prix 2026 TTC installé maison individuelle : interphone audio 200-400 €, visiophone filaire 400-800 €, visiophone radio 500-900 €, visiophone IP connecté 700-1 500 €.',
  'Copropriété : platine collective 15 boutons + combinés 350-900 €/logement posé + vidéo communal 3 000-8 000 €.',
  'Technologies : FILAIRE 2 fils (fiabilité) / RADIO 868 MHz (rénovation) / IP WIFI/RJ45 (connecté smartphone).',
  'Installation électricien NF C 15-100, TBT 12-24 V (pas d’habilitation BR requise sauf raccord 230 V).',
  'Caméras = RGPD (pas filmer voie publique/voisinage), déclaration CNIL si communication/stockage données tiers.',
]

const faqs = [
  {
    question: 'Quel prix pour un interphone ou visiophone en 2026 ?',
    answer:
      'Prix 2026 TTC installé selon techno : (1) INTERPHONE AUDIO FILAIRE (platine extérieure + combiné intérieur) : 200-400 € — fonction basique parler/ouvrir ; (2) VISIOPHONE FILAIRE 7 pouces (Extel, Schneider, Legrand) : 400-800 € — vidéo + audio + ouverture porte/portail ; (3) VISIOPHONE RADIO 868 MHz (platine sans câble → moniteur intérieur) : 500-900 € — idéal rénovation sans saignée, portée 100 m ; (4) VISIOPHONE IP CONNECTÉ smartphone (Ring, Doorbird, Nest Hello) : 700-1 500 € — répond depuis téléphone partout dans le monde, enregistrement cloud ; (5) VISIOPHONE HAUT DE GAMME 10 pouces tactile + domotique + multiples moniteurs + ouverture portail à distance : 1 200-2 500 €. COPROPRIÉTÉ : platine 10-20 boutons au RDC + bus collectif + combinés audio individuels 2 fils : 250-500 €/logement + platine commune 1 500-4 000 €. Visiophone collectif + câblage RDC : +3 000-8 000 € communs. Frais cachés : câblage 230 V alim 150-400 €, percement mur 80-200 €, gâche électrique porte 60-150 €, liaison portail automatique 100-250 €.',
  },
  {
    question: 'Filaire, radio ou IP connecté : que choisir ?',
    answer:
      'Comparatif 3 technologies : (1) FILAIRE 2 fils — fiabilité maximale 20+ ans, alimentation via câble (pas de pile), sécurité (pas brouillage radio possible), MAIS requiert 2-3 fils entre platine et moniteur (saignée mur en rénovation : 30-80 €/m câblage apparent plastique ou 80-200 €/m encastrée) + alimentation 230 V + transformateur 12-24 V ; (2) RADIO 868 MHz — pose rapide en rénovation, 0 saignée, alimentation platine par pile lithium 5-7 ans OU solaire intégré, portée 100 m, MAIS risque interférence (appareils 868 MHz voisins), sécurité chiffrée AES-128 sur modèles récents, changement pile à prévoir ; (3) IP WIFI/ETHERNET RJ45 — fonction smartphone/tablette (répondre ouvre porte n’importe où monde), enregistrement vidéo cloud (abonnement 3-8 €/mois souvent), MAIS dépend box internet (panne internet = visiophone HS sauf carillon local), risques sécurité informatique (mot de passe fort obligatoire, MAJ firmware), dépendance fabricant (Nest discontinued = bricolage). Règle : neuf = filaire 2 fils intégré ; rénovation + zone mobile = radio ; résidence secondaire ou mobilité utilisateur = IP connecté.',
  },
  {
    question: 'Visiophone avec caméra : règles RGPD à respecter ?',
    answer:
      'Caméra visiophone = traitement données personnelles (loi informatique et libertés 1978 + RGPD art. 6) : (1) CADRAGE STRICT porte/perron seulement — ne doit PAS filmer voie publique (trottoir, rue, voisins) — infraction article 226-1 Code pénal (1 an prison + 45 000 € amende) ; (2) INFORMATION VISITEURS : panneau ou autocollant visible indiquant « Zone sous surveillance vidéo, opérateur : Nom Propriétaire, base légale intérêt légitime, durée conservation X jours, contact exercice droits RGPD » ; (3) ENREGISTREMENT : autorisé si justifié (prévention cambriolage), durée maximum 30 jours (art. 5 RGPD minimisation), stockage sécurisé chiffré ; (4) DÉCLARATION CNIL : non obligatoire usage privé familial (exception domestique art. 2 RGPD), MAIS obligatoire si ACCÈS TIERS (opérateur télésurveillance) ou MULTI-UTILISATEURS (copro) ; (5) PARTAGE VIDÉOS interdit sans consentement visiteur (réseaux sociaux, mail, police sauf réquisition judiciaire) ; (6) VOISIN QUI SE PLAINT : conciliation amiable, puis tribunal judiciaire si filme chez lui ; (7) Copropriété : installation vidéo = AG majorité art. 25 loi 10 juillet 1965. Sanctions CNIL : 20 M€ ou 4 % CA (art. 83 RGPD).',
  },
  {
    question: 'Qui peut installer un interphone ou visiophone ?',
    answer:
      '(1) CÂBLAGE TBT (très basse tension 12-24 V platine → moniteur) : tout bricoleur, pas d’habilitation requise, mais respect NF C 15-100 recommandé ; (2) RACCORDEMENT 230 V (alim transformateur + gâche électrique porte) : ÉLECTRICIEN HABILITATION BR indispensable (art. R4544-9 Code travail) ; (3) SAIGNÉES MUR PORTEUR : maçon + étude structure si >40 cm section ; (4) COPROPRIÉTÉ : installation collective = syndic + AG majorité art. 25, travaux sur parties communes (platine RDC, câblage cages escalier) ; (5) INSTALLATION DIY : légale pour TBT seulement, mais si incendie causé par câblage 230 V DIY = ASSURANCE HABITATION REFUSE (expertise peut prouver faute) ; (6) Recommandation PRO : 400-1 000 € main d’œuvre pour visiophone complet maison (1-2 jours) + garantie installateur ; (7) Certifications utiles : Qualifelec (électricien), CNAPS si sécurité (caméras liées alarme), certifié RGE si couplé domotique dans rénovation énergétique. Conserver facture + schéma câblage installateur + attestation CONSUEL si rénovation lourde élec pour activation garanties.',
  },
  {
    question: 'Quelles garanties et entretien pour un visiophone ?',
    answer:
      'Garanties légales (pose pro) : (1) Parfait achèvement 1 an art. 1792-6 Code civil ; (2) Biennale 2 ans art. 1792-3 : platine, moniteur, alimentation, gâche électrique ; (3) Décennale 10 ans art. 1792 : câblage encastré, percement murs, coulisses ; (4) Fabricant Legrand, Schneider, Somfy : 2-5 ans, Extel 3 ans, Bticino 3 ans. Entretien : (a) Nettoyage platine extérieure 2-4x/an (objectif caméra propreté, micro dépoussiérage, savon doux + eau, éviter alcool qui endommage joints silicone) ; (b) Vérif étanchéité joints platine annuel (infiltration pluie = cause n°1 panne) ; (c) Test fonction complet mensuel (appel, vidéo, ouverture porte) ; (d) MAJ firmware visiophone IP tous 6 mois (correctifs sécurité) ; (e) Changement pile radio platine tous 5-7 ans ; (f) Remplacement gâche électrique après 15-20 ans usage intensif. Pannes fréquentes : (i) Condensation caméra après gel = joint dégradé à remplacer 40-120 €, (ii) Son grésillant = potentiomètre encrassé, (iii) Image noire nuit = LED IR mortes (remplacement caméra 80-200 €). Fin de vie : recyclage DEEE obligatoire (déchèterie ou fabricant).',
  },
]

const sources = [
  {
    label: 'NF C 15-100 — Installation BT',
    url: 'https://www.afnor.org',
  },
  { label: 'RGPD — CNIL vidéosurveillance', url: 'https://www.cnil.fr' },
  { label: 'Art. 226-1 Code pénal — Vie privée', url: 'https://www.legifrance.gouv.fr' },
  { label: 'Art. R4544-9 Code travail — Habilitation', url: 'https://www.legifrance.gouv.fr' },
  { label: 'Loi 10 juillet 1965 — Copropriété', url: 'https://www.legifrance.gouv.fr' },
]

const relatedGuides = [
  { label: 'Domotique installation smart home', href: '/guides/domotique-installation-smart-home' },
  {
    label: 'Alarme maison installation prix',
    href: '/guides/alarme-maison-installation-prix',
  },
  { label: 'Portail motorisé prix pose', href: '/guides/portail-motorise-prix-pose' },
  { label: 'Normes électriques', href: '/guides/normes-electriques' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Sécurité',
    keywords: [
      'interphone prix installation',
      'visiophone prix',
      'visiophone connecté IP',
      'RGPD caméra interphone',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Interphone visiophone', url: `/guides/${SLUG}` },
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
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Interphone visiophone' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Bell className="w-3.5 h-3.5" aria-hidden />
              Sécurité · Guide vérifié
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Interphone / visiophone : prix 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Un interphone ou visiophone coûte 200-1 500 € TTC installé maison (filaire, radio, IP
              connecté) et 350-900 €/logement en copropriété. Voici les prix 2026, les technologies
              et les règles RGPD.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Prix interphones et visiophones 2026 installés</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Configuration</th>
                    <th className="p-3 border-b border-sand-200">Prix TTC</th>
                    <th className="p-3 border-b border-sand-200">Usage</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Interphone audio filaire', '200-400 €', 'Fonction basique'],
                    ['Visiophone filaire 7"', '400-800 €', 'Standard maison neuve'],
                    ['Visiophone radio 868 MHz', '500-900 €', 'Rénovation sans saignée'],
                    ['Visiophone IP connecté', '700-1 500 €', 'Smartphone partout'],
                    ['Copropriété /logement', '350-900 €', 'Platine + combiné'],
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
