"""Pytest fixtures shared by all test modules."""

from __future__ import annotations

import pytest

from sa_wikipedia.builder import build_all
from sa_wikipedia.content import ALL_ENTRIES, CEE_CONCEPTS, RGE_QUALIFICATIONS
from sa_wikipedia.types import WikiArticle


@pytest.fixture(scope="session")
def all_entries() -> list[dict]:
    return ALL_ENTRIES


@pytest.fixture(scope="session")
def rge_entries() -> list[dict]:
    return RGE_QUALIFICATIONS


@pytest.fixture(scope="session")
def cee_entries() -> list[dict]:
    return CEE_CONCEPTS


@pytest.fixture(scope="session")
def all_articles() -> list[WikiArticle]:
    return build_all(ALL_ENTRIES)
