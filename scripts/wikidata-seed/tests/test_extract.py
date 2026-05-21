"""Unit tests for sa_wikidata.extract."""

from __future__ import annotations

import json
from pathlib import Path

import pytest
from pydantic import ValidationError

from sa_wikidata.extract import iter_provider_rows, read_mock_fixtures
from sa_wikidata.types import ProviderRow


def test_read_mock_fixtures_returns_provider_rows() -> None:
    rows = read_mock_fixtures()
    assert len(rows) == 10
    for row in rows:
        assert isinstance(row, ProviderRow)
        assert len(row.siret) == 14
        assert len(row.siren) == 9


def test_read_mock_fixtures_limit_truncates() -> None:
    rows = read_mock_fixtures(limit=3)
    assert len(rows) == 3


def test_read_mock_fixtures_invalid_siret_raises(tmp_path: Path) -> None:
    bad = [
        {
            "siret": "TOO_SHORT",
            "siren": "100000000",
            "name": "Bad",
            "sa_public_url": "https://servicesartisans.fr/x",
            "rge_qualifications": [],
        }
    ]
    bad_path = tmp_path / "bad.json"
    bad_path.write_text(json.dumps(bad), encoding="utf-8")
    with pytest.raises(ValidationError):
        read_mock_fixtures(path=bad_path)


def test_read_mock_fixtures_non_list_root_raises(tmp_path: Path) -> None:
    bad_path = tmp_path / "bad.json"
    bad_path.write_text('{"not": "a list"}', encoding="utf-8")
    with pytest.raises(ValueError, match="list"):
        read_mock_fixtures(path=bad_path)


def test_iter_provider_rows_respects_limit() -> None:
    rows = read_mock_fixtures()
    out = list(iter_provider_rows(rows, limit=4))
    assert len(out) == 4


def test_fixtures_cover_required_edge_cases() -> None:
    rows = read_mock_fixtures()
    # At least one provider with multiple RGE qualifs
    assert any(len(r.rge_qualifications) >= 3 for r in rows)
    # At least one provider with no code_insee
    assert any(r.code_insee is None for r in rows)
    # At least one provider with no coordinates
    assert any(r.latitude is None and r.longitude is None for r in rows)
    # Coverage of multiple regions
    regions = {r.address_region for r in rows if r.address_region}
    assert len(regions) >= 5
    # Coverage of outre-mer
    assert any(r.address_region == "La Réunion" for r in rows)
