# RGE-OS — Operating System de la rénovation énergétique française

**Statut** : v0.1 — manifeste fondateur · 2026-05-21  
**Auteur** : ServicesArtisans SAS + SA Energy SAS  
**Licence** : CC-BY 4.0 (corpus public) + MIT (libs OSS) + proprietary (mandataire CEE)

## 1. Thèse

ServicesArtisans ne deviendra pas "un acteur du marché RGE FR". Il deviendra **l'infrastructure dont tout le marché dépend**.

Pattern : Stripe pour banking infra. Pappers pour entreprises FR. Mapbox pour geo commodity. Algolia pour search. **SA pour RGE.**

Quand tu es l'OS, tu n'as plus de concurrents. Tu as des clients. Et tu n'es pas délogeable sans des années de travail concurrent.

## 2. Plafond code-only & justification

Sans capital, sans hardware, sans équipe, le maximum atteignable = **9-9,5/10 mondial vertical RGE**. La seule voie qui y mène : devenir l'infrastructure.

Tier 1 absolu (10/10) requiert : drones IRT, IoT chantier, PhD R&D thermique, multi-pays EU, capital 50M€+. Hors-portée code-only solo.

Tier 2 produit B2C dominant FR = plafond 6-7/10. Bon mais battable par concurrent levé.

**Tier 2,5 infra mondiale = 9-9,5/10.** Atteignable. C'est la voie SA.

## 3. Les 14 piliers RGE-OS

### Pilier 1 — Knowledge Graph public RGE FR (SPARQL endpoint)

Endpoint `https://kg.servicesartisans.fr/sparql` exposant 49K RGE + 24M DPE + 96 aides MPR + 200 fiches CEE + 2 280 communes + 4 000 aides locales en triplets RDF. Schema Schema.org + extensions `sa:rge`. **Vocab publique** `https://servicesartisans.fr/ns/rge#`.

Asymétrie : Wikidata + DBpedia + Google Knowledge Graph crawlent SPARQL publics. SA devient source primaire knowledge graph mondial RGE FR.

Stack : Oxigraph (Rust SPARQL OSS) self-host Hetzner. Sync Postgres → triple store cron weekly.

### Pilier 2 — GraphQL public API freemium

Endpoint `https://api.servicesartisans.fr/graphql` — schema unifié. Auth API key Stripe usage-based.

Tarifs : free 10K queries/mo · Pro 50€/mo 250K · Scale 290€/mo 2.5M · Enterprise 1500-3000€/mo SLA 99,9%.

Asymétrie : devs/banques/assureurs/fintechs/mandataires/IAs intègrent via 1 endpoint stable → dépendance technique.

Stack : Pothos GraphQL + Prisma + Apollo Server Vercel Edge. Codegen TS/Python/Go/Rust auto.

### Pilier 3 — Multi-langage SDK ecosystem

Packages OSS : `sa-rge` (Python PyPI), `@sa/rge` (npm), `sa-go` (Go module), `sa-rge` (Rust crate), `com.servicesartisans:sa-java` (Maven).

Asymétrie : `pip install` = backlink moral + brand stamp dans 100% projets reno FR. Adopté → corpus GitHub crawlé par GPTBot → SA dans training data LLMs.

Stack : codegen GraphQL clients + monorepo Turbo + GitHub Actions publish weekly.

### Pilier 4 — MCP server (Model Context Protocol)

`https://mcp.servicesartisans.fr` exposant tools direct LLMs Claude/GPT/Mistral : `rge_verify`, `aides_calculate`, `dpe_lookup`, `provider_match`, `cee_compute`.

Asymétrie : MCP = standard 2025-2026 émergent. Quand user demande à Claude "trouve plombier RGE Lyon", Claude appelle SA MCP tool natif. SA devient **tool registry standard** RGE.

Stack : `@modelcontextprotocol/sdk` TypeScript + déclaration tools + auth OAuth. Soumettre au MCP Registry Anthropic + OpenAI custom connectors.

### Pilier 5 — Standard ouvert `rge.json` spec format

