# MASTER PLAN 01 — Technical Fix Plan (Bailout SSR + secondary SEO blockers)

**Projet** : ServicesArtisans (Next.js 14 App Router, Tailwind, Supabase, Vercel)
**Date** : 2026-04-18
**Auteur** : Lead Software Architect
**Statut** : EXÉCUTABLE — mot pour mot
**Criticité** : P0 — bloque 100 % des pages publiques (body 665 chars, 0 H1, 6 bailouts)
**Impact attendu fix principal** : +200 à +500 % trafic SEO sur 4-8 semaines
**Effort total** : ~18-28 h dev + 2-4 semaines observation Google

---

## 0. TL;DR exécutif

1. **Root cause prouvée** : `CompareProviderWrapper` (importé via `dynamic(..., { ssr: false })` dans `src/app/layout.tsx:59-65`) englobe Header + children + Footer + quatre composants utilitaires (lignes 254-272 du même fichier). Puisque `ssr:false` force le client-side-only rendering du wrapper, **tout l arbre visible du site devient CSR-only** au niveau SSR, produisant un `<body>` vide côté Googlebot.
2. **Les 6 bailouts exacts** correspondent aux 6 composants `{ ssr:false }` placés directement sous `<body>` avant hydration (`ConsentGatedScripts`, `WebVitals`, `PageViewTracker`, `PostHogProvider`, `AuthTracker`, `CompareProviderWrapper`). Seul le 6e (CompareProviderWrapper) est structurellement fatal car il enveloppe l arbre visible.
3. **Fix principal (P0)** : retirer `ssr: false` sur `CompareProviderWrapper` (le composant est déjà SSR-safe grâce à `noopContext`, `CompareProvider.tsx:87-93`). Alternative : descendre le wrapper sous le main. 4 lignes à changer.
4. **Fix secondaires (P1)** : retirer `ssr: false` sur `DynamicFooterLinks` (`Footer.tsx:22-24`) qui est un Server Component pur (aucun `use client`, aucune API client) — Google perd actuellement 15 liens footer par page rendue. Retirer les 5 `dynamic()` cosmétiques qui rendent `null` ou `<Script>`.
5. **Pages 0 providers (P1)** : remplacer `notFound()` ligne 589 par render pédagogique `index:false, follow:true`. Basculer les pages sans commune data en **410 Gone** via middleware (Google doc section 13 : 410 = oubli rapide, plus rapide que 404, noindex consomme le budget crawl).
6. **Migration DB** : aucune nouvelle migration nécessaire pour le fix P0 — la colonne `rge_qualifications` existe déjà (migration 380). Une migration optionnelle `456_renovation_energetique_services.sql` ajoute 4 services renov pour le pillar 2.

---

## 1. Diagnostic précis du bailout SSR

### 1.1 Preuve empirique (Agent 4 forensique, 5 pages curl 2026-04-18)

Fichiers téléchargés dans docs/ahrefs-audit-2026-04/ :

- home.html (256 205 B HTTP, body utile 0 chars, 6 bailouts)
- svc-plombier-paris.html (389 244 B HTTP, body 0, 6 bailouts)
- svc-plombier.html (358 024 B, body 0, 6 bailouts)
- blog.html (373 664 B, body 0, 6 bailouts)
- tarifs-plombier.html (280 189 B, body 0, 6 bailouts)

Signature du body rendu (identique sur 5 pages) :

```html
<body class="font-sans bg-sand-50 antialiased text-charcoal-900">
  <noscript><iframe src="googletagmanager.com/ns.html?id=GTM-THV3KZ8N" ... /></noscript>
  <!--X!--><template data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING"></template
  ><!--/X-->
  (repete 6 fois : chaque marqueur = 1 Suspense bailouté par Next.js)
</body>
```

5 pages testees, 5 fois BAILOUT=6, <a href>=0, <h1>=0. Reproduit sur /, /services/plombier/paris, /services/plombier, /blog, /tarifs/plombier.

### 1.2 Cartographie des 6 bailouts

Source : C:/Users/USER/Downloads/servicesartisans/src/app/layout.tsx (277 lignes).

Next.js 14 emet exactement un marqueur BAILOUT_TO_CLIENT_SIDE_RENDERING pour chaque composant charge via dynamic(..., { ssr: false }) place directement sous un parent SSR. Chaque dynamic est wrappe implicitement par React dans un Suspense ; puisque le composant refuse le SSR, Next.js bailout a l endroit de son insertion et attend l hydration client.

Les 10 dynamic({ ssr: false }) dans layout.tsx :

| #   | Ligne | Composant                  | Rend quoi ?                                          | Position JSX                            | BAILOUT top-level ?   |
| --- | ----- | -------------------------- | ---------------------------------------------------- | --------------------------------------- | --------------------- |
| 1   | 30-32 | MobileBottomNav            | UI fixe bas mobile                                   | ligne 267 (sous CompareProviderWrapper) | absorbe par parent    |
| 2   | 33-35 | ServiceWorkerRegistration  | null                                                 | ligne 268                               | absorbe               |
| 3   | 36-39 | CapacitorInit              | null                                                 | ligne 269                               | absorbe               |
| 4   | 40-42 | CookieConsent              | Bandeau RGPD                                         | ligne 270                               | absorbe               |
| 5   | 43-46 | WebVitals                  | null                                                 | ligne 249 (racine body)                 | BAILOUT 1             |
| 6   | 47-49 | PageViewTracker            | null                                                 | ligne 250 (racine body)                 | BAILOUT 2             |
| 7   | 50-52 | PostHogProvider            | null                                                 | ligne 251 (racine body)                 | BAILOUT 3             |
| 8   | 53-55 | AuthTracker                | null                                                 | ligne 252 (racine body)                 | BAILOUT 4             |
| 9   | 56-58 | ConsentGatedScripts        | Script gated                                         | ligne 248 (racine body)                 | BAILOUT 5             |
| 10  | 59-65 | **CompareProviderWrapper** | **Enveloppe Header + main + Footer + 4 utilitaires** | ligne 254 (racine body)                 | **BAILOUT 6 — FATAL** |

Total = 6 bailouts racines. Correspondance exacte avec BAILOUT=6 observe en curl. Les bailouts 1-5 emettent un template inutile mais ne masquent aucun contenu. Le bailout 6 masque tout l arbre visible du site.

