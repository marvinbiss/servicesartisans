"""HTTP transport for the ServicesArtisans RGE-OS public API.

Stdlib-only. Tests inject a fake opener to avoid hitting the
network. Retry-with-backoff on 429 + 5xx, max 3 attempts, jittered
(200ms, 1s, 4s) (matches server-side retry semantics - Ralph 29).
"""
from __future__ import annotations

import json
import random
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from typing import Any, Callable

from ._version import __version__
from .errors import (
    AuthError,
    NotFoundError,
    RateLimitError,
    SaRgeError,
    ServerError,
    ValidationError,
)
from .types import (
    AskResult,
    MprAide,
    Provider,
    Session,
    Webhook,
)


DEFAULT_BASE_URL = "https://servicesartisans.fr"
DEFAULT_TIMEOUT_SECONDS = 30
DEFAULT_MAX_RETRIES = 3
RETRY_BACKOFFS_SECONDS = (0.2, 1.0, 4.0)


HttpOpener = Callable[[urllib.request.Request, float], Any]


def _default_opener(req: urllib.request.Request, timeout: float) -> Any:  # pragma: no cover
    return urllib.request.urlopen(req, timeout=timeout)


@dataclass
class _RawResponse:
    status: int
    headers: dict[str, str]
    body_bytes: bytes


