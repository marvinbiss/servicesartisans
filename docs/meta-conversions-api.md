# Meta — Pixel, Conversions API & Advanced Matching

Couche signal Meta de ServicesArtisans. Objectif : ne plus perdre 30 à 50 % des
conversions (ATT iOS, bloqueurs, ITP) et remonter l'Event Match Quality.

---

## Architecture

```
Navigateur                                  Serveur                     Meta
──────────                                  ───────                     ────
newEventId() ──┬──> fbq('track', 'Lead', p, { eventID })  ─────────────> Pixel
               │
               └──> POST /api/artisan-lead { meta: { eventId, … } }
                         └──> sendMetaEvent()  ────────────────────────> CAPI
                                                          Meta déduplique
                                                          sur (event_name, event_id)
```

Deux chemins d'envoi serveur, jamais les deux pour un même événement :

| Chemin | Quand | Fichier |
|---|---|---|
| Route métier | La conversion passe déjà par une API (lead, inscription) — on y a les coordonnées complètes pour l'Advanced Matching | `src/app/api/artisan-lead/route.ts` |
| Pont générique | Événement purement navigateur (ViewContent, Contact…) | `src/app/api/meta/capi/route.ts` |

Côté client, `trackLead(params, { eventId, sendServerEvent: false })` désactive le
pont quand la route métier s'en charge — sinon l'événement partirait deux fois
côté serveur.

## Fichiers

| Fichier | Rôle |
|---|---|
| `src/lib/meta/hash.ts` | Normalisation + SHA-256 des identifiants (spec Meta) |
| `src/lib/meta/capi.ts` | Client Conversions API, extraction IP/UA/cookies |
| `src/app/api/meta/capi/route.ts` | Pont navigateur → CAPI (allowlist, rate limit, consentement) |
| `src/lib/analytics/track.ts` | Helpers client : `event_id`, consentement, cookies, relais |
| `src/middleware.ts` | Persistance de `fbclid` en cookie `_fbc` |
| `src/app/layout.tsx` | Chargement du Pixel, différé jusqu'au consentement marketing |

## Configuration

```bash
NEXT_PUBLIC_META_PIXEL_ID=      # Pixel navigateur (public)
META_CAPI_ACCESS_TOKEN=         # System User Token, permission ads_management
META_DATASET_ID=                # Optionnel — défaut : NEXT_PUBLIC_META_PIXEL_ID
META_TEST_EVENT_CODE=           # DEV UNIQUEMENT
META_GRAPH_API_VERSION=         # Optionnel — défaut : v26.0
```

Génération du token : Events Manager → Paramètres du dataset → Conversions API →
« Générer un token d'accès ». Le token est **server-only** : jamais de préfixe
`NEXT_PUBLIC_`.

Sans `META_CAPI_ACCESS_TOKEN`, tout le module est un no-op silencieux — le site
fonctionne à l'identique.

## RGPD

- Le Pixel n'est chargé qu'après consentement marketing (`cookie_preferences.marketing`).
- La CAPI applique la **même** règle : le client transmet `consent: true`, et le
  serveur refuse tout envoi sans ce drapeau. La CAPI ne doit jamais servir à
  contourner un refus de cookies.
- Les identifiants sont hachés en SHA-256 avant transmission — aucune donnée
  personnelle en clair ne sort du serveur (test dédié : « n'envoie jamais de PII
  en clair »).
- Les corps de requête ne sont jamais loggés (ils contiennent des PII).

## Le point `_fbc` (attribution)

La canonicalisation d'URL supprime `fbclid` par un 301 **avant** que le Pixel ne
s'exécute. Sans correctif, `_fbc` — le signal d'attribution le plus fort — n'est
jamais posé. `persistFbclid()` dans le middleware écrit le cookie au format
`fb.1.<timestampMs>.<fbclid>` sur la réponse de redirection.

Le cookie n'est écrit que sur des URLs porteuses d'un `fbclid` (unique par clic),
donc sans effet sur le cache CDN des pages publiques.

## Vérification

1. **Test Events** — renseigner `META_TEST_EVENT_CODE` en local, soumettre le
   formulaire de la landing, vérifier dans Events Manager → « Testez les
   événements » que le `Lead` apparaît avec la source « Serveur » ET « Navigateur »,
   fusionnés (mention « Déduplication »).
2. **Event Match Quality** — Events Manager → Aperçu du dataset. Cible ≥ 6/10 sur
   `Lead` une fois l'Advanced Matching actif.
3. **`_fbc`** — ouvrir `https://servicesartisans.fr/?fbclid=TEST123`, vérifier en
   console `document.cookie` que `_fbc=fb.1.<ts>.TEST123` existe après le 301.
4. **Tests unitaires** — `npx vitest run __tests__/lib/meta`.

## Suites prévues (non implémentées)

- `PageView` Meta sur les navigations SPA (aujourd'hui, seul le chargement initial
  déclenche le Pixel).
- Événements CRM valorisés (`LeadQualified`, `DevisEnvoye`, `DevisSigne` avec
  `value`) — prérequis de l'objectif « Conversion Leads ».
- Webhook Lead Ads, audiences personnalisées via Marketing API, Click-to-WhatsApp.
