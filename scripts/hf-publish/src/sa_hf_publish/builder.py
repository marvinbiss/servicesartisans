"""Pure flattener: ProviderRecord -> HFDatasetRow.

No I/O. Fully unit-testable. The flattening preserves SIRET/SIREN as
strings (Parquet would otherwise round them to int and lose leading
zeros, breaking French legal identifier format).
"""

from __future__ import annotations

import json
from datetime import date

from sa_hf_publish.types import HFDatasetRow, ProviderRecord


def _serialize_qualifications(record: ProviderRecord) -> str:
    """Serialize `rge_qualifications` to JSON string (Parquet-friendly).

    Dates are ISO-format strings. Field order is deterministic for
    reproducible Parquet shards (helps HF Hub change detection).
    """
    payload = [
        {
            "code": q.code,
            "organisme": q.organisme,
            "domaine": q.domaine,
            "meta_domaine": q.meta_domaine,
            "date_debut": q.date_debut.isoformat(),
            "date_fin": q.date_fin.isoformat(),
        }
        for q in record.rge_qualifications
    ]
    return json.dumps(payload, ensure_ascii=False, separators=(",", ":"), sort_keys=False)


def flatten_record(
    record: ProviderRecord,
    last_updated: date,
) -> HFDatasetRow:
    """Flatten a ProviderRecord into an HFDatasetRow.

    Pure function (no I/O, no global state). `last_updated` is provided
    by the caller so all rows in a single pipeline run share the same
    timestamp, which keeps Parquet shards reproducible.
    """
    return HFDatasetRow(
        siret=record.siret,
        siren=record.siren,
        name=record.name,
        city=record.address_city,
        postal_code=record.address_postal_code,
        region=record.address_region,
        insee_code=record.code_insee,
        latitude=record.latitude,
        longitude=record.longitude,
        naf_code=record.naf_code,
        rge_qualifications_json=_serialize_qualifications(record),
        description=record.description,
        description_version=record.description_version,
        canonical_url=record.sa_public_url,
        license="CC-BY-4.0",
        source="ServicesArtisans.fr based on ADEME RGE registry",
        last_updated=last_updated.isoformat(),
    )
