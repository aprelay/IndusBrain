"use client";

import { useEffect, useState } from "react";
import { IdeaDeepDive, IdeaReport, deepDiveToMarkdown, ideaReportToMarkdown } from "@/lib/ideas";

type LockedReport = IdeaReport & { locked?: boolean };

interface SavedIdeaMeta {
  id: number;
  title: string;
  createdAt: string;
}

interface BrainInsights {
  memoryCount: number;
  trendingTopics: { topic: string; count: number }[];
  trendingCountries: { country: string; count: number }[];
}

interface ScenarioImpact {
  ideaName: string;
  impact: string;
  severity: string;
  adjustedScore: number;
  mitigations: string[];
}

interface JurisdictionComparison {
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

const COUNTRIES = [
  "Nigeria", "Ghana", "Kenya", "South Africa", "Egypt", "Côte d'Ivoire", "Senegal",
  "Tanzania", "Uganda", "Rwanda", "Ethiopia", "Cameroon", "Benin", "Togo", "Niger Republic",
  "United Kingdom", "United States", "United Arab Emirates", "India", "China", "Global",
];

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function reportToWordHtml(r: IdeaReport): string {
  const md = ideaReportToMarkdown(r);
  const body = md
    .split("\n")
    .map((line) => {
      if (line.startsWith("# ")) return `<h1>${escapeHtml(line.slice(2))}</h1>`;
      if (line.startsWith("## ")) return `<h2>${escapeHtml(line.slice(3))}</h2>`;
      if (line.startsWith("### ")) return `<h3>${escapeHtml(line.slice(4))}</h3>`;
      if (line.startsWith("- ")) return `<p style="margin:2pt 0 2pt 18pt">• ${escapeHtml(line.slice(2))}</p>`;
      if (line.startsWith("> ")) return `<p style="color:#666;font-style:italic">${escapeHtml(line.slice(2))}</p>`;
      const bold = escapeHtml(line).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
      return line.trim() ? `<p style="margin:4pt 0">${bold}</p>` : "";
    })
    .join("\n");
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>Idea Engine Report</title></head><body style="font-family:Calibri,Arial,sans-serif">${body}</body></html>`;
}

async function downloadPdf(md: string, title: string, filename: string) {
  const res = await fetch("/api/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ markdown: md, title, filename }),
  });
  if (!res.ok) return;
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <span className="font-semibold">{label}</span>
      <p className="text-slate-600">{value}</p>
    </div>
  );
}

function ListBlock({
  label,
  items,
  ordered,
}: {
  label: string;
  items: string[];
  ordered?: boolean;
}) {
  if (items.length === 0) return null;
  const Tag = ordered ? "ol" : "ul";
  return (
    <div className="mt-3 text-sm">
      <span className="font-semibold">{label}</span>
      <Tag className={`mt-1 ${ordered ? "list-decimal" : "list-disc"} pl-5 text-slate-600`}>
        {items.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </Tag>
    </div>
  );
}

export default function IdeasPage() {
  const [brief, setBrief] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<LockedReport | null>(null);
  const [saved, setSaved] = useState<SavedIdeaMeta[]>([]);
  const [insights, setInsights] = useState<BrainInsights | null>(null);
  const [deepDive, setDeepDive] = useState<IdeaDeepDive | null>(null);
  const [deepDiveFor, setDeepDiveFor] = useState<string | null>(null);
  const [deepDiveError, setDeepDiveError] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [scenario, setScenario] = useState("");
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [impacts, setImpacts] = useState<{ scenario: string; impacts: ScenarioImpact[] } | null>(null);
  const [compareInput, setCompareInput] = useState("");
  const [compareLoading, setCompareLoading] = useState(false);
  const [comparison, setComparison] = useState<JurisdictionComparison | null>(null);
  const [feedbackSent, setFeedbackSent] = useState<Record<string, string>>({});

  async function loadSaved() {
    try {
      const res = await fetch("/api/my/ideas");
      if (res.ok) setSaved(await res.json());
    } catch {
      /* not signed in */
    }
  }

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d: { user: unknown }) => {
        if (!d.user) {
          window.location.replace("/login");
          return;
        }
        setAuthed(true);
      })
      .catch(() => {
        window.location.replace("/login");
      });
    loadSaved();
    fetch("/api/insights")
      .then((r) => r.json())
      .then(setInsights)
      .catch(() => {});
  }, []);

  async function openSaved(id: number) {
    const res = await fetch(`/api/my/ideas?id=${id}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.ideas)) {
        setReport(data);
        setDeepDive(null);
      } else if (Array.isArray(data?.phases)) {
        setDeepDive(data);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function goDeeper(idea: { name: string; concept: string }) {
    setDeepDiveFor(idea.name);
    setDeepDiveError(null);
    try {
      const res = await fetch("/api/ideas/deepdive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: idea.name,
          concept: idea.concept,
          country: report?.country,
          brief: report?.brief,
          accessCode: accessCode || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to generate deep dive");
      setDeepDive(data);
      loadSaved();
      setTimeout(() => {
        document.getElementById("deep-dive")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setDeepDiveError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDeepDiveFor(null);
    }
  }

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    if (!brief.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief,
          country: country !== "Global" ? country : undefined,
          accessCode: accessCode || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to generate ideas");
      setReport(data);
      loadSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function runScenario() {
    if (!report || !scenario.trim() || scenarioLoading) return;
    setScenarioLoading(true);
    setImpacts(null);
    try {
      const res = await fetch("/api/ideas/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: scenario.trim(),
          country: report.country,
          ideas: report.ideas.map((i) => ({
            name: i.name,
            concept: i.concept,
            opportunityScore: i.opportunityScore,
          })),
        }),
      });
      const data = await res.json();
      if (res.ok) setImpacts(data);
      else setError(data.error || "Simulation failed");
    } catch {
      setError("Simulation failed");
    }
    setScenarioLoading(false);
  }

  async function runCompare() {
    if (!report || compareLoading) return;
    const jurisdictions = compareInput
      .split(/,|\bvs\.?\b/i)
      .map((j) => j.trim())
      .filter(Boolean);
    if (jurisdictions.length < 2) {
      setError("Enter at least 2 jurisdictions, e.g. Lagos, Nairobi, Accra");
      return;
    }
    setCompareLoading(true);
    setComparison(null);
    try {
      const res = await fetch("/api/ideas/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: report.brief, jurisdictions }),
      });
      const data = await res.json();
      if (res.ok) setComparison(data);
      else setError(data.error || "Comparison failed");
    } catch {
      setError("Comparison failed");
    }
    setCompareLoading(false);
  }

  async function sendFeedback(ideaName: string, outcome: string) {
    const res = await fetch("/api/ideas/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ideaName, outcome }),
    });
    if (res.ok) setFeedbackSent((f) => ({ ...f, [ideaName]: outcome }));
  }

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-mark.svg" alt="IndusBrain" className="h-14 w-14 animate-pulse" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-mark.svg" alt="IndusBrain" className="h-10 w-10" />
              <h1 className="text-3xl font-bold tracking-tight">Idea Engine</h1>
            </div>
            <nav className="flex gap-4 text-sm">
              <a href="/chat" className="text-blue-600 hover:underline">
                Ask the Brain
              </a>
              <a href="/sme" className="text-blue-600 hover:underline">
                Grow my business
              </a>
              <a href="/outreach" className="text-blue-600 hover:underline">
                Outreach
              </a>
              <a href="/" className="text-blue-600 hover:underline">
                ← Blueprint generator
              </a>
            </nav>
          </div>
          <p className="mt-2 text-slate-600">
            The brain that maps every industry ecosystem can also invent new ones. Give it a
            sector, a problem, or an ambition — it returns full venture dossiers: market
            signals, competitive landscape, capital, unit economics, regulatory path and
            go-to-market.
          </p>
          {insights && insights.memoryCount > 0 && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
              <span className="font-semibold">
                🧠 The brain has learned from {insights.memoryCount.toLocaleString()}{" "}
                requests and ideas
              </span>
              {insights.trendingTopics.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {insights.trendingTopics.map((t) => (
                    <button
                      key={t.topic}
                      onClick={() => setBrief((b) => (b ? `${b} ${t.topic}` : t.topic))}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs capitalize text-slate-600 hover:bg-blue-100"
                      title={`Seen in ${t.count} briefs — click to add to your brief`}
                    >
                      {t.topic} · {t.count}
                    </button>
                  ))}
                </div>
              )}
              <p className="mt-2 text-xs text-slate-500">
                Every search and generated idea feeds the brain’s memory — new ideas build on
                what it has already learned.
              </p>
            </div>
          )}
        </header>

        <form onSubmit={generate} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">
              Your brief (sector, problem, or ambition)
            </span>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={3}
              placeholder='e.g. "opportunities in cold chain for Nigerian agriculture" or "ideas combining solar power and fintech"'
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Target market</span>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                {COUNTRIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">
                Access code (optional)
              </span>
              <input
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="For full reports when billing is enabled"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={loading || !brief.trim()}
            className="mt-4 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Inventing…" : "Generate ideas"}
          </button>
          {error && <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-red-700">{error}</p>}
        </form>

        {report && (
          <section className="mt-8">
            {report.locked && (
              <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-800">
                This is a free preview (1 of 3 ideas, details hidden). Sign in with credits or
                enter an access code and regenerate to unlock the full report.
              </div>
            )}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-semibold">
                {report.ideas.length} idea{report.ideas.length === 1 ? "" : "s"} for “
                {report.brief}”
              </h2>
              {!report.locked && (
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      downloadPdf(
                        ideaReportToMarkdown(report),
                        `Idea Engine Report — ${report.brief}`,
                        "idea-report.pdf"
                      )
                    }
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Download PDF
                  </button>
                  <button
                    onClick={() =>
                      downloadFile(ideaReportToMarkdown(report), "idea-report.md", "text/markdown")
                    }
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100"
                  >
                    Markdown
                  </button>
                  <button
                    onClick={() =>
                      downloadFile(reportToWordHtml(report), "idea-report.doc", "application/msword")
                    }
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100"
                  >
                    Word
                  </button>
                </div>
              )}
            </div>
            {!report.locked && (
              <p className="mb-4 text-xs text-slate-500">
                AI-generated venture concepts. Assumptions and confidence are stated per idea —
                validate before investment.
              </p>
            )}
            {!report.locked && (report.refined || (report.groundedIn?.length ?? 0) > 0) && (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
                <span className="font-semibold">🧠 Intelligence sources:</span>{" "}
                {[
                  ...(report.refined
                    ? ["multi-pass reasoning (generated → critiqued → refined)"]
                    : []),
                  ...(report.groundedIn || []),
                ].join(" · ")}
              </div>
            )}
            <div className="space-y-6">
              {report.ideas.map((idea, n) => (
                <div key={idea.name} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-bold">
                    {n + 1}. {idea.name}
                  </h3>
                  {(idea.opportunityScore > 0 || idea.confidence) && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {idea.opportunityScore > 0 && (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Opportunity: {idea.opportunityScore}/100
                        </span>
                      )}
                      {idea.confidence && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          Confidence: {idea.confidence}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="mt-2 text-slate-700">{idea.concept}</p>
                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                    <Field label="Target market" value={idea.targetMarket} />
                    <Field label="Revenue model" value={idea.revenueModel} />
                    <Field label="Why now" value={idea.whyNow} />
                    <Field label="Market signals" value={idea.marketSignals} />
                    <Field label="Competitive landscape" value={idea.competitiveLandscape} />
                    <Field label="Capital required" value={idea.capitalRequired} />
                    <Field label="Unit economics" value={idea.unitEconomics} />
                  </div>
                  <ListBlock label="Regulatory path" items={idea.regulatoryPath} ordered />
                  <ListBlock label="Go-to-market" items={idea.goToMarket} ordered />
                  <ListBlock label="Ecosystem needed" items={idea.ecosystemNeeded} />
                  <ListBlock label="Key risks" items={idea.risks} />
                  <ListBlock label="Key assumptions" items={idea.assumptions} />
                  <ListBlock label="First steps" items={idea.firstSteps} ordered />
                  {!report.locked && (
                    <button
                      onClick={() => goDeeper(idea)}
                      disabled={deepDiveFor !== null}
                      className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {deepDiveFor === idea.name
                        ? "Building execution playbook…"
                        : "🔍 Go deeper — full execution playbook"}
                    </button>
                  )}
                  {!report.locked && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      {feedbackSent[idea.name] ? (
                        <span className="text-emerald-600">
                          ✓ Feedback recorded ({feedbackSent[idea.name]}) — the brain learns from it
                        </span>
                      ) : (
                        <>
                          <span>Pursued this idea? Tell the brain:</span>
                          <button
                            onClick={() => sendFeedback(idea.name, "worked")}
                            className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700 hover:bg-emerald-100"
                          >
                            It worked
                          </button>
                          <button
                            onClick={() => sendFeedback(idea.name, "in-progress")}
                            className="rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-700 hover:bg-blue-100"
                          >
                            In progress
                          </button>
                          <button
                            onClick={() => sendFeedback(idea.name, "failed")}
                            className="rounded-full bg-red-50 px-2 py-0.5 font-medium text-red-700 hover:bg-red-100"
                          >
                            It failed
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {!report.locked && report.surroundingOpportunities?.length > 0 && (
              <div className="mt-10">
                <h2 className="text-xl font-semibold">Surrounding opportunity ecosystem</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Every project creates demand for dozens of other businesses. These are the
                  opportunities surrounding “{report.brief}” — each one a business someone could
                  start.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {report.surroundingOpportunities.map((o, k) => (
                    <div
                      key={o.name}
                      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold">
                          {k + 1}. {o.name}
                        </h3>
                        {o.type && (
                          <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                            {o.type}
                          </span>
                        )}
                      </div>
                      {o.description && (
                        <p className="mt-2 text-sm text-slate-700">{o.description}</p>
                      )}
                      <div className="mt-3 space-y-1 text-sm">
                        {o.whoBuys && (
                          <p>
                            <span className="font-semibold">Who pays you:</span>{" "}
                            <span className="text-slate-600">{o.whoBuys}</span>
                          </p>
                        )}
                        {o.startupCost && (
                          <p>
                            <span className="font-semibold">Startup cost:</span>{" "}
                            <span className="text-slate-600">{o.startupCost}</span>
                          </p>
                        )}
                        {o.marketGap && (
                          <p>
                            <span className="font-semibold">Market gap:</span>{" "}
                            <span className="text-slate-600">{o.marketGap}</span>
                          </p>
                        )}
                        {o.outreachIndustry && (
                          <a
                            href={`/outreach?industry=${encodeURIComponent(o.outreachIndustry)}`}
                            className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-blue-600 hover:bg-slate-200"
                          >
                            📡 Find {o.outreachIndustry} companies
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!report.locked && (
              <div className="mt-10 space-y-6">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="font-semibold">⚡ Stress-test these ideas</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    What happens under a shock? e.g. “fuel price doubles”, “naira falls 30%”, “new
                    import tariff”.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <input
                      value={scenario}
                      onChange={(e) => setScenario(e.target.value)}
                      placeholder="Describe a scenario…"
                      maxLength={300}
                      className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm"
                    />
                    <button
                      onClick={runScenario}
                      disabled={scenarioLoading || !scenario.trim()}
                      className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
                    >
                      {scenarioLoading ? "Simulating…" : "Run simulation"}
                    </button>
                  </div>
                  {impacts && (
                    <div className="mt-4 space-y-3">
                      {impacts.impacts.map((im) => (
                        <div key={im.ideaName} className="rounded-lg bg-slate-50 p-4 text-sm">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-semibold">{im.ideaName}</span>
                            <span className="flex items-center gap-2">
                              {im.severity && (
                                <span
                                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                    /severe/i.test(im.severity)
                                      ? "bg-red-100 text-red-700"
                                      : /moderate/i.test(im.severity)
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-emerald-100 text-emerald-700"
                                  }`}
                                >
                                  {im.severity}
                                </span>
                              )}
                              {im.adjustedScore > 0 && (
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                  score → {im.adjustedScore}/100
                                </span>
                              )}
                            </span>
                          </div>
                          {im.impact && <p className="mt-2 text-slate-700">{im.impact}</p>}
                          {im.mitigations.length > 0 && (
                            <ul className="mt-2 list-disc pl-5 text-slate-600">
                              {im.mitigations.map((m) => (
                                <li key={m}>{m}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="font-semibold">🌍 Compare jurisdictions</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Where should this be built? Enter 2–4 places, e.g. “Lagos, Nairobi, Accra”.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <input
                      value={compareInput}
                      onChange={(e) => setCompareInput(e.target.value)}
                      placeholder="Lagos, Nairobi, Accra"
                      maxLength={200}
                      className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm"
                    />
                    <button
                      onClick={runCompare}
                      disabled={compareLoading || !compareInput.trim()}
                      className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
                    >
                      {compareLoading ? "Comparing…" : "Compare"}
                    </button>
                  </div>
                  {comparison && (
                    <div className="mt-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {comparison.comparisons.map((c) => (
                          <div key={c.jurisdiction} className="rounded-lg bg-slate-50 p-4 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">{c.jurisdiction}</span>
                              {c.easeScore > 0 && (
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                  ease {c.easeScore}/100
                                </span>
                              )}
                            </div>
                            {c.setupCost && (
                              <p className="mt-2">
                                <span className="font-semibold">Setup cost:</span>{" "}
                                <span className="text-slate-600">{c.setupCost}</span>
                              </p>
                            )}
                            {c.timeToOperational && (
                              <p>
                                <span className="font-semibold">Time to operational:</span>{" "}
                                <span className="text-slate-600">{c.timeToOperational}</span>
                              </p>
                            )}
                            {c.marketOpportunity && (
                              <p>
                                <span className="font-semibold">Market:</span>{" "}
                                <span className="text-slate-600">{c.marketOpportunity}</span>
                              </p>
                            )}
                            {c.regulators.length > 0 && (
                              <p className="mt-1 text-xs text-slate-500">
                                Regulators: {c.regulators.join(", ")}
                              </p>
                            )}
                            {c.keyRisks.length > 0 && (
                              <p className="mt-1 text-xs text-slate-500">
                                Risks: {c.keyRisks.join("; ")}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      {comparison.verdict && (
                        <p className="mt-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                          <span className="font-semibold">Verdict:</span> {comparison.verdict}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {deepDiveError && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-red-700">{deepDiveError}</p>
        )}

        {deepDive && (
          <section id="deep-dive" className="mt-10">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-semibold">
                Execution deep dive: {deepDive.ideaName}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    downloadPdf(
                      deepDiveToMarkdown(deepDive),
                      `Execution Deep Dive — ${deepDive.ideaName}`,
                      "execution-deep-dive.pdf"
                    )
                  }
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Download PDF
                </button>
                <button
                  onClick={() =>
                    downloadFile(deepDiveToMarkdown(deepDive), "execution-deep-dive.md", "text/markdown")
                  }
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100"
                >
                  Markdown
                </button>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              {deepDive.overview && <p className="text-slate-700">{deepDive.overview}</p>}
              <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <Field label="Overall timeline" value={deepDive.timeline} />
                <Field label="Capital plan" value={deepDive.capitalPlan} />
              </div>
              <div className="mt-6 space-y-6">
                {deepDive.phases.map((p) => (
                  <div key={p.name} className="rounded-lg border border-slate-200 p-4">
                    <h3 className="font-bold">{p.name}</h3>
                    {p.objective && <p className="mt-1 text-sm italic text-slate-600">{p.objective}</p>}
                    <div className="mt-3 space-y-4">
                      {p.steps.map((s, k) => (
                        <div key={s.step} className="border-l-2 border-emerald-500 pl-3">
                          <p className="text-sm font-semibold">
                            {k + 1}. {s.step}
                          </p>
                          {s.detail && <p className="mt-1 text-sm text-slate-600">{s.detail}</p>}
                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                            {s.whoYouPay && <span>💼 Who you pay: {s.whoYouPay}</span>}
                            {s.typicalCost && <span>💰 {s.typicalCost}</span>}
                            {s.duration && <span>⏱ {s.duration}</span>}
                          </div>
                          {s.permits.length > 0 && (
                            <p className="mt-1 text-xs text-amber-700">
                              📋 Permits: {s.permits.join("; ")}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <ListBlock label="Permit & approval checklist" items={deepDive.permitChecklist} ordered />
              <ListBlock label="Success metrics" items={deepDive.successMetrics} />
              {deepDive.outreachIndustries.length > 0 && (
                <div className="mt-4 text-sm">
                  <span className="font-semibold">Companies to contact (Outreach)</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {deepDive.outreachIndustries.map((ind) => (
                      <a
                        key={ind}
                        href={`/outreach?industry=${encodeURIComponent(ind)}`}
                        className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium capitalize text-blue-700 hover:bg-blue-100"
                      >
                        📡 {ind} companies →
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {(deepDive.surroundingOpportunities?.length ?? 0) > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold">Surrounding opportunity ecosystem</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Businesses this venture creates demand for — each one an opportunity of its
                    own.
                  </p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {deepDive.surroundingOpportunities.map((o, k) => (
                      <div
                        key={o.name}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold">
                            {k + 1}. {o.name}
                          </h4>
                          {o.type && (
                            <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                              {o.type}
                            </span>
                          )}
                        </div>
                        {o.description && (
                          <p className="mt-2 text-sm text-slate-700">{o.description}</p>
                        )}
                        <div className="mt-3 space-y-1 text-sm">
                          {o.whoBuys && (
                            <p>
                              <span className="font-semibold">Who pays you:</span>{" "}
                              <span className="text-slate-600">{o.whoBuys}</span>
                            </p>
                          )}
                          {o.startupCost && (
                            <p>
                              <span className="font-semibold">Startup cost:</span>{" "}
                              <span className="text-slate-600">{o.startupCost}</span>
                            </p>
                          )}
                          {o.marketGap && (
                            <p>
                              <span className="font-semibold">Market gap:</span>{" "}
                              <span className="text-slate-600">{o.marketGap}</span>
                            </p>
                          )}
                          {o.outreachIndustry && (
                            <a
                              href={`/outreach?industry=${encodeURIComponent(o.outreachIndustry)}`}
                              className="inline-block rounded-full bg-white px-3 py-1 text-xs font-medium text-blue-600 hover:bg-slate-100"
                            >
                              📡 Find {o.outreachIndustry} companies
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="mt-4 text-xs text-slate-500">
                AI-generated execution playbook — verify costs, permits and regulators locally
                before committing capital.
              </p>
            </div>
          </section>
        )}

        {saved.length > 0 && (
          <section className="mt-10">
            <button
              onClick={() => setShowSaved((v) => !v)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100"
            >
              {showSaved ? "Hide" : "📁 My saved idea reports"} ({saved.length})
            </button>
            {showSaved && (
              <ul className="mt-3 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                {saved.map((s) => (
                  <li key={s.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span>{s.title}</span>
                    <button
                      onClick={() => openSaved(s.id)}
                      className="text-blue-600 hover:underline"
                    >
                      Open
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
