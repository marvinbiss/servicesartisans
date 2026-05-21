"""Pytest fixtures shared by all test modules."""

from __future__ import annotations

from datetime import date
from pathlib import Path

import pytest

from sa_wikidata.extract import read_mock_fixtures
from sa_wikidata.types import ProviderRow, RgeQualification

FIXTURES_PATH = (
    Path(__file__).resolve().parent / "fixtures" / "mock_providers.json"
)


@pytest.fixture(scope="session")
def mock_rows() -> list[ProviderRow]:
    return read_mock_fixtures(path=FIXTURES_PATH)


@pytest.fixture(scope="session")
def retrieval_date() -> date:
    return date(2026, 5, 21)


@pytest.fixture()
def row_idf(mock_rows: list[ProviderRow]) -> ProviderRow:
    return mock_rows[0]


@pytest.fixture()
def row_multi_rge(mock_rows: list[ProviderRow]) -> ProviderRow:
    return mock_rows[1]


@pytest.fixture()
def row_no_insee(mock_rows: list[ProviderRow]) -> ProviderRow:
    # Strasbourg row has code_insee = None
    return mock_rows[5]


@pytest.fixture()
def row_no_geo(mock_rows: list[ProviderRow]) -> ProviderRow:
    # Toulouse row has latitude/longitude = None and naf_code = None
    return mock_rows[9]


@pytest.fixture()
def minimal_row() -> ProviderRow:
    return ProviderRow(
        siret="10000000010007",
        siren="100000000",
        name="Atelier Test Minimal",
        sa_public_url="https://servicesartisans.fr/services/test/test-min",
        rge_qualifications=[
            RgeQualification(
                code="Qualibat-Test",
                organisme="Qualibat",
                date_debut=date(2025, 1, 1),
                date_fin=date(2027, 12, 31),
            )
        ],
    )
