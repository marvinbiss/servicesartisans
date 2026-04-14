# Threat Model PR2 — Activation artisan CEE

**Date** : 2026-04-14  
**Auditeur** : security-auditor (pre-implementation)  
**Périmètre** : Routes PR2 + UI wizard 5 étapes + webhook Yousign  
**Statut** : PRÉVENTIF — à valider avant le premier commit de route

---

## 1. Scope

| Composant | Description |
|---|---|
| `POST /api/cee/partners/invite-batch` | Admin — envoi batch email Brevo aux artisans RGE |
| `GET /api/cee/partners/me` | Artisan auth — lecture de son record `cee_artisan_partners` |
| `POST /api/cee/partners/onboarding/iban` | Artisan auth — chiffrement IBAN via `pgp_sym_encrypt` |
| `POST /api/cee/partners/onboarding/convention` | Artisan auth — création enveloppe Yousign |
| `POST /api/webhooks/yousign` | Public — réception événements Yousign (HMAC obligatoire) |
| `POST /api/cee/partners/training/quiz` | Artisan auth — soumission réponses quiz + score |
| `POST /api/cee/partners/activate` | Admin ou auto — transition `certified → active` |
| UI wizard 5 étapes | `/espace-artisan/cee/onboarding/*` — surface client |

**Données sensibles** : IBAN (bytea pgcrypto), BIC, convention PDF signée, mandat CEE (rétention légale 10 ans R.221-1), score quiz, statut partenaire.

---

## 2. Threat Model STRIDE

| Composant | Spoofing | Tampering | Repudiation | InfoDisclosure | DoS | ElevPrivilège |
|---|---|---|---|---|---|---|
| `invite-batch` | Admin JWT forgé (JWT claim `role`) | Payload Brevo injecté | Pas de log envoi | Fuite liste SIRET/email artisans | Blast 10k emails/appel | Non-admin déclenche blast |
| `partners/me` | JWT autre artisan | — | — | Expose `iban_last4`, `bic`, statut | — | Artisan lit record d'un autre (IDOR si `user_id` mal filtré) |
| `onboarding/iban` | JWT volé | IBAN substitué avant chiffrement | Pas de log `iban_last4` enregistré | IBAN en clair dans logs | Flood chiffrement | Modification IBAN d'un autre artisan |
| `onboarding/convention` | JWT volé | `envelope_id` forgé en réponse | Pas de trace création enveloppe | PDF convention exposé sans auth | Flood création enveloppes Yousign (coût API) | Transition status sans quiz |
| `webhooks/yousign` | Requête sans HMAC | Événement forgé → transition illégale | Pas d'idempotency → double traitement | — | Flood webhook → surcharge DB | Forcer `convention_signed` sans signature réelle |
| `training/quiz` | JWT volé | Score manipulé côté client | Pas de trace tentatives | — | Flood quiz | Score 10/10 envoyé par client → auto-certify frauduleux |
| `activate` | Admin JWT forgé | Transition `certified → active` sans pré-requis | Pas de log activation | — | — | Artisan non certifié activé |
| UI wizard | Session hijack | IBAN affiché en clair (XSS) | — | IBAN visible dans DOM/logs front | — | Étapes wizard bypassées côté client |

---

## 3. OWASP Top 10 2021 — Mapping PR2

| Code | Risque | Exposition PR2 | Mitigation |
|---|---|---|---|
| A01 | Broken Access Control | `partners/me` sans filtre `user_id = auth.uid()` → IDOR ; `activate` accessible artisan | RLS `cee_artisan_partners_artisan_self_read` + `requirePermission('cee_partners','write')` |
| A02 | Cryptographic Failures | `CEE_IBAN_KEY` absente → chiffrement silencieux ; concat string au lieu de bind params | Fail-close si key absente ; `pgp_sym_encrypt($1, $2)` bind strict |
| A03 | Injection | Payload jsonb non validé dans `invite-batch` ; IBAN concaténé dans SQL | Zod validation + parameterized queries partout |
| A04 | Insecure Design | Quiz scoring côté client possible ; status machine non miroir SQL côté app | Score calculé serveur ; `TRANSITIONS` map miroir du trigger 433 |
| A05 | Security Misconfiguration | `CEE_IBAN_KEY` / `YOUSIGN_WEBHOOK_SECRET` absents en prod → fallback insécurisé | Fail-close obligatoire sur toutes les routes sensibles |
| A06 | Vulnerable Components | SDK Yousign maison → surface d'erreur plus grande | Tests unitaires + replay test suite |
| A07 | Auth Failures | Webhook Yousign public sans HMAC → elevation de privilège massive | `crypto.timingSafeEqual` + timestamp drift ≤5min |
| A08 | Software Integrity | PDF convention généré sans hash → falsification post-signature possible | SHA-256 du PDF stocké dans `cee_artisan_partners` |
| A09 | Logging Failures | IBAN complet loggué accidentellement ; pas de trace quiz tentatives | Logger wrapper `maskIban()` ; log systématique score + `provider_id` |
| A10 | SSRF | `convention_pdf_url` Yousign stockée puis rechargée → SSRF si non validée | Valider schéma `https://api.yousign.app/*` avant stockage |

