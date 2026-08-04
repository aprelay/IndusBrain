import {
  BrainMemoryRow,
  countBrainMemory,
  listRecentBrainMemory,
  recordBrainMemory,
} from "@/lib/db";
import { IdeaReport } from "@/lib/ideas";

const STOPWORDS = new Set([
  "the", "and", "for", "with", "that", "this", "from", "into", "along", "new",
  "how", "what", "where", "when", "can", "our", "your", "their", "about",
  "a", "an", "of", "in", "on", "to", "is", "are", "we", "i", "it", "or",
  "build", "start", "open", "create", "make", "want", "need", "opportunity",
  "opportunities", "ideas", "idea", "business", "company", "industry",
]);

export function tokenize(text: string): string[] {
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((t) => t.length >= 3 && !STOPWORDS.has(t))
    )
  );
}

export function rememberIdeaReport(report: IdeaReport): void {
  recordBrainMemory(
    report.ideas.map((i) => ({
      kind: "idea",
      brief: report.brief,
      country: report.country || "",
      title: i.name,
      summary: i.concept.slice(0, 300),
    }))
  );
}

export function rememberBlueprint(request: string, industry: string, country?: string): void {
  recordBrainMemory([
    { kind: "blueprint", brief: request, country: country || "", title: industry },
  ]);
}

export function findRelatedMemory(brief: string, limit = 6): BrainMemoryRow[] {
  const tokens = tokenize(brief);
  if (tokens.length === 0) return [];
  const scored = listRecentBrainMemory(1000)
    .map((m) => {
      const hay = `${m.brief} ${m.title} ${m.summary}`.toLowerCase();
      const score = tokens.reduce((s, t) => s + (hay.includes(t) ? t.length : 0), 0);
      return { m, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((x) => x.m);
}

export function buildMemoryContext(brief: string): string {
  const related = findRelatedMemory(brief);
  if (related.length === 0) return "";
  const lines = related.map((m) =>
    m.kind === "idea"
      ? `- [past idea${m.country ? `, ${m.country}` : ""}] "${m.title}": ${m.summary} (from brief: "${m.brief.slice(0, 80)}")`
      : `- [past blueprint request${m.country ? `, ${m.country}` : ""}] "${m.brief.slice(0, 120)}" (matched industry: ${m.title})`
  );
  return `\n\nBRAIN MEMORY — related demand and ideas this platform has already seen (learn from them; build on gaps they reveal; do NOT repeat them verbatim):\n${lines.join("\n")}`;
}

export interface BrainInsights {
  memoryCount: number;
  trendingTopics: { topic: string; count: number }[];
  trendingCountries: { country: string; count: number }[];
}

export function getBrainInsights(): BrainInsights {
  const recent = listRecentBrainMemory(1000);
  const topicCounts = new Map<string, number>();
  const countryCounts = new Map<string, number>();
  for (const m of recent) {
    for (const t of tokenize(m.brief)) {
      topicCounts.set(t, (topicCounts.get(t) || 0) + 1);
    }
    if (m.country) countryCounts.set(m.country, (countryCounts.get(m.country) || 0) + 1);
  }
  const top = (map: Map<string, number>, n: number) =>
    Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n);
  return {
    memoryCount: countBrainMemory(),
    trendingTopics: top(topicCounts, 12).map(([topic, count]) => ({ topic, count })),
    trendingCountries: top(countryCounts, 8).map(([country, count]) => ({ country, count })),
  };
}
