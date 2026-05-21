"""CLI entrypoint for the SA HuggingFace publish helper.

DRY-RUN ONLY by default. The --live flag is intentionally guarded with a
ClickException until HF_TOKEN provisioning lands in Vercel env (v0.2).
"""

from __future__ import annotations

import logging
from datetime import date
from pathlib import Path

import click
from rich.console import Console
from rich.table import Table

from sa_hf_publish.builder import flatten_record
from sa_hf_publish.card import render_dataset_card
from sa_hf_publish.extract import read_mock_fixtures
from sa_hf_publish.types import ColumnSpec, DatasetCardInputs
from sa_hf_publish.writer import write_dataset

logger = logging.getLogger(__name__)
console = Console()

_DATASET_NAME = "servicesartisans/rge-49k-enriched"
_SOURCE_URL = "https://data.ademe.fr/datasets/liste-des-entreprises-rge"
_DATASET_DESCRIPTION = (
    "Dataset of RGE-certified (Reconnu Garant de l'Environnement) French "
    "contractors enriched with E-E-A-T descriptions and canonical URLs. "
    "Derived from the public ADEME RGE registry (Etalab 2.0) and augmented "
    "by ServicesArtisans (servicesartisans.fr). Released under CC-BY 4.0."
)

_COLUMNS: list[ColumnSpec] = [
    ColumnSpec(name="siret", dtype="string", description="14-digit French legal establishment ID"),
    ColumnSpec(name="siren", dtype="string", description="9-digit French legal business ID"),
    ColumnSpec(name="name", dtype="string", description="Legal name of the provider"),
    ColumnSpec(name="city", dtype="string", description="Municipality"),
    ColumnSpec(name="postal_code", dtype="string", description="French postal code (5 digits)"),
    ColumnSpec(name="region", dtype="string?", description="Administrative region (optional)"),
    ColumnSpec(name="insee_code", dtype="string?", description="5-digit INSEE commune code"),
    ColumnSpec(name="latitude", dtype="float?", description="WGS84 latitude (optional)"),
    ColumnSpec(name="longitude", dtype="float?", description="WGS84 longitude (optional)"),
    ColumnSpec(name="naf_code", dtype="string?", description="NAF/APE business activity code"),
    ColumnSpec(
        name="rge_qualifications_json",
        dtype="string",
        description="JSON-encoded list of RGE qualifications (code, organisme, dates)",
    ),
    ColumnSpec(
        name="description",
        dtype="string?",
        description="AI-generated E-E-A-T description (CC-BY 4.0)",
    ),
    ColumnSpec(
        name="description_version",
        dtype="string?",
        description='Rubric version, e.g. "rubric-v1.3"',
    ),
    ColumnSpec(
        name="canonical_url",
        dtype="string",
        description="Canonical URL on ServicesArtisans.fr",
    ),
    ColumnSpec(name="license", dtype="string", description='Constant "CC-BY-4.0"'),
    ColumnSpec(
        name="source",
        dtype="string",
        description='Constant "ServicesArtisans.fr based on ADEME RGE registry"',
    ),
    ColumnSpec(name="last_updated", dtype="string", description="ISO date of pipeline run"),
]

_CITATION_BIBTEX = """@dataset{servicesartisans_rge_49k_enriched_2026,
  title  = {ServicesArtisans RGE 49K Enriched},
  author = {ServicesArtisans},
  year   = {2026},
  url    = {https://huggingface.co/datasets/servicesartisans/rge-49k-enriched},
  note   = {Derived from ADEME RGE registry (data.gouv.fr, Etalab 2.0); SA descriptions CC-BY 4.0}
}"""


@click.command()
@click.option(
    "--dry-run/--live",
    default=True,
    help=(
        "Dry-run (default) writes Parquet shards + dataset card locally; "
        "live mode requires HF_TOKEN and is hard-disabled until v0.2."
    ),
)
@click.option(
    "--limit",
    type=int,
    default=20,
    show_default=True,
    help="Maximum number of rows to process.",
)
@click.option(
    "--output",
    type=click.Path(file_okay=False, writable=True),
    default="./hf-staging",
    show_default=True,
    help="Output directory for Parquet shards + README.md + manifest.json.",
)
@click.option(
    "--shard-size",
    type=int,
    default=10_000,
    show_default=True,
    help="Maximum rows per Parquet shard.",
)
@click.option(
    "--fixtures",
    type=click.Path(exists=True, dir_okay=False, readable=True),
    default=None,
    help="Override path to mock fixtures JSON file.",
)
@click.option(
    "-v",
    "--verbose",
    is_flag=True,
    default=False,
    help="Enable verbose logging (warnings included).",
)
def main(
    dry_run: bool,
    limit: int,
    output: str,
    shard_size: int,
    fixtures: str | None,
    verbose: bool,
) -> None:
    """SA HuggingFace dataset publish helper - dry-run by default."""
    logging.basicConfig(
        level=logging.INFO if verbose else logging.ERROR,
        format="%(levelname)s %(name)s %(message)s",
    )

    if not dry_run:
        raise click.ClickException(
            "--live mode not yet implemented. HF_TOKEN provisioning pending. "
            "Use --dry-run to generate Parquet shards + dataset card locally. "
            "See scripts/hf-publish/README.md."
        )

    fixtures_path = Path(fixtures) if fixtures is not None else None
    records = read_mock_fixtures(path=fixtures_path, limit=limit)
    console.print(f"[bold green]Loaded {len(records)} mock providers[/bold green]")

    last_updated = date.today()
    rows = [flatten_record(record, last_updated=last_updated) for record in records]

    output_dir = Path(output)
    result = write_dataset(rows, output_dir, shard_size=shard_size)

    card_inputs = DatasetCardInputs(
        dataset_name=_DATASET_NAME,
        description=_DATASET_DESCRIPTION,
        total_rows=result.total_rows,
        total_shards=len(result.shards),
        license="CC-BY-4.0",
        source_url=_SOURCE_URL,
        last_updated=last_updated.isoformat(),
        columns=_COLUMNS,
        citation_bibtex=_CITATION_BIBTEX,
    )
    card_md = render_dataset_card(card_inputs)
    readme_path = output_dir / "README.md"
    readme_path.write_text(card_md, encoding="utf-8")

    table = Table(title="SA HuggingFace Publish - Dry-Run Summary")
    table.add_column("Metric", style="cyan")
    table.add_column("Value", style="magenta")
    table.add_row("Mode", "dry-run")
    table.add_row("Records loaded", str(len(records)))
    table.add_row("Rows flattened", str(len(rows)))
    table.add_row("Shards written", str(len(result.shards)))
    table.add_row("Total rows", str(result.total_rows))
    table.add_row("Manifest", result.manifest_path)
    table.add_row("Dataset card", str(readme_path.resolve()))
    table.add_row("Last updated", last_updated.isoformat())
    console.print(table)


if __name__ == "__main__":
    main()
