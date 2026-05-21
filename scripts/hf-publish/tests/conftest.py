"""Shared pytest fixtures."""

from __future__ import annotations

from datetime import date
from pathlib import Path

import pytest

from sa_hf_publish.extract import read_mock_fixtures
from sa_hf_publish.types import ProviderRecord, RgeQualif

FIXTURES_DIR = Path(__file__).parent / "fixtures"
MOCK_FIXTURE_PATH = FIXTURES_DIR / "mock_records.json"


@pytest.fixture
def mock_records() -> list[ProviderRecord]:
    """Load the full 20-row mock fixture."""
    return read_mock_fixtures(path=MOCK_FIXTURE_PATH)


@pytest.fixture
def minimal_record() -> ProviderRecord:
    """A minimal valid ProviderRecord with one RGE qualification."""
    return ProviderRecord(
        siret="12345678900011",
        siren="123456789",
        name="Test Artisan",
        address_city="Lyon",
        address_postal_code="69001",
        rge_qualifications=[
            RgeQualif(
                code="QualiPAC",
                organisme="Qualit'EnR",
                date_debut=date(2024, 1, 15),
                date_fin=date(2027, 1, 14),
            )
        ],
        sa_public_url="https://servicesartisans.fr/services/pompe-a-chaleur/lyon/test-abc",
    )


@pytest.fixture
def run_date() -> date:
    """A frozen run date used across deterministic tests."""
    return date(2026, 5, 21)
