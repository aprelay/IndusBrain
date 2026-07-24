import crypto from "crypto";
import { industries } from "@/data/industries";
import { extraIndustries } from "@/data/industries-extra";
import {
  getDigest,
  getRegWatchHash,
  listIdeaFeedback,
  listPrices,
  listRegWatch,
  outreachIndustryStats,
  saveDigest,
  seedRegWatch,
  updateRegWatch,
} from "@/lib/db";
import { buildGroundingContext, findRelevantTemplates } from "@/lib/intelligence";
import { buildMemoryContext, getBrainInsights } from "@/lib/brain";

async function aiCall(
  system: string,
  user: string,
  temperature: number,
  jsonMode = true
): Promise<string | null> {
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
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
        temperature,
        max_tokens: 4000,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch {
    return null;
  }
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function buildPriceContext(country?: string): string {
  const prices = listPrices(country || undefined).slice(0, 30);
  if (prices.length === 0) return "";
  return `\n\nCURRENT PRICE INTELLIGENCE (verified local costs — use these instead of estimates):\n${prices
    .map((p) => `- ${p.item}: ${p.price}${p.unit ? ` per ${p.unit}` : ""} [${p.country}${p.source ? `, source: ${p.source}` : ""}]`)
    .join("\n")}`;
}

function buildFeedbackContext(): string {
  const fb = listIdeaFeedback(50);
  if (fb.length === 0) return "";
  return `\n\nREAL OUTCOME FEEDBACK from clients who executed past ideas (weigh future advice accordingly):\n${fb
    .slice(0, 15)
    .map((f) => `- "${f.ideaName}": ${f.outcome}${f.note ? ` — ${f.note}` : ""}`)
    .join("\n")}`;
}

export function buildFullContext(topic: string, country?: string): { context: string; citations: string[] } {
  const grounding = buildGroundingContext(topic);
  const memory = buildMemoryContext(topic);
  const prices = buildPriceContext(country);
  const feedback = buildFeedbackContext();
  const citations = [...grounding.citations];
  if (prices) citations.push("Price intelligence: verified local cost data");
  if (feedback) citations.push("Outcome feedback: real client execution results");
  return { context: `${grounding.context}${memory}${prices}${feedback}`, citations };
}

const CHAT_SYSTEM_PROMPT = `You are "the Brain" — the conversational intelligence of IndusBrain, an industry-ecosystem platform covering blueprints, regulators, permits, venture ideas, value chains and a classified company database, with deep Nigeria/West Africa expertise. Answer the user's question directly, concretely and jurisdiction-specifically: name actual regulators, realistic costs, who to pay and in what order. Use any PLATFORM PROPRIETARY DATA, BRAIN MEMORY, PRICE INTELLIGENCE and OUTCOME FEEDBACK provided — cite them naturally in the answer. If you are unsure, say so. Keep answers focused; use short headings and lists where helpful. Respond in plain markdown, not JSON.`;

export async function askBrain(
  question: string,
  history: { role: "user" | "assistant"; content: string }[]
): Promise<{ answer: string; citations: string[] } | null> {
  const { context, citations } = buildFullContext(question);
  const convo = history
    .slice(-6)
    .map((m) => `${m.role === "user" ? "User" : "Brain"}: ${m.content}`)
    .join("\n");
  const user = `${convo ? `Conversation so far:\n${convo}\n\n` : ""}Question: ${question}${context}`;
  const answer = await aiCall(CHAT_SYSTEM_PROMPT, user, 0.4, false);
  if (!answer) return null;
  return { answer, citations };
}

const SIMULATE_SYSTEM_PROMPT = `You are the scenario stress-testing engine of an industry-ecosystem intelligence platform. Given venture ideas and a hypothetical scenario (e.g. "fuel price doubles", "currency falls 30%", "new import tariff"), analyze the concrete impact on each idea: what breaks, what costs change and by how much, which assumptions fail, and what mitigations exist. Be numeric and jurisdiction-specific where possible.

Respond ONLY with JSON:
{
  "impacts": [{
    "ideaName": string,
    "impact": string,          // concrete impact analysis with numbers
    "severity": string,        // "low" | "moderate" | "severe"
    "adjustedScore": number,   // revised 1-100 opportunity score under this scenario
    "mitigations": string[]    // practical mitigations
  }]
}`;

export interface ScenarioImpact {
  ideaName: string;
  impact: string;
  severity: string;
  adjustedScore: number;
  mitigations: string[];
}

export async function simulateScenario(
  ideas: { name: string; concept: string; opportunityScore: number }[],
  scenario: string,
  country?: string
): Promise<ScenarioImpact[] | null> {
  const user = `Scenario: ${scenario}\nJurisdiction: ${country || "Nigeria"}${buildPriceContext(country)}\n\nIdeas:\n${ideas
    .map((i) => `- ${i.name} (current score ${i.opportunityScore}/100): ${i.concept}`)
    .join("\n")}`;
  const content = await aiCall(SIMULATE_SYSTEM_PROMPT, user, 0.4);
  if (!content) return null;
  try {
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed?.impacts)) return null;
    return parsed.impacts
      .filter((x: Partial<ScenarioImpact>) => typeof x?.ideaName === "string")
      .map((x: Partial<ScenarioImpact>) => ({
        ideaName: x.ideaName as string,
        impact: typeof x.impact === "string" ? x.impact : "",
        severity: typeof x.severity === "string" ? x.severity : "",
        adjustedScore:
          typeof x.adjustedScore === "number" ? Math.max(1, Math.min(100, Math.round(x.adjustedScore))) : 0,
        mitigations: Array.isArray(x.mitigations)
          ? x.mitigations.filter((m): m is string => typeof m === "string")
          : [],
      }));
  } catch {
    return null;
  }
}

