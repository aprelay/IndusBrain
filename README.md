# Industry Ecosystem Brain

Type any client request (e.g. "build a solar power system in Lagos") and get a complete downloadable blueprint of every company, professional and regulator involved — lawyers, banks, insurers, engineers, surveyors, importers, clearing agents, logistics, and more.

## How it works (hybrid engine)

1. **Curated knowledge base** — structured ecosystem maps stored in SQLite (35 Nigerian industry templates seeded from `src/data/industries.ts` + `src/data/industries-extra.ts`, each tagged with an ISIC industry code). Requests matching these industries return the curated blueprint instantly, with regulator citations enriched from `src/data/regulator-citations.ts`.
2. **AI fallback** — any request that doesn't match a curated industry (or targets a country other than Nigeria) is sent to OpenAI with a jurisdiction instruction to generate a blueprint in the same structured format. Requires `OPENAI_API_KEY`. AI output is validated before rendering.
3. **Guided wizard** — country/sector/state/scale intake in addition to free text.
4. **Downloads** — Markdown, JSON, budget CSV, Word (.doc), Excel (.xls), and PDF (print).
5. **Blueprint workspace** — blueprints generated while signed in are saved to the account and re-downloadable at `/workspace` without spending another credit.

## Enterprise features

- **Admin panel** at `/admin` (protected by `ADMIN_ACCESS_CODE`): add/edit/delete industries without code, view the audit log, and issue client credits.
- **Audit log** — every blueprint request is recorded (request, industry, source, IP, timestamp).
- **Monetization (pay-per-blueprint, manual invoicing)** — set `BILLING_ENABLED=true` to serve free previews only. Clients submit a quote request, you invoice them manually (bank transfer), then add credits to their account (or issue an access code) from the admin panel. 1 credit = 1 full blueprint.
- **User accounts** — email/password registration at `/login` (scrypt-hashed passwords, httpOnly session cookies); credits are tied to accounts.
- **NDPR/GDPR** — privacy policy at `/privacy`; security headers (HSTS, X-Frame-Options, nosniff) on all responses.
- **Citations** — regulator entries support `legalBasis`, `officialUrl`, and `lastVerified` fields.
- **Rate limiting + input caps** on the public API.
- **Vetted company directory** — admins add companies (name, category, services, location, contact, vetted flag) in the Companies tab; matching companies are shown to clients under unlocked blueprints.
- **Verification alerts** — the admin Alerts tab flags regulator entries with no `lastVerified` date or verified more than 6 months ago.
- **Partner API** — `POST /api/v1/blueprint` with an `x-api-key` header (keys issued in the admin “API keys” tab; 1 credit per call). Body: `{"request": "...", "country": "Ghana"}`.
- **Email notifications** — with SMTP configured (see `.env.example`), you get an email at `NOTIFY_EMAIL` for each quote request, and clients get an email when credits are added. No-ops silently when SMTP is not configured.

## Setup

```bash
npm install
cp .env.example .env.local   # add OPENAI_API_KEY for the AI fallback (optional)
npm run dev
```

Open http://localhost:3000.

## Adding industries

Use the `/admin` panel (Industries tab) to add or edit `IndustryTemplate` JSON without code. `src/data/industries.ts` is only the initial seed for a fresh database.
