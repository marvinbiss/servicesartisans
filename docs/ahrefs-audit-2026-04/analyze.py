import re, os, sys

FILES = [
    ("/", "home.html"),
    ("/services/plombier/paris", "svc-plombier-paris.html"),
    ("/services/plombier", "svc-plombier.html"),
    ("/blog", "blog.html"),
    ("/tarifs/plombier", "tarifs-plombier.html"),
]

BASE = os.path.dirname(os.path.abspath(__file__))

def analyze(path):
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        html = f.read()

    total_size = len(html)

    # Body content between <body...> and first <script>
    m = re.search(r"<body[^>]*>(.*?)<script", html, re.S | re.I)
    body_raw = m.group(1) if m else ""
    # Strip tags to compute "useful text" length
    body_text = re.sub(r"<[^>]+>", " ", body_raw)
    body_text = re.sub(r"\s+", " ", body_text).strip()

    # SSR links: <a href="/..." in the raw HTML (excluding script blocks)
    # We remove <script> blocks first
    html_no_script = re.sub(r"<script[^>]*>.*?</script>", "", html, flags=re.S | re.I)
    ssr_links = re.findall(r'<a\s[^>]*href="(/[^"#]*)"', html_no_script)
    ssr_link_count = len(ssr_links)
    ssr_unique = len(set(ssr_links))

    # RSC-embedded links: href inside script blocks (escaped as \"href\":\"/..\" or plain in self.__next_f.push)
    script_blocks = re.findall(r"<script[^>]*>(.*?)</script>", html, flags=re.S | re.I)
    script_text = "\n".join(script_blocks)

    rsc_href_escaped = re.findall(r'\\"href\\":\\"(/[^\\"]*)\\"', script_text)
    rsc_href_plain = re.findall(r'"href":"(/[^"]*)"', script_text)
    rsc_all = rsc_href_escaped + rsc_href_plain
    rsc_count = len(rsc_all)
    rsc_unique = len(set(rsc_all))

    # Next.js Link markers in RSC payload
    lc_markers = len(re.findall(r'"\$Lc"', script_text)) + len(re.findall(r'\\"\$Lc\\"', script_text))
    l_markers = len(re.findall(r'"\$L[0-9a-f]+"', script_text)) + len(re.findall(r'\\"\$L[0-9a-f]+\\"', script_text))

    # Bailout marker
    bailout = html.count("BAILOUT_TO_CLIENT_SIDE_RENDERING")

    # noscript blocks
    noscript = len(re.findall(r"<noscript[^>]*>.*?</noscript>", html, flags=re.S | re.I))

    return {
        "size": total_size,
        "body_useful_chars": len(body_text),
        "body_tags_count": len(re.findall(r"<[a-zA-Z]", body_raw)),
        "ssr_links": ssr_link_count,
        "ssr_unique": ssr_unique,
        "rsc_links": rsc_count,
        "rsc_unique": rsc_unique,
        "lc_markers": lc_markers,
        "l_markers": l_markers,
        "bailout": bailout,
        "noscript": noscript,
        "body_preview": body_text[:220],
    }

results = []
for url, fname in FILES:
    path = os.path.join(BASE, fname)
    r = analyze(path)
    r["url"] = url
    results.append(r)

total_ssr = sum(r["ssr_links"] for r in results)
total_rsc = sum(r["rsc_links"] for r in results)

print(f"{'URL':40s} {'size':>7s} {'body_chars':>10s} {'tags':>5s} {'SSR':>4s} {'SSRu':>5s} {'RSC':>4s} {'RSCu':>5s} {'$Lc':>4s} {'$Lxx':>5s} {'BAIL':>5s} {'NOS':>4s}")
for r in results:
    print(f"{r['url']:40s} {r['size']:>7d} {r['body_useful_chars']:>10d} {r['body_tags_count']:>5d} {r['ssr_links']:>4d} {r['ssr_unique']:>5d} {r['rsc_links']:>4d} {r['rsc_unique']:>5d} {r['lc_markers']:>4d} {r['l_markers']:>5d} {r['bailout']:>5d} {r['noscript']:>4d}")

print()
print(f"TOTAL SSR links: {total_ssr}")
print(f"TOTAL RSC links: {total_rsc}")
if (total_ssr + total_rsc) > 0:
    print(f"SSR ratio: {100.0 * total_ssr / (total_ssr + total_rsc):.2f}%")

print()
print("=== BODY PREVIEWS (first 220 chars of text between <body> and first <script>) ===")
for r in results:
    print(f"-- {r['url']}")
    print(f"   [{r['body_preview']}]")