### 1.3 Pourquoi CompareProviderWrapper est le coupable structurel

Fichier C:/Users/USER/Downloads/servicesartisans/src/components/compare/CompareProvider.tsx:35-85 :

```tsx
export function CompareProviderWrapper({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useState<CompareProvider[]>([])
  const { toasts, removeToast, warning } = useToast()
  // ...useCallback / useMemo pour addToCompare / removeFromCompare / isInCompare / clearCompare
  return (
    <CompareContext.Provider value={value}>
      {children} // Header + main + Footer + utilitaires
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </CompareContext.Provider>
  )
}
```

Ce composant est client-only (`use client` ligne 1), utilise useState, useCallback, useMemo, useToast. Mais rien ne l empeche d etre rendu cote serveur : aucun acces window/document/localStorage au top-level, aucun useSearchParams/useParams, aucune API browser non-polyfillee. L etat initial est un tableau vide, identique cote serveur et client.

Pourtant il est importe dans layout.tsx:59-65 avec `{ ssr: false }`. Consequence : Next.js traite l import comme ssr-impossible, emet un BAILOUT_TO_CLIENT_SIDE_RENDERING a sa position (ligne 254 du JSX), et ne rend jamais son subtree cote serveur. Tout le contenu visible (Header, <main>, Footer, MobileBottomNav, etc., lignes 254-272) est rendu uniquement apres hydration JavaScript cote client.

Consequences mesurees (cf. RAPPORT-FINAL.md section 4) :

- <head> complet cote Googlebot : metadata, JSON-LD, canonical, Open Graph -> OK
- <body> vide : 6 templates bailout + 1 noscript GTM + 1 iframe GTM = 665 chars
- H1 rendu = 0, <a href> rendus = 0
- Ratio SSR / CSR = 0,00 % sur le maillage interne (Agent 4)

Google peut executer JavaScript (Googlebot Chrome 115+), mais la doc officielle precise que le JS rendering est differe : seulement 2,45 % des crawls font un chargement ressources complet (GSC Crawl Stats). Sur les 97,55 % restants, la page ressemble a un soft 404 candidate (Google Search Central section 9 : DB down, JS non charge, page vide -> soft 404).

### 1.4 Pourquoi les 5 autres bailouts sont cosmetiques

WebVitals, PageViewTracker, PostHogProvider, AuthTracker, ConsentGatedScripts rendent soit null, soit un <Script> gated par consent. Leur bailout est semantiquement neutre au rendu visuel. Mais :

- Ils polluent le HTML avec 5 <template> markers inutiles
- Ils creent 5 Suspense frontieres inutiles, ralentissant le RSC streaming
- Ils masquent le vrai coupable (CompareProviderWrapper) en ajoutant du bruit dans les audits

---

## 2. Plan de fix etape par etape

### 2.1 Verifier l etat avant fix (5 min)

Commandes de baseline, a sauvegarder dans docs/ahrefs-audit-2026-04/ssr-before/ :

```bash
mkdir -p /tmp/ssr-before
for url in "/" "/services/plombier/paris" "/services/plombier" "/blog" "/tarifs/plombier"; do
  slug=$(echo "$url" | sed s,/,_,g)
  [ -z "$slug" ] && slug=home
  curl -s --compressed -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"     "https://servicesartisans.fr${url}" > "/tmp/ssr-before/${slug}.html"
  bailouts=$(grep -c "BAILOUT_TO_CLIENT_SIDE_RENDERING" "/tmp/ssr-before/${slug}.html")
  h1=$(grep -c "<h1" "/tmp/ssr-before/${slug}.html")
  body_size=$(awk "/<body/,/<\/body>/" "/tmp/ssr-before/${slug}.html" | wc -c)
  echo "${url}: bailouts=${bailouts} h1=${h1} body=${body_size}B"
done
```

Critere de succes du fix : body > 10 000 chars, h1 >= 1, bailouts <= 1.

### 2.2 Isoler le coupable par commentation incrementale (1 h)

Sur branche dediee fix/ssr-bailout, tester en local (`npx next build && npx next start`, puis `curl localhost:3000/services/plombier/paris | grep -c BAILOUT`).

Ordre de desactivation dans src/app/layout.tsx :

```
Test A — commenter lignes 254-272 <CompareProviderWrapper>...</CompareProviderWrapper>,
         remplacer par Fragment <>Header, main, Footer, etc.</>
  => Attendu : BAILOUT passe de 6 a 5, body passe a >50KB, h1 >= 1
Test B — si Test A n a pas suffi, commenter aussi ligne 251 <PostHogProvider/>
Test C — commenter ligne 252 <AuthTracker/>
```

Pronostic fonde sur l analyse du code : Test A suffira. Preuve : tous les autres composants { ssr:false } rendent null ou <Script>, ils n ont aucun effet sur la visibilite du subtree.

### 2.3 Fix definitif (15 min)

**Option A (RECOMMANDEE) — Rendre CompareProviderWrapper SSR-safe**

Le composant EST deja SSR-safe : il n accede a aucune API client au top-level, retourne un noopContext si le provider n est pas monte (CompareProvider.tsx:87-93). Il suffit de retirer { ssr: false }.

Edit cible C:/Users/USER/Downloads/servicesartisans/src/app/layout.tsx lignes 59-65 :

```diff
- const CompareProviderWrapper = dynamic(
-   () =>
-     import("@/components/compare/CompareProvider").then((mod) => ({
-       default: mod.CompareProviderWrapper,
-     })),
-   { ssr: false }
- )
+ // Import statique — CompareProviderWrapper est SSR-safe (pas d acces window direct,
+ // useState/useMemo/useCallback seulement, noopContext fallback cote serveur).
+ // Retirer ssr:false car le provider enveloppe Header/main/Footer -> bailout global sinon.
+ import { CompareProviderWrapper } from "@/components/compare/CompareProvider"
```

Avantages :

- 1 diff minimal, zero restructuration JSX
- Le noopContext garantit que useCompare() retourne un tableau vide cote SSR (identique a useState([]) initial cote client -> aucun risque d hydration mismatch)
- Tout Header + Footer + children SSR-rendered -> Googlebot voit 100 % du maillage

