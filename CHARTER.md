# Google Trust, Branding & Identity Charter — ServicesArtisans

**Version:** 2.0
**Status:** CONSTITUTIONAL — All technical, SEO, content, and branding decisions must comply.
**Scope:** Domain-wide. Applies to every page, API route, structured data emission, and public-facing string.
**Authority:** This document supersedes any individual audit, PR description, or sprint goal.

---

## 1. Google Ontology Positioning

### What ServicesArtisans IS

ServicesArtisans is a **local service marketplace** — a two-sided platform that connects end-consumers seeking home services (plumbing, electrical, roofing, etc.) with verified independent artisans across France.

In Google's internal taxonomy, it must be classified as:

- **Entity type:** `LocalBusiness` aggregator / `ProfessionalService` marketplace
- **Content model:** Database-backed directory with transactional intent (quote requests, bookings, payments)
- **User relationship:** The site is an intermediary that facilitates a real-world service transaction between two identified parties
- **Value proposition to the user:** Discovery, comparison, and contact initiation with local professionals — not content consumption

Google's classifiers should understand this site as equivalent to: Doctolib (healthcare), PagesJaunes (directory), or Houzz (home services) — a **utility platform** where the content is the data, not the prose.

### What ServicesArtisans is NOT

The following classifications represent high risk to domain trust. The site must never exhibit patterns associated with:

- **SEO directory farm:** A site that generates thousands of thin pages targeting long-tail queries with no differentiated content per page and no real underlying service
- **Lead arbitrage site:** A site whose sole purpose is to collect user information and resell it to service providers without providing transparent value to the consumer
- **Thin affiliate:** A site that exists only to rank and redirect, with no original content, no real transactions, and no user relationship
- **Doorway page network:** A set of pages created solely to rank for geographic variations of the same query, funneling users to a single conversion point with no per-page value
- **Auto-generated content site:** A site where the majority of visible text is produced by templates with variable substitution, offering no information that the user could not obtain by reading one page and mentally replacing the city name

**The binary test:** If a Google Search Quality Rater cannot distinguish `/services/plombier/lyon` from `/services/plombier/marseille` without reading the city name in the title, the site fails this charter.

---

## 2. Brand Truth & E-E-A-T Rules

### Foundational Principle

> **If a claim is not true in the real world, it must never appear on the site.**

This applies to every string rendered in HTML, every value emitted in structured data, every number displayed in a UI component, and every name attributed to a person or entity.

### 2.1 Legal Identity Rules

| Rule | Requirement |
|------|-------------|
| **SIRET / RCS / TVA** | Must correspond to a real, verifiable company registration. Fictitious numbers (e.g., `123 456 789 00012`) carry high risk of being interpreted as deceptive by both French regulators and Google quality systems. |
| **Registered address** | Must be a real address where the legal entity can receive mail. No placeholder addresses. |
| **Phone number** | Must be a real, reachable number. Sequential placeholders (e.g., `01 23 45 67 89`) are forbidden. |
| **Publication director** | Must be a real person legally responsible for the site's content, consistent with French publishing law requirements. |
| **Business existence** | The entity operating ServicesArtisans must be registered with the French government (Registre du Commerce et des Sociétés or equivalent). If it is not yet registered, the site must not publish mentions légales that claim it is. |

**Enforcement:** No deployment to production is permitted until legal identity information is verifiable through public French business registries (Infogreffe, Pappers, INSEE SIRENE).

### 2.2 Review & Rating Rules

| Rule | Requirement |
|------|-------------|
| **aggregateRating values** | Must be computed from real, stored review data. A hardcoded `ratingValue` is high risk for structured data suppression and manual review. |
| **reviewCount** | Must represent the actual count of submitted reviews, not a proxy (e.g., number of providers, number of bookings). |
| **Individual ratings** | Must originate from a verified interaction (booking, quote, completed service). Fabricated or imported reviews without attribution are forbidden. |
| **Rating absence** | If a provider or page has zero reviews, no `AggregateRating` schema may be emitted. An absent rating is preferable to a fabricated one. |
| **Rating consistency** | The rating shown on a hub page must be mathematically derivable from the ratings shown on individual provider pages within that hub. Inconsistency between levels is a likely manipulation signal for automated classifiers. |

