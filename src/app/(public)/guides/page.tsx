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
  Droplet,
  Flame,
  Key,
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
      'Quand la déclaration préalable est nécessaire, formulaire Cerfa 13703, délai d’instruction d’un mois et accord tacite.',
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
  {
    title: 'Vérifier le SIRET d’un artisan en 2026',
    description:
      'Méthode officielle en 3 minutes via l’Annuaire des Entreprises (INSEE Sirene) : activité, état actif, code NAF, date de création, signaux d’alerte.',
    href: '/guides/verifier-siret-artisan',
    icon: Search,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Comparer 3 devis d’artisans : méthode complète',
    description:
      'Grille de lecture ligne par ligne, écarts acceptables, signaux d’alerte, clauses qui changent tout et négociation efficace. Tableau d’exemple inclus.',
    href: '/guides/comparer-3-devis-artisans',
    icon: Scale,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Délai de rétractation d’un devis d’artisan',
    description:
      '14 jours après démarchage ou signature à domicile (art. L221-18). Conditions, procédure, modèle de lettre, sanctions en cas de refus.',
    href: '/guides/delai-retractation-devis-artisan',
    icon: Scale,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Comment choisir un artisan RGE en 2026',
    description:
      'Qualification par geste (QualiPAC, Qualibat 7131, Qualifelec IRVE…), vérification ADEME, pièges fraude et check-list avant signature.',
    href: '/guides/comment-choisir-artisan-rge',
    icon: ShieldCheck,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Refuser un devis d’artisan déjà signé : vos 4 options',
    description:
      'Rétractation 14 jours, vice du consentement, inexécution, accord amiable : conditions, preuves, coûts et modèle de lettre.',
    href: '/guides/refuser-devis-artisan-signe',
    icon: Scale,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Comment demander un devis de travaux',
    description:
      'Rédiger un cahier des charges clair, obtenir 3 réponses comparables sous 7 jours, photos, mentions à exiger et modèle e-mail.',
    href: '/guides/comment-faire-devis-travaux',
    icon: Hammer,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Labels et qualifications des artisans',
    description:
      'Tableau comparatif RGE, Qualibat, Qualifelec, Qualit’EnR, Professionnel Gaz, Handibat : autorité, gestes couverts, où vérifier.',
    href: '/guides/labels-qualifications-artisans',
    icon: Award,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Humidité sur un mur intérieur : solutions',
    description:
      '4 causes (condensation, infiltration, remontées capillaires, fuite), diagnostic visuel, traitements efficaces et prix 2026.',
    href: '/guides/humidite-mur-interieur-solution',
    icon: Home,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Moisissure mur chambre : traitement',
    description:
      'Risques sanitaires, nettoyage EPI, traitement définitif (ventilation, isolation, humidité). Protocole pas à pas.',
    href: '/guides/moisissure-mur-chambre-traitement',
    icon: Leaf,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Odeur de canalisation : 4 causes, vrais remèdes',
    description:
      'Siphon asséché, évent bouché, graisse, canalisation fissurée : diagnostic, DIY sans risque, quand appeler un plombier.',
    href: '/guides/odeur-canalisation-remede',
    icon: Hammer,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Prix rénovation maison 100 m² en 2026',
    description:
      'Budget par niveau (rafraîchissement, moyenne, complète, lourde) : 30 000 à 400 000 €. Détail par poste et aides 2026.',
    href: '/guides/prix-renovation-maison-100m2',
    icon: Euro,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Prix d’une pompe à chaleur air-eau installée',
    description:
      '10 000 à 18 000 € TTC selon puissance. Aides MaPrimeRénov’ + CEE jusqu’à 9 000 €. Grille par kW et profil revenus.',
    href: '/guides/prix-pompe-chaleur-air-eau-installee',
    icon: Euro,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Prix changement fenêtres double vitrage',
    description:
      '450 à 1 800 € par fenêtre posée selon matériau (PVC, alu, bois, mixte). Aides MaPrimeRénov’ + CEE cumulables.',
    href: '/guides/prix-changement-fenetres-double-vitrage',
    icon: Euro,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Prix électricien à l’heure en 2026',
    description:
      '45 à 75 €/h en journée, 90-150 €/h en urgence. Forfaits dépannage, tableau, IRVE. Arnaques à éviter.',
    href: '/guides/prix-electricien-heure-2026',
    icon: Euro,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Prix isolation combles 100 m²',
    description:
      'Soufflage (20-35 €/m²), panneaux (45-70 €/m²), sarking (120-250 €/m²). Aides 2026 jusqu’à 4 500 €.',
    href: '/guides/prix-isolation-combles-100m2',
    icon: Euro,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Prix pose carrelage au m²',
    description:
      'Pose droite 30-50 €/m², diagonale 45-70 €/m², motifs 60-120 €/m². Fourniture + préparation incluses.',
    href: '/guides/prix-carrelage-pose-m2',
    icon: Euro,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Prix installation chaudière gaz en 2026',
    description:
      '3 500 à 7 500 € installée (condensation). Fin de MaPrimeRénov’ chaudière gaz, comparaison avec PAC.',
    href: '/guides/prix-installation-chaudiere-gaz',
    icon: Euro,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Prix ravalement façade maison',
    description:
      '40 à 100 €/m² selon technique. Avec ITE : 150-250 €/m² éligible MaPrimeRénov’. Obligation légale 10 ans.',
    href: '/guides/prix-ravalement-facade-maison',
    icon: Euro,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Prix rénovation salle de bain 4 m²',
    description:
      'Rafraîchissement 2 500-5 000 €, rénovation complète 6 000-12 000 €, haut de gamme 12 000-20 000 €. Détail par poste.',
    href: '/guides/prix-renovation-salle-bain-4m2',
    icon: Euro,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Prix peinture appartement 50 m²',
    description:
      '1 500 à 4 500 € TTC tout compris selon état des supports. Prix au m², choix de peinture, préparation.',
    href: '/guides/prix-peinture-appartement-50m2',
    icon: Euro,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Coup de pouce chauffage 2026',
    description:
      'Primes CEE bonifiées pour remplacement chaudière fioul/gaz : pompe à chaleur, chaudière biomasse, raccordement réseau chaleur.',
    href: '/guides/coup-de-pouce-chauffage-2026',
    icon: Flame,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Prime pompe à chaleur locataire',
    description:
      'Les locataires peuvent-ils obtenir des aides pour une pompe à chaleur ? Démarches, rôle du propriétaire, éligibilité 2026.',
    href: '/guides/prime-pompe-chaleur-locataire',
    icon: Snowflake,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'MaPrimeRénov’ copropriété',
    description:
      'Dispositif MaPrimeRénov’ Copropriétés : 25-45 % de travaux collectifs. Démarche syndic, vote AG, bonification.',
    href: '/guides/maprimerenov-copropriete',
    icon: Building2,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Aide isolation maison propriétaire',
    description:
      'MaPrimeRénov’, CEE, éco-PTZ : les aides cumulables pour isoler combles, murs, planchers. Montants 2026 par zone.',
    href: '/guides/aide-isolation-maison-proprietaire',
    icon: Home,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Éco-PTZ 2026',
    description:
      'Éco-prêt à taux zéro : jusqu’à 50 000 € sans intérêts, 13 banques partenaires, cumul MaPrimeRénov’ + CEE.',
    href: '/guides/eco-pret-taux-zero-2026',
    icon: Euro,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Plafonds MaPrimeRénov’ revenus 2026',
    description:
      'Barème officiel 2026 : Bleu / Jaune / Violet / Rose, par nombre de personnes, IDF et hors IDF.',
    href: '/guides/plafond-maprimerenov-revenus-2026',
    icon: Euro,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Fuite d’eau : que faire',
    description:
      'Gestes d’urgence : couper l’eau, identifier la source, contacter plombier, déclarer à l’assurance.',
    href: '/guides/fuite-eau-que-faire',
    icon: Droplet,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Panne électrique générale : conduite à tenir',
    description:
      'Distinguer panne Enedis d’un problème interne, vérifier disjoncteur, différentiel, isoler le circuit.',
    href: '/guides/panne-electrique-generale-conduite',
    icon: Zap,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Porte claquée : prix serrurier',
    description:
      'Tarifs honnêtes 2026, méthodes sans casse, éviter arnaques serrurier 24h/7j. Assistance habitation.',
    href: '/guides/porte-claquee-serrurier-prix',
    icon: Key,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Chaudière ne chauffe plus',
    description:
      'Diagnostic pression, codes erreur, coûts dépannage, contrat d’entretien, arbitrage réparation/remplacement.',
    href: '/guides/chaudiere-ne-chauffe-plus',
    icon: Flame,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Installation pompe à chaleur : 7 étapes',
    description:
      'De l’audit à la mise en service : 6-14 semaines. Artisan RGE QualiPAC, aides MaPrimeRénov’ 2026 jusqu’à 11 000 €.',
    href: '/guides/installation-pompe-chaleur-etapes',
    icon: Snowflake,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Isolation extérieure vs intérieure',
    description:
      'ITE vs ITI : comparatif prix, performance, ponts thermiques, surface perdue, aides 2026, autorisations.',
    href: '/guides/isolation-exterieure-vs-interieure',
    icon: Home,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Chaudière gaz vs granulés',
    description:
      'Comparatif coût, rendement, aides 2026. Gaz 3,5-6,5 k€ vs granulés 14-22 k€. Aides rééquilibrent.',
    href: '/guides/chaudiere-gaz-vs-granules',
    icon: Flame,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Remplacement fenêtres : aides 2026',
    description:
      'MPR parcours accompagné 40-100 €/fenêtre, CEE, TVA 5,5 %, éco-PTZ. Uw ≤1,3 W/m²·K obligatoire.',
    href: '/guides/remplacement-fenetres-aides-2026',
    icon: Wind,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Ouverture mur porteur : prix',
    description:
      '1 500-6 000 € TTC selon portée. Étude structure béton obligatoire 400-900 €. Démarches copropriété détaillées.',
    href: '/guides/ouverture-mur-porteur-prix',
    icon: Hammer,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Aménagement combles perdus : prix',
    description:
      '900-1 800 €/m² TTC selon faisabilité. Hauteur, pente, charpente, fermettes, DP/PC, isolation.',
    href: '/guides/amenagement-combles-perdus-prix',
    icon: Home,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'DPE mauvais (E, F, G) : que faire',
    description:
      'Calendrier interdictions location 2025-2034, travaux prioritaires, aides cumulables, décote vente.',
    href: '/guides/dpe-mauvais-que-faire',
    icon: Home,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Passoire thermique : rénovation',
    description:
      '5,2 M de passoires en France. Rénovation obligatoire 2025-2034, exceptions ABF, coût et aides.',
    href: '/guides/passoire-thermique-renovation',
    icon: Snowflake,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Classe F interdite location 2028',
    description:
      '1,3 M logements F loués concernés. Calendrier, dérogations, travaux pour atteindre E ou D.',
    href: '/guides/classe-energie-f-interdite-2028',
    icon: Snowflake,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'MaPrimeRénov’ parcours accompagné',
    description:
      'Aide jusqu’à 63 000 € avec gain ≥2 classes DPE. Mon Accompagnateur Rénov’ obligatoire, barème 2026.',
    href: '/guides/maprimerenov-parcours-accompagne',
    icon: Users,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Surélévation toiture : prix',
    description:
      '2 000-3 500 €/m² TTC bois. PC obligatoire, archi si >150 m². Bois vs béton, faisabilité PLU.',
    href: '/guides/surelevation-toiture-prix',
    icon: Home,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Fissures maison : inquiétantes ?',
    description:
      '3 niveaux de gravité, RGA sécheresse, expertise BE, assurance CatNat, micropieux 8-25 k€.',
    href: '/guides/fissures-maison-inquietantes',
    icon: ShieldAlert,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Condensation fenêtres : 5 causes',
    description:
      'Humidité, VMC, pont thermique, simple vitrage, joints. Solutions du geste gratuit à VMC hygro B.',
    href: '/guides/condensation-fenetres-causes',
    icon: Wind,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Infiltration toiture : diagnostic',
    description:
      '7 causes classiques, méthode pro, prix réparation couvreur 200-4 500 €, assurance dégât des eaux.',
    href: '/guides/infiltration-eau-toiture-diagnostic',
    icon: Droplet,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Remontée capillaire mur : solution',
    description:
      'Diagnostic salpêtre, injection résine 30-60 €/ml, méfiance méthodes miracles, entreprise RGE.',
    href: '/guides/remontee-capillaire-mur-solution',
    icon: Droplet,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Isolation phonique mur appartement',
    description:
      'Loi masse-ressort-masse, contre-cloison pro 80-180 €/m², +20 dB. Affaiblissement vs perception.',
    href: '/guides/isolation-phonique-mur-appartement',
    icon: Home,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Pont thermique : traitement',
    description:
      'Dalles, refends, nez de plancher. 10-30 % déperditions ITI. ITE ou rupteurs en neuf. Caméra thermique.',
    href: '/guides/pont-thermique-maison-traitement',
    icon: Snowflake,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Taxe d’aménagement 2026',
    description:
      '1 036 €/m² hors IDF, 1 174 € IDF. Taux communaux, exonérations, paiement en 2 fois. Calcul détaillé.',
    href: '/guides/taxe-amenagement-calcul-2026',
    icon: Calculator,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'VMC obligatoire maison neuve',
    description:
      'Arrêté 1982 + RE2020. Simple flux auto/hygro B, double flux thermodynamique. Débits, entretien DTU 68.3.',
    href: '/guides/vmc-obligatoire-maison-neuve',
    icon: Wind,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Assurance habitation et travaux',
    description:
      'Déclaration à l’assureur, MRH pendant chantier, Dommages-Ouvrage obligatoire gros travaux, décennale.',
    href: '/guides/assurance-habitation-travaux',
    icon: ShieldCheck,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Garantie parfait achèvement 1 an',
    description:
      'Art. 1792-6 Code civil. Couvre TOUS désordres signalés 1 an. Procédure LRAR, PV réception obligatoire.',
    href: '/guides/garantie-parfait-achevement',
    icon: ShieldCheck,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'QualiPAC : signification et obtention',
    description:
      'Qualification RGE pompe à chaleur. 4 modules, obligatoire aides MPR + CEE. Vérifier sur qualit-enr.org.',
    href: '/guides/qualipac-signification-obtenir',
    icon: Award,
    badge: 'Nouveau',
    badgeColor: 'bg-primary-100 text-primary-800',
  },
  {
    title: 'Infiltration fenêtre PVC pluie',
    description:
      '5 causes classiques, test arrosage, joint EPDM, garantie décennale si pose défectueuse <10 ans.',
    href: '/guides/infiltration-fenetre-pvc',
    icon: Droplet,
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
