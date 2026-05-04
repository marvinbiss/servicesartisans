# Stratégie Rénovation Énergétique V2 — fusion audit avril + Ahrefs Bloc 1 mai

**Date** : 2026-05-04
**Précédente version** : `docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md` (avril 2026)
**Nouvelle data** : `docs/ahrefs-bloc1-keywords-gap-2026-05-04.md` (3349 KW gap, 4 leaders niche pullés)

> ⚠️ Cette V2 **remplace** la V1 sur 4 sections : volumes, plan de déploiement Sprint 1-4, KPI, décisions pending. Le reste (USP, contexte réglementaire, E-E-A-T, intégration ADEME) reste valide.

---

## 1. Ce qui change vs V1 — résumé exécutif

| Sujet           | V1 (avril)                                       | V2 (mai, post-Bloc 1)                                             | Impact         |
| --------------- | ------------------------------------------------ | ----------------------------------------------------------------- | -------------- |
| Volumes data    | Estimés "à la louche"                            | **3349 KW vol mesurés** sur 4 leaders niche                       | Précision ×100 |
| Cluster prio #1 | Pompe à chaleur (KD 50+)                         | **VMC** (KD 0.7, vol 127.8K cumulé)                               | Pivot tactique |
| KW à attaquer   | "Top 50 par feeling"                             | 3 buckets × 24 clusters scorés                                    | Méthode        |
| Page existence  | À créer ex nihilo                                | **57% candidate déjà détectée**                                   | Effort ×0.4    |
| Sprint 1-4      | Linéaire (hubs → services → territorial → ampli) | **Cluster-first** (VMC → ITE → PAC → MPR → reste)                 | Roadmap        |
| Concurrent ref  | "Effy DR 70+", générique                         | Effy + Sonergia + QuelleEnergie + France-Renov détaillés par page | Tactique       |
| ROI 12 mois     | "100K trafic, 800-1500 devis"                    | Recalibré : 50-90K clics/j (cf. ULTRA DOMINATION v2)              | Réaliste       |

---

## 2. Constat data Ahrefs Bloc 1

### 2.1 Pull effectué

- **4 leaders niche** : effy.fr (DR 72), sonergia.fr (DR 49), quelleenergie.fr, france-renov.gouv.fr
- **7613 KW** pullés (paginés 4×500 par leader, cap API 500/call)
- **3349 KW** filtrés RGE/CEE/MPR + leader top 10 + SA pos > 50

### 2.2 Top clusters par volume cumulé/mois

| Rang | Cluster              | Nb KW | Vol cumulé/mo | KD avg   | Verdict                       |
| ---- | -------------------- | ----- | ------------- | -------- | ----------------------------- |
| 1    | **PAC**              | 615   | 230 190       | 4.6      | ✅ Big head, déjà sur roadmap |
| 2    | Solaire PV           | 288   | 229 940       | 10.4     | 🔄 Cluster sous-investi V1    |
| 3    | **Isolation other**  | 871   | 227 530       | 3.9      | ✅ Confirme V1 prio           |
| 4    | MaPrimeRénov'        | 271   | 157 840       | **33.5** | ⚠️ KD haut, déjà pages V1     |
| 5    | **VMC**              | 215   | **127 800**   | **0.7**  | 🔥 GOLDMINE inattendue V1     |
| 6    | Chaudière            | 294   | 85 690        | 2.6      | 🔄 Sous-investi V1            |
| 7    | Poêle granulés       | 107   | 66 250        | 4.2      | 🔄 Sous-investi V1            |
| 8    | ITE (isolation ext.) | 159   | 64 610        | 6.1      | ✅ Sur roadmap V1             |
| 9    | DPE                  | 241   | 54 840        | 11.1     | ✅ Sur roadmap V1             |
| 10   | Other                | 169   | 52 200        | 21.6     | À cluster reclasser           |

### 2.3 Insights inattendus (data > intuition)

1. **VMC = goldmine non-vu en V1**
   - 215 KW, vol 127.8K/mo, KD moyen **0.7** (= quasi-libre)
   - V1 mentionnait juste `/vmc-double-flux/` en bas de hub travaux
   - Aucune page SA dédiée actuellement
   - Effy rank #2 sur "vmc simple flux" 15K/mo et "vmc hygroréglable" 14K/mo

2. **Solaire PV sous-investi**
   - 229.9K vol cumulé, mais V1 ne mentionne PAS `/photovoltaique/` ni `/panneaux-solaires/`
   - Cluster orphelin → opportunité création hub `/renovation-energetique/solaire/`

3. **Chaudière + Poêle granulés** → 152K vol cumulé, KD < 5
   - V1 prévoyait juste 2 pages (`chaudiere-condensation`, `poele-granules`)
   - Vrai potentiel : 8-12 sub-pages chacun (par énergie, par marque, par prix)