**The rule:** A constant `4.5` across 2,115 pages is a statistically improbable distribution. Automated systems that compare rating patterns across a domain are likely to suppress rich results for the entire site.

### 2.3 Statistics & Numbers Rules

| Rule | Requirement |
|------|-------------|
| **Displayed counts** (artisans, reviews, cities) | Must reflect live database state. When the database is unavailable, the site must display "Information temporarily unavailable" — never a fallback number. |
| **Satisfaction percentages** | Must be derived from a documented methodology (survey, review analysis) with a sample size. Unsourced claims like "98% clients satisfaits" are forbidden. |
| **"Since [year]"** claims | Must correspond to the actual date of first commercial operation or company registration. |

**The rule:** A Quality Rater will attempt to verify claims. Any claim that cannot survive a 30-second verification attempt severely undermines trust for the entire domain.

### 2.4 Team & Company Representation Rules

| Rule | Requirement |
|------|-------------|
| **Named individuals** | Every person named on the site must be a real person who has consented to being represented. Generic names with emoji avatars are a strong signal of automated site generation. |
| **Photos** | Must be real photographs of real people, or the section must not exist. Emojis, stock photos presented as team members, or AI-generated faces are forbidden. |
| **Roles and titles** | Must reflect actual organizational roles. If the company has no CEO, no one is called CEO. |
| **Alternative** | If the team cannot be truthfully represented, the About page should focus on the company's mission, the platform's mechanics, and verifiable facts about the service — not fictional humans. |

---

## 3. Quality Rater Simulation

### How a Quality Rater evaluates this site

A Google Search Quality Rater follows the Quality Rater Guidelines (QRG). For a site like ServicesArtisans, the evaluation framework is:

**Page Purpose:** Clear and beneficial — connecting users with local service providers. This is a valid, high-utility purpose.

**YMYL Classification:** Partially YMYL. Home services involve financial transactions, physical safety (electrical, gas), and contractual commitments. This elevates the E-E-A-T requirements.

### What would likely trigger a "Lowest" or "Deceptive" rating

| Signal | Current state | Likely QRG interpretation |
|--------|--------------|--------------------------|
| Fictitious legal information (SIRET, RCS, address) | **Present** | High risk of "Deceptive page design" classification — pages presenting unverifiable business identity |
| Fictitious team members with emoji photos | **Present** | High risk of "Deceptive" flag — fabricated author profiles undermine perceived legitimacy |
| Hardcoded rating 4.5 on all pages | **Present** | Likely classified as "Unsubstantiated claims" — misleading structured data |
| Invented statistics displayed as fact | **Present** (fallback stats) | High risk of "False or misleading claims" classification |

Any ONE of these represents a significant trust risk. Combined, they form a pattern highly likely to be interpreted as deceptive by quality evaluation systems.

### What would likely trigger a "Low" rating

| Signal | Risk |
|--------|------|
| Template-filled content identical across 2,115 pages | High risk of "Lowest quality MC" classification — auto-generated content with no per-page value |
| Blog with 4 articles dated 2023, no updates | Risk of "Unmaintained" signal — suggests abandoned site |
| Provider descriptions auto-generated from templates | Risk of "Low quality MC" — no evidence of expertise or effort |
| Pages for cities with 0 providers showing template text | Risk of "Unsatisfying amount of MC for the purpose of the page" |

### What would justify "High" trust over time

| Signal | Requirement |
|--------|-------------|
| Verifiable business identity | Real SIRET, real address, real humans |
| Authentic reviews from verified transactions | Reviews tied to completed bookings |
| Provider profiles with real data | SIRET verification, real portfolios, real bios written by artisans |
| Content differentiation per page | Local pricing data, local regulations, local provider metrics |
| Editorial content demonstrating expertise | Guides written by industry professionals, not templates |
| Consistent, maintained presence | Regular content updates, active blog, responsive contact |
| Transaction capability | Real bookings, real payments, real quotes — not just lead collection |

**The trajectory:** Trust is built over years through consistent verifiable signals. It can be severely damaged in a single crawl cycle through deceptive ones.

