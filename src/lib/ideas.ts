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
    "confidence": string              // "high" | "medium" | "low" plus one-line reason
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
  country?: string
): Promise<IdeaReport | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const userContent = country
    ? `${brief}\n\nTarget jurisdiction: ${country}. Ground the ideas in the market realities, regulators and gaps of ${country}, and name that jurisdiction's actual regulators in regulatoryPath.`
    : brief;
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
      }));
    if (ideas.length === 0) return null;
    return { brief, country, ideas, generatedAt: new Date().toISOString() };
  } catch {
    return null;
  }
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
