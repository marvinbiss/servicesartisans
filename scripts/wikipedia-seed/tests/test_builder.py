"""Builder tests: dict source -> WikiArticle conversion."""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from sa_wikipedia.builder import build_all, build_article
from sa_wikipedia.content import ALL_ENTRIES
from sa_wikipedia.types import WikiArticle


def test_build_all_entries_without_error(all_entries: list[dict]) -> None:
    articles = build_all(all_entries)
    assert len(articles) == 18
    assert all(isinstance(a, WikiArticle) for a in articles)


def test_all_articles_have_non_empty_title(all_articles: list[WikiArticle]) -> None:
    for article in all_articles:
        assert article.title
        assert article.title.strip() == article.title


def test_all_articles_have_at_least_one_section(all_articles: list[WikiArticle]) -> None:
    for article in all_articles:
        assert len(article.sections) >= 1


def test_all_articles_have_at_least_one_category(all_articles: list[WikiArticle]) -> None:
    for article in all_articles:
        assert len(article.categories) >= 1
        for cat in article.categories:
            assert cat.startswith("Catégorie:")


def test_articles_with_infobox_have_fields(all_articles: list[WikiArticle]) -> None:
    for article in all_articles:
        if article.infobox_template is not None:
            assert len(article.infobox_fields) >= 1, (
                f"{article.title} has infobox_template but no fields"
            )


def test_build_rejects_missing_title() -> None:
    bad_entry = {
        "summary": "x",
        "sections": [{"heading": "h", "body_wikitext": "b"}],
        "categories": ["Catégorie:Test"],
    }
    with pytest.raises(KeyError):
        build_article(bad_entry)


def test_build_rejects_empty_sections() -> None:
    bad_entry = {
        "title": "Empty",
        "summary": "x",
        "sections": [],
        "categories": ["Catégorie:Test"],
    }
    with pytest.raises(ValidationError):
        build_article(bad_entry)


def test_count_rge_vs_cee_split() -> None:
    rge = [e for e in ALL_ENTRIES if e.get("category") == "rge_qualification"]
    cee = [e for e in ALL_ENTRIES if e.get("category") == "cee_concept"]
    assert len(rge) == 13
    assert len(cee) == 5


def test_titles_are_unique(all_articles: list[WikiArticle]) -> None:
    titles = [a.title for a in all_articles]
    assert len(titles) == len(set(titles))
