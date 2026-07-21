# Industry Ecosystem Brain

Type any client request (e.g. "build a solar power system in Lagos") and get a complete downloadable blueprint of every company, professional and regulator involved — lawyers, banks, insurers, engineers, surveyors, importers, clearing agents, logistics, and more.

## How it works (hybrid engine)

1. **Curated knowledge base** — structured ecosystem maps stored in SQLite (seeded from `src/data/industries.ts`: solar power, construction, agro-processing, importation, oil & gas, telecom/ICT, healthcare, manufacturing — each tagged with an ISIC industry code). Requests matching these industries return the curated blueprint instantly.
2. **AI fallback** — any request that doesn't match a curated industry is sent to OpenAI to generate a blueprint in the same structured format. Requires `OPENAI_API_KEY`. AI output is validated before rendering.
3. **Guided wizard** — sector/state/scale intake in addition to free text.
4. **Downloads** — Markdown, JSON, budget CSV, and PDF (print).

## Enterprise features

- **Admin panel** at `/admin` (protected by `ADMIN_ACCESS_CODE`): add/edit/delete industries without code, view the audit log, and issue client credits.
- **Audit log** — every blueprint request is recorded (request, industry, source, IP, timestamp).
- **Monetization (pay-per-blueprint)** — set `BILLING_ENABLED=true` to serve free previews only; clients unlock full blueprints with access codes (1 credit per blueprint), issued from the admin panel.
- **Citations** — regulator entries support `legalBasis`, `officialUrl`, and `lastVerified` fields.
- **Rate limiting + input caps** on the public API.

## Setup

```bash
npm install
cp .env.example .env.local   # add OPENAI_API_KEY for the AI fallback (optional)
npm run dev
```

Open http://localhost:3000.

## Adding industries

Use the `/admin` panel (Industries tab) to add or edit `IndustryTemplate` JSON without code. `src/data/industries.ts` is only the initial seed for a fresh database.
