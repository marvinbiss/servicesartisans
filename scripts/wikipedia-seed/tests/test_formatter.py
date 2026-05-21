"""Formatter tests: WikiArticle -> wikitext rendering."""

from __future__ import annotations

from datetime import date

from sa_wikipedia.formatter import format_wikitext
from sa_wikipedia.types import ArticleSection, Reference, WikiArticle


def _sample_article() -> WikiArticle:
    return WikiArticle(
        title="QualiPAC",
        summary="QualiPAC est une qualification française.",
        sections=[
            ArticleSection(
                heading="Historique",
                body_wikitext='La qualification a été créée en 2007.<ref name="src1" />',
                references=[
                    Reference(
                        title="À propos",
                        url="https://www.qualit-enr.org/",
                        publisher="Qualit'EnR",
                        accessed=date(2026, 4, 15),
                    )
                ],
            ),
        ],
        categories=[
            "Catégorie:Certification française",
            "Catégorie:Rénovation énergétique en France",
        ],
        infobox_template="Infobox Certification",
        infobox_fields={"nom": "QualiPAC", "organisme": "Qualit'EnR"},
    )


def test_heading_rendered_as_level_2() -> None:
    wikitext = format_wikitext(_sample_article())
    assert "== Historique ==" in wikitext


def test_reference_rendered_with_lien_web() -> None:
    wikitext = format_wikitext(_sample_article())
    assert '<ref name="src1">' in wikitext
    assert "{{Lien web" in wikitext
    assert "|titre=À propos" in wikitext
    assert "|éditeur=Qualit'EnR" in wikitext
    assert "|consulté le=15 avril 2026" in wikitext


def test_categories_rendered_at_end() -> None:
    wikitext = format_wikitext(_sample_article())
    assert "[[Catégorie:Certification française]]" in wikitext
    assert "[[Catégorie:Rénovation énergétique en France]]" in wikitext
    # Categories should be after the references section
    assert wikitext.index("[[Catégorie:") > wikitext.index("== Notes et références ==")


def test_infobox_rendered_at_start() -> None:
    wikitext = format_wikitext(_sample_article())
    assert wikitext.startswith("{{Infobox Certification")
    assert "| nom = QualiPAC" in wikitext
    assert "| organisme = Qualit'EnR" in wikitext


def test_notes_and_references_section_present() -> None:
    wikitext = format_wikitext(_sample_article())
    assert "== Notes et références ==" in wikitext
    assert "<references />" in wikitext


def test_liens_externes_section_present() -> None:
    wikitext = format_wikitext(_sample_article())
    assert "== Liens externes ==" in wikitext
    assert "https://www.qualit-enr.org/" in wikitext


def test_no_circular_servicesartisans_reference(all_articles) -> None:
    for article in all_articles:
        wikitext = format_wikitext(article)
        assert "servicesartisans.fr" not in wikitext.lower(), (
            f"{article.title} cites servicesartisans.fr (circular sourcing forbidden)"
        )


def test_utf8_accents_preserved() -> None:
    wikitext = format_wikitext(_sample_article())
    assert "française" in wikitext
    assert "créée" in wikitext
    assert "Qualit'EnR" in wikitext
    # Round-trip through utf-8
    encoded = wikitext.encode("utf-8")
    decoded = encoded.decode("utf-8")
    assert decoded == wikitext


def test_all_18_articles_render_without_error(all_articles) -> None:
    for article in all_articles:
        wikitext = format_wikitext(article)
        assert wikitext
        assert wikitext.endswith("\n")