**Option B (fallback) — Descendre le wrapper sous main**

Si Option A echoue (raison tres improbable : un child qui throw si useCompare() retourne undefined, mais le noopContext l empeche) :

```diff
- <MobileMenuProvider>
-   <CompareProviderWrapper>
-     <Header artisanCount={artisanCount} />
-     <main id="main-content" ...>{children}</main>
-     <Footer />
-     <MobileBottomNav />
-     ...
-   </CompareProviderWrapper>
- </MobileMenuProvider>
+ <MobileMenuProvider>
+   <Header artisanCount={artisanCount} />
+   <main id="main-content" ...>
+     <CompareProviderWrapper>{children}</CompareProviderWrapper>
+   </main>
+   <Footer />
+   <MobileBottomNav />
+   ...
+ </MobileMenuProvider>
```

Cette option laisse Header et Footer (maillage prioritaire) en SSR pur, et confine le compare state au contenu des pages. Moins propre qu Option A mais ultra-safe.

**Tradeoff A vs B** :

- A = 1 import, 0 JSX change, 100 % SSR pour tout
- B = restructuration JSX, 3-4 lignes changees, 100 % SSR pour Header+Footer, compare confine aux pages
- Recommandation : A (CompareProvider est deja SSR-safe par design via noopContext).

### 2.4 Nettoyer les 5 bailouts cosmetiques (30 min, P1)

Les 5 composants qui rendent null ou <Script> n ont aucune raison d etre dynamic(). Ils peuvent etre importes statiquement — leur code useEffect ne s execute que cote client apres hydration, et Next.js tree-shake leurs dependances cote serveur.

Edit cible src/app/layout.tsx lignes 43-58 :

```diff
- const WebVitals = dynamic(
-   () => import("@/components/WebVitals").then((mod) => ({ default: mod.WebVitals })),
-   { ssr: false }
- )
- const PageViewTracker = dynamic(() => import("@/components/PageViewTracker"), { ssr: false })
- const PostHogProvider = dynamic(() => import("@/components/PostHogProvider"), { ssr: false })
- const AuthTracker = dynamic(() => import("@/components/AuthTracker"), { ssr: false })
- const ConsentGatedScripts = dynamic(() => import("@/components/ConsentGatedScripts"), { ssr: false })
+ import { WebVitals } from "@/components/WebVitals"
+ import PageViewTracker from "@/components/PageViewTracker"
+ import PostHogProvider from "@/components/PostHogProvider"
+ import AuthTracker from "@/components/AuthTracker"
+ import ConsentGatedScripts from "@/components/ConsentGatedScripts"
```

Chaque composant a ete audite (cf. lectures de code dans diagnostic) :

- WebVitals.tsx : `use client` + useReportWebVitals (hook Next.js, SSR-safe, retourne null au SSR). Pas d acces window au top-level.
- PageViewTracker.tsx : `use client` + usePathname + useRef + useState (init via fonction qui check typeof window === undefined -> SSR-safe) + tout acces window dans useEffect.
- PostHogProvider.tsx : `use client` + useEffect seulement (posthog init dans effect, pas de top-level).
- AuthTracker.tsx : `use client` + useEffect seulement (supabase listener dans effect).
- ConsentGatedScripts.tsx : `use client` + useState({ analytics: false, marketing: false }) initial + useEffect pour lire localStorage (etat initial vide -> rend <></> au SSR).

Resultat attendu apres 2.3 + 2.4 : BAILOUT=0 dans le HTML de 5 pages temoin, body > 50KB, <h1> >= 1, <a href> >= 100.

### 2.5 Ce qui doit rester dynamic(ssr:false)

Certains composants necessitent bien ssr: false (acces direct DOM au top-level, bibliotheques non-SSR) :

- MobileBottomNav : accede document.body.style dans useEffect (safe en principe, mais aussi Supabase client au top-level du effect via createBrowserClient). Garder ssr: false par securite. Impact = 0 bailout racine (reste sous CompareProviderWrapper si Option A appliquee).
- ServiceWorkerRegistration, CapacitorInit : acces navigator.serviceWorker / Capacitor natif — garder ssr: false.
- CookieConsent : lit localStorage dans useEffect mais peut avoir acces non-guarded — garder ssr: false par precaution.
- Tout ce qui utilise react-leaflet (cartes, CityMap, MapSearch, etc.) : garder ssr: false (leaflet touche window a l import).
- Widgets conversion (GeoPageCTA, StickyMobileCTA, etc.) : a auditer en P2.

### 2.6 Validation post-fix (10 min)

```bash
mkdir -p /tmp/ssr-after
for url in "/" "/services/plombier/paris" "/services/plombier" "/blog" "/tarifs/plombier"; do
  slug=$(echo "$url" | sed s,/,_,g)
  [ -z "$slug" ] && slug=home
  curl -s --compressed -A "Mozilla/5.0 (compatible; Googlebot/2.1)"     "https://servicesartisans.fr${url}" > "/tmp/ssr-after/${slug}.html"
  bailouts=$(grep -c "BAILOUT_TO_CLIENT_SIDE_RENDERING" "/tmp/ssr-after/${slug}.html")
  h1=$(grep -c "<h1" "/tmp/ssr-after/${slug}.html")
  links=$(grep -oE "<a [^>]*href=" "/tmp/ssr-after/${slug}.html" | wc -l)
  body_size=$(awk "/<body/,/<\/body>/" "/tmp/ssr-after/${slug}.html" | wc -c)
  echo "${url}: bailouts=${bailouts} h1=${h1} links=${links} body=${body_size}B"
done
```

Seuils de succes (obligatoires) :

- bailouts = 0 ou 1 (1 acceptable si MobileBottomNav conserve)
- h1 >= 1 sur toutes les pages
- links >= 100 sur pages hub, >= 50 sur service x ville
- body_size >= 20 000 octets (vs 665 aujourd hui)

Soumettre les 10 URLs temoin (cf. 6.4) dans GSC URL Inspection Tool -> cliquer Test Live URL -> onglet Rendered HTML -> verifier que <h1> apparait.

---

## 3. Audit architectural etendu — tous les ssr: false du projet

Grep complet sur src/ : 95+ occurrences (liste complete via `grep -rn "ssr:\s*false" src/`). Classification par criticite SEO :

