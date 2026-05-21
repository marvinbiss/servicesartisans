"""ServicesArtisans Wikidata RGE seed bot.

Pilier 12 RGE-OS — seeding ~49 228 RGE provider entities into Wikidata.

This package ships in dry-run mode only until Wikidata bot policy approval is
granted. The pipeline is fully testable end-to-end against mock fixtures
(extract -> build -> output JSONL) without any live API call.

Reference docs:
- docs/RGE-OS-MANIFESTO.md (pillar 12)
- docs/WIKIDATA-SEED-BOT-PLAN.md
"""

from sa_wikidata.types import (
    ProviderRow,
    RgeQualification,
    WikidataClaimSet,
    WikidataStatement,
)

__all__ = [
    "ProviderRow",
    "RgeQualification",
    "WikidataClaimSet",
    "WikidataStatement",
]

__version__ = "0.1.0"
