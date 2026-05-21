"""Tests for the pure flatten_record builder."""

from __future__ import annotations

import json
import re
from datetime import date

import pytest

from sa_hf_publish.builder import flatten_record
from sa_hf_publish.types import ProviderRecord, RgeQualif


def test_siret_siren_preserved_as_strings(minimal_record: ProviderRecord, run_date: date) -> None:
    """SIRET and SIREN must remain strings (Parquet would otherwise drop leading zeros)."""
    row = flatten_record(minimal_record, last_updated=run_date)
    assert isinstance(row.siret, str)
    assert isinstance(row.siren, str)
    assert row.siret == "12345678900011"
    assert row.siren == "123456789"


def test_rge_qualifications_json_is_valid_json(
    minimal_record: ProviderRecord, run_date: date
) -> None:
    """`rge_qualifications_json` must parse back to a list of dicts."""
    row = flatten_record(minimal_record, last_updated=run_date)
    parsed = json.loads(row.rge_qualifications_json)
    assert isinstance(parsed, list)
    assert len(parsed) == 1
    assert parsed[0]["code"] == "QualiPAC"
    assert parsed[0]["organisme"] == "Qualit'EnR"
    assert parsed[0]["date_debut"] == "2024-01-15"
    assert parsed[0]["date_fin"] == "2027-01-14"


def test_optional_fields_preserve_none(run_date: date) -> None:
    """Optional fields must remain None, not coerced to '' or 0."""
    record = ProviderRecord(
        siret="12345678900011",
        siren="123456789",
        name="Minimal",
        address_city="Lyon",
        address_postal_code="69001",
        sa_public_url="https://servicesartisans.fr/services/test/lyon/min-abc",
    )
    row = flatten_record(record, last_updated=run_date)
    assert row.region is None
    assert row.insee_code is None
    assert row.latitude is None
    assert row.longitude is None
    assert row.naf_code is None
    assert row.description is None
    assert row.description_version is None


def test_description_none_preserved(run_date: date) -> None:
    """description=None must round-trip as None, not '' or 'null' string."""
    record = ProviderRecord(
        siret="12345678900011",
        siren="123456789",
        name="No Desc",
        address_city="Paris",
        address_postal_code="75001",
        description=None,
        sa_public_url="https://servicesartisans.fr/services/test/paris/none-abc",
    )
    row = flatten_record(record, last_updated=run_date)
    assert row.description is None
    assert row.description_version is None


def test_last_updated_is_iso_date(minimal_record: ProviderRecord) -> None:
    """`last_updated` must be ISO YYYY-MM-DD."""
    row = flatten_record(minimal_record, last_updated=date(2026, 5, 21))
    assert row.last_updated == "2026-05-21"
    assert re.fullmatch(r"\d{4}-\d{2}-\d{2}", row.last_updated)


def test_canonical_url_is_sa_https(minimal_record: ProviderRecord, run_date: date) -> None:
    """canonical_url must be non-empty and start with https://servicesartisans.fr/."""
    row = flatten_record(minimal_record, last_updated=run_date)
    assert row.canonical_url.startswith("https://servicesartisans.fr/")
    assert len(row.canonical_url) > len("https://servicesartisans.fr/")


def test_round_trip_qualifications_match_original(run_date: date) -> None:
    """ProviderRecord -> HFDatasetRow -> parse rge_qualifications_json -> match original list."""
    qualifs = [
        RgeQualif(
            code="Qualibat-7131",
            organisme="Qualibat",
            domaine="Isolation thermique",
            meta_domaine="Isolation",
            date_debut=date(2023, 6, 1),
            date_fin=date(2026, 5, 31),
        ),
        RgeQualif(
            code="QualiPAC",
            organisme="Qualit'EnR",
            domaine="Pompe à chaleur",
            meta_domaine="Chauffage",
            date_debut=date(2024, 1, 15),
            date_fin=date(2027, 1, 14),
        ),
    ]
    record = ProviderRecord(
        siret="98765432100027",
        siren="987654321",
        name="Multi",
        address_city="Paris",
        address_postal_code="75011",
        rge_qualifications=qualifs,
        sa_public_url="https://servicesartisans.fr/services/multi/paris/multi-xyz",
    )
    row = flatten_record(record, last_updated=run_date)
    parsed = json.loads(row.rge_qualifications_json)
    assert len(parsed) == 2
    assert parsed[0]["code"] == "Qualibat-7131"
    assert parsed[1]["code"] == "QualiPAC"
    assert parsed[0]["date_debut"] == "2023-06-01"
    assert parsed[1]["date_fin"] == "2027-01-14"
    assert parsed[0]["domaine"] == "Isolation thermique"
    assert parsed[1]["meta_domaine"] == "Chauffage"


def test_license_and_source_constants(minimal_record: ProviderRecord, run_date: date) -> None:
    """license and source columns are always the same constants for compliance."""
    row = flatten_record(minimal_record, last_updated=run_date)
    assert row.license == "CC-BY-4.0"
    assert row.source == "ServicesArtisans.fr based on ADEME RGE registry"


def test_pure_function_no_side_effects(
    minimal_record: ProviderRecord, run_date: date
) -> None:
    """Calling flatten_record twice on the same input yields equal outputs."""
    a = flatten_record(minimal_record, last_updated=run_date)
    b = flatten_record(minimal_record, last_updated=run_date)
    assert a.model_dump() == b.model_dump()


def test_invalid_siret_raises_validation_error() -> None:
    """SIRET must be 14 digits; otherwise Pydantic rejects at construction."""
    with pytest.raises(Exception):  # ValidationError
        ProviderRecord(
            siret="123",  # too short
            siren="123456789",
            name="Bad",
            address_city="Lyon",
            address_postal_code="69001",
            sa_public_url="https://servicesartisans.fr/services/test/lyon/bad",
        )
