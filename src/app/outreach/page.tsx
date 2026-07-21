"use client";

import { useCallback, useEffect, useState } from "react";
import { OUTREACH_INDUSTRIES } from "@/lib/outreach";

interface DomainRow {
  id: number;
  domain: string;
  industry: string;
}

interface SearchResult {
  total: number;
  page: number;
  perPage: number;
  pages: number;
  domains: DomainRow[];
}

interface Stat {
  industry: string;
  count: number;
}

export default function OutreachPage() {
  const [industry, setIndustry] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessCode, setAccessCode] = useState("");
  const [exporting, setExporting] = useState(false);
  const [signInRequired, setSignInRequired] = useState(false);

  useEffect(() => {
    fetch("/api/outreach?stats=1")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const search = useCallback(
    async (p: number) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ page: String(p) });
        if (industry) params.set("industry", industry);
        if (query.trim()) params.set("q", query.trim());
        const res = await fetch(`/api/outreach?${params}`);
        const data = await res.json();
        if (!res.ok) {
          if (data?.signInRequired) {
            setSignInRequired(true);
            throw new Error(data.error);
          }
          throw new Error(data?.error || "Search failed");
        }
        setSignInRequired(false);
        setResult(data);
        setPage(p);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [industry, query]
  );

  async function exportList() {
    if (!industry) return;
    setExporting(true);
    setError(null);
    try {
      const res = await fetch("/api/outreach/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry, accessCode: accessCode || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Export failed");
      }
      const text = await res.text();
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `outreach-${industry.replace(/[^a-z0-9]+/gi, "-")}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  const totalDomains = stats.reduce((s, x) => s + x.count, 0);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-mark.svg" alt="IndusBrain" className="h-10 w-10" />
              <h1 className="text-3xl font-bold tracking-tight">Outreach</h1>
            </div>
            <nav className="flex gap-4 text-sm">
              <a href="/ideas" className="text-blue-600 hover:underline">
                💡 Idea Engine
              </a>
              <a href="/" className="text-blue-600 hover:underline">
                ← Blueprint generator
              </a>
            </nav>
          </div>
          <p className="mt-2 text-slate-600">
            Search {totalDomains.toLocaleString()} company domains classified by industry.
            Pick an industry, browse 50 per page, and export the full list for your outreach
            campaigns.
          </p>
        </header>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Industry</span>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="">All industries</option>
                {OUTREACH_INDUSTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">
                Keyword (optional)
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. solar, lagos, build"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            <div className="flex items-end">
              <button
                onClick={() => search(1)}
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Searching…" : "Search domains"}
              </button>
            </div>
          </div>
          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-red-700">
              {error}{" "}
              {signInRequired && (
                <a href="/login" className="font-semibold underline">
                  Sign in or create a free account →
                </a>
              )}
            </p>
          )}
        </div>

        {stats.length > 0 && !result && (
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-semibold">Domains by industry</h2>
            <div className="grid gap-2 sm:grid-cols-3">
              {stats.map((s) => (
                <button
                  key={s.industry}
                  onClick={() => {
                    setIndustry(s.industry);
                  }}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm hover:border-blue-400"
                >
                  <span className="capitalize">{s.industry}</span>
                  <span className="font-semibold text-blue-600">
                    {s.count.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {result && (
          <section className="mt-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {result.total.toLocaleString()} domain{result.total === 1 ? "" : "s"} found
              </h2>
              {industry && result.total > 0 && (
                <div className="flex items-center gap-2">
                  <input
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="Access code (optional)"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                  <button
                    onClick={exportList}
                    disabled={exporting}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100 disabled:opacity-50"
                  >
                    {exporting ? "Exporting…" : "Export list (1 credit)"}
                  </button>
                </div>
              )}
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-left">
                  <tr>
                    <th className="px-4 py-2">Domain</th>
                    <th className="px-4 py-2">Industry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.domains.map((d) => (
                    <tr key={d.id}>
                      <td className="px-4 py-2 font-medium">
                        <a
                          href={`/api/outreach/visit?domain=${encodeURIComponent(d.domain)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                          title={`Open ${d.domain} in a new tab`}
                        >
                          {d.domain} ↗
                        </a>
                      </td>
                      <td className="px-4 py-2 capitalize text-slate-600">{d.industry}</td>
                    </tr>
                  ))}
                  {result.domains.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-4 py-6 text-center text-slate-500">
                        No domains match — ask the admin to upload domain lists.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {result.pages > 1 && (
              <div className="mt-4 flex items-center justify-between text-sm">
                <button
                  onClick={() => search(page - 1)}
                  disabled={page <= 1 || loading}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium hover:bg-slate-100 disabled:opacity-40"
                >
                  ← Previous
                </button>
                <span className="text-slate-600">
                  Page {result.page} of {result.pages}
                </span>
                <button
                  onClick={() => search(page + 1)}
                  disabled={page >= result.pages || loading}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium hover:bg-slate-100 disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
