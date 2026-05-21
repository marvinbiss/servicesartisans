"""HMAC-SHA256 signature verification tests."""
from __future__ import annotations

import hashlib
import hmac

import pytest

from sa_rge_sdk.webhooks import (
    REPLAY_WINDOW_SECONDS,
    compute_signature,
    verify_signature,
)


SECRET = "whsec_test_1234567890"
BODY = b'{"event":"rge.updated","data":{"siret":"12345678901234"}}'


def _sign(secret: str, ts: int, body: bytes) -> str:
    msg = f"{ts}.".encode("ascii") + body
    return hmac.new(secret.encode("utf-8"), msg, hashlib.sha256).hexdigest()


def test_compute_signature_deterministic() -> None:
    a = compute_signature(SECRET, 1700000000, BODY)
    b = compute_signature(SECRET, 1700000000, BODY)
    assert a == b
    assert a == _sign(SECRET, 1700000000, BODY)


def test_compute_signature_requires_bytes() -> None:
    with pytest.raises(TypeError):
        compute_signature(SECRET, 1700000000, "not-bytes")  # type: ignore[arg-type]


def test_verify_signature_ok() -> None:
    ts = 1700000000
    sig = _sign(SECRET, ts, BODY)
    ok, reason = verify_signature(BODY, sig, ts, SECRET, now_fn=lambda: ts)
    assert ok is True
    assert reason == "ok"


def test_verify_signature_missing_signature() -> None:
    ok, reason = verify_signature(BODY, None, 1700000000, SECRET, now_fn=lambda: 1700000000)
    assert ok is False
    assert reason == "missing_signature"


def test_verify_signature_empty_signature() -> None:
    ok, reason = verify_signature(BODY, "", 1700000000, SECRET, now_fn=lambda: 1700000000)
    assert ok is False
    assert reason == "missing_signature"


def test_verify_signature_missing_timestamp() -> None:
    sig = _sign(SECRET, 1700000000, BODY)
    ok, reason = verify_signature(BODY, sig, None, SECRET, now_fn=lambda: 1700000000)
    assert ok is False
    assert reason == "missing_timestamp"


def test_verify_signature_invalid_timestamp_text() -> None:
    sig = _sign(SECRET, 1700000000, BODY)
    ok, reason = verify_signature(BODY, sig, "not-a-number", SECRET, now_fn=lambda: 1700000000)
    assert ok is False
    assert reason == "invalid_timestamp"


def test_verify_signature_replay_window_stale() -> None:
    ts = 1700000000
    sig = _sign(SECRET, ts, BODY)
    now = ts + REPLAY_WINDOW_SECONDS + 1
    ok, reason = verify_signature(BODY, sig, ts, SECRET, now_fn=lambda: now)
    assert ok is False
    assert reason == "replay_window_exceeded"


def test_verify_signature_replay_window_future() -> None:
    ts = 1700000000
    sig = _sign(SECRET, ts, BODY)
    now = ts - REPLAY_WINDOW_SECONDS - 1
    ok, reason = verify_signature(BODY, sig, ts, SECRET, now_fn=lambda: now)
    assert ok is False
    assert reason == "replay_window_exceeded"


def test_verify_signature_wrong_secret() -> None:
    ts = 1700000000
    sig = _sign("other-secret", ts, BODY)
    ok, reason = verify_signature(BODY, sig, ts, SECRET, now_fn=lambda: ts)
    assert ok is False
    assert reason == "signature_mismatch"


def test_verify_signature_wrong_body() -> None:
    ts = 1700000000
    sig = _sign(SECRET, ts, b"some-other-body")
    ok, reason = verify_signature(BODY, sig, ts, SECRET, now_fn=lambda: ts)
    assert ok is False
    assert reason == "signature_mismatch"


def test_verify_signature_accepts_timestamp_as_string() -> None:
    ts = 1700000000
    sig = _sign(SECRET, ts, BODY)
    ok, reason = verify_signature(BODY, sig, str(ts), SECRET, now_fn=lambda: ts)
    assert ok is True
    assert reason == "ok"


def test_verify_signature_uses_default_now_when_not_injected() -> None:
    # Just verify no crash; correctness covered by other tests using now_fn.
    sig = _sign(SECRET, 1, BODY)
    ok, reason = verify_signature(BODY, sig, 1, SECRET)
    assert ok is False
    assert reason == "replay_window_exceeded"
