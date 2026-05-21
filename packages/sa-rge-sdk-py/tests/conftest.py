"""Pytest fixtures + fake HTTP opener used by all transport tests.

We never hit the network. The fake opener returns canned responses
from a queue and records every Request it received so assertions
can inspect URL, method, body, headers.
"""
from __future__ import annotations

import io
import json
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import pytest


# Make `src/` importable without installing the package.
ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))


@dataclass
class CannedResponse:
    status: int = 200
    body: Any = None
    headers: dict[str, str] = field(default_factory=dict)

    def body_bytes(self) -> bytes:
        if self.body is None:
            return b""
        if isinstance(self.body, (bytes, bytearray)):
            return bytes(self.body)
        if isinstance(self.body, str):
            return self.body.encode("utf-8")
        return json.dumps(self.body).encode("utf-8")


class _FakeHeaders:
    def __init__(self, headers: dict[str, str]) -> None:
        self._headers = headers

    def items(self) -> list[tuple[str, str]]:
        return list(self._headers.items())

    def get(self, key: str, default: Any = None) -> Any:
        for k, v in self._headers.items():
            if k.lower() == key.lower():
                return v
        return default


class _FakeResponse:
    def __init__(self, status: int, body: bytes, headers: dict[str, str]) -> None:
        self.status = status
        self._buf = io.BytesIO(body)
        self.headers = _FakeHeaders(headers)

    def read(self) -> bytes:
        return self._buf.read()


@dataclass
class CapturedRequest:
    method: str
    url: str
    headers: dict[str, str]
    body: bytes | None

    def json_body(self) -> Any:
        if not self.body:
            return None
        return json.loads(self.body.decode("utf-8"))


class FakeOpener:
    """Callable matching the HttpOpener signature.

    `queue` holds canned responses consumed in FIFO order; if queue
    is empty we re-emit the last response (useful for tests that
    don't care about a per-call response).
    """

    def __init__(self, queue: list[CannedResponse] | None = None) -> None:
        self.queue: list[CannedResponse] = list(queue or [])
        self.calls: list[CapturedRequest] = []

    def __call__(self, req: urllib.request.Request, timeout: float) -> _FakeResponse:
        captured = CapturedRequest(
            method=req.get_method(),
            url=req.full_url,
            headers=dict(req.headers),
            body=req.data,
        )
        self.calls.append(captured)
        if not self.queue:
            raise RuntimeError("FakeOpener queue exhausted")
        canned = self.queue.pop(0)
        body_bytes = canned.body_bytes()
        if canned.status >= 400:
            err = urllib.error.HTTPError(
                url=req.full_url,
                code=canned.status,
                msg=f"HTTP {canned.status}",
                hdrs=_FakeHeaders(canned.headers),
                fp=io.BytesIO(body_bytes),
            )
            err.headers = _FakeHeaders(canned.headers)
            raise err
        return _FakeResponse(canned.status, body_bytes, canned.headers)


@pytest.fixture
def fake_opener() -> FakeOpener:
    return FakeOpener()


@pytest.fixture
def no_sleep() -> list[float]:
    """Replacement for time.sleep that records calls without blocking."""
    return []


@pytest.fixture
def fixed_random() -> Any:
    """Random fn that returns 0.0 (no jitter) for deterministic backoff."""
    return lambda: 0.0
