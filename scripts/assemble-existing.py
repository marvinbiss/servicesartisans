#!/usr/bin/env python3
"""Assemble all article parts into the final existing-articles.ts file."""
import json
import os

# Load all parts
all_articles = []
for part in range(1, 5):
    path = f'/tmp/articles_part{part}.json'
    with open(path, 'r', encoding='utf-8') as f:
        articles = json.load(f)
        all_articles.extend(articles)

print(f"Total articles loaded: {len(all_articles)}")

# Build TypeScript
lines = []
lines.append("import type { BlogArticle } from './articles'")
lines.append("")
lines.append("export const existingArticles: Record<string, BlogArticle> = {")

for i, article in enumerate(all_articles):
    slug = article['slug']

    def esc_sq(s):
        """Escape for single-quoted strings (no newlines expected)."""
        return s.replace("\\", "\\\\").replace("'", "\\'")

    def esc_dq(s):
        """Escape for double-quoted strings, keeping \\n as literal \\n."""
        s = s.replace("\\", "\\\\")
        s = s.replace('"', '\\"')
        s = s.replace("\n", "\\n")
        s = s.replace("\r", "")
        return s

    lines.append(f"  '{slug}': {{")
    lines.append(f"    title: '{esc_sq(article['title'])}',")
    lines.append(f"    excerpt: '{esc_sq(article['excerpt'])}',")

    # Content array
    lines.append("    content: [")
    for j, block in enumerate(article['content']):
        escaped = esc_dq(block)
        lines.append(f'      "{escaped}",')
    lines.append("    ],")

    lines.append(f"    image: '{article['image']}',")
    lines.append(f"    author: '{esc_sq(article['author'])}',")

    if 'authorBio' in article:
        lines.append(f"    authorBio: '{esc_sq(article['authorBio'])}',")

    lines.append(f"    date: '{article['date']}',")

    if 'updatedDate' in article:
        lines.append(f"    updatedDate: '{article['updatedDate']}',")

    lines.append(f"    readTime: '{article['readTime']}',")
    lines.append(f"    category: '{esc_sq(article['category'])}',")

    # Tags
    tags_str = ', '.join([f"'{esc_sq(t)}'" for t in article['tags']])
    lines.append(f"    tags: [{tags_str}],")

    # FAQ
    if 'faq' in article and article['faq']:
        lines.append("    faq: [")
        for k, faq_item in enumerate(article['faq']):
            q = esc_sq(faq_item['question'])
            a = esc_sq(faq_item['answer'])
            lines.append(f"      {{ question: '{q}', answer: '{a}' }},")
        lines.append("    ],")

    lines.append(f"  }},")

lines.append("}")
lines.append("")

# Write to file
win_path = r'C:\Users\USER\Downloads\servicesartisans\src\lib\data\blog\existing-articles.ts'

with open(win_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print(f"Written {len(all_articles)} articles to existing-articles.ts")
print(f"File size: {os.path.getsize(win_path)} bytes")