---

## 4. Reliability & Failure-Mode Doctrine

### The Invariant

> **For every URL that Google has indexed with a 200 status and `index, follow` robots directive, that URL must continue to return a 200 status with substantive content on every subsequent crawl. Exceptions are limited to genuine entity deletion (hard 404) or permanent restructuring (301 redirect).**

### 4.1 What must ALWAYS return HTTP 200

| Page type | Condition | Mechanism | Acceptance criteria |
|-----------|-----------|-----------|---------------------|
| Hub pages (`/services/[service]/[location]`) | Even if DB is down | ISR stale cache must be preserved. If revalidation fails, the previous cached version MUST survive. The revalidation function must throw on DB failure to prevent cache replacement. | `curl -sI [url]` returns `200`. `x-vercel-cache: HIT` or `STALE`. Response body contains `<h1>` with service + location name. `<meta name="robots">` does NOT contain `noindex`. |
| Service pages (`/services/[service]`) | Even if DB is down | Must have static fallback data identical to hub pages. | `curl -sI [url]` returns `200`. Response body contains service name in `<title>`. |
| Static pages (`/`, `/services`, `/a-propos`, etc.) | Always | No database dependency for rendering. | `curl -sI [url]` returns `200`. |
| Geographic pages (`/villes/*`, `/departements/*`, `/regions/*`) | Always | Data sourced from static definitions, no DB dependency. | `curl -sI [url]` returns `200`. |

### 4.2 What must return HTTP 404

| Condition | Response | Requirement | Acceptance criteria |
|-----------|----------|-------------|---------------------|
| URL with slug not in `generateStaticParams` | Hard 404 | `dynamicParams = false` enforces this. Never change. | `curl -sI [invalid-url]` returns `404`. |
| Provider deliberately deactivated or deleted (confirmed via DB state, not DB outage) | Hard 404 via `notFound()` | Only when DB confirms the entity no longer exists. Never on DB timeout or connection failure. | `curl -sI [deactivated-provider-url]` returns `404`. Provider `is_active=false` in DB. |
| DB outage while serving a provider page | Serve stale ISR cache (200) | Provider pages must use ISR caching (not `force-dynamic`). A DB outage must never instantly 404 pages that were previously healthy. | `curl -sI [provider-url]` returns `200` during DB outage. `x-vercel-cache: STALE`. |
| Invalid URL structure | Hard 404 | No soft-404, no redirect to homepage. | `curl -sI [garbage-url]` returns `404`. |

### 4.3 What must NEVER carry `noindex`

| Page type | Rule |
|-----------|------|
| Hub pages that have been indexed with providers | If a previously-indexed hub page temporarily has 0 providers due to DB failure, it must NOT receive `noindex`. The stale cache with providers must be served instead. |
| Any page due to transient infrastructure failure | `noindex` is a content-quality signal, not an error-handling mechanism. Infrastructure failure must be handled by serving stale content or throwing errors, never by toggling robots directives. |

### 4.4 What must NEVER oscillate

| Signal | Rule | Acceptance criteria |
|--------|------|---------------------|
| `robots` meta tag (index/noindex) | A page that is `index` today and `noindex` tomorrow and `index` again signals instability. Google reduces crawl priority and trust for oscillating pages. | Two `curl` requests 5 minutes apart to the same URL must return identical `<meta name="robots">` content. |
| Canonical URL | Must be deterministic and stable. A canonical that changes based on DB state or request timing is a consistency violation. | Two requests to the same URL must return identical `<link rel="canonical">` value. |
| Structured data presence | If a page emits JSON-LD on one crawl and not on the next, Google discards the structured data signal entirely. | `curl -s [url] \| grep "application/ld+json"` must return consistent results across requests. |
| Content substance | A page that shows 15 providers on one crawl and "Aucun artisan trouvé" on the next is a quality signal contradiction. | Provider list count must not drop to 0 between requests unless the entity was genuinely removed. |

### 4.5 Failure-mode rules

