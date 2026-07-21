"use client";

import { useEffect, useState } from "react";
import { IdeaReport, ideaReportToMarkdown } from "@/lib/ideas";

type LockedReport = IdeaReport & { locked?: boolean };

interface SavedIdeaMeta {
  id: number;
  title: string;
  createdAt: string;
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

  async function loadSaved() {
    try {
      const res = await fetch("/api/my/ideas");
      if (res.ok) setSaved(await res.json());
    } catch {
      /* not signed in */
    }
  }

  useEffect(() => {
    loadSaved();
  }, []);

  async function openSaved(id: number) {
    const res = await fetch(`/api/my/ideas?id=${id}`);
    if (res.ok) {
      setReport(await res.json());
      window.scrollTo({ top: 0, behavior: "smooth" });
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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Idea Engine</h1>
            <nav className="flex gap-4 text-sm">
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
            <div className="space-y-6">
              {report.ideas.map((idea, n) => (
                <div key={idea.name} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold">
                      {n + 1}. {idea.name}
                    </h3>
                    {idea.confidence && (
                      <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        Confidence: {idea.confidence}
                      </span>
                    )}
                  </div>
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
                </div>
              ))}
            </div>
          </section>
        )}

        {saved.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 text-lg font-semibold">My saved idea reports</h2>
            <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
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
          </section>
        )}
      </div>
    </main>
  );
}
