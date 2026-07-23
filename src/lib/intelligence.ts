import { industries } from "@/data/industries";
import { extraIndustries } from "@/data/industries-extra";
import { IndustryTemplate } from "@/lib/types";
import { outreachIndustryStats } from "@/lib/db";
import { findRelatedMemory, tokenize } from "@/lib/brain";
import { IdeaConcept } from "@/lib/ideas";

export interface Grounding {
  context: string;
  citations: string[];
}

function allTemplates(): IndustryTemplate[] {
  return [...industries, ...extraIndustries];
}

export function findRelevantTemplates(brief: string, limit = 2): IndustryTemplate[] {
  const tokens = tokenize(brief);
  if (tokens.length === 0) return [];
  return allTemplates()
    .map((t) => {
      const hay = `${t.name} ${t.keywords.join(" ")} ${t.summary}`.toLowerCase();
      const score = tokens.reduce((s, tok) => s + (hay.includes(tok) ? tok.length : 0), 0);
      return { t, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.t);
}

/**
 * Builds a grounding context from the platform's own proprietary data:
 * curated industry blueprints (regulators, risks, payment points) and the
 * Outreach company database (real company density per industry).
 */
export function buildGroundingContext(brief: string): Grounding {
  const citations: string[] = [];
  const parts: string[] = [];

  const templates = findRelevantTemplates(brief);
  for (const t of templates) {
    const regs = t.regulators
      .map((r) => `${r.name}${r.legalBasis ? ` (${r.legalBasis})` : ""}`)
      .join("; ");
    parts.push(
      `Curated blueprint "${t.name}"${t.country ? ` [${t.country}]` : ""}: regulators — ${regs}. Key risks: ${t.risks
        .slice(0, 4)
        .join("; ")}. Payment points: ${t.paymentPoints.slice(0, 4).join("; ")}.`
    );
    citations.push(
      `Curated industry blueprint: ${t.name} (${t.regulators.length} verified regulators)`
    );
  }

  try {
    const stats = outreachIndustryStats();
    const tokens = tokenize(brief);
    const relevant = stats.filter((s) =>
      tokens.some((tok) => s.industry.toLowerCase().includes(tok))
    );
    const shown = (relevant.length > 0 ? relevant : stats.slice(0, 5)).slice(0, 5);
    if (shown.length > 0) {
      parts.push(
        `Outreach company database (real classified companies on this platform): ${shown
          .map((s) => `${s.industry}: ${s.count} companies`)
          .join(", ")}. Higher density = active supply/competition; low density = possible whitespace.`
      );
      citations.push(
        `Outreach database: ${shown.map((s) => `${s.count.toLocaleString()} ${s.industry} companies`).join(", ")}`
      );
    }
  } catch {
    // Outreach stats are optional grounding
  }

  const related = findRelatedMemory(brief, 4);
  if (related.length > 0) {
    citations.push(`Brain memory: ${related.length} related past requests/ideas informed this report`);
  }

  if (parts.length === 0) return { context: "", citations };
  return {
    context: `\n\nPLATFORM PROPRIETARY DATA — ground your ideas in this verified internal knowledge and reference it where relevant:\n${parts
      .map((p) => `- ${p}`)
      .join("\n")}`,
    citations,
  };
}

/**
 * Deterministic opportunity score computed from report structure and
 * platform data, blended with the model's own estimate.
 */
export function computeOpportunityScore(idea: IdeaConcept, brief: string): number {
  const ai = idea.opportunityScore >= 1 && idea.opportunityScore <= 100 ? idea.opportunityScore : 50;

  let ecosystem = 0;
  try {
    const stats = outreachIndustryStats();
    const hay = `${idea.name} ${idea.concept} ${brief}`.toLowerCase();
    const match = stats.find((s) => hay.includes(s.industry.split(" ")[0].toLowerCase()));
    if (match) ecosystem = Math.min(10, Math.round(Math.log10(Math.max(match.count, 1)) * 3));
  } catch {
    ecosystem = 0;
  }

  const signalDepth = Math.min(10, Math.round(idea.marketSignals.length / 40));
  const executability =
    Math.min(6, idea.regulatoryPath.length) + Math.min(4, idea.firstSteps.length);
  const riskPenalty = Math.min(10, idea.risks.length * 2);
  const assumptionPenalty = Math.min(6, Math.max(0, idea.assumptions.length - 2) * 2);
  const confidenceBonus = /high/i.test(idea.confidence) ? 5 : /low/i.test(idea.confidence) ? -5 : 0;

  const computed =
    ai * 0.6 + ecosystem + signalDepth + executability + confidenceBonus - riskPenalty - assumptionPenalty + 10;
  return Math.max(1, Math.min(100, Math.round(computed)));
}