### 3.1 Critiques (a fixer en P0/P1)

| Fichier                   | Ligne | Composant              | Action                                       |
| ------------------------- | ----- | ---------------------- | -------------------------------------------- |
| src/app/layout.tsx        | 59-65 | CompareProviderWrapper | **P0 — retirer ssr:false (Option A 2.3)**    |
| src/components/Footer.tsx | 22-24 | DynamicFooterLinks     | **P1 — retirer dynamic() + ssr:false (4.1)** |

### 3.2 Cosmetiques (fixer en P1 — reduit le bruit HTML)

| Fichier            | Lignes | Composants                                                                    |
| ------------------ | ------ | ----------------------------------------------------------------------------- |
| src/app/layout.tsx | 43-58  | WebVitals, PageViewTracker, PostHogProvider, AuthTracker, ConsentGatedScripts |

Tous peuvent devenir imports statiques — chaque composant est `use client` avec logique dans useEffect (2.4).

### 3.3 Legitimes (a conserver — dependances DOM/natives)

| Fichier                                                                                             | Motif                                                   |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| src/app/layout.tsx:30-42 (MobileBottomNav, ServiceWorkerRegistration, CapacitorInit, CookieConsent) | navigator, Capacitor natif, localStorage direct         |
| src/components/maps/\*.tsx (CityMap, CarteAvecListe, MapSearch, MapBoundsHandler, etc.)             | react-leaflet touche window a l import                  |
| src/app/(public)/villes/[ville]/page.tsx:54,56 (ExitIntentPopup, CityMap)                           | Popup client-only, leaflet                              |
| src/components/home/ClayHomePage.tsx:36 (SocialProofToast)                                          | Toast anime client-only                                 |
| src/components/conversion/GeoPageCTA.tsx:13-19                                                      | Widget conditionnel basee geolocation (a valider en P2) |
| src/components/blog/BlogInlineCTA.tsx:10                                                            | Widget client conditionnel                              |

### 3.4 A investiguer / recombiner (P2)

Beaucoup de pages declarent plusieurs dynamic ssr:false pour des composants CTA (GeoPageCTA, StickyMobileCTA, SocialProofBanner, MicroConversions, ExitIntentPopup, InlineTestimonial, CallbackRequest, UrgencyCountdown, RecentSearches). Chacun emet un bailout par page. Liste non-exhaustive :

- src/app/page.tsx:18-25 : 4 ssr:false sur SocialProofBanner, RecentSearches, StickyMobileCTA, ExitIntentPopup
- src/app/(public)/services/[service]/[location]/page.tsx:88-96 : 4 ssr:false sur GeoPageCTA, MicroConversions, CallbackRequest, InlineTestimonial
- src/app/(public)/urgence/[service]/[ville]/page.tsx:76-81 : 3 ssr:false
- 20+ autres pages similaires

Apres fix P0, chaque page aura encore 3-7 bailouts internes (pas fatals puisqu ils rendent des modals/widgets, mais cosmetiques).

Plan P2 :

1. Auditer chaque composant (acces window au top-level ? Ou dans useEffect ?)
2. Consolider les CTA en <ConversionWidgets /> unique avec conditional rendering interne
3. Les composants `use client` + useEffect uniquement peuvent devenir des imports statiques

Effort P2 : 4-6 h, gain SEO marginal (le bailout fatal etant fixe).

---

## 4. Fix secondaires detailles

### 4.1 Footer.tsx:22-24 — DynamicFooterLinks

Fichier : C:/Users/USER/Downloads/servicesartisans/src/components/Footer.tsx

Etat actuel (lignes 20-24) : un dynamic() avec ssr:false enveloppe DynamicFooterLinks.

Audit du composant cible (C:/Users/USER/Downloads/servicesartisans/src/components/seo/DynamicFooterLinks.tsx) :

- Aucune directive use client au top -> c est un Server Component pur
- Data statique via getMoneyPagesByTier(2) (pas de DB, pas d async)
- Calcul offset deterministe via new Date() -> SSR-rendable
- Retourne un div avec 15 Link Next.js (maillage interne)

Consequence : marquer ce composant ssr: false via dynamic() est une erreur d architecture — Googlebot ne voit jamais ces 15 liens vers les money pages tier 1+2. Impact maillage = -15 liens par page x N pages rendues (Agent 2 confirme : audit forensique mentionne 15 liens manquants systemiquement).

Fix obligatoire, zero risque : retirer l import dynamic et importer le composant statiquement dans Footer.tsx. Aucun code client a hydrater puisque le composant est un Server Component.

Alternatives considerees :

| Option                                             | Tradeoff                                                     |
| -------------------------------------------------- | ------------------------------------------------------------ |
| A — Import statique (recommande)                   | Simple, SEO optimal, 15 liens visibles Google                |
| B — Garder dynamique mais ssr:true                 | Equivalent a A, overhead Suspense inutile                    |
| C — Pre-render les 15 liens en dur dans Footer.tsx | Perd la rotation quotidienne, plus verbeux                   |
| D — Rotation server-side avec revalidate           | Deja obtenu via A (revalidate de la page = recalcul du seed) |

Recommandation : A. L argument original pour ssr:false (peut-etre eviter hydration mismatch sur Date) est faux — le composant etant Server Component pur, il est rendu cote serveur et envoye au client comme HTML statique, aucune hydration n est executee dessus.

Impact attendu : +15 liens internes par page x ~100 000 pages SSR reelles = +1 500 000 entrees maillage potentielles. Compense partiellement la chute 1M -> 200K discutee dans AUDIT-FORENSIQUE-MAILLAGE.md.

### 4.2 services/[service]/[location]/page.tsx:582-589 — notFound() sur 0 providers

Fichier : C:/Users/USER/Downloads/servicesartisans/src/app/(public)/services/[service]/[location]/page.tsx

Etat actuel (lignes 582-590) : si providers.length === 0 apres tentative de fallback departement, le resultat est null et ligne 629 declenche notFound() (HTTP 404).

Probleme : sur 50 services x 2 267 communes sitemap = 113 350 pages, la majorite des petites communes n ont pas d artisan enregistre. Chaque appel produit un HTTP 404 cote Google. Impact :

