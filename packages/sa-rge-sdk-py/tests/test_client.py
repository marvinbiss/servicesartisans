"""Transport, retry, and error-mapping tests for the Client class.

Uses the FakeOpener from conftest. No network access.
"""
from __future__ import annotations

import pytest

from sa_rge_sdk import (
    AuthError,
    Client,
    DEFAULT_BASE_URL,
    NotFoundError,
    RateLimitError,
    ServerError,
    ValidationError,
    __version__,
)


def _make_client(
    fake_opener,
    no_sleep,
    fixed_random,
    *,
    base_url: str = "https://api.test.local",
    api_key: str | None = None,
    max_retries: int = 3,
) -> Client:
    return Client(
        base_url=base_url,
        api_key=api_key,
        timeout=5,
        max_retries=max_retries,
        opener=fake_opener,
        sleep_fn=lambda s: no_sleep.append(s),
        random_fn=fixed_random,
    )


# ---------------- ctor ----------------


def test_default_base_url_and_user_agent() -> None:
    c = Client()
    assert c.base_url == DEFAULT_BASE_URL
    assert __version__ in c.user_agent
    assert "sa-rge-sdk-py" in c.user_agent


def test_custom_base_url_strips_trailing_slash() -> None:
    c = Client(base_url="https://x.example/")
    assert c.base_url == "https://x.example"


def test_invalid_base_url_raises() -> None:
    with pytest.raises(ValueError):
        Client(base_url="ftp://bad")
    with pytest.raises(ValueError):
        Client(base_url="not-a-url")


# ---------------- RGE ----------------


def test_rge_lookup_parses_provider(fake_opener, no_sleep, fixed_random) -> None:
    from tests.conftest import CannedResponse  # noqa: WPS433

    fake_opener.queue.append(
        CannedResponse(
            status=200,
            body={
                "provider": {
                    "siret": "12345678901234",
                    "name": "Acme",
                    "address_city": "Paris",
                    "address_department": "75",
                    "qualifications": [],
                }
            },
        )
    )
    c = _make_client(fake_opener, no_sleep, fixed_random)
    p = c.rge_lookup(siret="12345678901234")
    assert p is not None
    assert p.siret == "12345678901234"
    assert p.name == "Acme"
    assert len(fake_opener.calls) == 1
    call = fake_opener.calls[0]
    assert call.method == "GET"
    assert "/api/v1/rge/lookup" in call.url
    assert "siret=12345678901234" in call.url


def test_rge_lookup_rejects_empty_siret(fake_opener, no_sleep, fixed_random) -> None:
    c = _make_client(fake_opener, no_sleep, fixed_random)
    with pytest.raises(ValueError):
        c.rge_lookup(siret="")


def test_rge_lookup_404_raises_not_found(fake_opener, no_sleep, fixed_random) -> None:
    from tests.conftest import CannedResponse

    fake_opener.queue.append(
        CannedResponse(status=404, body={"error": {"code": "not_found", "message": "no such SIRET"}})
    )
    c = _make_client(fake_opener, no_sleep, fixed_random)
    with pytest.raises(NotFoundError) as ei:
        c.rge_lookup(siret="00000000000000")
    assert ei.value.status == 404
    assert ei.value.code == "not_found"


def test_rge_search_parses_list(fake_opener, no_sleep, fixed_random) -> None:
    from tests.conftest import CannedResponse

    fake_opener.queue.append(
        CannedResponse(
            status=200,
            body={
                "results": [
                    {"siret": "1", "name": "A"},
                    {"siret": "2", "name": "B"},
                    "garbage-non-dict",
                ]
            },
        )
    )
    c = _make_client(fake_opener, no_sleep, fixed_random)
    out = c.rge_search(qualification="5911", department="75", limit=2)
    assert len(out) == 2
    assert out[0].siret == "1"
    assert out[1].name == "B"
    call = fake_opener.calls[0]
    assert "qualification=5911" in call.url
    assert "department=75" in call.url
    assert "limit=2" in call.url


# ---------------- Aides ----------------