| Rule | Statement | Acceptance criteria |
|------|-----------|---------------------|
| **Rule F1** | A failed ISR revalidation must throw an error, forcing the CDN to serve the stale cached version. A "successful" revalidation that produces degraded content is worse than a failed one. | During simulated DB outage: `x-vercel-cache` header shows `STALE` (not `MISS` or `HIT` with degraded content). Response body matches last-known-good content. |
| **Rule F2** | Provider detail pages must have ISR caching (not `force-dynamic`). A DB outage must not instantly 404 every provider page in the sitemap. | Provider page `page.tsx` exports `revalidate > 0` (not `revalidate = 0`). During DB outage: `curl -sI [provider-url]` returns `200`. |
| **Rule F3** | The sitemap must be resilient to DB failure. When DB is unavailable, serve a cached or static fallback sitemap containing at minimum all statically-generated hub page URLs. A sitemap that drops from 3,000 URLs to 10 during a DB outage signals mass deletion to Google. | During DB outage: `curl -s [sitemap-url]` returns XML with at least all hub page URLs (2,115+). |
| **Rule F4** | The `error.tsx` boundary must either return HTTP 500 (not 200) or include `<meta name="robots" content="noindex">`. A 200 response with error content is a soft-404 that may be indexed. | Error page source contains `noindex` meta tag, OR the HTTP status code is 500. |
| **Rule F5** | No public endpoint may trigger cache invalidation without authentication. Unauthenticated revalidation during a DB outage is a vector for mass cache poisoning. | `curl -X POST [revalidate-endpoint]` without auth token returns `401` or `403`. |

---

## 5. SEO Expansion Constraints

### The Helpful Content System threat model

Google's Helpful Content System (HCU) evaluates content quality at the **domain level**, not the page level. If a sufficient proportion of pages on a domain are classified as "unhelpful," the entire domain is at risk of ranking suppression that affects ALL pages — including high-quality ones.

This means: **every thin page degrades every good page.**

### 5.1 When adding a city becomes dangerous

A new city page (`/services/[service]/[city]`) is justified ONLY when:

| Criterion | Minimum threshold |
|-----------|------------------|
| **Provider count** | At least 3 verified, active providers with distinct profiles exist for that service in that city. A page with 0-2 providers offers no comparison value and is functionally a doorway page. |
| **Content differentiation** | The page must contain at least one substantive element that differs from all other city pages beyond the city name: local provider data, local pricing signals, local demand indicators. |
| **User intent match** | There must be evidence of real search demand for `[service] [city]`. Generating pages for cities with no search volume is crawl budget waste. |

**Hard limit:** No city page may exist if it would display identical template text and zero providers. The `noindex` mechanism is a safety net, not a content strategy.

### 5.2 When adding a service becomes dangerous

A new service slug must satisfy:

| Criterion | Requirement |
|-----------|-------------|
| **Real provider coverage** | At least 10 providers across at least 5 cities offer this service. |
| **Distinct user intent** | The service must represent a genuinely different search intent from existing services. `/services/chauffagiste` and `/services/climaticien` are distinct. `/services/plombier` and `/services/plomberie` are not. |
| **Full pipeline support** | The service must be represented in: `generateStaticParams`, the services hub page, the sitemap, structured data schemas, and the quote request system. A service listed in the hub but absent from page generation creates internal link rot. |

### 5.3 Content differentiation requirements

For every programmatic page, the following content elements must be derived from **real data, not templates**:

| Element | Source | Forbidden |
|---------|--------|-----------|
| Provider count | Live DB query | Hardcoded number |
| Average rating | Computed from reviews | Hardcoded `4.5` |
| Provider names and specialties | DB profiles | "Professionnel qualifié en [service]" |
| Service-specific information | Editorial per-service content | Generic bullet points identical across services |
| Local context | Data-derived (postal code, department, regional info) | "Connaissance des spécificités locales" without specifics |

### 5.4 Domain-level quality ratio

Google's HCU evaluates an implicit quality ratio:

```
quality_ratio = pages_with_genuine_unique_value / total_indexed_pages
```

The exact threshold is not public, but observed HCU impacts suggest domains with a low proportion of genuinely useful pages face domain-wide suppression.

**Operational rule:** Before adding any batch of new pages, calculate: how many of these pages will have 3+ providers with real reviews? If less than 70%, do not generate them.

