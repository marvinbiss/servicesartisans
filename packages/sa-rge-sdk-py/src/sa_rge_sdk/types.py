"""Lightweight dataclasses for response payloads.

Designed for forward-compat: fields are optional, unknown keys
ignored via from_dict. We DO NOT validate exhaustively - server
contract is the source of truth.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


def _opt(d: dict, key: str, default: Any = None) -> Any:
    return d.get(key, default)


@dataclass
class Provider:
    siret: str | None
    name: str | None
    address_city: str | None
    address_department: str | None
    qualifications: list[dict] = field(default_factory=list)

    @classmethod
    def from_dict(cls, d: dict) -> "Provider":
        return cls(
            siret=_opt(d, "siret"),
            name=_opt(d, "name"),
            address_city=_opt(d, "address_city"),
            address_department=_opt(d, "address_department"),
            qualifications=_opt(d, "qualifications", []) or [],
        )


@dataclass
class MprAide:
    nom: str | None
    montant: int | None
    revenu_categorie: str | None
    eligible: bool | None

    @classmethod
    def from_dict(cls, d: dict) -> "MprAide":
        return cls(
            nom=_opt(d, "nom"),
            montant=_opt(d, "montant"),
            revenu_categorie=_opt(d, "revenu_categorie"),
            eligible=_opt(d, "eligible"),
        )


@dataclass
class AskCitation:
    url: str
    title: str

    @classmethod
    def from_dict(cls, d: dict) -> "AskCitation":
        return cls(url=str(d.get("url", "")), title=str(d.get("title", "")))


@dataclass
class AskResult:
    ok: bool
    answer: str | None
    classification: str | None
    citations: list[AskCitation]
    trace: dict | None
    reason: str | None

    @classmethod
    def from_dict(cls, d: dict) -> "AskResult":
        cits = [AskCitation.from_dict(c) for c in d.get("citations", []) or []]
        return cls(
            ok=bool(d.get("ok", False)),
            answer=_opt(d, "answer"),
            classification=_opt(d, "classification"),
            citations=cits,
            trace=_opt(d, "trace"),
            reason=_opt(d, "reason"),
        )


@dataclass
class Session:
    session_id: str
    public_key: str
    expires_at: str
    message_cap: int | None

    @classmethod
    def from_dict(cls, d: dict) -> "Session":
        return cls(
            session_id=str(d.get("session_id", "")),
            public_key=str(d.get("public_key", "")),
            expires_at=str(d.get("expires_at", "")),
            message_cap=_opt(d, "message_cap"),
        )


@dataclass
class Webhook:
    id: str
    url: str
    events: list[str]
    enabled: bool
    created_at: str | None

    @classmethod
    def from_dict(cls, d: dict) -> "Webhook":
        return cls(
            id=str(d.get("id", "")),
            url=str(d.get("url", "")),
            events=list(d.get("events", []) or []),
            enabled=bool(d.get("enabled", True)),
            created_at=_opt(d, "created_at"),
        )
