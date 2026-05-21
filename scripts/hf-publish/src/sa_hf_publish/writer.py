"""Parquet shard writer + manifest emitter.

Splits an iterable of HFDatasetRow into deterministic shards under
`<output_dir>/data/shard-XXX.parquet` and writes a `manifest.json`
describing the run. No HF API call.
"""

from __future__ import annotations

import json
from collections.abc import Iterable
from pathlib import Path
from typing import Any

import pyarrow as pa
import pyarrow.parquet as pq

from sa_hf_publish.types import HFDatasetRow, WriterResult

# Order matters: Parquet schema column ordering must be stable across
# pipeline runs so HF Hub diffs only on data changes, not column reorder.
_SCHEMA_FIELDS: tuple[tuple[str, pa.DataType], ...] = (
    ("siret", pa.string()),
    ("siren", pa.string()),
    ("name", pa.string()),
    ("city", pa.string()),
    ("postal_code", pa.string()),
    ("region", pa.string()),
    ("insee_code", pa.string()),
    ("latitude", pa.float64()),
    ("longitude", pa.float64()),
    ("naf_code", pa.string()),
    ("rge_qualifications_json", pa.string()),
    ("description", pa.string()),
    ("description_version", pa.string()),
    ("canonical_url", pa.string()),
    ("license", pa.string()),
    ("source", pa.string()),
    ("last_updated", pa.string()),
)


def _build_schema() -> pa.Schema:
    return pa.schema([pa.field(name, dtype) for name, dtype in _SCHEMA_FIELDS])


def _rows_to_table(rows: list[HFDatasetRow]) -> pa.Table:
    """Convert a row batch to a pyarrow Table with the stable schema."""
    columns: dict[str, list[Any]] = {name: [] for name, _ in _SCHEMA_FIELDS}
    for row in rows:
        dumped = row.model_dump()
        for name, _ in _SCHEMA_FIELDS:
            columns[name].append(dumped[name])
    return pa.table(columns, schema=_build_schema())


def write_dataset(
    rows: Iterable[HFDatasetRow],
    output_dir: Path,
    shard_size: int = 10_000,
) -> WriterResult:
    """Write rows as Parquet shards under `output_dir/data/`.

    Returns a WriterResult with total row count + relative shard paths
    + manifest path. Empty input yields 0 shards (no exception): the
    pipeline must remain robust to source filters that drop all rows.
    """
    if shard_size <= 0:
        raise ValueError(f"shard_size must be > 0, got {shard_size}")

    output_dir = Path(output_dir)
    data_dir = output_dir / "data"
    data_dir.mkdir(parents=True, exist_ok=True)

    batch: list[HFDatasetRow] = []
    shards: list[str] = []
    total_rows = 0
    shard_idx = 0

    def _flush() -> None:
        nonlocal shard_idx, batch
        if not batch:
            return
        shard_name = f"shard-{shard_idx:03d}.parquet"
        shard_path = data_dir / shard_name
        table = _rows_to_table(batch)
        pq.write_table(table, shard_path)
        shards.append(f"data/{shard_name}")
        shard_idx += 1
        batch = []

    for row in rows:
        batch.append(row)
        total_rows += 1
        if len(batch) >= shard_size:
            _flush()
    _flush()

    manifest_path = output_dir / "manifest.json"
    manifest = {
        "total_rows": total_rows,
        "total_shards": len(shards),
        "shard_size": shard_size,
        "shards": shards,
        "schema": [{"name": name, "dtype": str(dtype)} for name, dtype in _SCHEMA_FIELDS],
    }
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    return WriterResult(
        total_rows=total_rows,
        shards=shards,
        manifest_path=str(manifest_path),
    )