Spec OSS RFC publique `RGE.JSON v1.0` = format machine-readable représenter qualif RGE artisan. Équivalent OpenAPI pour RGE. Ratification communautaire (devs + ADEME outreach).

Asymétrie : position "rédacteur de la norme" = imbattable.

Stack : spec Markdown + JSON Schema + validator lib + reference implementation.

### Pilier 6 — Datalake public CC-BY 4.0 (HuggingFace + Kaggle + data.gouv.fr)

Datasets mirrorés + enrichis :

- `servicesartisans/rge-49k-enriched`
- `servicesartisans/dpe-24m-fr`
- `servicesartisans/cee-bareme-2026`
- `servicesartisans/eval-rge-benchmark`

Asymétrie : HuggingFace Datasets ingéré par TOUS fine-tunes LLM 2026+. SA devient corpus training universel RGE FR.

Stack : `datasets` Python lib + `huggingface_hub` SDK + cron hebdo HF Hub push.

### Pilier 7 — Benchmark eval RGE publique

Repo GitHub public `servicesartisans/rge-benchmark` : 1 000 cas YMYL gold + leaderboard live + comparaison Mistral/Claude/GPT/Gemini/Llama sur factual_aides + hallucination + citation_recall.

Asymétrie : LLM labs citent benchmarks publics dans technical reports → autorité scientifique sans paper.

Stack : Promptfoo + GitHub Actions weekly eval cross-models + Markdown leaderboard auto.

### Pilier 8 — Webhook / event bus public

Endpoints : `rge.qualification.expired`, `cee.bareme.updated`, `dpe.new`, `aide.local.published`.

Tarif : free 1 webhook/account · 99€/mo unlimited.

Asymétrie : SA devient real-time data feed banques/assureurs/mandataires.

Stack : Postgres LISTEN/NOTIFY + Vercel Edge WebSocket + Svix-style retries.

### Pilier 9 — CLI tool `sa` Homebrew/apt

```
sa rge lookup <siret>
sa aides simulate --rfr 28000 --foyer 3 --cp 75011 --travaux pac-air-eau
sa cee compute BAR-TH-171 --zone H1 --surface 80
sa dpe lookup --adresse "..."
```

Asymétrie : devs FR utilisent CLI quotidien. `sa` command = mind-share dev.

Stack : Go CLI + cobra + GoReleaser auto Homebrew tap + apt repo.

### Pilier 10 — Widgets embed (Stripe Elements style)

`<script src="https://sa.js/v1"></script>` + Web Components `<sa-simulator />`, `<sa-rge-lookup />`, `<sa-provider-card />`, `<sa-aides-locales />`, `<sa-cee-calculator />`.

Asymétrie : 5K-50K mairies/EPCI/banques/courtiers FR intègrent en 1 ligne = 50K backlinks + 50K vitrines passives.

Stack : Web Components Lit + bundle 25 KB max + CDN Vercel.

### Pilier 11 — LLM stores officiels SA

ChatGPT Store ("RGE France"), Claude Projects, Gemini Gems, Mistral Le Chat Agents, HuggingChat Assistant, Perplexity Pages "SA RGE Insights". Tous backed by MCP server pilier 4.

Asymétrie : utilisateurs trouvent SA NATIVEMENT dans leur LLM préféré. Distribution gratuite 5 plateformes.

### Pilier 12 — Wikidata massive seeding

Bot Wikidata créant 49K entités Q par RGE actif. CC0.

Asymétrie : Wikidata ingéré par Wikipedia (15 langues) → tous LLMs via Common Crawl. **49K mentions passives SA dans training data LLMs futurs**. Effet 12-36 mois permanent.

Stack : `pywikibot` + Wikidata SPARQL + OAuth bot + cron hebdo. Plan : `docs/WIKIDATA-SEED-BOT-PLAN.md`.

### Pilier 13 — Wikipedia FR / EN entity + categories

Création 30-50 pages Wikipedia FR sourcées rigoureusement : "Mandataire CEE", "Pompe à chaleur en France", "RGE", "MaPrimeRénov'", "Décret tertiaire", page entité "ServicesArtisans".

