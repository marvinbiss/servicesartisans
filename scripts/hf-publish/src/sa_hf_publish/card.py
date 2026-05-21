"""Dataset card rendering via Jinja2.

Produces an HF-Hub-compliant `README.md` with YAML front-matter
(license, task_categories, language, size_categories, tags, configs)
and the standard sections (Description, Source Data, Considerations,
Citation, Contact).
"""

from __future__ import annotations

from pathlib import Path

from jinja2 import Environment, FileSystemLoader, StrictUndefined, select_autoescape

from sa_hf_publish.types import DatasetCardInputs

_TEMPLATES_DIR = Path(__file__).resolve().parents[2] / "templates"
_TEMPLATE_FILENAME = "DATASET_CARD.md.j2"


def _build_env() -> Environment:
    return Environment(
        loader=FileSystemLoader(str(_TEMPLATES_DIR)),
        autoescape=select_autoescape(disabled_extensions=("md", "j2"), default=False),
        undefined=StrictUndefined,
        keep_trailing_newline=True,
        trim_blocks=False,
        lstrip_blocks=False,
    )


def render_dataset_card(inputs: DatasetCardInputs) -> str:
    """Render the HF Hub dataset card markdown.

    Output is a complete markdown string starting with the YAML
    front-matter `---` fence. Callers are expected to write it to
    `<output_dir>/README.md` next to the Parquet shards.
    """
    env = _build_env()
    template = env.get_template(_TEMPLATE_FILENAME)
    return template.render(
        dataset_name=inputs.dataset_name,
        description=inputs.description,
        total_rows=inputs.total_rows,
        total_shards=inputs.total_shards,
        license=inputs.license,
        source_url=inputs.source_url,
        last_updated=inputs.last_updated,
        columns=[col.model_dump() for col in inputs.columns],
        citation_bibtex=inputs.citation_bibtex,
    )
