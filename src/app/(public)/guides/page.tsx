import { Metadata } from 'next'
import Link from 'next/link'
import {
  BookOpen,
  Euro,
  BarChart3,
  HelpCircle,
  ArrowRight,
  Newspaper,
  Scale,
  Zap,
  FileText,
  ShieldCheck,
  Building2,
  Hammer,
  Users,
  ShowerHead,
  ChefHat,
  Leaf,
  Search,
  ShieldAlert,
  Calculator,
  Home,
  FileCheck,
  Wind,
  Snowflake,
  Award,
} from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { SITE_URL } from '@/lib/seo/config'
import RelatedHubs from '@/components/seo/RelatedHubs'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Guides Pratiques pour vos Travaux | ServicesArtisans',
  description:
    'Guides complets pour vos travaux : aides financières, rénovation énergétique, MaPrimeRénov 2026, conseils artisans. Informations fiables et à jour.',
  alternates: {
    canonical: `${SITE_URL}/guides`,
  },
  openGraph: {
    title: 'Guides Pratiques pour vos Travaux',
    description:
      'Guides complets pour vos travaux : aides financières, rénovation énergétique, MaPrimeRénov 2026, conseils artisans.',
    url: `${SITE_URL}/guides`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guides Pratiques pour vos Travaux',
    description:
      'Guides complets pour vos travaux : aides financières, rénovation énergétique, MaPrimeRénov 2026, conseils artisans.',
  },
}

