/**
 * GET /api/v1/barometre/renovation/embed.html
 *
 * Sprint 5 part 2 — Indice Rénovation™ embed iframe partageable.
 * Permet aux médias régionaux + journalistes de citer SA en 1 ligne :
 *   <iframe src="https://servicesartisans.fr/api/v1/barometre/renovation/embed.html"
 *           width="100%" height="640" loading="lazy" frameborder="0"></iframe>
 *
 * Stratégie : levier DR (cf STRATEGIE-20-80-REVENU-CLICS-2026-05-06.md §Sprint 5).
 * Cible : 5+ embeds Tier 2 + 1-2 backlinks Tier 1 → DR 0,6 → 2-4 à M+1.
 *
 * Données : 6 KPIs synchrones avec /barometre/renovation-energetique-2026
 * (parc DPE, MPR distribués, RGE, marché €). Source = data publique
 * agrégée (ADEME / ANAH / France Rénov' / BPI France / INSEE).
 *
 * Licence : CC-BY 4.0 — attribution obligatoire avec lien retour vers
 * /barometre/renovation-energetique-2026.
 */
import { NextResponse } from 'next/server'
import { SITE_URL, SITE_NAME } from '@/lib/seo/config'

export const dynamic = 'force-static'
export const revalidate = 86400

const BAROMETRE_URL = `${SITE_URL}/barometre/renovation-energetique-2026`

const KPI = [
  {
    label: 'Logements en France',
    value: '30,4 M',
    detail: 'parc résidences principales (INSEE 2024)',
  },
  {
    label: 'Passoires énergétiques (F+G)',
    value: '5,1 M',
    detail: '~17 % du parc — interdites loc. (Loi Climat 2025-2034)',
  },
  {
    label: 'Dossiers MaPrimeRénov’ 2024',
    value: '~700 000',
    detail: 'distribués par l’ANAH (yc rénov. ampleur)',
  },
  {
    label: 'Artisans RGE certifiés',
    value: '~62 000',
    detail: 'France entière — ADEME / France Rénov’',
  },
  {
    label: 'Marché rénovation 2026',
    value: '87 Md€',
    detail: 'estimation BPI France / Xerfi',
  },
  {
    label: 'CO₂ secteur résidentiel',
    value: '−7 % vs 2020',
    detail: 'logement = 17 % émissions France (Citepa)',
  },
]

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderHtml(): string {
  const cards = KPI.map(
    (k) => `
      <article class="kpi">
        <div class="kpi-value">${escapeHtml(k.value)}</div>
        <div class="kpi-label">${escapeHtml(k.label)}</div>
        <div class="kpi-detail">${escapeHtml(k.detail)}</div>
      </article>`
  ).join('')

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="robots" content="noindex,nofollow" />
<title>Indice Rénovation Énergétique 2026 — ${escapeHtml(SITE_NAME)}</title>
<style>
  *,*::before,*::after{box-sizing:border-box}
  html,body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,Arial,sans-serif;background:#fafaf7;color:#1a1a1a}
  .wrap{max-width:880px;margin:0 auto;padding:24px 20px}
  header{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:18px;flex-wrap:wrap}
  h1{margin:0;font-size:18px;line-height:1.3;color:#0f4c3a}
  .sub{margin:4px 0 0;font-size:12px;color:#6b6b6b}
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}
  .kpi{background:#fff;border:1px solid #e6e2d6;border-radius:12px;padding:16px}
  .kpi-value{font-size:26px;font-weight:700;color:#0f4c3a;line-height:1.1}
  .kpi-label{margin-top:4px;font-size:13px;font-weight:600;color:#1a1a1a}
  .kpi-detail{margin-top:6px;font-size:11px;color:#6b6b6b;line-height:1.4}
  footer{margin-top:18px;padding-top:14px;border-top:1px solid #e6e2d6;font-size:11px;color:#6b6b6b;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
  footer a{color:#0f4c3a;text-decoration:none;font-weight:600}
  footer a:hover{text-decoration:underline}
  .badge{display:inline-block;padding:2px 8px;border-radius:999px;background:#0f4c3a;color:#fff;font-size:10px;font-weight:600;letter-spacing:0.3px;text-transform:uppercase}
  @media (prefers-color-scheme: dark){
    html,body{background:#fafaf7;color:#1a1a1a}
  }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <div>
      <h1>Indice Rénovation Énergétique France · 2026</h1>
      <p class="sub">Données publiques agrégées — ADEME, ANAH, France Rénov’, BPI France, INSEE.</p>
    </div>
    <span class="badge">CC-BY 4.0</span>
  </header>

  <div class="grid">${cards}
  </div>

  <footer>
    <span>
      Source : <a href="${BAROMETRE_URL}" target="_blank" rel="noopener">${escapeHtml(SITE_NAME)} — Baromètre Rénovation 2026</a>
    </span>
    <span>Licence CC-BY 4.0 — réutilisation libre avec attribution.</span>
  </footer>
</div>
</body>
</html>`
}

export async function GET() {
  const html = renderHtml()
  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Embeds tiers : autoriser le cross-origin frame.
      'Access-Control-Allow-Origin': '*',
      'X-Frame-Options': 'ALLOWALL',
      'Content-Security-Policy': 'frame-ancestors *',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
