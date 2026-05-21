"""Wikidata property + Q-item reference constants.

Centralized so bot policy reviewers can audit which properties we touch.
Properties used : minimal CC0-safe set, no controversial additions.

Property surface (audit checklist for bot policy submission):
- P31 instance of -> business entity (Q4830453)
- P3215 SIRET (14 digits)
- P1320 SIREN (9 digits, FR business ID)
- P17 country -> France (Q142)
- P131 located in the administrative territorial entity (commune QID)
- P625 coordinate location (lat/lng)
- P973 described at URL (SA fiche URL)
- P580 start time (qualifier on RGE qualification statement)
- P582 end time (qualifier on RGE qualification statement)
- P248 stated in (reference to ADEME RGE dataset Q-item)
- P854 reference URL
- P813 retrieval date
- P2807 NAICS classification (closest standard for NAF FR)

No property creates entities, no labels on existing high-profile entries
(France, Paris, etc.) are touched. Bot only creates/updates the SA seed
entities themselves.
"""

from __future__ import annotations

from typing import Final


class P:
    """Wikidata property IDs used by the seed bot."""

    INSTANCE_OF: Final[str] = "P31"
    SIRET: Final[str] = "P3215"
    SIREN: Final[str] = "P1320"
    COUNTRY: Final[str] = "P17"
    LOCATED_IN: Final[str] = "P131"
    COORDINATES: Final[str] = "P625"
    DESCRIBED_AT_URL: Final[str] = "P973"
    START_TIME: Final[str] = "P580"
    END_TIME: Final[str] = "P582"
    STATED_IN: Final[str] = "P248"
    URL: Final[str] = "P854"
    RETRIEVAL_DATE: Final[str] = "P813"
    NAICS: Final[str] = "P2807"


class Q:
    """Stable Wikidata Q-item references."""

    FRANCE: Final[str] = "Q142"
    BUSINESS_ENTERPRISE: Final[str] = "Q4830453"
    ARTISAN: Final[str] = "Q899523"
    # Placeholder: a Q-item must be created (community proposal) for the ADEME
    # RGE dataset before live upload. Tracked in docs/WIKIDATA-SEED-BOT-PLAN.md.
    ADEME_RGE_DATASET: Final[str] = "Q_PLACEHOLDER_TO_CREATE"


# Placeholder QIDs for RGE-attesting organisms. Each must be resolved to a
# real Q-item (or new Q-item proposal) before live mode is enabled.
RGE_ORGANISM_QIDS: Final[dict[str, str]] = {
    "Qualibat": "Q_QUALIBAT_PLACEHOLDER",
    "Qualifelec": "Q_QUALIFELEC_PLACEHOLDER",
    "Qualit'EnR": "Q_QUALITENR_PLACEHOLDER",
    "QualiPAC": "Q_QUALIPAC_PLACEHOLDER",
    "OPQIBI": "Q_OPQIBI_PLACEHOLDER",
    "Certibat": "Q_CERTIBAT_PLACEHOLDER",
}


# ADEME RGE dataset reference URL (Etalab Open License 2.0)
ADEME_RGE_DATASET_URL: Final[str] = (
    "https://data.ademe.fr/datasets/liste-des-entreprises-rge-2"
)
