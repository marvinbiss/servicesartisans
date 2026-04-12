# DESIGN.md — ServicesArtisans Design System

## Palette

The brand is **warm**. Terracotta, sand, charcoal. Never cold blues, grays, or slates.

### Primary Colors

| Token         | Hex     | Usage                                     |
| ------------- | ------- | ----------------------------------------- |
| `primary-400` | #E86B4B | Interactive elements, links, hover states |
| `primary-500` | #D4553A | Primary buttons (bg), CTA fills           |
| `primary-600` | #C24B2A | Primary button hover, active states       |

### Secondary (Honey Gold)

| Token           | Hex     | Usage                              |
| --------------- | ------- | ---------------------------------- |
| `secondary-400` | #f2b523 | Stars, ratings, badges, highlights |
| `secondary-500` | #e8960a | Premium indicators, gold accents   |

### Accent (Forest Green)

| Token        | Hex     | Usage                                  |
| ------------ | ------- | -------------------------------------- |
| `accent-500` | #3D8B68 | Verified badges, success states, trust |
| `accent-50`  | #F0F7F4 | Success background tint                |

### Neutrals

| Token          | Hex     | Usage                           |
| -------------- | ------- | ------------------------------- |
| `sand-50`      | #FDFAF7 | Page background (body)          |
| `sand-100`     | #F9F4EE | Card backgrounds (alternate)    |
| `sand-200`     | #F4EFE8 | Section dividers                |
| `sand-300`     | #EDE8E1 | Card borders (default)          |
| `sand-400`     | #E5DDD4 | Muted borders, skeleton shimmer |
| `sand-600`     | #B8A99A | Placeholder text, muted icons   |
| `charcoal-400` | #918C85 | Secondary text                  |
| `charcoal-500` | #706A62 | Body text (secondary)           |
| `charcoal-700` | #45403B | Body text (primary, lighter)    |
| `charcoal-900` | #1C1917 | Headings, primary text          |
| `charcoal-950` | #0F0E0C | Dark hero backgrounds           |

### Banned Colors

**Never use** these generic Tailwind colors in new code:

- `slate-*` — Use `charcoal-*` (dark) or `sand-*` (light)
- `gray-*` — Use `charcoal-*` (dark) or `sand-*` (light)
- `blue-*` — Use `primary-*` (except for verified-badge semantic blue)
- `#0a0f1e` — Use `bg-charcoal-950` (#0F0E0C)

Semantic exceptions (acceptable):

- `red-*` for destructive/error states
- `green-*` for success states when `accent-*` doesn't fit
- `amber-*` when used alongside `secondary-*` for ratings/stars

---

## Typography

| Element         | Font                  | Weight                          | Size                       | Tracking                      |
| --------------- | --------------------- | ------------------------------- | -------------------------- | ----------------------------- |
| H1 (hero)       | `font-heading` (Sora) | `font-extrabold` / `font-black` | `clamp(2rem, 5vw, 3.5rem)` | `-0.04em`                     |
| H2 (section)    | `font-heading`        | `font-bold`                     | `text-2xl md:text-3xl`     | `tracking-tight`              |
| H3 (subsection) | `font-heading`        | `font-bold`                     | `text-xl md:text-2xl`      | default                       |
| Body            | `font-sans` (DM Sans) | `font-normal`                   | `text-base`                | default                       |
| Small/meta      | `font-sans`           | `font-medium`                   | `text-sm`                  | default                       |
| Badge/label     | `font-sans`           | `font-bold`                     | `text-xs`                  | `tracking-[0.12em] uppercase` |

---

## Buttons (3 tiers only)

### Primary — Terracotta

```
bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl
shadow-cta hover:shadow-cta-hover
hover:-translate-y-0.5 active:translate-y-0
transition-all duration-200
```

### Secondary — Charcoal

```
bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold rounded-xl
shadow-md hover:shadow-lg
hover:-translate-y-0.5 active:translate-y-0
transition-all duration-200
```

### Ghost — Transparent

```
bg-transparent border border-sand-300 hover:border-primary-200
text-charcoal-700 hover:text-primary-500 font-medium rounded-xl
transition-all duration-200
```

### Pills/Chips

```
rounded-full px-4 py-2 text-sm
```

---

## Border Radius

| Element                       | Radius         |
| ----------------------------- | -------------- |
| Cards, modals                 | `rounded-2xl`  |
| Buttons, inputs               | `rounded-xl`   |
| Small elements (badges, tags) | `rounded-lg`   |
| Pills, chips, avatars         | `rounded-full` |

---

## Shadows

| Level     | Token               | Usage                    |
| --------- | ------------------- | ------------------------ |
| Base      | `shadow-soft`       | Cards at rest            |
| Hover     | `shadow-card-hover` | Cards on hover           |
| CTA       | `shadow-cta`        | Primary buttons          |
| CTA hover | `shadow-cta-hover`  | Primary buttons on hover |
| Modal     | `shadow-premium`    | Modals, overlays         |

All other shadow tokens in config exist for edge cases but should not be the default choice.

---

## Container Widths

| Context            | Width       | Usage                                  |
| ------------------ | ----------- | -------------------------------------- |
| Full page sections | `max-w-7xl` | Footer, wide grids, tables             |
| Main content       | `max-w-6xl` | Service pages, listings, most sections |
| Focused content    | `max-w-4xl` | Hero search areas, forms, FAQ          |
| Narrow content     | `max-w-3xl` | Article body, single-column forms      |

Always: `mx-auto px-4 sm:px-6 lg:px-8`

---

## Hero Sections

All page heroes should use the warm brand palette:

```tsx
<section className="relative bg-charcoal-950 text-white overflow-hidden">
  {/* Warm gradient overlay — terracotta tints, never blue */}
  <div
    className="absolute inset-0"
    style={{
      background:
        'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,107,75,0.15) 0%, transparent 60%)',
    }}
  />
  {/* Content */}
  <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-28 md:pt-14 md:pb-36">
    ...
  </div>
  {/* Bottom fade to page background */}
  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-sand-50 to-transparent" />
</section>
```

The homepage `ClayHomePage` uses a light hero (`bg-gradient-sand`). That is the exception, not the rule.

---

## Skeleton Loading

Use warm sand tones, never cold gray:

```
bg-sand-300 animate-pulse  /* shimmer base */
bg-sand-400                /* shimmer highlight */
```

---

## Dark Surfaces

Footer and dark sections use `bg-charcoal-900` with `text-sand-400`. Never `slate-*`.

The site is **light-only**. No `dark:` classes. The only dark surfaces are:

- Footer (`bg-charcoal-900`)
- Page heroes (`bg-charcoal-950`)
- Mobile menu overlay

---

## Spacing

Section vertical rhythm:

- Between major sections: `py-16` or `py-20`
- Between subsections: `py-10` or `py-12`
- Card internal: `p-5 sm:p-6`
- Grid gaps: `gap-4` (tight), `gap-6` (standard), `gap-8` (loose)

---

## Animation

Use sparingly. Prefer CSS transitions over JS animations.

- **Cards**: `transition-all duration-300 ease-out` + `hover:-translate-y-1`
- **Buttons**: `transition-all duration-200`
- **Scroll reveal**: `.scroll-reveal` class (CSS-only, no framer-motion)
- **Reduced motion**: Always respected via `prefers-reduced-motion`

The homepage CTA uses `animate-pulse-subtle` (pulsing glow). Do not add this to other buttons.
