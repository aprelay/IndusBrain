"use client";

import { useState } from "react";
import { Blueprint } from "@/lib/types";
import { industries } from "@/data/industries";

function toMarkdown(bp: Blueprint): string {
  const lines: string[] = [];
  lines.push(`# ${bp.title} — Ecosystem Blueprint`, "");
  lines.push(`**Client request:** ${bp.request}`);
  lines.push(`**Industry:** ${bp.industry}`);
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
  for (const r of bp.regulators) lines.push(`- **${r.name}** (${r.jurisdiction}): ${r.purpose}`);
  lines.push("", `## Key Risks`);
  for (const r of bp.risks) lines.push(`- ${r}`);
  lines.push("", `## Payment Points (who gets paid, when)`);
  bp.paymentPoints.forEach((p, i) => lines.push(`${i + 1}. ${p}`));
  return lines.join("\n");
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
  const [request, setRequest] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);

  async function generate(text: string) {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request: text }),
      });
      if (!res.ok) throw new Error("Failed to generate blueprint");
      setBlueprint(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function downloadMarkdown() {
    if (!blueprint) return;
    const blob = new Blob([toMarkdown(blueprint)], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${blueprint.industry.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-blueprint.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-8 print:hidden">
          <h1 className="text-3xl font-bold tracking-tight">Industry Ecosystem Brain</h1>
          <p className="mt-2 text-slate-600">
            Type any client request and get a complete blueprint of every company, professional and
            regulator involved — lawyers, banks, insurers, engineers, surveyors, importers, clearing
            agents, logistics and more.
          </p>
        </header>

        <div className="print:hidden">
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
            <button
              type="submit"
              disabled={loading || !request.trim()}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Generating…" : "Generate Blueprint"}
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {industries.map((ind) => (
              <button
                key={ind.id}
                onClick={() => {
                  setRequest(ind.name);
                  generate(ind.name);
                }}
                className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700 hover:bg-slate-100"
              >
                {ind.name}
              </button>
            ))}
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-red-700">{error}</p>
          )}
        </div>

        {blueprint && (
          <section className="mt-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div>
                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium uppercase tracking-wide">
                  {blueprint.source === "ai" ? "AI-generated" : "Curated knowledge base"}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={downloadMarkdown}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100"
                >
                  Download Markdown
                </button>
                <button
                  onClick={() => window.print()}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100"
                >
                  Download PDF / Print
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm print:border-0 print:shadow-none">
              <h2 className="text-2xl font-bold">{blueprint.title} — Ecosystem Blueprint</h2>
              <p className="mt-1 text-sm text-slate-500">
                Request: “{blueprint.request}” · Generated {new Date(blueprint.generatedAt).toLocaleString()}
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
                  <p className="mt-3 text-sm">
                    <span className="font-semibold">Deliverables:</span>{" "}
                    {phase.deliverables.join("; ")}
                  </p>
                </div>
              ))}

              <h3 className="mt-8 text-xl font-semibold">Regulators & Government Bodies</h3>
              <ul className="mt-3 list-disc space-y-1 pl-6 text-slate-700">
                {blueprint.regulators.map((r) => (
                  <li key={r.name}>
                    <span className="font-medium">{r.name}</span> ({r.jurisdiction}): {r.purpose}
                  </li>
                ))}
              </ul>

              <h3 className="mt-8 text-xl font-semibold">Key Risks</h3>
              <ul className="mt-3 list-disc space-y-1 pl-6 text-slate-700">
                {blueprint.risks.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>

              <h3 className="mt-8 text-xl font-semibold">Payment Points (who gets paid, when)</h3>
              <ol className="mt-3 list-decimal space-y-1 pl-6 text-slate-700">
                {blueprint.paymentPoints.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {!blueprint && !loading && (
          <p className="mt-10 text-center text-slate-400 print:hidden">
            Enter a request above or pick an industry to see its full ecosystem blueprint.
          </p>
        )}
      </div>
    </main>
  );
}
