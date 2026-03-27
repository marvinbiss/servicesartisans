# Audit CRO — Éléments Cliquables — 2026-03-26

## Résumé exécutif

**20 agents parallèles** ont scanné l'intégralité du codebase ServicesArtisans.

| Sévérité | Nombre (dédupliqué) | Impact |
|----------|---------------------|--------|
| **BLOQUANT** | 46 | Conversion impossible, fonctionnalité morte, perte de leads |
| **MAJEUR** | 103 | Friction forte, données faussées, UX trompeuse |
| **MINEUR** | 97 | Accents manquants, inconsistances, code mort |
| **TOTAL** | **246** | |

---

## 🔴 BLOQUANTS — Top 15 les plus critiques

### 1. Téléphone avec espaces rejeté par l'API (5 formulaires)
- **Impact** : Potentiellement la MAJORITÉ des leads perdus
- **Cause** : L'API Zod exige `^(\+33|0033|0)[1-9]\d{8}$` sans séparateur. Le frontend envoie le téléphone brut avec espaces ("06 12 34 56 78").
- **Fichiers** : `DevisForm.tsx:502`, `DevisBottomSheet.tsx:301`, `useLeadSubmit.ts:80,138`, `CallbackRequest.tsx:45`
- **Fix** : Ajouter `.replace(/[\s.\-()]/g, '')` dans chaque handleSubmit, ou transformer côté API Zod.

### 2. CTA "Demander un devis" MORT sur desktop (fiches artisan)
- **Impact** : ~40-60% du trafic desktop ne peut pas convertir via le CTA primaire
- **Cause** : `DevisBottomSheet` est `md:hidden`. Sur desktop (≥768px), le clic ne fait RIEN.
- **Fichiers** : `ArtisanHero.tsx:206`, `ArtisanQuickQuote.tsx:57`
- **Fix** : Sur desktop, scroller vers `#devis` ou ouvrir `QuoteRequestModal` (déjà codé).

### 3. Système de messagerie en ruine (12 issues)
- **Impact** : Toute fonctionnalité avancée du chat est morte
- **Cause** : Migration V2 a supprimé 5 tables (`message_attachments`, `message_reactions`, `message_read_receipts`, `conversation_settings`, `quick_reply_templates`) + 4 colonnes de `messages`. Les composants `chat/*` les référencent encore.
- **Fichiers** : `chat-service.ts` (entier), `ChatWindow.tsx`, composants `chat/*`
- **Fix** : Soit recréer les tables, soit supprimer tout le code chat avancé.

### 4. Calendrier de réservation 100% mort
- **Impact** : Zéro booking possible
- **Cause** : `useRealTimeAvailability` est un stub (`slots: {}`). `BookingCalendarPro` affiche un calendrier vide. + Les réponses API `/api/bookings` sont wrappées (`data.data.slots`) mais le frontend lit `data.slots`.
- **Fichiers** : `useRealTimeAvailability.ts:32`, `BookingCalendar.tsx:97`, `BookingCalendarPro.tsx:213`

### 5. Route `/reset-password` inexistante
- **Impact** : Les utilisateurs ne peuvent JAMAIS réinitialiser leur mot de passe
- **Cause** : `useAuth.ts:126` redirige vers `/reset-password` qui n'existe pas. La vraie page est `/definir-mot-de-passe`.
- **Fix** : Changer la redirect dans `useAuth.ts`.

### 6. Avis invisibles sur les pages artisan
- **Impact** : Zéro social proof, SEO dégradé
- **Cause** : `GET /api/reviews` retourne `{ success, data: { reviews, stats } }`. Le frontend lit `data.reviews` (= undefined) au lieu de `data.data.reviews`.
- **Fichier** : `ReviewsSection.tsx:48-49`

### 7. Dashboard admin — données fausses/mockées
- **Impact** : L'équipe pense avoir des données quand elle n'en a pas
- **Cause** : `analytics-service.ts` query `total_price` (colonne inexistante), `service_type` (fantôme), mauvais `provider_id` sur reviews, event type mismatch. `topServices`/`topCities` sont hardcodés ("Plomberie: 150", "Paris: 300").
- **Fichiers** : `analytics-service.ts:160,202,254,261,265,270`

