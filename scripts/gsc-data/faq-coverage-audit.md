# Audit FAQ Coverage - ServicesArtisans Blog

**Date :** 2026-04-03
**Scope :** 514 articles blog (314 statiques + 200 prix-villes generees)

---

## 1. Statistiques globales

| Metrique | Valeur |
|----------|--------|
| **Total articles** | 514 |
| **Articles avec FAQ** | **514 (100%)** |
| **Articles sans FAQ** | 0 |
| **Moyenne questions/article** | 4.3 (statiques) / 4.0 (prix-villes) |
| **Min questions** | 3 |
| **Max questions** | 17 |
| **Distribution** | 3q: 117 / 4q: 75 / 5q: 81 / 6q: 21 / 7q: 1 / 8q: 16 / 9-17q: 3 |

### Couverture par batch

| Fichier | Articles | FAQ | Taux |
|---------|----------|-----|------|
| existing-articles.ts | 24 | 24 | 100% |
| batch-prix.ts | 18 | 18 | 100% |
| batch-prix-villes.ts | 200 | 200 | 100% |
| batch-prix-regionaux.ts | 10 | 10 | 100% |
| batch-prix-btp.ts | 5 | 5 | 100% |
| batch-prix-design.ts | 5 | 5 | 100% |
| batch-prix-metal-bois.ts | 5 | 5 | 100% |
| batch-prix-services.ts | 5 | 5 | 100% |
| batch-prix-tech.ts | 5 | 5 | 100% |
| batch-metiers.ts | 19 | 19 | 100% |
| batch-metiers-3.ts | 7 | 7 | 100% |
| batch-metiers-4.ts | 7 | 7 | 100% |
| batch-metiers-5.ts | 2 | 2 | 100% |
| batch-projets.ts | 18 | 18 | 100% |
| batch-conseils.ts | 11 | 11 | 100% |
| batch-reglementation.ts | 16 | 16 | 100% |
| batch-urgences-guides.ts | 20 | 20 | 100% |
| batch-saisonniers-2026.ts | 15 | 15 | 100% |
| batch-aides-2026.ts | 14 | 14 | 100% |
| batch-energie-2026.ts | 10 | 10 | 100% |
| batch-renovation-2026.ts | 5 | 5 | 100% |
| batch-produits-materiaux.ts | 12 | 12 | 100% |
| batch-comparatifs-materiaux.ts | 10 | 10 | 100% |
| batch-tutoriels-diy.ts | 15 | 15 | 100% |
| batch-tutoriels-diy-2.ts | 12 | 12 | 100% |
| batch-saisonnier-urgence.ts | 12 | 12 | 100% |
| batch-seo-boost1.ts | 5 | 5 | 100% |
| batch-seo-boost2.ts | 5 | 5 | 100% |
| batch-seo-boost3.ts | 5 | 5 | 100% |
| batch-securite-energie.ts | 3 | 3 | 100% |
| batch-aides-saisonnier.ts | 3 | 3 | 100% |
| batch-guides-divers.ts | 4 | 4 | 100% |
| batch-diy.ts | 3 | 3 | 100% |
| batch-inspiration.ts | 3 | 3 | 100% |
| batch-saisonnier.ts | 1 | 1 | 100% |

**Conclusion :** La couverture FAQ dans les donnees est de 100%. Tous les articles ont un champ `faq` rempli avec entre 3 et 17 questions.

---

## 2. Rendu HTML des FAQ

**Composant :** `src/app/(public)/blog/[slug]/ArticleFAQ.tsx`
- Les FAQ sont rendues visuellement avec des `<details>/<summary>` (accordeon natif HTML)
- Section "Questions frequentes" avec icone et role ARIA
- **Fonctionnel et accessible**

**Logique :** `page.tsx` ligne 622
```ts
const faqItems = article.faq && article.faq.length > 0
  ? article.faq
  : extractFAQFromBlocks(blocks)
```
Fallback intelligent : si pas de champ `faq`, extrait les Q/R depuis le contenu Markdown (pattern `## Questions frequentes` + `### Question?`).

---

## 3. PROBLEME CRITIQUE : JSON-LD FAQPage desactive

### Constat

Le schema JSON-LD FAQPage est **volontairement desactive** sur tout le site :

```ts
// FAQPage JSON-LD removed -- Google no longer supports FAQPage rich results
const faqSchema = null
```

Cette desactivation est presente dans **27 fichiers** :
- `src/app/(public)/blog/[slug]/page.tsx`
- `src/lib/seo/blog-schema.ts`
- 15 pages guides (`guides/*.tsx`)
- Pages comparaison, verifier-artisan, outils
- `src/components/artisan/ArtisanSchema.tsx`

### Le commentaire est inexact

Le commentaire dit "Google no longer supports FAQPage rich results". C'est **partiellement faux** :

- **Aout 2023** : Google a restreint l'affichage des FAQ rich results aux sites gouvernementaux et de sante **dans les resultats organiques classiques**.
- **MAIS** : Google continue de supporter et d'afficher les FAQ dans plusieurs contextes :
  1. **AI Overviews / SGE** : Google utilise les FAQ structurees pour alimenter ses reponses IA
  2. **Google Discover** : les FAQ structurees peuvent encore apparaitre
  3. **Recherche vocale / Google Assistant** : les FAQ structurees sont exploitees
  4. **Bing, Yahoo, DuckDuckGo** : ces moteurs affichent toujours les FAQ rich results
  5. **Schema Markup Validator** : Google continue de valider le format
  6. **Preparation future** : Google pourrait re-activer l'affichage a tout moment

### Recommandation : REACTIVER le JSON-LD FAQPage