### 5.5 The template-filling line

Template-filled content is content where:
- The same paragraph structure appears on 100+ pages
- Only proper nouns (city names, service names) change between pages
- No data-derived facts unique to the page are present
- A reader gains zero additional information by reading page N+1 after reading page N

**This charter prohibits template-filled content on any indexed page.** Every indexed page must contain at least one paragraph of information that cannot be derived by string-replacing the city name from another page.

---

## 6. Branding Surface Rules

### 6.1 Tone

All public-facing copy must be **factual, precise, and restrained**. The site speaks as a utility, not as a marketing operation.

| Allowed | Forbidden |
|---------|-----------|
| "Comparez les artisans disponibles dans votre ville" | "Les meilleurs artisans de France" |
| "Consultez les avis clients verifies" | "La plateforme #1 des artisans" |
| "Demandez un devis gratuit" | "Satisfaction garantie" (unless backed by a documented guarantee policy) |
| Specific, verifiable numbers from the database | Rounded, inflated, or aspirational numbers |

**Rule:** No superlative ("meilleur", "premier", "#1", "leader") unless backed by a verifiable, cited third-party source. No unqualified guarantee ("garanti", "certifie") unless a documented policy or certification exists.

### 6.2 Visual trust signals

| Allowed | Forbidden |
|---------|-----------|
| Real partner logos with documented partnerships | Logos of companies with no formal relationship ("Vu dans Le Monde" without a real article) |
| Trust badges from real certification bodies (Qualibat, RGE) on providers who hold them | Generic "Verified" or "Trusted" badges designed in-house with no backing methodology |
| Screenshots or quotes from real press coverage with links | Fabricated press mentions or "As seen on" banners without sources |
| Real user testimonials with verifiable attribution | Stock-photo testimonials with generic names |

**Rule:** Every trust signal displayed must trace back to a verifiable external source. If the badge, logo, or claim cannot be independently confirmed, it must not appear.

### 6.3 Minimum trust pages

The following pages must exist, contain real information, and be linked from the site footer before production deployment:

| Page | Requirement |
|------|-------------|
| **Mentions legales** | Real SIRET, RCS, address, phone, publication director. Verifiable through public registries. |
| **Contact** | Real contact method (email, phone, or form) that produces a response. |
| **Politique de confidentialite** | GDPR-compliant privacy policy reflecting actual data processing. |
| **CGU** | Terms of use governing the platform relationship. |
| **CGV** | General terms of sale if the platform processes transactions. |
| **Politique d'avis** | How reviews are collected, moderated, and displayed. Methodology for aggregate ratings. |
| **Politique de moderation** | How provider profiles and content are moderated. |
| **Methodologie des notes** | How ratings are computed, what they represent, how they are updated. |

---

## 7. Google-Facing Entity Consistency

### 7.1 Schema type mapping

Each page type must emit exactly one primary `@type` in its JSON-LD. The mapping is:

| Page type | URL pattern | Primary `@type` | Forbidden `@type` |
|-----------|-------------|------------------|--------------------|
| Homepage | `/` | `WebSite` + `Organization` | `LocalBusiness` |
| Services hub | `/services` | `CollectionPage` + `ItemList` | `LocalBusiness` |
| Service hub | `/services/[service]` | `CollectionPage` + `ItemList` | `LocalBusiness` |
| Service+Location hub | `/services/[service]/[location]` | `CollectionPage` + `ItemList` | `LocalBusiness`, `ProfessionalService` |
| Provider detail | `/services/[service]/[location]/[id]` | `LocalBusiness` or `ProfessionalService` | `CollectionPage` |
| Geographic pages | `/villes/*`, `/departements/*`, `/regions/*` | `CollectionPage` | `LocalBusiness` |
| Blog article | `/blog/[slug]` | `Article` or `BlogPosting` | `LocalBusiness` |
| FAQ | `/faq` | `FAQPage` | `LocalBusiness` |

### 7.2 Entity consistency rules

