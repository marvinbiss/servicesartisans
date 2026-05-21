"""JSONL writer for dry-run review of generated claim sets."""

from __future__ import annotations

from collections.abc import Iterable
from pathlib import Path

from sa_wikidata.types import WikidataClaimSet


def write_jsonl(
    claim_sets: Iterable[WikidataClaimSet],
    output_path: Path,
) -> int:
    """Write one JSON line per WikidataClaimSet to `output_path`.

    Returns the count of lines written. UTF-8 preserved
    (Pydantic `model_dump_json` defaults to non-ASCII passthrough).
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)
    count = 0
    with output_path.open("w", encoding="utf-8") as f:
        for claim_set in claim_sets:
            f.write(claim_set.model_dump_json())
            f.write("\n")
            count += 1
    return count
