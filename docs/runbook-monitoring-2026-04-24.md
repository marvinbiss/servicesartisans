# Runbook — Monitoring & Incident Prevention (2026-04-24)

**Contexte** : suite aux incidents du 22-24 avril (Upstash fail-close + drift RLS post restart Supabase Feb 13), mise en place d'un filet de sécurité proactif.

**Status actuel** (après audit codebase) :

- ✅ `.github/workflows/claude-review.yml` — 10 agents Claude bloquent P0/P1 sur PR
- ✅ `.github/workflows/guardrails.yml` — 45 audits SEO/sécurité en `--strict`
- ✅ `sentry.{server,client,edge}.config.ts` — sampling dynamique, cron=100%, filtering
- ✅ Routine RLS hebdo (lundi 09:00 Paris) — `trig_01QrVeGBH21Df8PzBpoxDCRH`
- ❌ Branch protection `master` — **manquante, les checks ne sont pas bloquants au merge**
- ❌ Alert rules Sentry — **non configurées côté dashboard**
- ❌ Uptime monitoring externe — **aucun**

Cette 3-liste ci-dessous couvre les 3 gaps.

---

## ACTION 1 — Branch Protection `master` (⏱ 10 min, via navigateur)

**Pourquoi** : tous les audits tournent déjà, mais un `git push --force` ou `gh pr merge --admin` peut les contourner. La branch protection force GitHub à refuser le merge tant que les checks ne passent pas, **y compris pour toi en tant qu'admin**.

### Steps