const guides = [
  {
    title: 'MaPrimeRénov 2026 : Guide Complet',
    description:
      'Tout savoir sur MaPrimeRénov en 2026 : montants, conditions, parcours accompagné et par geste, barèmes de revenus et démarches.',
    href: '/guides/maprimerenov-2026',
    icon: Euro,
    badge: 'Populaire',
    badgeColor: 'bg-green-100 text-green-800',
  },
  {
    title: 'Aides Rénovation Énergétique 2026',
    description:
      'Toutes les aides financières pour vos travaux de rénovation énergétique : MaPrimeRénov, CEE, éco-PTZ, TVA réduite et aides locales.',
    href: '/guides/aides-renovation-2026',
    icon: Building2,
    badge: undefined,
    badgeColor: '',
  },
  {
    title: 'Artisan RGE : Vérifier et Trouver un Certifié',
    description:
      'Comment vérifier la certification RGE, pourquoi choisir un artisan RGE et où trouver un professionnel certifié près de chez vous.',
    href: '/guides/artisan-rge',
    icon: ShieldCheck,
    badge: undefined,
    badgeColor: '',
  },
  {
    title: 'Permis de Construire 2026',
    description:
      'Quand le permis de construire est obligatoire (>20 m², >40 m² en zone PLU), documents requis, délais et cas spéciaux.',
    href: '/guides/permis-construire',
    icon: Scale,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Normes Électriques NF C 15-100',
    description:
      'Guide de la norme NF C 15-100 : nombre de prises par pièce, protection des circuits, zones salle de bain et mise aux normes.',
    href: '/guides/normes-electriques',
    icon: Zap,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Déclaration Préalable de Travaux',
    description:
      'Quand la déclaration préalable est nécessaire, formulaire Cerfa 13703, délai d"instruction d"un mois et accord tacite.',
    href: '/guides/declaration-prealable-travaux',
    icon: FileText,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Garantie Décennale : Tout Comprendre',
    description:
      "Définition, durée de 10 ans, travaux couverts, exclusions, vérification de l'attestation et démarches en cas de sinistre.",
    href: '/guides/garantie-decennale',
    icon: ShieldCheck,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Devis Travaux : Guide pour Bien Comparer',
    description:
      'Mentions obligatoires, combien de devis demander, comment comparer, négocier et éviter les pièges.',
    href: '/guides/devis-travaux',
    icon: Hammer,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Travaux en Copropriété : Règles et Démarches',
    description:
      'Parties communes vs privatives, vote en AG, majorités requises, autorisations et gros travaux obligatoires.',
    href: '/guides/travaux-copropriete',
    icon: Users,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Assurance Dommage-Ouvrage : Est-ce Obligatoire ?',
    description:
      "Définition, obligation légale, coût (1 à 5 % du chantier), souscription et conséquences en cas d'absence.",
    href: '/guides/assurance-dommage-ouvrage',
    icon: ShieldCheck,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Comment Trouver un Artisan de Confiance en 2026',
    description:
      'Vérifications SIRET, décennale, RGE, comparaison de devis, labels, droits du client et recours. Le guide complet pour éviter les mauvaises surprises.',
    href: '/guides/trouver-artisan',
    icon: Search,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: "Arnaques Artisans : Comment les Repérer et s'en Protéger",
    description:
      "Les 10 arnaques les plus fréquentes, signaux d'alerte, vérifications et recours en cas de fraude. Témoignages et organismes de protection.",
    href: '/guides/eviter-arnaques-artisan',
    icon: ShieldAlert,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Budget Rénovation : Combien Coûtent vos Travaux en 2026 ?',
    description:
      "Prix au m² par type de rénovation, budget par pièce, aides financières (MaPrimeRénov', CEE, éco-PTZ) et conseils pour maîtriser votre budget.",
    href: '/guides/budget-renovation',
    icon: Calculator,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Rénovation Salle de Bain : Étapes, Prix et Conseils 2026',
    description:
      "Guide complet : les 7 étapes d'une rénovation SDB, prix par poste (douche italienne, carrelage, plomberie), budget total et erreurs à éviter.",
    href: '/guides/renovation-salle-de-bain',
    icon: ShowerHead,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Rénovation Cuisine : Guide Complet des Étapes et Prix 2026',
    description:
      "De la conception à la pose : étapes, prix par poste (meubles, plan de travail, électroménager), types d'implantation et comparatif des matériaux.",
    href: '/guides/renovation-cuisine',
    icon: ChefHat,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Rénovation Énergétique : Guide Complet pour Votre Maison',
    description:
      "Les 4 piliers (isolation, chauffage, ventilation, fenêtres), l'ordre optimal des travaux, toutes les aides 2026 et le retour sur investissement.",
    href: '/guides/renovation-energetique-complete',
    icon: Leaf,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Pompe à Chaleur : Guide Complet Prix, Aides et Installation 2026',
    description:
      "Types de PAC (air-eau, air-air, géothermique), prix d'achat et pose, COP, aides MaPrimeRénov' et CEE, entretien et rentabilité.",
    href: '/guides/pompe-a-chaleur',
    icon: Leaf,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Isolation Thermique : Guide Complet Prix, Matériaux et Aides 2026',
    description:
      'Comparatif des isolants (laine de verre, polyuréthane, ouate de cellulose), prix au m², résistance thermique R, aides financières et techniques de pose.',
    href: '/guides/isolation-thermique',
    icon: Leaf,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Isolation des Combles : Guide Prix, Techniques et Aides 2026',
    description:
      "Isolation combles perdus et aménageables : soufflage, panneaux, sarking, prix au m² (20-80€), aides MaPrimeRénov' et CEE, économies d'énergie.",
    href: '/guides/isolation-combles',
    icon: Leaf,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Extension de Maison : Démarches, Prix et Conseils 2026',
    description:
      "Types d'extensions (latérale, surélévation, véranda), démarches DP ou permis selon la surface, prix au m² (800-2500€) et matériaux.",
    href: '/guides/extension-maison',
    icon: Building2,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Diagnostics Immobiliers : Le Guide Complet',
    description:
      'Les 10 diagnostics obligatoires (DPE, amiante, plomb, termites, électricité, gaz), durée de validité, prix et qui peut les réaliser.',
    href: '/guides/diagnostics-immobiliers',
    icon: FileCheck,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Rénovation de Toiture : Travaux et Prix 2026',
    description:
      "Signes d'usure, types de couverture (tuile, ardoise, zinc, bac acier), prix (60-200€/m²), isolation et aides MaPrimeRénov.",
    href: '/guides/renovation-toiture',
    icon: Home,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: "MaPrimeRénov' 2026 : Critères RGE, Montants et Dossier",
    description:
      "Guide complet MaPrimeRénov' 2026 : barèmes par travaux, plafonds de ressources, dossier en 5 étapes, obligation RGE et cumul avec les CEE.",
    href: '/guides/maprimerenov-2026-criteres-rge',
    icon: Euro,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: "Certificats d'Économies d'Énergie (CEE) 2026 : Guide Complet",
    description:
      "Mécanisme des CEE, coup de pouce chauffage et isolation, opérations primées, démarche concrète et cumul avec MaPrimeRénov' en 2026.",
    href: '/guides/cee-certificats-economies-energie-2026',
    icon: Award,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Qualibat, QualiPAC, Qualifelec, QualiSol : Quelle Qualification RGE ?',
    description:
      'Comparatif des qualifications RGE par métier : isolation, pompe à chaleur, électricité, solaire. Comment vérifier et choisir selon vos travaux.',
    href: '/guides/qualibat-qualipac-qualifelec-qui-choisir',
    icon: Award,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: "Pompe à Chaleur 2026 : Aides CEE + MaPrimeRénov' Cumulables",
    description:
      "Types de PAC, barèmes MaPrimeRénov' 2026, coup de pouce CEE chauffage, cumul total, exemple chiffré et obligation QualiPAC.",
    href: '/guides/pompe-a-chaleur-cee-maprimerenov-2026',
    icon: Wind,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Isolation ITE vs ITI 2026 : Comparatif, Artisan RGE et Aides',
    description:
      "Différence ITE / ITI, matériaux, coût au m², MaPrimeRénov' Isolation, Coup de pouce CEE et obligation Qualibat RGE en 2026.",
    href: '/guides/isolation-ite-iti-rge-aides-2026',
    icon: Snowflake,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Changer ses Fenêtres : Matériaux, Prix et Aides 2026',
    description:
      'Matériaux (PVC, bois, alu, mixte), types de vitrage, pose en rénovation vs dépose totale, prix et aides financières (MaPrimeRénov, CEE, TVA 5,5%).',
    href: '/guides/renovation-fenetres',
    icon: Home,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
]

const relatedPages = [
  {
    title: 'Checklist avant travaux',
    description:
      '60 points de contrôle essentiels pour préparer, suivre et réceptionner vos travaux sans rien oublier.',
    href: '/checklist-travaux',
    icon: FileCheck,
  },
  {
    title: 'Questions fréquentes',
    description: 'Réponses aux questions les plus posées sur les travaux et les artisans.',
    href: '/faq',
    icon: HelpCircle,
  },
  {
    title: 'Blog',
    description: "Actualités, conseils et tendances du secteur de l'artisanat.",
    href: '/blog',
    icon: Newspaper,
  },
  {
    title: 'Baromètre des prix',
    description: 'Tarifs moyens, indices régionaux et tendances pour les métiers du bâtiment.',
    href: '/barometre',
    icon: BarChart3,
  },
]

export default function GuidesPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
  ])

  return (
    <>
      <JsonLd data={breadcrumbSchema} />

      <div className="min-h-screen bg-sand-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Breadcrumb items={[{ label: 'Guides' }]} />
          </div>
        </div>

        {/* Hero */}
        <div className="bg-gradient-to-b from-primary-50 to-sand-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-8 h-8 text-primary-500" />
              <h1 className="text-3xl md:text-4xl font-bold text-charcoal-900 font-heading">
                Guides Pratiques
              </h1>
            </div>
            <p className="text-lg text-charcoal-600 max-w-2xl">
              {
                "Retrouvez nos guides complets pour vous accompagner dans vos projets de travaux : aides financières, rénovation énergétique, choix d'un artisan et bien plus."
              }
            </p>
          </div>
        </div>

        {/* Guides list */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-xl font-semibold text-charcoal-900 mb-6">Nos guides</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {guides.map((guide) => (
              <Link
                key={guide.href}
                href={guide.href}
                className="group bg-white rounded-xl border border-sand-300 p-6 hover:shadow-lg hover:border-primary-200 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <guide.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-charcoal-900 group-hover:text-primary-500 transition-colors">
                        {guide.title}
                      </h3>
                      {guide.badge && (
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${guide.badgeColor}`}
                        >
                          {guide.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-charcoal-600 text-sm">{guide.description}</p>
                    <span className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-primary-500 group-hover:gap-2 transition-all">
                      Lire le guide <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Related pages */}
          <div className="mt-16">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-6">
              {'Ressources complémentaires'}
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {relatedPages.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  className="group bg-white rounded-lg border border-sand-300 p-5 hover:shadow-md hover:border-primary-200 transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <page.icon className="w-5 h-5 text-charcoal-400 group-hover:text-primary-400 transition-colors" />
                    <h3 className="font-medium text-charcoal-900 group-hover:text-primary-500 transition-colors">
                      {page.title}
                    </h3>
                  </div>
                  <p className="text-sm text-charcoal-500">{page.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <RelatedHubs currentPath="/guides" />
    </>
  )
}