4. **MaPrimeRénov' KD 33.5 = pas easy**
   - V1 le mettait P1, mais SERP très concurrentiel (france-renov.gouv.fr + journalistes)
   - Réalité : on peut prendre des sub-niches longue traîne, pas le head term

5. **57% des KW déjà mappés à une page SA candidate**
   - Heuristic match sur tokens slug → 1919/3349 KW pointent vers une page existante
   - **Conclusion** : priorité enrichissement > création (effort × 0.4)

---

## 3. USP renforcée (V1 valide + nouveaux signaux)

V1 base (toujours valide) :

1. RGE certifié (API france-renov.gouv.fr)
2. SIREN officiel
3. Éligibilité MaPrimeRénov' (simulateur)

Ajouts V2 sur la base data Bloc 1 :

4. **Catalogue artisans 350× plus profond qu'Effy** (970K vs 2776, cf. memory effy-10x-strategy)
5. **Données ADEME atomic swap** (memory mig 306, 49 228 fiches RGE descriptions E-E-A-T en prod 2026-04-19)
6. **Mandataire CEE Sonergia partenaire** (différenciation B2B)
7. **Outils gratuits data.gouv.fr** (en prep — leverage AI search ready, cf. memory ceo-strategy)

---

## 4. Roadmap V2 — 4 vagues cluster-first

### Vague 1 — VMC + Isolation + ITE — 4-6 semaines (P0)

**Justification** : KD < 4 cumulé, vol 419K/mo cumulé, ROI maximal × effort minimal.

| #    | Action                                                                          | Effort  | Cible                                                         |
| ---- | ------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------- |
| V1.1 | Hub `/renovation-energetique/travaux/vmc/`                                      | 1 sem   | KW : vmc, vmc simple flux, vmc hygroréglable, vmc double flux |
| V1.2 | 4 sub-pages VMC : `simple-flux`, `hygroreglable`, `double-flux`, `installation` | 1 sem   | KD 0-2, vol 14-15K chacun                                     |
| V1.3 | Enrichir page existante PAC (`/renovation-energetique/travaux/pompe-a-chaleur`) | 3 jours | KW "pompe a chaleur" 56K vol KD 13                            |
| V1.4 | Enrichir page existante ITE                                                     | 3 jours | KW "isolation extérieur" 14K KD 2                             |
| V1.5 | Audit + bump 871 KW cluster `isolation_other` (top 50)                          | 2 sem   | Vol 227K cumulé KD 3.9                                        |

**ROI Vague 1 estimé** : +1500-3500 clics/j à M+3 si 30 pages bien faites + maillage interne propre.

### Vague 2 — Solaire PV + Chaudière + Poêle granulés — 4 semaines (P1)

**Justification** : 380K vol cumulé, gap V1 (clusters non couverts).

| #    | Action                                                                                                        | Effort  |
| ---- | ------------------------------------------------------------------------------------------------------------- | ------- |
| V2.1 | Hub `/renovation-energetique/solaire/` + 3 sub-pages (PV, prix, autoconso)                                    | 1.5 sem |
| V2.2 | Hub `/renovation-energetique/chauffage/chaudiere/` (gaz, fioul interdit, condensation, hybride) — 4 sub-pages | 1 sem   |
| V2.3 | Hub `/renovation-energetique/chauffage/poele-granules/` (prix, installation, marques) — 4 sub-pages           | 1 sem   |

**ROI Vague 2 estimé** : +800-1800 clics/j à M+5.

### Vague 3 — Pages-mines copycat top 50 — 3 semaines (P1)

**Justification** : Bloc 1 a identifié 503 pages-mines. Top 50 = pages où France-Renov + Effy dominent vol > 1K.

| #    | Action                                                                                                        |
| ---- | ------------------------------------------------------------------------------------------------------------- |
| V3.1 | Pour chaque top 50 page-mine SA absente → créer SA equivalent + meilleur (Schema, FAQ, données 2026 fraîches) |
| V3.2 | Internal linking systématique : VMC ↔ PAC ↔ ITE ↔ aides MPR ↔ artisans RGE locaux                             |

**ROI Vague 3 estimé** : +500-1200 clics/j à M+6.

### Vague 4 — MaPrimeRénov' longue traîne + DPE + Aides territoriales — 4 semaines (P2)

**Justification** : V1 Sprint 3 (déjà fait : 96 dept × MPR + 96 × CEE + 13 régions) à enrichir avec data Bloc 1.

| #    | Action                                                                                                                        |
| ---- | ----------------------------------------------------------------------------------------------------------------------------- |
| V4.1 | Audit 96 pages `/aides/[dept]/maprimerenov` créées en avril → data MPR Bloc 1 (271 KW, 157K vol)                              |
| V4.2 | Création 12-15 pages MPR longue traîne par cas d'usage (locataire, copropriétaire, propriétaire bailleur, monoparental, etc.) |
| V4.3 | DPE cluster (241 KW, 54K vol, KD 11) → audit pages existantes + 5 sub-pages                                                   |