1. Va sur https://github.com/marvinbiss/servicesartisans/settings/branches
2. Clique **Add rule** (ou **Edit** si existe déjà)
3. Branch name pattern : `master`
4. Active les options suivantes :
   - ✅ **Require a pull request before merging**
     - Required approvals : `0` (solo, tu t'auto-approuves ; mets `1` si tu recrutes)
     - ✅ Dismiss stale approvals when new commits are pushed
   - ✅ **Require status checks to pass before merging**
     - ✅ Require branches to be up to date before merging
     - Dans "Status checks that are required", recherche et coche :
       - `Gates (tsc + tests + build)` (de `claude-review.yml`)
       - `Aggregate & Decide` (de `claude-review.yml`)
       - `guardrails` (de `guardrails.yml`)
       - `tests` (de `guardrails.yml`)
   - ✅ **Require conversation resolution before merging**
   - ✅ **Require linear history** (évite les merge commits, plus propre pour rollback)
   - ✅ **Include administrators** ← **CRITIQUE, coche cette case**
   - ❌ Allow force pushes → laisser OFF
   - ❌ Allow deletions → laisser OFF

5. Clique **Create** / **Save changes**

### Vérification

Après activation, essaie un petit commit direct sur master :

```bash
git push origin master --dry-run
```

GitHub doit refuser le push direct avec `protected branch master`. À partir de maintenant, tu dois passer par PR.

**Exception `wip/snapshots/*`** : si tu utilises des branches wip pour snapshots auto, ça n'est pas affecté (seul `master` est protégé).

---

## ACTION 2 — Sentry Alert Rules (⏱ 15 min, via navigateur Sentry)

**Pourquoi** : Sentry capture déjà tout, mais sans règle d'alerte, tu vois les erreurs seulement si tu ouvres le dashboard. Objectif = push notification sur ton tel dès qu'un incident P0 se déclenche.

### Prérequis

- Installer l'app mobile Sentry iOS/Android, se connecter, autoriser les notifications push

### Steps

Va sur https://sentry.io/organizations/{ton-org}/alerts/rules/ et crée les 5 règles suivantes.

#### Règle A — Error rate spike (détection incident général)

- Type : **Metric Alert**
- Metric : `event.type:error`
- Condition : `count()` **> 10** errors **in 5 minutes** → Critical
- Condition : `count()` **> 50** errors **in 5 minutes** → Critical (page immédiat)
- Actions :
  - **Send notification to mobile app**
  - Optionnel : webhook Discord/Slack si tu en as un
- Environment : `production`
- Name : `[P0] Error rate spike — servicesartisans`

#### Règle B — Cron job failure (pipelines critiques)

- Type : **Issue Alert**
- Condition : `transaction` contains `/api/cron/`
- Trigger : `when an issue is first seen` AND `event.level` is `error`
- Actions : mobile app notification
- Name : `[P0] Cron failure — servicesartisans`

#### Règle C — Critical API failures

- Type : **Issue Alert**
- Condition : `transaction` matches pattern `/api/devis OR /api/simulateur/* OR /api/auth/*`
- Trigger : `when an issue is first seen in production`
- Actions : mobile app notification
- Name : `[P0] Critical API error — servicesartisans`

#### Règle D — Supabase/database errors

- Type : **Issue Alert**
- Condition : `message` contains `supabase` OR `postgres` OR `PGRST` OR `502` OR `connection refused` OR `statement timeout`
- Trigger : `when an issue is first seen` OR `when an issue reoccurs`
- Actions : mobile app notification
- Name : `[P0] Database connectivity — servicesartisans`

#### Règle E — Rate-limit storm (Upstash fail-close)

- Type : **Metric Alert**
- Metric : `event.type:error AND message:"rate-limit*"`
- Condition : `count()` **> 20** in 10 minutes
- Actions : mobile app notification
- Name : `[P0] Rate-limit storm — servicesartisans`

### Vérification

Pour tester sans déclencher un vrai incident :

```bash
# Capture un event de test depuis la prod
curl -X POST "https://servicesartisans.fr/api/test-sentry" # si tu ajoutes cet endpoint
# OU via la console Sentry → Create test issue
```

Tu dois recevoir la notification sur ton tel sous 30 secondes.

---

## ACTION 3 — Uptime Monitoring externe (⏱ 10 min, gratuit)

**Pourquoi** : Sentry ne voit QUE ce qui arrive côté serveur quand il tourne. Si Vercel plante entièrement ou si ton domaine expire, Sentry ne capture rien. Un ping externe indépendant est indispensable.

### Option recommandée — UptimeRobot (gratuit 50 monitors)

1. Crée un compte sur https://uptimerobot.com (gratuit)
2. **Add New Monitor** :
   - Monitor Type : **HTTPS**
   - Friendly Name : `SA — Homepage`
   - URL : `https://servicesartisans.fr`
   - Monitoring Interval : **5 minutes**
   - Monitor Timeout : **30 seconds**
3. Répète pour les endpoints critiques :
   - `https://servicesartisans.fr/api/health` (endpoint santé backend)
   - `https://servicesartisans.fr/sitemap.xml` (SEO)
   - `https://servicesartisans.fr/cee` (hub pivot mandataire)
   - `https://servicesartisans.fr/robots.txt`

4. **My Settings → Alert Contacts** :
   - Ajoute ton numéro de téléphone pour SMS (UptimeRobot Pro = payant ~7$/mois)
   - OU ton email + configure push via l'app UptimeRobot iOS/Android (gratuit)
   - OU webhook Discord/Slack si tu en as

5. **Triggers** : Alert quand **2 échecs consécutifs** (évite les faux positifs Vercel transient)

### Alternative payante — Better Stack (10€/mois)

Si tu veux du status page public + SMS inclus : https://betterstack.com/better-uptime

---

## Bonus — Test du système (⏱ 5 min)

Une fois tout configuré, fais un test end-to-end :

1. **Simule un 500** : `curl -X POST https://servicesartisans.fr/api/test-500` (si tu ajoutes cet endpoint, sinon skip)
2. **Vérifie** :
   - ✅ Sentry reçoit l'event (dashboard Issues)
   - ✅ Notification push arrive sur ton tel (≤ 30 sec)
   - ✅ Si tu coupes Vercel temporairement, UptimeRobot détecte en ≤ 10 min
3. **Documente la procédure de réponse** dans `docs/incident-response.md` (prochaine étape, pas aujourd'hui)

---

## Récap priorité d'action

| #   | Action                        | Durée  | Coût             | Criticité                                |
| --- | ----------------------------- | ------ | ---------------- | ---------------------------------------- |
| 1   | Branch protection master      | 10 min | 0€               | 🔴 FAIRE AVANT N'IMPORTE QUEL AUTRE PUSH |
| 2   | Sentry alert rules (5 règles) | 15 min | 0€ (déjà payant) | 🔴 cette semaine                         |
| 3   | UptimeRobot monitors (5 URLs) | 10 min | 0€               | 🟡 cette semaine                         |

**Total** : 35 min pour bloquer 90% des incidents futurs silencieux.

---

## Signature

- Rédigé le 2026-04-24 après incidents Upstash/Supabase/RLS drift
- Mise à jour prévue : après exécution des 3 actions → documenter le résultat dans ce fichier
- Prochaine itération (fin mai) : ajouter `docs/incident-response.md` avec playbook 4 scénarios (crawl failed, rate-limit storm, db down, RLS drift)
