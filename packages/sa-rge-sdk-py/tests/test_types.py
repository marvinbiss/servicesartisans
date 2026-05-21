"""Dataclass shape tests. Forward-compat: missing keys must not crash."""
from __future__ import annotations

from sa_rge_sdk.types import (
    AskCitation,
    AskResult,
    MprAide,
    Provider,
    Session,
    Webhook,
)


def test_provider_from_dict_all_fields() -> None:
    p = Provider.from_dict(
        {
            "siret": "12345678901234",
            "name": "Acme Plomberie",
            "address_city": "Paris",
            "address_department": "75",
            "qualifications": [{"code": "5911", "label": "Plomberie sanitaire"}],
        }
    )
    assert p.siret == "12345678901234"
    assert p.name == "Acme Plomberie"
    assert p.address_city == "Paris"
    assert p.address_department == "75"
    assert p.qualifications == [{"code": "5911", "label": "Plomberie sanitaire"}]


def test_provider_from_dict_missing_optional_fields() -> None:
    p = Provider.from_dict({})
    assert p.siret is None
    assert p.name is None
    assert p.address_city is None
    assert p.address_department is None
    assert p.qualifications == []


def test_provider_from_dict_null_qualifications_becomes_list() -> None:
    p = Provider.from_dict({"qualifications": None})
    assert p.qualifications == []


def test_mpr_aide_from_dict() -> None:
    a = MprAide.from_dict(
        {"nom": "MaPrimeRenov", "montant": 4000, "revenu_categorie": "bleu", "eligible": True}
    )
    assert a.nom == "MaPrimeRenov"
    assert a.montant == 4000
    assert a.revenu_categorie == "bleu"
    assert a.eligible is True


def test_ask_result_from_dict_with_citations() -> None:
    r = AskResult.from_dict(
        {
            "ok": True,
            "answer": "Vous avez droit a 4000 EUR.",
            "classification": "aides_simulation",
            "citations": [
                {"url": "https://france-renov.gouv.fr", "title": "France Renov"},
                {"url": "https://servicesartisans.fr/aides", "title": "Aides"},
            ],
            "trace": {"latency_ms": 120},
            "reason": None,
        }
    )
    assert r.ok is True
    assert r.answer == "Vous avez droit a 4000 EUR."
    assert r.classification == "aides_simulation"
    assert len(r.citations) == 2
    assert isinstance(r.citations[0], AskCitation)
    assert r.citations[0].url == "https://france-renov.gouv.fr"
    assert r.citations[1].title == "Aides"
    assert r.trace == {"latency_ms": 120}
    assert r.reason is None


def test_ask_result_from_dict_minimal() -> None:
    r = AskResult.from_dict({})
    assert r.ok is False
    assert r.answer is None
    assert r.citations == []


def test_session_from_dict() -> None:
    s = Session.from_dict(
        {
            "session_id": "sess_abc",
            "public_key": "pk_xyz",
            "expires_at": "2026-06-01T00:00:00Z",
            "message_cap": 50,
        }
    )
    assert s.session_id == "sess_abc"
    assert s.public_key == "pk_xyz"
    assert s.expires_at == "2026-06-01T00:00:00Z"
    assert s.message_cap == 50


def test_webhook_from_dict() -> None:
    w = Webhook.from_dict(
        {
            "id": "wh_1",
            "url": "https://example.com/hook",
            "events": ["rge.updated", "rge.deleted"],
            "enabled": True,
            "created_at": "2026-05-01T10:00:00Z",
        }
    )
    assert w.id == "wh_1"
    assert w.url == "https://example.com/hook"
    assert w.events == ["rge.updated", "rge.deleted"]
    assert w.enabled is True
    assert w.created_at == "2026-05-01T10:00:00Z"