- Ce n est pas un soft 404 (code 404 server-side propre), mais gaspillage budget crawl
- Pages jamais indexables meme si le contenu editorial (commune data, trade content, prix regionaux) reste pertinent
- Pattern gagnant /urgence/\* ne fait PAS ce notFound() — c est une raison pour laquelle ces pages rankent (62 NEW KW, cf. KEYWORDS-ANALYSIS.md)

Decision Google officielle (doc section 13) :

- 410 Gone = Gone, signal fort d oubli, plus rapide que 404
- 404 Not Found = sera oubliee, moins definitif
- noindex = consomme du budget de crawl

3 strategies possibles :

Option A (RECOMMANDE pour maillage) — Render pedagogique + noindex

- Page rendue avec H1 Plombier a Commune — pas encore d artisan reference
- Corps : commune data, infos trade, FAQ generique
- CTA : formulaire devis (lead envoye aux artisans du departement)
- Maillage : 20 communes voisines avec artisans, lien departement/region, autres metiers
- robots: { index: false, follow: true } -> Google ne l indexe pas mais suit les liens
- Avantage : preserve 100 000+ URLs dans le maillage, ne pollue pas l index
- Desavantage : 100 000+ pages crawlees = consomme budget (mais crawl budget actuel non sature selon GSC Crawl Stats)

Option B — 410 Gone pour vraies pages mortes

- Si commune inexistante OU sans commune data enrichie : retourner 410
- Limite Next.js : App Router ne supporte pas nativement la reponse 410 dans page.tsx
- Solution : middleware.ts avec matcher qui retourne NextResponse avec status: 410, ou Route Handler custom
- Avantage : signal rapide a Google, economie crawl budget
- Desavantage : necessite de maintenir la liste des dead pages (cron ou build-time)

Option C — noindex dynamique (compromis)

- Rendre la page complete, appliquer robots: { index: false, follow: true }
- Google crawle (coute budget), n indexe pas, suit les liens
- Desavantage : noindex consomme le budget de crawl (Google doc section 11)

Recommandation combinee :

- Si commune existe ET commune data enrichie (population > 500 OU hasCommuneData) : Option A
- Sinon (commune n existe pas OU trop thin) : Option B (410 via middleware)

Effort : 4-6 h (render pedagogique + middleware 410 + tests).

### 4.3 robots.ts — etat actuel

Fichier : C:/Users/USER/Downloads/servicesartisans/src/app/robots.ts

Audit :

- AhrefsBot debloque au commit 69b9518e (2026-04-18) — commentaires L169-170 attestent
- GPTBot, Google-Extended, CCBot, anthropic-ai, Timpibot, Diffbot, Omgilibot, Kangaroo Bot, ImagesiftBot, img2dataset -> bloques L133-146 (protection training AI)
- AdsBot-Google, APIs-Google, Mediapartners-Google nommes explicitement (conforme Google doc section 12 : special crawlers ignorent \*)
- OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, Applebot-Extended, Amazonbot, Meta-ExternalAgent, YouBot, Google-CloudVertexBot autorises (signal AEO/GEO — 395 citations ChatGPT)
- Social preview bots autorises (facebookexternalhit, Twitterbot, LinkedInBot, etc.)
- SemrushBot, MJ12bot, DotBot, BLEXBot, PetalBot, DataForSeoBot, Bytespider bloques (SEO scrapers)

Aucune action requise sur robots.ts en P0/P1. Bon etat.

Decision ouverte (P3) : debloquer Google-Extended pour permettre a Gemini de grounding. Google Search Central section 12 precise que Google-Extended n affecte PAS le ranking Search. Tradeoff : protege contenu original (actuel) vs visibilite future Gemini. Recommandation P3 : garder bloque jusqu a preuve de conversion AI search.

### 4.4 pruning.ts — shouldNoindex

Fichier : C:/Users/USER/Downloads/servicesartisans/src/lib/seo/pruning.ts

Audit : module conforme playbook Indig/Darani. 3 regles :

1. NOINDEX_PATTERNS static list (L24-45) — auth/legal/utility pages uniquement
2. context.isQuartierPage === true -> noindex (thin content, deep nesting)
3. context.providerCount === 0 && context.hasUniqueData === false (L107) -> noindex

La regle 3 est safe (fail-open : si providerCount est undefined pendant un build DB-down, la page reste indexable).

Pas de modification necessaire en P0/P1. Si Option A 4.2 est retenue, la regle 3 fera exactement le bon job pour les pages 0 providers sans commune data enrichie.

---

## 5. Migration DB renovation energetique

### 5.1 Etat actuel — aucune migration necessaire pour P0

Migration supabase/migrations/380_rge_ademe_integration.sql (2026-02-16) a deja ajoute :

```sql
ALTER TABLE providers
  ADD COLUMN IF NOT EXISTS rge_qualifications JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS rge_valid_until    DATE  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS rge_organismes     TEXT[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS rge_last_synced_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS rge_source_url     TEXT DEFAULT NULL;
```

Contraintes presentes :

- providers_rge_qualifications_is_array (jsonb_typeof = array)
- providers_rge_qualifications_max_length (<= 10 items)
- 15+ migrations suivantes (380-455) ont etendu le modele RGE, CEE, ADEME

### 5.2 Services renovation energetique (P2 — pour pillar 2)

Si le plan STRATEGIE-RENOVATION-ENERGETIQUE.md doit etre execute, ajouter 4 services dedies. Verifier d abord qu ils n existent pas (migration 311 a pose 50 services).

Migration supabase/migrations/456_renovation_energetique_services.sql :

