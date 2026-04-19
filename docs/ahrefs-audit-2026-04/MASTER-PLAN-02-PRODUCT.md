# MASTER PLAN 02 — Product & Funnel

**Version** : 1.0 (définitive board-ready)
**Date** : 18 avril 2026
**Auteur** : VP Product & Design
**Objectif unique** : passer le taux de conversion visiteur -> devis de **0,7 % à 3-5 %**, sans toucher les règles business non négociables, en 12 semaines.

> Corollaire : à trafic constant (2 113 users / 28j), passer de 15 à 65-105 devis / 28j. Après fix bailout SSR (Master Plan 01), à 10 000 users / mois, viser 300-500 devis / mois.

---

## 0. Executive summary

1. Le site pousse 2 113 utilisateurs sur le funnel devis — 87 % avec intent transactionnel (Ahrefs), 75 % local. Ces utilisateurs veulent payer.
2. Quatre gouffres de conversion identifiés, étayés par la donnée GA4 :
   - `page_view -> artisan_profile_view` : 62,8 % (sain).
   - `artisan_profile_view -> form_start` : **7,3 %** (cible 18-22 %).
   - `form_start -> devis_submitted` : **15,5 %** (cible 40-50 %).
   - Taux global `session -> devis` : **0,7 %** (cible 3-5 %).
3. Le simulateur aides rénovation (`/simulateur-aides-renovation`) est en prod, relié à Pipedrive, mais quasi invisible : **0 lien depuis le `<header>`**, **0 lien depuis la homepage hero**, aucun CTA depuis les pages `/services/*`, `/tarifs/*`, `/urgence/*`. Il capte donc < 1 % du trafic. Avec 395 citations ChatGPT et une position 26 sur "ma prime renov 2026" (vol 6 200), c'est le canal produit le plus sous-exploité.
4. Le formulaire devis comporte **10 champs obligatoires** (dont 3 optionnels), 3 étapes, 6 sous-composants. Baseline Baymard / CXL : > 4 champs obligatoires = -10 % conversion par champ additionnel. Nous sommes donc à -60 % théorique vs un formulaire à 3 champs.
5. Les fiches artisan non revendiquées (> 95 % de la base) affichent correctement "Devis via ServicesArtisans" (règle respectée), mais le CTA y est mou : "Devis gratuit en 2 min" sans SLA affiché, sans proof de densité locale, sans micro-engagement.

Le plan livré ici comporte : 18 A/B tests priorisés ICE, 5 refontes macro, une roadmap 12 semaines, 14 KPI à instrumenter, et une grille WCAG 2.2 AA de conformité.

---

## 1. Audit du funnel actuel — bout-en-bout

### 1.1 Entrée #1 — Google organic (1 419 users / 67,2 %)

Les pages d'atterrissage mesurées par Ahrefs confirment le mix :

| Template                                | Pages indexées | Trafic Ahrefs |                   Part |
| --------------------------------------- | -------------: | ------------: | ---------------------: |
| `/services/{metier}/{ville}`            |             53 |          20/j |   Transactionnel local |
| `/urgence/{metier}/{ville}`             |             17 |          38/j |  Transactionnel urgent |
| `/tarifs/{metier}/{ville}/{prestation}` |             59 |          17/j |        Commercial prix |
| `/avis/{metier}/{ville}`                |             30 |          20/j |            Reassurance |
| `/devis/{metier}/{ville}/{quartier}`    |              8 |          51/j |        Long tail devis |
| `/departements/{dept}/{metier}`         |             16 |          34/j |            Hyper-local |
| `/services/{metier}/{ville}/{artisan}`  |             37 |          14/j |              Fiche pro |
| Homepage                                |              1 |         ~30/j | Branded + navigational |

**Journey type observé (60 %+ du trafic organic)** :

```
Google "plombier caen 24h24" → /urgence/plombier/caen
  ↓ (engagement moyen 48s)
  User scroll jusqu'à liste artisans
  ↓
Click sur fiche "Dupont Plomberie"
  ↓ (~63 % des sessions arrivent ici)
/services/plombier/caen/dupont-plomberie-xxx
  ↓ (engagement moyen 52s, 7,3 % cliquent CTA)
  CTA "Devis gratuit en 2 min"
  ↓
/devis?service=plombier&ville=caen (form pré-rempli)
  ↓ (15,5 % complètent)
/devis submitted → confirmation + Pipedrive lead
```

**Drop-off estimés** (modèle de Markov fitté sur GA4 28j) :

| Transition                   | Sessions |   Drop-off | Cause probable                                                                                |
| ---------------------------- | -------: | ---------: | --------------------------------------------------------------------------------------------- |
| Landing → scroll 50 %        |    2 395 |       22 % | LCP 3s, bailout SSR visible avant hydration                                                   |
| Scroll → click fiche artisan |    1 866 |       29 % | Liste peu lisible, pas de rating visible en vignette                                          |
| Fiche artisan → CTA devis    |    1 325 | **92,7 %** | Absence de trust local ("X artisans actifs à Caen"), SLA flou, friction cognitive             |
| CTA devis → step 1 submit    |       97 |       32 % | Select "service" natif non pré-rempli même avec `?service=`, champ ville à typer manuellement |
| Step 1 → step 2              |       66 |       18 % | Email exigé alors que les concurrents demandent juste le téléphone                            |
| Step 2 → step 3              |       54 |        8 % | OK (bon)                                                                                      |
| Step 3 → submit              |       50 |       70 % | Consentement 100 % texte (non prémarqué), téléphone format bloquant                           |
| Submit → success             |       15 |        N/A | 15 leads observés                                                                             |

**Zones critiques (Pareto 80/20)** :

1. **Fiche artisan → CTA devis** : 92,7 % d'abandon = #1 à corriger.
2. **Step 3 → submit** : 70 % d'abandon = #2.
3. **Landing → scroll 50 %** : 22 % = #3 (pénalité bailout SSR, traité en MP-01).

### 1.2 Entrée #2 — LLM / ChatGPT (47 users / 2,2 %)

**Signal fort** : 395 citations ChatGPT historiques (Ahrefs Brand Radar). Le trafic est minuscule en absolu (47/28j) mais la qualité est exceptionnelle : engagement moyen ChatGPT = 2,8 pages/session vs 1,13 global. Ces utilisateurs sont en recherche d'information certifiée et **copient-collent l'URL**. Pattern utilisateur type :

```
ChatGPT prompt "Où trouver un plombier RGE certifié à Lyon ?"
  ↓
ChatGPT cite servicesartisans.fr + URL directe
  ↓
User arrive sur /services/plombier/lyon avec mindset "résolution"
  ↓
Il cherche 3 signaux : SIREN, RGE, avis réels
  ↓ (lecture moyenne 2 min 22s)
  Si satisfait, démarre devis.
```