### 8. Admin — 3 routes API cassées
- **Signalements** : PUT au lieu de POST + mauvais path (`/reports/{id}` vs `/reports/{id}/resolve`) → `signalements/page.tsx:82`
- **Messages** : Route `/api/conversations/{id}/archive` inexistante → `messages/page.tsx:69`
- **Toggle artisan** : PUT au lieu de PATCH → `outils/page.tsx:68`

### 9. ExitIntentModal — CTA mort sur ~20 pages
- **Impact** : Le popup de rattrapage le plus déployé ne fait rien
- **Cause** : `handleResume` fait `document.querySelector('form')` — pas de `<form>` dans le DOM sur les pages géo, blog, tarifs, etc.
- **Fix** : Ajouter fallback `window.location.href = '/devis'`.

### 10. Liens services depuis quartiers → 404 (milliers de pages)
- **Impact** : ~47 liens × milliers de pages quartier = centaines de milliers de 404
- **Cause** : `href="/services/${service}/${ville}/${quartier}"` — la route `/services/[s]/[l]/[q]` n'existe pas.
- **Fichier** : `villes/[ville]/[quartier]/page.tsx:330,628`

### 11. ProactiveChatPrompt encore monté sur les pages money
- **Impact** : Détruit la conversion (règle business documentée)
- **Fichiers** : `services/[service]/page.tsx:1035`, `services/[service]/[location]/page.tsx:672`
- **Fix** : Supprimer les imports.

### 12. Formulaire mot de passe client — totalement inerte
- **Impact** : Le client pense avoir changé son MDP alors que rien ne se passe
- **Cause** : `<form>` sans `onSubmit`, aucun state pour les champs.
- **Fichier** : `espace-client/parametres/page.tsx:497-536`

### 13. Email client éditable mais jamais sauvegardé
- **Impact** : L'utilisateur modifie, voit "succès", mais rien n'est persisté
- **Cause** : `handleProfileSubmit` ne transmet pas `email` dans le body PUT.
- **Fichier** : `espace-client/parametres/page.tsx:462`

### 14. Abandon tracking — clés incompatibles frontend/backend
- **Impact** : Impossible de segmenter les relances par service/ville
- **Cause** : Frontend envoie `service_slug, city_slug, step_reached`. API lit `service, city, step`.
- **Fichier** : `DevisForm.tsx` → `api/devis/abandon-tracking/route.ts`

### 15. Urgence des devis toujours "normal"
- **Impact** : L'artisan ne voit jamais l'urgence réelle du client
- **Cause** : Le frontend envoie `"Ce mois-ci"` (label), l'API attend `"mois"` (slug). Le mapping échoue.
- **Fichiers** : `ArtisanQuoteForm.tsx:82`, `quote-form.tsx:127`

---

## 🔴 BLOQUANTS — Liste complète par zone

### Auth (2)
| # | Fichier | Problème |
|---|---------|----------|
| B1 | `auth/callback/route.ts:57` | Redirect OAuth erreur vers `/auth/auth-code-error` — page inexistante |
| B2 | `api/auth/signup/route.ts:77` | `email_confirm: true` = email confirmé immédiatement, user attend un email qui n'arrive jamais |

### Admin (6)
| # | Fichier | Problème |
|---|---------|----------|
| B3 | `signalements/page.tsx:82` | PUT au lieu de POST + mauvais path API — signalements non traitables |
| B4 | `admin/messages/page.tsx:69` | Route `/api/conversations/{id}/archive` inexistante |
| B5 | `admin/outils/page.tsx:68` | PUT au lieu de PATCH — toggle artisan cassé |
| B6 | `utilisateurs/page.tsx:98` | `/admin/utilisateurs/nouveau` — page 404 |
| B7 | `admin/paiements/page.tsx` | Page placeholder, aucune fonctionnalité |
| B8 | `admin/abonnements/page.tsx` | Page placeholder, aucune fonctionnalité |

