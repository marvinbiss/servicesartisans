# Design Premium — Synthèse 5 agents (2026-06-05)

Recherche : marketplaces monde (Thumbtack/Houzz/Checkatrade), premium tech (Linear/Stripe/Vercel/Apple — valeurs mesurées), concurrents FR (Effy/Hellio/IZI/Otovo), tendances 2026, audit interne.

## Verdict stratégique

1. **Palette sand/clay/charcoal/terracotta = GARDER.** C'est exactement la tendance 2026 (warm neutrals). Différencie du bleu institutionnel interchangeable (Effy/IZI/Hellio) et de l'orange agrégateur cheap (Habitatpresto `#ff580c`).
2. **Le système existe (DESIGN.md solide) — le problème est l'enforcement.** 5 traitements CTA concurrents, 2459 `gray-*` bannis, 560 `blue-*`, radius lg/xl 50/50 sans règle, shadows génériques > tokens brand.
3. **Moat visuel inexploité** : 49K fiches RGE vérifiables ADEME. Concurrents cachent leurs artisans + montants d'aides vagues ("selon éligibilité"). Personne n'affiche les montants MaPrimeRénov'/CEE en tableaux autoritaires.

## Formule premium (valeurs mesurées Linear/Stripe/Vercel/Apple)

- **Typo** : headings weight **600** (jamais 700 sauf consumer-warm), tracking négatif -1 à -4% sur display (`tracking-tight`+), body line-height 1.4-1.55, uppercase = tracking positif. `text-wrap: balance` sur headings.
- **Ink** : jamais `#000`. Headings `#171717`-class (= charcoal-900 `#1C1917` ✓), body `#4d4d4d`-class (= charcoal-600/700), muted `#888` (= charcoal-500).
- **Radius** : boutons/inputs 6-8px, cards 12px max côté tech premium. Convention SA (DESIGN.md) : cards `2xl`, boutons `xl` — on garde la convention SA mais on l'ENFORCE (fin du lg/xl aléatoire).
- **Shadows** : empilées faible opacité (2-10%) + ring inset 1px, OU hairline border `1px` sans shadow. Jamais `shadow-lg` brut. Tokens brand `shadow-soft`/`shadow-card-hover` à imposer.
- **Accent** : UN seul (terracotta primary-500). 1 CTA rempli max par section. Stars en jaune `#febe14`-class, jamais couleur brand.
- **Espacement** : sections `py-16`/`py-24`, cards `p-6`/`p-8`.
- **Data YMYL** : `tabular-nums` sur TOUS montants/stats, montants ≥ 4.5:1 contraste, "Source : Registre RGE ADEME" stylé comme élément design (`text-xs text-charcoal-500`), tableaux hairline `divide-clay-200` + numériques alignés droite.
- **Motion** : 150-200ms ease-out, opacity/transform only, `prefers-reduced-motion` gated. Pas de bounce.
- **Anti-slop** : pas d'emoji dans headings/UI (→ lucide), pas de gradients violet/bleu, pas de `rounded-3xl` cards, pas de gradient sur boutons, glassmorphism limité header sticky + modals.

## Trust patterns (marketplaces + FR)

- Badges trust = **row de pills discrètes** (pas de bannières colorées full-width) : "RGE certifié" (ramp vert accent), "Vérifié ADEME" + n° qualif + validité, assurance décennale.
- Rating : `★ 4.8` bold ink + `(127 avis)` muted.
- Barème MaPrimeRénov' 4 couleurs officielles (Bleu/Jaune/Violet/Rose) en chips = signal autorité que personne n'exploite.
- Montants en dur `tabular-nums text-4xl font-bold` = le hero feature qu'aucun concurrent n'a.
- Fiche artisan RGE = flagship visuel (profil vérifié, pas ligne d'annuaire).

## Top issues audit interne (file:line)

1. Template RGE `rge/[service]/[ville]/page.tsx:707-728` : AUCUN hero — h1 nu sur sand. 49K pages. → PageHero charcoal-950.
2. `Button.tsx:44` primary = `bg-primary-400` ≠ DESIGN.md (`primary-500`).
3. CTA pages : `bg-primary-500`(46), `-600`(26), `-700`(17), gradient(8) → normaliser 500 + hover:600.
4. 2459 `gray-*` → codemod charcoal/sand.
5. `globals.css:144-161` verified-badges en blue/purple/slate bannis.
6. `globals.css:112` `--shadow-primary` BLEU mort (pré-terracotta).
7. Tokens dupliqués contradictoires `globals.css :root` vs `tailwind.config.js` (`--z-modal:1400` vs `modal:50`).
8. 2515 emoji / 381 fichiers (top : `dpe/classes/page.tsx` 58) → lucide.
9. `shimmer-loading` gris froid `#f0f0f0` (globals.css:292) → sand.
10. Scrollbar grise `#c1c1c1` (globals.css:431) → sand/charcoal.
11. Article body hardcodé `#374151/#4b5563` + fonts `'Plus Jakarta Sans','Inter'` (globals.css:731,764,806,837) — la config réelle = DM Sans + Sora.
12. `text-[9/10/11px]` ×59 → `text-2xs`.
13. 509 gradients ad-hoc vs 11 presets inutilisés.
14. z-index arbitraires `z-[54/55/56/10000]`.

## À NE PAS CASSER

DESIGN.md, zIndex nommé, hygiène CWV/a11y globals.css (reduced-motion, 16px inputs iOS, 44px tap), HeaderClient (poli), Card/Button primitives (juste recolorer), focus rings terracotta, ::selection.

## Plan vagues

- **A (fait le 06-05)** : codemod gray→charcoal/sand + globals.css cleanup + Button primary-500.
- **B** : PageHero RGE template (49K pages) + CTA normalize pages clés.
- **C** : emoji sweep renovation-energetique (headings d'abord).
- **D** : tabular-nums montants + tableaux premium + chips barème MPR 4 couleurs.
- **E** : radius/shadow enforcement + audit pre-commit banned colors (pattern audit-\*.mjs existant).
