.PHONY: install lint type test dry-run-sample clean

install:
	uv sync --extra dev

lint:
	uv run ruff check src tests
	uv run ruff format --check src tests

format:
	uv run ruff format src tests

type:
	uv run mypy src

test:
	uv run pytest -v

dry-run-sample:
	uv run sa-hf-publish --dry-run --limit 20 --output ./hf-staging

clean:
	rm -rf .venv __pycache__ */__pycache__ */*/__pycache__ .pytest_cache .ruff_cache .mypy_cache
	rm -rf hf-staging
