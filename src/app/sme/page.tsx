"use client";

import { useEffect, useState } from "react";

const COUNTRIES = [
  "Nigeria", "Ghana", "Kenya", "South Africa", "Egypt", "Côte d'Ivoire", "Senegal",
  "Tanzania", "Uganda", "Rwanda", "Ethiopia", "Cameroon", "Benin", "Togo", "Niger Republic",
  "United Kingdom", "United States", "United Arab Emirates", "India", "China", "Global",
];

function renderMarkdown(md: string): string {
  const esc = md.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return esc
    .split("\n")
    .map((line) => {
      if (line.startsWith("### ")) return `<h4 class="mt-3 font-semibold">${line.slice(4)}</h4>`;
      if (line.startsWith("## ")) return `<h3 class="mt-4 text-base font-semibold">${line.slice(3)}</h3>`;
      if (line.startsWith("# ")) return `<h3 class="mt-4 text-base font-bold">${line.slice(2)}</h3>`;
      if (line.startsWith("- ")) return `<p class="ml-4">• ${line.slice(2)}</p>`;
      const bold = line.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
      return line.trim() ? `<p class="mt-1">${bold}</p>` : "";
    })
    .join("");
}

function downloadMarkdown(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SmePage() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<"improve" | "health">("improve");
  const [country, setCountry] = useState("Nigeria");
  const [error, setError] = useState<string | null>(null);

  const [business, setBusiness] = useState("");
  const [improveLoading, setImproveLoading] = useState(false);
  const [improveReport, setImproveReport] = useState<string | null>(null);
  const [improveCitations, setImproveCitations] = useState<string[]>([]);

  const [healthInput, setHealthInput] = useState("");
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthReport, setHealthReport] = useState<string | null>(null);
  const [healthCitations, setHealthCitations] = useState<string[]>([]);

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
      .catch(() => window.location.replace("/login"));
  }, []);

  async function runImprove() {
    if (improveLoading) return;
    setError(null);
    setImproveReport(null);
    setImproveLoading(true);
    try {
      const res = await fetch("/api/sme/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business, country }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Report failed");
      else {
        setImproveReport(data.report);
        setImproveCitations(data.citations || []);
      }
    } catch {
      setError("Network error");
    }
    setImproveLoading(false);
  }

  async function runHealth() {
    if (healthLoading) return;
    setError(null);
    setHealthReport(null);
    setHealthLoading(true);
    try {
      const res = await fetch("/api/sme/healthcheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: healthInput, country }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Health check failed");
      else {
        setHealthReport(data.report);
        setHealthCitations(data.citations || []);
      }
    } catch {
      setError("Network error");
    }
    setHealthLoading(false);
  }

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-mark.svg" alt="IndusBrain" className="h-16 w-16 animate-pulse" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark.svg" alt="IndusBrain" className="h-9 w-9" />
            <h1 className="text-2xl font-bold tracking-tight">Grow My Business</h1>
          </div>
          <nav className="flex items-center gap-2 text-sm">
            <a href="/" className="rounded-lg px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100">
              Blueprints
            </a>
            <a href="/ideas" className="rounded-lg px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100">
              💡 Idea Engine
            </a>
            <a href="/chat" className="rounded-lg px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100">
              🧠 Ask the Brain
            </a>
            <a href="/outreach" className="rounded-lg px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100">
              📡 Outreach
            </a>
          </nav>
        </header>

        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
          <button
            onClick={() => setTab("improve")}
            className={`rounded-lg px-4 py-2 font-medium ${tab === "improve" ? "bg-blue-600 text-white" : "border border-slate-300 bg-white hover:bg-slate-100"}`}
          >
            📈 Improve my business
          </button>
          <button
            onClick={() => setTab("health")}
            className={`rounded-lg px-4 py-2 font-medium ${tab === "health" ? "bg-blue-600 text-white" : "border border-slate-300 bg-white hover:bg-slate-100"}`}
          >
            🩺 Business health check
          </button>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="ml-auto rounded-lg border border-slate-300 bg-white px-3 py-2"
          >
            {COUNTRIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-red-700">{error}</p>}

        {tab === "improve" && (
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="mb-3 text-sm text-slate-600">
              Describe your existing business and what&apos;s holding it back — the Brain returns a
              competitiveness report: diagnosis, cost benchmarks against verified local prices,
              your competitive landscape from our company database, differentiation moves, new
              revenue lines and a 90-day action plan. 1 credit per report.
            </p>
            <textarea
              value={business}
              onChange={(e) => setBusiness(e.target.value.slice(0, 4000))}
              rows={6}
              placeholder="e.g. I run a bakery in Surulere, Lagos. 8 staff, sales have dropped 30% in 6 months, flour and diesel costs keep rising and two new bakeries opened nearby…"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
            />
            <button
              onClick={runImprove}
              disabled={improveLoading || business.trim().length < 20}
              className="mt-3 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {improveLoading ? "Analyzing your business…" : "Generate improvement report (1 credit)"}
            </button>
            {improveReport && (
              <div className="mt-5 rounded-lg bg-slate-50 p-5 text-sm">
                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(improveReport) }} />
                {improveCitations.length > 0 && (
                  <p className="mt-4 border-t border-slate-200 pt-2 text-xs text-slate-400">
                    Sources: {improveCitations.join(" · ")}
                  </p>
                )}
                <button
                  onClick={() => downloadMarkdown("business-improvement-report.md", improveReport)}
                  className="mt-3 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium hover:bg-slate-100"
                >
                  ⬇ Download report
                </button>
              </div>
            )}
          </section>
        )}

        {tab === "health" && (
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="mb-3 text-sm text-slate-600">
              Enter your business type and basic numbers — monthly revenue, costs, and the prices
              you pay for key inputs. The Brain benchmarks you against verified local prices and
              industry norms, scores your health, and flags exactly where you&apos;re losing money.
              1 credit per check.
            </p>
            <textarea
              value={healthInput}
              onChange={(e) => setHealthInput(e.target.value.slice(0, 4000))}
              rows={6}
              placeholder="e.g. Pure water factory in Ibadan. Monthly revenue ₦4.2M, total costs ₦3.8M. Diesel ₦1,400/litre, about 900 litres/month. 12 staff averaging ₦55k/month. Sachet sells at ₦250/bag wholesale…"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
            />
            <button
              onClick={runHealth}
              disabled={healthLoading || healthInput.trim().length < 20}
              className="mt-3 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {healthLoading ? "Benchmarking…" : "Run health check (1 credit)"}
            </button>
            {healthReport && (
              <div className="mt-5 rounded-lg bg-slate-50 p-5 text-sm">
                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(healthReport) }} />
                {healthCitations.length > 0 && (
                  <p className="mt-4 border-t border-slate-200 pt-2 text-xs text-slate-400">
                    Sources: {healthCitations.join(" · ")}
                  </p>
                )}
                <button
                  onClick={() => downloadMarkdown("business-health-check.md", healthReport)}
                  className="mt-3 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium hover:bg-slate-100"
                >
                  ⬇ Download report
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
