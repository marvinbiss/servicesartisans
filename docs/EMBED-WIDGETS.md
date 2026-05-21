# Embed Widgets — ServicesArtisans (pillar 10 RGE-OS)

**Status** : v1 (RGE search widget). Future widgets tracked in §Roadmap.
**License** : CC-BY 4.0 — attribution required ("Powered by ServicesArtisans").
**Reference** : `docs/RGE-OS-MANIFESTO.md` § Pilier 10.

ServicesArtisans publishes a small set of drop-in HTML widgets that let
any site embed core RGE-OS surfaces (RGE search, baremes, transparency
badge…) in a few lines of HTML. They are the public, no-auth front door
to the same data exposed via the REST + GraphQL + MCP APIs.

## 1. Quick start — RGE search widget

Paste these three lines anywhere in your HTML (any host, any framework) :

```html
<div id="sa-rge-search"></div>
<script src="https://servicesartisans.fr/embed/rge-v1.js" async></script>
<script>
  window.SARGEConfig = {
    container: '#sa-rge-search',
    metier: 'pompe-a-chaleur',
    theme: 'light',
  }
</script>
```

The loader renders a sandboxed `<iframe>` inside `#sa-rge-search` with a
search form. Submitting the form navigates the **parent window** (not the
iframe) to the matching results page on `servicesartisans.fr/rge`. No
cookies, no third-party scripts, no PII collected on the embed itself.

> **Caching tip** : prefer the static path `…/embed/rge-v1.js` over the
> dynamic endpoint `…/api/v1/embed/rge-snippet`. Both are byte-equal and
> publicly cacheable, but the static one is served by the CDN edge
> directly.

## 2. Config options (`window.SARGEConfig`)

| Key         | Type   | Default                         | Notes                                                                                                                    |
| ----------- | ------ | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `container` | string | `'#sa-rge-search'`              | CSS selector for the host element. Must exist when the script runs.                                                      |
| `metier`    | string | `'all'`                         | One of: `pompe-a-chaleur`, `isolation`, `photovoltaique`, `chauffage`, `vmc`, `audit-energetique`, `menuiseries`, `all`. |
| `theme`     | string | `'light'`                       | `light`, `dark`, or `auto`. Anything else falls back to `light`.                                                         |
| `ville`     | string | _empty_                         | Pre-fill the city input. Truncated to 50 chars, non-letter/number/space chars stripped server-side.                      |
| `origin`    | string | `'https://servicesartisans.fr'` | Override for staging environments. Production should not change this.                                                    |

Invalid `metier` or `theme` values are silently coerced to the default —
the widget never throws on bad config.

## 3. Sandbox & security model

The injected `<iframe>` ships with `sandbox="allow-forms allow-scripts
allow-top-navigation allow-popups"`. This is the minimum surface needed
for the form to submit to the parent window. We deliberately omit
`allow-same-origin` so the embed cannot read the host's storage.

The form uses `target="_top"`, which means submission **navigates the
top-level browsing context** away from the host site to
`servicesartisans.fr`. Make sure your readers expect this (use the
attribution copy below to surface the link).

The iframe document is served with :

- `X-Frame-Options: ALLOWALL` (waived) — we explicitly authorise framing.
- `Content-Security-Policy: frame-ancestors *` on the API endpoint.
- `Access-Control-Allow-Origin: *` on the JS loader.

## 4. Examples

### 4.1 Light theme, pre-filled métier

```html
<div id="sa-rge-search"></div>
<script src="https://servicesartisans.fr/embed/rge-v1.js" async></script>
<script>
  window.SARGEConfig = { metier: 'pompe-a-chaleur' }
</script>
```

### 4.2 Dark theme

```html
<div id="sa-rge-search"></div>
<script src="https://servicesartisans.fr/embed/rge-v1.js" async></script>
<script>
  window.SARGEConfig = { theme: 'dark', metier: 'isolation' }
</script>
```

### 4.3 Pre-filled ville (regional press)

```html
<div id="sa-rge-search"></div>
<script src="https://servicesartisans.fr/embed/rge-v1.js" async></script>
<script>
  window.SARGEConfig = { metier: 'vmc', ville: 'Lyon' }
</script>
```

### 4.4 Multiple widgets on one page

```html
<div id="block-pac"></div>
<div id="block-iso"></div>
<script src="https://servicesartisans.fr/embed/rge-v1.js" async></script>
<script>
  // Only the LAST config wins with the current loader. For multiple
  // widgets, mount the iframe yourself (see §6 Advanced).
  window.SARGEConfig = { container: '#block-pac', metier: 'pompe-a-chaleur' }
</script>
```

## 5. CSP guidance for strict hosts

If your host page sets a strict `Content-Security-Policy`, allow :

```
script-src       https://servicesartisans.fr ;
frame-src        https://servicesartisans.fr ;
form-action      https://servicesartisans.fr ;
```

The widget does **not** require `unsafe-inline`, `unsafe-eval`, or any
third-party domain beyond `servicesartisans.fr`.

## 6. Advanced — mount your own iframe

If you cannot run the loader script (or want multiple instances), embed
the iframe directly :

```html
<iframe
  src="https://servicesartisans.fr/embed/rge?metier=pompe-a-chaleur&theme=light&ville=Lyon"
  title="Recherche artisan RGE — ServicesArtisans"
  loading="lazy"
  sandbox="allow-forms allow-scripts allow-top-navigation allow-popups"
  style="width:100%;min-height:120px;border:0;display:block"
></iframe>
```

The URL contract :

- Path : `/embed/rge`
- Query string :
  - `metier` (whitelist — see §2 ; invalid → `all`)
  - `theme` (`light` | `dark` | `auto` ; invalid → `light`)
  - `ville` (50 chars max, sanitised)

The page is `noindex,nofollow,nocache,noarchive` — it will never appear
in Google.

## 7. Attribution requirement (CC-BY 4.0)

The widget displays a footer line :

> Powered by [ServicesArtisans](https://servicesartisans.fr) — Source :
> Registre RGE ADEME (CC-BY 4.0).

**Do not remove or obscure it.** This footer is the attribution required
by the open data sources (ADEME RGE registry, CC-BY 4.0) and by SA's own
publishing terms.

## 8. Roadmap v0.2+

- **Barème simulator widget** (`<sa-bareme-simulator>`) — pre-rendered
  MaPrimeRénov + CEE estimate aligned with the deterministic calculator
  shipped in Ralph 11–12.
- **Transparency badge widget** (`<sa-transparency-badge>`) — a small
  badge linking to `/transparence-ia` (Ralph 18) for sites that disclose
  AI usage.
- **React drop-in** (`@servicesartisans/embed-react`) — SPA hosts that
  prefer a component over a `<script>` tag.
- **Server-side render mode** — pre-rendered HTML for AMP / no-JS hosts.

## 9. Related

- Open API contracts : `docs/API-V1-OPENAPI.yaml`
- RGE-OS manifesto : `docs/RGE-OS-MANIFESTO.md`
- Indice Rénovation embed (different surface) :
  `/api/v1/barometre/renovation/embed.html`
- Transparency disclosure : `/transparence-ia` (Ralph 18 — referenced by
  the planned v0.2 badge widget).
