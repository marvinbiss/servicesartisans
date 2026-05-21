# MCP Server — `servicesartisans-rge-os` v0.1.0

## What is MCP?

The **Model Context Protocol** (MCP) is an open standard published by
Anthropic in late 2024 and adopted by Claude Desktop, Cursor, Continue.dev,
Cline, and a growing list of agent runtimes. It lets a Large Language
Model **discover and invoke external tools** through a uniform JSON-RPC
2.0 interface, the same way LSP standardised editor integrations.

Exposing `servicesartisans.fr/api/v1/mcp` turns ServicesArtisans into
**native AI-agent infrastructure** for the French renovation aides market.
Any IDE-based assistant debugging a `MaPrimeRénov'` calculation, or any
custom agent triaging a homeowner conversation, can call our RGE / CEE /
aides primitives through one canonical endpoint.

Spec: https://modelcontextprotocol.io/specification/2025-03-26

## Endpoint

- **URL** : `https://servicesartisans.fr/api/v1/mcp`
- **Method** : `POST` (JSON-RPC) — `GET` returns discovery metadata
- **Content-Type** : `application/json`
- **Auth** : optional `Authorization: Bearer <token>` header. When the
  server env `MCP_BEARER_TOKEN` is set, the header is required. In the
  default public mode no token is needed (rate-limit applies via the
  shared platform middleware).

## Tools v0

| Tool                  | Purpose                                          | Required input              |
| --------------------- | ------------------------------------------------ | --------------------------- |
| `lookup_rge`          | Lookup an RGE-certified artisan by SIRET         | `siret` (14 digits)         |
| `search_rge`          | Search RGE artisans by city + métier             | `ville`, `metier`           |
| `get_bareme_mpr`      | Get the MaPrimeRénov bareme for a geste + ménage | `geste`, `menage_categorie` |
| `get_aides_for_geste` | List cumulable aids for a renovation geste       | `geste`                     |

v0.1 returns canonical-URL pointers for live data (so the agent can
hydrate via the existing REST endpoints). v0.2 will inline the live
payloads + wire `get_bareme_mpr` to the deterministic aides calculator.

## Configure Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`
(macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows) and add:

```json
{
  "mcpServers": {
    "servicesartisans": {
      "url": "https://servicesartisans.fr/api/v1/mcp"
    }
  }
}
```

If you have a `MCP_BEARER_TOKEN`:

```json
{
  "mcpServers": {
    "servicesartisans": {
      "url": "https://servicesartisans.fr/api/v1/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN"
      }
    }
  }
}
```

Restart Claude Desktop. The 4 tools should appear under the "Tools"
selector in any conversation.

## Configure Cursor

Add to `.cursor/mcp.json` at the workspace root:

```json
{
  "mcpServers": {
    "servicesartisans": {
      "url": "https://servicesartisans.fr/api/v1/mcp"
    }
  }
}
```

Cursor will auto-detect the server and list the tools in the agent picker.

## Manual usage — curl

Discover the server:

```bash
curl https://servicesartisans.fr/api/v1/mcp
```

List tools:

```bash
curl -X POST https://servicesartisans.fr/api/v1/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Lookup an RGE artisan by SIRET:

```bash
curl -X POST https://servicesartisans.fr/api/v1/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "lookup_rge",
      "arguments": { "siret": "83001931100026" }
    }
  }'
```

Get the list of aides for a heat-pump install:

```bash
curl -X POST https://servicesartisans.fr/api/v1/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "get_aides_for_geste",
      "arguments": { "geste": "pac_air_eau" }
    }
  }'
```

## JSON-RPC error codes

| Code     | Meaning                                                  |
| -------- | -------------------------------------------------------- |
| `-32700` | Parse error (invalid JSON)                               |
| `-32600` | Invalid Request (not a valid JSON-RPC 2.0 envelope)      |
| `-32601` | Method not found (unknown method or unknown tool name)   |
| `-32602` | Invalid params (e.g. `tools/call` missing `params.name`) |
| `-32603` | Internal server error                                    |
| `-32001` | Unauthorized (Bearer token required / mismatched)        |

## v0 limits & v0.2 roadmap

v0.1 ships :

- 4 tools (lookup_rge, search_rge, get_bareme_mpr, get_aides_for_geste)
- JSON-RPC 2.0 over HTTP POST (no SSE streaming)
- Optional Bearer auth (single static token)
- Discovery `GET /api/v1/mcp`

v0.2 will add :

- Inline live data for `lookup_rge` and `search_rge` (no canonical-URL
  hop, faster agent flows)
- `get_bareme_mpr` wired to the deterministic aides calculator
- Multi-tenant tokens (DB-backed `mcp_clients` table, quota per partner)
- `resources/list` for static reference data (CEE fiches BAR, code RGE
  qualifications, ZRR list)
- SSE streaming for long-running tools

## References

- MCP spec (2025-03-26) — https://modelcontextprotocol.io/specification/2025-03-26
- RGE-OS Manifesto — `docs/RGE-OS-MANIFESTO.md` (pillar 4)
- REST baseline — `docs/API-V1-OPENAPI.yaml`
