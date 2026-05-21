"""NPOV (Neutral Point of View) checker.

Catches obvious promotional patterns before they reach output.
Wikipedia FR's WP:NPOV is strict — promotional language is grounds
for speedy deletion of an article. Bot-generated content under
particular scrutiny.

The checker is heuristic and runs at build time. It is intentionally
conservative: false positives are easy to suppress (rewrite the
sentence), false negatives ship to Wikipedia. We err on the side of
false positives.

v0 deliberately does not parse wikitext templates; a promotional
word inside ``{{...}}`` will still be flagged. This is acceptable
because templates rarely embed prose — they hold structured fields.
v0.2 may add a template-aware mode.
"""

from __future__ import annotations

import re
from typing import Pattern

PROMO_PATTERNS: list[tuple[str, Pattern[str]]] = [
    (
        "superlative_leader",
        re.compile(
            r"\b(leader|incontournable|référence|n°\s*1|meilleur(?:e)?|premier(?:e)?\s+sur|seul(?:e)?\s+(?:à|qui|de|en))\b",
            re.IGNORECASE,
        ),
    ),
    (
        "marketing_speak",
        re.compile(
            r"\b(innovant(?:e)?|révolutionnaire|disruptif(?:ve)?|game[\s-]?changer|next[\s-]?gen|nouvelle\s+génération)\b",
            re.IGNORECASE,
        ),
    ),
    (
        "hype_adverbs",
        re.compile(
            r"\b(parfaitement|absolument|extrêmement|incroyablement|totalement)\b",
            re.IGNORECASE,
        ),
    ),
    (
        "self_promotion",
        re.compile(
            r"\b(notre|nos)\s+(entreprise|société|service|équipe|plateforme|solution)\b",
            re.IGNORECASE,
        ),
    ),
]


def check_neutrality(text: str) -> list[dict[str, str | int]]:
    """Return a list of NPOV issues detected in ``text``.

    Each issue is a dict with ``kind``, ``match``, and ``position``.
    An empty list means the text passes the heuristic check.
    """
    issues: list[dict[str, str | int]] = []
    for kind, pattern in PROMO_PATTERNS:
        for match in pattern.finditer(text):
            issues.append(
                {
                    "kind": kind,
                    "match": match.group(0),
                    "position": match.start(),
                }
            )
    return issues
