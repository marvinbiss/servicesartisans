import type { BlogArticle } from './articles'

// All 5 original articles were identified as doublons in the SEO cannibalization audit (2026-04-03).
// They have been removed and 301-redirected to their respective pillar articles.
// See: scripts/gsc-data/cannibalization-audit.md — Groupes 18, 7, 6, 12, 11
export const batchSeoBoost2Articles: Record<string, BlogArticle> = {}
