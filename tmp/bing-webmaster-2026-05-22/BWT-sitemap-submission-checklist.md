# BWT — Soumission sitemap.xml

URL canonique : `https://servicesartisans.fr/sitemap.xml`

C'est un **sitemap index** Next.js qui pointe vers ~30+ sub-sitemaps shardés
(742K URLs en tout, sub-sitemaps de ~50K URLs chacun).

## Étapes BWT

1. Dashboard BWT > **Sitemaps** (menu gauche).
2. Cliquer **Submit sitemap**.
3. Coller exactement : `https://servicesartisans.fr/sitemap.xml`
4. Cliquer **Submit**.

Status attendu sous 24-48h :

- **Status** : Success
- **URLs submitted** : 740K+ (Bing peut prendre 7-14 jours pour traverser tout)
- **Last crawled** : recent timestamp
- **Last read** : recent timestamp

## Sub-sitemaps découverts automatiquement

BWT va lire `sitemap.xml` puis fetcher chaque `<sitemap><loc>` listé.
Pas besoin de les soumettre individuellement.

Liste (extraite de `src/app/sitemap.ts:generateSitemaps`) :

- `/sitemap/0.xml` — pages statiques (~30 URLs)
- `/sitemap/1.xml` ... `/sitemap/N.xml` — service × ville (tier 1+2)
- `/sitemap/aides.xml` — aides MaPrimeRénov' (~50)
- `/sitemap/rge.xml` — pages RGE
- `/sitemap/cee.xml` — pages CEE
- ... etc

## Cas d'erreur possibles

### "Could not download sitemap"

Causes :

- DNS / résolution domaine (rare, le site répond 200 partout).
- 5xx temporaire (vérifier Vercel logs sur la fonction sitemap).

Fix : refresh BWT après 30 min.

### "Sitemap too large"

Bing limite à 50K URLs / sitemap. Le sharding Next.js respecte ça.

### "URLs not indexed yet"

Normal. Bing indexe ~5-15% du sitemap initialement, plus avec autorité grandissante.

## Cohérence GSC ↔ BWT

Pour suivre la dispersion :

| Metric      | GSC             | BWT  | Cible M+3  |
| ----------- | --------------- | ---- | ---------- |
| Submitted   | 740K            | 740K | 740K       |
| Indexed     | 459K (mai 2026) | tbd  | 350K (BWT) |
| Coverage    | 62%             | tbd  | 47% (BWT)  |
| Clicks/jour | 350             | tbd  | 50 (BWT)   |

Bing rend en général ~30-50% du volume Google sur niches FR mature.

## Submission supplémentaire (optionnel)

Pages avec audience cible Bing/Copilot/ChatGPT pouvant ranker vite :

- `https://servicesartisans.fr/barometre/renovation-energetique-2026`
  — Sprint 5 baromètre, données CC-BY 4.0 (Schema.org Dataset)
- `https://servicesartisans.fr/api/v1/barometre/renovation/embed.html`
  — endpoint embed pour médias

Ces 2 URLs sont déjà poussées par IndexNow + cron. Une soumission manuelle BWT
("URL Submission") accélère encore (généralement crawl dans les 24h vs 48h via IndexNow).
