"""Unit tests for sa_wikidata.builder.

Spec: 10+ tests covering required statements, optional statements,
qualifiers/references, SIRET Luhn warning path, and ValidationError on
empty statement set.
"""

from __future__ import annotations

import logging
from datetime import date

import pytest
from pydantic import ValidationError

from sa_wikidata.builder import _luhn_siret_valid, build_claim_set
from sa_wikidata.types import (
    ProviderRow,
    RgeQualification,
    WikidataClaimSet,
    WikidataStatement,
)
from sa_wikidata.vocab import ADEME_RGE_DATASET_URL, P, Q


def _stmt(claim_set: WikidataClaimSet, property_id: str) -> WikidataStatement | None:
    for s in claim_set.statements:
        if s.property_id == property_id:
            return s
    return None


def _all_stmts(claim_set: WikidataClaimSet, property_id: str) -> list[WikidataStatement]:
    return [s for s in claim_set.statements if s.property_id == property_id]


def test_labels_fr_non_empty(row_idf: ProviderRow, retrieval_date: date) -> None:
    claim_set = build_claim_set(row_idf, retrieval_date=retrieval_date)
    assert claim_set.labels["fr"]
    assert claim_set.labels["fr"] == row_idf.name


def test_descriptions_fr_and_en_present(row_idf: ProviderRow, retrieval_date: date) -> None:
    claim_set = build_claim_set(row_idf, retrieval_date=retrieval_date)
    assert "fr" in claim_set.descriptions
    assert "en" in claim_set.descriptions
    assert "française" in claim_set.descriptions["fr"]


def test_required_statements_always_present(
    row_idf: ProviderRow, retrieval_date: date
) -> None:
    claim_set = build_claim_set(row_idf, retrieval_date=retrieval_date)
    property_ids = {s.property_id for s in claim_set.statements}
    for required in (P.INSTANCE_OF, P.COUNTRY, P.SIRET, P.SIREN, P.DESCRIBED_AT_URL):
        assert required in property_ids, f"missing required property {required}"


def test_coordinates_emitted_when_lat_lng_present(
    row_idf: ProviderRow, retrieval_date: date
) -> None:
    claim_set = build_claim_set(row_idf, retrieval_date=retrieval_date)
    coord = _stmt(claim_set, P.COORDINATES)
    assert coord is not None
    assert coord.value["latitude"] == row_idf.latitude
    assert coord.value["longitude"] == row_idf.longitude


def test_coordinates_skipped_when_lat_lng_missing(
    row_no_geo: ProviderRow, retrieval_date: date
) -> None:
    claim_set = build_claim_set(row_no_geo, retrieval_date=retrieval_date)
    assert _stmt(claim_set, P.COORDINATES) is None


def test_located_in_emitted_when_code_insee_present(
    row_idf: ProviderRow, retrieval_date: date
) -> None:
    claim_set = build_claim_set(row_idf, retrieval_date=retrieval_date)
    located = _stmt(claim_set, P.LOCATED_IN)
    assert located is not None
    assert located.value["insee"] == row_idf.code_insee


def test_located_in_skipped_when_code_insee_missing(
    row_no_insee: ProviderRow, retrieval_date: date
) -> None:
    claim_set = build_claim_set(row_no_insee, retrieval_date=retrieval_date)
    assert _stmt(claim_set, P.LOCATED_IN) is None


def test_rge_qualification_per_entry_with_qualifiers(
    row_multi_rge: ProviderRow, retrieval_date: date
) -> None:
    claim_set = build_claim_set(row_multi_rge, retrieval_date=retrieval_date)
    rge_stmts = _all_stmts(claim_set, P.INSTANCE_OF)
    # 1 generic P31 (business enterprise) + 3 per-qualif P31 mappings
    assert len(rge_stmts) == 1 + len(row_multi_rge.rge_qualifications)
    # Every RGE qualif statement carries P580 + P582 qualifiers
    qualif_stmts = [s for s in rge_stmts if s.value.get("id") != Q.BUSINESS_ENTERPRISE]
    for s in qualif_stmts:
        qualifier_props = {q["property"] for q in s.qualifiers}
        assert P.START_TIME in qualifier_props
        assert P.END_TIME in qualifier_props


def test_described_at_url_uses_sa_public_url(
    row_idf: ProviderRow, retrieval_date: date
) -> None:
    claim_set = build_claim_set(row_idf, retrieval_date=retrieval_date)
    described = _stmt(claim_set, P.DESCRIBED_AT_URL)
    assert described is not None
    assert described.value["url"] == row_idf.sa_public_url


