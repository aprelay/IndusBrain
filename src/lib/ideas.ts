export interface IdeaConcept {
  name: string;
  concept: string;
  targetMarket: string;
  revenueModel: string;
  whyNow: string;
  marketSignals: string;
  competitiveLandscape: string;
  capitalRequired: string;
  unitEconomics: string;
  regulatoryPath: string[];
  goToMarket: string[];
  ecosystemNeeded: string[];
  risks: string[];
  assumptions: string[];
  firstSteps: string[];
  confidence: string;
  opportunityScore: number;
}

export interface IdeaReport {
  brief: string;
  country?: string;
  ideas: IdeaConcept[];
  generatedAt: string;
}

const IDEA_SYSTEM_PROMPT = `You are the Idea Engine of an industry-ecosystem intelligence platform used by enterprises, investors and governments. You know the value chains, regulators, gaps and payment flows of every industry on earth, with deep knowledge of Nigeria and West Africa. Given a brief (a sector, a problem, a location, or free-form ambition), invent ORIGINAL, commercially viable venture concepts by combining industries, market gaps and jurisdictions in novel ways. Ideas must be concrete and buildable, not generic. Be honest: state assumptions explicitly and rate your confidence.

Respond ONLY with JSON matching this TypeScript type (no markdown fences):
{
  "ideas": [{
    "name": string,
    "concept": string,
    "targetMarket": string,
    "revenueModel": string,
    "whyNow": string,
    "marketSignals": string,          // observable demand/market-size signals, with numbers where known
    "competitiveLandscape": string,   // who plays nearby today and the whitespace this idea occupies
    "capitalRequired": string,        // rough startup capital band and what it buys
    "unitEconomics": string,          // sketch of revenue vs cost per unit/customer
    "regulatoryPath": string[],       // ordered list of licenses/approvals/regulators for the target jurisdiction
    "goToMarket": string[],           // phased go-to-market steps
    "ecosystemNeeded": string[],
    "risks": string[],
    "assumptions": string[],          // key assumptions that must hold true
    "firstSteps": string[],
    "confidence": string,             // "high" | "medium" | "low" plus one-line reason
    "opportunityScore": number        // 1-100 overall opportunity score weighing market size, timing, competition and feasibility
  }]
}
Return exactly 3 ideas.`;

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export async function generateIdeas(
  brief: string,
  country?: string,
  memoryContext?: string
): Promise<IdeaReport | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const base = country
    ? `${brief}\n\nTarget jurisdiction: ${country}. Ground the ideas in the market realities, regulators and gaps of ${country}, and name that jurisdiction's actual regulators in regulatoryPath.`
    : brief;
  const userContent = memoryContext ? `${base}${memoryContext}` : base;
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
          { role: "system", content: IDEA_SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
        temperature: 0.9,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed?.ideas) || parsed.ideas.length === 0) return null;
    const ideas: IdeaConcept[] = parsed.ideas
      .filter(
        (i: Partial<IdeaConcept>) =>
          typeof i?.name === "string" && typeof i?.concept === "string"
      )
      .map((i: Partial<IdeaConcept>) => ({
        name: i.name as string,
        concept: i.concept as string,
        targetMarket: asString(i.targetMarket),
        revenueModel: asString(i.revenueModel),
        whyNow: asString(i.whyNow),
        marketSignals: asString(i.marketSignals),
        competitiveLandscape: asString(i.competitiveLandscape),
        capitalRequired: asString(i.capitalRequired),
        unitEconomics: asString(i.unitEconomics),
        regulatoryPath: asStringArray(i.regulatoryPath),
        goToMarket: asStringArray(i.goToMarket),
        ecosystemNeeded: asStringArray(i.ecosystemNeeded),
        risks: asStringArray(i.risks),
        assumptions: asStringArray(i.assumptions),
        firstSteps: asStringArray(i.firstSteps),
        confidence: asString(i.confidence),
        opportunityScore:
          typeof i.opportunityScore === "number" && i.opportunityScore >= 1 && i.opportunityScore <= 100
            ? Math.round(i.opportunityScore)
            : 0,
      }));
    if (ideas.length === 0) return null;
    return { brief, country, ideas, generatedAt: new Date().toISOString() };
  } catch {
    return null;
  }
}

export interface DeepDiveStep {
  step: string;
  detail: string;
  whoYouPay: string;
  typicalCost: string;
  duration: string;
  permits: string[];
}

