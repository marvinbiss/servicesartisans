"""Pydantic models for the SA Wikidata seed pipeline.

Strict typing: every layer of the pipeline (extract -> build -> output)
validates against these models. Pydantic raises ValidationError on any
schema drift so we fail fast instead of pushing malformed claims to
Wikidata once live mode is enabled.
"""

from __future__ import annotations

from datetime import date
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class RgeQualification(BaseModel):
    """A single RGE qualification entry on a provider.

    Mirrors the JSONB shape stored in
    `providers.rge_qualifications[]` (ADEME dataset).
    """

    model_config = ConfigDict(extra="forbid", frozen=True)

    code: str = Field(..., min_length=1, description='e.g. "QualiPAC", "Qualibat-5911"')
    organisme: str = Field(
        ...,
        min_length=1,
        description='"Qualibat" | "Qualifelec" | "Qualit\'EnR" | "QualiPAC" | "OPQIBI" | ...',
    )
    domaine: str | None = None
    meta_domaine: str | None = None
    date_debut: date
    date_fin: date
    url: str | None = None


class ProviderRow(BaseModel):
    """A single provider extracted from SA Postgres (or mock fixtures).

    SIRET = 14 digits (legal FR establishment ID).
    SIREN = 9 digits (legal FR business ID, first 9 of SIRET).
    code_insee = 5 chars commune code, used to resolve P131 (located in).
    """

    model_config = ConfigDict(extra="forbid", frozen=True)

    siret: str = Field(..., min_length=14, max_length=14, pattern=r"^\d{14}$")
    siren: str = Field(..., min_length=9, max_length=9, pattern=r"^\d{9}$")
    name: str = Field(..., min_length=1)
    address_city: str | None = None
    address_postal_code: str | None = None
    address_region: str | None = None
    code_insee: str | None = Field(default=None, description="5-digit INSEE commune code")
    latitude: float | None = Field(default=None, ge=-90.0, le=90.0)
    longitude: float | None = Field(default=None, ge=-180.0, le=180.0)
    rge_qualifications: list[RgeQualification] = Field(default_factory=list)
    naf_code: str | None = None
    sa_public_url: str = Field(..., min_length=1, description="URL fiche SA for P973")


class WikidataStatement(BaseModel):
    """A single Wikidata statement (claim).

    `value` follows the Wikibase data value structure
    (https://www.wikidata.org/wiki/Wikibase/DataModel).
    """

    model_config = ConfigDict(extra="forbid")

    property_id: str = Field(..., pattern=r"^P\d+$")
    value: dict[str, Any]
    qualifiers: list[dict[str, Any]] = Field(default_factory=list)
    references: list[dict[str, Any]] = Field(default_factory=list)


class WikidataClaimSet(BaseModel):
    """A complete claim set ready for Wikidata upload (or dry-run JSONL output)."""

    model_config = ConfigDict(extra="forbid")

    existing_qid: str | None = Field(
        default=None,
        description="Set when the entity already exists in Wikidata (haswbstatement match).",
    )
    labels: dict[str, str] = Field(..., min_length=1)
    descriptions: dict[str, str] = Field(default_factory=dict)
    statements: list[WikidataStatement] = Field(..., min_length=1)
    source_dataset_qid: str = Field(
        ...,
        description="Stable QID for the ADEME RGE dataset (used as P248 reference).",
    )