const COMPARE_SYSTEM_PROMPT = `You are the comparative-jurisdiction engine of an industry-ecosystem intelligence platform. Given a business brief and 2-4 jurisdictions, compare executing it in each: actual regulators and key licenses, realistic setup cost band, realistic time to operational, ease-of-doing-business notes, market opportunity, and key risks. End with an honest verdict.

Respond ONLY with JSON:
{
  "comparisons": [{
    "jurisdiction": string,
    "regulators": string[],     // actual regulator/license names
    "setupCost": string,
    "timeToOperational": string,
    "marketOpportunity": string,
    "keyRisks": string[],
    "easeScore": number         // 1-100 ease of execution
  }],
  "verdict": string             // which jurisdiction wins for this brief and why
}`;

export interface JurisdictionComparison {
  comparisons: {
    jurisdiction: string;
    regulators: string[];
    setupCost: string;
    timeToOperational: string;
    marketOpportunity: string;
    keyRisks: string[];
    easeScore: number;
  }[];
  verdict: string;
}

export async function compareJurisdictions(
  brief: string,
  jurisdictions: string[]
): Promise<JurisdictionComparison | null> {
  const { context } = buildFullContext(brief);
  const user = `Brief: ${brief}\nJurisdictions to compare: ${jurisdictions.join(", ")}${context}`;
  const content = await aiCall(COMPARE_SYSTEM_PROMPT, user, 0.4);
  if (!content) return null;
  try {
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed?.comparisons) || parsed.comparisons.length === 0) return null;
    return {
      comparisons: parsed.comparisons.map(
        (c: {
          jurisdiction?: unknown;
          regulators?: unknown;
          setupCost?: unknown;
          timeToOperational?: unknown;
          marketOpportunity?: unknown;
          keyRisks?: unknown;
          easeScore?: unknown;
        }) => ({
          jurisdiction: typeof c.jurisdiction === "string" ? c.jurisdiction : "",
          regulators: Array.isArray(c.regulators)
            ? c.regulators.filter((r): r is string => typeof r === "string")
            : [],
          setupCost: typeof c.setupCost === "string" ? c.setupCost : "",
          timeToOperational: typeof c.timeToOperational === "string" ? c.timeToOperational : "",
          marketOpportunity: typeof c.marketOpportunity === "string" ? c.marketOpportunity : "",
          keyRisks: Array.isArray(c.keyRisks)
            ? c.keyRisks.filter((r): r is string => typeof r === "string")
            : [],
          easeScore: typeof c.easeScore === "number" ? Math.max(1, Math.min(100, Math.round(c.easeScore))) : 0,
        })
      ),
      verdict: typeof parsed.verdict === "string" ? parsed.verdict : "",
    };
  } catch {
    return null;
  }
}

