"use client";

import { useEffect, useState } from "react";
import { Blueprint } from "@/lib/types";

interface IndustryOption {
  id: string;
  name: string;
  isicCode?: string;
  country?: string;
}

type LockedBlueprint = Blueprint & { locked?: boolean };

interface SessionUser {
  email: string;
  role: string;
  credits: number;
}

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT Abuja", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara",
];

const SCALES = ["Small (pilot)", "Medium (commercial)", "Large (industrial)", "Enterprise / government"];

const COUNTRIES = [
  "Nigeria", "Ghana", "Kenya", "South Africa", "Egypt", "Côte d'Ivoire", "Senegal",
  "Tanzania", "Uganda", "Rwanda", "Ethiopia", "Cameroon", "Benin", "Togo", "Niger Republic",
  "United Kingdom", "United States", "United Arab Emirates", "India", "China", "Other",
];

interface Company {
  id: number;
  name: string;
  category: string;
  services: string;
  location: string;
  contact: string;
  verified: boolean;
}

function toMarkdown(bp: Blueprint): string {
  const lines: string[] = [];
  lines.push(`# ${bp.title} — Ecosystem Blueprint`, "");
  lines.push(`**Client request:** ${bp.request}`);
  lines.push(`**Industry:** ${bp.industry}${bp.isicCode ? ` (ISIC ${bp.isicCode})` : ""}`);
  if (bp.country) lines.push(`**Country:** ${bp.country}`);
  lines.push(`**Generated:** ${new Date(bp.generatedAt).toLocaleString()}`, "");
  lines.push(`## Summary`, bp.summary, "", `## Phases & Stakeholders`);
  for (const phase of bp.phases) {
    lines.push("", `### ${phase.name}`, phase.description, `*Typical duration: ${phase.typicalDuration}*`, "");
    lines.push(`| Who | Category | Responsibility | When engaged | Typical cost |`);
    lines.push(`| --- | --- | --- | --- | --- |`);
    for (const s of phase.stakeholders) {
      lines.push(`| ${s.role} | ${s.category} | ${s.responsibility} | ${s.whenEngaged} | ${s.typicalCost || "—"} |`);
    }
    lines.push("", `**Deliverables:** ${phase.deliverables.join("; ")}`);
  }
  lines.push("", `## Regulators & Government Bodies`);
  for (const r of bp.regulators) {
    let line = `- **${r.name}** (${r.jurisdiction}): ${r.purpose}`;
    if (r.legalBasis) line += ` — Legal basis: ${r.legalBasis}`;
    if (r.officialUrl) line += ` — ${r.officialUrl}`;
    lines.push(line);
  }
  lines.push("", `## Key Risks`);
  for (const r of bp.risks) lines.push(`- ${r}`);
  lines.push("", `## Payment Points (who gets paid, when)`);
  bp.paymentPoints.forEach((p, i) => lines.push(`${i + 1}. ${p}`));
  return lines.join("\n");
}