### Espace artisan (4)
| # | Fichier | Problème |
|---|---------|----------|
| B9 | `espace-artisan/messages/page.tsx:371` | Bouton pièce jointe sans handler |
| B10 | `calendrier/page.tsx:973` | Boutons supprimer créneau sans handler |
| B11 | `calendrier/page.tsx:792` | Bouton détails réservation sans handler |
| B12 | `demandes-recues/page.tsx:359` | ChevronRight trompeur, card non-cliquable |

### Espace client (2)
| # | Fichier | Problème |
|---|---------|----------|
| B13 | `parametres/page.tsx:497` | Formulaire mot de passe sans onSubmit — totalement inerte |
| B14 | `parametres/page.tsx:462` | Email éditable mais jamais sauvegardé (faux positif UX) |

### Fiches artisan (3)
| # | Fichier | Problème |
|---|---------|----------|
| B15 | `ArtisanHero.tsx:206` + `ArtisanQuickQuote.tsx:57` | CTA devis → DevisBottomSheet `md:hidden` sur desktop |
| B16 | `ArtisanExitIntent.tsx:122` | CTA "Estimer mon projet" → callback `() => {}` (no-op) |

### Pages services (3)
| # | Fichier | Problème |
|---|---------|----------|
| B17 | `RecentProviders.tsx:71` | Fallback 'france' comme location → 404 |
| B18 | `services/[service]/page.tsx:1035` + `[location]/page.tsx:672` | ProactiveChatPrompt sur pages money |
| B19 | `PageClient.tsx:381` | Lien devis avec locationSlug potentiellement vide |

### Pages géo (2)
| # | Fichier | Problème |
|---|---------|----------|
| B20 | `[ville]/[quartier]/page.tsx:330,628` | Liens service+quartier → route 404 (milliers de pages) |

### Blog (2)
| # | Fichier | Problème |
|---|---------|----------|
| B21 | `blog/[slug]/page.tsx:1066` | Lien auteur `/blog?author=X` — param jamais lu |
| B22 | `BlogPageClient.tsx:280` | Newsletter sans consentement RGPD |

### Nav/Header/Footer (1)
| # | Fichier | Problème |
|---|---------|----------|
| B23 | `Footer.tsx:14` vs `Header.tsx:209` | FAQ pointe vers /faq (footer) et /questions (header) |

### UI Components (1)
| # | Fichier | Problème |
|---|---------|----------|
| B24 | `NotificationBell.tsx:157` | Items notification = div onClick, non-focusables clavier |

### Formulaires devis (5 — même root cause)
| # | Fichier | Problème |
|---|---------|----------|
| B25 | `DevisForm.tsx:502` | Téléphone avec espaces rejeté par API |
| B26 | `DevisBottomSheet.tsx:301` | Idem |
| B27 | `useLeadSubmit.ts:80` | Idem |
| B28 | `CallbackRequest.tsx:45` | Idem |
| B29 | `useLeadSubmit.ts:138` | Idem (callback) |

### Maps/Search (2)
| # | Fichier | Problème |
|---|---------|----------|
| B30 | `api/search/map/route.ts:52` | API ne retourne pas phone/stable_id → bouton "Appeler" invisible |
| B31 | `MapFilters.tsx:189` | Filtre "Urgence 24/7" décoratif — colonne DB supprimée |

### Chat/Messagerie (10)
| # | Fichier | Problème |
|---|---------|----------|
| B32 | `ChatWindow.tsx:298` | Upload pièce jointe = stub vide |
| B33 | `ChatWindow.tsx:313` | Upload image = stub vide |
| B34 | `chat-service.ts:491` | 3 tables supprimées → getMessages échoue |
| B35 | `chat-service.ts:528` | search_vector supprimé → searchMessages crash |
| B36 | `chat-service.ts:258` | sendMessage colonnes fantômes |
| B37 | `chat-service.ts:341` | addReaction/removeReaction → table supprimée |
| B38 | `chat-service.ts:445` | markMessageAsRead → table supprimée |
| B39 | `chat-service.ts:641` | conversation_settings → table supprimée |
| B40 | `chat-service.ts:752` | quick_reply_templates → table supprimée |
| B41 | `chat-service.ts:602` | avatar_url colonne supprimée de providers |

