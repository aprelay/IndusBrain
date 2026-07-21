"use client";

import { useState } from "react";
import { AuditEntry, IndustryTemplate } from "@/lib/types";

interface CreditRow {
  code: string;
  credits: number;
  note: string;
}

export default function AdminPage() {
  const [code, setCode] = useState("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"industries" | "audit" | "credits">("industries");

  const [industriesJson, setIndustriesJson] = useState<IndustryTemplate[]>([]);
  const [editorText, setEditorText] = useState("");
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [credits, setCredits] = useState<CreditRow[]>([]);
  const [newCreditCode, setNewCreditCode] = useState("");
  const [newCreditAmount, setNewCreditAmount] = useState("10");
  const [newCreditNote, setNewCreditNote] = useState("");
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
    const [a, c] = await Promise.all([
      fetch("/api/admin/audit", { headers }).then((r) => r.json()),
      fetch("/api/admin/credits", { headers }).then((r) => r.json()),
    ]);
    setAudit(a);
    setCredits(c);
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
          {(["industries", "audit", "credits"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${tab === t ? "bg-blue-600 text-white" : "border border-slate-300 bg-white"}`}
            >
              {t}
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
