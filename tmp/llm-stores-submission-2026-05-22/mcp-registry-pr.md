# MCP Registry Submission — ServicesArtisans RGE-OS

**Date** : 2026-05-22
**Status** : DRY-RUN — Marvin doit ouvrir la PR / le ticket manuellement.

## Cible

Le Model Context Protocol Registry est en beta (Anthropic 2025).
Cibles connues :

1. **Anthropic MCP Servers index** — https://github.com/modelcontextprotocol/servers
   - Liste editoriale + community. PR markdown.
2. **MCP Hub officiel** — https://modelcontextprotocol.io/servers
   - Submission via formulaire (cf. footer du site, "Submit a server").
3. **Anthropic Claude Desktop config gallery** — distribue via update channel Claude Desktop.

## Procedure recommandee (ordre)

### Etape A — PR sur `modelcontextprotocol/servers`

1. Fork https://github.com/modelcontextprotocol/servers
2. Ajouter une ligne dans `README.md` section "Community Servers" (ordre alpha) :

```markdown
- **[ServicesArtisans RGE](https://github.com/servicesartisans/servicesartisans)** — French RGE-certified artisan lookup + MaPrimeRenov / CEE deterministic calculators. HTTP transport, public read-only. Source: ADEME registre RGE (Etalab 2.0).
```

3. Commit : `add: servicesartisans-rge MCP server (French renovation aids)`
4. PR title : `Add ServicesArtisans RGE MCP server`
5. PR body — coller le contenu de `mcp-server-manifest.json` (ce repo) + lien vers `https://servicesartisans.fr/api/v1/mcp` pour validation live.

### Etape B — Formulaire MCP Hub (modelcontextprotocol.io)

1. Aller sur https://modelcontextprotocol.io/servers
2. Cliquer "Submit a server" (CTA bas de page ou header).
3. Remplir :
   - Name : `servicesartisans-rge`
   - Display name : `ServicesArtisans RGE-OS`
   - Transport : `HTTP` — URL `https://servicesartisans.fr/api/v1/mcp`
   - Protocol version : `2025-03-26`
   - License : `CC-BY-4.0`
   - Repo : `https://github.com/servicesartisans/servicesartisans`
   - Contact : `data@servicesartisans.fr`
4. Joindre `mcp-server-manifest.json` (drag-drop si supporte).

### Etape C — Verification live MCP

Avant submit, exiger un curl pass sur la prod :

```bash
# 1) Discovery GET
curl -s https://servicesartisans.fr/api/v1/mcp | jq .
# attend : { server, version, protocol, tools: [...] }

# 2) JSON-RPC tools/list
curl -sX POST https://servicesartisans.fr/api/v1/mcp \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | jq .

# 3) JSON-RPC tools/call lookup_rge sample
curl -sX POST https://servicesartisans.fr/api/v1/mcp \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"lookup_rge","arguments":{"siret":"12345678901234"}}}' | jq .
```

Si l'un des trois retourne 5xx ou erreur de schema -> NE PAS submitter.

## Champs cles a coller dans la PR / le formulaire

Voir `mcp-server-manifest.json` colocalise.

- Endpoint : `https://servicesartisans.fr/api/v1/mcp`
- Transport : HTTP POST (JSON-RPC 2.0)
- Tools : 4 (lookup_rge, search_rge, get_bareme_mpr, get_aides_for_geste)
- Auth : aucune
- Rate limit : 60 req/min/IP
- License : CC-BY 4.0
- Attribution requise : `Source : ServicesArtisans`

## Post-submission

- Marvin : ouvrir une issue interne pour suivre l'acceptation (delai indicatif 1-3 semaines).
- A acceptation : declencher refresh manifests via `node scripts/llm-stores/bin/submit-mcp-registry.mjs --no-dry-run` (Sprint 2).
- Si refus : capter feedback dans memory `servicesartisans-mcp-registry-feedback-YYYY-MM-DD.md`.
