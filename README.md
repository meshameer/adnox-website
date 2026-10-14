# Adnex marketing website

Standalone React + TypeScript + Vite marketing website. No dependency on, or changes to, Adnex V1/V2.

## Run

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

The form intentionally downloads an **unsent text draft**. There is no backend, tracking, email service, or invented contact address. Connect an approved submission endpoint and privacy policy before using it for lead collection.

The upload/schedule/publish demonstration runs only in browser memory. Images are limited to JPEG, PNG and WebP under 8 MB. The offline control simulates cached playback; it does not prove hardware behavior.

All product visuals and data are illustrative. Features, support and hardware are clearly described as proposed pilot scope. No customer logos, endorsements, performance statistics or shipped-capability claims are used.

## Assets and launch notes

Restaurant photograph: https://unsplash.com/photos/1517248135467-4c7edcad34c4 (image source: https://images.unsplash.com/photo-1517248135467-4c7edcad34c4). Local copy in public/restaurant.jpg. Restaurant menu overlays, dashboard and player enclosure are original HTML/CSS illustrations. DM Sans is requested from Google Fonts with system-font fallbacks. External font requests can be removed or self-hosted for a fully self-contained deployment.

Before public commercial launch: approve final product scope and brand/trademark usage; confirm pilot availability, contact endpoint, privacy policy, hardware specification and photographic license requirements. Canonical and social URL metadata use https://shameer.farooks.com/adnox-website/. Update these and the Vite base path for a custom domain.

Accessibility: semantic landmarks, keyboard-operable controls, form labels/native validation, focus indicators, skip link, live status messages, responsive navigation, reduced-motion support. The site does not claim formal WCAG certification.

## GitHub Pages

Repository: https://github.com/meshameer/adnox-website

Website: https://shameer.farooks.com/adnox-website/

Push to main to run tests, build and deploy through GitHub Actions. Pages uses the GitHub Actions publishing source. The repository name follows the requested adnox-website spelling; the product brand remains Adnex.

## Cloudflare production

Primary domain: https://adnex.net
Build command: `npm test && npm run build`
Output directory: `dist`
Production branch: `main`
The default Vite base is `/` for Cloudflare and the custom domain. The legacy GitHub Pages workflow explicitly overrides the base for its subdirectory.

## Google Analytics

GA4 property: `G-6W7KE9Q1MC`. The Google tag is loaded only after explicit acceptance via the analytics banner; the footer allows changing that choice. Consent is saved in browser local storage. Declining/withdrawing disables collection and removes accessible GA cookies; withdrawing after loading reloads the page to remove the running tag. Advertising consent remains denied. No analytics events are replayed from before acceptance.

Events: `pilot_cta_clicked`, `demo_started`, `demo_publish_completed`, `inquiry_draft_downloaded`. The last event is an unsent download, not a submitted lead. Events do not include form values, files or filenames. Page URLs omit query strings and fragments; referrer is omitted. This intentionally limits campaign attribution. The Google Analytics property owner should review Enhanced Measurement settings (especially automatic form interactions), retention and internal traffic filtering in GA Admin. Do not install a second Google tag via Cloudflare or another tag manager.

Validation: accept analytics on the live site, interact with the demo, then check GA4 Realtime/DebugView as appropriate. Ad blockers may prevent measurement. Unit tests verify consent gating, single initialization, event payloads and withdrawal. These tests do not prove reporting in the Google Analytics account.
