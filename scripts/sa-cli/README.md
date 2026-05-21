# sa-rge-os

Official CLI for the **ServicesArtisans RGE-OS** open-data + AI stack.

Pillar 9 of the [RGE-OS Manifesto](https://servicesartisans.fr/developpeurs). A
single zero-dependency Node binary that wraps the public SA REST endpoints
(RGE lookup, MaPrimeRénov' bareme, CEE bareme, AnswerEngine, RGE Spec).

## Why

The RGE-OS stack already exposes everything as REST and JSON. The CLI removes
the last bit of friction for:

- Journalists and data analysts pulling the daily bareme snapshot.
- Agency / partner devs prototyping a quote tool before wiring full HTTP.
- Sonergia / Effy / Hellio engineering teams scripting cache invalidation.
- Solo artisans checking their RGE certification by SIRET from the terminal.

Zero npm dependencies, Node 18.3+ native `parseArgs`, MIT licensed.

## Install

```bash
# Once published (planned: 2026-06):
npm install -g sa-rge-os

# Or run without installing:
npx sa-rge-os --help
```

Until then, clone the repo and run:

```bash
node scripts/sa-cli/bin/sa-rge-os.mjs --help
```

## Commands

| Command                             | Description                                                       |
| ----------------------------------- | ----------------------------------------------------------------- |
| `sa-rge-os lookup <siret>`          | Fetch a RGE provider by SIRET (14 digits).                        |
| `sa-rge-os search <metier> <ville>` | Search RGE providers by trade and city.                           |
| `sa-rge-os bareme mpr ...`          | Compute a MaPrimeRénov' 2026 amount.                              |
| `sa-rge-os bareme cee ...`          | Compute a CEE 2026 amount.                                        |
| `sa-rge-os ask "<query>"`           | Ask the SA AnswerEngine (RAG over RGE + bareme + reglementation). |
| `sa-rge-os spec [...]`              | Download the RGE Spec JSON Schema.                                |
| `sa-rge-os --help`                  | Print help.                                                       |
| `sa-rge-os --version`               | Print version.                                                    |

### Global flags

- `--output <format>` — `json` (default), `table`, or `csv`.
- `--base-url <url>` — Override the SA API base URL.

### Environment

- `SA_API_BASE_URL` — Same as `--base-url`. Default `https://servicesartisans.fr`.

## Examples

### Lookup a RGE provider

```bash
sa-rge-os lookup 12345678901234
sa-rge-os lookup 12345678901234 --output table
```

### Search providers

```bash
sa-rge-os search plombier lyon
sa-rge-os search "pompe-a-chaleur" paris --output csv > paris-pac.csv
```

### MaPrimeRénov' bareme

```bash
sa-rge-os bareme mpr \
  --geste pac-air-eau \
  --menage bleu \
  --zone H1 \
  --rfr 18000 \
  --nb 3
```

Sample output:

```json
{
  "geste": "pac-air-eau",
  "menage": "bleu",
  "zone": "H1",
  "montant": 5000,
  "plafond_travaux": 18000,
  "source": "Arrête MPR 2026"
}
```

### CEE bareme

```bash
sa-rge-os bareme cee \
  --geste isolation-combles \
  --zone H2 \
  --type maison \
  --menage jaune
```

### Ask the AnswerEngine

```bash
sa-rge-os ask "Quelle aide pour isoler les combles à Lyon en 2026 ?"

# With aides context for personalised simulation:
sa-rge-os ask "Combien je touche pour ma PAC ?" \
  --aides-geste pac-air-eau \
  --aides-menage bleu \
  --aides-zone H1 \
  --aides-rfr 18000 \
  --aides-nb 3
```

### RGE Spec

```bash
sa-rge-os spec                              # print to stdout
sa-rge-os spec --version v1.0 --output rge.json
```

## Output formats

The `--output` flag changes how data is serialized to stdout:

- `json` (default) — Pretty-printed JSON (2-space indent).
- `table` — Pipe-separated columns (handy for `grep` / `awk`).
- `csv` — RFC 4180 compliant (handles quotes and embedded commas).

## Exit codes

| Code | Meaning                                |
| ---- | -------------------------------------- |
| `0`  | Success.                               |
| `1`  | API error (4xx, 5xx) or write failure. |
| `2`  | Missing or invalid CLI argument.       |

## Development

```bash
cd scripts/sa-cli
node --test test/         # run the test suite (zero deps)
make smoke                # sanity-check --help and --version
```

## Contributing

Issues and pull requests welcome on
[github.com/servicesartisans/sa-rge-os](https://github.com/servicesartisans/sa-rge-os).

The CLI is intentionally minimal — keep it zero-dep. Heavy logic belongs
upstream in the REST endpoints, not in the client.

## License

MIT. See `LICENSE`.
