"""Pure builder: dict source entry -> ``WikiArticle`` Pydantic model.

The builder is intentionally pure (no I/O): same input, same output.
It only validates and normalises. NPOV checks live in
``neutrality.py`` and are invoked by ``cli.py``.
"""

from __future__ import annotations

from datetime import date
from typing import Any

from .types import ArticleSection, Reference, WikiArticle


def _build_reference(raw: dict[str, Any]) -> Reference:
    # Source content uses the natural key "date"; we map it to the
    # Pydantic field ``accessed`` to avoid shadowing ``datetime.date``.
    raw_date = raw.get("accessed") or raw.get("date")
    parsed_date: date | None
    if raw_date is None:
        parsed_date = None
    elif isinstance(raw_date, date):
        parsed_date = raw_date
    else:
        parsed_date = date.fromisoformat(str(raw_date))
    return Reference(
        title=str(raw["title"]),
        url=raw.get("url"),
        publisher=str(raw["publisher"]),
        accessed=parsed_date,
    )


def _build_section(raw: dict[str, Any]) -> ArticleSection:
    references = [_build_reference(r) for r in raw.get("references", [])]
    return ArticleSection(
        heading=str(raw["heading"]),
        body_wikitext=str(raw["body_wikitext"]),
        references=references,
    )


def build_article(entry: dict[str, Any]) -> WikiArticle:
    """Convert a source dict (from ``content.py``) into a typed ``WikiArticle``.

    Raises ``pydantic.ValidationError`` on missing required fields or
    malformed values.
    """
    sections = [_build_section(s) for s in entry["sections"]]
    return WikiArticle(
        title=str(entry["title"]),
        summary=str(entry["summary"]),
        sections=sections,
        categories=list(entry["categories"]),
        infobox_template=entry.get("infobox_template"),
        infobox_fields=dict(entry.get("infobox_fields", {})),
        interwiki=dict(entry.get("interwiki", {})),
        redirects=list(entry.get("redirects", [])),
    )


def build_all(entries: list[dict[str, Any]]) -> list[WikiArticle]:
    """Build ``WikiArticle`` instances for every entry, preserving order."""
    return [build_article(e) for e in entries]
