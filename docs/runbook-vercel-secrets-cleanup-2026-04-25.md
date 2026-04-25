# Runbook — Nettoyage env vars Vercel (audit 2026-04-25)

**Contexte** : audit Anthropic-grade (10 agents) a flaggé que **22 variables sensibles** sur le projet Vercel `servicesartisans` sont stockées en mode **Plain** (visibles en clair dans les build logs et exposées aux membres de l'équipe). Vercel les marque "Needs Attention". 5 variables `KV_*` orphelines (intégration Vercel KV abandonnée pour Upstash) sont à supprimer. 1 doublon `GITHUB_DISPATCH_TOKE/N` à fusionner.

**Audit code (ce commit)** : `grep` confirme que **0 référence** à `KV_*` / `REDIS_URL` subsiste dans `src/`, `supabase/`, `scripts/`. Suppression safe.

---

## Étape 1 — Bascule Sensitive (UI Vercel)

URL : `https://vercel.com/servicesartisans/servicesartisans/settings/environment-variables`

Pour chaque variable de la liste : clic `…` à droite → **Edit** → coche **Sensitive** → **Save**.

### P0 — CRITIQUE (à faire d'abord — leak = compromis grave)

- [ ] `SUPABASE_SERVICE_ROLE_KEY` — bypass RLS sur toute la DB (459K artisans + leads + paiements)
- [ ] `STRIPE_SECRET_KEY` — lecture/charge/refund tous paiements
- [ ] `STRIPE_WEBHOOK_SECRET` — forge des webhooks payment_succeeded
- [ ] `ANTHROPIC_API_KEY` — burn quota AI (€€€)
- [ ] `OPENAI_API_KEY` — burn quota AI (€€€)
- [ ] `SENTRY_AUTH_TOKEN` — write Sentry + upload sourcemaps malicieux
- [ ] `WEBHOOK_SECRET` — forge des webhooks internes
- [ ] `RGPD_EXPORT_SECRET` — export PII clients
- [ ] `CRON_SECRET` — trigger crons manuellement (spam SMS)
- [ ] `GITHUB_DISPATCH_TOKEN` — push code, créer releases
- [ ] `TWILIO_AUTH_TOKEN` — spam SMS facturé

### P1 — HIGH

- [ ] `RESEND_API_KEY` — spam email depuis ton domaine (kill réputation SPF)
- [ ] `RESEND_WEBHOOK_SECRET` — forge bounce events
- [ ] `INSEE_CONSUMER_SECRET`
- [ ] `INSEE_CONSUMER_KEY`
- [ ] `VAPI_API_KEY` — spam appels IA
- [ ] `VAPI_WEBHOOK_SECRET`
- [ ] `UNSUBSCRIBE_SECRET` — désinscrire qui tu veux
- [ ] `VAPID_PRIVATE_KEY` — forge web push notifications
- [ ] `REVALIDATE_SECRET` — DoS via revalidation ISR

### P2 — MEDIUM

- [ ] `SENTRY_DSN` — léger, mais peut être utilisé pour spam Sentry
- [ ] `INDEXNOW_API_KEY` — spam Bing IndexNow

### À NE PAS marquer Sensitive (par design publiques)

- `FROM_EMAIL`, `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SENTRY_DSN`
- `TWILIO_ACCOUNT_SID` (identifiant compte, pas le token)
- `SENTRY_ORG`, `SENTRY_PROJECT`

---

## Étape 2 — Suppression KV\_\* orphelines

**Pré-requis** : vérifier que l'intégration Vercel KV n'est plus liée au projet :

1. `https://vercel.com/servicesartisans/servicesartisans/settings/storage`
2. Si un KV store apparaît : clic → "Disconnect from project"

Une fois disconnect, **supprimer les 5 variables** :

```bash
vercel env rm REDIS_URL production --yes
vercel env rm REDIS_URL preview --yes
vercel env rm REDIS_URL development --yes

vercel env rm KV_REST_API_TOKEN production --yes
vercel env rm KV_REST_API_TOKEN preview --yes
vercel env rm KV_REST_API_TOKEN development --yes

vercel env rm KV_REST_API_READONLY_TOKEN production --yes
vercel env rm KV_REST_API_READONLY_TOKEN preview --yes
vercel env rm KV_REST_API_READONLY_TOKEN development --yes

vercel env rm KV_URL production --yes
vercel env rm KV_URL preview --yes
vercel env rm KV_URL development --yes

vercel env rm KV_REST_API_URL production --yes
vercel env rm KV_REST_API_URL preview --yes
vercel env rm KV_REST_API_URL development --yes
```

Audit code (`scripts/vercel-secrets-audit.mjs`) confirme : **0 référence** à ces 5 variables dans le code applicatif.

---

## Étape 3 — Doublon `GITHUB_DISPATCH_TOKEN`

L'UI Vercel montre 2 entrées :

1. `GITHUB_DISPATCH_TOKE` (orthographe tronquée — typo)
2. `GITHUB_DISPATCH_TOKEN` (correct)

Action :

1. Ouvre la `TOKE` (sans N) → vérifie sa valeur (probablement abandonnée)
2. **Remove** la `TOKE` tronquée
3. Garde `GITHUB_DISPATCH_TOKEN` correctement orthographiée + Sensitive

---

## Étape 4 — Doublon `CRON_SECRET`

Si l'UI montre 2 entrées `CRON_SECRET` (Production + All Environments) :

- Garde celle scopée **Production** + Sensitive
- **Remove** l'autre (les crons ne tournent qu'en prod, c'est du dead-lettering)

---

## Étape 5 — Rotation post-cleanup (recommandé)

Les variables ont été en Plain pendant 2-3 mois → potentiellement vues dans les build logs Vercel et accessibles à l'équipe. Rigueur sécurité = rotater au moins les P0 :

| Variable                                                                                         | Provider                                       | URL rotation                                                |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------- | ----------------------------------------------------------- |
| `SUPABASE_SERVICE_ROLE_KEY`                                                                      | Supabase                                       | Dashboard → Settings → API → "Reset service_role key"       |
| `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`                                                    | Stripe                                         | Dashboard → Developers → API keys / Webhook signing secrets |
| `ANTHROPIC_API_KEY`                                                                              | Anthropic Console                              | Settings → API Keys → Create new + revoke old               |
| `OPENAI_API_KEY`                                                                                 | OpenAI                                         | Platform → API keys                                         |
| `TWILIO_AUTH_TOKEN`                                                                              | Twilio Console                                 | Account → API keys                                          |
| `SENTRY_AUTH_TOKEN`                                                                              | Sentry                                         | Settings → Auth Tokens                                      |
| `GITHUB_DISPATCH_TOKEN`                                                                          | GitHub                                         | Settings → Developer settings → PAT                         |
| `RGPD_EXPORT_SECRET`, `CRON_SECRET`, `WEBHOOK_SECRET`, `REVALIDATE_SECRET`, `UNSUBSCRIBE_SECRET` | Internal — generate via `openssl rand -hex 32` | n/a                                                         |

**Procédure zero-downtime** :

1. Génère la nouvelle valeur côté provider
2. **Add** la nouvelle valeur dans Vercel avec `--sensitive`
3. Redeploy (Vercel pick up la nouvelle version)
4. Smoke test endpoints qui dépendent (auth, paiement, etc.)
5. **Revoke** l'ancienne valeur côté provider

---

## Étape 6 — Smoke tests

Après tout le cleanup + redeploy :

```bash
# Health check API
curl -i https://servicesartisans.fr/api/health

# Check schema prod
NEXT_PUBLIC_SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… \
  node scripts/smoke-schema-prod.mjs

# Check Vercel env vars (audit final)
node scripts/vercel-secrets-audit.mjs
```

Tous doivent retourner OK.

---

## Estimation effort

| Étape                                | Durée   | Action requise |
| ------------------------------------ | ------- | -------------- |
| Sensitive flag (22 vars)             | ~15 min | Click UI       |
| Suppression KV\_\* (5 vars × 3 envs) | 5 min   | CLI ou UI      |
| Doublons GITHUB*/CRON*               | 2 min   | UI             |
| Rotation P0 (8 secrets)              | ~30 min | Multi-provider |
| Smoke tests                          | 5 min   | Local + prod   |
| **Total**                            | **~1h** |                |

---

## Statut

- [ ] Étape 1 : 22 vars Sensitive
- [ ] Étape 2 : 5 KV\_\* removed
- [ ] Étape 3 : doublon GITHUB_DISPATCH_TOKEN nettoyé
- [ ] Étape 4 : doublon CRON_SECRET nettoyé
- [ ] Étape 5 : 8 secrets P0 rotés
- [ ] Étape 6 : smoke tests OK