const CRITIQUE_SYSTEM_PROMPT = `You are the document-critique engine of an industry-ecosystem intelligence platform with deep regulatory and market knowledge (especially Nigeria/West Africa). The user submits a business plan, feasibility study or proposal. Critique it like a demanding investment committee: strengths, weaknesses, missing regulators/permits, unrealistic numbers, overlooked risks, and concrete improvements. Reference the PLATFORM PROPRIETARY DATA where relevant. Respond in plain markdown with clear sections: ## Verdict, ## Strengths, ## Weaknesses & gaps, ## Regulatory blind spots, ## Numbers check, ## Recommendations. Not JSON.`;

export async function critiqueDocument(text: string): Promise<string | null> {
  const { context } = buildFullContext(text.slice(0, 500));
  return aiCall(CRITIQUE_SYSTEM_PROMPT, `Document to critique:\n\n${text.slice(0, 24000)}${context}`, 0.4, false);
}

const IMPROVE_SYSTEM_PROMPT = `You are the SME competitiveness engine of an industry-ecosystem intelligence platform with deep Nigeria/West Africa market and regulatory knowledge. The user describes their EXISTING business and its challenges. Produce a practical competitiveness improvement report grounded in the PLATFORM PROPRIETARY DATA (verified prices, company density, regulators, real client outcomes) where provided. Be concrete, numeric and jurisdiction-specific. Respond in plain markdown with these sections: ## Diagnosis (what is really holding this business back), ## Cost & pricing benchmarks (compare their cost structure to verified local prices), ## Competitive landscape (use the company-density data), ## Differentiation moves (specific, ranked), ## New revenue lines from existing assets, ## Expansion opportunities in the surrounding value chain, ## 90-day action plan (week-by-week). Not JSON.`;

export async function improveBusiness(
  business: string,
  country?: string
): Promise<{ report: string; citations: string[] } | null> {
  const { context, citations } = buildFullContext(business, country);
  const stats = outreachIndustryStats().slice(0, 40);
  const density = stats.length
    ? `\n\nCOMPANY DENSITY IN OUR CLASSIFIED DATABASE (real registered companies per industry):\n${stats
        .map((s) => `- ${s.industry}: ${s.count} companies`)
        .join("\n")}`
    : "";
  const report = await aiCall(
    IMPROVE_SYSTEM_PROMPT,
    `Existing business to improve:\n${business}${country ? `\nCountry/market: ${country}` : ""}${context}${density}`,
    0.5,
    false
  );
  if (!report) return null;
  if (density) citations.push("Outreach database: real company density by industry");
  return { report, citations };
}

const HEALTHCHECK_SYSTEM_PROMPT = `You are the SME health-check and benchmarking engine of an industry-ecosystem intelligence platform with deep Nigeria/West Africa knowledge. The user provides their business type and basic financials (revenue, costs, key cost items or prices they pay). Benchmark them against the verified PRICE INTELLIGENCE and industry norms: margin health, whether they are over-paying for inputs versus verified local prices, pricing power, cost structure red flags. Score each area and be honest. Respond in plain markdown with sections: ## Overall health score (x/100 with one-line verdict), ## Margin analysis, ## Input cost benchmarks (line by line vs verified prices, flag overpayment), ## Pricing check, ## Red flags, ## Quick wins (ranked by impact), ## What healthy looks like (target numbers for this business type). Not JSON.`;

export async function smeHealthCheck(
  input: string,
  country?: string
): Promise<{ report: string; citations: string[] } | null> {
  const { context, citations } = buildFullContext(input, country);
  const report = await aiCall(
    HEALTHCHECK_SYSTEM_PROMPT,
    `Business to health-check:\n${input}${country ? `\nCountry/market: ${country}` : ""}${context}`,
    0.4,
    false
  );
  if (!report) return null;
  return { report, citations };
}

const DIGEST_SYSTEM_PROMPT = `You are the weekly industry-intelligence digest writer of an industry-ecosystem platform (deep Nigeria/West Africa knowledge). Given a topic/industry and platform data, write a concise weekly digest: current opportunities, regulatory notes, cost/market signals, and 2-3 concrete moves a business in this space should consider this week. Plain markdown with short sections. Not JSON.`;

