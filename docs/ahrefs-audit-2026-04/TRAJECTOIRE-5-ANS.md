# Trajectoire 5 ans ServicesArtisans — Ahrefs Premium

**Généré le** : 2026-04-18
**Sources** :

- `servicesartisans.fr-perf-subdomains_year5_dai_*.csv` (1 827 jours)
- `servicesartisans.fr_perf_*.csv` (134 mois)
- `servicesartisans.fr-organic-keywords-history_*.csv` (184 jours + 7 mois)

## Timeline complète

### Phase 0 — Domaine parked (2015-2023)

Domaine enregistré en juin 2015, inactif jusqu'en 2023.

- 2015-2017 : 0 activité
- 2017-08 à 2018-07 : 1 referring domain (premier signal)
- 2018-08 à 2019-09 : embryon, 1-12 KW en position 51+, 0 traffic
- 2019-10 à 2023-07 : **silence total 4 ans**

### Phase 1 — Premier déploiement v1 (2023-08 → 2025-09)

| Mois        | RD     | KW     | Traffic        |
| ----------- | ------ | ------ | -------------- |
| 2023-08     | 0      | 1      | 0              |
| 2024-12     | 0      | 4      | 0              |
| 2025-01     | 4      | 8      | 3              |
| 2025-07     | 25     | 19     | 2              |
| 2025-08     | 26     | 35     | 3              |
| **2025-09** | **27** | **23** | **3** (pic v1) |

Croissance organique lente. Jamais décollé au-dessus de 35 KW.

### Phase 2 — BLACKOUT (2025-10 → 2026-01)

| Mois    | RD     | KW    | Traffic | État                    |
| ------- | ------ | ----- | ------- | ----------------------- |
| 2025-10 | 29     | 3     | 1       | Chute brutale           |
| 2025-11 | 30     | **0** | 1       | 🔴 Offline              |
| 2025-12 | 38     | **0** | 1       | 🔴 Offline              |
| 2026-01 | **49** | **0** | 1       | 🔴 Offline mais RD peak |

**4 mois consécutifs à 0 keywords**. Site désindexé ou redirect global. Les referring domains ont continué de monter (+20 RD en 4 mois) → d'autres sites linkent toujours vers servicesartisans.fr, probablement via robots qui automatisent des PBN.

### Phase 3 — Relaunch v2 (2026-02 → présent)

| Mois                      | RD  | KW      | Traffic | Growth                  |
| ------------------------- | --- | ------- | ------- | ----------------------- |
| 2026-02 (lancement 07/02) | 45  | 7       | 1       | Redémarrage             |
| 2026-03                   | 40  | 113     | 52      | **x16 KW, x52 traffic** |
| 2026-04                   | 45  | **185** | **164** | **x1,6 vs mars**        |

**Progression quotidienne avril 2026** :

- 2026-04-09 : 162 pages ranking, 136 traffic
- 2026-04-18 : 170 pages ranking, 164 traffic
- **+20 % trafic en 10 jours**, tendance haussière

## Analyse par type de positions (avril 2026)

| Position | KW  | %    |
| -------- | --- | ---- |
| 1-3      | 22  | 12 % |
| 4-10     | 93  | 50 % |
| 11-20    | 34  | 18 % |
| 21-50    | 11  | 6 %  |
| 51+      | 25  | 14 % |

**62 % des KW en top 10** — excellent pour un site de 71 jours.

## Analyse par intent (avril 2026)

| Intent            | Traffic | %           |
| ----------------- | ------- | ----------- |
| **Transactional** | 140     | **87 %** 🎯 |
| Informational     | 80      | 50 %        |
| Navigational      | 37      | 23 %        |
| Commercial        | 6       | 4 %         |
| Local             | 6       | 4 %         |
| Branded           | 6       | 4 %         |

**87 % transactional** = trafic avec intention d'achat forte. Maximum de conversion possible si on débloque le funnel.

**4 % branded** = aucune notoriété de marque. Normal.

## Evolution des referring domains