def test_aides_mpr_bareme_parses(fake_opener, no_sleep, fixed_random) -> None:
    from tests.conftest import CannedResponse

    fake_opener.queue.append(
        CannedResponse(
            status=200,
            body={
                "aides": [
                    {"nom": "MPR", "montant": 4000, "revenu_categorie": "bleu", "eligible": True},
                    {"nom": "Bonus", "montant": 500, "revenu_categorie": "bleu", "eligible": True},
                ]
            },
        )
    )
    c = _make_client(fake_opener, no_sleep, fixed_random)
    aides = c.aides_mpr_bareme(travaux="pac-air-eau", revenu_categorie="bleu", surface=100)
    assert len(aides) == 2
    assert aides[0].montant == 4000
    call = fake_opener.calls[0]
    assert "travaux=pac-air-eau" in call.url
    assert "revenu_categorie=bleu" in call.url
    assert "surface=100" in call.url


def test_aides_cee_bareme_returns_raw_dict(fake_opener, no_sleep, fixed_random) -> None:
    from tests.conftest import CannedResponse

    fake_opener.queue.append(
        CannedResponse(status=200, body={"prime": 1500, "operation": "BAR-TH-129"})
    )
    c = _make_client(fake_opener, no_sleep, fixed_random)
    out = c.aides_cee_bareme(travaux="pac-air-eau", revenu_categorie="modeste")
    assert out["prime"] == 1500
    assert out["operation"] == "BAR-TH-129"


def test_aides_cumul_rules(fake_opener, no_sleep, fixed_random) -> None:
    from tests.conftest import CannedResponse

    fake_opener.queue.append(CannedResponse(status=200, body={"rules": []}))
    c = _make_client(fake_opener, no_sleep, fixed_random)
    out = c.aides_cumul_rules(travaux="isolation")
    assert "rules" in out


# ---------------- Ask ----------------


def test_ask_200_parses_result(fake_opener, no_sleep, fixed_random) -> None:
    from tests.conftest import CannedResponse

    fake_opener.queue.append(
        CannedResponse(
            status=200,
            body={
                "result": {
                    "ok": True,
                    "answer": "ok",
                    "classification": "general",
                    "citations": [{"url": "https://x", "title": "X"}],
                }
            },
        )
    )
    c = _make_client(fake_opener, no_sleep, fixed_random)
    out = c.ask(query="quelles aides PAC ?")
    assert out.ok is True
    assert out.answer == "ok"
    assert len(out.citations) == 1
    call = fake_opener.calls[0]
    assert call.method == "POST"
    assert call.json_body() == {"query": "quelles aides PAC ?"}


def test_ask_with_aides_context(fake_opener, no_sleep, fixed_random) -> None:
    from tests.conftest import CannedResponse

    fake_opener.queue.append(CannedResponse(status=200, body={"result": {"ok": True}}))
    c = _make_client(fake_opener, no_sleep, fixed_random)
    c.ask(query="hello", aides_context={"revenu": "bleu"})
    sent = fake_opener.calls[0].json_body()
    assert sent == {"query": "hello", "aidesContext": {"revenu": "bleu"}}


def test_ask_ok_false_returns_reason(fake_opener, no_sleep, fixed_random) -> None:
    from tests.conftest import CannedResponse

    fake_opener.queue.append(
        CannedResponse(status=200, body={"ok": False, "reason": "off_topic"})
    )
    c = _make_client(fake_opener, no_sleep, fixed_random)
    out = c.ask(query="meteo")
    assert out.ok is False
    assert out.reason == "off_topic"


# ---------------- Sessions ----------------


def test_sessions_create(fake_opener, no_sleep, fixed_random) -> None:
    from tests.conftest import CannedResponse

    fake_opener.queue.append(
        CannedResponse(
            status=201,
            body={
                "session_id": "sess_1",
                "public_key": "pk_1",
                "expires_at": "2026-06-01T00:00:00Z",
                "message_cap": 50,
            },
        )
    )
    c = _make_client(fake_opener, no_sleep, fixed_random)
    s = c.sessions_create()
    assert s.session_id == "sess_1"
    assert s.public_key == "pk_1"
    assert s.message_cap == 50