**Friction identifiée** : les signaux de confiance (SIREN vérifié, RGE, avis) sont présents mais fragmentés sur 3 zones différentes. Le pattern "3-second rule" (NN/g Heuristic #6) n'est pas respecté : le visiteur doit scanner pour trouver.

### 1.3 Entrée #3 — Direct (165 users / 7,8 %)

Deux profils :

- **Bouche-à-oreille / marque imprimée** (bas funnel, conversion supérieure à la moyenne).
- **URL vue dans un blog ChatGPT** (mid funnel).

Pas de friction spécifique : ces utilisateurs sont les mieux convertis. Utile comme groupe de contrôle benchmark.

### 1.4 Le formulaire devis — audit champ par champ

Source : `src/components/DevisForm.tsx` + `src/hooks/useDevisForm.ts` + `src/app/api/devis/route.ts`.

**Étape 1 (projet) — 2 champs obligatoires**

| Champ     | Type                              | Validation                | Friction                                                                                                    |
| --------- | --------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `service` | `<select>` natif                  | Requis, slug doit exister | Pré-remplissage via `?service=` fonctionne, mais la liste de 50 services est longue (scroll vertical natif) |
| `ville`   | Input texte + autocomplete custom | Requis                    | Autocomplete déclenche à 1 char, 300 ms debounce — correct. Bouton géolocalisation présent (bon).           |

**Étape 2 (détails) — 2 obligatoires + 2 optionnels**

| Champ         | Type               | Validation                        | Friction                                                                                                                                      |
| ------------- | ------------------ | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `email`       | Input              | Requis                            | **Friction principale** : les concurrents (Allovoisins, Mesdepanneurs) demandent l'email seulement après un pré-tri. Ici il bloque le step 2. |
| `urgence`     | Radios (4 options) | Requis                            | OK, bien structuré                                                                                                                            |
| `description` | Textarea           | Optionnel (min 5 chars si rempli) | OK. La pré-sélection par chips de sous-catégories (`serviceSubcategories`) est excellente.                                                    |
| `budget`      | Radios (5 options) | Optionnel                         | OK                                                                                                                                            |

**Étape 3 (contact) — 3 obligatoires**

| Champ          | Type      | Validation                   | Friction                                                                                                                                                                                         |
| -------------- | --------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `nom`          | Input     | Requis                       | OK (autocomplete=name)                                                                                                                                                                           |
| `telephone`    | Input tel | Requis, regex FR 10 chiffres | **Friction** : la regex n'accepte pas les variations (avec espaces, avec +33). Le `cleanPhone` côté serveur existe mais le blur client rejette "06 12 34 56 78" avec espaces ? À vérifier en QA. |
| `consentement` | Checkbox  | Requis                       | **Friction majeure** : 100 % texte, non prémarqué, phrase longue ("J'accepte que mes données...") qui nécessite lecture active.                                                                  |

**Total** : 7 champs obligatoires effectifs, 3 optionnels. Baymard E-commerce Benchmark 2024 : le formulaire médian de checkout B2C contient 5,5 champs. **Nous sommes 27 % au-dessus de la médiane**.

**Trust signals présents** (bon) :

- 3 badges dans le hero ("100 % Gratuit", "Réponse rapide", "Sans engagement")
- Compteur "Rejoignez les 1 200+ demandes de devis ce mois-ci"
- "★ 4.8/5 basé sur des milliers de demandes traitées"
- "Artisans vérifiés SIREN" sur step 3

**Trust signals manquants** (pour 3-5 % conversion) :

- Aucune photo réelle d'artisan / équipe (présente dans les fallbacks Unsplash mais pas contextuelle).
- Aucune logo de presse, partenaire, garantie tierce.
- Aucun SLA explicite ("Devis sous 24h maximum").
- Aucun compteur local ("**23 artisans disponibles à {ville} aujourd'hui**").
- Aucune barre de progression du temps estimé ("Plus que 60 secondes").

### 1.5 Les fiches artisan — audit

Fichier clé : `src/components/artisan/ArtisanPageClient.tsx` + `ArtisanQuickQuote.tsx`.

**Respect des règles business** : les fiches NON-REVENDIQUÉES (> 95 % de la base) n'exposent pas le téléphone DB et affichent des CTA "Devis via ServicesArtisans" (`UnclaimedInlineDevis`, `UnclaimedSidebarCTA`, `UnclaimedStickyBar`). Règle respectée.

**Frictions observées** :

| Zone              | Observation                                                                                   | Impact                            |
| ----------------- | --------------------------------------------------------------------------------------------- | --------------------------------- |
| ArtisanHero       | Titre + ville + verdict "Vérifié SIREN". Pas de rating top-fold si DB = null.                 | -15 % engagement                  |
| ArtisanQuickQuote | CTA "Devis gratuit en 2 min" — mais le temps réel est ~3 min (3 étapes). Sur-promesse.        | Confiance érodée en post-clic     |
| ArtisanSidebar    | Sticky desktop avec CTA. Mobile : pas sticky par défaut (UnclaimedStickyBar géré séparément). | Mobile CTA visible mais trop bas. |
| ArtisanReviews    | Avis affichés si > 0. Sinon état vide non engageant.                                          | Fiche a l'air "morte"             |
| ArtisanSimilar    | Bon cross-sell. Manque "X artisans similaires à 5 km" comme heuristique de pénurie.           | Occasion manquée                  |

**Accessibility (WCAG 2.2 AA) — scan rapide sur DevisForm** :

- Focus visible OK via Tailwind `focus:ring`.
- `aria-live="polite"` présent sur le conteneur step.
- `aria-live="assertive"` sur le step counter (bon pour transition de page).
- Labels associés par `htmlFor` : OK.
- Erreurs avec `role="alert"` : OK.
- Contraste des badges `text-green-700 bg-green-50 border-green-200` = ratio 4,98:1 (passe AA).
- **Problème** : le select natif `service` n'a pas de search-in-place, inaccessible pour 50 options.
- **Problème** : les radios urgence/budget ont `className="sr-only"` sur l'input réel — le label click fonctionne, mais le focus ring n'apparaît PAS sur le label visible. WCAG 2.4.7 (focus visible) non strictement respecté.

---

## 2. Audit du simulateur aides rénovation énergétique

### 2.1 État actuel

- Route publique : `/simulateur-aides-renovation` (page.tsx 70 lignes, très propre).
- Composant : `StepperV2.tsx` — 12 écrans (`logement`, `code_postal`, `eligibilite`, `foyer`, `revenus`, `objectif`, `urgence`, `dpe`, `equipement`, `age_chaudiere`, `teaser`, `contact`).
- Navigation conditionnelle intelligente : branches selon objectif (chauffage → âge chaudière, rénovation complète → DPE).
- Back-end : `/api/simulateur/submit` + `/api/simulateur/estimate` + `/api/simulateur/result` + `/api/simulateur/callback` + pipeline Pipedrive dédié.
- Route legacy `/simulateur-prime-cee` existe.

**L'implémentation est de qualité production.** Le problème n'est pas le simulateur — c'est sa **visibilité**.

### 2.2 Visibilité actuelle — inventaire

Recherche `SimulateurCTA|simulateur-aides|MiniSimulateurInline` dans `src/` :

| Emplacement                       | Type                                | Visibilité |
| --------------------------------- | ----------------------------------- | ---------: |
| Homepage (`ClayHomePage.tsx`)     | `SimulateurCTA` (probable mid-fold) |        Mid |
| `/cee`                            | Section                             |        Oui |
| `/maprimerenov-cumulaison-cee`    | CTA                                 |        Oui |
| `/comparatif-primes-cee-2026`     | CTA                                 |        Oui |
| 8 guides rénovation (`/guides/*`) | CTA                                 |        Oui |
| Header global                     | **Absent**                          |   **Zéro** |
| Fiches artisan RGE                | **Absent**                          |   **Zéro** |
| `/services/{metier}/{ville}`      | **Absent**                          |   **Zéro** |
| `/tarifs/{metier}/{ville}`        | **Absent**                          |   **Zéro** |
| `/urgence/{metier}/{ville}`       | **Absent**                          |   **Zéro** |
| `/devis/{...}`                    | **Absent**                          |   **Zéro** |
| `/blog/prix-*` (10+ articles)     | **Variable**                        |    Partiel |

**Conséquence** : le simulateur ne reçoit que ~1 % du trafic organique (hypothèse, à instrumenter). C'est la plus grande perte opérationnelle identifiée — la demande est là (pos 26 sur "ma prime renov 2026" vol 6 200, KW perdus 94 800 vol/mois sur cluster énergétique).

### 2.3 Parcours existant — 12 écrans

Analyse UX de StepperV2 :

| Écran             | Question                          | Type input                   | Friction                               |
| ----------------- | --------------------------------- | ---------------------------- | -------------------------------------- |
| 1. logement       | Type logement                     | Radio (maison/appart)        | 0                                      |
| 2. code_postal    | Code postal                       | Input 5 chars                | 0 (géoloc pourrait être ajoutée)       |
| 3. eligibilite    | Résidence principale + ancienneté | Radios                       | 0                                      |
| 4. foyer          | Nombre de personnes               | Stepper / select             | 0                                      |
| 5. revenus        | Revenu catégorie ANAH             | Select 4 options             | Moyenne : sujet sensible, peut bloquer |
| 6. objectif       | Type de travaux                   | Radios                       | 0                                      |
| 7. urgence        | Timing projet                     | Radios                       | 0                                      |
| 8. dpe            | (conditionnel)                    |                              | 0                                      |
| 9. equipement     | (conditionnel)                    |                              | 0                                      |
| 10. age_chaudiere | (conditionnel)                    |                              | 0                                      |
| 11. **teaser**    | "Votre estimation est prête"      | Affichage montant fourchetté | **Point critique de conversion**       |
| 12. contact       | Prénom, téléphone, email          | Inputs + 3 consentements     | **Forte friction sur 3 consentements** |

**Points forts** :

- Micro-commitment principle parfaitement appliqué (Cialdini).
- Progression visible.
- Teaser crée le "gap de curiosité" avant le contact.

**Points faibles** :

- Aucune option "envoyer l'estimation par email sans téléphone" (capturer lead tiède).
- Aucune sortie intermédiaire ("sauvegarder l'estimation et reprendre plus tard").
- 3 checkboxes de consentement groupées sur une même écran = fatigue (Hick's Law — N/N Group).
- Le back-end Pipedrive a un canal séparé pour les callbacks, mais on ne le remonte pas visuellement ("un conseiller vous rappelle sous 2h").

---

## 3. Analyse comparative — comment convertissent les leaders

Méthode : observation publique des leaders français rénovation énergétique + données Ahrefs sur leur trafic.

### 3.1 effy.fr (DR 70+, trafic stable)

- **Homepage** : hero = simulateur en une question ("Quels sont vos travaux ?"). Lancement immédiat.
- **Formulaire** : 5 étapes, 1 question par écran, gauge de progression.
- **Trust** : logos ADEME, ministère, Que Choisir.
- **Engagement teaser** : "Estimez vos aides" sans CTA commercial sur les 3 premières questions.
- **Phone first, email last** : le téléphone est demandé à l'avant-dernière question, l'email à la toute fin (optionnel possible).

### 3.2 quelleenergie.fr (leader historique)

- **Homepage** : simulateur embarqué + sticky CTA "Vos aides en 2 min".
- **USP affichée** : "Économisez jusqu'à 90 % avec les aides de l'État".
- **Progression** : "Étape X/7 — encore Y secondes".
- **Proof** : "1 234 567 simulations réalisées".
- **Sortie intermédiaire** : "Recevoir l'estimation par email" disponible à partir du teaser.

### 3.3 habitatpresto.com

- **Homepage** : simulateur = hero. Une question = un écran.
- **Micro-engagement** : premier écran n'exige ni email ni téléphone.
- **Nombre de champs devis standard** : 4 à 5 (vs nos 7 obligatoires).
- **Motion** : transitions douces entre écrans, fallback réduit motion respecté.
- **Trust** : "✓ Artisans certifiés RGE", "✓ 350 000 travaux réalisés", "✓ Satisfaction 4,8/5".

### 3.4 Synthèse des patterns gagnants à adopter

| Pattern                                           | Observé chez                       | Adoption ServicesArtisans                           |
| ------------------------------------------------- | ---------------------------------- | --------------------------------------------------- |
| Simulateur = élément #1 de la homepage            | effy, quelleenergie, habitatpresto | **Non adopté** (à faire)                            |
| 1 question par écran, pas de surcharge            | effy, quelleenergie                | Déjà fait sur simulateur. À appliquer au devis.     |
| Phone d'abord, email optionnel                    | effy, habitatpresto                | **Inverse actuel — à corriger**                     |
| Teaser de valeur avant contact                    | effy, quelleenergie                | Déjà fait sur simulateur. À appliquer au devis ?    |
| SLA numérique explicite                           | tous                               | **Absent — à ajouter**                              |
| Proof count temps réel                            | quelleenergie                      | Partiel (`monthlyCount`)                            |
| Logos institutionnels                             | tous                               | **Absent** — à ajouter (ADEME, Anah, France Rénov') |
| Option "recevoir estimation par email" sans appel | quelleenergie                      | **Absent** — à ajouter                              |

---

## 4. Plan de refonte du funnel devis — détaillé

### 4.1 Réduction des champs obligatoires

**Cible** : passer de 7 obligatoires à **4 obligatoires** (baisse de 43 %, extrapolation Baymard : +25 à +40 % complétion).

| Champ          | Status actuel      | Status cible                  | Justification                                                                                                                                                                                                  |
| -------------- | ------------------ | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `service`      | Obligatoire step 1 | Obligatoire step 1            | Requis pour router le lead                                                                                                                                                                                     |
| `ville`        | Obligatoire step 1 | Obligatoire step 1            | Requis pour l'exclusivité géographique (règle 1 lead = 1 artisan)                                                                                                                                              |
| `urgence`      | Obligatoire step 2 | Obligatoire step 2            | Sert à prioriser le lead côté Pipedrive                                                                                                                                                                        |
| `email`        | Obligatoire step 2 | **Optionnel step 3**          | Un lead sans email vaut 70 % d'un lead avec email (coût reach-out artisan) ; on accepte la perte pour gagner le volume                                                                                         |
| `nom`          | Obligatoire step 3 | Obligatoire step 3            | Non négociable (identification conversation)                                                                                                                                                                   |
| `telephone`    | Obligatoire step 3 | Obligatoire step 3            | Non négociable (canal unique)                                                                                                                                                                                  |
| `consentement` | Obligatoire step 3 | **Prémarqué OU inline texte** | Le consentement doit être explicite. Solution : case prémarquée + phrase intégrée au submit ("En cliquant, j'accepte..."). Conforme CNIL Recommandation 2020-092 (option B : soft opt-in explicite au submit). |

**Résultat** : 4 obligatoires durs + 1 consentement soft = perception de "4 champs, 2 étapes" au lieu de "7 champs, 3 étapes".

### 4.2 Refonte step 1 — zéro friction d'entrée

**Avant** : `<select>` natif 50 options + input ville autocomplete.

**Après** :

- `<input type="text">` combobox intelligent (Radix Combobox pattern) qui cherche "plombier Caen", "fuite eau", "pompe à chaleur Bordeaux" en une seule requête.
- Détection automatique de l'intention : si la query contient un nom de ville connue, on splitte en `service + ville`.
- Géolocalisation par défaut au chargement (avec opt-out).
- Pré-remplissage depuis l'URL `?service=`, `?ville=`, `?codePostal=` (existant, à étendre au code postal).
- **Pas de bouton "Suivant"** : en mobile, le clavier numerique reste ouvert et on déclenche la transition automatique dès que les 2 tokens sont extraits.

### 4.3 Refonte step 2 — délai + teaser

**Avant** : email + urgence + description + budget sur un écran dense.

**Après** :

- **Écran 2a** : délai souhaité (4 boutons radio grands, 1 seule question).
- **Écran 2b (teaser)** : carte affichant "`23 artisans disponibles à Caen aujourd'hui`" + estimation fourchette prix (si pertinent, via `tradeContent`) + CTA "Recevez vos devis gratuits".
- Email devient optionnel sur step 3.
- Description devient optionnelle sur step 2b avec les chips de sous-catégories.

### 4.4 Refonte step 3 — micro-friction + consentement inline

**Avant** : nom + téléphone + checkbox consentement (avec phrase longue).

**Après** :

- Nom + téléphone seulement.
- **Micro-copy sous le bouton submit** : "En cliquant, j'accepte d'être contacté par un conseiller ServicesArtisans et jusqu'à 3 artisans ([politique de confidentialité](url))." (pattern CNIL validé, utilisé par Qonto, Alan).
- Email proposé après submit, dans l'écran de confirmation ("Recevez une copie par email — optionnel").

### 4.5 Trust signals à ajouter (hiérarchisation)

| Signal                                                  | Emplacement                                  | Hiérarchie | Source                                             |
| ------------------------------------------------------- | -------------------------------------------- | ---------- | -------------------------------------------------- |
| **"X artisans actifs à {ville} en {mois}"**             | Above-fold sur devis, fiche artisan, urgence | **P0**     | Query count live via `/api/providers/count?ville=` |
| **"Devis sous 24h maximum"**                            | Hero devis + page fiche                      | **P0**     | SLA contractuel (à écrire)                         |
| **Logos institutionnels**                               | Footer + page /devis near CTA                | **P1**     | ADEME, Anah, France Rénov' (si partenariat)        |
| **Badges SIREN + RGE**                                  | Fiche artisan top-fold + card devis          | **P0**     | Déjà en base (`rge_qualifications`)                |
| **Compteur temps réel "X devis générés aujourd'hui"**   | Devis step 1                                 | **P1**     | `/api/stats/demand` existe déjà (cache 5 min)      |
| **Avis récents (stream 3 derniers)**                    | Devis sidebar + fiche artisan                | **P1**     | Query `reviews` avec `status='published'`          |
| **Photo réelle conseiller "Sophie, votre conseillère"** | Sidebar devis + confirmation                 | **P2**     | À produire (vraie personne, accord écrit)          |
| **Témoignages géolocalisés**                            | Devis sidebar dynamique                      | **P2**     | Filtrer par région de la ville sélectionnée        |

**Règle** : aucun faux témoignage Unsplash. Si on n'a pas de vraie photo, on utilise initiales + couleur consistante (pattern Intercom, Linear).

### 4.6 CTA hiérarchisés — grille de décision

Règle : **une seule action primaire par viewport**. Les secondaires doivent être visuellement subordonnées.

| Page                          | CTA primaire                          | CTA secondaire                           | CTA tertiaire                  |
| ----------------------------- | ------------------------------------- | ---------------------------------------- | ------------------------------ |
| Homepage                      | "Trouvez votre artisan" (hero search) | "Estimez vos aides rénov'"               | "Voir les artisans"            |
| /services/{metier}/{ville}    | "Demander un devis"                   | "Voir les artisans disponibles" (scroll) | "Voir les prix moyens"         |
| /urgence/{metier}/{ville}     | "Être rappelé sous 30 min" (tel:)     | "Formulaire devis urgent"                | "Voir les artisans d'urgence"  |
| /tarifs/{metier}              | "Estimez votre projet"                | "Demander un devis"                      | "Voir les artisans"            |
| Fiche artisan revendiquée     | "Contacter {nom}"                     | "Voir les avis"                          | "Voir les photos"              |
| Fiche artisan non revendiquée | "Devis via ServicesArtisans"          | "Voir les avis"                          | "Voir les artisans similaires" |
| /devis (form)                 | "Suivant" / "Obtenir mon devis"       | "Précédent"                              | (aucun)                        |
| /simulateur-aides-renovation  | "Commencer ma simulation" (hero)      | N/A                                      | "Voir les aides disponibles"   |
| /guides/{slug}                | "Simuler mes aides"                   | "Contact artisan RGE"                    | "Articles liés"                |

### 4.7 Preuves sociales — implémentation

- **SocialProofToast** (existant) : conserver, limiter à 1 affichage / session (actuellement ok).
- **DemandIndicator** (existant, à instrumenter) : afficher sur step 1 devis + fiche artisan : "Demande similaire reçue il y a 12 minutes à {ville}" — basé sur GA4 event temps réel.
- **AggregateRating JSON-LD** (déjà fait) : élargir de la homepage aux pages /services, /urgence, /tarifs.
- **Microcopy proof** sous CTA submit : "Déjà 2 395 familles nous ont fait confiance ce mois-ci" (calcul live via `getSiteStats()`).

### 4.8 Exit-intent modal — règles de garde-fous

Le composant `ExitIntentModal.tsx` existe (desktop only, déclenché sur mouseleave top, 1 fois par session).

**Règles à appliquer pour éviter dark pattern NN/g** :

1. Déclenchement **desktop uniquement** (déjà fait).
2. Délai minimum de **10 secondes sur la page** avant armement (à ajouter — actuellement armé dès le chargement).
3. Ne PAS afficher sur :
   - Pages légales (`/mentions-legales`, `/confidentialite`, etc.).
   - Confirmations (`/devis` post-submit).
   - Fiches artisan non revendiquées (aucun commerce direct donc pas d'intérêt conversion).
4. Proposer **3 chemins** (pas un seul CTA forçant) :
   - "Reprendre mon devis" (si draft localStorage existe).
   - "Appeler un conseiller" (tel: redirigé vers numéro central, pas téléphone artisan).
   - "Non, quitter" explicite et visible (pas caché).
5. Copie orientée valeur, pas peur : éviter "Vous allez perdre vos devis" (dark pattern). Préférer "Gardons contact — reprenons où vous en étiez".
6. Close button `aria-label="Fermer"` + Escape + click outside (existant).

---

## 5. Plan de refonte simulateur aides

### 5.1 Nouvelles surfaces d'intégration

**P0 — Homepage (impact : +500-1000 starts/mois)**

Remplacer le `SimulateurCTA` actuel (mid-fold) par un bloc hero alternatif :

```
┌─────────────────────────────────────────────┐
│ Hero principal — Trouvez votre artisan      │
│ (inchangé)                                  │
├─────────────────────────────────────────────┤
│ [Bandeau dédié — nouveau bloc]              │
│ "Rénovation énergétique ?                   │
│  Estimez vos aides en 45 secondes"          │
│ [CTA primaire : Commencer ma simulation]    │
│ MaPrimeRénov' · CEE · Éco-PTZ · Coup Pouce │
└─────────────────────────────────────────────┘
```

Position : directement sous le hero search, avant les 60 money-page links. Prend ~180 px de hauteur desktop, 240 px mobile. Zero impact LCP (déjà server-rendered).

**P0 — Header global**

Ajouter un lien permanent dans `HeaderClient.tsx` :

```
[Logo] [Services] [Villes] [Estimez vos aides] [Mon compte]
                                    ↑ nouveau
```

Label court : "Estimez vos aides" (19 chars, compact sur mobile).

**P1 — Pages rénovation-related**

Injecter `<MiniSimulateurInline />` (composant existant) sur :

- Tous les `/guides/*` énergétique (déjà partiellement fait).
- `/services/chauffagiste/{ville}`, `/services/plombier/{ville}` (uniquement si service lié RGE).
- `/tarifs/chauffagiste/*`, `/tarifs/isolation/*`.
- Fiches artisan **RGE certifiés** (nouveau : détection via `rge_qualifications != null`).

**P2 — Exit path des pages énergétique**

Si l'utilisateur scrolle > 70 % sans cliquer CTA devis, proposer un scroll-nudge : "Pas encore décidé ? Estimez d'abord vos aides."

### 5.2 Optimisations internes du simulateur

**Réduire le step contact**

- Retirer 2 consentements sur 3 (garder uniquement RGPD légal obligatoire ; majorité et démarchage peuvent être inline-micro-copy sous le bouton submit).
- Demander téléphone seul en step contact. Email devient optionnel dans l'écran de confirmation post-submit (pattern Qonto).

**Ajouter "Recevez votre estimation par email"**

Au step teaser, proposer avant le formulaire contact :

> "Vous préférez réfléchir ? Envoyez-moi l'estimation par email."
> [Input email] [Envoyer]

Capture le lead tiède sans téléphone — logiquement routé vers un pipeline Pipedrive "nurture" (à créer), pas "commercial chaud".

**Ajouter sortie "Sauvegarder et reprendre"**

Utiliser localStorage (pattern déjà éprouvé dans `useDevisForm`). Un email minimal permet de renvoyer le lien "Reprenez votre simulation".

**Afficher un SLA numérique**

Sur le teaser : "**Un conseiller France Rénov' vous rappelle sous 2h**." (à valider contractuel).

---

## 6. A/B tests priorisés — grille ICE

**Légende ICE** : Impact (1-10) × Confidence (1-10) × Ease (1-10) = score. Durée : basée sur MDE 15-20 %, alpha 0,05, power 0,8, calcul via formulation conservative ; à un taux baseline de 0,7 %, la taille d'échantillon est grande — d'où priorité aux tests à fort MDE.

### Top 18 tests

| #   | Test                                                                                 | Hypothèse                                                                   | KPI primaire                         | KPI secondaire                     |            ICE | Durée estimée |
| --- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------- | -------------: | ------------- |
| T01 | Simulateur CTA homepage hero-adjacent                                                | +10 % sessions engagent simulateur, +3 % conversion globale (traffic shift) | `simulateur_started`                 | `devis_submitted` (toutes sources) | 10×9×9=**810** | 14j           |
| T02 | Passer email de step 2 obligatoire → step 3 optionnel                                | +25-35 % complétion form (Baymard)                                          | `devis_submitted / form_start`       | `devis_submitted / session`        | 10×9×8=**720** | 14j           |
| T03 | Step 1 combobox unique "Métier + Ville" vs 2 champs                                  | +15 % complétion step 1                                                     | `step1_completed / form_start`       | `devis_submitted / form_start`     |  9×7×7=**441** | 21j           |
| T04 | "X artisans actifs à {ville}" live counter sur hero devis                            | +10-18 % form_start                                                         | `form_start / session`               | `devis_submitted / form_start`     |  9×8×8=**576** | 14j           |
| T05 | SLA explicite "Devis sous 24h max" vs "Réponse rapide"                               | +8-12 % form_start                                                          | `form_start / session`               | `devis_submitted`                  |  8×8×9=**576** | 14j           |
| T06 | Consentement inline-micro-copy vs checkbox                                           | +15-20 % step 3 submit                                                      | `devis_submitted / step3_viewed`     | `devis_submitted / session`        |  9×7×7=**441** | 21j           |
| T07 | Exit intent : version "garder contact" (soft) vs "vous allez perdre" (loss aversion) | Test cohérent NN/g : soft > loss sur engagement long terme                  | `exit_modal_converted`               | Return visit rate J+7              |  7×6×8=**336** | 28j           |
| T08 | Header global : lien "Estimez vos aides"                                             | +200 % sessions simulateur                                                  | `simulateur_started`                 | `simulateur_submitted`             |  8×9×9=**648** | 14j           |
| T09 | Teaser simulateur "Recevez estimation par email"                                     | +10-15 % leads tièdes capturés                                              | `estimation_emailed / teaser_viewed` | `devis_submitted J+7`              |  7×7×8=**392** | 21j           |
| T10 | Fiche artisan : CTA "Devis sous 24h" vs "Devis en 2 min"                             | -20 % déception post-submit                                                 | `artisan_profile_view → form_start`  | `devis_submitted`                  | 8×7×10=**560** | 14j           |
| T11 | Fiche artisan non-revendiquée : ajout compteur "23 artisans similaires à 5 km"       | +15 % form_start (urgency non-pushy)                                        | `form_start / profile_view`          | `devis_submitted`                  |  7×7×9=**441** | 21j           |
| T12 | Tel: first sur pages `/urgence/*` (wtap-to-call primaire, devis secondaire)          | +30 % leads totaux (tel + devis) sur urgence                                | `phone_click + devis_submitted`      | `devis_submitted`                  |  9×8×9=**648** | 14j           |
| T13 | Témoignages géolocalisés dynamiques dans `DevisSidebar`                              | +5-10 % form_start                                                          | `form_start / session`               | `devis_submitted`                  |  6×6×7=**252** | 28j           |
| T14 | Consolidation step 2 + step 3 en 1 seul écran (compacté)                             | Hypothèse contre-intuitive : moins d'étapes perçues                         | `devis_submitted / form_start`       | Temps passé form                   |  7×5×6=**210** | 28j           |
| T15 | Bouton géolocalisation activé par défaut (avec permission prompt immédiat)           | +25 % remplissage ville auto                                                | `step1_completed / form_start`       | Taux erreur ville invalide         |  6×6×8=**288** | 21j           |
| T16 | Remplacer select service natif par Radix Combobox searchable                         | +10 % usability mobile + a11y                                               | `step1_completed / form_start`       | Erreurs a11y scan                  |  6×8×6=**288** | 21j           |
| T17 | Homepage : bloc `HomepageDevisInline` (form step 1 embarqué hero)                    | +20-30 % form_start home                                                    | `form_start / session (home)`        | `devis_submitted`                  |  8×6×5=**240** | 21j           |
| T18 | Pages `/guides/*` : bloc "Artisans RGE disponibles près de chez vous"                | +15 % cross-sell vers services/devis                                        | `services_page_view / guide_view`    | `devis_submitted`                  |  7×7×8=**392** | 21j           |

**Notes de rigueur statistique** :

- Sur le trafic actuel (2 113 users / 28j), T01-T02-T08 détectables en 14j avec MDE 20 %.
- Tests à faible impact (T13-T14) doivent attendre trafic post-fix-bailout (~10 000 users/mois) pour être statistiquement robustes.
- Tous les tests doivent utiliser un framework serveur (GrowthBook, PostHog feature flags — ce dernier est déjà intégré via `capture(EVENT.*)`), pas côté client seul (éviter flash of original content).
- **Guardrails communs** : pas de dégradation `phone_click` pour tests devis ; pas de dégradation a11y score Lighthouse < 95.

---

## 7. Roadmap UX 12 semaines — sprint par sprint

Chaque sprint = 2 semaines. Définition de "done" : code mergé, tests vitest passants, a11y scan Lighthouse >= 95, tracking event déployé, test A/B configuré dans PostHog.

### Sprint 1 (S1-S2) — Foundations funnel

**Objectif** : débloquer le top Pareto (fiche → devis, submit).

Livrables :

- **Instrumentation complète** du funnel GA4 + PostHog (événements `simulateur_started`, `simulateur_step_completed`, `artisan_profile_scroll_50`, `artisan_profile_scroll_100`).
- **T04** : live counter "X artisans actifs à {ville}".
- **T05** : SLA "Devis sous 24h max" en micro-copy.
- **T10** : re-label CTA fiche artisan "Devis sous 24h" (atom-level copy change).
- **Migration Zod unifiée** : `email` devient `.optional()` dans `devisSchema` — prépare T02.

Risques :

- Alignement avec équipe commerciale sur SLA 24h (contractuel). Si refus, fallback "Réponse rapide" mais ajouter compteur "48 devis envoyés aujourd'hui".

### Sprint 2 (S3-S4) — Email optionnel + step 3 consentement

Livrables :

- **T02** : email optionnel (feature flag PostHog). Déploiement ramp 10 % → 50 % → 100 % sur 2 semaines.
- **T06** : consentement inline micro-copy (CNIL-compliant : case prémarquée visible + micro-copy sous CTA).
- **Page confirmation `/devis` post-submit** : ajout "Recevez une copie par email (optionnel)".
- **Refonte visuelle step 3** : suppression visuelle du champ email, re-nomination CTA "Obtenir mon devis".

Risques :

- Perte qualité lead (email manquant). Mitigation : ajouter relance SMS J+1 avec CTA "Ajouter mon email pour recevoir la copie".

### Sprint 3 (S5-S6) — Simulateur visibility push

Livrables :

- **T01** : bloc simulateur homepage (design + dev).
- **T08** : lien header "Estimez vos aides".
- Intégration `<MiniSimulateurInline />` sur 50 guides + pages `/services/chauffagiste/*`, `/services/plombier/*`, `/services/menuisier/*` RGE.
- **T09** : option "Recevez estimation par email" sur teaser.

Risques :

- Cannibalisation du CTA devis primaire. Mitigation : A/B test pour mesurer impact combiné ; rollback si devis_submitted baisse > 10 %.

### Sprint 4 (S7-S8) — Mobile-first refinements

Livrables :

- **StickyMobileCTA** harmonisé : sur fiche artisan + pages devis. Ne s'affiche qu'à partir du scroll 30 %.
- **T03** : step 1 combobox unifié (progressive enhancement, fallback inchangé).
- **T12** : pages `/urgence/*` — CTA primaire `tel:`, secondaire `devis` (feature flag, segment = mobile).
- Mobile bottom nav audit (`MobileBottomNav` existe) — vérifier qu'il ne masque pas les CTA.

Risques :

- Règle non négociable : pas de numéro artisan DB. `tel:` sur `/urgence/*` renvoie vers un numéro central ServicesArtisans (à provisionner avec équipe ops — standard vocal + routing Pipedrive).

### Sprint 5 (S9-S10) — Trust & social proof

Livrables :

- **T11** : compteur "X artisans similaires à 5 km" sur fiche non revendiquée (requête Supabase avec `ST_Distance` sur `location` geography, déjà disponible).
- **T13** : témoignages géolocalisés dans `DevisSidebar` (query par région).
- Ajout logos institutionnels footer (ADEME, Anah, France Rénov' — valider partenariats). Si impossible, remplacer par badges "Données SIREN officielles" (trust signal validé par societe.com success).
- Audit RGE : tous les badges RGE visibles sur fiche top-fold quand `rge_qualifications` non null.

### Sprint 6 (S11-S12) — Simulateur funnel tuning + consolidation

Livrables :

- **T07** : exit intent refonte (soft vs loss aversion).
- **T17** : bloc devis inline homepage (test ambitieux).
- **T18** : bloc "Artisans RGE disponibles" sur pages `/guides/*`.
- Retrospective A/B tests : graver les winners en code stable, retirer les variants perdants.
- Audit final a11y WCAG 2.2 AA (cf. §10) + rapport board.

---

## 8. Métriques à suivre — 14 KPI instrumentés

Tous trackés via GA4 + PostHog. Dashboard hebdo. Alerting Slack sur seuil.

### Funnel primaire (5 KPI)

1. **`session_to_devis`** (global). Baseline 0,7 %. Cible S6 = 1,5 %, S12 = 3-5 %.
2. **`profile_view_to_form_start`** (fiche artisan). Baseline 7,3 %. Cible S6 = 12 %, S12 = 18-22 %.
3. **`form_start_to_submit`** (devis). Baseline 15,5 %. Cible S6 = 30 %, S12 = 40-50 %.
4. **`step_completion_rates`** (step 1, 2, 3 separately). Baseline step 1→2 = 68 %, step 2→3 = 82 %, step 3→submit = 30 %. Cibles : 85 %, 90 %, 65 %.
5. **`submit_to_qualified_lead`** (côté Pipedrive — qualifié si tel valide + conversation engagée < 24h). Baseline à mesurer, cible > 80 %.

### Simulateur (3 KPI)

6. **`session_to_simulateur_started`**. Baseline < 1 % (à instrumenter). Cible S3 = 8 %, S12 = 15 %.
7. **`simulateur_started_to_submitted`**. Baseline inconnu, à mesurer.
8. **`simulateur_to_devis_cross_conversion`**. Événement composite — user qui fait simulateur ET devis < 7j.

### Engagement (3 KPI)

9. **`time_on_form`** (médiane). Baseline à mesurer. Cible : < 120 s.
10. **`scroll_depth_artisan_profile`** médiane. Cible : > 70 %.
11. **`bounce_rate`** par template (home, services, urgence, devis). Cible : < 45 % (post-bailout fix).

### Web Vitals (3 KPI)

12. **LCP p75** par template. Cible : < 2,5s.
13. **INP p75**. Cible : < 200 ms.
14. **CLS p75**. Cible : < 0,1.

---

## 9. Mobile-first — considerations critiques

### 9.1 Context

- Google indexe le mobile (Mobile-First Indexing).
- 97,1 % des crawls Googlebot en mobile (cf. MP-01 crawl stats).
- 80 % des users artisans clients (estimation) arrivent en mobile (extrapolation segment ChatGPT + GA4 segment).

### 9.2 Contraintes dimensionnelles

- **Touch targets** >= 44×44 px (Apple HIG + WCAG 2.5.5). Audit : les chips sous-catégories `serviceSubcategories` font 36 px de haut sur mobile — **à corriger**.
- **Zoom involontaire** : tous les inputs utilisent `style={{ fontSize: '16px' }}` (pattern iOS). OK.
- **Safe area** : `env(safe-area-inset-bottom)` pour `StickyMobileCTA`. À vérifier en audit.
- **Clavier virtuel** : viewport resize gérée ; scroll auto vers input focusé (déjà implémenté dans `DevisForm` useEffect ligne 335).

### 9.3 Patterns mobile-first obligatoires

| Pattern                          | Règle                                                | Statut                                                                              |
| -------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Sticky CTA mobile                | Visible dès scroll 30 %, disparaît dans footer       | Existant (`StickyMobileCTA`) à auditer                                              |
| Bottom sheet pour form complexes | Prefer bottom sheet à modal centré (ergonomie pouce) | `DevisBottomSheet` existe — utiliser systématiquement sur mobile                    |
| One-thumb usability              | CTA primaire dans les 2/3 bas de l'écran             | A vérifier toutes les pages                                                         |
| Réduction `motion`               | `prefers-reduced-motion` respecté partout            | A auditer — `getTransitionClass()` dans DevisForm n'a pas de fallback réduit motion |

### 9.4 Performance mobile

- Budget JS initial < 170 kB gzipped sur mobile 4G. Le `StickerMobileCTA`, `ExitIntentPopup`, `SocialProofBanner`, `RecentSearches` sont correctement `dynamic({ ssr: false })` — bon.
- Images Unsplash utilisées dans `ClayHomePage` pour les CARD_BG_IMAGES et REVIEW_AVATARS : **à remplacer** par CDN maison ou à minima `next/image` avec `loader` custom + `sizes` strict + `priority={false}`.
- `next/font` pour Inter + Plus Jakarta Sans : OK (pas de FOUT/FOIT).

---

## 10. Accessibilité WCAG 2.2 AA — grille de conformité

Tests exécutés mentalement sur les principaux composants. À confirmer via Axe-core + audit manuel screen reader.

| Critère WCAG                    | Niveau   | Applicable à               |                                          Statut | Action                                                                                             |
| ------------------------------- | -------- | -------------------------- | ----------------------------------------------: | -------------------------------------------------------------------------------------------------- |
| 1.3.1 Info and Relationships    | A        | Tous                       |                                              OK | Labels associés, `aria-describedby` pour erreurs                                                   |
| 1.4.3 Contrast (Minimum)        | AA       | Tous textes                |                                      À vérifier | Audit contraste sur `text-charcoal-400` sur `bg-sand-50` (estimé 4,2:1 — limite)                   |
| 1.4.10 Reflow                   | AA       | Toutes pages               |                                              OK | `max-w-*` + responsive grids                                                                       |
| 1.4.11 Non-text Contrast        | AA       | Bordures input, focus ring |                                      À vérifier | `border-sand-300` sur `bg-sand-50` risque < 3:1                                                    |
| 1.4.12 Text Spacing             | AA       | Tous                       |                                              OK | `leading-relaxed` partout, pas de line-height < 1,5                                                |
| 2.1.1 Keyboard                  | A        | Form + nav                 |                                      À vérifier | Les chips sous-catégories sont `<button>` — OK. Les radios sr-only nécessitent re-focus sur label. |
| 2.1.2 No Keyboard Trap          | A        | Modals                     |                                              OK | `ExitIntentModal` gère Escape + focus trap                                                         |
| 2.4.3 Focus Order               | A        | Form                       |                                              OK | DOM order logique                                                                                  |
| 2.4.7 Focus Visible             | AA       | Tous                       | **NON conforme** sur radios label/input sr-only | Ajouter `peer-focus-visible:ring-2` sur wrapper label                                              |
| 2.4.11 Focus Not Obscured       | AA (2.2) | Sticky elements            |                                      À vérifier | Sticky mobile CTA ne doit pas masquer focused input                                                |
| 2.5.5 Target Size (Enhanced)    | AAA      | Tous CTA                   |                                     À améliorer | Chips sous-cat 36 px → porter à 44 px                                                              |
| 2.5.8 Target Size (Minimum)     | AA (2.2) | Tous CTA                   |                             Conforme si > 24 px | OK pour CTA principaux                                                                             |
| 3.2.2 On Input                  | A        | Form                       |                                              OK | Pas de submit automatique sur change                                                               |
| 3.3.1 Error Identification      | A        | Form                       |                                              OK | `role="alert"` + `aria-invalid`                                                                    |
| 3.3.3 Error Suggestion          | AA       | Form                       |                                              OK | Messages explicites ("Le numéro doit contenir 10 chiffres (ex : 06 12 34 56 78)")                  |
| 3.3.7 Redundant Entry           | A (2.2)  | Multi-step form            |                                              OK | Données mémorisées via localStorage                                                                |
| 3.3.8 Accessible Authentication | AA (2.2) | Auth                       |                                       À auditer | Hors scope devis, mais à vérifier login artisan                                                    |
| 4.1.2 Name, Role, Value         | A        | Tous composants custom     |                                              OK | Radix = conforme par design                                                                        |
| 4.1.3 Status Messages           | AA       | Toasts                     |                                              OK | `role="status"` + `aria-live`                                                                      |

**Priorités correctifs** :

1. Focus ring visible sur radios "urgence" et "budget" (WCAG 2.4.7).
2. Contraste `border-sand-300 / bg-sand-50` (WCAG 1.4.11).
3. Target size chips 44 px (WCAG 2.5.5 + recommandation Apple).

**RTL readiness** : le site est actuellement mono-langue FR. Les classes Tailwind n'utilisent pas `ltr:`/`rtl:`. Pas bloquant, mais limite internationalisation future (pas dans le scope 12 semaines).

---

## 11. Règles business non négociables — rappel et contrôles intégrés

Tous les composants de cette refonte sont validés contre :

| Règle                                            | Contrôle                                                 | Point de garde                                                                                                                        |
| ------------------------------------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Pas de chatbot**                               | Aucun widget de type Intercom, Crisp, Zendesk            | Vérifié : pas d'import. Statut maintenu.                                                                                              |
| **Pas de numéro DB artisan sur page publique**   | Fiches non revendiquées n'exposent pas `providers.phone` | `UnclaimedSidebarCTA` / `UnclaimedInlineDevis` vérifiés. Le CTA `tel:` sur `/urgence/*` route vers un numéro central (à provisionner) |
| **Pas de CTA devis sur fiches non revendiquées** | Seul le CTA "Devis via ServicesArtisans" est autorisé    | Respect confirmé dans `UnclaimedQuoteWizard`                                                                                          |
| **Lead exclusif**                                | 1 lead = 1 artisan — jamais partagé                      | Contrôlé côté Pipedrive ; pas d'impact UX                                                                                             |
| **Accents français**                             | Aucun remplacement apostrophe droite en encoded          | Maintenir en code review                                                                                                              |

---

## 12. Risques et plans de mitigation

| Risque                                                | Probabilité | Impact | Mitigation                                                                                                 |
| ----------------------------------------------------- | ----------- | ------ | ---------------------------------------------------------------------------------------------------------- |
| T02 (email optionnel) dégrade qualité lead commercial | Moyenne     | Fort   | Rampe 10→50→100 %, monitor pipe qualif J+1 ; fallback = rendre email semi-obligatoire avec case prémarquée |
| Fix bailout SSR (MP-01) retardé — A/B tests bruités   | Élevée      | Moyen  | Sur-pondérer MDE (25 % au lieu de 20 %) le temps du fix                                                    |
| Exit intent dégrade expérience perçue (UGC négatif)   | Faible      | Moyen  | Ajouter feedback "Trop intrusif" dans le modal ; triage hebdo                                              |
| Simulateur cannibalise CTA devis                      | Moyenne     | Fort   | T01 monitor devis_submitted global : rollback si -10 %                                                     |
| Équipe commerciale refuse SLA 24h                     | Moyenne     | Fort   | Plan B = "48h" + compteur temps réel                                                                       |
| Refonte step 1 combobox casse a11y                    | Moyenne     | Fort   | Radix Combobox pattern a11y-ready ; tests Axe-core en CI                                                   |
| Changements CNIL sur soft opt-in consentement         | Faible      | Fort   | Veille réglementaire ; plan de repli = checkbox obligatoire visible                                        |
| Charge back-end Pipedrive sur augmentation volume     | Moyenne     | Moyen  | Load test ; plan scale = ajouter worker queue si > 50 leads/heure                                          |

---

## 13. Estimations ROI — passage 0,7 % → 3-5 %

Calcul conservateur fondé sur les données GA4 / Ahrefs et les conversions attendues après fix bailout (MP-01).

### Scénarios

| Scénario                                          | Hypothèse trafic S12 | Conv rate S12 | Leads / mois | Leads cumulés 12 sem |
| ------------------------------------------------- | -------------------: | ------------: | -----------: | -------------------: |
| Conservative (fix partiel + T01-T08 réussis)      |     5 000 users/mois |         1,8 % |           90 |                  500 |
| Median (fix complet + 12 tests top-10 réussis)    |    20 000 users/mois |         3,0 % |          600 |                2 100 |
| Optimiste (fix + 18 tests + simulateur décollage) |    50 000 users/mois |         4,5 % |        2 250 |                6 500 |

**Référence** : la cible MP-01 était "150 devis/mois à 12 semaines" (KPI plan SEO). Ce plan produit vise, sans nouveau trafic additionnel, à **doubler cette cible** via la seule conversion.

### Dépendances

- **Dépendance forte MP-01** : fix bailout SSR. Sans lui, tests 20 % plus longs à conclure ; conversion rate plafonnée ~1,5 %.
- **Dépendance moyenne MP-03** (contenu, non écrit ici) : si pas de pages `/urgence/*` additionnelles, T12 borne l'upside.
- **Dépendance faible MP-04** (link building) : pas bloquant sur ce plan.

---

## 14. Annexes — décisions de design

### A. Pourquoi 3 étapes de form et pas 1 seule

Littérature CXL + Baymard : le multi-step form mobilise l'effet de commitment de Cialdini (step 1 = petit oui, step 3 = engagement total). Les tests Growth Rock et Databox montrent +86 % de conversion multi-step vs one-page sur formulaires > 4 champs. **Décision** : maintenir 3 étapes. Ne pas tester T14 avant d'avoir stabilisé T02 et T03.

### B. Pourquoi pas de chatbot

Règle non négociable projet. Raisonnement produit complémentaire : sur un marché où 75 % de l'intent est local et 87 % transactional, la friction "discuter avec un bot" casse le flow d'intention. Les tests CXL montrent des conversions inférieures de 15-30 % sur B2C transactionnel quand un chatbot intrusif est présent. Un callback request humain (`CallbackRequest` existe) est autorisé et préférable.

### C. Pourquoi l'exit intent reste (malgré NN/g)

NN/g déconseille les popups intrusifs. Notre `ExitIntentModal` actuel respecte 3 des 5 conditions éthiques :

- Contexte pertinent (draft sauvegardé).
- Alternative claire (fermer sans dark pattern).
- Une fois par session.

Nous améliorons avec T07 (version "soft"). Si T07 montre engagement négatif J+7, on retire le composant.

### D. Pourquoi ne pas toucher à la recherche hero

`ClayHeroSearch` est propre et convertit sainement (62,8 % vers profile_view). Ne pas casser ce qui marche (principe de Chesterton fence). La refonte concerne le tronçon profile_view → submit où est le gros du drop-off.

### E. Pourquoi le simulateur reste sur sa propre route

Garder `/simulateur-aides-renovation` séparé du funnel devis permet :

- SEO distinct (pos 26 sur "ma prime renov 2026" à amplifier).
- Attribution propre (Pipedrive pipeline dédié).
- Funnel indépendant sans cannibaliser le devis artisan.

Mais l'**entrée** se multiplie (homepage, header, guides, pages énergétique) pour capter les 300-500K vol/mois de la niche rénovation énergétique (cf. MP-03 rénovation énergétique).

### F. Pourquoi pas de redesign complet homepage

L'audit `ClayHomePage.tsx` révèle un code structuré, performant, testé. Les tests existants (aggregateRating schema, trust bar, review carousel) sont des assets. Un redesign total = 4 sprints perdus en itération visuelle. **Décision** : intervention chirurgicale — ajouter le bloc simulateur (T01), instrumenter, mesurer.

---

## 15. Livrables et contrats — réponse au board

**Contrats** :

1. **KPI primaire S4** : `form_start_to_submit` >= 22 % (baseline 15,5 %).
2. **KPI primaire S8** : `profile_view_to_form_start` >= 12 % (baseline 7,3 %).
3. **KPI primaire S12** : `session_to_devis` >= 3 % (baseline 0,7 %).

**Guardrails sur lesquels on ne bouge pas** :

- A11y Lighthouse score >= 95 sur toutes les pages clés.
- LCP p75 < 2,5s (dépend MP-01).
- Aucun hit sur les règles non négociables (chatbot, tel artisan, CTA non-revendiqué).

**Investissements demandés** :

- 1 Product Designer FTE sur 12 semaines (maquettes Figma, tests user, QA visuel).
- 1,5 Frontend Engineer FTE sur 12 semaines (implémentation, tests, instrumentation).
- Abonnement PostHog tier suffisant pour feature flags + experiments (ou équivalent GrowthBook Cloud).
- Budget production contenu : 3 photos conseillers pro, validation micro-copy légal (CNIL check), logo ADEME/Anah partenariat (si obtenable — sinon mockup trust équivalent).

**Signal de succès minimum** : à S4, au moins 3 tests sur 5 prioritaires (T01, T02, T04, T05, T10) sont gagnants à p < 0,05. Si pas le cas, revue stratégique S4 → ajustement scope S5-S12.

---

**Fin MASTER-PLAN-02-PRODUCT.md**

> Ce document est conçu pour être exécuté tel quel. Toute modification substantielle doit être versionnée (MASTER-PLAN-02-PRODUCT-v2.md) et passer par une revue VP Product + CEO.