### CTA/Conversion (2)
| # | Fichier | Problème |
|---|---------|----------|
| B42 | `ExitIntentModal.tsx:146` | handleResume → querySelector('form') = null sur ~20 pages |
| B43 | `VilleHeroCTA.tsx:40` | Variant 'mid' sans bouton — DevisBottomSheet mort |

### Pages légales (1)
| # | Fichier | Problème |
|---|---------|----------|
| B44 | `ContactPageClient.tsx:130` | Email contact non cliquable sur la PAGE DE CONTACT |

### Hooks/Handlers (6)
| # | Fichier | Problème |
|---|---------|----------|
| B45 | `analytics-service.ts:160` | `total_price` colonne inexistante → dashboard admin cassé |
| B46 | `analytics-service.ts:254` | `total_price` + `service_type` fantômes → métriques provider fausses |
| B47 | `analytics-service.ts:261` | `reviews.provider_id` → devrait être `artisan_id` |
| B48 | `analytics-service.ts:265` | quotes table potentiellement vide |
| B49 | `analytics-service.ts:270` | event_type `profile_view` vs `artisan_profile_view` mismatch |
| B50 | `useRealTimeAvailability.ts:32` | Stub → calendrier réservation 100% mort |

### API Routes (6)
| # | Fichier | Problème |
|---|---------|----------|
| B51 | `ArtisanQuoteForm.tsx:82` → API | Urgence envoyée en label humain au lieu de slug |
| B52 | `quote-form.tsx:127` → API | `very_urgent` non supporté → toujours "normal" |
| B53 | `BookingCalendar.tsx:97` → API | Réponse wrappée non gérée → calendrier vide |
| B54 | `espace-artisan/calendrier:247` → API | Même problème → 0 réservations affichées |
| B55 | `ReviewsSection.tsx:48` → API | Réponse wrappée → avis invisibles |
| B56 | `DevisForm.tsx` → abandon-tracking | Clés incompatibles frontend/backend |

### onClick morts (1)
| # | Fichier | Problème |
|---|---------|----------|
| B57 | `useAuth.ts:126` | Route `/reset-password` inexistante → reset MDP impossible |

### Liens internes (2)
| # | Fichier | Problème |
|---|---------|----------|
| B58 | `declaration-prealable-travaux/page.tsx:567` | `/services/facades` → slug invalide (correct: `facadier`) |
| B59 | `diagnostics-immobiliers/page.tsx:483` | `/services/diagnostiqueur-immobilier` → slug invalide (correct: `diagnostiqueur`) |

---

## 🟠 MAJEURS — Par thème (103 issues)

### Analytics/Tracking faussé (12)
- Sidebar + MobileCTA trackent `clickPhone` pour des clics devis (3 endroits)
- 7+ event types rejetés par l'API (whitelist ALLOWED_EVENTS incomplète)
- Header CTA click non tracké (`header_devis_click` pas dans whitelist)
- `artisan_devis_click`, `artisan_email_click` pas dans whitelist
- Double tracking `form_started` (StickyMobileCTA + DevisBottomSheet)
- `responseRate: 95`, `responseTime: 2` hardcodés dans useProvider
- `topServices`/`topCities` mockés dans analytics-service
- Cache map stub (useMapSearchCache retourne toujours null)

### Navigation/Redirections cassées (12)
- `window.location.href` au lieu de scroll vers #devis (Sidebar + MobileCTA)
- "Voir tous les avis" scroll vers lui-même sans expand
- Lien retour Statistiques/Équipe → calendrier au lieu de dashboard
- Lien "Voir la demande" générique sans ID
- FAQ Footer (/faq) vs Header (/questions) — incohérence
- Redirect `/recherche` → `/services` en conflit avec page existante
- AdvancedSearch suggestion artisan → /recherche au lieu de fiche directe
- Liens villes département → /villes (index national) au lieu de filtre
- Avis par ville hardcodés sur plombier
- CTA urgence → page service au lieu de /devis
- `definir-mot-de-passe` hardcode redirect vers /espace-artisan