export interface DeepDivePhase {
  name: string;
  objective: string;
  steps: DeepDiveStep[];
}

export interface IdeaDeepDive {
  ideaName: string;
  country?: string;
  overview: string;
  phases: DeepDivePhase[];
  permitChecklist: string[];
  outreachIndustries: string[];
  capitalPlan: string;
  timeline: string;
  successMetrics: string[];
  generatedAt: string;
}

const DEEP_DIVE_SYSTEM_PROMPT = `You are the execution engine of an industry-ecosystem intelligence platform. Given ONE venture idea, produce a deep, step-by-step execution playbook an operator could follow: every phase from day zero to operations, and within each phase the concrete steps — what to do, exactly who you hire or pay (lawyer, bank, insurer, engineer, surveyor, importer, clearing agent, logistics, regulator...), typical cost bands, realistic durations, and the specific permits/approvals with the actual regulator names for the target jurisdiction. Be concrete and jurisdiction-specific, never generic.

Respond ONLY with JSON matching this TypeScript type (no markdown fences):
{
  "overview": string,               // 2-3 sentence execution summary
  "phases": [{
    "name": string,                 // e.g. "1. Land & Legal"
    "objective": string,
    "steps": [{
      "step": string,               // short imperative title
      "detail": string,             // how to actually do it
      "whoYouPay": string,          // the company/professional you engage and pay
      "typicalCost": string,        // cost band in local currency or USD
      "duration": string,           // realistic time
      "permits": string[]           // permits/approvals in this step with regulator names ([] if none)
    }]
  }],
  "permitChecklist": string[],      // full ordered list: permit — regulator — when needed
  "outreachIndustries": string[],   // 2-5 industry categories of companies to contact, chosen ONLY from: construction, real estate, energy & solar, oil & gas, agriculture, food & beverage, healthcare & pharma, finance & fintech, insurance, legal, logistics & transport, manufacturing, mining, technology & ict, telecom, education, hospitality & tourism, retail & ecommerce, media & marketing, automotive, aviation, maritime, engineering, security, environmental, non-profit, professional services
  "capitalPlan": string,            // how capital is deployed across phases
  "timeline": string,               // overall realistic timeline
  "successMetrics": string[]        // measurable milestones
}
Aim for 5-8 phases with 3-6 steps each.`;

