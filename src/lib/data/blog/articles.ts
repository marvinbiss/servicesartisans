import { existingArticles } from './existing-articles'
import { prixArticles } from './batch-prix'
import { metiersArticles } from './batch-metiers'
import { projetsArticles } from './batch-projets'
import { conseilsArticles } from './batch-conseils'
import { reglementationArticles } from './batch-reglementation'
import { seoBoost1Articles } from './batch-seo-boost1'
import { batchSeoBoost2Articles } from './batch-seo-boost2'
import { batchSeoBoost3Articles } from './batch-seo-boost3'
import { metiers3Articles } from './batch-metiers-3'
import { metiers4Articles } from './batch-metiers-4'
import { securiteEnergieArticles } from './batch-securite-energie'
import { aidesSaisonnierArticles } from './batch-aides-saisonnier'
import { guidesDiversArticles } from './batch-guides-divers'
import { saisonnierArticles } from './batch-saisonnier'
import { inspirationArticles } from './batch-inspiration'
import { diyArticles } from './batch-diy'
import { energieArticles } from './batch-energie-2026'
import { renovationArticles } from './batch-renovation-2026'
import { produitsArticles } from './batch-produits-materiaux'
import { tutorielsDiy2Articles } from './batch-tutoriels-diy-2'
import { tutorielsDiyArticles } from './batch-tutoriels-diy'
import { saisonnierUrgenceArticles } from './batch-saisonnier-urgence'
import { prixRegionauxArticles } from './batch-prix-regionaux'
import { comparatifsArticles } from './batch-comparatifs-materiaux'
import { prixBtpArticles } from './batch-prix-btp'
import { prixMetalBoisArticles } from './batch-prix-metal-bois'
import { prixDesignArticles } from './batch-prix-design'
import { prixTechArticles } from './batch-prix-tech'
import { prixServicesArticles } from './batch-prix-services'
import { prixVillesArticles } from './batch-prix-villes'
import { aides2026Articles } from './batch-aides-2026'
import { urgencesGuidesArticles } from './batch-urgences-guides'
import { saisonniers2026Articles } from './batch-saisonniers-2026'
import { metiers5Articles } from './batch-metiers-5'
import { prestationsArticles } from './batch-prestations-problemes'
import { piliersArticles } from './batch-piliers-2026'

export interface BlogArticle {
  title: string
  excerpt: string
  content: string[]
  image: string
  author: string
  date: string
  readTime: string
  category: string
  tags: string[]
  authorBio?: string
  updatedDate?: string
  keyTakeaways?: string[]
  faq?: { question: string; answer: string }[]
  /** SEO-optimized title for SERP (Google). Falls back to `title` if absent. */
  metaTitle?: string
  /** SEO-optimized description for SERP (Google). Falls back to `excerpt` if absent. */
  metaDescription?: string
}

/**
 * Slugs removed due to SEO cannibalization — 301-redirected to pillar articles.
 * See: scripts/gsc-data/cannibalization-audit.md (2026-04-03)
 * Corresponding 301 redirects are in next.config.js → redirects()
 */