def test_sessions_send_message(fake_opener, no_sleep, fixed_random) -> None:
    from tests.conftest import CannedResponse

    fake_opener.queue.append(
        CannedResponse(status=200, body={"result": {"ok": True, "answer": "hi"}})
    )
    c = _make_client(fake_opener, no_sleep, fixed_random)
    out = c.sessions_send_message(session_id="sess_1", public_key="pk_1", query="hello")
    assert out.ok is True
    assert out.answer == "hi"
    assert "/api/v1/ask/sessions/sess_1/messages" in fake_opener.calls[0].url
    assert fake_opener.calls[0].json_body() == {"query": "hello", "public_key": "pk_1"}


def test_sessions_history(fake_opener, no_sleep, fixed_random) -> None:
    from tests.conftest import CannedResponse

    fake_opener.queue.append(
        CannedResponse(status=200, body={"messages": [{"role": "user", "content": "hi"}]})
    )
    c = _make_client(fake_opener, no_sleep, fixed_random)
    msgs = c.sessions_history(session_id="sess_1", public_key="pk_1")
    assert len(msgs) == 1
    assert msgs[0]["role"] == "user"
    assert "public_key=pk_1" in fake_opener.calls[0].url


def test_sessions_delete(fake_opener, no_sleep, fixed_random) -> None:
    from tests.conftest import CannedResponse

    fake_opener.queue.append(CannedResponse(status=200, body={"ok": True}))
    c = _make_client(fake_opener, no_sleep, fixed_random)
    ok = c.sessions_delete(session_id="sess_1", public_key="pk_1")
    assert ok is True
    assert fake_opener.calls[0].method == "DELETE"


# ---------------- Webhooks ----------------


def test_webhooks_subscribe(fake_opener, no_sleep, fixed_random) -> None:
    from tests.conftest import CannedResponse

    fake_opener.queue.append(
        CannedResponse(status=201, body={"id": "wh_1", "secret": "whsec_xxx"})
    )
    c = _make_client(fake_opener, no_sleep, fixed_random)
    out = c.webhooks_subscribe(
        url="https://example.com/h", events=["rge.updated"], email="ops@x.com"
    )
    assert out["id"] == "wh_1"
    sent = fake_opener.calls[0].json_body()
    assert sent["url"] == "https://example.com/h"
    assert sent["events"] == ["rge.updated"]
    assert sent["email"] == "ops@x.com"


def test_webhooks_list(fake_opener, no_sleep, fixed_random) -> None:
    from tests.conftest import CannedResponse

    fake_opener.queue.append(
        CannedResponse(
            status=200,
            body={
                "webhooks": [
                    {
                        "id": "wh_1",
                        "url": "https://x/h",
                        "events": ["rge.updated"],
                        "enabled": True,
                    }
                ]
            },
        )
    )
    c = _make_client(fake_opener, no_sleep, fixed_random)
    out = c.webhooks_list()
    assert len(out) == 1
    assert out[0].id == "wh_1"


# ---------------- Error mapping ----------------


def test_401_raises_auth_error(fake_opener, no_sleep, fixed_random) -> None:
    from tests.conftest import CannedResponse

    fake_opener.queue.append(
        CannedResponse(status=401, body={"error": {"code": "unauthorized", "message": "missing key"}})
    )
    c = _make_client(fake_opener, no_sleep, fixed_random)
    with pytest.raises(AuthError) as ei:
        c.rge_lookup(siret="12345678901234")
    assert ei.value.status == 401
    assert ei.value.code == "unauthorized"


def test_403_raises_auth_error(fake_opener, no_sleep, fixed_random) -> None:
    from tests.conftest import CannedResponse

    fake_opener.queue.append(
        CannedResponse(status=403, body={"error": {"code": "forbidden", "message": "scope"}})
    )
    c = _make_client(fake_opener, no_sleep, fixed_random)
    with pytest.raises(AuthError):
        c.rge_lookup(siret="12345678901234")


