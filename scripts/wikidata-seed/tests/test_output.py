"""Unit tests for sa_wikidata.output."""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path

from sa_wikidata.builder import build_claim_set
from sa_wikidata.extract import read_mock_fixtures
from sa_wikidata.output import write_jsonl
from sa_wikidata.types import ProviderRow


def test_write_jsonl_produces_one_line_per_claim_set(tmp_path: Path) -> None:
    rows = read_mock_fixtures(limit=5)
    claim_sets = [build_claim_set(r, retrieval_date=date(2026, 5, 21)) for r in rows]
    out = tmp_path / "out.jsonl"
    written = write_jsonl(claim_sets, out)
    assert written == 5
    lines = out.read_text(encoding="utf-8").splitlines()
    assert len(lines) == 5


def test_each_jsonl_line_is_valid_json(tmp_path: Path) -> None:
    rows = read_mock_fixtures(limit=10)
    claim_sets = [build_claim_set(r, retrieval_date=date(2026, 5, 21)) for r in rows]
    out = tmp_path / "out.jsonl"
    write_jsonl(claim_sets, out)
    for line in out.read_text(encoding="utf-8").splitlines():
        parsed = json.loads(line)
        assert "labels" in parsed
        assert "statements" in parsed
        assert isinstance(parsed["statements"], list)
        assert len(parsed["statements"]) >= 1


def test_jsonl_preserves_utf8_accents(tmp_path: Path) -> None:
    rows = read_mock_fixtures()
    # Find a row whose name contains "Île"
    idf_row: ProviderRow = next(r for r in rows if "Île" in r.address_region)
    claim_set = build_claim_set(idf_row, retrieval_date=date(2026, 5, 21))
    out = tmp_path / "utf8.jsonl"
    write_jsonl([claim_set], out)
    content = out.read_text(encoding="utf-8")
    assert "française" in content
    # Pydantic emits non-ASCII as JSON-escaped sequences î by default,
    # but the raw bytes must round-trip through json.loads.
    line = content.splitlines()[0]
    parsed = json.loads(line)
    assert "française" in parsed["descriptions"]["fr"]


def test_write_jsonl_creates_parent_directories(tmp_path: Path) -> None:
    rows = read_mock_fixtures(limit=1)
    claim_sets = [build_claim_set(r, retrieval_date=date(2026, 5, 21)) for r in rows]
    out = tmp_path / "nested" / "dir" / "out.jsonl"
    written = write_jsonl(claim_sets, out)
    assert written == 1
    assert out.exists()


def test_write_jsonl_empty_iterable_writes_zero_lines(tmp_path: Path) -> None:
    out = tmp_path / "empty.jsonl"
    written = write_jsonl([], out)
    assert written == 0
    assert out.exists()
    assert out.read_text(encoding="utf-8") == ""
