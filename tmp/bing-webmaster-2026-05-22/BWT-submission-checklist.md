# Bing Webmaster Tools — Checklist soumission (2026-05-22)

Pourquoi maintenant : **Bing = backend ChatGPT search**. Sans Bing indexé,
ServicesArtisans n'apparaît jamais dans les citations LLM (ChatGPT, Copilot, Perplexity
en partie). Google ≠ suffisant pour GEO/AEO.

Site : `https://servicesartisans.fr`
Property type : **URL prefix** (apex sans www).
IndexNow déjà configuré : clé `d438ef72ba5465680fecf42737f316b4` à la racine
(`public/d438ef72ba5465680fecf42737f316b4.txt`), vérifiée en prod.

---

## 1. Créer le compte Bing Webmaster Tools

1. Aller sur https://www.bing.com/webmasters
2. Sign in avec un compte Microsoft, Google, ou Facebook.
   - **Recommandation** : utiliser le même Google que GSC pour permettre
     l'import automatique (étape 2). Le compte ServicesArtisans utilisé pour
     GSC fonctionne.
3. Accepter les TOS (gratuit, aucun engagement, aucune carte bancaire).

## 2. Ajouter la propriété

Deux chemins possibles. Préférer (A) qui est instantané.

### (A) Import depuis Google Search Console (recommandé)

1. Sur le dashboard BWT, cliquer **Import from GSC**.
2. Autoriser BWT à lire les properties GSC du compte connecté.
3. Sélectionner `https://servicesartisans.fr/` dans la liste.
4. Import auto :
   - Propriété vérifiée immédiatement (BWT trust GSC).
   - Sitemaps GSC importés.
   - Pas de DNS / meta tag / fichier à uploader.

### (B) Ajouter manuellement (fallback)

Si l'import GSC échoue :

1. Cliquer **Add a site** → entrer `https://servicesartisans.fr`
2. Choisir une méthode de vérification (les 3 marchent, par ordre de préférence) :
   - **Fichier XML** : télécharger `BingSiteAuth.xml` fourni par BWT, le placer
     dans `public/BingSiteAuth.xml`, commiter, déployer Vercel. URL attendue :
     `https://servicesartisans.fr/BingSiteAuth.xml`.
   - **Meta tag** : injecter `<meta name="msvalidate.01" content="..." />` dans
     `<head>` de `src/app/layout.tsx`. Voir `BWT-verification-meta-tag.md`.
   - **DNS TXT** : ajouter un record TXT chez le registrar
     (`@ IN TXT "..."`). Propagation 1-48h.

## 3. Vérifier IndexNow (déjà actif)

BWT > **Sitemaps & Indexation** > **IndexNow**

1. La clé `d438ef72ba5465680fecf42737f316b4` doit déjà apparaître comme "verified"
   (Bing crawle `https://servicesartisans.fr/d438ef72ba5465680fecf42737f316b4.txt`
   tous les jours).
2. Voir le compteur "URLs submitted via IndexNow" — doit afficher ~2500/jour
   depuis l'activation du cron `indexnow-submit` (path `15 6 * * *`).
3. Avec le nouveau cron `indexnow-batch` (cf. cette PR), le débit montera à
   ~3500/jour combinés.

## 4. Soumettre le sitemap

Voir `BWT-sitemap-submission-checklist.md` pour détail.

URL à soumettre : `https://servicesartisans.fr/sitemap.xml`

BWT > **Sitemaps** > **Submit sitemap** → coller l'URL → Submit.

Le sitemap index pointe vers ~30+ sub-sitemaps (sharding tiered). Bing va
les découvrir automatiquement.

## 5. URL Submission manuelle (optionnel, max 100/jour gratuit)

Pour pages critiques nouvellement publiées qui doivent ranker vite :

BWT > **URL Submission** > Submit URLs (max 100/jour, 1000/mois)

Cibles prioritaires (Sprint 1+3+5 rénovation) :

```
https://servicesartisans.fr/renovation-energetique/travaux/vmc
https://servicesartisans.fr/renovation-energetique/travaux/ballon-thermodynamique/prix
https://servicesartisans.fr/renovation-energetique/travaux/ballon-thermodynamique/installation
https://servicesartisans.fr/barometre/renovation-energetique-2026
https://servicesartisans.fr/simulateur-aides-renovation
https://servicesartisans.fr/aides
https://servicesartisans.fr/comparatif-primes-cee-2026
https://servicesartisans.fr/rge/qualifications
https://servicesartisans.fr/cee/mandataire-vs-direct
https://servicesartisans.fr/maprimerenov-cumulaison-cee
```

Garde 90 slots pour URLs nouvelles ad-hoc semaine suivante.

## 6. Réglages recommandés

BWT > **Configure My Site** :

- **Crawl Control** : laisser sur "Bing decides" (default). Ne pas throttle.
- **Geographic targeting** : France (option > Pays cible).
- **Disavow Links** : reporter les disavow Google ici aussi (rebooter
  ~72 backlinks spam déjà disavowed côté Google selon memory
  `servicesartisans-ahrefs-benchmark-2026-04-30.md`). Format : .txt direct,
  pas .csv.

## 7. Monitoring hebdo (Marvin)

Une fois actif, vérifier chaque lundi :

- **Indexed pages** count (cible M+1 : 5000+, M+3 : 30K+).
- **Search Performance** > clicks et impressions (cible M+3 : 50/jour).
- **Crawl errors** (404 doivent être <5%, sinon investiger).
- **Backlinks** count (cohérent avec Ahrefs ±20%).

## 8. Bonus GEO/AEO

BWT publie un endpoint **ChatGPT search bot crawl stats** (depuis 2026-Q1).
Voir BWT > **Reports** > **Bot Traffic** > filtrer sur `bingbot` et
`OAI-SearchBot`. Sert à mesurer l'impact GEO direct.

---

## Acceptance criteria

- [ ] Compte BWT créé
- [ ] Propriété `https://servicesartisans.fr` vérifiée
- [ ] Sitemap soumis (status "Success")
- [ ] IndexNow visible dans le dashboard avec clé verified
- [ ] Geographic targeting = France
- [ ] (Optionnel) 10-100 URLs prioritaires soumises manuellement
- [ ] Disavow file uploadé (reprendre celui de GSC)

Tâche estimée : 20-30 minutes one-shot. Ensuite passif, juste monitoring hebdo.