```sql
-- ================================================================
-- Migration 456 : 4 services Renovation energetique (50 -> 54)
-- Appliquee apres validation du fix bailout SSR (MASTER-PLAN-01)
-- ================================================================
BEGIN;

INSERT INTO services (name, slug, description, is_active, category, icon, sort_order)
VALUES
  ("Installateur pompe a chaleur", "installateur-pompe-chaleur",
   "Pose et maintenance de pompes a chaleur air-eau, air-air, geothermie — eligibles MaPrimeRenov.",
   true, "Renovation energetique", "Thermometer", 51),
  ("Isolateur thermique", "isolateur-thermique",
   "Isolation des combles, murs par l exterieur (ITE) et interieur — certifie RGE Qualibat.",
   true, "Renovation energetique", "Layers", 52),
  ("Auditeur energetique", "auditeur-energetique",
   "Audit energetique obligatoire pour vente des passoires thermiques classes F et G.",
   true, "Renovation energetique", "FileSearch", 53),
  ("Diagnostiqueur DPE", "diagnostiqueur-dpe",
   "Diagnostic de performance energetique certifie pour vente et location de logement.",
   true, "Renovation energetique", "ClipboardCheck", 54)
ON CONFLICT (slug) DO NOTHING;

-- Index partiel pour /renovation-energetique/[categorie]
CREATE INDEX IF NOT EXISTS idx_services_category_active
  ON services (category) WHERE is_active = true;

COMMIT;
```

Contraintes d execution (conforme CLAUDE.md) :

- Supabase SQL editor : coller le fichier complet en un seul run OK pour ce script (pas de $$ tag, pas de fonction PL/pgSQL). Si cron Pipedrive a ajouter plus tard, split en runs separes.
- Jamais de prefixe refresh\_\* sur les noms de fonction (CLAUDE.md global)
- Valider qu aucune DROP COLUMN passee n a retire les colonnes ciblees (verifier contre inventaire MEMORY.md — ici pas de risque : on INSERT seulement)

Rollback (fichier supabase/migrations/rollback/456_rollback.sql) :

```sql
BEGIN;
DELETE FROM services WHERE slug IN (
  "installateur-pompe-chaleur",
  "isolateur-thermique",
  "auditeur-energetique",
  "diagnostiqueur-dpe"
);
DROP INDEX IF EXISTS idx_services_category_active;
COMMIT;
```

### 5.3 Important : ne PAS ajouter de colonne rge_qualifications a providers

Cette colonne existe depuis migration 380. Si un dev ajoute ALTER TABLE providers ADD COLUMN rge_qualifications JSONB par inadvertance, ca crasherait ou dupliquerait (le IF NOT EXISTS evite le crash). Avant toute nouvelle migration RGE, lire migrations/380_rge_ademe_integration.sql et les suivantes (381, 385, 389, 390, 391, 401, 403, 404, 406, 413, 418, 436) pour comprendre l existant.

---

## 6. Plan de tests

### 6.1 Tests unitaires (avant merge)

```bash
cd /c/Users/USER/Downloads/servicesartisans
npx tsc --noEmit                              # 0 erreur attendu
npx vitest run                                 # 1030 tests doivent passer (MEMORY.md)
NEXT_BUILD_SKIP_DB=1 npx next build 2>&1 | grep -E "Error|warn"   # build clean
```

Signaux d alerte :

- Nouveau warning Hydration mismatch -> le fix Option A 2.3 necessite de basculer sur Option B
- Nouveau TypeScript error sur @/components/compare/CompareProvider -> verifier que l export CompareProviderWrapper existe (confirme lignes 35-85 du fichier)

### 6.2 Tests SSR locaux (post-build)

```bash
cd /c/Users/USER/Downloads/servicesartisans
npx next build
PORT=3000 npx next start &
sleep 5

# Verifier le bailout
curl -s http://localhost:3000/ | grep -c "BAILOUT_TO_CLIENT_SIDE_RENDERING"
# Attendu: 0 (ou 1 si MobileBottomNav/CookieConsent conserves)

curl -s http://localhost:3000/services/plombier/paris | grep -c "<h1"
# Attendu: >= 1

curl -s http://localhost:3000/services/plombier/paris | grep -oE "<a [^>]*href=" | wc -l
# Attendu: >= 100

kill %1
```

### 6.3 Tests Lighthouse (post-deploy Vercel preview)

```bash
npx lighthouse https://preview.vercel.app/services/plombier/paris   --only-categories=seo,performance   --output=json --output-path=/tmp/lh-paris.json   --chrome-flags="--headless"

jq ".categories.seo.score" /tmp/lh-paris.json
# Attendu: 1.0 (vs actuel 0.7-0.8 a cause de body vide)
```

### 6.4 Google Search Console — URL Inspection

10 URLs temoin a inspecter manuellement dans GSC Test Live URL :

```
https://servicesartisans.fr/
https://servicesartisans.fr/services/plombier/paris
https://servicesartisans.fr/services/plombier
https://servicesartisans.fr/blog
https://servicesartisans.fr/blog/prix-electricien-2026-tarifs-travaux
https://servicesartisans.fr/tarifs/plombier
https://servicesartisans.fr/urgence/plombier/caen
https://servicesartisans.fr/departements/vendee/domoticien
https://servicesartisans.fr/guides/maprimerenov-2026
https://servicesartisans.fr/avis/couvreur/clermont-ferrand
```

Pour chaque :

1. Onglet Rendered HTML -> verifier <h1> et les liens presents
2. Page availability = URL is available to Google
3. Cliquer Request Indexing pour accelerer le re-crawl

### 6.5 Tests Ahrefs (48h post-deploy)

- Site Audit -> relaunch crawl manuel
- Attendre 24-48h puis verifier :
  - Issue H1 missing passe de 10 001+ a < 100
  - Issue Low word count passe de 10 001+ a < 500
  - Issue Pages without outgoing internal links passe de 10 001+ a < 500
  - Issue Pages orphelines (entrantes) : idem

---

## 7. Risques et rollback

### 7.1 Risques identifies

| #   | Risque                                                      | Probabilite | Impact                   | Mitigation                                                                           |
| --- | ----------------------------------------------------------- | ----------- | ------------------------ | ------------------------------------------------------------------------------------ |
| R1  | Hydration mismatch sur CompareProviderWrapper               | Tres faible | Console warning React    | noopContext CompareProvider.tsx:87-93 garantit etat SSR identique a useState([]) CSR |
| R2  | Hydration mismatch sur DynamicFooterLinks (rotation Date)   | Nul         | Aucun                    | Server Component pur -> HTML rendu serveur envoye tel quel, pas d hydration          |
| R3  | Toast compare perdu au SSR                                  | Nul         | Aucun                    | ToastContainer rend null si tableau vide (etat initial = vide)                       |
| R4  | Dependances client bundlees cote serveur                    | Tres faible | Bundle size +5-10KB      | Deja bundlees (hooks useToast + ui)                                                  |
| R5  | Regression perf RSC (SSR des 6 composants)                  | Faible      | +50-100ms TTFB           | Composants rendent null, cout negligeable                                            |
| R6  | Fix revele autre bailout sous-jacent                        | Faible      | 1-2 bailouts residuels   | Plan iteratif 2.4 (isolation composant par composant)                                |
| R7  | Build Vercel echoue sur import statique ConsentGatedScripts | Tres faible | Rollback necessaire      | Teste localement d abord (6.2)                                                       |
| R8  | notFound() fix 4.2 cree pages thin en masse                 | Faible      | Penalite Helpful Content | Option A utilise index:false -> pas indexees                                         |