export async function generateIdeaDeepDive(
  ideaName: string,
  concept: string,
  country?: string,
  brief?: string
): Promise<IdeaDeepDive | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const parts = [`Idea: ${ideaName}`, `Concept: ${concept}`];
  if (brief) parts.push(`Original brief: ${brief}`);
  parts.push(
    country
      ? `Target jurisdiction: ${country}. Use ${country}'s actual regulators, permits, and market costs.`
      : `Target jurisdiction: Nigeria. Use Nigeria's actual regulators, permits, and market costs.`
  );
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
          { role: "system", content: DEEP_DIVE_SYSTEM_PROMPT },
          { role: "user", content: parts.join("\n") },
        ],
        response_format: { type: "json_object" },
        temperature: 0.5,
        max_tokens: 4000,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed?.phases) || parsed.phases.length === 0) return null;
    const phases: DeepDivePhase[] = parsed.phases
      .filter((p: Partial<DeepDivePhase>) => typeof p?.name === "string")
      .map((p: Partial<DeepDivePhase>) => ({
        name: p.name as string,
        objective: asString(p.objective),
        steps: (Array.isArray(p.steps) ? p.steps : [])
          .filter((s: Partial<DeepDiveStep>) => typeof s?.step === "string")
          .map((s: Partial<DeepDiveStep>) => ({
            step: s.step as string,
            detail: asString(s.detail),
            whoYouPay: asString(s.whoYouPay),
            typicalCost: asString(s.typicalCost),
            duration: asString(s.duration),
            permits: asStringArray(s.permits),
          })),
      }));
    if (phases.length === 0) return null;
    return {
      ideaName,
      country,
      overview: asString(parsed.overview),
      phases,
      permitChecklist: asStringArray(parsed.permitChecklist),
      outreachIndustries: asStringArray(parsed.outreachIndustries),
      capitalPlan: asString(parsed.capitalPlan),
      timeline: asString(parsed.timeline),
      successMetrics: asStringArray(parsed.successMetrics),
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function deepDiveToMarkdown(d: IdeaDeepDive): string {
  const lines: string[] = [`# Execution Deep Dive: ${d.ideaName}`, ""];
  if (d.country) lines.push(`**Jurisdiction:** ${d.country}`);
  lines.push(`**Generated:** ${new Date(d.generatedAt).toLocaleString()}`, "");
  lines.push(
    `> AI-generated execution playbook. Verify costs, permits and regulators locally before committing capital.`,
    ""
  );
  if (d.overview) lines.push(d.overview, "");
  if (d.timeline) lines.push(`**Overall timeline:** ${d.timeline}`, "");
  d.phases.forEach((p) => {
    lines.push(`## ${p.name}`, "");
    if (p.objective) lines.push(`*${p.objective}*`, "");
    p.steps.forEach((s, k) => {
      lines.push(`### ${k + 1}. ${s.step}`);
      if (s.detail) lines.push(s.detail);
      if (s.whoYouPay) lines.push(`- **Who you pay:** ${s.whoYouPay}`);
      if (s.typicalCost) lines.push(`- **Typical cost:** ${s.typicalCost}`);
      if (s.duration) lines.push(`- **Duration:** ${s.duration}`);
      if (s.permits.length) lines.push(`- **Permits:** ${s.permits.join("; ")}`);
      lines.push("");
    });
  });
  if (d.permitChecklist.length) {
    lines.push(`## Permit & approval checklist`);
    d.permitChecklist.forEach((e, k) => lines.push(`${k + 1}. ${e}`));
    lines.push("");
  }
  if (d.capitalPlan) lines.push(`## Capital plan`, d.capitalPlan, "");
  if (d.successMetrics.length) {
    lines.push(`## Success metrics`);
    d.successMetrics.forEach((e) => lines.push(`- ${e}`));
    lines.push("");
  }
  return lines.join("\n");
}

export function ideaReportToMarkdown(r: IdeaReport): string {
  const lines: string[] = [`# Idea Engine Report`, ""];
  lines.push(`**Brief:** ${r.brief}`);
  if (r.country) lines.push(`**Jurisdiction:** ${r.country}`);
  lines.push(`**Generated:** ${new Date(r.generatedAt).toLocaleString()}`);
  lines.push(
    "",
    `> AI-generated venture concepts. Assumptions and confidence are stated per idea; validate before investment.`,
    ""
  );
  r.ideas.forEach((i, n) => {
    lines.push(`## ${n + 1}. ${i.name}`, "", i.concept, "");
    lines.push(`**Target market:** ${i.targetMarket}`);
    lines.push(`**Revenue model:** ${i.revenueModel}`);
    lines.push(`**Why now:** ${i.whyNow}`);
    if (i.marketSignals) lines.push(`**Market signals:** ${i.marketSignals}`);
    if (i.competitiveLandscape) lines.push(`**Competitive landscape:** ${i.competitiveLandscape}`);
    if (i.capitalRequired) lines.push(`**Capital required:** ${i.capitalRequired}`);
    if (i.unitEconomics) lines.push(`**Unit economics:** ${i.unitEconomics}`);
    if (i.confidence) lines.push(`**Confidence:** ${i.confidence}`);
    if (i.opportunityScore > 0) lines.push(`**Opportunity score:** ${i.opportunityScore}/100`);
    lines.push("");
    if (i.regulatoryPath.length) {
      lines.push(`### Regulatory path`);
      i.regulatoryPath.forEach((e, k) => lines.push(`${k + 1}. ${e}`));
      lines.push("");
    }
    if (i.goToMarket.length) {
      lines.push(`### Go-to-market`);
      i.goToMarket.forEach((e, k) => lines.push(`${k + 1}. ${e}`));
      lines.push("");
    }
    lines.push(`### Ecosystem needed`);
    i.ecosystemNeeded.forEach((e) => lines.push(`- ${e}`));
    lines.push("", `### Key risks`);
    i.risks.forEach((e) => lines.push(`- ${e}`));
    if (i.assumptions.length) {
      lines.push("", `### Key assumptions`);
      i.assumptions.forEach((e) => lines.push(`- ${e}`));
    }
    lines.push("", `### First steps`);
    i.firstSteps.forEach((e, k) => lines.push(`${k + 1}. ${e}`));
    lines.push("");
  });
  return lines.join("\n");
}