| Rule | Statement |
|------|-----------|
| **ENT-1** | A hub page that lists multiple providers must NOT emit `LocalBusiness` schema. A `LocalBusiness` represents a single business entity. Emitting it on a listing page misrepresents the page's nature to Google. |
| **ENT-2** | `AggregateRating` on a `CollectionPage`/`ItemList` is not supported by Google's rich results. Ratings on hub pages must not be emitted as structured data. They may be displayed visually but not in JSON-LD. |
| **ENT-3** | The `Organization` schema (representing ServicesArtisans itself) must appear only on the homepage or a dedicated about page — never on provider detail pages. |
| **ENT-4** | `BreadcrumbList` may appear on any page and must reflect the actual navigation hierarchy: `Accueil > Services > [Service] > [Location] > [Provider]`. |
| **ENT-5** | `FAQPage` schema on provider pages must contain questions specific to that provider. Generic FAQ identical across all provider pages should not be emitted as structured data. |

---

## 8. Source of Truth Hierarchy

### 8.1 Data authority levels

All data displayed on the site and emitted in structured data follows this hierarchy of authority:

| Priority | Source | Examples | Permitted use |
|----------|--------|----------|---------------|
| **1 (Highest)** | Real-world legal documents | SIRET registration, RCS filing, insurance certificates, Qualibat/RGE certifications | Mentions legales, provider credentials, business identity |
| **2** | Database records from verified interactions | Reviews submitted after bookings, booking counts, payment records, provider profiles entered by artisans | Ratings, review counts, statistics, provider descriptions |
| **3** | Database records from unverified sources | Provider profiles imported from external sources, GPS coordinates from geocoding, scraped data | Display with attribution ("Source: Google Maps"). Never emit as first-party structured data without verification. |
| **4** | Static datasets | `france.ts` (cities, departments, regions, postal codes) | Geographic page generation, fallback location data. Never for provider counts, ratings, or any dynamic metric. |
| **5 (Lowest)** | UI copy templates | Marketing text, page descriptions, placeholder strings | Prose elements only. Never for structured data, never for verifiable claims. |

### 8.2 Structured data source rule

> **Structured data (`application/ld+json`) may only contain values derived from Source Level 1 (legal documents) or Source Level 2 (verified database records). No structured data field may be populated from Source Levels 3, 4, or 5.**

This means:
- `ratingValue` must come from computed review averages (Level 2), never hardcoded (Level 5)
- `reviewCount` must come from actual review count (Level 2), never provider count (proxy)
- `address`, `telephone` for a provider must come from their verified profile (Level 2)
- `name` of the Organization in homepage schema must match the legal business name (Level 1)
- Geographic data (city names, postal codes) from Level 4 may appear in page content but NOT in structured data claims about the business

### 8.3 Conflict resolution

When sources at different levels conflict:
- Level 1 always wins (legal reality overrides everything)
- Level 2 overrides Levels 3-5 (verified data overrides imported/static/template data)
- When Level 2 is unavailable (DB down), the system must serve stale Level 2 data or omit the field — never fall back to Level 4 or 5

---

## 9. Engineering & Content Red Lines

### 9.1 URL structure — IMMUTABLE

| Rule | Statement |
|------|-----------|
| **URL-1** | The URL pattern `/services/[service]/[location]/[stable_id]` is permanent. No migration to slug-based, numeric, or alternative URL schemes is permitted without a complete 301 redirect map covering every indexed URL. |
| **URL-2** | The `stable_id` (HMAC-based) is the canonical identifier for provider pages. It must never be replaced by database IDs, slugs, or any mutable identifier in URLs. |
| **URL-3** | URL slugs for services and locations must be immutable once indexed. Renaming a slug without 301 redirects destroys accumulated PageRank and link equity. |
| **URL-4** | The sitemap must emit URLs using the same identifier that the page resolver uses. If the page resolves by `stable_id`, the sitemap must use `stable_id`. Any mismatch means the sitemap points to 404s. |

### 9.2 Canonical logic — DETERMINISTIC

| Rule | Statement |
|------|-----------|
| **CAN-1** | Every indexable page must have exactly one canonical URL. This canonical must be deterministic (same input -> same output, regardless of DB state or request timing). |
| **CAN-2** | Trailing slash normalization (301 redirect) in middleware must never be removed. |
| **CAN-3** | A provider associated with multiple cities has ONE canonical URL based on its primary city. Other city pages may link to it but must not emit a different canonical. |