const REDIRECTED_SLUGS: ReadonlySet<string> = new Set([
  // batch-seo-boost1 (all 5 removed — file emptied)
  'maprimerenov-2026-guide-complet-aides-renovation',       // G1 → maprimerénov-2026-conditions-montants
  'comment-choisir-artisan-confiance-guide-2026',            // G8 → comment-verifier-artisan-avant-engager
  'prix-renovation-maison-2026-budget-complet',              // G16 → renovation-maison-prix-m2-2026
  'pompe-a-chaleur-guide-complet-2026',                      // G9 → prix-pompe-a-chaleur-2026
  'isolation-maison-guide-complet-materiaux-prix-aides',     // G15 → prix-isolation-thermique-2026-tarifs

  // batch-seo-boost2 (all 5 removed — file emptied)
  'dpe-diagnostic-performance-energetique-tout-savoir',      // G18 → dpe-obligatoire-2026-guide
  'devis-travaux-comprendre-comparer-negocier',              // G7 → devis-travaux-comprendre
  'renovation-salle-de-bain-guide-complet-prix-2026',        // G6 → renovation-salle-de-bain-budget-etapes
  'entretien-maison-calendrier-annuel-checklist',            // G12 → entretien-annuel-maison-checklist-complete
  'arnaques-artisans-reconnaitre-eviter-recours',            // G11 → 10-arnaques-courantes-batiment

  // batch-seo-boost3 (4 of 5 removed — kept prix-toiture)
  // Note: eco-ptz-2026-pret-taux-zero-renovation exists in BOTH batch-aides-2026 (pillar) and batch-seo-boost3 (deleted).
  // Since boost3 is now empty, the aides-2026 version surfaces as pillar. Do NOT exclude it.
  'renovation-energetique-par-ou-commencer',                 // G13 → travaux-renovation-energetique-par-ou-commencer
  'normes-electriques-2026-nfc-15-100-guide',                // G26 → electricite-normes-securite
  'fuite-eau-urgence-guide-complet-gestes-couts',            // G27 → fuite-eau-que-faire-urgence

  // batch-renovation-2026 (3 articles)
  'renovation-salle-de-bain-prix-guide-2026',                // G6 → renovation-salle-de-bain-budget-etapes
  'devis-travaux-guide-complet',                             // G7 → devis-travaux-comprendre
  'cuisine-equipee-prix-pose-2026',                          // G20 → prix-cuisiniste-2026-pose-cuisine

  // batch-securite-energie (1 article)
  'pompe-chaleur-air-eau-guide-2026',                        // G9 → prix-pompe-a-chaleur-2026

  // batch-reglementation (1 article)
  'aides-renovation-2026-cumul-guide',                       // G14 → cumul-aides-renovation-2026-tableau

  // batch-aides-saisonnier (1 article)
  'cumul-aides-renovation-energetique-2026',                 // G14 → cumul-aides-renovation-2026-tableau

  // batch-conseils (1 article)
  'preparer-maison-hiver-guide-complet',                     // G21 → preparer-maison-hiver-checklist

  // batch-saisonnier-urgence (1 article)
  'preparer-maison-hiver',                                   // G21 → preparer-maison-hiver-checklist

  // batch-energie-2026 (1 article)
  'extension-maison-prix-m2-2026',                           // G23 → prix-extension-maison-2026
])

/** Every blog article keyed by slug (excluding redirected doublons) */
const _rawArticles: Record<string, BlogArticle> = {
  ...existingArticles,
  ...prixArticles,
  ...metiersArticles,
  ...projetsArticles,
  ...conseilsArticles,
  ...reglementationArticles,
  ...seoBoost1Articles,
  ...batchSeoBoost2Articles,
  ...batchSeoBoost3Articles,
  ...metiers3Articles,
  ...metiers4Articles,
  ...securiteEnergieArticles,
  ...aidesSaisonnierArticles,
  ...guidesDiversArticles,
  ...saisonnierArticles,
  ...inspirationArticles,
  ...diyArticles,
  ...energieArticles,
  ...renovationArticles,
  ...produitsArticles,
  ...tutorielsDiy2Articles,
  ...tutorielsDiyArticles,
  ...saisonnierUrgenceArticles,
  ...prixRegionauxArticles,
  ...comparatifsArticles,
  ...prixBtpArticles,
  ...prixMetalBoisArticles,
  ...prixDesignArticles,
  ...prixTechArticles,
  ...prixServicesArticles,
  ...prixVillesArticles, // 200 articles prix x ville generés programmatiquement
  ...aides2026Articles,
  ...urgencesGuidesArticles,
  ...saisonniers2026Articles,
  ...metiers5Articles,
  ...prestationsArticles,
  ...piliersArticles,
}

/** Filtered articles — redirected doublons excluded */
export const allArticles: Record<string, BlogArticle> = Object.fromEntries(
  Object.entries(_rawArticles).filter(([slug]) => !REDIRECTED_SLUGS.has(slug))
)

/** All slugs for generateStaticParams */
export const articleSlugs: string[] = Object.keys(allArticles)