def test_naf_emitted_when_present_and_skipped_when_missing(
    row_idf: ProviderRow,
    row_no_geo: ProviderRow,
    retrieval_date: date,
) -> None:
    has_naf = build_claim_set(row_idf, retrieval_date=retrieval_date)
    no_naf = build_claim_set(row_no_geo, retrieval_date=retrieval_date)
    assert _stmt(has_naf, P.NAICS) is not None
    assert _stmt(no_naf, P.NAICS) is None


def test_naf_missing_emits_warning(
    row_no_geo: ProviderRow,
    retrieval_date: date,
    caplog: pytest.LogCaptureFixture,
) -> None:
    with caplog.at_level(logging.WARNING, logger="sa_wikidata.builder"):
        build_claim_set(row_no_geo, retrieval_date=retrieval_date)
    assert any("naf_missing" in record.message for record in caplog.records)


def test_every_statement_carries_reference_block(
    row_idf: ProviderRow, retrieval_date: date
) -> None:
    claim_set = build_claim_set(row_idf, retrieval_date=retrieval_date)
    for s in claim_set.statements:
        assert s.references, f"statement {s.property_id} missing references"
        ref = s.references[0]
        assert ref["stated_in"]["value"]["id"] == Q.ADEME_RGE_DATASET
        assert ref["reference_url"]["value"]["url"] == ADEME_RGE_DATASET_URL
        assert ref["retrieval_date"]["value"]["time"] == retrieval_date.isoformat()


def test_retrieval_date_propagated_to_p813(
    minimal_row: ProviderRow,
) -> None:
    custom_date = date(2027, 1, 15)
    claim_set = build_claim_set(minimal_row, retrieval_date=custom_date)
    for s in claim_set.statements:
        ref = s.references[0]
        assert ref["retrieval_date"]["property"] == P.RETRIEVAL_DATE
        assert ref["retrieval_date"]["value"]["time"] == "2027-01-15"


def test_empty_statements_raises_validation_error() -> None:
    with pytest.raises(ValidationError):
        WikidataClaimSet(
            labels={"fr": "test"},
            statements=[],
            source_dataset_qid=Q.ADEME_RGE_DATASET,
        )


def test_empty_labels_raises_validation_error() -> None:
    with pytest.raises(ValidationError):
        WikidataClaimSet(
            labels={},
            statements=[
                WikidataStatement(
                    property_id="P31",
                    value={"id": Q.BUSINESS_ENTERPRISE},
                )
            ],
            source_dataset_qid=Q.ADEME_RGE_DATASET,
        )


def test_siret_luhn_valid_known_examples() -> None:
    assert _luhn_siret_valid("10000000010007") is True
    assert _luhn_siret_valid("10000000010008") is False  # corrupted check digit
    assert _luhn_siret_valid("12345") is False  # too short
    assert _luhn_siret_valid("1000000001000A") is False  # non-digit


def test_siret_luhn_invalid_logs_warning_but_still_builds(
    retrieval_date: date,
    caplog: pytest.LogCaptureFixture,
) -> None:
    bad_row = ProviderRow(
        siret="12345678901234",  # checksum is invalid
        siren="123456789",
        name="Bad Luhn Test",
        sa_public_url="https://servicesartisans.fr/services/test/bad",
        rge_qualifications=[
            RgeQualification(
                code="Qualibat-X",
                organisme="Qualibat",
                date_debut=date(2025, 1, 1),
                date_fin=date(2027, 12, 31),
            )
        ],
    )
    with caplog.at_level(logging.WARNING, logger="sa_wikidata.builder"):
        claim_set = build_claim_set(bad_row, retrieval_date=retrieval_date)
    assert any("siret_luhn_invalid" in record.message for record in caplog.records)
    # Build still succeeds (warning is non-blocking)
    assert _stmt(claim_set, P.SIRET) is not None


def test_existing_qid_preserved_for_update_mode(
    minimal_row: ProviderRow, retrieval_date: date
) -> None:
    claim_set = build_claim_set(
        minimal_row, retrieval_date=retrieval_date, existing_qid="Q123456789"
    )
    assert claim_set.existing_qid == "Q123456789"


def test_default_existing_qid_is_none(
    minimal_row: ProviderRow, retrieval_date: date
) -> None:
    claim_set = build_claim_set(minimal_row, retrieval_date=retrieval_date)
    assert claim_set.existing_qid is None


def test_source_dataset_qid_set_to_ademe_placeholder(
    minimal_row: ProviderRow, retrieval_date: date
) -> None:
    claim_set = build_claim_set(minimal_row, retrieval_date=retrieval_date)
    assert claim_set.source_dataset_qid == Q.ADEME_RGE_DATASET
