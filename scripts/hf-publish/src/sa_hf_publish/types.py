"""Pydantic models for the SA HuggingFace publish pipeline.

Strict typing: every layer of the pipeline (extract -> flatten -> write)
validates against these models. Pydantic raises ValidationError on any
schema drift so we fail fast instead of pushing malformed rows to
HuggingFace Hub once live mode is enabled.
"""

from __future__ import annotations

from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class RgeQualif(BaseModel):
    """A single RGE qualification entry on a provider.

    Mirrors the JSONB shape stored in
    `providers.rge_qualifications[]` (ADEME dataset).
    """

    model_config = ConfigDict(extra="forbid", frozen=True)

    code: str = Field(..., min_length=1, description='e.g. "Qualibat-5911", "QualiPAC"')
    organisme: str = Field(..., min_length=1)
    domaine: str | None = None
    meta_domaine: str | None = None
    date_debut: date
    date_fin: date


class ProviderRecord(BaseModel):
    """Source row from SA Postgres `providers` table (RGE-only subset).

    SIRET = 14 digits (legal FR establishment ID).
    SIREN = 9 digits (legal FR business ID, first 9 of SIRET).
    """

    model_config = ConfigDict(extra="forbid", frozen=True)

    siret: str = Field(..., min_length=14, max_length=14, pattern=r"^\d{14}$")
    siren: str = Field(..., min_length=9, max_length=9, pattern=r"^\d{9}$")
    name: str = Field(..., min_length=1)
    address_city: str = Field(..., min_length=1)
    address_postal_code: str = Field(..., min_length=1)
    address_region: str | None = None
    code_insee: str | None = Field(default=None, description="5-digit INSEE commune code")
    latitude: float | None = Field(default=None, ge=-90.0, le=90.0)
    longitude: float | None = Field(default=None, ge=-180.0, le=180.0)
    rge_qualifications: list[RgeQualif] = Field(default_factory=list)
    naf_code: str | None = None
    description: str | None = Field(
        default=None,
        description="Generated E-E-A-T description (CC-BY 4.0). May be None.",
    )
    description_version: str | None = Field(
        default=None,
        description='e.g. "rubric-v1.3"; mirrors `providers.description_version`.',
    )
    sa_public_url: str = Field(
        ...,
        min_length=1,
        pattern=r"^https://servicesartisans\.fr/",
        description="Canonical URL on SA, used as `canonical_url` in HF dataset.",
    )


class HFDatasetRow(BaseModel):
    """Flat row written to Parquet shard.

    Every field maps 1:1 to a Parquet column. `rge_qualifications_json`
    is JSON-serialized because Parquet has no native list-of-struct
    type that round-trips cleanly across the HF ecosystem.
    """

    model_config = ConfigDict(extra="forbid")

    siret: str
    siren: str
    name: str
    city: str
    postal_code: str
    region: str | None
    insee_code: str | None
    latitude: float | None
    longitude: float | None
    naf_code: str | None
    rge_qualifications_json: str = Field(..., description="JSON-serialized list[RgeQualif]")
    description: str | None
    description_version: str | None
    canonical_url: str
    license: str = "CC-BY-4.0"
    source: str = "ServicesArtisans.fr based on ADEME RGE registry"
    last_updated: str = Field(..., description="ISO date YYYY-MM-DD of pipeline run")


class ColumnSpec(BaseModel):
    """One column entry in the dataset card."""

    model_config = ConfigDict(extra="forbid")

    name: str
    dtype: str
    description: str


class DatasetCardInputs(BaseModel):
    """Inputs to `render_dataset_card`."""

    model_config = ConfigDict(extra="forbid")

    dataset_name: str = Field(..., description='e.g. "servicesartisans/rge-49k-enriched"')
    description: str
    total_rows: int = Field(..., ge=0)
    total_shards: int = Field(..., ge=0)
    license: str = "CC-BY-4.0"
    source_url: str
    last_updated: str
    columns: list[ColumnSpec]
    citation_bibtex: str


class WriterResult(BaseModel):
    """Result of `write_dataset`: counts + on-disk artifacts."""

    model_config = ConfigDict(extra="forbid")

    total_rows: int = Field(..., ge=0)
    shards: list[str] = Field(default_factory=list, description="Relative shard paths.")
    manifest_path: str
