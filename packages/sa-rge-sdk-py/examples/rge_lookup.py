"""Lookup an RGE-certified artisan by SIRET.

Run:
    python examples/rge_lookup.py 12345678901234
"""
from __future__ import annotations

import sys

from sa_rge_sdk import Client, NotFoundError


def main(siret: str) -> int:
    c = Client()
    try:
        artisan = c.rge_lookup(siret=siret)
    except NotFoundError:
        print(f"No RGE artisan with SIRET {siret}")
        return 1
    if artisan is None:
        print(f"No record for SIRET {siret}")
        return 1
    print(f"Name       : {artisan.name}")
    print(f"City       : {artisan.address_city}")
    print(f"Department : {artisan.address_department}")
    print(f"Qualifs    : {len(artisan.qualifications)}")
    for q in artisan.qualifications:
        print(f"  - {q.get('code', '?'):<10} {q.get('label', '')}")
    return 0


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("usage: python examples/rge_lookup.py <siret>")
        sys.exit(2)
    sys.exit(main(sys.argv[1]))
