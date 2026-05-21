"""Pydantic models for Wikipedia FR seed articles.

These models are the typed contract between source data (content.py),
the pure builder (builder.py), and the wikitext formatter (formatter.py).
Live mode (v0.2) will reuse the exact same models for pywikibot
serialization, hence the strictness here.
"""

from __future__ import annotations

from datetime import date as Date
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class Reference(BaseModel):
    """A bibliographic reference rendered as <ref>{{Lien web|...}}</ref>.

    Wikipedia FR's WP:V (verifiability) policy is non-negotiable: every
    factual claim must be sourced. Bot-generated content is held to a
    higher standard, so each <ref> must cite an authoritative third
    party — never servicesartisans.fr (circular sourcing = grounds for
    speedy deletion under WP:CIRCULAR).

    ``accessed`` maps to Wikipedia FR's ``consulté le`` parameter inside
    ``{{Lien web}}``. The field name avoids shadowing ``datetime.date``.
    """

    model_config = ConfigDict(frozen=True, extra="forbid")

    title: str = Field(min_length=1)
    url: Optional[str] = None
    publisher: str = Field(min_length=1)
    accessed: Optional[Date] = None


class ArticleSection(BaseModel):
    """A single ``==Heading==`` section within an article."""

    model_config = ConfigDict(extra="forbid")

    heading: str = Field(min_length=1)
    body_wikitext: str = Field(min_length=1)
    references: list[Reference] = Field(default_factory=list)


class WikiArticle(BaseModel):
    """A complete Wikipedia FR stub article for an RGE / CEE entity."""

    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=1)
    summary: str = Field(min_length=1)
    sections: list[ArticleSection] = Field(min_length=1)
    categories: list[str] = Field(min_length=1)
    infobox_template: Optional[str] = None
    infobox_fields: dict[str, str] = Field(default_factory=dict)
    interwiki: dict[str, str] = Field(default_factory=dict)
    redirects: list[str] = Field(default_factory=list)
