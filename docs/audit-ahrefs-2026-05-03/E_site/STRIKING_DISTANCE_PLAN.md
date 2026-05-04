# Striking Distance Plan — Action #9 (Sprint A)

**Date** : 2026-05-03
**Source data** : `striking_distance_2026-05.csv` (audit Ahrefs Phase 0)

> ⚠️ Le CSV "striking_distance" est mal nommé — il contient 590 KW où SA n'est PAS positionné mais où des concurrents (sonergia surtout) rankent top 5. C'est du content gap.
> La vraie striking distance Ahrefs (SA pos 11-30) n'a pas été extraite (pull error). À corriger lors du prochain pull (~10K unités).

## Méthode

1. Filter universe attackable : `vol >= 300` AND `kd <= 15` → **121 KW** (sur 590)
2. Exclusion noise : marques (primeo, bellenergie), KW hors scope ("attestation d'hébergement")
3. Cluster par vertical (12 clusters SA)
4. Mapping cluster → route SA existante (vérifié live HTTP 200)
5. Output 2 CSV :
   - `kw_attack_existing_50.csv` — 50 KW à attaquer via on-page existante
   - `kw_attack_create_50.csv` — 19 KW sans page (input Sprint B/F)

## Volumes capturables

| Bucket               | KW  | Vol mensuel |
| -------------------- | --- | ----------- |
| Existing-page attack | 50  | **272 800** |
| Create-page attack   | 19  | 30 300      |

## Distribution par cluster (top 8)

| Cluster            | KW  |
| ------------------ | --- |
| isolation          | 45  |
| autre (hors scope) | 19  |
| pompe-a-chaleur    | 18  |
| chauffe-eau        | 9   |
| solaire            | 7   |
| poele              | 6   |
| isolation-phonique | 6   |
| ventilation        | 4   |

## Action immédiate livrée — Title rewrite CEE (quick win)

**Constat audit** : pages `/cee/[op]` utilisent le jargon ADEME dans le `<title>` :

| URL prod          | Title actuel                                            | KW recherché (vol/mois)                         |
| ----------------- | ------------------------------------------------------- | ----------------------------------------------- |
| `/cee/bar-th-112` | "Prime CEE Appareil indépendant de chauffage au bois…"  | "poêle à granulés" 16K + "granulés de bois" 13K |
| `/cee/bar-th-148` | "Prime CEE Chauffe-eau thermodynamique à accumulation…" | "chauffe eau thermodynamique" 31K               |

**Fix** : nouveau mapping `src/lib/cee/client-terms.ts` (24 ops mappées). Title devient :

```
${clientTerm} : prime CEE 2026 (${opCode}) — artisans RGE
```

Exemples :

- `Poêle à granulés : prime CEE 2026 (BAR-TH-112) — artisans RGE`
- `Chauffe-eau thermodynamique : prime CEE 2026 (BAR-TH-148) — artisans RGE`

**Impact attendu** : ~50K vol/mois adressable sur les pages /cee. À CTR 3% top 10 = +1500 clics/mois après recrawl Google (7-14j).

**Description** garde le jargon ADEME (autorité technique + précision réglementaire).

## Suite Action #9 (à faire — Sprint B / F)

### kw_attack_existing_50.csv — 50 KW avec page existante mais sous-optimisée

Top 10 à fixer en priorité :

| Rank | KW                          | Vol  | KD  | Route                           | Action                                                          |
| ---- | --------------------------- | ---- | --- | ------------------------------- | --------------------------------------------------------------- |
| 1    | pompe a chaleur             | 56K  | 13  | `/services/pompe-a-chaleur`     | Vérifier title + ajouter section "PAC air/eau vs air/air"       |
| 2    | chauffe eau thermodynamique | 31K  | 9   | `/cee/bar-th-148`               | ✅ Title fix livré aujourd'hui                                  |
| 3    | poêle à granulés            | 16K  | 11  | `/cee/bar-th-112`               | ✅ Title fix livré aujourd'hui                                  |
| 4    | isolation par l'extérieur   | 13K  | 5   | `/services/isolation-thermique` | Ajouter H2 dédié "ITE" + section prix                           |
| 5    | granulés de bois            | 13K  | 8   | `/cee/bar-th-112`               | ✅ Title fix livré (couvert par mapping BAR-TH-112)             |
| 6    | chauffe eau solaire         | 12K  | 6   | `/cee/bar-th-148`               | À déplacer vers `/cee/bar-th-101` (CESI) — créer mapping séparé |
| 7    | pompe a chaleur air eau     | 11K  | 12  | `/services/pompe-a-chaleur`     | Ajouter section H2 + variants air-air                           |
| 8    | isolation phonique          | 8.3K | 7   | `/blog`                         | Créer article dédié `/blog/isolation-phonique-mur-mitoyen`      |
| 9    | isolant thermique           | 8.2K | 1   | `/services/isolation-thermique` | Ajouter H2 "Quel isolant choisir" + comparatif                  |
| 10   | isolation                   | 7.9K | 4   | `/services/isolation-thermique` | KW générique, focus E-E-A-T (FAQ + auteur)                      |

### kw_attack_create_50.csv — 19 KW à créer (input Sprint B / F)

Pages manquantes à créer (cluster `autre` exclu) :

- "isolation phonique mur mitoyen" 800/mois → `/blog/isolation-phonique-mur-mitoyen`
- Pages thématiques par variants pompe à chaleur (air-eau dédié, géothermique dédié)
- Guide audit énergétique long-form sur `/blog`

## Itération

Re-pull Ahrefs prévu **2026-05-18** (fin cycle quota) pour récupérer :

- Vraie striking distance (SA pos 11-30)
- Refresh `sa_lost_keywords` (vide actuellement, bug pull)
- Mesure delta après title rewrite CEE (recrawl Google ~14j)

## Maintenance

```bash
npx tsx scripts/analyze-striking-distance-2026-05.ts
# → regenerates kw_attack_existing_50.csv + kw_attack_create_50.csv
# → safe to re-run, idempotent
```