### Emails non cliquables (15)
- `mentions-legales`: 4 emails en texte brut sans mailto:
- `confidentialite`: 2 emails
- `cgv`: 1 email
- `mediation`: 2 emails
- `politique-avis`: 1 email
- `notre-processus-de-verification`: 1 email
- `a-propos`: 1 email
- `contact`: 1 email (BLOQUANT, compté séparément)
- Téléphone mentions-legales sans `tel:`
- URL CNIL en texte brut sans lien

### Paramètres client trompeurs (4)
- Sélecteur thème Clair/Sombre/Système → dark mode désactivé
- Sélecteur langue EN/ES/DE → site 100% français
- Sélecteur fuseau horaire → jamais utilisé
- Sélecteur devise USD/GBP → site en euros uniquement

### Réseaux sociaux (2)
- Footer liens Facebook/Twitter/LinkedIn/Instagram probablement inexistants
- Twitter au lieu de X (URL, icône, couleur)

### UX Modales/Popups (6)
- Backdrop modal avis client sans onClick pour fermer
- Backdrop modal suppression compte sans onClick
- Conflit z-index StickyMobileCTA + ArtisanMobileCTA
- Collision session key exit intents (3 composants partagent même clé)
- Auto-dismiss exit intent popup après 10s (trop court)
- Superposition cookie consent + exit intent popup

