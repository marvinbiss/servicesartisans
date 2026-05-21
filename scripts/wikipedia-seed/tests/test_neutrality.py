"""NPOV checker tests: promotional pattern detection."""

from __future__ import annotations

from sa_wikipedia.neutrality import check_neutrality
from sa_wikipedia.types import WikiArticle


def test_neutral_text_passes() -> None:
    issues = check_neutrality(
        "QualiPAC est une qualification française attribuée aux entreprises."
    )
    assert issues == []


def test_leader_and_incontournable_flagged() -> None:
    issues = check_neutrality("QualiPAC est le leader incontournable du marché.")
    kinds = [i["kind"] for i in issues]
    matches = [str(i["match"]).lower() for i in issues]
    assert "superlative_leader" in kinds
    assert "leader" in matches
    assert "incontournable" in matches
    assert len([k for k in kinds if k == "superlative_leader"]) >= 2


def test_self_promotion_flagged() -> None:
    issues = check_neutrality("Notre entreprise installe des pompes à chaleur.")
    kinds = [i["kind"] for i in issues]
    assert "self_promotion" in kinds


def test_marketing_speak_flagged() -> None:
    issues = check_neutrality("Une solution révolutionnaire pour la rénovation.")
    kinds = [i["kind"] for i in issues]
    assert "marketing_speak" in kinds


def test_hype_adverb_flagged() -> None:
    issues = check_neutrality("Cette qualification est parfaitement adaptée.")
    kinds = [i["kind"] for i in issues]
    assert "hype_adverbs" in kinds


def test_long_neutral_text_passes() -> None:
    text = (
        "Le dispositif des certificats d'économies d'énergie a été instauré par "
        "la loi de programme fixant les orientations de la politique énergétique. "
        "Il oblige les fournisseurs d'énergie à promouvoir l'efficacité "
        "énergétique auprès des consommateurs finaux. Les obligés peuvent "
        "satisfaire leur obligation par des actions directes, par l'achat de "
        "certificats sur le marché, ou par délégation à un tiers."
    )
    assert check_neutrality(text) == []


def test_word_boundary_respected() -> None:
    """``legitimate`` should not match ``leader`` (substring leak)."""
    issues = check_neutrality("This text uses the word legitimate without issue.")
    # No "leader" substring match expected
    assert not any(str(i["match"]).lower() == "leader" for i in issues)


def test_match_position_is_correct() -> None:
    text = "Voici un leader du secteur."
    issues = check_neutrality(text)
    assert issues
    # "leader" starts at index 9 (after "Voici un ")
    leader = next(i for i in issues if str(i["match"]).lower() == "leader")
    assert leader["position"] == 9


def test_all_18_seeded_articles_pass(all_articles: list[WikiArticle]) -> None:
    """Hard guarantee: no seeded article ships with promotional drift."""
    failures: list[tuple[str, list[dict]]] = []
    for article in all_articles:
        combined = (
            article.summary
            + "\n"
            + "\n".join(s.body_wikitext for s in article.sections)
        )
        issues = check_neutrality(combined)
        if issues:
            failures.append((article.title, issues))
    assert failures == [], f"NPOV failures: {failures}"


def test_pattern_detected_inside_template_v0() -> None:
    """v0 deliberately does not parse templates; promotional words inside ``{{...}}``
    still flag. This is acceptable defensive behaviour for v0."""
    text = "{{Infobox Test|description=solution révolutionnaire}}"
    issues = check_neutrality(text)
    kinds = [i["kind"] for i in issues]
    assert "marketing_speak" in kinds