**ROI Vague 4 estimé** : +400-900 clics/j à M+9.

### Total roadmap V2

| Horizon | Pages livrées | Clics/j cumulés P50 | Clics/j P10 | Clics/j P90 |
| ------- | ------------- | ------------------- | ----------- | ----------- |
| M+3     | 30 (Vague 1)  | +1500-3500          | +800        | +5000       |
| M+5     | +30 (Vague 2) | +2300-5300          | +1200       | +7500       |
| M+6     | +50 (Vague 3) | +2800-6500          | +1500       | +9000       |
| M+9     | +30 (Vague 4) | +3200-7400          | +1800       | +10500      |

Baseline actuelle : 350 clics/j → cible M+9 : **3500-7800 clics/j** (×10-22).

Cohérent avec ULTRA DOMINATION v2 gate M12 : 50-90K clics/j (mais nécessite Bloc 2-6 + supply activation + backlinks).

---

## 5. Ce qui reste vrai V1 (à conserver)

✅ **Contexte réglementaire** (passoires G/F/E, fin fioul, MAR obligatoire >5K€)
✅ **USP fondamentale** (RGE + SIREN + MPR)
✅ **Architecture éditoriale** (`/renovation-energetique/` hub + sub-arborescence)
✅ **Migration DB** (rge_qualifications, services, etc. — déjà fait avril)
✅ **Contenu E-E-A-T obligatoire** (auteurs, sources, lien gouv)
✅ **Intégration ADEME** (déjà en prod, cf. memory rge-descriptions 49K fiches)
✅ **Pages services RGE locales** (`/services/[s-rge]/[ville]` ×200) — déjà créées Sprint 2

---

## 6. Ce qui change vs V1 (à arbitrer)

❌ **Sprint 4 amplification** (newsletter, MAR partnership) → **reporter Vague 5+** (post Vague 1-4 cluster-first)
❌ **Volumes V1 estimés** → remplacer par data Bloc 1 mesurée
❌ **KW prio "à la louche"** → remplacer par 3 buckets scoring Bloc 1
❌ **Plan Sprint 1-4 linéaire** → roadmap cluster-first 4 vagues V2
🔄 **VMC mentionné en passing V1** → cluster #1 prio (vol 127K KD 0.7)
🔄 **Solaire PV absent V1** → cluster prio P1 (vol 230K)

---

## 7. KPI suivi V2 (vs V1)

V1 KPI :

- Trafic segment "renovation-energetique" (GA4)
- Position `maprimerenov` 26 → top 5
- Position `pompe à chaleur prix` 0 → top 20
- Position `audit énergétique obligatoire` à capturer

V2 ajouts (mesurables après Vague 1) :

- **Position `vmc simple flux`** : 0 → top 10 à M+3 (vol 15K)
- **Position `vmc hygroréglable`** : 0 → top 10 à M+3 (vol 14K)
- **Trafic cluster VMC cumulé** : 0 → 5K-15K clics/mois à M+3
- **Trafic cluster PAC cumulé** : actuel ? → +50% à M+3
- **% des 3349 KW gap où SA passe top 50** : 0% → 20% à M+6
- **% des 503 pages-mines où SA a une équivalent** : actuel ? → 60% à M+9

---

## 8. Décisions pending V2 (à valider)

- [ ] **Vague 1 démarre lundi 2026-05-05 ?** (effort 4-6 sem, ressources 1 dev + 0.5 content)
- [ ] **Pull Bloc 2 Ahrefs (backlinks intersect, 28K U)** avant ou après Vague 1 ?
- [ ] **Pull Bloc 3 (long-tail keywords explorer, 32K U)** pour alimenter sub-pages Vague 2-3 ?
- [ ] **Recruter content writer freelance** pour 30-50 articles Vague 1-3 ? Budget ~3-5K€
- [ ] **Outreach presse régionale** sur 13 régions (kit déjà préparé Sprint 3 résiduel) → lancer en parallèle Vague 1 ?

---

## 9. Méta — comment ce doc a été produit

- Pull Ahrefs Bloc 1 v3 (4 leaders × 4 batches de 500 KW + cross-ref SA + clusters + page matching)
- Quota consommé : ~145K U sur 1M dispo (256K restants jusqu'au 18/05)
- Script idempotent : `scripts/ahrefs-renovation-domination/01-concurrent-gap-niche.py`
- Outputs raw : `docs/ahrefs-bloc1-{pages-mines,keywords-gap}-2026-05-04.md`
- Memory : `~/.claude/projects/C--Users-USER/memory/servicesartisans-ahrefs-bloc1-niche-cee-2026-05-04.md`

**Pour re-générer cette stratégie sur nouvelle data** : re-run le script Bloc 1 avec `--refresh`, puis re-fusion manuelle vs ce doc V2.
