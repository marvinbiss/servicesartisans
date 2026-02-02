# Audit ServicesArtisans - 1er Février 2026

## Executive Summary

ServicesArtisans possède une base solide mais nécessite des améliorations significatives pour atteindre le niveau world-class (Airbnb, Doctolib, Thumbtack).

---

## Scores Actuels (Estimés)

| Métrique | Score Actuel | Cible |
|----------|--------------|-------|
| Lighthouse Performance | ~75/100 | 90+ |
| Lighthouse Accessibility | ~85/100 | 95+ |
| Lighthouse SEO | ~80/100 | 95+ |
| Lighthouse Best Practices | ~85/100 | 95+ |
| First Load JS | 87.9 kB | < 80 kB |
| Middleware Size | 71.8 kB | < 50 kB |

## Core Web Vitals (Cibles)

| Métrique | Cible |
|----------|-------|
| LCP (Largest Contentful Paint) | < 2.5s |
| FID (First Input Delay) | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| TTFB (Time to First Byte) | < 600ms |

---

## Issues Critiques

### 1. Vulnérabilités de Sécurité
- **Next.js 14.2.29** : 7 vulnérabilités (1 high, 6 autres)
  - SSRF via middleware redirect
  - DoS via Server Components
  - Image Optimizer vulnerabilities
- **@supabase/ssr** : Cookie vulnerability
- **Action** : Mise à jour vers Next.js 14.2.35+

### 2. Absence de State Management Global
- Pas de React Query/TanStack Query
- Pas de Zustand
- Appels API redondants
- Pas de cache côté client

### 3. Fiche Artisan Non-Optimisée
- Page monolithique (1050 lignes)
- Pas de composants modulaires
- Animations basiques
- Sidebar non-sticky sur desktop

---

## Issues Majeures

### 4. SEO Incomplet
- Pas de canonical URLs dynamiques
- Schema.org présent mais incomplet
- Pas de llms.txt pour les IA
- Méta descriptions génériques

### 5. Performance
- Pas d'ISR (Incremental Static Regeneration)
- Images non-optimisées (pas de blur placeholder)
- Pas de prefetch stratégique
- Middleware trop lourd (71.8 kB)

### 6. UX/UI
- Pas d'animations Framer Motion fluides
- Galerie photos basique (pas de lightbox)
- Distribution des avis non-visuelle
- Pas de badges visuels (Top Pro, etc.)

---

## Analyse Concurrentielle

### Thumbtack (US) - Best Practices Identifiées
- Two-field search (service + location)
- Badges : Top Pro (4.7+ rating, 75%+ response)
- Profile structuré : Photo, rating, reviews, quick stats
- Quote request flow guidé

### Doctolib (FR) - Best Practices Identifiées
- Calendrier temps réel avec slots
- Verification multi-niveau (registry, staff, auto)
- Progressive disclosure dans booking flow
- Fuzzy search pour tolerance typos

### Airbnb - Best Practices Identifiées
- Photo grid : 1 hero + 4 mosaic (20px radius)
- Sticky sidebar booking widget (z-index 100+)
- Star rating avec catégories (cleanliness, communication, etc.)
- Shimmer loading states

---

## Architecture Actuelle

### Stack
- Next.js 14.2.29 (App Router)
- React 18.2.0
- TypeScript 5.3
- Tailwind CSS 3.4.19
- Supabase (DB + Auth)
- Stripe (Paiements)

### Structure
```
/src
├── app/           # 274 routes
├── components/    # 15 dossiers
├── contexts/      # 1 context (mobile menu)
├── hooks/         # 7 hooks
├── lib/           # 68 fichiers
└── types/         # Définitions TS
```

### Points Forts
- Foundation SEO avec Schema.org
- Système de couleurs cohérent (Tailwind)
- Mobile-first avec safe areas
- Animations CSS de base

### Points Faibles
- State management absent
- Composants monolithiques
- Pas de caching client
- Demo data fallback (non production-ready)

---

## Plan de Refonte

### Phase 1 : Fondations (Priorité Haute)
1. [ ] Mise à jour Next.js + dépendances sécurité
2. [ ] Installation React Query + Zustand
3. [ ] Refonte architecture composants artisan

### Phase 2 : Fiche Artisan World-Class
1. [ ] Hero section avec photo grid (style Airbnb)
2. [ ] Sidebar sticky avec booking CTA
3. [ ] Trust signals visuels (badges, stats)
4. [ ] Galerie photos avec lightbox
5. [ ] Reviews avec distribution visuelle
6. [ ] Map interactive (Mapbox)
7. [ ] Animations Framer Motion

### Phase 3 : SEO World-Class
1. [ ] Meta tags dynamiques complets
2. [ ] Schema.org LocalBusiness enrichi
3. [ ] Canonical URLs sur toutes les pages
4. [ ] Sitemap dynamique optimisé
5. [ ] llms.txt pour les IA
6. [ ] Breadcrumbs avec JSON-LD

### Phase 4 : Performance
1. [ ] ISR sur fiches artisans
2. [ ] Image optimization (blur, lazy)
3. [ ] Font optimization (next/font)
4. [ ] Bundle size reduction
5. [ ] Edge caching

### Phase 5 : Tests & Qualité
1. [ ] Lighthouse CI > 90
2. [ ] Tests accessibilité (Pa11y)
3. [ ] Tests E2E critiques
4. [ ] Monitoring Sentry

---

## Recommandations Immédiates

### Sécurité (URGENT)
```bash
npm audit fix --force
# Ou mise à jour manuelle :
npm install next@14.2.35 @supabase/ssr@0.8.0
```

### State Management
```bash
npm install @tanstack/react-query zustand
```

### Animations
```bash
npm install framer-motion
```

### SEO
```bash
npm install next-seo
```

---

## Métriques de Succès

| Métrique | Actuel | Cible | Deadline |
|----------|--------|-------|----------|
| Lighthouse Performance | ~75 | 90+ | Phase 4 |
| Lighthouse SEO | ~80 | 95+ | Phase 3 |
| Fiche Artisan Conversion | ? | +30% | Phase 2 |
| Time on Page Artisan | ? | +50% | Phase 2 |
| Bounce Rate | ? | -20% | Phase 2 |

---

## Conclusion

ServicesArtisans a une base technique solide mais nécessite une refonte significative pour atteindre le niveau des leaders mondiaux (Airbnb, Doctolib, Thumbtack).

**Priorité absolue** : Fiche artisan world-class + SEO complet.

**Niveau d'exigence** : Si Airbnb regardait cette fiche artisan, ils ne trouveraient rien à redire.

---

*Audit réalisé le 1er Février 2026*
