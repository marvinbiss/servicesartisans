"""Tests for the Parquet shard writer."""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path

import pyarrow.parquet as pq
import pytest

from sa_hf_publish.builder import flatten_record
from sa_hf_publish.types import HFDatasetRow, ProviderRecord
from sa_hf_publish.writer import write_dataset

EXPECTED_COLUMNS = {
    "siret",
    "siren",
    "name",
    "city",
    "postal_code",
    "region",
    "insee_code",
    "latitude",
    "longitude",
    "naf_code",
    "rge_qualifications_json",
    "description",
    "description_version",
    "canonical_url",
    "license",
    "source",
    "last_updated",
}


def _rows_from_records(
    records: list[ProviderRecord], run_date: date
) -> list[HFDatasetRow]:
    return [flatten_record(r, last_updated=run_date) for r in records]


def test_partition_20_rows_into_2_shards_at_size_10(
    mock_records: list[ProviderRecord],
    run_date: date,
    tmp_path: Path,
) -> None:
    rows = _rows_from_records(mock_records, run_date)
    assert len(rows) == 20
    result = write_dataset(rows, tmp_path, shard_size=10)
    assert result.total_rows == 20
    assert len(result.shards) == 2
    assert result.shards[0] == "data/shard-000.parquet"
    assert result.shards[1] == "data/shard-001.parquet"


def test_manifest_contains_total_rows_and_shard_array(
    mock_records: list[ProviderRecord],
    run_date: date,
    tmp_path: Path,
) -> None:
    rows = _rows_from_records(mock_records, run_date)
    result = write_dataset(rows, tmp_path, shard_size=10)
    manifest = json.loads(Path(result.manifest_path).read_text(encoding="utf-8"))
    assert manifest["total_rows"] == 20
    assert manifest["total_shards"] == 2
    assert manifest["shard_size"] == 10
    assert isinstance(manifest["shards"], list)
    assert len(manifest["shards"]) == 2
    assert isinstance(manifest["schema"], list)
    assert len(manifest["schema"]) == 17


def test_parquet_read_back_returns_same_row_count(
    mock_records: list[ProviderRecord],
    run_date: date,
    tmp_path: Path,
) -> None:
    rows = _rows_from_records(mock_records, run_date)
    write_dataset(rows, tmp_path, shard_size=10)
    shard0 = pq.read_table(tmp_path / "data" / "shard-000.parquet")
    shard1 = pq.read_table(tmp_path / "data" / "shard-001.parquet")
    assert shard0.num_rows == 10
    assert shard1.num_rows == 10
    assert shard0.num_rows + shard1.num_rows == 20


def test_parquet_schema_has_17_expected_columns(
    mock_records: list[ProviderRecord],
    run_date: date,
    tmp_path: Path,
) -> None:
    rows = _rows_from_records(mock_records, run_date)
    write_dataset(rows, tmp_path, shard_size=20)
    table = pq.read_table(tmp_path / "data" / "shard-000.parquet")
    assert set(table.column_names) == EXPECTED_COLUMNS
    assert len(table.column_names) == 17


def test_empty_input_produces_zero_shards(tmp_path: Path) -> None:
    """Edge case: empty iterator yields 0 shards + manifest.total_rows = 0 (no exception)."""
    result = write_dataset(iter([]), tmp_path, shard_size=10)
    assert result.total_rows == 0
    assert result.shards == []
    manifest = json.loads(Path(result.manifest_path).read_text(encoding="utf-8"))
    assert manifest["total_rows"] == 0
    assert manifest["total_shards"] == 0


def test_output_dir_created_if_absent(
    minimal_record: ProviderRecord,
    run_date: date,
    tmp_path: Path,
) -> None:
    target = tmp_path / "nested" / "subdir" / "out"
    assert not target.exists()
    rows = [flatten_record(minimal_record, last_updated=run_date)]
    result = write_dataset(rows, target, shard_size=10)
    assert target.exists()
    assert (target / "data").is_dir()
    assert (target / "manifest.json").is_file()
    assert result.total_rows == 1


def test_negative_shard_size_raises(tmp_path: Path) -> None:
    with pytest.raises(ValueError, match="shard_size must be > 0"):
        write_dataset(iter([]), tmp_path, shard_size=0)


def test_round_trip_preserves_siret_string(
    mock_records: list[ProviderRecord],
    run_date: date,
    tmp_path: Path,
) -> None:
    """Critical: read-back SIRET must still be string (not int)."""
    rows = _rows_from_records(mock_records, run_date)
    write_dataset(rows, tmp_path, shard_size=20)
    table = pq.read_table(tmp_path / "data" / "shard-000.parquet")
    siret_col = table.column("siret").to_pylist()
    assert all(isinstance(s, str) for s in siret_col)
    assert all(len(s) == 14 for s in siret_col)
