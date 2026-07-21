"use client";

import { useState } from "react";
import { AuditEntry, IndustryTemplate } from "@/lib/types";
import { OUTREACH_INDUSTRIES } from "@/lib/outreach";

interface CreditRow {
  code: string;
  credits: number;
  note: string;
}

interface QuoteRow {
  id: number;
  name: string;
  email: string;
  company: string;
  request: string;
  status: string;
  createdAt: string;
}

interface UserRow {
  id: number;
  email: string;
  role: string;
  credits: number;
}

const QUOTE_STATUSES = ["new", "quoted", "invoiced", "paid", "closed"];

const COMPANY_CATEGORIES = [
  "Legal", "Finance", "Insurance", "Engineering", "Regulatory", "Procurement",
  "Logistics", "Construction", "Operations", "Advisory", "Government",
];

interface CompanyRow {
  id: number;
  name: string;
  category: string;
  services: string;
  location: string;
  contact: string;
  verified: boolean;
}

interface ApiKeyRow {
  key: string;
  name: string;
  credits: number;
  createdAt: string;
}

interface RegulatorAlert {
  industry: string;
  regulator: string;
  lastVerified?: string;
}

const STALE_MONTHS = 6;

function isStale(lastVerified?: string): boolean {
  if (!lastVerified) return true;
  const parsed = new Date(`${lastVerified}-01`);
  if (Number.isNaN(parsed.getTime())) return true;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - STALE_MONTHS);
  return parsed < cutoff;
}