### 7.2 Rollback

```bash
cd /c/Users/USER/Downloads/servicesartisans
git log --oneline -5                          # identifier commit fix
git revert <commit-sha-fix>                   # commit de revert propre
git push origin main                          # Vercel redeploie en ~2 min
```

Rollback ultra-rapide via Vercel dashboard (30s) :

- Deployments -> deployment precedent reussi -> Promote to Production

### 7.3 Monitoring post-deploy

- Sentry (@sentry/nextjs) -> alertes erreurs runtime
- Vercel Analytics (@vercel/speed-insights) -> Web Vitals (TTFB, LCP)
- GA4 page_view -> si chute brutale, fix a casse (users voient page blanche JS-only)
- Supabase Logs -> pas d impact DB attendu

### 7.4 Pre-requis avant deploiement

- [ ] Tests Vitest : 1030/1030
- [ ] tsc --noEmit : 0 erreur
- [ ] next build : succes (2957 static pages)
- [ ] Test local : curl localhost:3000 | grep -c BAILOUT = 0 ou 1
- [ ] Branche fix/ssr-bailout poussee (preview Vercel auto-deployee)
- [ ] Preview Vercel testee manuellement sur 5 URLs (home, service, blog, tarifs, urgence)
- [ ] Utilisateur a approuve explicitement (CLAUDE.md regle NEVER commit or push unless explicitly asked)

---

## 8. Metriques de succes

### 8.1 HTML brut (T+0, curl post-deploy)

| Metrique                           | Baseline (2026-04-18) | Cible T+2h | Cible T+1sem |
| ---------------------------------- | --------------------: | ---------: | -----------: |
| Body size /                        |             665 chars |   > 20 000 |     > 50 000 |
| Body size /services/plombier/paris |             665 chars |   > 30 000 |     > 80 000 |
| <h1> count par page                |                     0 |       >= 1 |         >= 1 |
| <a href> SSR count home            |                     0 |     >= 100 |       >= 150 |
| <a href> SSR count service x ville |                     0 |     >= 150 |       >= 190 |
| BAILOUT markers par page           |                     6 |     0 ou 1 |       0 ou 1 |

### 8.2 GSC (T+2 a T+4 semaines)

| Metrique                   | Baseline |    T+4sem |
| -------------------------- | -------: | --------: |
| Pages explorée non indexée |   13 662 |   < 3 000 |
| Pages indexees GSC         |  459 003 | > 550 000 |
| Position moyenne           |     29,4 |      < 22 |
| Impressions / jour         |   33 280 |  > 60 000 |
| Clics / 28j                |    7 800 |  > 18 000 |

### 8.3 Ahrefs (T+2 a T+8 semaines)

| Metrique                                            |      Baseline |  T+8sem |
| --------------------------------------------------- | ------------: | ------: |
| Keywords organiques                                 |           185 |   > 400 |
| Trafic organique estime                             |         164/j | > 400/j |
| serrurier position (59 000 vol/mois)                |      99 (out) |    < 30 |
| plombier rouen position (seule perte factuelle -50) | out (etait 4) |    < 10 |
| Pages ranking top 10                                |         ~ 122 |   > 200 |

### 8.4 Comparaison avant/apres sur 10 URL temoin

Script tools/ssr-diff.sh (a creer) :

```bash
#!/bin/bash
# Usage: ./tools/ssr-diff.sh before|after
MODE=${1:-before}
OUTDIR="docs/ahrefs-audit-2026-04/ssr-${MODE}"
mkdir -p "$OUTDIR"
URLS=(
  "/"
  "/services/plombier/paris"
  "/services/plombier"
  "/blog"
  "/blog/prix-electricien-2026-tarifs-travaux"
  "/tarifs/plombier"
  "/urgence/plombier/caen"
  "/departements/vendee/domoticien"
  "/guides/maprimerenov-2026"
  "/avis/couvreur/clermont-ferrand"
)
echo "url,body_bytes,h1_count,links_count,bailout_count" > "$OUTDIR/summary.csv"
for u in "${URLS[@]}"; do
  slug=$(echo "$u" | tr / _ | sed s/^_//)
  [ -z "$slug" ] && slug=home
  f="${OUTDIR}/${slug}.html"
  curl -s --compressed -A "Mozilla/5.0 (compatible; Googlebot/2.1)" "https://servicesartisans.fr${u}" > "$f"
  body=$(awk "/<body/,/<\/body>/" "$f" | wc -c)
  h1=$(grep -c "<h1" "$f")
  links=$(grep -oE "<a [^>]*href=" "$f" | wc -l)
  bail=$(grep -c "BAILOUT_TO_CLIENT_SIDE_RENDERING" "$f")
  echo "${u},${body},${h1},${links},${bail}" >> "$OUTDIR/summary.csv"
done
cat "$OUTDIR/summary.csv"
```

Usage :

```bash
./tools/ssr-diff.sh before     # AVANT merge
# ... deploiement ...
./tools/ssr-diff.sh after      # APRES merge sur prod
diff docs/ahrefs-audit-2026-04/ssr-before/summary.csv      docs/ahrefs-audit-2026-04/ssr-after/summary.csv
```

---

## 9. Ordre d execution precis (avec dependances)