class Client:
    def __init__(
        self,
        *,
        base_url: str = DEFAULT_BASE_URL,
        api_key: str | None = None,
        timeout: float = DEFAULT_TIMEOUT_SECONDS,
        user_agent: str | None = None,
        max_retries: int = DEFAULT_MAX_RETRIES,
        opener: HttpOpener | None = None,
        sleep_fn: Callable[[float], None] | None = None,
        random_fn: Callable[[], float] | None = None,
    ) -> None:
        if not base_url.startswith(("http://", "https://")):
            raise ValueError("base_url must start with http(s)://")
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.timeout = float(timeout)
        self.user_agent = user_agent or f"sa-rge-sdk-py/{__version__}"
        self.max_retries = int(max_retries)
        self._opener = opener or _default_opener
        self._sleep = sleep_fn or time.sleep
        self._random = random_fn or random.random

    # ---------------- transport ----------------

    def _request(
        self,
        method: str,
        path: str,
        *,
        params: dict | None = None,
        body: dict | None = None,
        headers: dict[str, str] | None = None,
    ) -> dict:
        url = self.base_url + path
        if params:
            qs = urllib.parse.urlencode({k: v for k, v in params.items() if v is not None})
            if qs:
                url = url + ("&" if "?" in url else "?") + qs

        body_bytes: bytes | None = None
        merged_headers = {
            "Accept": "application/json",
            "User-Agent": self.user_agent,
        }
        if headers:
            merged_headers.update(headers)
        if body is not None:
            body_bytes = json.dumps(body, ensure_ascii=False).encode("utf-8")
            merged_headers.setdefault("Content-Type", "application/json")
        if self.api_key:
            merged_headers.setdefault("Authorization", f"Bearer {self.api_key}")

        last_exc: SaRgeError | None = None
        for attempt in range(self.max_retries + 1):
            req = urllib.request.Request(
                url=url, data=body_bytes, headers=merged_headers, method=method
            )
            try:
                raw = self._send(req)
            except urllib.error.URLError as exc:
                if attempt < self.max_retries:
                    self._backoff(attempt)
                    continue
                raise ServerError(f"network error: {exc}", status=None) from exc

            if 200 <= raw.status < 300:
                return self._decode_json(raw)

            if raw.status == 429 and attempt < self.max_retries:
                retry_after = self._parse_retry_after(raw.headers.get("retry-after"))
                if retry_after is not None:
                    self._sleep(retry_after)
                else:
                    self._backoff(attempt)
                continue
            if 500 <= raw.status < 600 and attempt < self.max_retries:
                self._backoff(attempt)
                continue

            last_exc = self._map_error(raw)
            break

        if last_exc is None:
            raise ServerError("unreachable: no response", status=None)
        raise last_exc

    def _send(self, req: urllib.request.Request) -> _RawResponse:
        try:
            resp = self._opener(req, self.timeout)
            data = resp.read()
            headers_iter = resp.headers.items() if hasattr(resp, "headers") and resp.headers else []
            headers = {k.lower(): v for k, v in headers_iter}
            status = int(getattr(resp, "status", 200))
            return _RawResponse(status=status, headers=headers, body_bytes=data)
        except urllib.error.HTTPError as exc:
            data = exc.read() if hasattr(exc, "read") else b""
            headers_iter = exc.headers.items() if exc.headers else []
            headers = {k.lower(): v for k, v in headers_iter}
            return _RawResponse(status=int(exc.code), headers=headers, body_bytes=data)

    def _decode_json(self, raw: _RawResponse) -> dict:
        if not raw.body_bytes:
            return {}
        try:
            value = json.loads(raw.body_bytes.decode("utf-8"))
            return value if isinstance(value, dict) else {"_raw": value}
        except (json.JSONDecodeError, UnicodeDecodeError) as exc:
            raise ServerError("invalid JSON in response", status=raw.status) from exc

    def _map_error(self, raw: _RawResponse) -> SaRgeError:
        try:
            payload = json.loads(raw.body_bytes.decode("utf-8")) if raw.body_bytes else {}
        except (json.JSONDecodeError, UnicodeDecodeError):
            payload = {}
        err = payload.get("error") if isinstance(payload, dict) else None
        code = err.get("code") if isinstance(err, dict) else None
        msg = (err.get("message") if isinstance(err, dict) else None) or f"HTTP {raw.status}"
        body = payload if isinstance(payload, dict) else None
        status = raw.status

        if status == 401 or status == 403:
            return AuthError(msg, status=status, code=code, body=body)
        if status == 404:
            return NotFoundError(msg, status=status, code=code, body=body)
        if status == 429:
            return RateLimitError(
                msg,
                status=status,
                code=code,
                body=body,
                retry_after_seconds=self._parse_retry_after(raw.headers.get("retry-after")),
            )
        if 400 <= status < 500:
            return ValidationError(msg, status=status, code=code, body=body)
        return ServerError(msg, status=status, code=code, body=body)

    def _parse_retry_after(self, value: str | None) -> int | None:
        if value is None:
            return None
        try:
            return max(0, int(float(value)))
        except (TypeError, ValueError):
            return None

    def _backoff(self, attempt: int) -> None:
        base = RETRY_BACKOFFS_SECONDS[min(attempt, len(RETRY_BACKOFFS_SECONDS) - 1)]
        jitter = base * 0.25 * self._random()
        self._sleep(base + jitter)

    # ---------------- RGE ----------------

    def rge_lookup(self, *, siret: str) -> Provider | None:
        if not siret or not isinstance(siret, str):
            raise ValueError("siret must be a non-empty string")
        data = self._request("GET", "/api/v1/rge/lookup", params={"siret": siret})
        row = data.get("provider") or data.get("data")
        return Provider.from_dict(row) if isinstance(row, dict) else None

    def rge_search(
        self,
        *,
        qualification: str | None = None,
        department: str | None = None,
        city: str | None = None,
        limit: int = 20,
    ) -> list[Provider]:
        data = self._request(
            "GET",
            "/api/v1/rge/search",
            params={
                "qualification": qualification,
                "department": department,
                "city": city,
                "limit": str(int(limit)),
            },
        )
        rows = data.get("results") or data.get("data") or []
        return [Provider.from_dict(r) for r in rows if isinstance(r, dict)]

    # ---------------- Aides ----------------

    def aides_mpr_bareme(
        self,
        *,
        travaux: str,
        revenu_categorie: str,
        surface: int | None = None,
    ) -> list[MprAide]:
        params: dict = {"travaux": travaux, "revenu_categorie": revenu_categorie}
        if surface is not None:
            params["surface"] = str(int(surface))
        data = self._request("GET", "/api/v1/aides/mpr-bareme", params=params)
        rows = data.get("aides") or []
        return [MprAide.from_dict(r) for r in rows if isinstance(r, dict)]

    def aides_cee_bareme(
        self,
        *,
        travaux: str,
        revenu_categorie: str | None = None,
        surface: int | None = None,
    ) -> dict:
        params: dict = {"travaux": travaux}
        if revenu_categorie:
            params["revenu_categorie"] = revenu_categorie
        if surface is not None:
            params["surface"] = str(int(surface))
        return self._request("GET", "/api/v1/aides/cee-bareme", params=params)

    def aides_cumul_rules(self, *, travaux: str | None = None) -> dict:
        params = {"travaux": travaux} if travaux else None
        return self._request("GET", "/api/v1/aides/cumul-rules", params=params)

    # ---------------- Ask ----------------

    def ask(self, *, query: str, aides_context: dict | None = None) -> AskResult:
        body: dict = {"query": query}
        if aides_context:
            body["aidesContext"] = aides_context
        data = self._request("POST", "/api/v1/ask", body=body)
        result = data.get("result") or data
        if not isinstance(result, dict):
            return AskResult(
                ok=False,
                answer=None,
                classification=None,
                citations=[],
                trace=None,
                reason="unexpected_payload",
            )
        return AskResult.from_dict(result)

    # ---------------- Ask sessions ----------------

    def sessions_create(self) -> Session:
        data = self._request("POST", "/api/v1/ask/sessions", body={})
        return Session.from_dict(data)

    def sessions_send_message(
        self,
        *,
        session_id: str,
        public_key: str,
        query: str,
        aides_context: dict | None = None,
    ) -> AskResult:
        body: dict = {"query": query, "public_key": public_key}
        if aides_context:
            body["aidesContext"] = aides_context
        data = self._request(
            "POST",
            f"/api/v1/ask/sessions/{urllib.parse.quote(session_id)}/messages",
            body=body,
        )
        result = data.get("result") or data
        return AskResult.from_dict(result if isinstance(result, dict) else {})

    def sessions_history(self, *, session_id: str, public_key: str) -> list[dict]:
        data = self._request(
            "GET",
            f"/api/v1/ask/sessions/{urllib.parse.quote(session_id)}",
            params={"public_key": public_key},
        )
        return list(data.get("messages") or [])

    def sessions_delete(self, *, session_id: str, public_key: str) -> bool:
        data = self._request(
            "DELETE",
            f"/api/v1/ask/sessions/{urllib.parse.quote(session_id)}",
            body={"public_key": public_key},
        )
        return bool(data.get("ok", True))

    # ---------------- Webhooks ----------------

    def webhooks_subscribe(
        self, *, url: str, events: list[str], email: str | None = None
    ) -> dict:
        body: dict = {"url": url, "events": events}
        if email:
            body["email"] = email
        return self._request("POST", "/api/v1/webhooks/subscribe", body=body)

    def webhooks_unsubscribe(self, *, id: str, secret: str) -> bool:
        data = self._request(
            "DELETE", "/api/v1/webhooks/unsubscribe", body={"id": id, "secret": secret}
        )
        return bool(data.get("ok", True))

    def webhooks_list(self) -> list[Webhook]:
        data = self._request("GET", "/api/v1/webhooks/list")
        rows = data.get("webhooks") or []
        return [Webhook.from_dict(r) for r in rows if isinstance(r, dict)]

    def webhooks_test(self, *, id: str, secret: str, event: str) -> dict:
        return self._request(
            "POST", "/api/v1/webhooks/test", body={"id": id, "secret": secret, "event": event}
        )


__all__ = ["Client", "DEFAULT_BASE_URL"]