function budgetToCsv(bp: Blueprint): string {
  const rows = [["Phase", "Item", "Cost note", "Est. min", "Est. max", "Currency"]];
  for (const line of bp.budget || []) {
    rows.push([
      line.phase,
      line.item,
      line.costNote,
      line.estimatedCostMin != null ? String(line.estimatedCostMin) : "",
      line.estimatedCostMax != null ? String(line.estimatedCostMax) : "",
      line.currency || "",
    ]);
  }
  return rows
    .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toWordHtml(bp: Blueprint): string {
  const parts: string[] = [];
  parts.push(`<h1>${escapeHtml(bp.title)} — Ecosystem Blueprint</h1>`);
  parts.push(`<p><b>Client request:</b> ${escapeHtml(bp.request)}<br/><b>Industry:</b> ${escapeHtml(bp.industry)}${bp.isicCode ? ` (ISIC ${bp.isicCode})` : ""}${bp.country ? `<br/><b>Country:</b> ${escapeHtml(bp.country)}` : ""}<br/><b>Generated:</b> ${new Date(bp.generatedAt).toLocaleString()}</p>`);
  parts.push(`<h2>Summary</h2><p>${escapeHtml(bp.summary)}</p>`);
  parts.push(`<h2>Phases &amp; Stakeholders</h2>`);
  for (const phase of bp.phases) {
    parts.push(`<h3>${escapeHtml(phase.name)}</h3><p>${escapeHtml(phase.description)}<br/><i>Typical duration: ${escapeHtml(phase.typicalDuration)}</i></p>`);
    parts.push(`<table border="1" cellpadding="4" cellspacing="0"><tr><th>Who</th><th>Category</th><th>Responsibility</th><th>When engaged</th><th>Typical cost</th></tr>`);
    for (const s of phase.stakeholders) {
      parts.push(`<tr><td>${escapeHtml(s.role)}</td><td>${escapeHtml(s.category)}</td><td>${escapeHtml(s.responsibility)}</td><td>${escapeHtml(s.whenEngaged)}</td><td>${escapeHtml(s.typicalCost || "—")}</td></tr>`);
    }
    parts.push(`</table>`);
    if (phase.deliverables.length > 0) parts.push(`<p><b>Deliverables:</b> ${escapeHtml(phase.deliverables.join("; "))}</p>`);
  }
  parts.push(`<h2>Regulators &amp; Government Bodies</h2><ul>`);
  for (const r of bp.regulators) {
    parts.push(`<li><b>${escapeHtml(r.name)}</b> (${escapeHtml(r.jurisdiction)}): ${escapeHtml(r.purpose)}${r.legalBasis ? ` — Legal basis: ${escapeHtml(r.legalBasis)}` : ""}${r.officialUrl ? ` — ${escapeHtml(r.officialUrl)}` : ""}</li>`);
  }
  parts.push(`</ul><h2>Key Risks</h2><ul>`);
  for (const r of bp.risks) parts.push(`<li>${escapeHtml(r)}</li>`);
  parts.push(`</ul><h2>Payment Points</h2><ol>`);
  for (const p of bp.paymentPoints) parts.push(`<li>${escapeHtml(p)}</li>`);
  parts.push(`</ol>`);
  if ((bp.budget?.length ?? 0) > 0) {
    parts.push(`<h2>Budget Lines</h2><table border="1" cellpadding="4" cellspacing="0"><tr><th>Phase</th><th>Item</th><th>Cost</th></tr>`);
    for (const line of bp.budget!) {
      parts.push(`<tr><td>${escapeHtml(line.phase)}</td><td>${escapeHtml(line.item)}</td><td>${escapeHtml(line.estimatedCostMin != null ? `${line.currency || ""} ${line.estimatedCostMin.toLocaleString()}${line.estimatedCostMax != null ? ` – ${line.estimatedCostMax.toLocaleString()}` : ""}` : line.costNote)}</td></tr>`);
    }
    parts.push(`</table>`);
  }
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${escapeHtml(bp.title)}</title></head><body style="font-family:Calibri,Arial,sans-serif">${parts.join("")}</body></html>`;
}

function toExcelXml(bp: Blueprint): string {
  const cell = (v: string) => `<Cell><Data ss:Type="String">${escapeHtml(v)}</Data></Cell>`;
  const row = (cells: string[]) => `<Row>${cells.map(cell).join("")}</Row>`;
  const stakeholderRows: string[] = [row(["Phase", "Who", "Category", "Responsibility", "When engaged", "Typical cost"])];
  for (const phase of bp.phases) {
    for (const s of phase.stakeholders) {
      stakeholderRows.push(row([phase.name, s.role, s.category, s.responsibility, s.whenEngaged, s.typicalCost || ""]));
    }
  }
  const budgetRows: string[] = [row(["Phase", "Item", "Cost note", "Est. min", "Est. max", "Currency"])];
  for (const line of bp.budget || []) {
    budgetRows.push(row([line.phase, line.item, line.costNote, line.estimatedCostMin != null ? String(line.estimatedCostMin) : "", line.estimatedCostMax != null ? String(line.estimatedCostMax) : "", line.currency || ""]));
  }
  const sheet = (name: string, rows: string[]) => `<Worksheet ss:Name="${name}"><Table>${rows.join("")}</Table></Worksheet>`;
  return `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">${sheet("Stakeholders", stakeholderRows)}${sheet("Budget", budgetRows)}</Workbook>`;
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

const CATEGORY_COLORS: Record<string, string> = {
  Legal: "bg-purple-100 text-purple-800",
  Finance: "bg-green-100 text-green-800",
  Insurance: "bg-amber-100 text-amber-800",
  Engineering: "bg-blue-100 text-blue-800",
  Regulatory: "bg-red-100 text-red-800",
  Procurement: "bg-teal-100 text-teal-800",
  Logistics: "bg-orange-100 text-orange-800",
  Construction: "bg-stone-200 text-stone-800",
  Operations: "bg-cyan-100 text-cyan-800",
  Advisory: "bg-indigo-100 text-indigo-800",
  Government: "bg-rose-100 text-rose-800",
};

export default function Home() {
  const [mode, setMode] = useState<"text" | "wizard">("text");
  const [request, setRequest] = useState("");
  const [sector, setSector] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [location, setLocation] = useState("Lagos");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [scale, setScale] = useState(SCALES[1]);
  const [notes, setNotes] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [industryOptions, setIndustryOptions] = useState<IndustryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blueprint, setBlueprint] = useState<LockedBlueprint | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [quote, setQuote] = useState({ name: "", email: "", company: "", request: "" });
  const [quoteStatus, setQuoteStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/industries")
      .then((r) => r.json())
      .then((data: IndustryOption[]) => {
        setIndustryOptions(data);
        if (data.length > 0) setSector(data[0].name);
      })
      .catch(() => {});
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d: { user: SessionUser | null }) => {
        if (!d.user) {
          window.location.href = "/login";
          return;
        }
        setUser(d.user);
      })
      .catch(() => {});
    fetch("/api/companies")
      .then((r) => r.json())
      .then((data: Company[]) => setCompanies(data))
      .catch(() => {});
  }, []);

  async function submitQuote(e: React.FormEvent) {
    e.preventDefault();
    setQuoteStatus(null);
    const res = await fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote),
    });
    const data = await res.json();
    if (res.ok) {
      setQuoteStatus("Request received — we'll send your quote and invoice by email.");
      setQuote({ name: "", email: "", company: "", request: "" });
    } else {
      setQuoteStatus(data?.error || "Failed to submit");
    }
  }

  async function generate(text: string) {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request: text,
          accessCode: accessCode || undefined,
          country: country !== "Nigeria" ? country : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to generate blueprint");
      setBlueprint(data);
      if (user) {
        fetch("/api/auth/me")
          .then((r) => r.json())
          .then((d: { user: SessionUser | null }) => setUser(d.user))
          .catch(() => {});
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function wizardRequest(): string {
    const place = country === "Nigeria" ? `${location}, Nigeria` : country;
    return `${scale} ${sector} project in ${place}${notes.trim() ? `. ${notes.trim()}` : ""}`;
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-8 print:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-mark.svg" alt="IndusBrain" className="h-10 w-10" />
              <h1 className="text-3xl font-bold tracking-tight">Industry Ecosystem Brain</h1>
              <a href="/ideas" className="text-sm font-semibold text-blue-600 hover:underline">
                💡 Idea Engine
              </a>
              <a href="/outreach" className="text-sm font-semibold text-blue-600 hover:underline">
                📡 Outreach
              </a>
            </div>
            <div className="text-sm">
              {user ? (
                <span className="text-slate-600">
                  {user.email} ·{" "}
                  <span className="font-semibold">
                    {user.credits} credit{user.credits === 1 ? "" : "s"}
                  </span>{" "}
                  ·{" "}
                  <a href="/workspace" className="text-blue-600 hover:underline">
                    My blueprints
                  </a>
                  <button
                    onClick={() =>
                      fetch("/api/auth/logout", { method: "POST" }).then(() => setUser(null))
                    }
                    className="ml-2 text-blue-600 hover:underline"
                  >
                    Sign out
                  </button>
                </span>
              ) : (
                <a href="/login" className="text-blue-600 hover:underline">
                  Sign in / Register
                </a>
              )}
            </div>
          </div>
          <p className="mt-2 text-slate-600">
            Type any client request — or use the guided wizard — and get a complete blueprint of
            every company, professional and regulator involved: lawyers, banks, insurers, engineers,
            surveyors, importers, clearing agents, logistics and more.
          </p>
        </header>

        <div className="print:hidden">
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setMode("text")}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${mode === "text" ? "bg-blue-600 text-white" : "border border-slate-300 bg-white text-slate-700"}`}
            >
              Describe request
            </button>
            <button
              onClick={() => setMode("wizard")}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${mode === "wizard" ? "bg-blue-600 text-white" : "border border-slate-300 bg-white text-slate-700"}`}
            >
              Guided wizard
            </button>
          </div>

          {mode === "text" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                generate(request);
              }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <input
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                placeholder='e.g. "Client wants to build a 500kW solar power system in Lagos"'
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 shadow-sm focus:border-blue-500 focus:outline-none"
              />
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm shadow-sm"
                title="Jurisdiction"
              >
                {COUNTRIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={loading || !request.trim()}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Generating…" : "Generate Blueprint"}
              </button>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                generate(wizardRequest());
              }}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="grid gap-3 sm:grid-cols-4">
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Country</span>
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
                  <span className="mb-1 block font-medium text-slate-700">Industry / sector</span>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  >
                    {industryOptions.map((i) => (
                      <option key={i.id} value={i.name}>
                        {i.name}
                        {i.isicCode ? ` (ISIC ${i.isicCode})` : ""}
                      </option>
                    ))}
                  </select>
                </label>
                {country === "Nigeria" && (
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-slate-700">Location (state)</span>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    >
                      {NIGERIAN_STATES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                )}
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Project scale</span>
                  <select
                    value={scale}
                    onChange={(e) => setScale(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  >
                    {SCALES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="mt-3 block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Extra details (optional)</span>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. grid-tied, imported equipment, government client"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
              <button
                type="submit"
                disabled={loading || !sector}
                className="mt-4 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Generating…" : "Generate Blueprint"}
              </button>
            </form>
          )}

          <div className="mt-3 flex items-center gap-2">
            <input
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Access code (for full blueprints when billing is enabled)"
              className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            />
          </div>

          {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-red-700">{error}</p>}
        </div>

        {blueprint && (
          <section className="mt-8">
            {blueprint.locked && (
              <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-800 print:hidden">
                This is a free preview. Enter a valid access code (1 credit per blueprint) and
                regenerate to unlock all stakeholders, regulators, risks, payment points and the
                budget.
              </div>
            )}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium uppercase tracking-wide">
                  {blueprint.source === "ai" ? "AI-generated" : "Curated knowledge base"}
                </span>
                {blueprint.isicCode && (
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium">
                    ISIC {blueprint.isicCode}
                  </span>
                )}
                {blueprint.country && (
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium">
                    {blueprint.country}
                  </span>
                )}
              </div>
              {!blueprint.locked && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      downloadFile(
                        toMarkdown(blueprint),
                        `${blueprint.industry.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-blueprint.md`,
                        "text/markdown"
                      )
                    }
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100"
                  >
                    Markdown
                  </button>
                  <button
                    onClick={() =>
                      downloadFile(
                        JSON.stringify(blueprint, null, 2),
                        `${blueprint.industry.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-blueprint.json`,
                        "application/json"
                      )
                    }
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100"
                  >
                    JSON
                  </button>
                  <button
                    onClick={() =>
                      downloadFile(
                        budgetToCsv(blueprint),
                        `${blueprint.industry.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-budget.csv`,
                        "text/csv"
                      )
                    }
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100"
                  >
                    Budget CSV
                  </button>
                  <button
                    onClick={() =>
                      downloadFile(
                        toWordHtml(blueprint),
                        `${blueprint.industry.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-blueprint.doc`,
                        "application/msword"
                      )
                    }
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100"
                  >
                    Word
                  </button>
                  <button
                    onClick={() =>
                      downloadFile(
                        toExcelXml(blueprint),
                        `${blueprint.industry.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-blueprint.xls`,
                        "application/vnd.ms-excel"
                      )
                    }
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100"
                  >
                    Excel
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100"
                  >
                    PDF / Print
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm print:border-0 print:shadow-none">
              <h2 className="text-2xl font-bold">{blueprint.title} — Ecosystem Blueprint</h2>
              <p className="mt-1 text-sm text-slate-500">
                Request: “{blueprint.request}” · Generated{" "}
                {new Date(blueprint.generatedAt).toLocaleString()}
              </p>
              <p className="mt-4 text-slate-700">{blueprint.summary}</p>

              <h3 className="mt-8 text-xl font-semibold">Phases & Stakeholders</h3>
              {blueprint.phases.map((phase) => (
                <div key={phase.name} className="mt-6 rounded-lg border border-slate-200 p-4">
                  <h4 className="text-lg font-semibold">{phase.name}</h4>
                  <p className="mt-1 text-slate-600">{phase.description}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Typical duration: {phase.typicalDuration}
                  </p>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-left text-slate-500">
                          <th className="py-2 pr-3">Who</th>
                          <th className="py-2 pr-3">Category</th>
                          <th className="py-2 pr-3">Responsibility</th>
                          <th className="py-2 pr-3">When engaged</th>
                          <th className="py-2">Typical cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {phase.stakeholders.map((s) => (
                          <tr key={s.role} className="border-b border-slate-100 align-top">
                            <td className="py-2 pr-3 font-medium">{s.role}</td>
                            <td className="py-2 pr-3">
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[s.category] || "bg-slate-100 text-slate-700"}`}
                              >
                                {s.category}
                              </span>
                            </td>
                            <td className="py-2 pr-3 text-slate-700">{s.responsibility}</td>
                            <td className="py-2 pr-3 text-slate-700">{s.whenEngaged}</td>
                            <td className="py-2 text-slate-700">{s.typicalCost || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {phase.deliverables.length > 0 && (
                    <p className="mt-3 text-sm">
                      <span className="font-semibold">Deliverables:</span>{" "}
                      {phase.deliverables.join("; ")}
                    </p>
                  )}
                </div>
              ))}

              {blueprint.regulators.length > 0 && (
                <>
                  <h3 className="mt-8 text-xl font-semibold">Regulators & Government Bodies</h3>
                  <ul className="mt-3 list-disc space-y-1 pl-6 text-slate-700">
                    {blueprint.regulators.map((r) => (
                      <li key={r.name}>
                        <span className="font-medium">{r.name}</span> ({r.jurisdiction}):{" "}
                        {r.purpose}
                        {r.legalBasis && (
                          <span className="text-slate-500"> — Legal basis: {r.legalBasis}</span>
                        )}
                        {r.officialUrl && (
                          <>
                            {" "}
                            <a
                              href={r.officialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline"
                            >
                              official site
                            </a>
                          </>
                        )}
                        {r.lastVerified && (
                          <span className="text-xs text-slate-400"> (verified {r.lastVerified})</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {blueprint.risks.length > 0 && (
                <>
                  <h3 className="mt-8 text-xl font-semibold">Key Risks</h3>
                  <ul className="mt-3 list-disc space-y-1 pl-6 text-slate-700">
                    {blueprint.risks.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </>
              )}

              {blueprint.paymentPoints.length > 0 && (
                <>
                  <h3 className="mt-8 text-xl font-semibold">
                    Payment Points (who gets paid, when)
                  </h3>
                  <ol className="mt-3 list-decimal space-y-1 pl-6 text-slate-700">
                    {blueprint.paymentPoints.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ol>
                </>
              )}

              {(blueprint.budget?.length ?? 0) > 0 && (
                <>
                  <h3 className="mt-8 text-xl font-semibold">Budget Lines</h3>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-left text-slate-500">
                          <th className="py-2 pr-3">Phase</th>
                          <th className="py-2 pr-3">Item</th>
                          <th className="py-2">Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {blueprint.budget!.map((line) => (
                          <tr
                            key={`${line.phase}-${line.item}`}
                            className="border-b border-slate-100 align-top"
                          >
                            <td className="py-2 pr-3 text-slate-600">{line.phase}</td>
                            <td className="py-2 pr-3 font-medium">{line.item}</td>
                            <td className="py-2 text-slate-700">
                              {line.estimatedCostMin != null
                                ? `${line.currency || ""} ${line.estimatedCostMin.toLocaleString()}${line.estimatedCostMax != null ? ` – ${line.estimatedCostMax.toLocaleString()}` : ""}`
                                : line.costNote}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {!blueprint.locked && companies.length > 0 && (
              <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm print:hidden">
                <h3 className="text-xl font-semibold">Vetted Company Directory</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Companies in our directory matching the stakeholder categories in this blueprint.
                </p>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-slate-500">
                        <th className="py-2 pr-3">Company</th>
                        <th className="py-2 pr-3">Category</th>
                        <th className="py-2 pr-3">Services</th>
                        <th className="py-2 pr-3">Location</th>
                        <th className="py-2">Contact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companies
                        .filter((c) =>
                          blueprint.phases.some((p) =>
                            p.stakeholders.some((s) => s.category === c.category)
                          )
                        )
                        .map((c) => (
                          <tr key={c.id} className="border-b border-slate-100 align-top">
                            <td className="py-2 pr-3 font-medium">
                              {c.name}
                              {c.verified && (
                                <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                  Vetted
                                </span>
                              )}
                            </td>
                            <td className="py-2 pr-3">{c.category}</td>
                            <td className="py-2 pr-3 text-slate-700">{c.services}</td>
                            <td className="py-2 pr-3 text-slate-700">{c.location}</td>
                            <td className="py-2 text-slate-700">{c.contact}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {!blueprint && !loading && (
          <p className="mt-10 text-center text-slate-400 print:hidden">
            Enter a request above or use the guided wizard to see a full ecosystem blueprint.
          </p>
        )}

        <section className="mt-12 rounded-xl border border-slate-200 bg-white p-6 shadow-sm print:hidden">
          <h2 className="text-xl font-semibold">Request a quote</h2>
          <p className="mt-1 text-sm text-slate-500">
            Tell us about your project — we&apos;ll send a quote and invoice by email. After
            payment (bank transfer), blueprint credits are added to your account.
          </p>
          <form onSubmit={submitQuote} className="mt-4 grid gap-3 sm:grid-cols-3">
            <input
              value={quote.name}
              onChange={(e) => setQuote({ ...quote, name: e.target.value })}
              placeholder="Your name"
              required
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
            <input
              type="email"
              value={quote.email}
              onChange={(e) => setQuote({ ...quote, email: e.target.value })}
              placeholder="Email"
              required
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
            <input
              value={quote.company}
              onChange={(e) => setQuote({ ...quote, company: e.target.value })}
              placeholder="Company (optional)"
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
            <textarea
              value={quote.request}
              onChange={(e) => setQuote({ ...quote, request: e.target.value })}
              placeholder="Describe your project and how many blueprints/locations you need"
              required
              rows={3}
              className="rounded-lg border border-slate-300 px-3 py-2 sm:col-span-3"
            />
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 sm:col-span-3 sm:justify-self-start"
            >
              Request quote
            </button>
          </form>
          {quoteStatus && <p className="mt-3 text-sm text-slate-600">{quoteStatus}</p>}
        </section>

        <footer className="mt-10 text-center text-xs text-slate-400 print:hidden">
          <a href="/privacy" className="hover:underline">
            Privacy policy
          </a>{" "}
          · Data processed in line with NDPA/NDPR and GDPR.
        </footer>
      </div>
    </main>
  );
}
