"""Extraction layer: mock fixtures (v0) or Postgres query (future v1).

v0 reads from `tests/fixtures/mock_providers.json` so the pipeline is
fully runnable offline. v1 (post bot-policy approval) will replace
`read_mock_fixtures` with a `read_postgres(dsn, limit, where)` function
backed by psycopg.
"""

from __future__ import annotations

import json
from collections.abc import Iterable
from pathlib import Path

from sa_wikidata.types import ProviderRow

DEFAULT_FIXTURES_PATH = (
    Path(__file__).resolve().parent.parent.parent
    / "tests"
    / "fixtures"
    / "mock_providers.json"
)


def read_mock_fixtures(
    path: Path | None = None,
    limit: int | None = None,
) -> list[ProviderRow]:
    """Read mock provider fixtures and validate each row through Pydantic."""
    fixture_path = path if path is not None else DEFAULT_FIXTURES_PATH
    raw = json.loads(fixture_path.read_text(encoding="utf-8"))
    if not isinstance(raw, list):
        raise ValueError(
            f"Expected fixture root to be a list, got {type(raw).__name__}"
        )

    rows: list[ProviderRow] = []
    for entry in raw:
        rows.append(ProviderRow.model_validate(entry))
        if limit is not None and len(rows) >= limit:
            break
    return rows


def iter_provider_rows(
    source: Iterable[ProviderRow],
    limit: int | None = None,
) -> Iterable[ProviderRow]:
    """Yield up to `limit` rows from any ProviderRow iterable."""
    count = 0
    for row in source:
        if limit is not None and count >= limit:
            return
        yield row
        count += 1
