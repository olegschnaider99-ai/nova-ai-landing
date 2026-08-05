# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static marketing site for "Nova AI" (a fictional AI-creator agency), built as a coded submission for a course assignment (reference: nashe.agency, structural/tone inspiration only — never copy). No build step, no framework, no backend.

## Commands

```bash
npm test              # run all unit tests (node --test)
python -m http.server 5173   # serve the site locally (ES modules need http://, not file://)
```

There is no lint or build command. To run a single test file: `node --test tests/validation.test.mjs`.

Vercel is the deploy target; `vercel --prod --yes` from the repo root ships the current working tree (no CI pipeline — deploys are manual).

## Architecture

**Multi-page, not SPA.** `index.html` is the main landing page; `ai-visuals.html`, `ai-video.html`, `ai-social.html`, `ai-automation.html`, `ai-copywriting.html`, `ai-consulting.html` are individual detail pages, one per service. Every page loads the same CSS files and `js/main.js` — there's no per-page bundling, so a change to shared CSS/JS affects all seven pages at once. Check detail pages after editing anything in `css/components.css`, `css/sections.css`, or `css/base.css`.

**i18n is dictionary-based, not routed.** `js/i18n-data.js` exports a single flat `dictionary` object (`{ 'key.path': { ua: '...', en: '...' } }`) and a `translate(key, lang)` helper. `js/i18n.js` walks the DOM for `[data-i18n]` (text content), `[data-i18n-placeholder]`, and `[data-i18n-aria]` attributes and fills them in from the dictionary; language choice persists in `localStorage`. There are no `/en/` routes — both languages live at the same URL. **HTML elements always carry the Ukrainian text as static fallback content** (for no-JS/SEO), which must be kept in sync with the `ua` value in the dictionary by hand — the two do not derive from each other.

**Every visual/interactive feature is a small, independently gated ES module**, all wired up in `js/main.js`'s `DOMContentLoaded` handler: `starfield.js` (canvas star background), `intro.js` (entry animation), `nav.js` (sticky header), `services.js` (service-chip ↔ contact-form-checkbox sync), `form.js` + `validation.js` (contact form, client-side only — it does not submit anywhere), `scroll-reveal.js` (IntersectionObserver fade-in), `magnetic.js` (cursor-follow button pull), `cursor-glow.js` (cursor accent). Motion-heavy modules (`intro`, `starfield` twinkle/parallax, `scroll-reveal`, `magnetic`, `cursor-glow`) all individually check `prefers-reduced-motion`, and pointer-driven ones also check `(hover: hover) and (pointer: fine)` — don't add new motion effects without the same two guards.

**CSS is split by concern, loaded as separate `<link>` tags in a fixed order** (`variables.css` → `base.css` → `components.css` → `sections.css` → page-specific → `responsive.css`), not bundled. `variables.css` holds the single source of truth for the color palette (currently a "Monochrome Coral" scheme — one hue pushed across tones, deliberately not multi-color) and type scale as CSS custom properties. `responsive.css` holds all breakpoint overrides in one place rather than being interleaved into each component file — when a component's desktop layout changes (e.g. a grid `span`, a `flex` value), check whether `responsive.css` has a matching override for that same selector that also needs updating, since overrides there are written to match the desktop rule's specificity and will silently stop working if that specificity relationship isn't preserved.

**The service-card ↔ contact-form link is query-param based.** Service detail pages link to `index.html?interest=<id>#contact`; `services.js`'s `applyInterestFromQueryParam()` reads that on load and pre-ticks the matching checkbox in the "Що вас цікавить?" fieldset. The `data-service-chip="<id>"` values on `index.html`'s service cards must match the `value="<id>"` on the corresponding contact-form checkbox and the `?interest=<id>` used in each detail page's CTA links — these three are not derived from a shared list, they're kept in sync by convention.

**Portfolio/service images are real, not mocked.** `images/portfolio/portfolio-1.jpg` through `portfolio-6.jpg` are actual AI-generated images (optimized via ffmpeg), referenced from both the Portfolio section and reused as preview thumbnails inside the Services cards on `index.html`, plus in the "Приклади робіт" galleries on the visuals/video/social detail pages.

**No fabricated content, by design constraint from the original brief:** no invented statistics, prices, or client testimonials anywhere on the site. This shows up in the codebase as things like the `.statement`/pull-quote pattern being copy-only (never a number) and the deliberate absence of a reviews section.

## Design docs

`docs/superpowers/specs/2026-08-03-nova-ai-landing-design.md` and `docs/superpowers/plans/2026-08-03-nova-ai-landing-implementation.md` contain the original brand/stack/structure decisions and full implementation plan, if deeper rationale is needed than what's in this file.