---

## 4. Recommandations MUST/SHOULD

1. **[MUST]** Comparaison HMAC webhook Yousign via `crypto.timingSafeEqual` — CWE-208 (timing side-channel) — `src/lib/cee/yousign.ts`

2. **[MUST]** Rejeter webhook si timestamp (`X-Yousign-Signature-Timestamp`) hors fenêtre ±5 min — CWE-294 (replay attack) — `src/lib/cee/yousign.ts`

3. **[MUST]** `pgp_sym_encrypt` appelé exclusivement via bind params `($1, $2)`, jamais par concaténation de chaîne — CWE-89 (SQL injection) — `src/lib/cee/iban-crypto.ts`

4. **[MUST]** Fail-close en production si `CEE_IBAN_KEY` est absente ou vide : lever une exception, ne jamais stocker IBAN en clair par défaut — CWE-798 (hardcoded/missing credentials) — `src/lib/cee/iban-crypto.ts`

5. **[MUST]** Fail-close si `YOUSIGN_WEBHOOK_SECRET` est absent : retourner 500, ne jamais accepter un webhook non vérifié — CWE-345 (insufficient verification) — `src/app/api/webhooks/yousign/route.ts`

6. **[MUST]** Transitions de statut appliquées côté serveur via une `TRANSITIONS` map miroir du trigger SQL 433 ; tout statut reçu hors map → 422, pas de mise à jour DB — CWE-639 (IDOR/business logic bypass) — `src/lib/cee/leads-service.ts`

7. **[MUST]** Score quiz calculé exclusivement côté serveur ; tout champ `score` ou `certified` reçu dans le body client est ignoré — CWE-602 (client-side enforcement) — `src/app/api/cee/partners/training/quiz/route.ts`

8. **[MUST]** Rate limit 3 req/min par `user_id` sur `onboarding/iban` et `training/quiz` ; 10 req/min sur `onboarding/convention` — CWE-770 (resource exhaustion) — middleware Vercel ou `src/lib/rate-limit.ts`

9. **[MUST]** Vérification CSRF via `validateOrigin()` (pattern `admin-auth.ts`) sur toutes les routes POST artisan CEE — CWE-352 (CSRF) — toutes routes `onboarding/*` et `activate`

10. **[MUST]** Idempotency par `(yousign_envelope_id, event_type)` sur le webhook : insérer dans `cee_dossier_events` uniquement si l'événement n'existe pas déjà — CWE-345 (insufficient verification of data authenticity) — `src/app/api/webhooks/yousign/route.ts`

11. **[MUST]** Ne jamais logger l'IBAN complet ; logger uniquement `iban_last4` après extraction — CWE-532 (information exposure through log files) — `src/lib/cee/iban-crypto.ts` + logger wrapper

12. **[MUST]** Valider que `convention_pdf_url` retournée par Yousign correspond au domaine `https://api.yousign.app/` avant stockage — CWE-918 (SSRF) — `src/lib/cee/yousign.ts`

13. **[MUST]** La route `GET /api/cee/partners/me` filtre sur `user_id = auth.uid()` côté requête Supabase (createClient, pas createAdminClient) pour garantir RLS — CWE-284 (improper access control) — `src/app/api/cee/partners/me/route.ts`

14. **[SHOULD]** Retry Yousign API : backoff exponentiel, cap 3 tentatives, pas de retry sur les 4xx — CWE-404 (improper resource shutdown) — `src/lib/cee/yousign.ts`

15. **[SHOULD]** Smoke test RLS après déploiement migration : rôle `anon` ne peut pas SELECT `cee_artisan_partners` ; rôle `authenticated` ne peut lire que son propre record — CWE-285 (improper authorization) — `tests/smoke/cee-rls.test.ts`

16. **[SHOULD]** Valider le Content-Type `application/json` du webhook avant de parser le body ; rejeter avec 415 sinon — CWE-20 (improper input validation) — `src/app/api/webhooks/yousign/route.ts`

