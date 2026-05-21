# Quickstart - sa-rge-sdk

Five-minute tour of the Python SDK. For the full surface see [API catalog](https://servicesartisans.fr/developpeurs/api-catalog).

## 1. Install

```bash
pip install sa-rge-sdk
```

Requires Python 3.10+. No transitive dependencies - the SDK uses `urllib`, `json`, and `hmac` from the standard library only.

## 2. Create a Client

```python
from sa_rge_sdk import Client

c = Client()  # uses https://servicesartisans.fr by default
```

For a private or staging deployment:

```python
c = Client(base_url="https://staging.servicesartisans.fr", api_key="key_xxx")
```

The Client is **stateless** and **thread-safe** for the methods exposed here - share one instance across your app.

## 3. RGE artisan lookup

```python
artisan = c.rge_lookup(siret="12345678901234")
if artisan is None:
    print("not found")
else:
    print(artisan.name, "-", artisan.address_city, artisan.address_department)
```

Returns a `Provider | None`. Pure-public endpoint - no API key required.

## 4. RGE artisan search

```python
results = c.rge_search(qualification="5911", department="75", limit=10)
for p in results:
    print(p.name, p.siret)
```

Filters are AND'd server-side. `qualification` matches Qualibat / Qualifelec / Qualit-EnR codes.

## 5. MaPrimeRenov / CEE simulation

```python
aides = c.aides_mpr_bareme(travaux="pac-air-eau", revenu_categorie="bleu", surface=100)
for a in aides:
    print(a.nom, a.montant, "EUR")

cee = c.aides_cee_bareme(travaux="pac-air-eau", revenu_categorie="bleu")
print("CEE prime:", cee.get("prime"))
```

## 6. Ask the AI assistant

```python
result = c.ask(
    query="Je suis proprietaire, revenus modestes, PAC eligible ?",
    aides_context={"departement": "75"},
)
print(result.ok, result.answer)
for c_ in result.citations:
    print("  source:", c_.title, c_.url)
```

The assistant is YMYL-bounded: it cites france-renov.gouv.fr and ServicesArtisans authored content.

## 7. Multi-turn conversations (sessions)

```python
sess = c.sessions_create()
print(sess.session_id, sess.expires_at)

r1 = c.sessions_send_message(
    session_id=sess.session_id, public_key=sess.public_key,
    query="Bonjour, je suis en zone H1",
)
r2 = c.sessions_send_message(
    session_id=sess.session_id, public_key=sess.public_key,
    query="Et pour une isolation des combles ?",
)
print(r2.answer)

history = c.sessions_history(session_id=sess.session_id, public_key=sess.public_key)
print(f"{len(history)} messages")
```

## 8. Webhooks - subscribe

```python
sub = c.webhooks_subscribe(
    url="https://your-app.example/sa-webhook",
    events=["rge.updated", "rge.deleted"],
    email="ops@your-app.example",
)
print("Webhook id:", sub["id"])
print("Secret (store securely):", sub["secret"])
```

## 9. Webhooks - verify incoming deliveries

```python
from sa_rge_sdk import verify_signature

def on_delivery(raw_body: bytes, headers: dict, secret: str) -> None:
    sig = headers.get("x-sa-signature")
    ts = headers.get("x-sa-timestamp")
    ok, reason = verify_signature(raw_body, sig, ts, secret)
    if not ok:
        raise ValueError(f"reject: {reason}")
    # ... process body
```

The check is timing-safe and rejects deliveries older than 5 minutes (replay window).

## 10. Error handling

```python
from sa_rge_sdk import (
    NotFoundError, RateLimitError, ValidationError, AuthError, ServerError, SaRgeError,
)

try:
    c.rge_lookup(siret="00000000000000")
except NotFoundError:
    ...
except RateLimitError as e:
    # wait e.retry_after_seconds before retrying
    ...
except (ValidationError, AuthError):
    ...
except ServerError:
    # already retried 3x with backoff - upstream still failing
    ...
except SaRgeError:
    ...
```

## Next steps

- Browse the [API catalog](https://servicesartisans.fr/developpeurs/api-catalog)
- Read the [OpenAPI spec](https://servicesartisans.fr/api/v1/openapi/json)
- Webhooks contract: [AsyncAPI spec](https://servicesartisans.fr/api/v1/asyncapi/json)
- Status page: https://servicesartisans.fr/status
