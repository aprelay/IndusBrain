export interface IdeaConcept {
  name: string;
  concept: string;
  targetMarket: string;
  revenueModel: string;
  whyNow: string;
  ecosystemNeeded: string[];
  risks: string[];
  firstSteps: string[];
}

export interface IdeaReport {
  brief: string;
  country?: string;
  ideas: IdeaConcept[];
  generatedAt: string;
}

const IDEA_SYSTEM_PROMPT = `You are the Idea Engine of an industry-ecosystem intelligence platform. You know the value chains, regulators, gaps and payment flows of every industry on earth, with deep knowledge of Nigeria and West Africa. Given a brief (a sector, a problem, a location, or free-form ambition), invent ORIGINAL, commercially viable venture concepts by combining industries, market gaps and jurisdictions in novel ways. Ideas must be concrete and buildable, not generic.

Respond ONLY with JSON matching this TypeScript type (no markdown fences):
{
  "ideas": [{
    "name": string,
    "concept": string,
    "targetMarket": string,
    "revenueModel": string,
    "whyNow": string,
    "ecosystemNeeded": string[],
    "risks": string[],
    "firstSteps": string[]
  }]
}
Return exactly 3 ideas.`;

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

export async function generateIdeas(
  brief: string,
  country?: string
): Promise<IdeaReport | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const userContent = country
    ? `${brief}\n\nTarget jurisdiction: ${country}. Ground the ideas in the market realities, regulators and gaps of ${country}.`
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
        targetMarket: typeof i.targetMarket === "string" ? i.targetMarket : "",
        revenueModel: typeof i.revenueModel === "string" ? i.revenueModel : "",
        whyNow: typeof i.whyNow === "string" ? i.whyNow : "",
        ecosystemNeeded: asStringArray(i.ecosystemNeeded),
        risks: asStringArray(i.risks),
        firstSteps: asStringArray(i.firstSteps),
      }));
    if (ideas.length === 0) return null;
    return { brief, country, ideas, generatedAt: new Date().toISOString() };
  } catch {
    return null;
  }
}
