"""Checkpointing for idempotent re-runs.

v0: in-memory set, OK because the dry-run pipeline is one-shot.
v1 (live mode): Postgres-backed `wikidata_seed_progress` table with
columns (siret, wikidata_qid, last_synced_at, claim_hash).
"""

from __future__ import annotations

from typing import Protocol


class CheckpointStore(Protocol):
    """Protocol for checkpointing backends.

    Implementations: InMemoryCheckpoint (v0), PostgresCheckpoint (v1).
    """

    def is_processed(self, siret: str) -> bool: ...
    def mark_processed(self, siret: str, wikidata_qid: str | None = None) -> None: ...


class InMemoryCheckpoint:
    """In-memory checkpoint store (v0, no persistence across runs)."""

    def __init__(self) -> None:
        self._processed: dict[str, str | None] = {}

    def is_processed(self, siret: str) -> bool:
        return siret in self._processed

    def mark_processed(self, siret: str, wikidata_qid: str | None = None) -> None:
        self._processed[siret] = wikidata_qid

    def __len__(self) -> int:
        return len(self._processed)

    def qid_for(self, siret: str) -> str | None:
        return self._processed.get(siret)
