"""Single-turn query to the ServicesArtisans AI assistant.

Run:
    python examples/ask.py "Quelles aides pour une pompe a chaleur en zone H1 ?"
"""
from __future__ import annotations

import sys

from sa_rge_sdk import Client


def main(query: str) -> int:
    c = Client()
    result = c.ask(query=query)
    if not result.ok:
        print(f"Refused: {result.reason or 'no reason'}")
        return 1
    print(result.answer or "(empty answer)")
    if result.citations:
        print("\nSources:")
        for c_ in result.citations:
            print(f"  - {c_.title}  {c_.url}")
    return 0


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('usage: python examples/ask.py "<question>"')
        sys.exit(2)
    sys.exit(main(" ".join(sys.argv[1:])))
