"""Convert \\uXXXX escape sequences to actual UTF-8 chars in .tsx files.

JSX text content does not process \\uXXXX escapes, so they render literally
on screen (e.g. "P\\u00e9riode" instead of "Période"). For JS string literals
and template literals, the conversion is a no-op at runtime.

Skips:
  - truly-escaped backslash sequences (\\\\uXXXX) which are intentional
    JSON-LD output escapes used in src/components/JsonLd.tsx and similar.
  - irregular whitespace codepoints (NBSP, NNBSP, etc.) — ESLint
    no-irregular-whitespace forbids those literals in source. They live
    inside template/string literals and work fine as escapes.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "src"

# Codepoints flagged by ESLint no-irregular-whitespace (default config) — keep as escapes.
IRREGULAR_WHITESPACE = {
    0x000B, 0x000C, 0x00A0, 0x1680, 0x180E,
    0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007,
    0x2008, 0x2009, 0x200A, 0x200B, 0x2028, 0x2029, 0x202F, 0x205F,
    0x3000, 0xFEFF,
}

# Negative lookbehind for a single backslash so we never touch \\u003c.
# Optionally captures a following low-surrogate \uXXXX so we can emit one codepoint.
PATTERN = re.compile(
    rb'(?<!\\)\\u([0-9a-fA-F]{4})(?:\\u([0-9a-fA-F]{4}))?'
)


def convert(match: re.Match) -> bytes:
    high = int(match.group(1), 16)
    low_grp = match.group(2)
    # Surrogate pair -> single codepoint
    if 0xD800 <= high <= 0xDBFF and low_grp is not None:
        low = int(low_grp, 16)
        if 0xDC00 <= low <= 0xDFFF:
            cp = 0x10000 + (high - 0xD800) * 0x400 + (low - 0xDC00)
            return chr(cp).encode("utf-8")
    # Lone surrogate: leave untouched
    if 0xD800 <= high <= 0xDFFF:
        return match.group(0)
    # Skip irregular whitespace (lint forbids literal)
    if high in IRREGULAR_WHITESPACE:
        out = match.group(0)[:6]  # original \uXXXX
        if low_grp is not None:
            out += b"\\u" + low_grp
        return out
    out = chr(high).encode("utf-8")
    if low_grp is not None:
        out += b"\\u" + low_grp
    return out


def main() -> int:
    fixed = 0
    for path in ROOT.rglob("*.tsx"):
        raw = path.read_bytes()
        new = PATTERN.sub(convert, raw)
        if new != raw:
            path.write_bytes(new)
            fixed += 1
            print(f"fixed: {path.relative_to(ROOT.parent)}")
    print(f"\nTotal files fixed: {fixed}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