export async function getOrCreateDigest(topic: string): Promise<string | null> {
  const now = new Date();
  const onejan = new Date(now.getFullYear(), 0, 1);
  const week = `${now.getFullYear()}-W${Math.ceil(((now.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7)}`;
  const cached = getDigest(topic, week);
  if (cached) return cached;
  const { context } = buildFullContext(topic);
  const content = await aiCall(
    DIGEST_SYSTEM_PROMPT,
    `Topic: ${topic}\nWeek: ${week}${context}\n\nBrain insight: platform has learned from ${getBrainInsights().memoryCount} requests/ideas.`,
    0.5,
    false
  );
  if (!content) return null;
  saveDigest(topic, week, content);
  return content;
}

export function seedRegulatorWatchlist(): void {
  const seen = new Set<string>();
  const entries: { regulator: string; url: string }[] = [];
  for (const t of [...industries, ...extraIndustries]) {
    for (const r of t.regulators) {
      if (r.officialUrl && !seen.has(r.officialUrl)) {
        seen.add(r.officialUrl);
        entries.push({ regulator: r.name, url: r.officialUrl });
      }
    }
  }
  seedRegWatch(entries);
}

export async function runRegWatchCheck(limit = 15): Promise<{ checked: number; changed: string[] }> {
  seedRegulatorWatchlist();
  const all = listRegWatch();
  const toCheck = all
    .sort((a, b) => (a.lastChecked || "").localeCompare(b.lastChecked || ""))
    .slice(0, limit);
  const changed: string[] = [];
  for (const entry of toCheck) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(entry.url, {
        signal: controller.signal,
        headers: { "User-Agent": "Mozilla/5.0 (compatible; IndusBrain RegWatch)" },
      });
      clearTimeout(timer);
      if (!res.ok) {
        updateRegWatch(entry.id, getRegWatchHash(entry.id), `unreachable (${res.status})`, false);
        continue;
      }
      const body = (await res.text()).replace(/\s+/g, " ").slice(0, 100000);
      const hash = crypto.createHash("sha256").update(body).digest("hex");
      const prev = getRegWatchHash(entry.id);
      const isChanged = prev !== "" && prev !== hash;
      updateRegWatch(entry.id, hash, isChanged ? "changed" : "ok", isChanged);
      if (isChanged) changed.push(entry.regulator);
    } catch {
      updateRegWatch(entry.id, getRegWatchHash(entry.id), "unreachable", false);
    }
  }
  return { checked: toCheck.length, changed };
}

export interface DomainEnrichment {
  siteTitle: string;
  siteDescription: string;
  contactEmails: string;
  contactPhones: string;
}

export async function fetchDomainEnrichment(domain: string): Promise<DomainEnrichment | null> {
  for (const url of [`https://${domain}`, `https://www.${domain}`, `http://${domain}`]) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": "Mozilla/5.0 (compatible; IndusBrain)" },
        redirect: "follow",
      });
      clearTimeout(timer);
      if (!res.ok) continue;
      const html = (await res.text()).slice(0, 300000);
      const title = decodeEntities(
        /<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1]?.trim().slice(0, 200) || ""
      );
      const desc = decodeEntities(
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i.exec(html)?.[1]?.trim().slice(0, 400) ||
          /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i.exec(html)?.[1]?.trim().slice(0, 400) ||
          ""
      );
      const emails = Array.from(
        new Set(
          (html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []).filter(
            (e) => !/\.(png|jpg|jpeg|gif|svg|webp|css|js)$/i.test(e)
          )
        )
      )
        .slice(0, 5)
        .join(", ");
      const phones = Array.from(new Set(html.match(/\+\d[\d\s().-]{8,18}\d/g) || []))
        .slice(0, 3)
        .map((p) => p.trim())
        .join(", ");
      return { siteTitle: title, siteDescription: desc, contactEmails: emails, contactPhones: phones };
    } catch {
      continue;
    }
  }
  return null;
}

export function relevantTemplateNames(brief: string): string[] {
  return findRelevantTemplates(brief).map((t) => t.name);
}
