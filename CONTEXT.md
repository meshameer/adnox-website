# Context

## Current branch

`feature/redesign-hero-reliability` (off `main`, not pushed/merged). One commit: hero + reliability redesign, nav trimmed to four sections.

## What changed and why

The requested reference file `adnex-hero-v7.html` did not exist anywhere on disk. After checking with the user, `adnex-hero-standalone_v18.html` (in `~/Downloads`) was used as the design reference instead. That file's own Reliability section turned out to be a static screenshot (not the interactive "Connected/Unreachable" infographic its CSS/JS implied), and it had no `.hero-band` class. Per the user's direction, the Reliability infographic was built from the original spec's written description rather than copied from v18's markup; v18 was used for hero layout, nav, tokens and copy.

- **Hero**: full-width `.hero-band` image (`public/hero-screens.jpg`, extracted/decoded from v18's embedded base64 JPEG) replaces the old HTML/CSS illustrated menu-wall scene. No overlay captions.
- **Reliability**: new `ReliabilityInfographic` component (`src/App.tsx`) cycles a Connected/Unreachable badge and solid/dashed wire every 3s via `setInterval` in a `useEffect`, gated by `window.matchMedia('(prefers-reduced-motion: reduce)')` — no cycling when reduced motion is requested. Checks "No surprises mid-service" / "No screens left guessing" live inside the infographic card.
- **Nav**: "Home" added as the first link (`#top`).
- **Scope cut**: the old "The player" / `#hardware` section (device illustration, hardware ticks) was removed — the spec explicitly scoped the page to four sections (Experience, Reliability, Approach, Contact), matching v18's nav exactly. `#how-it-works` renamed to `#approach`, `#pilot` renamed to `#contact`; all CTA hrefs and footer links updated accordingly.
- `public/restaurant.jpg` deleted (no longer referenced); `public/hero-screens.jpg` added.

## Preserved as instructed

Real contact form → `/api/inquiry` (Resend), honeypot, validation, consent-gated GA4 analytics, self-hosted fonts, TileWall background, `.panel-sec` lifted-card treatment for Approach.

## Verified

`npm test` (18/18 pass), `npm run build` (clean), manual check via Playwright MCP at 1440px and 390px, mobile menu open/close, and `prefers-reduced-motion: reduce` confirmed to freeze the infographic (checked it stayed on "Connected" past one full 3s cycle). No console errors.

## Not done / follow-ups

- Branch not pushed, not merged into `main` — by design (user said not to).
- No code review pass requested yet.
- `pilot_cta_clicked` analytics event name kept as-is even though the CTA now targets `#contact` — renaming it would be an analytics/behavior change outside this task's scope.