| Mois    | RD     | Δ            |
| ------- | ------ | ------------ |
| 2025-07 | 25     | —            |
| 2025-10 | 29     | +4           |
| 2025-11 | 30     | +1           |
| 2025-12 | 38     | +8           |
| 2026-01 | **49** | +11 (peak)   |
| 2026-02 | 45     | **-4**       |
| 2026-03 | 40     | **-5** (low) |
| 2026-04 | 45     | +5           |

**-9 RD entre janvier et mars 2026** = backlinks SPAM qui se désactivent naturellement (PBN qui meurent). Cohérent avec les 78 % SPAM identifiés dans l'audit.

## Implications stratégiques

### Ce qui est prouvé factuellement

1. **Site en croissance explosive** — KW x26 (7→185) et trafic x164 (1→164) en 2 mois
2. **Blackout v1 réel** — 4 mois consécutifs à 0 KW (Nov 2025 → Jan 2026)
3. **Intent transactional dominant** — 87 % du trafic = intention d'achat
4. **Perte RD cohérente avec SPAM** — -9 RD Q1 2026 = attrition naturelle PBN

### Ce qui n'est PAS prouvé par ces exports

1. **Le "maillage 1M → 200K liens internes"** — aucune trace dans Ahrefs perf/KW
   - Nécessite export spécifique : Site Explorer > Internal Backlinks > Historical
   - Ou : rapport GSC Liens internes (snapshot dans le temps)

2. **La date exacte où le maillage a chuté** — faute de baseline

3. **L'impact quantifié du bailout SSR sur les rankings** — il faudrait A/B test

### Ce qui change le récit

**Avant** : "Site en crise, urgent, bailout SSR catastrophique, maillage détruit"
**Après** : "Site jeune en croissance x7, bailout SSR = plafond de croissance à débloquer, SPAM à hygiéniser, maillage à vérifier avec exports manquants"

## Recommandations révisées

### Priorité absolue (48h)

1. **Upload disavow.txt** — 15 min, 0 risque, protection contre Penguin
2. **Export Ahrefs Internal Backlinks History** — confirmer/infirmer le 1M → 200K
3. **Screenshot GSC Liens internes** — cross-check

### Priorité haute (1 semaine)

4. **Fix bailout SSR** — commenter 1 par 1 les Providers dans `src/app/layout.tsx`, curl pour identifier le coupable
5. **Retirer `ssr: false`** sur `Footer.tsx:22-24` (DynamicFooterLinks)
6. **Retirer `notFound()` 0 providers** — `page.tsx:582-589`

### Priorité moyenne (1 mois)

7. **Analyser commits 22/03 + 06/04** — les 3 commits suspectés ont-ils vraiment capé le maillage ?
8. **Link building légitime** — Link Intersect avec 5 concurrents pour trouver les opportunités
9. **Rank Tracker Ahrefs** — suivi quotidien 100 KW cibles

## KPI à surveiller chaque semaine

| KPI                       | Valeur actuelle | Cible 12 sem |
| ------------------------- | --------------- | ------------ |
| Ahrefs organic traffic /j | 164             | 500          |
| Ahrefs keywords total     | 185             | 600          |
| Ahrefs keywords top 10    | 115             | 400          |
| Ahrefs referring domains  | 45              | 100          |
| Ahrefs DR                 | 0,6             | 15-20        |
| GSC clics /28j            | 7 800           | 50 000       |
| GSC pages indexées        | 459 003         | 800 000      |
| GA4 devis /mois           | 16              | 150          |

## Conclusion

Le diagnostic initial sous-estimait la santé réelle du site. **Servicesartisans.fr n'est pas un cas d'urgence**, c'est un site en phase de décollage post-relaunch avec des problèmes de qualité technique (bailout SSR) et d'hygiène (SPAM backlinks) qui limitent son potentiel mais ne l'empêchent pas de croître x7 en 2 mois.

**Le fix du bailout SSR reste l'action #1** car il pourrait multiplier cette croissance par 3-5x, mais il n'est pas un sauveteur d'urgence.

Le "maillage 1M → 200K" reste à prouver factuellement avec les exports manquants.