### 9.3 `dynamicParams` usage — LOCKED

| Rule | Statement |
|------|-----------|
| **DYN-1** | `dynamicParams = false` on hub pages (`/services/[service]/[location]`) must never be changed to `true` without a gating mechanism that prevents unbounded page generation. |
| **DYN-2** | If `dynamicParams = true` is ever adopted for scaling beyond the static matrix, it must be paired with: a whitelist of valid combinations in the database, a hard 404 for non-whitelisted combinations, and ISR caching. |

### 9.4 Structured data integrity — VERIFIED

| Rule | Statement |
|------|-----------|
| **SD-1** | Every `AggregateRating` must be computed from real stored data (Source Level 2). No hardcoded values. No proxy counts. |
| **SD-2** | JSON-LD must be emitted server-side (in the initial HTML response). Client-side injection via `afterInteractive` is not reliably processed during Googlebot's rendering pass. |
| **SD-3** | The `@type` must follow the mapping defined in Section 7.1. Hub pages must never emit `LocalBusiness`. Provider pages must never emit `CollectionPage`. |
| **SD-4** | Structured data must be validated against Google's Rich Results Test before any schema change is deployed. |

### 9.5 Review system — AUTHENTIC

| Rule | Statement |
|------|-----------|
| **REV-1** | Reviews displayed on the site must originate from verified interactions on the platform. Imported reviews (e.g., from Google Maps) must be clearly attributed with source and date. |
| **REV-2** | Review counts and averages must be recomputed, not cached indefinitely. A provider whose last review was deleted must reflect the new count. |
| **REV-3** | No review content may be fabricated, paraphrased, or AI-generated to fill empty profiles. An empty review section is preferable to a populated but fake one. |

### 9.6 Short-term wins that would permanently poison Google trust

The following actions may appear beneficial in the short term but carry high risk of irreversible damage to the domain's standing in Google's quality systems:

| Action | Why it's high risk |
|--------|--------------------|
| **Generating pages for all 36,000 French communes** | 95%+ would have 0 providers. The domain-level quality ratio collapses. Recovery from HCU-type suppression is observed to take 6-18 months after content removal. |
| **Filling empty pages with AI-generated "local" content** | Scaled AI content with low differentiation is increasingly likely to be detected by content quality classifiers. A domain associated with this pattern risks trust signal erosion across all pages. |
| **Importing fake or unverified reviews to boost ratings** | A sudden influx of reviews inconsistent with the site's transaction volume is a strong manipulation signal for review quality systems. |
| **Removing `noindex` from empty pages to "increase indexed pages"** | Indexed page count is not a ranking signal. Indexing empty pages dilutes domain quality and risks triggering thin content classifiers. |
| **Adding dozens of services without provider coverage** | Each empty service x city combination is functionally a doorway page. At scale, this risks triggering doorway page classifiers that can suppress the entire site. |
| **Using redirects to funnel multiple URLs to one conversion page** | This is the textbook definition of a doorway page network. |
| **Publishing legal pages with fictitious information** | Unverifiable legal information is highly likely to be interpreted as deceptive by quality evaluation systems. Reversing this perception is extremely difficult. |
| **Hardcoding favorable metrics in structured data** | Statistically improbable rating distributions across a domain are a known trigger for structured data suppression, potentially affecting all rich results for months. |

---

## Closing statement

This charter defines what ServicesArtisans **is allowed to claim** about itself, its providers, and its data. It defines the boundaries within which all engineering, content, and SEO decisions must operate.

The fundamental commitment is simple:

> **Everything Google sees must be true. Everything the user sees must be real. Everything the site claims must be verifiable. Structured data must only reflect Source Level 1 or 2.**

Any decision that conflicts with this charter must be escalated and resolved before implementation.

---

*Version 2.0 — Produced from cross-analysis by 5 specialized agents (SEO & Google Systems Architect, Reliability & Failure-Mode Engineer, Branding & Trust Architect, Codebase Architect, Validation & Truth Agent). Revised for legal safety, operational enforceability, and testable acceptance criteria.*
