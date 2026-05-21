"""Pure builder: ProviderRow -> WikidataClaimSet.

No I/O. Fully unit-testable. Every statement carries a P248 reference
to the ADEME RGE dataset Q-item, plus a P813 retrieval date and P854
source URL, so reviewers can verify every claim back to the open source.
"""

from __future__ import annotations

import logging
from datetime import date

from sa_wikidata.types import (
    ProviderRow,
    RgeQualification,
    WikidataClaimSet,
    WikidataStatement,
)
from sa_wikidata.vocab import (
    ADEME_RGE_DATASET_URL,
    RGE_ORGANISM_QIDS,
    P,
    Q,
)

logger = logging.getLogger(__name__)


def _luhn_siret_valid(siret: str) -> bool:
    """SIRET Luhn checksum (non-raising; caller decides what to do on False).

    SIRET de La Poste (356 000 000 *) est une exception légale connue;
    on l'accepte mais on log un warning si le checksum standard échoue.
    """
    if len(siret) != 14 or not siret.isdigit():
        return False
    total = 0
    for i, ch in enumerate(reversed(siret)):
        digit = int(ch)
        if i % 2 == 1:
            digit *= 2
            if digit > 9:
                digit -= 9
        total += digit
    return total % 10 == 0


def _reference_block(retrieval: date) -> dict[str, object]:
    """A reusable reference block: P248 + P854 + P813."""
    return {
        "stated_in": {"property": P.STATED_IN, "value": {"id": Q.ADEME_RGE_DATASET}},
        "reference_url": {"property": P.URL, "value": {"url": ADEME_RGE_DATASET_URL}},
        "retrieval_date": {
            "property": P.RETRIEVAL_DATE,
            "value": {"time": retrieval.isoformat(), "precision": 11},
        },
    }


def _build_simple_statement(
    property_id: str,
    value: dict[str, object],
    retrieval: date,
) -> WikidataStatement:
    return WikidataStatement(
        property_id=property_id,
        value=value,
        qualifiers=[],
        references=[_reference_block(retrieval)],
    )


def _build_rge_qualification_statement(
    qualif: RgeQualification,
    retrieval: date,
) -> WikidataStatement:
    """One statement per RGE qualification, with start/end qualifiers.

    Until a custom RGE qualification property exists in Wikidata, we attach
    the qualification as a P31 sub-statement with organism + date qualifiers.
    The bot policy submission will note this as a temporary mapping.
    """
    organism_qid = RGE_ORGANISM_QIDS.get(
        qualif.organisme, "Q_UNKNOWN_ORGANISM_PLACEHOLDER"
    )
    qualifiers: list[dict[str, object]] = [
        {
            "property": P.START_TIME,
            "value": {"time": qualif.date_debut.isoformat(), "precision": 11},
        },
        {
            "property": P.END_TIME,
            "value": {"time": qualif.date_fin.isoformat(), "precision": 11},
        },
    ]
    if qualif.url is not None:
        qualifiers.append({"property": P.URL, "value": {"url": qualif.url}})

    return WikidataStatement(
        property_id=P.INSTANCE_OF,
        value={
            "id": organism_qid,
            "label": qualif.organisme,
            "code": qualif.code,
            "domaine": qualif.domaine,
            "meta_domaine": qualif.meta_domaine,
        },
        qualifiers=qualifiers,
        references=[_reference_block(retrieval)],
    )


def build_claim_set(
    row: ProviderRow,
    retrieval_date: date,
    existing_qid: str | None = None,
) -> WikidataClaimSet:
    """Build a WikidataClaimSet from a single ProviderRow.

    The function is total: it always returns a claim set with at least
    P31 + P17 + P3215 + P1320. Optional statements (P625, P131, P2807,
    one per RGE qualif) are added only when source data is present.
    """

    if not _luhn_siret_valid(row.siret):
        logger.warning(
            "siret_luhn_invalid",
            extra={"siret": row.siret, "provider_name": row.name},
        )

    statements: list[WikidataStatement] = []

    statements.append(
        _build_simple_statement(
            P.INSTANCE_OF,
            {"id": Q.BUSINESS_ENTERPRISE, "label": "business enterprise"},
            retrieval_date,
        )
    )
    statements.append(
        _build_simple_statement(P.COUNTRY, {"id": Q.FRANCE, "label": "France"}, retrieval_date)
    )
    statements.append(
        _build_simple_statement(P.SIRET, {"value": row.siret}, retrieval_date)
    )
    statements.append(
        _build_simple_statement(P.SIREN, {"value": row.siren}, retrieval_date)
    )

    if row.latitude is not None and row.longitude is not None:
        statements.append(
            _build_simple_statement(
                P.COORDINATES,
                {
                    "latitude": row.latitude,
                    "longitude": row.longitude,
                    "globe": "http://www.wikidata.org/entity/Q2",
                    "precision": 0.0001,
                },
                retrieval_date,
            )
        )

    if row.code_insee is not None and row.code_insee.strip():
        statements.append(
            _build_simple_statement(
                P.LOCATED_IN,
                {"insee": row.code_insee, "city": row.address_city},
                retrieval_date,
            )
        )

    statements.append(
        _build_simple_statement(
            P.DESCRIBED_AT_URL, {"url": row.sa_public_url}, retrieval_date
        )
    )

    if row.naf_code is not None and row.naf_code.strip():
        statements.append(
            _build_simple_statement(P.NAICS, {"value": row.naf_code}, retrieval_date)
        )
    else:
        logger.warning("naf_missing", extra={"siret": row.siret})

    for qualif in row.rge_qualifications:
        statements.append(_build_rge_qualification_statement(qualif, retrieval_date))

    description_fr = _build_description_fr(row)
    description_en = _build_description_en(row)

    return WikidataClaimSet(
        existing_qid=existing_qid,
        labels={
            "fr": row.name,
            "en": row.name,
            "de": row.name,
            "es": row.name,
            "it": row.name,
        },
        descriptions={
            "fr": description_fr,
            "en": description_en,
        },
        statements=statements,
        source_dataset_qid=Q.ADEME_RGE_DATASET,
    )


def _build_description_fr(row: ProviderRow) -> str:
    base = "Entreprise artisanale française"
    city = f" à {row.address_city}" if row.address_city else ""
    rge = " (certifiée RGE)" if row.rge_qualifications else ""
    return f"{base}{city}{rge}"


def _build_description_en(row: ProviderRow) -> str:
    base = "French craftsperson business"
    city = f" in {row.address_city}" if row.address_city else ""
    rge = " (RGE certified)" if row.rge_qualifications else ""
    return f"{base}{city}{rge}"