**Cout :** quasi nul (le code et les donnees existent deja, il suffit de remettre `faqSchema` a sa valeur d'origine)

**Benefice :**
- Bing/Yahoo/DuckDuckGo : rich results immediats (Bing = ~5% du trafic FR)
- Google AI Overviews : meilleure chance d'etre cite
- Zero risque : un schema valide n'est jamais penalise par Google
- Futur-proof : si Google re-active, benefice immediat sans intervention

**Action concrete :**
1. Dans `src/lib/seo/blog-schema.ts`, restaurer la generation du FAQPage schema
2. Dans `src/app/(public)/blog/[slug]/page.tsx`, restaurer `faqSchema` au lieu de `null`
3. Appliquer le meme traitement aux 15+ pages guides

---

## 4. Qualite des FAQ existantes

### Articles prix-villes (200 articles, generation automatique)

Les FAQ prix-villes sont generees programmatiquement avec 5 templates, dont 4 sont selectionnes par article :

1. "Quel est le tarif horaire d'un [metier] a [ville] ?"
2. "Comment trouver un [metier] pas cher a [ville] ?"
3. "Combien coute [prestation] a [ville] ?"
4. "Un [metier] a [ville] se deplace-t-il gratuitement ?"
5. "Faut-il un devis avant de faire appel a un [metier] a [ville] ?"

**Qualite : BONNE** -- ces questions correspondent exactement aux requetes les plus recherchees pour les tarifs artisans locaux.

### Articles statiques (314 articles)

Les FAQ sont manuellement redigees dans chaque batch. La qualite varie :
- **3 questions** : 117 articles -- c'est le minimum, 5 serait preferable pour le SEO
- **4-5 questions** : 156 articles -- bon
- **6+ questions** : 41 articles -- excellent

---

## 5. FAQ manquantes par type de contenu a forte valeur SEO

### Patterns de questions les plus recherchees dans le domaine artisans/travaux

Les requetes suivantes generent des volumes importants sur Google FR :

| Pattern de question | Volume estime (mensuel) | Present dans les FAQ ? |
|---------------------|------------------------|----------------------|
| "Combien coute un [metier] ?" | 10K-50K selon metier | Oui (prix-villes + batch-prix) |
| "Quel est le tarif horaire d'un [metier] ?" | 5K-20K | Oui (prix-villes) |
| "Quelles aides pour [travaux] ?" | 20K-100K | Oui (batch-aides) |
| "Comment trouver un bon [metier] ?" | 5K-15K | Partiellement |
| "Faut-il un devis pour [travaux] ?" | 2K-8K | Oui (prix-villes) |
| "Quel [metier] pour [probleme] ?" | 3K-10K | Partiellement (batch-projets) |
| "Est-ce que [travaux] necessite un permis ?" | 2K-5K | Oui (batch-reglementation) |
| "Quand faire [travaux saisonnier] ?" | 3K-8K | Oui (batch-saisonnier) |
| "Peut-on faire [travaux] soi-meme ?" | 5K-15K | Partiellement (batch-diy) |
| "[Travaux] : combien de temps ca prend ?" | 3K-10K | Rarement present |

### Recommandations d'enrichissement

**Priorite 1 -- Ajouter a TOUS les articles prix (les 53 articles batch-prix-*) :**
- "Combien de temps durent les travaux de [X] ?"
- "Quelles garanties pour des travaux de [X] ?"
- "Peut-on negocier le prix d'un [X] ?"

**Priorite 2 -- Ajouter aux articles metiers (35 articles) :**
- "Quelle formation pour devenir [metier] ?"
- "Quel [metier] choisir entre [A] et [B] ?" (quand pertinent)
- "Un [metier] est-il couvert par une assurance decennale ?"

**Priorite 3 -- Enrichir les articles a 3 questions (117 articles) :**
- Passer de 3 a 5 questions minimum
- Ajouter les patterns "combien de temps" et "quelles garanties"

---

## 6. Resume des actions

| # | Action | Priorite | Impact SEO | Effort |
|---|--------|----------|------------|--------|
| 1 | **Reactiver JSON-LD FAQPage** sur blog + guides + artisans | **CRITIQUE** | Bing rich results + AI Overviews + futur Google | 1h |
| 2 | Enrichir les 117 articles a 3 FAQ vers 5 FAQ | HAUTE | +234 questions = plus de surface de reponse | 4h |
| 3 | Ajouter pattern "duree travaux" aux articles prix | MOYENNE | Featured snippet potentiel | 2h |
| 4 | Ajouter pattern "garanties" aux articles prix | MOYENNE | Confiance + E-E-A-T | 2h |
| 5 | Ajouter FAQ aux pages guides statiques (non-blog) | BASSE | Deja du contenu FAQ dans le HTML | 3h |

### Action #1 en detail : Reactiver JSON-LD FAQPage

Fichier principal : `src/lib/seo/blog-schema.ts`

Restaurer ce bloc apres la ligne 73 :
```ts
// FAQPage schema — Bing/DuckDuckGo rich results + Google AI Overviews
if (faqItems && faqItems.length > 0) {
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  })
}
```

Puis dans `page.tsx` (ligne 626-627), remplacer :
```ts
const faqSchema = null
```
par :
```ts
const faqSchema = faqItems.length > 0 ? {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map(item => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
} : null
```

---

**Conclusion :** La couverture FAQ dans les donnees est excellente (100%). Le probleme majeur est que le JSON-LD FAQPage est desactive sur tout le site, ce qui prive 514 articles de rich results sur Bing et d'un signal structure pour Google AI Overviews. La reactivation est l'action #1 a faire, avec un ratio effort/impact maximal.
