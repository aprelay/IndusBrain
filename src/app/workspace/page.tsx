"use client";

import { useEffect, useState } from "react";
import { Blueprint } from "@/lib/types";

interface SavedMeta {
  id: number;
  title: string;
  createdAt: string;
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

export default function Workspace() {
  const [items, setItems] = useState<SavedMeta[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/my/blueprints")
      .then(async (r) => {
        if (r.status === 401) throw new Error("Sign in to see your saved blueprints.");
        return r.json();
      })
      .then((data: SavedMeta[]) => setItems(data))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  async function download(id: number, title: string) {
    const res = await fetch(`/api/my/blueprints?id=${id}`);
    if (!res.ok) return;
    const bp = (await res.json()) as Blueprint;
    downloadFile(
      JSON.stringify(bp, null, 2),
      `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-blueprint.json`,
      "application/json"
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Blueprints</h1>
          <a href="/" className="text-sm text-blue-600 hover:underline">
            ← Back to generator
          </a>
        </header>
        <p className="mb-6 text-sm text-slate-500">
          Every blueprint you generate while signed in is saved here. Re-download anytime — no
          extra credit needed.
        </p>
        {error && (
          <p className="rounded-lg bg-amber-50 px-4 py-3 text-amber-800">
            {error}{" "}
            <a href="/login" className="text-blue-600 underline">
              Sign in
            </a>
          </p>
        )}
        {items && items.length === 0 && (
          <p className="text-slate-400">No saved blueprints yet — generate one on the homepage.</p>
        )}
        {items && items.length > 0 && (
          <ul className="space-y-3">
            {items.map((it) => (
              <li
                key={it.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                <div>
                  <p className="font-medium">{it.title}</p>
                  <p className="text-xs text-slate-500">Generated {it.createdAt}</p>
                </div>
                <button
                  onClick={() => download(it.id, it.title)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100"
                >
                  Download JSON
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