17. **[SHOULD]** Enregistrer dans `cee_dossier_events` chaque write significatif (iban soumis, convention envoyée, quiz passé, activation) comme audit trail append-only — CWE-778 (insufficient logging) — toutes routes write

18. **[SHOULD]** La RPC `decrypt_iban` (future) déclarée `SECURITY DEFINER`, accessible `service_role` uniquement — CWE-269 (improper privilege management) — migration future

19. **[NICE]** Déclarer le scope CEE dans `public/security.txt` pour bug bounty — pas de CWE direct — `public/security.txt`

---

## 5. Tests sécurité à exiger (ralph-tester)

- **Test 1** : Webhook Yousign sans header `X-Yousign-Signature` → attendu 401
- **Test 2** : Webhook Yousign avec signature valide mais timestamp vieux de 10 min → attendu 401 (replay bloqué)
- **Test 3** : Webhook Yousign avec même `(envelope_id, event_type)` envoyé deux fois → second appel retourne 200 (idempotent) mais n'insère pas de doublon dans `cee_dossier_events`
- **Test 4** : `POST /api/cee/partners/training/quiz` avec body `{ "score": 10, "certified": true }` → score recalculé serveur, champs client ignorés, réponse reflète le score calculé
- **Test 5** : `POST /api/cee/partners/onboarding/iban` sans `CEE_IBAN_KEY` en env → attendu 500 (fail-close, pas de stockage IBAN)
- **Test 6** : `GET /api/cee/partners/me` avec JWT d'un artisan A → retourne uniquement le record de A, pas celui de B (test IDOR inter-artisan)
- **Test 7** : `POST /api/cee/partners/activate` par artisan non admin → attendu 403
- **Test 8** : `POST /api/cee/partners/invite-batch` par utilisateur non admin → attendu 403
- **Test 9** : `POST /api/cee/partners/onboarding/iban` flood 5 req/min par même `user_id` → 4ème requête → 429
- **Test 10** : `POST /api/cee/partners/onboarding/iban` avec requête cross-origin (`Origin: https://evil.com`) → attendu 403 (CSRF)
- **Test 11** : RLS smoke — `anon` SELECT `cee_artisan_partners` → 0 lignes (pas d'erreur, mais résultat vide ou 401 selon config PostgREST)
- **Test 12** : IBAN soumis, vérifier que les logs (Vercel) ne contiennent pas la chaîne IBAN complète — uniquement `iban_last4`
- **Test 13** : `convention_pdf_url` renvoyée avec valeur `https://attacker.com/evil.pdf` → rejetée avec erreur de validation avant stockage

---

## 6. Variables d'env critiques

| Var | Rôle | Fail-close prod ? | Rotation |
|---|---|---|---|
| `CEE_IBAN_KEY` | Clé symétrique `pgp_sym_encrypt` — chiffrement IBAN | **OUI** — exception si absent | Trimestrielle (re-chiffrement batch requis) |
| `YOUSIGN_API_KEY` | Authentification API Yousign v3 | **OUI** — 500 si absent | Annuelle ou sur compromission |
| `YOUSIGN_WEBHOOK_SECRET` | Vérification HMAC signature webhook | **OUI** — 500 si absent, webhook rejeté | Sur rotation côté Yousign dashboard |
| `NEXT_PUBLIC_SITE_URL` | Validation CSRF `validateOrigin()` | Partiel — dev autorise all si absent | N/A (config) |
| `CRON_SECRET` | Auth des crons purge RGPD | **OUI** — 401 si absent | Annuelle |

---

## 7. Verdict GO/NO-GO PR2.2

**Statut** : **NO-GO** jusqu'à validation des MUST suivants dans le premier commit de routes.

**Blocage conditionné à la présence dans le commit initial de :**

1. `src/lib/cee/iban-crypto.ts` — fail-close si `CEE_IBAN_KEY` absent + bind params stricts + masquage logs
2. `src/lib/cee/yousign.ts` — `timingSafeEqual` HMAC + drift ≤5min + validation domaine PDF URL + idempotency
3. Toutes routes `POST` — `validateOrigin()` (CSRF) + rate limit 3 req/min sur iban/quiz
4. `training/quiz` route — score calculé serveur, champs client ignorés
5. `leads-service.ts` — `TRANSITIONS` map miroir trigger SQL 433 (fail sur transition illégale)
6. `webhooks/yousign` — fail-close si `YOUSIGN_WEBHOOK_SECRET` absent + Content-Type check + idempotency `(envelope_id, event_type)`

**GO conditionnel** accordé si les 6 points ci-dessus sont présents et passent les tests 1, 2, 4, 5, 6, 7, 10 de la section §5.
