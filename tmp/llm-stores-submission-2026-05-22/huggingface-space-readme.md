---
title: ServicesArtisans RGE Explorer
emoji: 🏠
colorFrom: blue
colorTo: green
sdk: gradio
sdk_version: 4.36.0
app_file: app.py
pinned: false
license: cc-by-4.0
tags:
  - rge
  - france
  - renovation-energetique
  - maprimerenov
  - cee
  - open-data
  - ademe
  - mcp
datasets:
  - servicesartisans/rge-providers
models: []
---

# ServicesArtisans RGE Explorer

Demo Hugging Face Space showcasing the **ServicesArtisans RGE-OS** open-data
APIs and MCP server. Lookup French RGE-certified artisans, compute deterministic
MaPrimeRenov' 2026 and CEE 2026 subsidy amounts.

## Try it

- **API** : `https://servicesartisans.fr/api/v1/rge/search?city=lyon&q=pompe-a-chaleur`
- **MCP** : `https://servicesartisans.fr/api/v1/mcp` (POST JSON-RPC 2.0)
- **OpenAPI** : `https://servicesartisans.fr/api/v1/openapi/json`
- **GraphQL** : `https://servicesartisans.fr/api/v1/graphql`
- **SPARQL** : `https://servicesartisans.fr/api/v1/kg/sparql`

## Stack

- **Source de verite** : ADEME annuaire-entreprises RGE (sync hebdo, Etalab 2.0)
- **Volume** : ~49 228 artisans actifs RGE (vague 2026-05)
- **License** : CC-BY 4.0 — `Source : ServicesArtisans`
- **YMYL** : Critic gate sur l'AnswerEngine (aides financieres)

## Tools exposes via MCP

| Tool                  | Description                                          |
| --------------------- | ---------------------------------------------------- |
| `lookup_rge`          | Lookup by SIRET (14 digits)                          |
| `search_rge`          | Search by city + metier (up to 50 results)           |
| `get_bareme_mpr`      | MaPrimeRenov' 2026 amount (geste + menage_categorie) |
| `get_aides_for_geste` | Cumulable aids list for a geste                      |

## How to use this Space

This Space is a thin Gradio UI calling the live ServicesArtisans REST + MCP
endpoints. Source : https://github.com/servicesartisans/servicesartisans

## Citation

```bibtex
@misc{servicesartisans_rge_2026,
  title = {{ServicesArtisans RGE-OS}: Open registry of French RGE-certified renovation artisans},
  author = {{ServicesArtisans}},
  year = {2026},
  url = {https://servicesartisans.fr/api/v1/rge},
  note = {License: CC-BY 4.0. Source: ADEME registre RGE (Etalab 2.0).}
}
```

## Submission procedure

1. Marvin creates Space at https://huggingface.co/new-space
   - Owner : `servicesartisans` (org) or personal
   - Name : `rge-explorer`
   - SDK : Gradio
   - License : `cc-by-4.0`
2. Copy this `README.md` into the Space repo root.
3. Add a minimal `app.py` (Gradio) wrapping the REST endpoints listed above.
   Sample skeleton :

```python
import gradio as gr
import requests

BASE = "https://servicesartisans.fr/api/v1"

def lookup(siret: str):
    r = requests.get(f"{BASE}/rge/lookup", params={"siret": siret}, timeout=10)
    return r.json()

def search(city: str, metier: str):
    r = requests.get(f"{BASE}/rge/search", params={"city": city, "q": metier}, timeout=10)
    return r.json()

with gr.Blocks(title="ServicesArtisans RGE Explorer") as demo:
    gr.Markdown("# ServicesArtisans RGE Explorer")
    with gr.Tab("Lookup SIRET"):
        siret = gr.Textbox(label="SIRET (14 digits)")
        out1 = gr.JSON()
        gr.Button("Lookup").click(lookup, inputs=siret, outputs=out1)
    with gr.Tab("Search"):
        city = gr.Textbox(label="Ville")
        metier = gr.Textbox(label="Metier")
        out2 = gr.JSON()
        gr.Button("Search").click(search, inputs=[city, metier], outputs=out2)
    gr.Markdown("Source : ServicesArtisans / Registre RGE ADEME (Etalab 2.0). CC-BY 4.0.")

demo.launch()
```

4. Add `requirements.txt`:

```
gradio==4.36.0
requests==2.32.3
```

5. Push to Space. Wait ~2 min for build.
6. Verify the live URL : `https://huggingface.co/spaces/servicesartisans/rge-explorer`.