```
T+0h   9.1  Baseline curl (2.1) -> sauvegarder ssr-before.csv
T+0h   9.2  Creer branche fix/ssr-bailout
T+1h   9.3  Test isolation locale (2.2) -> confirmer CompareProviderWrapper = coupable
T+2h   9.4  Fix P0 : retirer ssr:false sur CompareProviderWrapper (2.3 Option A)
T+2h   9.5  Fix P1 : retirer 5 dynamic() cosmetiques (2.4)
T+2h   9.6  Fix P1 : retirer ssr:false sur DynamicFooterLinks (4.1)
            [depend de 9.4-9.5]
T+3h   9.7  tsc --noEmit, vitest run, next build -> tous verts (6.1)
T+3h   9.8  Test SSR local (6.2) -> BAILOUT=0, H1>=1, links>=100
T+4h   9.9  Push branche -> Preview Vercel auto-deploy
T+4h   9.10 Test preview URL (6.3 Lighthouse + curl)
            [depend de 9.9]
T+5h   9.11 Demander approbation utilisateur pour merge
            [depend de 9.10]
T+5h   9.12 Merge main -> Production Vercel deploy
            [depend de 9.11]
T+6h   9.13 Curl ssr-after.csv (8.4) -> diff ssr-before.csv
T+6h   9.14 Soumettre 10 URLs GSC URL Inspection (6.4)
T+6h   9.15 Upload disavow.txt (44 domaines) dans GSC en parallele
T+6h   9.16 Re-launch Ahrefs Site Audit
T+24h  9.17 Verifier GSC Rendered HTML -> H1 present
T+48h  9.18 Verifier Ahrefs Site Audit -> H1 missing 10K+ -> < 100
T+1sem 9.19 Fix P1 secondaire : notFound() -> render pedagogique (4.2 Option A)
            [depend de 9.18 — on veut voir impact P0 pur avant d ajouter P1]
T+2sem 9.20 Observer GSC : impressions / position moyenne
T+4sem 9.21 KPI check : 13 662 pages non indexees -> < 3 000 ?
T+8sem 9.22 KPI check : 59 keywords perdus -> reconquis ?
```

Point de decision critique : apres T+48h, si BAILOUT > 1 OU si H1 missing Ahrefs n a pas baisse, refaire la boucle 2.2 (isolation composant par composant) sur preview — un composant non-SSR-safe restant aura ete manque.

---

## 10. Estimation effort

### 10.1 P0 + P1 critique

| Tache                           |      Duree | Notes                  |
| ------------------------------- | ---------: | ---------------------- |
| Baseline curl + git branch      |      0,5 h | 2.1 + 9.2              |
| Test isolation locale           |        1 h | 2.2                    |
| Fix P0 : CompareProviderWrapper |      0,5 h | 2.3 Option A           |
| Fix P1 : 5 cosmetiques          |      0,5 h | 2.4                    |
| Fix P1 : DynamicFooterLinks     |     0,25 h | 4.1                    |
| tsc + vitest + build            |      0,5 h | 6.1                    |
| Tests SSR local                 |      0,5 h | 6.2                    |
| Deploy preview + test           |      0,5 h | 6.3                    |
| Review + merge + deploy prod    |      0,5 h | 9.11-9.12              |
| Curl after + GSC inspection     |      0,5 h | 8.4 + 6.4              |
| **Total P0 + P1 critique**      | **5,25 h** | **approx. 1 jour dev** |

### 10.2 P2 (fix secondaires)

| Tache                                                   |                   Duree |
| ------------------------------------------------------- | ----------------------: |
| Render pedagogique pages 0 providers (4.2 Option A)     |                     4 h |
| Middleware 410 pour vraies dead pages (4.2 Option B)    |                     3 h |
| Audit 95 occurrences restantes dynamic(ssr:false) (3.4) |                     4 h |
| Consolider widgets CTA en ConversionWidgets             |                     2 h |
| **Total P2**                                            | **13 h ~ 1,5 jour dev** |

### 10.3 P3 (pillar renov energetique — si decide)

| Tache                                                                                        |                           Duree |
| -------------------------------------------------------------------------------------------- | ------------------------------: |
| Migration 456 services renov (5.2)                                                           |                             1 h |
| Rollback file + test preview                                                                 |                           0,5 h |
| Pages editoriales /renovation-energetique/aides/\* (cf. STRATEGIE-RENOVATION-ENERGETIQUE.md) |                         16-24 h |
| **Total P3**                                                                                 | **18-26 h ~ 2,5-3,5 jours dev** |

### 10.4 Recapitulatif

- P0 + P1 critique : 5,25 h = 1 jour
- - P2 : 18 h = 2,5 jours
- - P3 : 36-44 h = 5-6 jours

---

## 11. Annexe — informations manquantes a valider

1. pnpm vs npm : le projet utilise npx next build (CLAUDE.md MEMORY.md) mais pnpm build && pnpm start apparait dans les transcripts forensiques. A confirmer.
2. Test isolation local : necessite que les env vars soient presentes. NEXT_BUILD_SKIP_DB=1 suffit pour builder sans Supabase (cf. MEMORY.md).
3. Cache CDN : Vercel invalidate automatiquement l edge cache au deploy. Si CloudFlare en front, prevoir purge manuelle.
4. Budget observation Google : combien de semaines d attente acceptables si KPI ne bougent pas ? Plan assume 4 semaines avant escalade.
5. Ahrefs Internal Links History : export Premium a recuperer pour prouver/infirmer 1M -> 200K (cf. AUDIT-FORENSIQUE-MAILLAGE.md section 6.3).
6. Dev local Supabase : confirmer acces DB en local pour tester le fallback dept (4.2). Sinon mocker getProvidersByServiceAndDepartment.

---

## 12. References croisees

- Diagnostic detaille : docs/ahrefs-audit-2026-04/RAPPORT-FINAL.md
- Forensique 4 agents : docs/ahrefs-audit-2026-04/AUDIT-FORENSIQUE-MAILLAGE.md
- Keywords : docs/ahrefs-audit-2026-04/KEYWORDS-ANALYSIS.md
- Strategie renov energetique : docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md
- Google SEO Essentials : C:/Users/USER/.claude/projects/C--Windows-system32/memory/google-seo-essentials-2026.md
- Disavow file : docs/ahrefs-audit-2026-04/disavow.txt (upload GSC en parallele du fix SSR)

---

**Fin du MASTER-PLAN-01-TECHNICAL**.

Prochain document attendu : MASTER-PLAN-02-CONTENT.md (strategie editoriale pillar renov energetique + expansion /urgence/ + amplification /departements/[dept]/[metier]).
