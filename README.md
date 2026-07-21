# Industry Ecosystem Brain

Type any client request (e.g. "build a solar power system in Lagos") and get a complete downloadable blueprint of every company, professional and regulator involved — lawyers, banks, insurers, engineers, surveyors, importers, clearing agents, logistics, and more.

## How it works (hybrid engine)

1. **Curated knowledge base** — structured ecosystem maps in `src/data/industries.ts` (solar power, construction, agro-processing, importation, oil & gas, telecom/ICT, healthcare, manufacturing). Requests matching these industries return the curated blueprint instantly.
2. **AI fallback** — any request that doesn't match a curated industry is sent to OpenAI to generate a blueprint in the same structured format. Requires `OPENAI_API_KEY`.
3. **Download** — every blueprint can be downloaded as Markdown or printed/saved as PDF.

## Setup

```bash
npm install
cp .env.example .env.local   # add OPENAI_API_KEY for the AI fallback (optional)
npm run dev
```

Open http://localhost:3000.

## Adding industries

Add a new `IndustryTemplate` entry to `src/data/industries.ts` with keywords, phases, stakeholders, regulators, risks, and payment points.
