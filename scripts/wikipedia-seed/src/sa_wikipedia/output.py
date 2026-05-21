"""Filesystem writer: ``WikiArticle`` list -> ``articles/*.wiki`` + ``manifest.json``.

Output layout::

    <output_dir>/
      articles/
        qualipac.wiki
        qualibat_5911.wiki
        ...
      manifest.json

``manifest.json`` is the audit trail consumed by the live-mode publisher
(v0.2) and by reviewers during community discussion. It is stable and
deterministic for a given input.
"""

from __future__ import annotations

import json
import re
import unicodedata
from collections.abc import Callable
from pathlib import Path
from typing import Any

from .types import WikiArticle


def slugify(title: str) -> str:
    """Convert ``"QualiPAC"`` -> ``"qualipac"``; ``"kWh cumac"`` -> ``"kwh_cumac"``.

    Lowercases, strips diacritics for filename safety only (the article
    title itself retains accents), and collapses non-alphanumeric runs.
    """
    normalized = unicodedata.normalize("NFKD", title)
    ascii_only = normalized.encode("ascii", "ignore").decode("ascii")
    lowered = ascii_only.lower()
    cleaned = re.sub(r"[^a-z0-9]+", "_", lowered)
    return cleaned.strip("_")


def write_articles(
    articles: list[WikiArticle],
    output_dir: Path,
    format_fn: Callable[[WikiArticle], str],
) -> dict[str, Any]:
    """Write articles + manifest. Returns the manifest dict."""
    output_dir.mkdir(parents=True, exist_ok=True)
    articles_dir = output_dir / "articles"
    articles_dir.mkdir(exist_ok=True)

    manifest: dict[str, Any] = {"total": len(articles), "articles": []}
    for article in articles:
        slug = slugify(article.title)
        wikitext = format_fn(article)
        (articles_dir / f"{slug}.wiki").write_text(wikitext, encoding="utf-8")
        manifest["articles"].append(
            {
                "title": article.title,
                "slug": slug,
                "file": f"articles/{slug}.wiki",
                "summary_chars": len(article.summary),
                "sections_count": len(article.sections),
                "references_count": sum(len(s.references) for s in article.sections),
                "categories": article.categories,
                "has_infobox": article.infobox_template is not None,
            }
        )

    (output_dir / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return manifest
