"use client";

import { useState } from "react";
import { IdeaReport } from "@/lib/ideas";

type LockedReport = IdeaReport & { locked?: boolean };

const COUNTRIES = [
  "Nigeria", "Ghana", "Kenya", "South Africa", "Egypt", "Côte d'Ivoire", "Senegal",
  "Tanzania", "Uganda", "Rwanda", "Ethiopia", "Cameroon", "Benin", "Togo", "Niger Republic",
  "United Kingdom", "United States", "United Arab Emirates", "India", "China", "Global",
];

function reportToMarkdown(r: IdeaReport): string {
  const lines: string[] = [`# Idea Engine Report`, ""];
  lines.push(`**Brief:** ${r.brief}`);
  if (r.country) lines.push(`**Jurisdiction:** ${r.country}`);
  lines.push(`**Generated:** ${new Date(r.generatedAt).toLocaleString()}`, "");
  r.ideas.forEach((i, n) => {
    lines.push(`## ${n + 1}. ${i.name}`, "", i.concept, "");
    lines.push(`**Target market:** ${i.targetMarket}`);
    lines.push(`**Revenue model:** ${i.revenueModel}`);
    lines.push(`**Why now:** ${i.whyNow}`, "");
    lines.push(`### Ecosystem needed`);
    i.ecosystemNeeded.forEach((e) => lines.push(`- ${e}`));
    lines.push("", `### Key risks`);
    i.risks.forEach((e) => lines.push(`- ${e}`));
    lines.push("", `### First steps`);
    i.firstSteps.forEach((e, k) => lines.push(`${k + 1}. ${e}`));
    lines.push("");
  });
  return lines.join("\n");
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

export default function IdeasPage() {
  const [brief, setBrief] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<LockedReport | null>(null);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Idea Engine</h1>
            <a href="/" className="text-sm text-blue-600 hover:underline">
              ← Blueprint generator
            </a>
          </div>
          <p className="mt-2 text-slate-600">
            The brain that maps every industry ecosystem can also invent new ones. Give it a
            sector, a problem, or an ambition — it combines industries, market gaps and
            jurisdictions to generate original, sellable venture concepts.
          </p>
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
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {report.ideas.length} idea{report.ideas.length === 1 ? "" : "s"} for “
                {report.brief}”
              </h2>
              {!report.locked && (
                <button
                  onClick={() =>
                    downloadFile(reportToMarkdown(report), "idea-report.md", "text/markdown")
                  }
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100"
                >
                  Download report
                </button>
              )}
            </div>
            <div className="space-y-6">
              {report.ideas.map((idea, n) => (
                <div key={idea.name} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-bold">
                    {n + 1}. {idea.name}
                  </h3>
                  <p className="mt-2 text-slate-700">{idea.concept}</p>
                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                    <div>
                      <span className="font-semibold">Target market</span>
                      <p className="text-slate-600">{idea.targetMarket}</p>
                    </div>
                    <div>
                      <span className="font-semibold">Revenue model</span>
                      <p className="text-slate-600">{idea.revenueModel}</p>
                    </div>
                    <div>
                      <span className="font-semibold">Why now</span>
                      <p className="text-slate-600">{idea.whyNow}</p>
                    </div>
                  </div>
                  {idea.ecosystemNeeded.length > 0 && (
                    <div className="mt-4 text-sm">
                      <span className="font-semibold">Ecosystem needed</span>
                      <ul className="mt-1 list-disc pl-5 text-slate-600">
                        {idea.ecosystemNeeded.map((e) => (
                          <li key={e}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {idea.risks.length > 0 && (
                    <div className="mt-3 text-sm">
                      <span className="font-semibold">Key risks</span>
                      <ul className="mt-1 list-disc pl-5 text-slate-600">
                        {idea.risks.map((e) => (
                          <li key={e}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {idea.firstSteps.length > 0 && (
                    <div className="mt-3 text-sm">
                      <span className="font-semibold">First steps</span>
                      <ol className="mt-1 list-decimal pl-5 text-slate-600">
                        {idea.firstSteps.map((e) => (
                          <li key={e}>{e}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