def test_400_raises_validation_error(fake_opener, no_sleep, fixed_random) -> None:
    from tests.conftest import CannedResponse

    fake_opener.queue.append(
        CannedResponse(
            status=400, body={"error": {"code": "bad_param", "message": "siret invalid"}}
        )
    )
    c = _make_client(fake_opener, no_sleep, fixed_random)
    with pytest.raises(ValidationError) as ei:
        c.rge_lookup(siret="X")
    assert ei.value.code == "bad_param"
    assert ei.value.status == 400


def test_429_retries_then_succeeds(fake_opener, no_sleep, fixed_random) -> None:
    from tests.conftest import CannedResponse

    fake_opener.queue.extend(
        [
            CannedResponse(status=429, headers={"Retry-After": "0"}),
            CannedResponse(status=200, body={"provider": {"siret": "1"}}),
        ]
    )
    c = _make_client(fake_opener, no_sleep, fixed_random)
    p = c.rge_lookup(siret="1")
    assert p is not None
    assert p.siret == "1"
    assert len(fake_opener.calls) == 2
    # First retry honored Retry-After: 0
    assert no_sleep[0] == 0


def test_429_exhausted_raises_rate_limit(fake_opener, no_sleep, fixed_random) -> None:
    from tests.conftest import CannedResponse

    for _ in range(4):
        fake_opener.queue.append(
            CannedResponse(
                status=429,
                headers={"Retry-After": "7"},
                body={"error": {"code": "rate_limited", "message": "slow down"}},
            )
        )
    c = _make_client(fake_opener, no_sleep, fixed_random, max_retries=3)
    with pytest.raises(RateLimitError) as ei:
        c.rge_lookup(siret="1")
    assert ei.value.status == 429
    assert ei.value.retry_after_seconds == 7


def test_500_exhausted_raises_server_error(fake_opener, no_sleep, fixed_random) -> None:
    from tests.conftest import CannedResponse

    for _ in range(4):
        fake_opener.queue.append(CannedResponse(status=500, body={"error": {"message": "boom"}}))
    c = _make_client(fake_opener, no_sleep, fixed_random, max_retries=3)
    with pytest.raises(ServerError) as ei:
        c.rge_lookup(siret="1")
    assert ei.value.status == 500


def test_500_then_200_succeeds_on_retry(fake_opener, no_sleep, fixed_random) -> None:
    from tests.conftest import CannedResponse

    fake_opener.queue.extend(
        [
            CannedResponse(status=500, body={"error": {"message": "boom"}}),
            CannedResponse(status=200, body={"provider": {"siret": "9"}}),
        ]
    )
    c = _make_client(fake_opener, no_sleep, fixed_random, max_retries=3)
    p = c.rge_lookup(siret="9")
    assert p is not None
    assert p.siret == "9"
    assert len(fake_opener.calls) == 2
    # Backoff slept once (0.2 base + 0.0 jitter)
    assert no_sleep == pytest.approx([0.2])


def test_api_key_added_as_bearer(fake_opener, no_sleep, fixed_random) -> None:
    from tests.conftest import CannedResponse

    fake_opener.queue.append(CannedResponse(status=200, body={"provider": {}}))
    c = _make_client(fake_opener, no_sleep, fixed_random, api_key="key_abc")
    c.rge_lookup(siret="1")
    # urllib lowercases header keys when stored via .add_header.
    headers = {k.lower(): v for k, v in fake_opener.calls[0].headers.items()}
    assert headers.get("authorization") == "Bearer key_abc"


def test_body_excerpt_parsed_when_no_result_key(fake_opener, no_sleep, fixed_random) -> None:
    from tests.conftest import CannedResponse

    fake_opener.queue.append(
        CannedResponse(status=200, body={"ok": True, "answer": "direct payload"})
    )
    c = _make_client(fake_opener, no_sleep, fixed_random)
    out = c.ask(query="hi")
    assert out.ok is True
    assert out.answer == "direct payload"


def test_user_agent_includes_version() -> None:
    c = Client(user_agent="custom-agent/1.0")
    assert c.user_agent == "custom-agent/1.0"