export default function AdminPage() {
  const [code, setCode] = useState("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<
    "industries" | "quotes" | "users" | "companies" | "outreach" | "apikeys" | "alerts" | "audit" | "credits"
  >("industries");

  const [industriesJson, setIndustriesJson] = useState<IndustryTemplate[]>([]);
  const [editorText, setEditorText] = useState("");
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [credits, setCredits] = useState<CreditRow[]>([]);
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [userCreditEmail, setUserCreditEmail] = useState("");
  const [userCreditAmount, setUserCreditAmount] = useState("10");
  const [newCreditCode, setNewCreditCode] = useState("");
  const [newCreditAmount, setNewCreditAmount] = useState("10");
  const [newCreditNote, setNewCreditNote] = useState("");
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [companyForm, setCompanyForm] = useState({
    name: "",
    category: COMPANY_CATEGORIES[0],
    services: "",
    location: "",
    contact: "",
    verified: false,
  });
  const [apiKeys, setApiKeys] = useState<ApiKeyRow[]>([]);
  const [outreachStats, setOutreachStats] = useState<{ industry: string; count: number }[]>([]);
  const [outreachIndustry, setOutreachIndustry] = useState("");
  const [outreachText, setOutreachText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [apiKeyName, setApiKeyName] = useState("");
  const [apiKeyCredits, setApiKeyCredits] = useState("100");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const headers = { "Content-Type": "application/json", "x-admin-code": code };

  async function loadAll() {
    setError(null);
    const res = await fetch("/api/admin/industries", { headers });
    if (!res.ok) {
      setError("Invalid admin code (set ADMIN_ACCESS_CODE on the server)");
      return;
    }
    setIndustriesJson(await res.json());
    const [a, c, q, u, co, k, os] = await Promise.all([
      fetch("/api/admin/audit", { headers }).then((r) => r.json()),
      fetch("/api/admin/credits", { headers }).then((r) => r.json()),
      fetch("/api/admin/quotes", { headers }).then((r) => r.json()),
      fetch("/api/admin/users", { headers }).then((r) => r.json()),
      fetch("/api/admin/companies", { headers }).then((r) => r.json()),
      fetch("/api/admin/apikeys", { headers }).then((r) => r.json()),
      fetch("/api/admin/outreach", { headers }).then((r) => r.json()),
    ]);
    setAudit(a);
    setCredits(c);
    setQuotes(q);
    setUsers(u);
    setCompanies(co);
    setApiKeys(k);
    setOutreachStats(os);
    setAuthed(true);
  }

  async function saveIndustry() {
    setStatus(null);
    let parsed: IndustryTemplate;
    try {
      parsed = JSON.parse(editorText);
    } catch {
      setStatus("Invalid JSON");
      return;
    }
    const res = await fetch("/api/admin/industries", {
      method: "POST",
      headers,
      body: JSON.stringify(parsed),
    });
    const data = await res.json();
    setStatus(res.ok ? `Saved ${data.id}` : data.error || "Save failed");
    if (res.ok) loadAll();
  }

  async function removeIndustry(id: string) {
    if (!confirm(`Delete industry "${id}"?`)) return;
    await fetch(`/api/admin/industries?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers,
    });
    loadAll();
  }

  async function setQuoteStatus(id: number, statusValue: string) {
    await fetch("/api/admin/quotes", {
      method: "PATCH",
      headers,
      body: JSON.stringify({ id, status: statusValue }),
    });
    loadAll();
  }

  async function addUserCredits() {
    setStatus(null);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers,
      body: JSON.stringify({ email: userCreditEmail, credits: Number(userCreditAmount) }),
    });
    const data = await res.json();
    setStatus(res.ok ? "Credits added to account" : data.error || "Failed");
    if (res.ok) loadAll();
  }

  async function addCredits() {
    setStatus(null);
    const res = await fetch("/api/admin/credits", {
      method: "POST",
      headers,
      body: JSON.stringify({
        code: newCreditCode,
        credits: Number(newCreditAmount),
        note: newCreditNote,
      }),
    });
    const data = await res.json();
    setStatus(res.ok ? "Credits issued" : data.error || "Failed");
    if (res.ok) loadAll();
  }

  async function saveCompany() {
    setStatus(null);
    const res = await fetch("/api/admin/companies", {
      method: "POST",
      headers,
      body: JSON.stringify(companyForm),
    });
    const data = await res.json();
    setStatus(res.ok ? "Company saved" : data.error || "Failed");
    if (res.ok) {
      setCompanyForm({
        name: "",
        category: COMPANY_CATEGORIES[0],
        services: "",
        location: "",
        contact: "",
        verified: false,
      });
      loadAll();
    }
  }

  async function removeCompany(id: number) {
    if (!confirm("Delete this company?")) return;
    await fetch(`/api/admin/companies?id=${id}`, { method: "DELETE", headers });
    loadAll();
  }

  async function createKey() {
    setStatus(null);
    setNewKey(null);
    const res = await fetch("/api/admin/apikeys", {
      method: "POST",
      headers,
      body: JSON.stringify({ name: apiKeyName, credits: Number(apiKeyCredits) }),
    });
    const data = await res.json();
    if (res.ok) {
      setNewKey(data.key);
      setApiKeyName("");
      loadAll();
    } else {
      setStatus(data.error || "Failed");
    }
  }

  async function uploadDomains(text: string) {
    if (!text.trim()) {
      setStatus("Nothing to upload");
      return;
    }
    setUploading(true);
    setStatus(null);
    try {
      const params = outreachIndustry
        ? `?industry=${encodeURIComponent(outreachIndustry)}`
        : "";
      const res = await fetch(`/api/admin/outreach${params}`, {
        method: "POST",
        headers: { "Content-Type": "text/plain", "x-admin-code": code },
        body: text,
      });
      const data = await res.json();
      setStatus(
        res.ok
          ? `Parsed ${data.parsed} domains — added ${data.added}, skipped ${data.duplicatesSkipped} duplicates`
          : data.error || "Upload failed"
      );
      if (res.ok) {
        setOutreachText("");
        loadAll();
      }
    } finally {
      setUploading(false);
    }
  }

  async function uploadDomainFile(file: File) {
    const text = await file.text();
    await uploadDomains(text);
  }

  async function reclassifyUnclassified() {
    setUploading(true);
    setStatus("Reclassifying… keyword pass + AI pass (up to 400 domains per run)");
    try {
      const res = await fetch("/api/admin/outreach/reclassify", {
        method: "POST",
        headers,
      });
      const data = await res.json();
      setStatus(
        res.ok
          ? `Processed ${data.processed} — reclassified ${data.reclassified} (${data.byKeywords} by keywords, ${data.byAI} by AI). ${data.remaining === 0 ? "All done." : "More remaining — click again to continue."}`
          : data.error || "Reclassify failed"
      );
      if (res.ok) loadAll();
    } finally {
      setUploading(false);
    }
  }

  async function removeOutreachIndustry(industry: string) {
    if (!confirm(`Delete all '${industry}' domains?`)) return;
    await fetch(`/api/admin/outreach?industry=${encodeURIComponent(industry)}`, {
      method: "DELETE",
      headers,
    });
    loadAll();
  }

  async function removeKey(key: string) {
    if (!confirm("Revoke this API key?")) return;
    await fetch(`/api/admin/apikeys?key=${encodeURIComponent(key)}`, {
      method: "DELETE",
      headers,
    });
    loadAll();
  }

  const alerts: RegulatorAlert[] = industriesJson.flatMap((i) =>
    i.regulators
      .filter((r) => isStale(r.lastVerified))
      .map((r) => ({ industry: i.name, regulator: r.name, lastVerified: r.lastVerified }))
  );

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadAll();
          }}
          className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h1 className="text-xl font-bold">IndusBrain Admin</h1>
          <p className="mt-1 text-sm text-slate-500">Enter the admin access code.</p>
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Admin access code"
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Sign in
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-bold">IndusBrain Admin</h1>
        <div className="mt-4 flex gap-2">
          {(["industries", "quotes", "users", "companies", "outreach", "apikeys", "alerts", "audit", "credits"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${tab === t ? "bg-blue-600 text-white" : "border border-slate-300 bg-white"}`}
            >
              {t === "apikeys" ? "API keys" : t}
              {t === "alerts" && alerts.length > 0 && (
                <span className="ml-1 rounded-full bg-red-600 px-1.5 text-xs text-white">
                  {alerts.length}
                </span>
              )}
            </button>
          ))}
        </div>
        {status && <p className="mt-3 text-sm text-slate-600">{status}</p>}

        {tab === "industries" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="font-semibold">Curated industries ({industriesJson.length})</h2>
              <ul className="mt-3 space-y-2">
                {industriesJson.map((i) => (
                  <li
                    key={i.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2"
                  >
                    <div>
                      <span className="font-medium">{i.name}</span>{" "}
                      <span className="text-xs text-slate-500">
                        {i.id}
                        {i.isicCode ? ` · ISIC ${i.isicCode}` : ""} · {i.phases.length} phases
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditorText(JSON.stringify(i, null, 2))}
                        className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeIndustry(i.id)}
                        className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-semibold">Add / edit industry (JSON)</h2>
              <textarea
                value={editorText}
                onChange={(e) => setEditorText(e.target.value)}
                rows={20}
                className="mt-3 w-full rounded-lg border border-slate-300 bg-white p-3 font-mono text-xs"
                placeholder='{"id": "my-industry", "name": "...", "keywords": [...], "summary": "...", "phases": [...], "regulators": [...], "risks": [...], "paymentPoints": [...]}'
              />
              <button
                onClick={saveIndustry}
                className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Save industry
              </button>
            </div>
          </div>
        )}

        {tab === "outreach" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="font-semibold">Upload domain lists (CSV or TXT)</h2>
              <p className="mt-1 text-sm text-slate-500">
                One domain per line (CSV: first column is used). Domains are auto-classified by
                industry from their name, or pick an industry to label the whole upload.
              </p>
              <label className="mt-3 block text-sm">
                <span className="mb-1 block font-medium text-slate-700">Industry label</span>
                <select
                  value={outreachIndustry}
                  onChange={(e) => setOutreachIndustry(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="">Auto-classify from domain name</option>
                  {OUTREACH_INDUSTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mt-3 block text-sm">
                <span className="mb-1 block font-medium text-slate-700">
                  Upload .csv / .txt file
                </span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  disabled={uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadDomainFile(f);
                    e.target.value = "";
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                />
              </label>
              <div className="mt-3">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Or paste domains
                </span>
                <textarea
                  value={outreachText}
                  onChange={(e) => setOutreachText(e.target.value)}
                  rows={8}
                  placeholder={"buildright.ng\nsolarmax.com\nlagoslegal.com"}
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 font-mono text-xs"
                />
                <button
                  onClick={() => uploadDomains(outreachText)}
                  disabled={uploading || !outreachText.trim()}
                  className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? "Uploading…" : "Upload pasted domains"}
                </button>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">
                  Database ({outreachStats.reduce((s, x) => s + x.count, 0).toLocaleString()}{" "}
                  domains)
                </h2>
                {(outreachStats.find((s) => s.industry === "unclassified")?.count || 0) > 0 && (
                  <button
                    onClick={reclassifyUnclassified}
                    disabled={uploading}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {uploading ? "Working…" : "🧠 Reclassify unclassified (AI)"}
                  </button>
                )}
              </div>
              <ul className="mt-3 space-y-2">
                {outreachStats.map((s) => (
                  <li
                    key={s.industry}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm"
                  >
                    <span className="capitalize">{s.industry}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{s.count.toLocaleString()}</span>
                      <button
                        onClick={() => removeOutreachIndustry(s.industry)}
                        className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
                {outreachStats.length === 0 && (
                  <li className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
                    No domains yet — upload a list to get started.
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}

        {tab === "quotes" && (
          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-4 py-2">Time (UTC)</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Company</th>
                  <th className="px-4 py-2">Request</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <tr key={q.id} className="border-b border-slate-100 align-top">
                    <td className="whitespace-nowrap px-4 py-2 text-slate-500">{q.createdAt}</td>
                    <td className="px-4 py-2">{q.name}</td>
                    <td className="px-4 py-2">{q.email}</td>
                    <td className="px-4 py-2">{q.company || "—"}</td>
                    <td className="px-4 py-2">{q.request}</td>
                    <td className="px-4 py-2">
                      <select
                        value={q.status}
                        onChange={(e) => setQuoteStatus(q.id, e.target.value)}
                        className="rounded border border-slate-300 px-2 py-1 text-xs"
                      >
                        {QUOTE_STATUSES.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {quotes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-4 text-slate-500">
                      No quote requests yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === "users" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="font-semibold">Registered accounts</h2>
              <ul className="mt-3 space-y-2">
                {users.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2"
                  >
                    <span>
                      {u.email}{" "}
                      <span className="text-xs text-slate-500">({u.role})</span>
                    </span>
                    <span className="text-sm text-slate-600">{u.credits} credits</span>
                  </li>
                ))}
                {users.length === 0 && (
                  <li className="text-sm text-slate-500">No accounts yet.</li>
                )}
              </ul>
            </div>
            <div>
              <h2 className="font-semibold">Add credits to an account</h2>
              <p className="mt-1 text-xs text-slate-500">
                After a client pays your invoice (bank transfer), add their credits here.
              </p>
              <input
                value={userCreditEmail}
                onChange={(e) => setUserCreditEmail(e.target.value)}
                placeholder="Client account email"
                className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
              <input
                value={userCreditAmount}
                onChange={(e) => setUserCreditAmount(e.target.value)}
                type="number"
                min={1}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
              <button
                onClick={addUserCredits}
                className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Add credits
              </button>
            </div>
          </div>
        )}

        {tab === "companies" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="font-semibold">Company directory ({companies.length})</h2>
              <p className="mt-1 text-xs text-slate-500">
                Companies shown to clients alongside blueprints, matched by stakeholder category.
              </p>
              <ul className="mt-3 space-y-2">
                {companies.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2"
                  >
                    <div>
                      <span className="font-medium">{c.name}</span>{" "}
                      {c.verified && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          Vetted
                        </span>
                      )}
                      <div className="text-xs text-slate-500">
                        {c.category} · {c.location || "—"} · {c.contact || "—"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setCompanyForm({
                            name: c.name,
                            category: c.category,
                            services: c.services,
                            location: c.location,
                            contact: c.contact,
                            verified: c.verified,
                          })
                        }
                        className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100"
                      >
                        Copy to form
                      </button>
                      <button
                        onClick={() => removeCompany(c.id)}
                        className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
                {companies.length === 0 && (
                  <li className="text-sm text-slate-500">No companies yet.</li>
                )}
              </ul>
            </div>
            <div>
              <h2 className="font-semibold">Add company</h2>
              <input
                value={companyForm.name}
                onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                placeholder="Company name"
                className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
              <select
                value={companyForm.category}
                onChange={(e) => setCompanyForm({ ...companyForm, category: e.target.value })}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                {COMPANY_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <input
                value={companyForm.services}
                onChange={(e) => setCompanyForm({ ...companyForm, services: e.target.value })}
                placeholder="Services offered"
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
              <input
                value={companyForm.location}
                onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
                placeholder="Location (e.g. Lagos)"
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
              <input
                value={companyForm.contact}
                onChange={(e) => setCompanyForm({ ...companyForm, contact: e.target.value })}
                placeholder="Contact (email/phone/website)"
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
              <label className="mt-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={companyForm.verified}
                  onChange={(e) => setCompanyForm({ ...companyForm, verified: e.target.checked })}
                />
                Vetted / verified company
              </label>
              <button
                onClick={saveCompany}
                className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Save company
              </button>
            </div>
          </div>
        )}

        {tab === "apikeys" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="font-semibold">Partner API keys</h2>
              <p className="mt-1 text-xs text-slate-500">
                Keys for POST /api/v1/blueprint (header x-api-key). Each call consumes 1 credit.
              </p>
              <ul className="mt-3 space-y-2">
                {apiKeys.map((k) => (
                  <li
                    key={k.key}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2"
                  >
                    <div>
                      <span className="font-medium">{k.name}</span>
                      <div className="font-mono text-xs text-slate-500">
                        {k.key.slice(0, 10)}… · {k.credits} credits
                      </div>
                    </div>
                    <button
                      onClick={() => removeKey(k.key)}
                      className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                    >
                      Revoke
                    </button>
                  </li>
                ))}
                {apiKeys.length === 0 && (
                  <li className="text-sm text-slate-500">No API keys issued yet.</li>
                )}
              </ul>
            </div>
            <div>
              <h2 className="font-semibold">Issue API key</h2>
              <input
                value={apiKeyName}
                onChange={(e) => setApiKeyName(e.target.value)}
                placeholder="Partner name"
                className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
              <input
                value={apiKeyCredits}
                onChange={(e) => setApiKeyCredits(e.target.value)}
                type="number"
                min={1}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
              <button
                onClick={createKey}
                className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Create key
              </button>
              {newKey && (
                <p className="mt-3 break-all rounded-lg bg-amber-50 px-3 py-2 font-mono text-xs text-amber-800">
                  New key (copy now, shown once in full): {newKey}
                </p>
              )}
            </div>
          </div>
        )}

        {tab === "alerts" && (
          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <div className="px-4 pt-4">
              <h2 className="font-semibold">Verification alerts</h2>
              <p className="mt-1 text-xs text-slate-500">
                Regulator entries with no verification date or last verified more than {STALE_MONTHS}{" "}
                months ago. Re-check the official source and update lastVerified in the industry
                JSON.
              </p>
            </div>
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-4 py-2">Industry</th>
                  <th className="px-4 py-2">Regulator</th>
                  <th className="px-4 py-2">Last verified</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((a) => (
                  <tr key={`${a.industry}-${a.regulator}`} className="border-b border-slate-100">
                    <td className="px-4 py-2">{a.industry}</td>
                    <td className="px-4 py-2">{a.regulator}</td>
                    <td className="px-4 py-2 text-slate-500">{a.lastVerified || "never"}</td>
                  </tr>
                ))}
                {alerts.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-4 text-slate-500">
                      All regulator entries are verified within the last {STALE_MONTHS} months.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === "audit" && (
          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-4 py-2">Time (UTC)</th>
                  <th className="px-4 py-2">Request</th>
                  <th className="px-4 py-2">Industry</th>
                  <th className="px-4 py-2">Source</th>
                  <th className="px-4 py-2">IP</th>
                </tr>
              </thead>
              <tbody>
                {audit.map((e) => (
                  <tr key={e.id} className="border-b border-slate-100">
                    <td className="px-4 py-2 whitespace-nowrap text-slate-500">{e.createdAt}</td>
                    <td className="px-4 py-2">{e.request}</td>
                    <td className="px-4 py-2">{e.industry}</td>
                    <td className="px-4 py-2">{e.source}</td>
                    <td className="px-4 py-2 text-slate-500">{e.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "credits" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="font-semibold">Client access codes</h2>
              <ul className="mt-3 space-y-2">
                {credits.map((c) => (
                  <li
                    key={c.code}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2"
                  >
                    <span className="font-mono">{c.code}</span>
                    <span className="text-sm text-slate-600">
                      {c.credits} credits {c.note && `· ${c.note}`}
                    </span>
                  </li>
                ))}
                {credits.length === 0 && (
                  <li className="text-sm text-slate-500">No codes issued yet.</li>
                )}
              </ul>
            </div>
            <div>
              <h2 className="font-semibold">Issue credits</h2>
              <p className="mt-1 text-xs text-slate-500">
                1 credit = 1 full blueprint (per request/location). Sell codes to clients, then
                issue credits here. Requires BILLING_ENABLED=true to enforce.
              </p>
              <input
                value={newCreditCode}
                onChange={(e) => setNewCreditCode(e.target.value)}
                placeholder="Client code (e.g. ACME-2026)"
                className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
              <input
                value={newCreditAmount}
                onChange={(e) => setNewCreditAmount(e.target.value)}
                type="number"
                min={1}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
              <input
                value={newCreditNote}
                onChange={(e) => setNewCreditNote(e.target.value)}
                placeholder="Note (client name, invoice ref)"
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
              <button
                onClick={addCredits}
                className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Issue credits
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
