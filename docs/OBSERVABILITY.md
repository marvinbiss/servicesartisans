# Observabilité — ServicesArtisans

Stack minimaliste et solide. 4 outils, 3 SLOs, 10 événements, 1 canal d'alerte.

---

## Stack

| Couche                           | Outil                      | Rôle                                                  |
| -------------------------------- | -------------------------- | ----------------------------------------------------- |
| Erreurs + APM + Session Replay   | **Sentry**                 | Chaque exception prod + trace perf + replay vidéo bug |
| Produit (funnels, flags, replay) | **PostHog Cloud EU**       | Funnel devis/simulateur, A/B tests, feature flags     |
| Perf réelle navigateur           | **Vercel Speed Insights**  | Core Web Vitals en prod (LCP, CLS, INP)               |
| Uptime crons                     | **BetterStack Heartbeats** | Pipedrive retry, sitemap-health, IndexNow, ADEME sync |

**Alertes** → 1 seule adresse email : `alerts@servicesartisans.fr` (ou perso au début).

---

## SLOs

Cibles explicites, révisées trimestriellement.

| Métrique                                | Cible    | Outil de mesure    |
| --------------------------------------- | -------- | ------------------ |
| API p95 latency                         | < 500 ms | Sentry Performance |
| Error rate prod                         | < 0.5 %  | Sentry Issues      |
| Devis completion rate (step 1 → submit) | > 40 %   | PostHog funnel     |

---

## 10 événements PostHog (tagués dans le code)

Rester à 10. Pas 200. Quand on en ajoute un, on en retire un.

```
devis_started           // page /devis affichée
devis_step_completed    // step 1→2, 2→3 (prop: step, service, ville)
devis_submitted         // POST /api/devis 200
devis_failed            // POST /api/devis 4xx/5xx
simulateur_started
simulateur_step_completed
simulateur_submitted
artisan_claim_started
artisan_claim_succeeded
search_performed
```

---

## Setup — 3 actions manuelles

### 1. Créer les comptes (15 min)

| Service     | URL                            | Action                                                                                      |
| ----------- | ------------------------------ | ------------------------------------------------------------------------------------------- |
| Sentry      | https://sentry.io/signup       | Créer org `servicesartisans`, projet Next.js `servicesartisans`, récupérer le DSN           |
| PostHog     | https://eu.posthog.com/signup  | Projet `servicesartisans`, récupérer le Project API Key + Host (`https://eu.i.posthog.com`) |
| BetterStack | https://betterstack.com/uptime | 4 Heartbeats : `pipedrive-retry`, `sitemap-health`, `indexnow-submit`, `ademe-sync`         |

### 2. Renseigner les env vars

Dans `.env.local` (dev) **et** Vercel → Project Settings → Environment Variables :

```bash
# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_DSN=                    # même valeur (ou server-only)
SENTRY_ORG=servicesartisans
SENTRY_PROJECT=servicesartisans
SENTRY_AUTH_TOKEN=sntrys_xxx   # Settings → Auth Tokens → scope: project:releases

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

### 3. Tester en local

```bash
npm run dev
# Trigger une erreur volontaire dans une route → doit apparaître dans Sentry Issues
# Ouvrir /devis → doit apparaître dans PostHog Live events
```

---

## Où regarder quand ça casse

| Symptôme                           | Premier réflexe                                        |
| ---------------------------------- | ------------------------------------------------------ |
| Erreur 500 signalée par un user    | Sentry → Issues (filtré sur les dernières 24h)         |
| Chute du nombre de devis           | PostHog → Funnel "devis" → voir à quelle étape ça drop |
| Page lente sur mobile              | Vercel → Speed Insights → trier par INP desc           |
| Cron qui n'a pas tourné            | BetterStack → Heartbeat `<nom>` → dernière ping        |
| Bug visuel impossible à reproduire | Sentry Replay (lié à l'issue) OU PostHog Recordings    |

---

## Ce qu'on NE fait PAS

- ❌ Dashboards custom Grafana
- ❌ Collectors OTel auto-hébergés
- ❌ Logs centralisés séparés (Sentry + PostHog suffisent)
- ❌ Alertes sur Slack + email + SMS + PagerDuty en parallèle (1 canal)
- ❌ Plus de 10 événements produit
- ❌ Tracer chaque route API (Sentry APM suffit à 10 % sample rate)
