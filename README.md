# Adnex marketing website

Standalone React + TypeScript + Vite marketing website. No dependency on, or changes to, Adnex V1/V2.

Four sections, matching primary nav: Experience (`#experience`), Reliability (`#reliability`, with an animated offline-first infographic honoring `prefers-reduced-motion`), Approach (`#approach`), Contact (`#contact`). Nav/footer also link `#top` as "Home".

## Run

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

## Contact form

The form POSTs JSON to `/api/inquiry`, routed by the Cloudflare Worker entry point (`src/worker.ts`) to the handler in `src/server/inquiry.ts` (also unit-tested). It validates the fields, rejects cross-site requests, drops honeypot spam, and emails the enquiry through [Resend](https://resend.com) with reply-to set to the visitor. The page shows "sent" only after the handler returns success; failures are shown to the visitor.

Set these in the Cloudflare dashboard → Workers & Pages → this project → Settings → Variables and Secrets (Production and Preview):

| Name | Value |
| --- | --- |
| `RESEND_API_KEY` | Resend API key (encrypt as a secret) |
| `INQUIRY_TO` | Inbox that receives enquiries |
| `INQUIRY_FROM` | Sender, e.g. `adnex website <onboarding@resend.dev>`; switch to an `@adnex.net` address after verifying the domain in Resend |

Until these are set the form returns an error rather than losing messages. Resend's `onboarding@resend.dev` sender can only deliver to the email address that owns the Resend account. Consider a Cloudflare rate-limiting rule on `/api/inquiry` and Turnstile if spam appears.

All product visuals and data are illustrative. Features, support and hardware are clearly described as proposed pilot scope. No customer logos, endorsements, performance statistics or shipped-capability claims are used.

## Assets and launch notes

Hero band photograph (`public/hero-screens.jpg`) is an illustrative restaurant interior with adnex signage screens, extracted from an approved design reference. DM Sans and DM Mono are self-hosted from `public/fonts` (Latin subsets, SIL OFL 1.1); the site makes no third-party font requests.

Before public commercial launch: approve final product scope and brand/trademark usage; confirm pilot availability, contact endpoint, privacy policy, hardware specification and photographic license requirements. Canonical and social URL metadata use https://shameer.farooks.com/adnox-website/. Update these and the Vite base path for a custom domain.

Accessibility: semantic landmarks, keyboard-operable controls, form labels/native validation, focus indicators, skip link, live status messages, responsive navigation, reduced-motion support. The site does not claim formal WCAG certification.

## GitHub Pages

Repository: https://github.com/meshameer/adnox-website

Website: https://shameer.farooks.com/adnox-website/

Push to main to run tests, build and deploy through GitHub Actions. Pages uses the GitHub Actions publishing source. The repository name follows the requested adnox-website spelling; the product brand remains Adnex.

## Cloudflare production

Deployed as a Cloudflare **Worker with static assets** (not Cloudflare Pages) — see `wrangler.jsonc` and `src/worker.ts`. Static files are served from `dist` via the `ASSETS` binding; `src/worker.ts` is the only code path that runs before that, and it only intercepts `POST /api/inquiry`.

Primary domain: https://adnex.net
Build command: `npm run build`
Deploy command: `npx wrangler deploy`
Production branch: `main`
Worker name: `adnox-website` (also reachable at https://adnox-website.<account>.workers.dev)
The default Vite base is `/` for Cloudflare and the custom domain. The legacy GitHub Pages workflow explicitly overrides the base for its subdirectory.

## Google Analytics

GA4 property: `G-6W7KE9Q1MC`. The Google tag is loaded only after explicit acceptance via the analytics banner; the footer allows changing that choice. Consent is saved in browser local storage. Declining/withdrawing disables collection and removes accessible GA cookies; withdrawing after loading reloads the page to remove the running tag. Advertising consent remains denied. No analytics events are replayed from before acceptance.

Events: `pilot_cta_clicked`, `inquiry_submitted` (sent only after the server accepts the enquiry). Events do not include form values. Page URLs omit query strings and fragments; referrer is omitted. This intentionally limits campaign attribution. The Google Analytics property owner should review Enhanced Measurement settings (especially automatic form interactions), retention and internal traffic filtering in GA Admin. Do not install a second Google tag via Cloudflare or another tag manager.

Validation: accept analytics on the live site, click a pilot CTA or send a test enquiry, then check GA4 Realtime/DebugView as appropriate. Ad blockers may prevent measurement. Unit tests verify consent gating, single initialization, event payloads and withdrawal. These tests do not prove reporting in the Google Analytics account.