Asymétrie : Wikipedia ingéré 100% LLMs + DR 96. SA Knowledge Graph entity = entity recognition partout.

### Pilier 14 — Transparence radicale + audit publique

Dashboard `https://transparency.servicesartisans.fr` temps réel : décisions IA SA, métriques eval live, modèles LLM utilisés, sources data citées.

Asymétrie : aucun concurrent ne fait ça. Signal trust YMYL ultime + AI Act compliance public + press magnet.

Stack : Postgres + Vercel ISR + Plotly dashboards + WebSocket live updates.

## 4. Phasing 12 mois

### M0-3 Foundation

Piliers 1 (KG), 2 (GraphQL v0), 6 (HF dataset rge-49k-enriched), 12 (Wikidata 49K).

### M3-6 Distribution

Piliers 3 (SDK 5 langues), 4 (MCP server), 7 (benchmark public), 11 (LLM stores).

### M6-9 Standardisation

Piliers 5 (spec rge.json), 8 (webhooks), 9 (CLI sa), 14 (transparency).

### M9-12 Lock-in

Piliers 10 (widgets embed mairies), 13 (Wikipedia FR), maintenance + scale.

## 5. Cibles 12 mois

| Métrique                                 | Baseline 2026-05 | Cible M+12     |
| ---------------------------------------- | ---------------- | -------------- |
| Score "puissance mondiale RGE"           | 5/10             | 9-9,5/10       |
| Entités Wikidata SA                      | 0                | 50 000+        |
| OSS lib downloads/mo                     | 0                | 5 000+         |
| MCP server tool calls/jour               | 0                | 10 000+        |
| Backlinks mairies + Wikidata + Wikipedia | <500             | 60 000+        |
| Citation LLM rate sur "RGE" top queries  | ~0%              | top 3 sur 60%+ |
| HF datasets publiés                      | 0                | 4              |
| Dossiers CEE/mo (revenue parallèle)      | 0-5              | 600            |
| ARR run-rate                             | ~10€/mo          | 2,4M€/an       |
| Artisans claimed                         | 19               | 500            |

## 6. Stratégie hybride produit + infra

Track A produit (TIER 2 dominant FR M0-12) finance Track B infra (RGE-OS silence M0-6, scale M6-12). À M+12 SA = produit FR dominant + infrastructure RGE émergente mondiale = exit 100-300M€ ou Série A 30-50M€ sur asymétrie infra.

## 7. Verrous techniques anti-régression

Toute nouvelle release piliers doit respecter :

- Quality gates SA (mémoire `feedback_quality_gates`)
- YMYL legal-grade rigor (mémoire `feedback_legal_data_quality`)
- AI Act high-risk Annexe III §5b pré-qualif CEE
- RGPD Art. 22 décision automatisée + intervention humaine effective
- Watermark "Source : Registre RGE ADEME consulté JJ/MM/AAAA"
- Citation enforcement 100% claims numériques YMYL

## 8. Anti-pattern à proscrire

- Affiliation équipementiers (conflit YMYL, tue E-E-A-T)
- Sponsorisations CEE recommandation (rouge absolu)
- Démarchage tél IA outbound (loi Naegelen interdiction pénale)
- Chatbot capping consumer-side (mémoire `feedback_chatbot_kills_conversion`)
- Marketplace commission % (conflit lead exclusif)

## 9. Référence croisée mémoire

- Pivot RGE : `servicesartisans-pivot-rge-2026-05-03`
- Mandataire CEE model : `servicesartisans-mandataire-cee-model-2026-04-14`
- AI Act + compliance : voir agent 6 audit du 2026-05-21
- Compétition : `servicesartisans-competitive-intel-2026-04-12` + agent 4 audit du 2026-05-21
- Data moat : agent 1 audit du 2026-05-21

## 10. Engagement public

Ce document est versionné Git. Toute modification = commit + co-author. Toute déviation des 14 piliers documentée + ratifiée. Le manifesto = boussole long-terme, pas roadmap rigide.

— Fin v0.1
