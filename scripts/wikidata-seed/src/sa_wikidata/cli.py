"""CLI entrypoint for the SA Wikidata seed bot.

DRY-RUN ONLY by default. The --live flag is intentionally guarded with a
ClickException until bot policy approval lands (see
docs/WIKIDATA-SEED-BOT-PLAN.md, section 2).
"""

from __future__ import annotations

import logging
from datetime import date
from pathlib import Path

import click
from rich.console import Console
from rich.table import Table

from sa_wikidata.builder import build_claim_set
from sa_wikidata.checkpoint import InMemoryCheckpoint
from sa_wikidata.extract import read_mock_fixtures
from sa_wikidata.output import write_jsonl

logger = logging.getLogger(__name__)
console = Console()


@click.command()
@click.option(
    "--dry-run/--live",
    default=True,
    help=(
        "Dry-run (default) writes JSONL; live mode requires --live + OAuth "
        "setup and is hard-disabled until bot policy approval (v0.2)."
    ),
)
@click.option(
    "--limit",
    type=int,
    default=10,
    show_default=True,
    help="Maximum number of entities to process.",
)
@click.option(
    "--output",
    type=click.Path(dir_okay=False, writable=True),
    default="wikidata-seed-output.jsonl",
    show_default=True,
    help="Path for JSONL output (dry-run mode only).",
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
    fixtures: str | None,
    verbose: bool,
) -> None:
    """SA Wikidata RGE seed bot - dry-run by default."""
    logging.basicConfig(
        level=logging.INFO if verbose else logging.ERROR,
        format="%(levelname)s %(name)s %(message)s",
    )

    if not dry_run:
        raise click.ClickException(
            "--live mode not yet implemented. Bot policy approval pending. "
            "Use --dry-run to generate JSONL for review. "
            "See docs/WIKIDATA-SEED-BOT-PLAN.md."
        )

    fixtures_path = Path(fixtures) if fixtures is not None else None
    rows = read_mock_fixtures(path=fixtures_path, limit=limit)
    console.print(f"[bold green]Loaded {len(rows)} mock providers[/bold green]")

    retrieval = date.today()
    checkpoint = InMemoryCheckpoint()
    claim_sets = []
    for row in rows:
        if checkpoint.is_processed(row.siret):
            continue
        claim_set = build_claim_set(row, retrieval_date=retrieval)
        claim_sets.append(claim_set)
        checkpoint.mark_processed(row.siret)

    output_path = Path(output)
    written = write_jsonl(claim_sets, output_path)

    table = Table(title="SA Wikidata Seed - Dry-Run Summary")
    table.add_column("Metric", style="cyan")
    table.add_column("Value", style="magenta")
    table.add_row("Mode", "dry-run")
    table.add_row("Rows loaded", str(len(rows)))
    table.add_row("Claim sets built", str(len(claim_sets)))
    table.add_row("Lines written", str(written))
    table.add_row("Output", str(output_path.resolve()))
    table.add_row("Retrieval date", retrieval.isoformat())
    console.print(table)


if __name__ == "__main__":
    main()
