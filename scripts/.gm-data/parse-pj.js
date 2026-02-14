const html = require("fs").readFileSync("scripts/.gm-data/sample-pj-search.html", "utf8");

// Find denomination links with business names
const denomRe = /class="bi-denomination[^"]*"[^>]*href="([^"]+)"[^>]*>\s*\n?\s*([^<\n]+)/g;
let m;
const entries = [];
while ((m = denomRe.exec(html)) !== null) {
  entries.push({ href: m[1], name: m[2].trim(), idx: m.index });
}

console.log("Found", entries.length, "business results\n");

for (const entry of entries.slice(0, 10)) {
  const ctx = html.substring(entry.idx, entry.idx + 3000);
  const phoneMatch = ctx.match(/(0[1-9][\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2})/);
  const cityMatch = ctx.match(/bi-address-city[^>]*>([^<]+)/);
  console.log(
    entry.name.padEnd(50),
    "|",
    (phoneMatch ? phoneMatch[1] : "no phone").padEnd(16),
    "|",
    cityMatch ? cityMatch[1].trim() : ""
  );
}
