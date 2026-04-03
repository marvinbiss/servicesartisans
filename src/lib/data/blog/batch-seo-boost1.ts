import type { BlogArticle } from './articles'

// All 5 original articles were identified as doublons in the SEO cannibalization audit (2026-04-03).
// They have been removed and 301-redirected to their respective pillar articles.
// See: scripts/gsc-data/cannibalization-audit.md — Groupes 1, 8, 16, 9, 15
export const seoBoost1Articles: Record<string, BlogArticle> = {}
