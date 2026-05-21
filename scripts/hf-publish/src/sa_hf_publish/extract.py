"""Mock extractor — reads fixtures JSON, validates via Pydantic.

In v0 (this commit), the extractor reads `tests/fixtures/mock_records.json`
so the full pipeline (extract -> flatten -> shard -> card) is testable
without a database. In v0.2, a `psycopg`-backed extractor will stream
RGE-active rows from `providers`.
"""

from __future__ import annotations

import json
from pathlib import Path

from sa_hf_publish.types import ProviderRecord

_DEFAULT_FIXTURE = (
    Path(__file__).resolve().parents[2] / "tests" / "fixtures" / "mock_records.json"
)


def read_mock_fixtures(
    path: Path | None = None,
    limit: int | None = None,
) -> list[ProviderRecord]:
    """Load mock provider records from a JSON file.

    Strict Pydantic validation: any missing required field, wrong
    SIRET shape, or extra unknown key raises ValidationError.
    Useful failure mode in dev — we want to catch schema drift early
    rather than at HF upload time.
    """
    fixture_path = path if path is not None else _DEFAULT_FIXTURE
    raw = json.loads(fixture_path.read_text(encoding="utf-8"))
    if not isinstance(raw, list):
        raise ValueError(f"fixture root must be a JSON array, got {type(raw).__name__}")
    records = [ProviderRecord.model_validate(item) for item in raw]
    if limit is not None:
        records = records[:limit]
    return records
