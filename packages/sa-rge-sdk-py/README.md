# sa-rge-sdk

Official Python SDK for the [ServicesArtisans](https://servicesartisans.fr) RGE-OS public API.

Companion of [`@servicesartisans/rge-sdk`](https://github.com/servicesartisans/rge-sdk) (TypeScript) — same surface, same retry semantics, same webhook signing scheme. Zero runtime dependencies (stdlib only: `urllib`, `json`, `hmac`).

## Install

```bash
pip install sa-rge-sdk
```

(While the package is still pre-PyPI, install from source:)

```bash
pip install "git+https://github.com/servicesartisans/rge-sdk-py.git@v0.1.0"
```

Requires Python 3.10+.

## Quick start

### Lookup an RGE artisan by SIRET

```python
from sa_rge_sdk import Client

c = Client()
artisan = c.rge_lookup(siret="12345678901234")
if artisan:
    print(artisan.name, "in", artisan.address_city)
    for q in artisan.qualifications:
        print("  -", q.get("label"))
```

### Ask the AI assistant a question

```python
result = c.ask(query="Quelles aides pour une pompe a chaleur en zone H1 ?")
if result.ok:
    print(result.answer)
    for citation in result.citations:
        print(" ", citation.title, "->", citation.url)
```

### Receive webhooks securely

```python
from sa_rge_sdk import verify_signature

def handle_webhook(raw_body: bytes, signature: str, timestamp: str, secret: str) -> bool:
    ok, reason = verify_signature(raw_body, signature, timestamp, secret)
    if not ok:
        # log reason and reject (HTTP 401)
        return False
    # safe to process - body is authenticated and within 5-min replay window
    return True
```

See `examples/webhook_receiver_flask.py` for a runnable Flask receiver.

## Authentication

Most endpoints are **public** (open-data RGE/aides/ask). For rate-limit elevation or private endpoints (webhooks management, session bind), pass an API key:

```python
c = Client(api_key="key_xxx")
```

The key is forwarded as `Authorization: Bearer <key>`.

## Error handling

All errors inherit from `SaRgeError`. The SDK maps HTTP status to a typed exception so you can `except` precisely:

| Status          | Exception         | Notes                                                    |
| --------------- | ----------------- | -------------------------------------------------------- |
| 400-4xx (other) | `ValidationError` | Request payload rejected.                                |
| 401 / 403       | `AuthError`       | Missing / invalid key, or insufficient permission.       |
| 404             | `NotFoundError`   | Resource doesn't exist.                                  |
| 429             | `RateLimitError`  | `retry_after_seconds` populated when server provides it. |
| 5xx / network   | `ServerError`     | Upstream failure. Already retried up to 3 times.         |

```python
from sa_rge_sdk import NotFoundError, RateLimitError, SaRgeError

try:
    c.rge_lookup(siret="00000000000000")
except NotFoundError:
    print("Unknown SIRET")
except RateLimitError as e:
    print(f"Slow down - retry after {e.retry_after_seconds}s")
except SaRgeError as e:
    print(f"API error (status={e.status}, code={e.code}): {e}")
```

## Retry policy

On `429`, `5xx`, or network failure the SDK retries up to **3 times** (configurable via `max_retries`). Backoff is `(0.2s, 1.0s, 4.0s)` with 25% jitter. `Retry-After` is honored when the server provides it.

## Webhook receiver

Server signs every delivery with `HMAC-SHA256(secret, "{timestamp}.{body}")` and sends:

- `X-SA-Signature: <hex>`
- `X-SA-Timestamp: <unix-seconds>`

Use `verify_signature(raw_body, sig, ts, secret)`. The check is **timing-safe** (`hmac.compare_digest`) and rejects events older than **5 minutes** (replay window).

```python
ok, reason = verify_signature(raw_body, sig, ts, secret)
# reason is one of:
#   "ok" | "missing_signature" | "missing_timestamp" |
#   "invalid_timestamp" | "replay_window_exceeded" | "signature_mismatch"
```

## Local development

```bash
git clone https://github.com/servicesartisans/rge-sdk-py.git
cd rge-sdk-py
pip install -e ".[dev]"
pytest -q
```

## Reference

- OpenAPI spec : https://servicesartisans.fr/api/v1/openapi/json
- API catalog : https://servicesartisans.fr/developpeurs/api-catalog
- AsyncAPI (webhooks) : https://servicesartisans.fr/api/v1/asyncapi/json

## License

MIT - see [LICENSE](./LICENSE).
