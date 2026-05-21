"""``WikiArticle`` -> Wikipedia FR wikitext renderer.

Conforms to the most common Wikipedia FR layout for stub articles:

  1. ``{{Infobox ...}}`` (optional)
  2. Lead paragraph (the ``summary``)
  3. ``== Heading ==`` sections with ``<ref>{{Lien web|...}}</ref>``
  4. ``== Notes et références ==`` + ``<references />``
  5. ``== Liens externes ==`` with URL bullets
  6. ``[[Catégorie:...]]`` suffixes

Wikitext is rendered without trailing whitespace per line. Final
output ends with a single newline. Encoding is UTF-8 with accents
preserved (no Unicode escaping).
"""

from __future__ import annotations

from datetime import date

from .types import ArticleSection, Reference, WikiArticle

_FRENCH_MONTHS = {
    1: "janvier",
    2: "février",
    3: "mars",
    4: "avril",
    5: "mai",
    6: "juin",
    7: "juillet",
    8: "août",
    9: "septembre",
    10: "octobre",
    11: "novembre",
    12: "décembre",
}


def _format_date_fr(d: date) -> str:
    return f"{d.day} {_FRENCH_MONTHS[d.month]} {d.year}"


def _render_infobox(article: WikiArticle) -> str:
    if not article.infobox_template:
        return ""
    lines = [f"{{{{{article.infobox_template}"]
    for key, value in article.infobox_fields.items():
        lines.append(f"| {key} = {value}")
    lines.append("}}")
    return "\n".join(lines)


def _is_named_only_ref(body: str, ref_index: int) -> bool:
    """Return True iff ``<ref name="..." />`` self-closing form is present in body."""
    # Heuristic: we trust the body author to mark first vs. subsequent
    # references. v0 always renders <ref name="..."> with full content
    # on first appearance and lets the body decide ordering.
    return False


def _render_reference(ref: Reference, name: str | None = None) -> str:
    """Render a ``<ref>{{Lien web|...}}</ref>`` block.

    If ``name`` is provided, attach it as the ref name. The first
    appearance of a named ref carries the full payload; subsequent
    self-closing references in the body (``<ref name="x" />``) are
    expected to already exist in section bodies.
    """
    parts = ["{{Lien web"]
    parts.append(f"|titre={ref.title}")
    if ref.url:
        parts.append(f"|url={ref.url}")
    parts.append(f"|éditeur={ref.publisher}")
    if ref.accessed is not None:
        parts.append(f"|consulté le={_format_date_fr(ref.accessed)}")
    parts.append("}}")
    template = "".join(parts)
    if name:
        return f'<ref name="{name}">{template}</ref>'
    return f"<ref>{template}</ref>"


def _extract_ref_name(body: str) -> list[str]:
    """Extract ref name tokens from a section body in source order.

    Returns the names that appear as ``<ref name="x" />`` placeholders
    in the body. v0 assumes that body authors use a single named
    placeholder per ``Reference`` listed in the section, in matching
    order.
    """
    import re

    return re.findall(r'<ref\s+name="([^"]+)"\s*/>', body)


def _render_section(section: ArticleSection) -> str:
    body = section.body_wikitext
    ref_names = _extract_ref_name(body)
    rendered_refs: list[str] = []
    for ref, name in zip(section.references, ref_names, strict=False):
        rendered_refs.append(
            body.replace(
                f'<ref name="{name}" />',
                _render_reference(ref, name=name),
                1,
            )
        )
    # Apply replacements sequentially on a mutable copy.
    if section.references and ref_names:
        for ref, name in zip(section.references, ref_names, strict=False):
            body = body.replace(
                f'<ref name="{name}" />',
                _render_reference(ref, name=name),
                1,
            )
    return f"== {section.heading} ==\n{body}"


def _collect_external_links(article: WikiArticle) -> list[Reference]:
    seen: set[str] = set()
    out: list[Reference] = []
    for section in article.sections:
        for ref in section.references:
            if ref.url and ref.url not in seen:
                seen.add(ref.url)
                out.append(ref)
    return out


def _render_external_links(article: WikiArticle) -> str:
    refs = _collect_external_links(article)
    if not refs:
        return ""
    bullets = [
        f"* [{ref.url} {ref.title}] — {ref.publisher}"
        for ref in refs
        if ref.url
    ]
    return "== Liens externes ==\n" + "\n".join(bullets)


def _render_categories(article: WikiArticle) -> str:
    return "\n".join(f"[[{cat}]]" for cat in article.categories)


def format_wikitext(article: WikiArticle) -> str:
    """Render a complete Wikipedia FR wikitext document for ``article``."""
    parts: list[str] = []

    infobox = _render_infobox(article)
    if infobox:
        parts.append(infobox)

    parts.append(article.summary)

    for section in article.sections:
        parts.append(_render_section(section))

    parts.append("== Notes et références ==\n<references />")

    external = _render_external_links(article)
    if external:
        parts.append(external)

    categories = _render_categories(article)
    if categories:
        parts.append(categories)

    return "\n\n".join(parts) + "\n"
