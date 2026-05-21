"""Tests for the HuggingFace dataset card renderer."""

from __future__ import annotations

from sa_hf_publish.card import render_dataset_card
from sa_hf_publish.types import ColumnSpec, DatasetCardInputs

SAMPLE_CITATION = """@dataset{servicesartisans_rge_49k_enriched_2026,
  title  = {ServicesArtisans RGE 49K Enriched},
  author = {ServicesArtisans},
  year   = {2026},
  url    = {https://huggingface.co/datasets/servicesartisans/rge-49k-enriched}
}"""


def _sample_inputs(columns: list[ColumnSpec] | None = None) -> DatasetCardInputs:
    return DatasetCardInputs(
        dataset_name="servicesartisans/rge-49k-enriched",
        description="Dataset of RGE-certified French contractors enriched with E-E-A-T descriptions.",
        total_rows=49228,
        total_shards=5,
        license="CC-BY-4.0",
        source_url="https://data.ademe.fr/datasets/liste-des-entreprises-rge",
        last_updated="2026-05-21",
        columns=columns
        or [
            ColumnSpec(name="siret", dtype="string", description="14-digit French legal ID"),
            ColumnSpec(name="name", dtype="string", description="Legal name"),
            ColumnSpec(
                name="description",
                dtype="string?",
                description="AI-generated E-E-A-T description",
            ),
        ],
        citation_bibtex=SAMPLE_CITATION,
    )


def test_front_matter_is_parseable() -> None:
    """Card output must start with --- and contain a closing --- fence."""
    md = render_dataset_card(_sample_inputs())
    assert md.startswith("---\n")
    # Split on the second occurrence of '\n---\n'
    parts = md.split("\n---\n", 1)
    assert len(parts) == 2
    # Front-matter body is parts[0] minus leading '---\n'
    front_matter = parts[0][len("---\n") :]
    # Should contain key/value pairs (YAML)
    assert "license: cc-by-4.0" in front_matter
    assert "language:" in front_matter
    assert "tags:" in front_matter
    assert "configs:" in front_matter


def test_front_matter_contains_required_keys() -> None:
    md = render_dataset_card(_sample_inputs())
    front = md.split("\n---\n", 1)[0]
    assert "license: cc-by-4.0" in front
    assert "- fr" in front  # language
    assert "10K<n<100K" in front
    assert "rge" in front
    assert "open-data" in front


def test_body_has_required_sections() -> None:
    md = render_dataset_card(_sample_inputs())
    body = md.split("\n---\n", 1)[1]
    assert "## Dataset Description" in body
    assert "## Columns" in body
    assert "## Source Data" in body
    assert "## Considerations for Using the Data" in body
    assert "### Personal Information" in body
    assert "### Bias and Limitations" in body
    assert "### Licensing" in body
    assert "## Source" in body
    assert "## Contact" in body
    # Title must mirror dataset name
    assert "# Dataset Card for servicesartisans/rge-49k-enriched" in body


def test_column_descriptions_all_present() -> None:
    columns = [
        ColumnSpec(name="siret", dtype="string", description="SIRET French legal ID"),
        ColumnSpec(name="siren", dtype="string", description="SIREN business ID"),
        ColumnSpec(
            name="rge_qualifications_json",
            dtype="string",
            description="JSON serialized list",
        ),
    ]
    md = render_dataset_card(_sample_inputs(columns=columns))
    for col in columns:
        assert f"`{col.name}`" in md
        assert col.description in md


def test_citation_bibtex_well_escaped() -> None:
    md = render_dataset_card(_sample_inputs())
    # Citation BibTeX must appear verbatim, not contain raw '\n' literal
    assert "servicesartisans_rge_49k_enriched_2026" in md
    assert "title  = {ServicesArtisans RGE 49K Enriched}" in md
    # No raw escape sequence
    assert "\\n" not in md.replace("\\\\n", "")
    # Must be inside a fenced bibtex block
    assert "```bibtex" in md


def test_total_rows_and_shards_rendered() -> None:
    md = render_dataset_card(_sample_inputs())
    body = md.split("\n---\n", 1)[1]
    assert "49228" in body
    assert "5 Parquet files" in body


def test_source_url_appears_in_source_data_section() -> None:
    md = render_dataset_card(_sample_inputs())
    assert "https://data.ademe.fr/datasets/liste-des-entreprises-rge" in md
    assert "https://servicesartisans.fr" in md


def test_discussions_link_uses_dataset_name() -> None:
    md = render_dataset_card(_sample_inputs())
    assert (
        "https://huggingface.co/datasets/servicesartisans/rge-49k-enriched/discussions"
        in md
    )
