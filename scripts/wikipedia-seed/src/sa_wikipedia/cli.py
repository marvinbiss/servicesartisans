"""CLI entrypoint for the SA Wikipedia FR seed bot.

DRY-RUN ONLY by default. The ``--live`` flag is intentionally guarded
with a ClickException until Wikipedia FR bot policy approval lands.
That process is stricter than Wikidata's (community discussion at
Le Bistro + bot flag request at WP:RBOT, typically ~30 days external).
"""

from __future__ import annotations

import logging
from pathlib import Path

import click
from rich.console import Console
from rich.table import Table

from sa_wikipedia.builder import build_all
from sa_wikipedia.content import ALL_ENTRIES
from sa_wikipedia.formatter import format_wikitext
from sa_wikipedia.neutrality import check_neutrality
from sa_wikipedia.output import write_articles

logger = logging.getLogger(__name__)
console = Console()


@click.command()
@click.option(
    "--dry-run/--live",
    default=True,
    help=(
        "Dry-run (default) writes wikitext + manifest locally. Live mode "
        "is hard-disabled until Wikipedia FR bot flag approval (~30 days)."
    ),
)
@click.option(
    "--limit",
    type=int,
    default=0,
    show_default=True,
    help="Maximum number of entries to process. 0 = all 18.",
)
@click.option(
    "--output",
    type=click.Path(file_okay=False, writable=True),
    default="./wiki-staging",
    show_default=True,
    help="Output directory for articles + manifest (dry-run only).",
)
@click.option(
    "-v",
    "--verbose",
    is_flag=True,
    default=False,
    help="Enable verbose logging.",
)
def main(dry_run: bool, limit: int, output: str, verbose: bool) -> None:
    """SA Wikipedia FR seed bot - dry-run by default."""
    logging.basicConfig(
        level=logging.INFO if verbose else logging.ERROR,
        format="%(levelname)s %(name)s %(message)s",
    )

    if not dry_run:
        raise click.ClickException(
            "--live mode not yet implemented. Wikipedia FR bot policy requires "
            "community discussion + flag request at WP:RBOT (typically 30+ days). "
            "Use --dry-run to generate wikitext + manifest locally for review."
        )

    entries = ALL_ENTRIES if limit <= 0 else ALL_ENTRIES[:limit]
    articles = build_all(entries)

    npov_issues: list[tuple[str, list[dict[str, str | int]]]] = []
    for article in articles:
        combined = article.summary + "\n" + "\n".join(s.body_wikitext for s in article.sections)
        issues = check_neutrality(combined)
        if issues:
            npov_issues.append((article.title, issues))

    if npov_issues:
        console.print("[bold red]NPOV check failed:[/bold red]")
        for title, issues in npov_issues:
            for issue in issues:
                console.print(
                    f"  - {title}: {issue['kind']} at pos {issue['position']} -> {issue['match']!r}"
                )
        raise click.ClickException(
            "Promotional language detected in source content. Fix content.py before running."
        )

    output_dir = Path(output)
    manifest = write_articles(articles, output_dir, format_wikitext)

    table = Table(title="SA Wikipedia Seed - Dry-Run Summary")
    table.add_column("Metric", style="cyan")
    table.add_column("Value", style="magenta")
    table.add_row("Mode", "dry-run")
    table.add_row("Entries loaded", str(len(entries)))
    table.add_row("Articles built", str(len(articles)))
    table.add_row("NPOV issues", "0")
    table.add_row("Output", str(output_dir.resolve()))
    table.add_row(
        "Total references",
        str(sum(a["references_count"] for a in manifest["articles"])),
    )
    console.print(table)


if __name__ == "__main__":
    main()
