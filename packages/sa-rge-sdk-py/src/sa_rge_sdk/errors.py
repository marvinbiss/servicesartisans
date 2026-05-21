"""Exception hierarchy. All raised by Client transport layer."""
from __future__ import annotations


class SaRgeError(Exception):
    """Base error for the SA RGE-OS SDK."""

    def __init__(
        self,
        message: str,
        *,
        status: int | None = None,
        code: str | None = None,
        body: dict | None = None,
    ) -> None:
        super().__init__(message)
        self.status = status
        self.code = code
        self.body = body


class ValidationError(SaRgeError):
    """4xx (excl. 401/403/404/429) - request payload was rejected by server."""


class AuthError(SaRgeError):
    """401 / 403 - missing or invalid credentials, or insufficient permission."""


class NotFoundError(SaRgeError):
    """404 - resource does not exist."""


class RateLimitError(SaRgeError):
    """429 - rate limit hit. retry_after_seconds populated when server returns Retry-After."""

    def __init__(
        self,
        message: str,
        *,
        retry_after_seconds: int | None = None,
        status: int | None = None,
        code: str | None = None,
        body: dict | None = None,
    ) -> None:
        super().__init__(message, status=status, code=code, body=body)
        self.retry_after_seconds = retry_after_seconds


class ServerError(SaRgeError):
    """5xx - upstream failure. Eligible for automatic retry-with-backoff."""
