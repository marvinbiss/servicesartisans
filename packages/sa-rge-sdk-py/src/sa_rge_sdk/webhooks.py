"""Signature verification for incoming webhooks.

The server (/api/v1/webhooks/*) signs every delivery with:
    signature = hex( HMAC-SHA256(secret, "{timestamp}.{body}") )
And sends as header X-SA-Signature and X-SA-Timestamp. Replay
window is 5 minutes - we reject events older than that.
"""
from __future__ import annotations

import hashlib
import hmac
import time
from typing import Any, Callable


REPLAY_WINDOW_SECONDS = 5 * 60


def _safe_int(raw: Any) -> int | None:
    try:
        return int(str(raw))
    except (TypeError, ValueError):
        return None


def compute_signature(secret: str, timestamp: int, raw_body: bytes) -> str:
    """Match server-side signing scheme: HMAC-SHA256("{ts}.{body}")."""
    if not isinstance(raw_body, (bytes, bytearray)):
        raise TypeError("raw_body must be bytes")
    msg = f"{int(timestamp)}.".encode("ascii") + bytes(raw_body)
    return hmac.new(secret.encode("utf-8"), msg, hashlib.sha256).hexdigest()


def verify_signature(
    raw_body: bytes,
    signature_header: str | None,
    timestamp_header: str | int | None,
    secret: str,
    *,
    now_fn: Callable[[], float] | None = None,
    replay_window: int = REPLAY_WINDOW_SECONDS,
) -> tuple[bool, str]:
    """Verify an incoming webhook signature.

    Returns (ok, reason).
    Reasons : "ok" | "missing_signature" | "missing_timestamp" |
              "invalid_timestamp" | "replay_window_exceeded" |
              "signature_mismatch"
    """
    if not signature_header or not isinstance(signature_header, str):
        return False, "missing_signature"
    if timestamp_header is None or timestamp_header == "":
        return False, "missing_timestamp"
    ts = _safe_int(timestamp_header)
    if ts is None:
        return False, "invalid_timestamp"
    now = int((now_fn or time.time)())
    if abs(now - ts) > replay_window:
        return False, "replay_window_exceeded"
    expected = compute_signature(secret, ts, raw_body)
    if not hmac.compare_digest(expected, signature_header):
        return False, "signature_mismatch"
    return True, "ok"