### Formulaires (8)
- providerId ignoré dans quote-form (lead non lié à l'artisan)
- Pas de validation frontend dans quote-form et contact form
- 2 formulaires sans consentement RGPD (ArtisanQuoteForm, quote-form)
- PaymentForm: fuite de PaymentIntents (nouveau créé sans annuler précédent)
- Messages d'erreur Stripe en anglais
- Doublon detection email vide bloque les leads sans email
- Newsletter jamais persistée en DB
- Inscription artisan ni persistée ni rate-limitée

### Chat (12)
- Architecture duale (chatService Realtime vs fetch REST) sans lien
- Handlers optionnels sans fallback dans MessageBubble
- Menu contextuel ne se ferme jamais au clic extérieur
- VoiceRecorder race condition
- VoiceRecorder double useEffect strict mode
- Page artisan messages: `data.profile` vs `data.provider`
- fetchMessages incohérent après handleSendMessage
- MessageSearch regex injection (crash sur caractères spéciaux)
- editMessage colonne `edited_at` supprimée
- deleteMessage colonne `deleted_at` supprimée
- currentUserId non résolu → tous messages côté gauche

### Pages géo (8)
- CTA bottom sans contexte ville/département/région (4 pages)
- CSS cassé `hove[r:text-white...]` sur page ville
- Spans non-cliquables avec styles hover (faux affordance)
- Double exit intent incohérent entre pages
- ExitIntentModal scroll vers form inexistant sur pages géo

### Accessibilité (6)
- ArtisanGallery photos: div onClick sans role/tabindex (2 endroits)
- CompareBar bouton retirer invisible sur mobile (opacity-0 sans hover)
- SearchBar bouton clear 28px (sous minimum 44px)
- Pagination page courante = Link cliquable (devrait être span/disabled)
- Select.tsx/Textarea.tsx: Math.random() → mismatch hydration SSR

### Divers (7)
- Page Factures client placeholder accessible
- Page avis client = clone exact de avis-donnes (code zombie)
- Admin templates email = localStorage only (pas partagé entre admins)
- ConfirmationModal useConfirmation → Promise never resolves on cancel
- ReviewActions double fermeture modal
- Bouton Google OAuth connexion sans disabled pendant loading
- Toggle Particulier/Artisan sur connexion = décoratif (jamais envoyé)

### Blog (6)
- Tags et catégories → filtres client-side au lieu de pages SSR
- Liens internes articles = `<a>` au lieu de `<Link>` (full reload)
- Twitter share = twitter.com au lieu de x.com
- Pages catégorie/tag sans pagination (tous articles d'un coup)

### Liens internes (5)
- `/api/v1/docs` inexistante
- 4 slugs blog hardcodés à risque dans FaqAndBlogSection

---

## 🟡 MINEURS — Résumé (97 issues)

### Accents manquants (15+)
- `pres` → `près` (StickyMobileCTA)
- `jusqu'a` → `jusqu'à` (ScrollNudge)
- `Electricite`, `Maconnerie`, `Demenagement` (AdvancedSearch)
- `Verifie`, `etoiles` (SearchFilters)
- `Recherches recentes`, `Categorie`, `Disponibilite` (AdvancedSearch)
- Labels PaymentForm sans accents
- Services catégories AdvancedSearch

### `<a>` au lieu de `<Link>` Next.js (4)
- mentions-legales → confidentialite
- cgv → confidentialite
- Composants auth orphelins (register-form, login-form)

### Code mort/Composants orphelins (8)
- `QuoteRequestModal` jamais monté
- `RolePermissionsEditor` jamais monté
- `RefundModal` jamais utilisé
- `search-form.tsx` jamais importé
- `ArtisanResultCard` jamais importé
- Routes API orphelines (`/api/estimation/lead`, `/api/social-proof`, `/api/push/subscribe`, `/api/verify/entreprise`)

### UX mineures (25+)
- Erreurs silencieuses (avis PUT/DELETE, providers toggle/delete)
- alert() inconsistant vs setErrorMessage
- Toast sans auto-dismiss
- Recherche client-side limitée (espace client, page service+location)
- Messages sans realtime/polling
- Breadcrumbs manquants sur certaines pages
- Formatage EUR sans espace
- Progress bar 0% au step 1
- Compteur caractères sans maxLength
- etc.

### Accessibilité mineures (15+)
- aria-labels manquants (CopyButton, CancellationModal, pagination dashboard)
- Cibles tactiles sous 44px (boutons clear, géolocalisation, compare remove)
- Backdrop sans gestion Escape
- Checkbox consentement sans htmlFor
- Skip links empilés au même endroit
- etc.

---

## Priorité de correction recommandée

### Sprint 1 — CRITIQUE (impact conversion direct)
1. ✅ Fix téléphone avec espaces → 5 formulaires (1h)
2. ✅ Fix CTA devis desktop fiches artisan (30min)
3. ✅ Fix `/reset-password` → `/definir-mot-de-passe` (5min)
4. ✅ Fix réponses API wrappées (bookings, reviews) (30min)
5. ✅ Supprimer ProactiveChatPrompt des pages money (5min)
6. ✅ Fix ExitIntentModal fallback /devis (15min)
7. ✅ Fix urgence label→slug mapping (15min)
8. ✅ Fix abandon-tracking clés (10min)
9. ✅ Fix liens quartier→services (10min)

### Sprint 2 — ADMIN + ESPACE CLIENT
10. Fix 3 routes API admin (signalements, messages, toggle)
11. Fix formulaire mot de passe client
12. Fix email non sauvegardé client
13. Supprimer paramètres trompeurs (thème, langue, timezone, devise)
14. Fix boutons calendrier artisan (3 handlers manquants)

### Sprint 3 — ANALYTICS + CHAT
15. Ajouter events manquants à ALLOWED_EVENTS
16. Corriger tracking clickPhone→clickDevis
17. Nettoyer chat-service.ts (supprimer refs tables mortes)
18. Supprimer composants chat avancés morts

### Sprint 4 — SEO + LÉGAL
19. Rendre tous les emails cliquables (mailto:)
20. Fix slugs services invalides dans guides
21. Ajouter consentement RGPD newsletter
22. Unifier FAQ /faq vs /questions
23. Fix réseaux sociaux footer

### Sprint 5 — POLISH
24. Corriger accents manquants
25. Remplacer `<a>` par `<Link>` Next.js
26. Supprimer code mort
27. Fix accessibilité (targets 44px, aria-labels)

---

*Audit réalisé le 2026-03-26 par 20 agents Claude en parallèle.*
*Fichiers scannés : ~250+ composants, ~50 routes API, ~47 hooks/services.*
