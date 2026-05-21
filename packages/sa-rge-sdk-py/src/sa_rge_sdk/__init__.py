"""ServicesArtisans RGE-OS Python SDK.

Stdlib-only (urllib + json + hmac). Companion of the TypeScript SDK
(packages/sa-rge-sdk-ts).
"""
from ._version import __version__
from .client import Client, DEFAULT_BASE_URL
from .errors import (
    AuthError,
    NotFoundError,
    RateLimitError,
    SaRgeError,
    ServerError,
    ValidationError,
)
from .types import AskCitation, AskResult, MprAide, Provider, Session, Webhook
from .webhooks import REPLAY_WINDOW_SECONDS, compute_signature, verify_signature

__all__ = [
    "Client",
    "DEFAULT_BASE_URL",
    "AskCitation",
    "AskResult",
    "MprAide",
    "Provider",
    "Session",
    "Webhook",
    "SaRgeError",
    "ValidationError",
    "AuthError",
    "NotFoundError",
    "RateLimitError",
    "ServerError",
    "verify_signature",
    "compute_signature",
    "REPLAY_WINDOW_SECONDS",
    "__version__",
]
