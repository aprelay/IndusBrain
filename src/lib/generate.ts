import { Blueprint } from "@/lib/types";
import { findIndustry } from "@/data/industries";

const AI_SYSTEM_PROMPT = `You are an expert on industry ecosystems worldwide, with deep knowledge of Nigeria and West Africa. Given a client request, produce a complete ecosystem blueprint listing EVERY company, professional, and government body that must be engaged (and paid) to deliver the request — lawyers, banks, insurers, engineers, surveyors, importers, clearing agents, logistics, regulators, etc.

Respond ONLY with JSON matching this TypeScript type (no markdown fences):
{
  "title": string,
  "industry": string,
  "summary": string,
  "phases": [{ "name": string, "description": string, "typicalDuration": string, "deliverables": string[], "stakeholders": [{ "role": string, "category": "Legal"|"Finance"|"Insurance"|"Engineering"|"Regulatory"|"Procurement"|"Logistics"|"Construction"|"Operations"|"Advisory"|"Government", "responsibility": string, "whenEngaged": string, "typicalCost": string }] }],
  "regulators": [{ "name": string, "jurisdiction": string, "purpose": string }],
  "risks": string[],
  "paymentPoints": string[]
}`;

async function generateWithAI(request: string): Promise<Blueprint | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: AI_SYSTEM_PROMPT },
          { role: "user", content: request },
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content);
    return {
      ...parsed,
      request,
      source: "ai",
      generatedAt: new Date().toISOString(),
    } as Blueprint;
  } catch {
    return null;
  }
}

export async function generateBlueprint(request: string): Promise<Blueprint> {
  const curated = findIndustry(request);

  if (curated) {
    return {
      title: curated.name,
      request,
      industry: curated.name,
      summary: curated.summary,
      phases: curated.phases,
      regulators: curated.regulators,
      risks: curated.risks,
      paymentPoints: curated.paymentPoints,
      source: "curated",
      generatedAt: new Date().toISOString(),
    };
  }

  const ai = await generateWithAI(request);
  if (ai) return ai;

  return {
    title: "General Project Ecosystem",
    request,
    industry: "General",
    summary:
      "No curated template matched this request and the AI engine is not configured (set OPENAI_API_KEY). Below is a generic ecosystem framework that applies to most projects.",
    phases: [
      {
        name: "1. Legal & Contracts",
        description: "Contract review and legal structuring before any commitment.",
        typicalDuration: "2-6 weeks",
        stakeholders: [
          {
            role: "Lawyer",
            category: "Legal",
            responsibility: "Contract review, due diligence, corporate structuring.",
            whenEngaged: "Before signing anything",
          },
        ],
        deliverables: ["Executed contracts"],
      },
      {
        name: "2. Finance & Insurance",
        description: "Funding and risk cover.",
        typicalDuration: "4-10 weeks",
        stakeholders: [
          {
            role: "Bank / Financiers",
            category: "Finance",
            responsibility: "Project funding, payment instruments.",
            whenEngaged: "After contracts agreed",
          },
          {
            role: "Insurer",
            category: "Insurance",
            responsibility: "Risk assessment and insurance cover.",
            whenEngaged: "Before execution",
          },
        ],
        deliverables: ["Funding secured", "Insurance policies"],
      },
      {
        name: "3. Technical Design & Survey",
        description: "Engineering design and site verification.",
        typicalDuration: "3-8 weeks",
        stakeholders: [
          {
            role: "Engineers",
            category: "Engineering",
            responsibility: "Technical design and review.",
            whenEngaged: "After feasibility",
          },
          {
            role: "Surveyor",
            category: "Engineering",
            responsibility: "Site inspection and survey.",
            whenEngaged: "Before construction",
          },
        ],
        deliverables: ["Design package", "Survey report"],
      },
      {
        name: "4. Procurement, Import & Logistics",
        description: "Sourcing equipment/materials, importation and delivery.",
        typicalDuration: "6-16 weeks",
        stakeholders: [
          {
            role: "Importer / Procurement Agent",
            category: "Procurement",
            responsibility: "Source equipment not made locally.",
            whenEngaged: "After design",
          },
          {
            role: "Clearing Agent",
            category: "Logistics",
            responsibility: "Customs clearance.",
            whenEngaged: "On cargo arrival",
          },
          {
            role: "Logistics / Haulage",
            category: "Logistics",
            responsibility: "Delivery to site.",
            whenEngaged: "After clearance",
          },
        ],
        deliverables: ["Equipment delivered"],
      },
      {
        name: "5. Execution & Operations",
        description: "Installation/construction and ongoing operations.",
        typicalDuration: "Varies",
        stakeholders: [
          {
            role: "Contractor / Installer",
            category: "Construction",
            responsibility: "Execution of the works.",
            whenEngaged: "After delivery",
          },
          {
            role: "O&M Provider",
            category: "Operations",
            responsibility: "Ongoing operations and maintenance.",
            whenEngaged: "Post-completion",
          },
        ],
        deliverables: ["Completed project", "O&M contract"],
      },
    ],
    regulators: [
      {
        name: "Sector regulator (varies)",
        jurisdiction: "Nigeria",
        purpose: "Sector-specific permits and licences",
      },
      {
        name: "Nigeria Customs Service",
        jurisdiction: "Nigeria",
        purpose: "Import clearance where equipment is imported",
      },
    ],
    risks: ["FX exposure on imports", "Regulatory approval delays", "Contract disputes"],
    paymentPoints: [
      "Legal fees at contract review",
      "Financing fees at close",
      "Insurance premiums before execution",
      "Equipment and duties at import",
      "Contractor payments during execution",
    ],
    source: "curated",
    generatedAt: new Date().toISOString(),
  };
}

export function blueprintToMarkdown(bp: Blueprint): string {
  const lines: string[] = [];
  lines.push(`# ${bp.title} — Ecosystem Blueprint`);
  lines.push("");
  lines.push(`**Client request:** ${bp.request}`);
  lines.push(`**Industry:** ${bp.industry}`);
  lines.push(`**Generated:** ${new Date(bp.generatedAt).toLocaleString()}`);
  lines.push(`**Source:** ${bp.source === "ai" ? "AI-generated" : "Curated knowledge base"}`);
  lines.push("");
  lines.push(`## Summary`);
  lines.push(bp.summary);
  lines.push("");
  lines.push(`## Phases & Stakeholders`);
  for (const phase of bp.phases) {
    lines.push("");
    lines.push(`### ${phase.name}`);
    lines.push(phase.description);
    lines.push(`*Typical duration: ${phase.typicalDuration}*`);
    lines.push("");
    lines.push(`| Who | Category | Responsibility | When engaged | Typical cost |`);
    lines.push(`| --- | --- | --- | --- | --- |`);
    for (const s of phase.stakeholders) {
      lines.push(
        `| ${s.role} | ${s.category} | ${s.responsibility} | ${s.whenEngaged} | ${s.typicalCost || "—"} |`
      );
    }
    lines.push("");
    lines.push(`**Deliverables:** ${phase.deliverables.join("; ")}`);
  }
  lines.push("");
  lines.push(`## Regulators & Government Bodies`);
  for (const r of bp.regulators) {
    lines.push(`- **${r.name}** (${r.jurisdiction}): ${r.purpose}`);
  }
  lines.push("");
  lines.push(`## Key Risks`);
  for (const r of bp.risks) lines.push(`- ${r}`);
  lines.push("");
  lines.push(`## Payment Points (who gets paid, when)`);
  bp.paymentPoints.forEach((p, i) => lines.push(`${i + 1}. ${p}`));
  lines.push("");
  return lines.join("\n");
}
